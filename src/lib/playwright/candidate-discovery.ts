import { chromium } from 'playwright'
import type { Job } from '@/lib/types'

export interface DiscoveredCandidate {
  profileId: string
  source: 'github' | 'linkedin' | 'stackoverflow'
  profileUrl: string
  name: string
  avatar?: string
  title?: string
  skills: string[]
  location?: string
  bio?: string
  email?: string
  github?: string
  linkedin?: string
  reposCount?: number
  followers?: number
  discoveredAt: string
}

type GitHubUser = {
  login: string
  name?: string
  avatar_url: string
  html_url: string
  bio?: string
  location?: string
  blog?: string
  email?: string
  company?: string
  public_repos?: number
  followers?: number
  url: string
}

// ─── GitHub API search — multiple strategies ──────────────────────────────
async function searchGitHubProfiles(
  skills: string[],
  location?: string,
  limit = 20,
): Promise<DiscoveredCandidate[]> {
  const candidates: DiscoveredCandidate[] = []
  const seen = new Set<string>()

  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'TalentBridge/1.0',
  }
  if (token) headers['Authorization'] = `token ${token}`

  const locationQuery =
    location && location.toLowerCase() !== 'remote' ? ` location:"${location}"` : ''

  // Strategy 1: language-based search for top skills (up to 3 separate queries)
  const topSkills = skills.slice(0, 3)
  const queries: string[] = []

  for (const skill of topSkills) {
    queries.push(`language:${skill} followers:>10 repos:>5${locationQuery}`)
  }

  // Strategy 2: combined keyword search
  if (skills.length > 0) {
    queries.push(`${skills.slice(0, 2).join(' ')}${locationQuery} type:user`)
  }

  const perQuery = Math.ceil(limit / queries.length)

  for (const q of queries) {
    if (candidates.length >= limit) break

    try {
      const encoded = encodeURIComponent(q)
      const res = await fetch(
        `https://api.github.com/search/users?q=${encoded}&sort=repositories&per_page=${perQuery}`,
        { headers },
      )
      if (!res.ok) continue

      const data = (await res.json()) as {
        items?: Array<{ login: string; avatar_url: string; html_url: string; url: string }>
      }

      for (const user of data.items ?? []) {
        if (candidates.length >= limit) break
        if (seen.has(user.login)) continue
        seen.add(user.login)

        try {
          // Small delay to avoid hitting rate limit
          await new Promise(r => setTimeout(r, 100))

          const profileRes = await fetch(user.url, { headers })
          if (!profileRes.ok) continue

          const profile = (await profileRes.json()) as GitHubUser

          candidates.push({
            profileId: `github-${profile.login}`,
            source: 'github',
            profileUrl: profile.html_url,
            name: profile.name ?? profile.login,
            avatar: profile.avatar_url,
            title: profile.company
              ? `Developer at ${profile.company.replace(/^@/, '')}`
              : 'Software Engineer',
            skills: topSkills,
            location: profile.location ?? undefined,
            bio: profile.bio ?? undefined,
            email: profile.email ?? undefined,
            github: profile.html_url,
            reposCount: profile.public_repos,
            followers: profile.followers,
            discoveredAt: new Date().toISOString(),
          })
        } catch {
          // skip individual profile errors
        }
      }
    } catch {
      // skip failed query
    }
  }

  return candidates
}

// ─── LinkedIn public profiles via Playwright ──────────────────────────────
async function searchLinkedInProfiles(job: Job, limit = 5): Promise<DiscoveredCandidate[]> {
  const candidates: DiscoveredCandidate[] = []
  let browser = null

  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
    const page = await context.newPage()

    const skills = job.skills.slice(0, 3).join(' ')
    const query = encodeURIComponent(`${job.title} ${skills} developer`)
    await page.goto(
      `https://www.linkedin.com/search/results/people/?keywords=${query}&origin=GLOBAL_SEARCH_HEADER`,
      { timeout: 15000, waitUntil: 'domcontentloaded' },
    )

    // Extract visible public profile cards
    const profileCards = await page
      .$$eval(
        '[data-chameleon-result-urn], .reusable-search__result-container',
        (cards) =>
          cards.slice(0, 10).map((card) => {
            const nameEl = card.querySelector('[aria-label]')
            const titleEl = card.querySelectorAll(
              'span.entity-result__primary-subtitle, div.t-14',
            )[0]
            const locationEl = card.querySelectorAll(
              'span.entity-result__secondary-subtitle',
            )[0]
            const avatarEl = card.querySelector('img')
            const linkEl = card.querySelector('a[href*="/in/"]')
            return {
              name: nameEl?.getAttribute('aria-label') ?? '',
              title: (titleEl as HTMLElement)?.innerText ?? '',
              location: (locationEl as HTMLElement)?.innerText ?? '',
              avatar: avatarEl?.getAttribute('src') ?? '',
              profileUrl: (linkEl as HTMLAnchorElement)?.href ?? '',
            }
          }),
      )
      .catch(() => [])

    for (const card of profileCards.slice(0, limit)) {
      if (!card.name || !card.profileUrl) continue
      const slug = card.profileUrl.match(/\/in\/([^/]+)/)?.[1]
      if (!slug) continue
      candidates.push({
        profileId: `linkedin-${slug}`,
        source: 'linkedin',
        profileUrl: card.profileUrl,
        name: card.name,
        avatar: card.avatar || undefined,
        title: card.title || undefined,
        skills: job.skills.slice(0, 5),
        location: card.location || undefined,
        linkedin: card.profileUrl,
        discoveredAt: new Date().toISOString(),
      })
    }

    await context.close()
  } catch {
    // LinkedIn scraping can fail — non-fatal
  } finally {
    if (browser) await browser.close().catch(() => {})
  }

  return candidates
}

// ─── CRM-level discovery (no specific job needed) ────────────────────────
export async function discoverCandidatesByQuery(
  skills: string[],
  location?: string,
): Promise<DiscoveredCandidate[]> {
  const fakeJob = {
    id: 'crm-discovery',
    title: skills.slice(0, 3).join(' '),
    skills,
    location: location ?? 'Remote',
  } as unknown as Job

  return discoverCandidatesForJob(fakeJob)
}

// ─── Job-level discovery ──────────────────────────────────────────────────
export async function discoverCandidatesForJob(job: Job): Promise<DiscoveredCandidate[]> {
  const [github, linkedin] = await Promise.allSettled([
    searchGitHubProfiles(job.skills, job.location, 20),
    searchLinkedInProfiles(job, 5),
  ])

  const all: DiscoveredCandidate[] = [
    ...(github.status === 'fulfilled' ? github.value : []),
    ...(linkedin.status === 'fulfilled' ? linkedin.value : []),
  ]

  // Deduplicate by profileId
  const seen = new Set<string>()
  return all.filter((c) => {
    if (seen.has(c.profileId)) return false
    seen.add(c.profileId)
    return true
  })
}
