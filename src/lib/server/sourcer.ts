import { NextRequest } from 'next/server'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

export type Vote = 'up' | 'down'

export interface CalibrationSignal {
  vote: Vote
  note?: string
  votedAt: string
}

export interface OutreachDraft {
  subject: string
  body: string
  status: 'drafted' | 'sent'
  generatedAt: string
}

export interface ShortlistEntry {
  candidateId: string
  score: number
  reason: string
  sourcedAt: string
  calibration?: CalibrationSignal
  outreach?: OutreachDraft
}

export interface SourcerBrief {
  id: string
  companyId: string
  title: string
  mustHaves: string[]
  niceToHaves: string[]
  location: string
  workMode: 'remote' | 'hybrid' | 'onsite' | 'any'
  experienceMin: number
  experienceMax: number
  signalSources: string[]
  bar: string
  shortlist: ShortlistEntry[]
  lastSourcedAt?: string
  status: 'draft' | 'active' | 'paused'
  createdAt: string
  updatedAt: string
}

export async function getCompanyIdFromRequest(req: NextRequest): Promise<string | null> {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'company')
    return ((payload['custom:companyId'] as string) ?? payload.sub) || null
  } catch {
    return null
  }
}

export interface OpenAIJsonOptions {
  system: string
  user: string
  temperature?: number
}

export async function openaiJson<T>(opts: OpenAIJsonOptions): Promise<T | null> {
  if (!OPENAI_KEY) return null
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: opts.temperature ?? 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
    })
    if (!res.ok) {
      console.warn('[sourcer] OpenAI status', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) return null
    return JSON.parse(content) as T
  } catch (err) {
    console.warn('[sourcer] OpenAI call failed', err)
    return null
  }
}

export function summarizeCandidate(c: Record<string, unknown>) {
  const skills =
    (c.skills as Array<{ name?: string; level?: string; verified?: boolean }> | undefined) ?? []
  const experience =
    (c.experience as Array<{ title?: string; company?: string; description?: string }> | undefined) ??
    []
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
      summary: (e.description ?? '').slice(0, 200),
    })),
  }
}

export type CandidateSummary = ReturnType<typeof summarizeCandidate>

export function summarizeBriefForAI(b: SourcerBrief) {
  return {
    title: b.title,
    mustHaves: b.mustHaves,
    niceToHaves: b.niceToHaves,
    location: b.location,
    workMode: b.workMode,
    experienceMin: b.experienceMin,
    experienceMax: b.experienceMax,
    signalSources: b.signalSources,
    bar: b.bar.slice(0, 600),
  }
}

export function calibrationDigest(brief: SourcerBrief) {
  const ups: string[] = []
  const downs: string[] = []
  for (const e of brief.shortlist) {
    if (!e.calibration) continue
    const tag = `${e.candidateId}${e.calibration.note ? ' — ' + e.calibration.note.slice(0, 120) : ''}`
    if (e.calibration.vote === 'up') ups.push(tag)
    else downs.push(tag)
  }
  return { ups, downs }
}
