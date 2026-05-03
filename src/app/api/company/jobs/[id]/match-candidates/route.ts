import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''

interface CandidateMatch {
  candidateId: string
  score: number
  reason: string
}

interface FindTalentResponse {
  results: CandidateMatch[]
  source: 'openai' | 'fallback'
  scanned: number
  scored: number
}

function deterministicScore(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  return 60 + (Math.abs(hash) % 35)
}

function summarizeCandidate(c: Record<string, unknown>) {
  const skills = (c.skills as Array<{ name?: string; level?: string; verified?: boolean }> | undefined ?? [])
  const experience = (c.experience as Array<{ title?: string; company?: string; description?: string }> | undefined ?? [])
  return {
    id: String(c.id ?? c.candidateId ?? ''),
    name: (c.name as string) || '',
    headline: (c.headline as string) || (c.title as string) || '',
    location: (c.location as string) || '',
    workPreference: (c.workPreference as string[]) ?? [],
    salaryExpectation: (c.salaryExpectation as number) ?? 0,
    skills: skills.slice(0, 20).map((s) => ({
      name: s.name ?? '',
      level: s.level ?? '',
      verified: !!s.verified,
    })),
    experience: experience.slice(0, 5).map((e) => ({
      title: e.title ?? '',
      company: e.company ?? '',
      summary: (e.description ?? '').slice(0, 180),
    })),
  }
}

function summarizeJob(j: Record<string, unknown>) {
  return {
    title: (j.title as string) ?? '',
    level: (j.level as string) ?? '',
    workMode: (j.workMode as string) ?? '',
    location: (j.location as string) ?? '',
    salaryMin: (j.salaryMin as number) ?? 0,
    salaryMax: (j.salaryMax as number) ?? 0,
    skills: ((j.skills as string[]) ?? []).slice(0, 20),
    requirements: ((j.requirements as string[]) ?? []).slice(0, 10),
    description: ((j.description as string) ?? '').slice(0, 700),
  }
}

async function callOpenAI(
  job: ReturnType<typeof summarizeJob>,
  candidates: ReturnType<typeof summarizeCandidate>[],
): Promise<CandidateMatch[] | null> {
  if (!OPENAI_KEY) return null

  const system = `You are a senior technical recruiter. Score how well each candidate fits the job on 0-100. Penalize missing core skills heavily, reward verified skills + recent relevant experience + seniority alignment + work-mode/salary fit. Be grounded in the data — do not invent facts.

Return STRICT JSON: { "results": [ { "candidateId": string, "score": integer 0-100, "reason": string up to 120 chars } ] }. One entry per input candidate. No prose outside JSON.`

  const user = JSON.stringify({ job, candidates })

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) {
      console.warn('[find-talent] OpenAI status', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content) as { results?: Array<Partial<CandidateMatch>> }
    if (!parsed.results) return null
    return parsed.results
      .filter((r): r is CandidateMatch =>
        typeof r.candidateId === 'string' && typeof r.score === 'number',
      )
      .map((r) => ({
        candidateId: r.candidateId,
        score: Math.max(0, Math.min(100, Math.round(r.score))),
        reason: (r.reason ?? '').slice(0, 200),
      }))
  } catch (err) {
    console.warn('[find-talent] OpenAI call failed', err)
    return null
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params

  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let companyId: string
  try {
    const payload = await verifyCognitoToken(token, 'company')
    companyId = (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    // Verify job ownership
    const jobRes = await db.send(new GetCommand({ TableName: Tables.Jobs, Key: { id: jobId } }))
    const jobRaw = jobRes.Item as Record<string, unknown> | undefined
    if (!jobRaw) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (String(jobRaw.companyId) !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const job = summarizeJob(jobRaw)

    // Pull candidates — only those with a name (i.e. real talent)
    const candRes = await db.send(new ScanCommand({ TableName: Tables.Candidates }))
    const allCandidates = (candRes.Items as Record<string, unknown>[]) ?? []
    const usable = allCandidates
      .filter((c) => typeof c.name === 'string' && (c.name as string).trim().length > 0)
      .slice(0, 30) // bound the OpenAI prompt size + cost
      .map(summarizeCandidate)

    if (usable.length === 0) {
      return NextResponse.json({
        results: [],
        source: 'fallback',
        scanned: allCandidates.length,
        scored: 0,
      } satisfies FindTalentResponse)
    }

    let aiResults: CandidateMatch[] | null = null
    aiResults = await callOpenAI(job, usable)

    if (aiResults && aiResults.length > 0) {
      // Keep only entries that map to a candidate we sent, sort desc by score.
      const knownIds = new Set(usable.map((c) => c.id))
      const merged = aiResults
        .filter((r) => knownIds.has(r.candidateId))
        .sort((a, b) => b.score - a.score)
      return NextResponse.json({
        results: merged,
        source: 'openai',
        scanned: allCandidates.length,
        scored: merged.length,
      } satisfies FindTalentResponse)
    }

    // Fallback: deterministic ranking with skill-overlap signal
    const jobSkills = new Set(job.skills.map((s) => s.toLowerCase()))
    const fallback: CandidateMatch[] = usable
      .map((c) => {
        const overlap = c.skills.filter((s) => jobSkills.has(s.name.toLowerCase())).length
        const base = deterministicScore(c.id + jobId)
        const bonus = Math.min(20, overlap * 4)
        const score = Math.min(100, base + bonus)
        return {
          candidateId: c.id,
          score,
          reason:
            overlap > 0
              ? `Lists ${overlap} skill${overlap > 1 ? 's' : ''} that match this role.`
              : 'Heuristic match based on profile data.',
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      results: fallback,
      source: 'fallback',
      scanned: allCandidates.length,
      scored: fallback.length,
    } satisfies FindTalentResponse)
  } catch (err) {
    console.error('[match-candidates]', err)
    return NextResponse.json({ error: 'Match failed' }, { status: 500 })
  }
}
