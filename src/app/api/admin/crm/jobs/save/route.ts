import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
export const maxDuration = 60

const jobSchema = z.object({
  title: z.string().min(1).max(300),
  company: z.string().min(1).max(300),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  description: z.string().max(8000).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
  skills: z.array(z.string().max(80)).max(20).optional(),
  jobType: z.string().max(50).optional(),
  remote: z.boolean().optional(),
  postedAt: z.string().max(50).optional(),
  url: z.string().url().max(2048).optional(),
})

const bodySchema = z.object({
  source: z.string().url().max(2048),
  jobs: z.array(jobSchema).min(1).max(100),
})

interface SaveResponse {
  saved: number
  skipped: number
  jobs: Array<Record<string, unknown>>
}

function jobIdFor(j: z.infer<typeof jobSchema>, hostname: string): string {
  const base = `${hostname}|${j.title}|${j.company}|${j.url ?? ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 120)
  return `scraped-${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function normalize(j: z.infer<typeof jobSchema>, source: string, hostname: string) {
  const id = jobIdFor(j, hostname)
  return {
    pk: id,
    jobId: id,
    title: j.title.slice(0, 200),
    company: j.company.slice(0, 200),
    location: (j.location ?? '').slice(0, 200),
    salaryRange: (j.salary ?? '').slice(0, 100),
    description: (j.description ?? '').slice(0, 4000),
    requirements: (j.requirements ?? []).map((r) => r.slice(0, 300)).slice(0, 12),
    skills: (j.skills ?? []).map((s) => s.slice(0, 60)).slice(0, 15),
    url: j.url ?? source,
    source: hostname,
    jobType: (j.jobType ?? 'full-time').slice(0, 50),
    remote: !!j.remote,
    scrapedAt: new Date().toISOString(),
    postedAt: j.postedAt ?? null,
    createdAt: new Date().toISOString(),
  }
}

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

  const hostname = (() => {
    try { return new URL(parsed.data.source).hostname.replace(/^www\./, '') } catch { return 'external' }
  })()

  let saved = 0
  let skipped = 0
  const persisted: Array<Record<string, unknown>> = []

  for (const j of parsed.data.jobs) {
    const item = normalize(j, parsed.data.source, hostname)
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
      skipped += 1
    }
  }

  return NextResponse.json({ saved, skipped, jobs: persisted } satisfies SaveResponse)
}
