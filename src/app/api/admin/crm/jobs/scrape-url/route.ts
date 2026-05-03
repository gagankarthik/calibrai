import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const maxDuration = 120

const OPENAI_KEY = process.env.NEXT_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? ''

const bodySchema = z.object({
  url: z.string().url().max(2048),
  maxPages: z.coerce.number().int().min(1).max(5).default(2),
  maxJobs: z.coerce.number().int().min(1).max(100).default(40),
})

export interface ExtractedJob {
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

interface PreviewResponse {
  source: string
  pageTitle: string
  pagesVisited: number
  jobLinksFound: number
  jobs: ExtractedJob[]
  warning?: string
}

const REAL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const FETCH_HEADERS: Record<string, string> = {
  'User-Agent': REAL_UA,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Upgrade-Insecure-Requests': '1',
}

// ─── HTML helpers ────────────────────────────────────────────────────────────

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|br|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[\t ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function htmlTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? m[1].trim().slice(0, 200) : ''
}

function looksLikeJobUrl(u: string): boolean {
  const lower = u.toLowerCase()
  return /(\/jobs?\/|\/careers?\/|\/positions?\/|\/opportunit|\/posting|\/openings?\/|\/role\/|\/vacanc)/.test(lower)
}

function extractLinks(html: string, base: string): string[] {
  const out: string[] = []
  const re = /<a[^>]*\shref=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const raw = m[1] ?? m[2] ?? m[3]
    if (!raw) continue
    try { out.push(new URL(raw, base).toString()) } catch { /* skip */ }
  }
  return out
}

function tryNextPageUrl(html: string, currentUrl: string): string | null {
  const linkRel = html.match(/<link[^>]+rel=["']next["'][^>]+href=["']([^"']+)["']/i)
  if (linkRel) { try { return new URL(linkRel[1], currentUrl).toString() } catch { /* */ } }
  const aRel = html.match(/<a[^>]+rel=["']next["'][^>]+href=["']([^"']+)["']/i)
  if (aRel) { try { return new URL(aRel[1], currentUrl).toString() } catch { /* */ } }
  const aAria = html.match(/<a[^>]+aria-label=["'][^"']*next[^"']*["'][^>]+href=["']([^"']+)["']/i)
  if (aAria) { try { return new URL(aAria[1], currentUrl).toString() } catch { /* */ } }
  try {
    const u = new URL(currentUrl)
    for (const key of ['page', 'p', 'pg']) {
      if (u.searchParams.has(key)) {
        const cur = parseInt(u.searchParams.get(key) ?? '1', 10)
        if (Number.isFinite(cur)) {
          u.searchParams.set(key, String(cur + 1))
          return u.toString()
        }
      }
    }
    for (const key of ['start', 'offset']) {
      if (u.searchParams.has(key)) {
        const cur = parseInt(u.searchParams.get(key) ?? '0', 10)
        if (Number.isFinite(cur)) {
          u.searchParams.set(key, String(cur + 25))
          return u.toString()
        }
      }
    }
  } catch { /* ignore */ }
  return null
}

function unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)) }

// ─── Fetch wrapper ───────────────────────────────────────────────────────────

async function fetchHtml(url: string, timeoutMs = 25_000): Promise<{ html: string; finalUrl: string; status: number } | { error: string; status: number }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: FETCH_HEADERS,
      redirect: 'follow',
      signal: ctrl.signal,
    })
    if (!res.ok) {
      return { error: `HTTP ${res.status} ${res.statusText}`, status: res.status }
    }
    const ctype = res.headers.get('content-type') ?? ''
    if (!/(text\/html|application\/xhtml|application\/json|text\/plain)/i.test(ctype)) {
      return { error: `Unsupported content-type: ${ctype || 'unknown'}`, status: 415 }
    }
    const html = await res.text()
    return { html, finalUrl: res.url || url, status: res.status }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Fetch failed', status: 0 }
  } finally {
    clearTimeout(t)
  }
}

// ─── OpenAI extraction (chunked + deduped) ───────────────────────────────────

async function extractJobs(text: string, sourceUrl: string, pageTitle: string): Promise<ExtractedJob[]> {
  if (!OPENAI_KEY) throw new Error('OpenAI is not configured (NEXT_OPENAI_API_KEY).')
  if (!text || text.length < 60) return []

  const system = `You extract job postings from a web page's text content.
The page may be:
1. A single job-detail page → return one job
2. A listing/search results page → return every job visible (up to 30)
3. Not a job page → return { "jobs": [] }

Return STRICT JSON: { "jobs": [ { ...fields } ] }. No prose outside JSON.

Each job MUST include:
- title (string, required)
- company (string, required — use the obvious org name from the URL/page; never invent)

May include:
- location (string)
- salary (string, e.g. "$120K-$150K")
- description (string ≤ 1500 chars)
- requirements (string[] up to 10)
- skills (string[] up to 12 — concrete tools/frameworks, not soft skills)
- jobType ("full-time" | "part-time" | "contract" | "internship" | "freelance")
- remote (boolean — true only if explicitly remote-friendly)
- postedAt (ISO date if found)
- url (string — direct URL to the specific job posting if discoverable)

Rules:
- Never fabricate salary/skills/requirements that aren't in the text.
- If the same job appears multiple times, return it only once.`

  const CHUNK = 12_000
  const chunks: string[] = []
  for (let i = 0; i < text.length && chunks.length < 4; i += CHUNK) {
    chunks.push(text.slice(i, i + CHUNK))
  }

  const seen = new Map<string, ExtractedJob>()
  for (let idx = 0; idx < chunks.length; idx++) {
    const userMsg = `URL: ${sourceUrl}
PAGE TITLE: ${pageTitle}
CHUNK ${idx + 1}/${chunks.length}

PAGE TEXT:
${chunks[idx]}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
      }),
    }).catch(() => null)
    if (!res || !res.ok) continue
    const data = (await res.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: string } }> }
      | null
    const content = data?.choices?.[0]?.message?.content
    if (!content) continue
    let parsed: { jobs?: ExtractedJob[] }
    try { parsed = JSON.parse(content) } catch { continue }
    if (!Array.isArray(parsed.jobs)) continue
    for (const j of parsed.jobs) {
      if (!j || typeof j.title !== 'string' || typeof j.company !== 'string') continue
      const t = j.title.trim()
      const c = j.company.trim()
      if (!t || !c) continue
      const key = `${t.toLowerCase()}|${c.toLowerCase()}|${(j.url ?? '').toLowerCase()}`
      if (!seen.has(key)) seen.set(key, j)
    }
  }
  return Array.from(seen.values())
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const headerOk = !!adminPassword && req.headers.get('x-admin-password') === adminPassword
  const cookieOk = req.cookies.get('tb-admin-verified')?.value === 'true'
  if (!headerOk && !cookieOk) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
  const { url: startUrl, maxPages, maxJobs } = parsed.data

  // ── 1. Crawl listing pages ────────────────────────────────────────────────
  let aggregatedText = ''
  let pageTitle = ''
  let finalUrl = startUrl
  const allJobLinks: string[] = []
  let pagesVisited = 0
  const errors: string[] = []

  let visitUrl: string | null = startUrl
  let lastHtml = ''
  while (visitUrl && pagesVisited < maxPages) {
    const got = await fetchHtml(visitUrl)
    if ('error' in got) {
      errors.push(`page ${pagesVisited + 1} (${visitUrl}): ${got.error}`)
      break
    }
    lastHtml = got.html
    const text = htmlToText(got.html)
    if (pagesVisited === 0) {
      pageTitle = htmlTitle(got.html)
      finalUrl = got.finalUrl
    }
    aggregatedText += `\n\n--- PAGE ${pagesVisited + 1}: ${got.finalUrl} ---\n${text}`
    const links = extractLinks(got.html, got.finalUrl).filter(looksLikeJobUrl)
    allJobLinks.push(...links)
    pagesVisited += 1
    visitUrl = pagesVisited < maxPages ? tryNextPageUrl(lastHtml, got.finalUrl) : null
  }

  // If first-page fetch failed entirely, surface the actual error.
  if (pagesVisited === 0) {
    return NextResponse.json(
      {
        error:
          'Could not fetch the URL. ' +
          (errors[0] ?? 'The site may be blocking unauthenticated requests, requires login, or is JS-only.'),
      },
      { status: 502 },
    )
  }

  // ── 2. Crawl up to N detail pages concurrently ────────────────────────────
  const linksToVisit = unique(allJobLinks).slice(0, maxJobs)
  if (linksToVisit.length > 0) {
    const POOL = 6
    let cursor = 0
    async function worker() {
      while (cursor < linksToVisit.length) {
        const idx = cursor++
        const link = linksToVisit[idx]
        const got = await fetchHtml(link, 18_000)
        if ('error' in got) continue
        const text = htmlToText(got.html).slice(0, 4000)
        if (text.length > 80) {
          aggregatedText += `\n\n--- JOB DETAIL: ${link} ---\n${text}`
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(POOL, linksToVisit.length) }, () => worker()))
  }

  if (aggregatedText.length < 200) {
    return NextResponse.json(
      {
        error:
          'Page returned almost no readable text (likely a JS-only / SPA shell). Try pasting a deeper URL — for example a single job posting URL or a server-rendered /jobs index.',
      },
      { status: 422 },
    )
  }

  // ── 3. OpenAI extraction (no DB write) ────────────────────────────────────
  let jobs: ExtractedJob[]
  try {
    jobs = await extractJobs(aggregatedText, finalUrl, pageTitle)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI extraction failed' },
      { status: 502 },
    )
  }

  return NextResponse.json({
    source: finalUrl,
    pageTitle,
    pagesVisited,
    jobLinksFound: allJobLinks.length,
    jobs: jobs.slice(0, maxJobs),
    warning:
      jobs.length === 0
        ? 'AI did not detect any job postings on this page. Try a more specific URL.'
        : undefined,
  } satisfies PreviewResponse)
}
