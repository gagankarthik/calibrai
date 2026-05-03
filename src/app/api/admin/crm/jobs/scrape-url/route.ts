import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { chromium, type Browser } from 'playwright'
import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
export const maxDuration = 120

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''

const bodySchema = z.object({
  url: z.string().url().max(2048),
})

interface ExtractedJob {
  title: string
  company: string
  location?: string
  salary?: string
  description?: string
  requirements?: string[]
  skills?: string[]
  jobType?: string
  remote?: boolean
  postedAt?: string
  url?: string
}

interface ScrapeResponse {
  scraped: number
  saved: number
  skipped: number
  jobs: Array<Record<string, unknown>>
  source: string
  warning?: string
}

// ─── 1. Pull rendered page text via Playwright ────────────────────────────────

async function fetchRenderedPage(url: string): Promise<{ text: string; title: string; finalUrl: string }> {
  let browser: Browser | null = null
  try {
    browser = await chromium.launch({ headless: true })
    const ctx = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
    })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    // Give SPA / client-rendered content a beat
    await page.waitForTimeout(1500)

    const text = await page.evaluate(() => {
      // Prefer main / article, fall back to body
      const node =
        (document.querySelector('main') as HTMLElement | null) ??
        (document.querySelector('article') as HTMLElement | null) ??
        document.body
      return (node?.innerText ?? '').replace(/ /g, ' ')
    })
    const title = await page.title()
    const finalUrl = page.url()
    return { text: text.replace(/[\t ]{2,}/g, ' ').trim(), title, finalUrl }
  } finally {
    await browser?.close().catch(() => {})
  }
}

// ─── 2. OpenAI extraction ────────────────────────────────────────────────────

async function extractJobs(text: string, pageTitle: string, sourceUrl: string): Promise<ExtractedJob[]> {
  if (!OPENAI_KEY) {
    throw new Error('OpenAI API key is not configured (NEXT_OPENAI_API_KEY).')
  }

  const system = `You extract job postings from a web page's text content.
The page may be a single job-detail page OR a job-listing page with many jobs.

Return STRICT JSON: { "jobs": [ { ...fields } ] }.

Each job object MUST include:
- title (string) — required
- company (string) — required (use the page's company name if obvious from URL/title; do not invent)

And MAY include:
- location (string)
- salary (string, e.g. "$120K-$150K", "USD 80,000 - 120,000")
- description (string, <=1500 chars, plain text)
- requirements (string[], up to 10)
- skills (string[], up to 12 — concrete skills/tools, not soft skills)
- jobType ("full-time" | "part-time" | "contract" | "internship" | "freelance")
- remote (boolean — true if explicitly remote-friendly)
- postedAt (ISO date if found)
- url (string — direct URL to that specific job, if a listing page exposes it)

Rules:
- If the page is NOT a job posting, return { "jobs": [] }. No prose, no apology, just empty array.
- Don't fabricate a salary, requirements, or skills if they are not in the page.
- Cap to 25 jobs maximum.`

  const user = `URL: ${sourceUrl}
PAGE TITLE: ${pageTitle}

PAGE TEXT (truncated):
${text.slice(0, 14000)}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    console.warn('[scrape-url] OpenAI status', res.status, err.slice(0, 400))
    throw new Error(`OpenAI extraction failed (${res.status})`)
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) return []

  let parsed: { jobs?: ExtractedJob[] }
  try {
    parsed = JSON.parse(content)
  } catch {
    return []
  }

  if (!Array.isArray(parsed.jobs)) return []
  return parsed.jobs
    .filter((j) => j && typeof j.title === 'string' && typeof j.company === 'string' && j.title.length > 0)
    .slice(0, 25)
}

// ─── 3. Normalize → CrmJob shape and persist ─────────────────────────────────

function normalizeForDb(j: ExtractedJob, sourceUrl: string, hostname: string) {
  const id = `scraped-${hostname.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    pk: id,
    jobId: id,
    title: j.title.slice(0, 200),
    company: (j.company ?? 'Unknown').slice(0, 200),
    location: (j.location ?? '').slice(0, 200),
    salaryRange: (j.salary ?? '').slice(0, 100),
    description: (j.description ?? '').slice(0, 4000),
    requirements: Array.isArray(j.requirements) ? j.requirements.slice(0, 12).map((r) => String(r).slice(0, 300)) : [],
    skills: Array.isArray(j.skills) ? j.skills.slice(0, 15).map((s) => String(s).slice(0, 60)) : [],
    url: j.url ?? sourceUrl,
    source: hostname,
    jobType: (j.jobType ?? 'full-time').slice(0, 50),
    remote: !!j.remote,
    scrapedAt: new Date().toISOString(),
    postedAt: j.postedAt ?? null,
    createdAt: new Date().toISOString(),
  }
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth: accept EITHER the admin password header OR the gate cookie set by the admin layout.
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const headerOk = !!adminPassword && req.headers.get('x-admin-password') === adminPassword
  const cookieOk = req.cookies.get('tb-admin-verified')?.value === 'true'
  if (!headerOk && !cookieOk) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  const { url } = parsed.data

  let pageText = ''
  let pageTitle = ''
  let finalUrl = url
  try {
    const pulled = await fetchRenderedPage(url)
    pageText = pulled.text
    pageTitle = pulled.title
    finalUrl = pulled.finalUrl
  } catch (err) {
    console.error('[scrape-url] playwright error', err)
    return NextResponse.json(
      { error: 'Could not load the URL. Check that it is reachable and not blocked.' },
      { status: 502 },
    )
  }

  if (!pageText || pageText.length < 60) {
    return NextResponse.json(
      { error: 'The page returned no readable text. It may be JS-only or protected.' },
      { status: 422 },
    )
  }

  let extracted: ExtractedJob[]
  try {
    extracted = await extractJobs(pageText, pageTitle, finalUrl)
  } catch (err) {
    console.error('[scrape-url] extract error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI extraction failed' },
      { status: 502 },
    )
  }

  if (extracted.length === 0) {
    return NextResponse.json(
      {
        scraped: 0,
        saved: 0,
        skipped: 0,
        jobs: [],
        source: finalUrl,
        warning: 'AI did not detect any job postings on this page.',
      } satisfies ScrapeResponse,
    )
  }

  const hostname = (() => {
    try {
      return new URL(finalUrl).hostname.replace(/^www\./, '')
    } catch {
      return 'external'
    }
  })()

  let saved = 0
  let skipped = 0
  const persisted: Array<Record<string, unknown>> = []

  for (const j of extracted) {
    const item = normalizeForDb(j, finalUrl, hostname)
    try {
      await db.send(
        new PutCommand({
          TableName: Tables.CrmJobs,
          Item: item,
          ConditionExpression: 'attribute_not_exists(pk)',
        }),
      )
      saved += 1
      persisted.push(item)
    } catch {
      // Conditional check failed (already exists) — count as skipped, keep going.
      skipped += 1
    }
  }

  return NextResponse.json(
    {
      scraped: extracted.length,
      saved,
      skipped,
      jobs: persisted,
      source: finalUrl,
    } satisfies ScrapeResponse,
  )
}
