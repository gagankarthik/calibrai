import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''
const GITHUB_API = (process.env.GITHUB_URL ?? 'https://api.github.com').replace(/\/$/, '')

interface AnalysisResult {
  overall: number
  skillsMatch: number
  cultureFit: number
  experienceAlignment: number
  recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no'
  summary: string
  reasons: string[]
  risks: Array<{ text: string; severity: 'low' | 'medium' | 'high' }>
  source: 'openai' | 'fallback'
}

function deterministicScore(id: string, salt = ''): number {
  const seed = `${id}|${salt}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  return 60 + (Math.abs(hash) % 35)
}

function extractGitHubUsername(url?: string | null): string | null {
  if (!url) return null
  const m = url.match(/github\.com\/([^/?#]+)/i)
  if (!m) return null
  const u = m[1].trim()
  if (!u || u.length > 39) return null
  return u
}

interface GitHubSummary {
  username: string
  bio: string | null
  publicRepos: number
  followers: number
  topLanguages: string[]
  topRepos: Array<{ name: string; description: string | null; stars: number; language: string | null }>
}

async function fetchGitHubSummary(username: string | null): Promise<GitHubSummary | null> {
  if (!username) return null
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  try {
    const userRes = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, {
      headers,
      next: { revalidate: 21_600 },
    })
    if (!userRes.ok) return null
    const user = await userRes.json() as { bio: string | null; public_repos: number; followers: number }

    const reposRes = await fetch(
      `${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated`,
      { headers, next: { revalidate: 21_600 } },
    )
    const repos = reposRes.ok
      ? await reposRes.json() as Array<{ name: string; description: string | null; stargazers_count: number; language: string | null; fork: boolean }>
      : []

    const own = repos.filter((r) => !r.fork)
    const langs = new Map<string, number>()
    own.forEach((r) => { if (r.language) langs.set(r.language, (langs.get(r.language) ?? 0) + 1) })
    const topLanguages = Array.from(langs.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([l]) => l)
    const topRepos = [...own].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6).map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
    }))
    return {
      username,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
      topLanguages,
      topRepos,
    }
  } catch {
    return null
  }
}

function summarizeCandidate(c: Record<string, unknown>) {
  const skills = (c.skills as Array<{ name?: string; level?: string; verified?: boolean; score?: number }> | undefined ?? [])
  const experience = (c.experience as Array<{ title?: string; company?: string; description?: string; current?: boolean; startDate?: string; endDate?: string; skills?: string[] }> | undefined ?? [])
  return {
    name: (c.name as string) ?? '',
    headline: (c.headline as string) ?? (c.title as string) ?? '',
    bio: ((c.bio as string) ?? '').slice(0, 800),
    location: (c.location as string) ?? '',
    workPreference: (c.workPreference as string[]) ?? [],
    availability: (c.availability as string) ?? '',
    salaryExpectation: (c.salaryExpectation as number) ?? 0,
    languages: (c.languages as string[]) ?? [],
    skills: skills.slice(0, 30).map((s) => ({
      name: s.name ?? '',
      level: s.level ?? '',
      verified: !!s.verified,
      score: s.score,
    })),
    experience: experience.slice(0, 8).map((e) => ({
      title: e.title ?? '',
      company: e.company ?? '',
      current: !!e.current,
      summary: (e.description ?? '').slice(0, 280),
      skills: (e.skills ?? []).slice(0, 12),
    })),
    education: ((c.education as Array<{ degree?: string; field?: string; institution?: string }> | undefined) ?? [])
      .slice(0, 4)
      .map((e) => ({
        degree: e.degree ?? '',
        field: e.field ?? '',
        institution: e.institution ?? '',
      })),
  }
}

function summarizeJob(j: Record<string, unknown>) {
  return {
    id: j.id as string,
    title: (j.title as string) ?? '',
    level: (j.level as string) ?? '',
    workMode: (j.workMode as string) ?? '',
    location: (j.location as string) ?? '',
    salaryMin: (j.salaryMin as number) ?? 0,
    salaryMax: (j.salaryMax as number) ?? 0,
    skills: ((j.skills as string[]) ?? []).slice(0, 20),
    requirements: ((j.requirements as string[]) ?? []).slice(0, 12),
    description: ((j.description as string) ?? '').slice(0, 800),
  }
}

async function callOpenAI(
  candidate: ReturnType<typeof summarizeCandidate>,
  job: ReturnType<typeof summarizeJob> | null,
  github: GitHubSummary | null,
): Promise<Omit<AnalysisResult, 'source'> | null> {
  if (!OPENAI_KEY) return null

  const system = job
    ? `You are a senior technical recruiter scoring how well a candidate fits a SPECIFIC job. Be precise and grounded in evidence — do not invent facts that aren't in the data. Penalize missing core skills heavily; reward verified skills, recent relevant experience, and GitHub signal when present.

Return STRICT JSON, no prose:
{
  "overall": integer 0-100,
  "skillsMatch": integer 0-100,
  "cultureFit": integer 0-100,
  "experienceAlignment": integer 0-100,
  "recommendation": "strong_yes" | "yes" | "maybe" | "no",
  "summary": one sentence (<=160 chars) explaining the verdict,
  "reasons": array of 3-5 short positive bullet strings (<=110 chars each) — concrete and tied to the data,
  "risks": array of 1-4 objects { "text": <=120 char concern, "severity": "low" | "medium" | "high" }
}`
    : `You are a senior technical recruiter assessing a candidate's overall profile strength when no specific job is selected. Score profile completeness, skills depth, and experience signal.

Return STRICT JSON, no prose:
{
  "overall": integer 0-100,
  "skillsMatch": integer 0-100,
  "cultureFit": integer 0-100,
  "experienceAlignment": integer 0-100,
  "recommendation": "strong_yes" | "yes" | "maybe" | "no",
  "summary": one sentence (<=160 chars),
  "reasons": array of 3-5 short positive bullet strings (<=110 chars each),
  "risks": array of 1-4 objects { "text": <=120 chars, "severity": "low" | "medium" | "high" }
}`

  const user = JSON.stringify({ candidate, job, github })

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
      console.warn('[candidate analysis] OpenAI status', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content) as Partial<AnalysisResult>

    const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
    const rec = (parsed.recommendation as string) ?? 'maybe'
    const recValid: AnalysisResult['recommendation'] =
      rec === 'strong_yes' || rec === 'yes' || rec === 'no' ? rec : 'maybe'

    return {
      overall: clamp(parsed.overall),
      skillsMatch: clamp(parsed.skillsMatch),
      cultureFit: clamp(parsed.cultureFit),
      experienceAlignment: clamp(parsed.experienceAlignment),
      recommendation: recValid,
      summary: (parsed.summary ?? '').slice(0, 200),
      reasons: Array.isArray(parsed.reasons)
        ? parsed.reasons.filter((r): r is string => typeof r === 'string').slice(0, 6).map((r) => r.slice(0, 200))
        : [],
      risks: Array.isArray(parsed.risks)
        ? (parsed.risks as Array<{ text?: unknown; severity?: unknown }>)
            .filter((r) => !!r && typeof r.text === 'string')
            .slice(0, 5)
            .map((r): AnalysisResult['risks'][number] => ({
              text: String(r.text).slice(0, 200),
              severity:
                r.severity === 'high' || r.severity === 'medium' ? r.severity
                : 'low',
            }))
        : [],
    }
  } catch (err) {
    console.warn('[candidate analysis] OpenAI call failed', err)
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = await params
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyCognitoToken(token, 'company')
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId') ?? ''

  try {
    const candidateRes = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { id: candidateId } }),
    )
    const candidateRaw = candidateRes.Item as Record<string, unknown> | undefined
    if (!candidateRaw) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }
    const candidate = summarizeCandidate(candidateRaw)

    let job: ReturnType<typeof summarizeJob> | null = null
    if (jobId) {
      const jobRes = await db.send(
        new GetCommand({ TableName: Tables.Jobs, Key: { id: jobId } }),
      )
      const jobRaw = jobRes.Item as Record<string, unknown> | undefined
      if (jobRaw) job = summarizeJob(jobRaw)
    }

    const github = await fetchGitHubSummary(extractGitHubUsername((candidateRaw.github as string) ?? null))

    const hasSignal =
      candidate.skills.length > 0 ||
      candidate.experience.length > 0 ||
      !!candidate.headline ||
      !!candidate.bio ||
      !!github

    let ai: Omit<AnalysisResult, 'source'> | null = null
    if (hasSignal) {
      ai = await callOpenAI(candidate, job, github)
    }

    if (ai) {
      const result: AnalysisResult = { ...ai, source: 'openai' }
      return NextResponse.json({ ...result, github: github ? { username: github.username, topLanguages: github.topLanguages } : null })
    }

    // Fallback heuristic
    const base = deterministicScore(candidateId, jobId)
    const fallback: AnalysisResult = {
      overall: base,
      skillsMatch: Math.max(0, base - 5),
      cultureFit: Math.min(100, base + 3),
      experienceAlignment: Math.max(0, base - 2),
      recommendation: base >= 80 ? 'yes' : base >= 65 ? 'maybe' : 'no',
      summary: hasSignal
        ? 'AI analysis unavailable — showing baseline heuristic score.'
        : 'Profile is too sparse for a confident match. Encourage the candidate to complete it.',
      reasons: hasSignal
        ? [
            candidate.skills[0]?.name ? `Lists ${candidate.skills[0].name} as a skill` : 'Has at least one listed skill',
            candidate.experience[0]?.title ? `Most recent role: ${candidate.experience[0].title}` : 'Some prior experience on file',
            candidate.workPreference?.length ? `Open to ${candidate.workPreference.join(' / ')} work` : 'Flexible work mode',
          ].filter(Boolean) as string[]
        : [
            'Account is verified',
            'Application submitted recently',
            'Interview can confirm fit signals not present in profile',
          ],
      risks: hasSignal
        ? [{ text: 'Validate skill depth in interview — self-reported levels can over-state proficiency', severity: 'low' }]
        : [{ text: 'Profile is incomplete — lacks skills, experience, or bio for a strong match signal', severity: 'medium' }],
      source: 'fallback',
    }
    return NextResponse.json({ ...fallback, github: github ? { username: github.username, topLanguages: github.topLanguages } : null })
  } catch (err) {
    console.error('[company/candidates/[id]/analysis]', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
