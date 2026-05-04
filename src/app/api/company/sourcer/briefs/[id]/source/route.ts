import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, PutCommand, ScanCommand } from '@/lib/aws/dynamodb'
import {
  getCompanyIdFromRequest,
  openaiJson,
  summarizeCandidate,
  summarizeBriefForAI,
  calibrationDigest,
  type SourcerBrief,
  type ShortlistEntry,
  type CandidateSummary,
} from '@/lib/server/sourcer'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_CANDIDATES_TO_SCORE = 40

interface AIScore {
  candidateId: string
  score: number
  reason: string
}

interface AIResponse {
  results?: AIScore[]
}

function deterministicScore(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  return 55 + (Math.abs(hash) % 35)
}

function fallbackScore(brief: SourcerBrief, candidates: CandidateSummary[]): AIScore[] {
  const must = new Set(brief.mustHaves.map((s) => s.toLowerCase()))
  const nice = new Set(brief.niceToHaves.map((s) => s.toLowerCase()))
  return candidates
    .map((c) => {
      const skills = c.skills.map((s) => s.name.toLowerCase())
      const mustHits = skills.filter((s) => must.has(s)).length
      const niceHits = skills.filter((s) => nice.has(s)).length
      const base = deterministicScore(c.id + brief.id)
      const score = Math.min(100, base + mustHits * 6 + niceHits * 2)
      const reasonParts: string[] = []
      if (mustHits > 0) reasonParts.push(`${mustHits} must-have${mustHits > 1 ? 's' : ''} matched`)
      if (niceHits > 0) reasonParts.push(`${niceHits} nice-to-have${niceHits > 1 ? 's' : ''}`)
      return {
        candidateId: c.id,
        score,
        reason: reasonParts.join(', ') || 'Heuristic match on profile signals.',
      }
    })
    .sort((a, b) => b.score - a.score)
}

async function callAI(brief: SourcerBrief, candidates: CandidateSummary[]): Promise<AIScore[] | null> {
  const { ups, downs } = calibrationDigest(brief)
  const calibrationBlock =
    ups.length === 0 && downs.length === 0
      ? ''
      : `

CALIBRATION HISTORY (the hiring manager has rated past candidates — match this taste):
- Liked profiles: ${ups.slice(0, 8).join(' | ') || '(none yet)'}
- Rejected profiles: ${downs.slice(0, 8).join(' | ') || '(none yet)'}
Use these signals to weight skills, seniority, and headline patterns this manager prefers.`

  const system = `You are an autonomous AI talent sourcer. You score how well each candidate fits a hiring brief on 0-100. Penalize missing must-haves heavily. Reward verified skills, recent relevant experience, seniority alignment, and any signal patterns the hiring manager has previously rewarded.${calibrationBlock}

Be grounded in the data — do not invent facts. Be concise.

Return STRICT JSON: { "results": [ { "candidateId": string, "score": integer 0-100, "reason": string up to 140 chars } ] }. One entry per input candidate. No prose outside JSON.`

  const user = JSON.stringify({
    brief: summarizeBriefForAI(brief),
    candidates,
  })

  const parsed = await openaiJson<AIResponse>({ system, user, temperature: 0.2 })
  if (!parsed?.results) return null

  return parsed.results
    .filter((r): r is AIScore => typeof r.candidateId === 'string' && typeof r.score === 'number')
    .map((r) => ({
      candidateId: r.candidateId,
      score: Math.max(0, Math.min(100, Math.round(r.score))),
      reason: (r.reason ?? '').slice(0, 220),
    }))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  // 1. Load + verify ownership of brief
  const briefRes = await db.send(new GetCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  const brief = briefRes.Item as SourcerBrief | undefined
  if (!brief || brief.companyId !== companyId) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  // 2. Pull candidate pool — both verified talent and discovered (sourced) profiles
  const [candRes, discRes] = await Promise.all([
    db.send(new ScanCommand({ TableName: Tables.Candidates })),
    db.send(new ScanCommand({ TableName: Tables.DiscoveredCandidates })).catch(() => ({ Items: [] })),
  ])
  const allCandidates = [
    ...(candRes.Items as Record<string, unknown>[] ?? []),
    ...(discRes.Items as Record<string, unknown>[] ?? []),
  ]

  const usable = allCandidates
    .filter((c) => typeof c.name === 'string' && (c.name as string).trim().length > 0)
    .slice(0, MAX_CANDIDATES_TO_SCORE)
    .map(summarizeCandidate)

  if (usable.length === 0) {
    return NextResponse.json({
      results: [],
      source: 'fallback',
      scanned: allCandidates.length,
      scored: 0,
      message: 'No candidates available to score yet. Onboard talent or run discovery first.',
    })
  }

  // 3. Score with OpenAI (calibration-aware), or fall back to skill overlap
  let scores = await callAI(brief, usable)
  let aiSource: 'openai' | 'fallback' = scores ? 'openai' : 'fallback'
  if (!scores || scores.length === 0) {
    scores = fallbackScore(brief, usable)
    aiSource = 'fallback'
  }

  // 4. Merge with existing shortlist — preserve calibration + outreach for known candidates,
  //    refresh scores/reasons, add new entries.
  const now = new Date().toISOString()
  const knownIds = new Set(usable.map((c) => c.id))
  const previous = new Map<string, ShortlistEntry>()
  for (const e of brief.shortlist) previous.set(e.candidateId, e)

  const next: ShortlistEntry[] = scores
    .filter((s) => knownIds.has(s.candidateId))
    .sort((a, b) => b.score - a.score)
    .map((s) => {
      const prev = previous.get(s.candidateId)
      return {
        candidateId: s.candidateId,
        score: s.score,
        reason: s.reason,
        sourcedAt: now,
        calibration: prev?.calibration,
        outreach: prev?.outreach,
      }
    })

  const updated: SourcerBrief = {
    ...brief,
    shortlist: next,
    lastSourcedAt: now,
    updatedAt: now,
  }

  await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: updated }))

  return NextResponse.json({
    brief: updated,
    source: aiSource,
    scanned: allCandidates.length,
    scored: next.length,
  })
}
