import { chromium } from 'playwright'

export interface CrmJob {
  jobId: string
  title: string
  company: string
  location: string
  salaryRange?: string
  description: string
  requirements: string[]
  skills: string[]
  url: string
  source: 'remoteok' | 'linkedin' | 'remotive' | 'ycombinator'
  jobType: string
  remote: boolean
  scrapedAt: string
  postedAt?: string
}

// ─── RemoteOK public JSON API ──────────────────────────────────────────────
async function scrapeRemoteOK(keywords: string[], limit = 20): Promise<CrmJob[]> {
  const jobs: CrmJob[] = []
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: {
        'User-Agent': 'TalentBridge/1.0',
        Accept: 'application/json',
      },
    })
    if (!res.ok) return jobs

    type ROJob = {
      id?: string; slug?: string; company?: string; position?: string
      description?: string; location?: string; salary_min?: number; salary_max?: number
      url?: string; apply_url?: string; tags?: string[]; date?: string
    }

    const data = (await res.json()) as ROJob[]

    for (const job of data) {
      if (jobs.length >= limit) break
      if (!job.position || !job.company) continue

      if (keywords.length > 0) {
        const text = `${job.position} ${job.description ?? ''} ${(job.tags ?? []).join(' ')}`.toLowerCase()
        if (!keywords.some(k => text.includes(k.toLowerCase()))) continue
      }

      const salaryRange =
        job.salary_min && job.salary_max
          ? `$${Math.round(job.salary_min / 1000)}K–$${Math.round(job.salary_max / 1000)}K`
          : undefined

      jobs.push({
        jobId: `remoteok-${job.slug ?? job.id ?? Math.random().toString(36).slice(2)}`,
        title: job.position,
        company: job.company,
        location: job.location ?? 'Remote',
        salaryRange,
        description: (job.description ?? '').replace(/<[^>]*>/g, '').slice(0, 600),
        requirements: [],
        skills: (job.tags ?? []).slice(0, 8),
        url: job.url ?? `https://remoteok.com/remote-jobs/${job.slug}`,
        source: 'remoteok',
        jobType: 'full-time',
        remote: true,
        scrapedAt: new Date().toISOString(),
        postedAt: job.date,
      })
    }
  } catch {
    // non-fatal
  }
  return jobs
}

// ─── Remotive free API ────────────────────────────────────────────────────
async function scrapeRemotive(keywords: string[], limit = 15): Promise<CrmJob[]> {
  const jobs: CrmJob[] = []
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=50', {
      headers: {
        'User-Agent': 'TalentBridge/1.0',
        Accept: 'application/json',
      },
    })
    if (!res.ok) return jobs

    type RemotiveJob = {
      id: number
      url: string
      title: string
      company_name: string
      category: string
      tags: string[]
      job_type: string
      publication_date: string
      candidate_required_location: string
      salary: string
      description: string
    }

    const data = (await res.json()) as { jobs?: RemotiveJob[] }
    const listings = data.jobs ?? []

    for (const job of listings) {
      if (jobs.length >= limit) break

      if (keywords.length > 0) {
        const text = `${job.title} ${job.category} ${job.tags.join(' ')} ${job.description}`.toLowerCase()
        if (!keywords.some(k => text.includes(k.toLowerCase()))) continue
      }

      jobs.push({
        jobId: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        salaryRange: job.salary || undefined,
        description: job.description.replace(/<[^>]*>/g, '').slice(0, 600),
        requirements: [],
        skills: job.tags.slice(0, 8),
        url: job.url,
        source: 'remotive',
        jobType: job.job_type || 'full-time',
        remote: true,
        scrapedAt: new Date().toISOString(),
        postedAt: job.publication_date,
      })
    }
  } catch {
    // non-fatal
  }
  return jobs
}

// ─── HackerNews "Who is Hiring?" via Algolia HN API ──────────────────────
async function scrapeHNJobs(keywords: string[], limit = 10): Promise<CrmJob[]> {
  const jobs: CrmJob[] = []
  try {
    // Get the latest "Ask HN: Who is hiring?" story IDs
    const storiesRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/jobstories.json',
      { headers: { 'User-Agent': 'TalentBridge/1.0' } },
    )
    if (!storiesRes.ok) return jobs

    const storyIds = (await storiesRes.json()) as number[]
    const topIds = storyIds.slice(0, 60) // Fetch first 60 to filter by keywords

    // Fetch items in batches of 10 to avoid overwhelming the API
    const BATCH = 10
    for (let i = 0; i < topIds.length && jobs.length < limit; i += BATCH) {
      const batch = topIds.slice(i, i + BATCH)
      const items = await Promise.allSettled(
        batch.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            headers: { 'User-Agent': 'TalentBridge/1.0' },
          }).then(r => r.json()),
        ),
      )

      for (const item of items) {
        if (jobs.length >= limit) break
        if (item.status !== 'fulfilled') continue

        type HNItem = { id: number; title?: string; text?: string; url?: string; by?: string; time?: number }
        const story = item.value as HNItem
        if (!story?.title && !story?.text) continue

        const text = `${story.title ?? ''} ${story.text ?? ''}`.toLowerCase()
        const cleanText = text.replace(/<[^>]*>/g, '')

        if (keywords.length > 0 && !keywords.some(k => cleanText.includes(k.toLowerCase()))) continue

        // Parse company + title from HN job post format: "Company | Role | Details"
        const rawTitle = story.title ?? 'Software Engineer'
        const parts = rawTitle.split(/\s*[\|\/]\s*/)
        const company = parts[0]?.trim() || story.by || 'Unknown'
        const title = parts[1]?.trim() || parts[0]?.trim() || 'Software Engineer'

        // Extract location hint from text
        const locMatch = cleanText.match(/\b(remote|onsite|on-site|hybrid|new york|san francisco|london|berlin|toronto|austin|seattle|chicago)\b/i)
        const location = locMatch ? locMatch[0].replace(/\b\w/g, c => c.toUpperCase()) : 'Remote'
        const isRemote = /remote/i.test(cleanText)

        // Extract skills from common tech keywords
        const techKeywords = ['react', 'typescript', 'javascript', 'python', 'go', 'rust', 'node', 'aws', 'kubernetes', 'docker', 'postgres', 'graphql', 'nextjs', 'vue', 'svelte']
        const extractedSkills = techKeywords.filter(t => cleanText.includes(t)).slice(0, 6)

        jobs.push({
          jobId: `hn-${story.id}`,
          title,
          company,
          location,
          description: (story.text ?? '').replace(/<[^>]*>/g, '').slice(0, 600),
          requirements: [],
          skills: extractedSkills.length > 0 ? extractedSkills : keywords.slice(0, 3),
          url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
          source: 'ycombinator',
          jobType: 'full-time',
          remote: isRemote,
          scrapedAt: new Date().toISOString(),
          postedAt: story.time ? new Date(story.time * 1000).toISOString() : undefined,
        })
      }
    }
  } catch {
    // non-fatal
  }
  return jobs
}

// ─── LinkedIn public job listings via Playwright ──────────────────────────
async function scrapeLinkedInJobs(keywords: string[], location?: string, limit = 15): Promise<CrmJob[]> {
  const jobs: CrmJob[] = []
  let browser = null
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
    })
    const page = await context.newPage()

    const query = keywords.join(' ')
    const locParam = location ? `&location=${encodeURIComponent(location)}` : ''
    await page.goto(
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}${locParam}&f_WT=2&sortBy=DD`,
      { timeout: 20000, waitUntil: 'domcontentloaded' },
    )
    await page.waitForTimeout(2500)

    const listings = await page
      .$$eval('.jobs-search__results-list li, .base-search-card, [data-entity-urn]', (cards) =>
        cards.slice(0, 40).map((card) => {
          const titleEl = card.querySelector('.base-search-card__title, h3')
          const companyEl = card.querySelector('.base-search-card__subtitle, h4')
          const locationEl = card.querySelector('.job-search-card__location, .base-search-card__metadata span')
          const linkEl = card.querySelector('a.base-card__full-link, a[href*="/jobs/view/"]')
          return {
            title: (titleEl as HTMLElement)?.innerText?.trim() ?? '',
            company: (companyEl as HTMLElement)?.innerText?.trim() ?? '',
            location: (locationEl as HTMLElement)?.innerText?.trim() ?? '',
            url: (linkEl as HTMLAnchorElement)?.href ?? '',
          }
        }),
      )
      .catch(() => [])

    for (const listing of listings) {
      if (jobs.length >= limit) break
      if (!listing.title || !listing.company) continue
      const listingId = listing.url.match(/view\/(\d+)/)?.[1] ?? Math.random().toString(36).slice(2)
      jobs.push({
        jobId: `linkedin-job-${listingId}`,
        title: listing.title,
        company: listing.company,
        location: listing.location || 'Remote',
        description: '',
        requirements: [],
        skills: keywords.slice(0, 5),
        url: listing.url,
        source: 'linkedin',
        jobType: 'full-time',
        remote: /remote/i.test(listing.location),
        scrapedAt: new Date().toISOString(),
      })
    }

    await context.close()
  } catch {
    // non-fatal
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
  return jobs
}

// ─── Main orchestrator ────────────────────────────────────────────────────
export async function discoverJobsForCrm(keywords: string[], location?: string): Promise<CrmJob[]> {
  const [remoteOk, remotive, hn, linkedin] = await Promise.allSettled([
    scrapeRemoteOK(keywords, 20),
    scrapeRemotive(keywords, 15),
    scrapeHNJobs(keywords, 10),
    scrapeLinkedInJobs(keywords, location, 15),
  ])

  const all: CrmJob[] = [
    ...(remoteOk.status === 'fulfilled' ? remoteOk.value : []),
    ...(remotive.status === 'fulfilled' ? remotive.value : []),
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(linkedin.status === 'fulfilled' ? linkedin.value : []),
  ]

  // Deduplicate by jobId
  const seen = new Set<string>()
  return all.filter(j => {
    if (seen.has(j.jobId)) return false
    seen.add(j.jobId)
    return true
  })
}
