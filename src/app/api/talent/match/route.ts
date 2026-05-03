import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const bodySchema = z.object({
  jobIds: z.array(z.string().min(1).max(200)).min(1).max(40),
})

interface MatchResult {
  jobId: string
  score: number
  reason: string
}

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''
const GITHUB_API = (process.env.GITHUB_URL ?? 'https://api.github.com').replace(/\/$/, '')

function deterministicFallback(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 25)
}

function extractGitHubUsername(url?: string | null): string | null {
  if (!url) return null
  const m = url.match(/github\.com\/([^/?#]+)/i)
  if (!m) return null
  const username = m[1].trim()
  if (!username || username.length > 39) return null
  return username
}

interface GitHubSummary {
  username: string
  bio: string | null
  publicRepos: number
  followers: number
  topLanguages: string[]
  topRepos: Array<{ name: string; description: string | null; stars: number; language: string | null }>
}

async function fetchGitHubSummary(username: string): Promise<GitHubSummary | null> {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

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
      ? (await reposRes.json()) as Array<{
          name: string
          description: string | null
          stargazers_count: number
          language: string | null
          fork: boolean
        }>
      : []

    const ownRepos = repos.filter((r) => !r.fork)
    const langCounts = new Map<string, number>()
    for (const r of ownRepos) {
      if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1)
    }
    const topLanguages = Array.from(langCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang]) => lang)

    const topRepos = [...ownRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((r) => ({
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

function summarizeProfile(p: Record<string, unknown>) {
  const skills = (p.skills as Array<{ name?: string; level?: string }> | undefined ?? [])
    .map((s) => (s.level ? `${s.name} (${s.level})` : s.name))
    .filter(Boolean)
    .slice(0, 30)
  const experience = (p.experience as Array<{ title?: string; company?: string; description?: string }> | undefined ?? [])
    .slice(0, 6)
    .map((e) => ({
      title: e.title ?? '',
      company: e.company ?? '',
      summary: (e.description ?? '').slice(0, 240),
    }))
  return {
    name: (p.name as string) ?? '',
    headline: (p.headline as string) ?? '',
    bio: ((p.bio as string) ?? '').slice(0, 600),
    location: (p.location as string) ?? '',
    workPreference: (p.workPreference as string[]) ?? [],
    availability: (p.availability as string) ?? '',
    salaryExpectation: (p.salaryExpectation as number) ?? 0,
    yearsOfExperience: experience.length,
    skills,
    experience,
    education: ((p.education as Array<{ degree?: string; field?: string; institution?: string }> | undefined) ?? [])
      .slice(0, 4)
      .map((e) => ({ degree: e.degree ?? '', field: e.field ?? '', institution: e.institution ?? '' })),
    languages: (p.languages as string[]) ?? [],
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
    skills: ((j.skills as string[]) ?? []).slice(0, 15),
    requirements: ((j.requirements as string[]) ?? []).slice(0, 8),
    description: ((j.description as string) ?? '').slice(0, 500),
  }
}

async function callOpenAI(profile: ReturnType<typeof summarizeProfile>, github: GitHubSummary | null, jobs: ReturnType<typeof summarizeJob>[]): Promise<MatchResult[] | null> {
  if (!OPENAI_KEY) return null

  const system = `You are a senior technical recruiter. For each job, score how well the talent fits on a 0-100 scale.
Weight skills overlap (most important), seniority alignment, work mode preferences, salary range fit, and recent experience relevance. If GitHub data is provided, factor in language/framework usage and repo signals.
Return STRICT JSON: { "results": [ { "jobId": string, "score": integer 0-100, "reason": string up to 140 chars } ] }. One entry per input job. Do not include any prose outside the JSON.`

  const user = JSON.stringify({ talent: profile, github, jobs })

  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.warn('[talent/match] OpenAI status', res.status, await res.text().catch(() => ''))
      return null
    }
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content
    if (!content) return null
    const parsed = JSON.parse(content) as { results?: Array<Partial<MatchResult>> }
    if (!parsed.results || !Array.isArray(parsed.results)) return null
    return parsed.results
      .filter((r): r is MatchResult => typeof r.jobId === 'string' && typeof r.score === 'number')
      .map((r) => ({
        jobId: r.jobId,
        score: Math.max(0, Math.min(100, Math.round(r.score))),
        reason: (r.reason ?? '').slice(0, 200),
      }))
  } catch (err) {
    console.warn('[talent/match] OpenAI call failed', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let candidateId: string
  try {
    const payload = await verifyCognitoToken(token, 'talent')
    candidateId = payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    // Pull profile
    const profileRes = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { id: candidateId } }),
    )
    const rawProfile = (profileRes.Item as Record<string, unknown> | undefined) ?? null
    const profile = summarizeProfile(rawProfile ?? {})

    // Pull jobs
    const jobItems = await Promise.all(
      parsed.data.jobIds.map((id) =>
        db.send(new GetCommand({ TableName: Tables.Jobs, Key: { id } }))
          .then((r) => (r.Item as Record<string, unknown> | undefined) ?? null)
          .catch(() => null),
      ),
    )
    const jobs = jobItems.filter(Boolean).map((j) => summarizeJob(j as Record<string, unknown>))

    if (jobs.length === 0) {
      return NextResponse.json({ results: [], source: 'empty' })
    }

    // GitHub enrichment (best effort)
    const github = await fetchGitHubSummary(extractGitHubUsername((rawProfile?.github as string) ?? null) ?? '')

    // Heuristic if we have no profile signal at all — skip OpenAI to save cost
    const hasProfileSignal =
      profile.skills.length > 0 ||
      profile.experience.length > 0 ||
      !!profile.headline ||
      !!profile.bio ||
      !!github

    let aiResults: MatchResult[] | null = null
    if (hasProfileSignal) {
      aiResults = await callOpenAI(profile, github, jobs)
    }

    if (aiResults && aiResults.length > 0) {
      const map = new Map(aiResults.map((r) => [r.jobId, r]))
      const merged: MatchResult[] = jobs.map((j) => {
        const r = map.get(j.id)
        return r ?? { jobId: j.id, score: deterministicFallback(j.id), reason: 'Heuristic baseline (AI unavailable for this job)' }
      })
      return NextResponse.json({
        results: merged,
        source: hasProfileSignal ? 'openai' : 'fallback',
        github: github ? { username: github.username, topLanguages: github.topLanguages } : null,
      })
    }

    // Fallback: deterministic scores so the UI still has something
    const fallback: MatchResult[] = jobs.map((j) => ({
      jobId: j.id,
      score: deterministicFallback(j.id),
      reason: hasProfileSignal
        ? 'AI scoring unavailable — showing baseline.'
        : 'Complete your profile (skills, experience, GitHub) to get AI-matched scores.',
    }))
    return NextResponse.json({ results: fallback, source: 'fallback' })
  } catch (err) {
    console.error('[talent/match]', err)
    return NextResponse.json({ error: 'Match scoring failed' }, { status: 500 })
  }
}
