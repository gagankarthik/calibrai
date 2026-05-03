import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'
import { hydrateJobsWithCompanies } from '@/lib/server/jobs'

type Job = Record<string, unknown>

function parseSalaryRange(raw?: string): { min: number; max: number } {
  if (!raw) return { min: 0, max: 0 }
  // Match patterns like "$80K–$120K", "$80,000-$120,000", "USD 80k - 120k"
  const numbers = raw.replace(/,/g, '').match(/\d+(?:\.\d+)?/g)
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 }
  const upper = raw.toUpperCase()
  const multiplier = upper.includes('K') ? 1000 : 1
  const values = numbers.map((n) => Math.round(parseFloat(n) * multiplier))
  if (values.length === 1) return { min: values[0], max: values[0] }
  return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) }
}

function normalizeCrmJob(crm: Job): Job {
  const { min, max } = parseSalaryRange(crm.salaryRange as string | undefined)
  const company = String(crm.company ?? 'External Company')
  return {
    id: String(crm.jobId ?? crm.pk ?? ''),
    title: String(crm.title ?? ''),
    company: { name: company, logo: '', verified: false },
    location: String(crm.location ?? (crm.remote ? 'Remote' : '')),
    salaryMin: min,
    salaryMax: max,
    currency: 'USD',
    type: String(crm.jobType ?? 'full-time'),
    workMode: crm.remote === true ? 'remote' : 'onsite',
    level: 'mid',
    skills: Array.isArray(crm.skills) ? crm.skills : [],
    requirements: Array.isArray(crm.requirements) ? crm.requirements : [],
    description: String(crm.description ?? ''),
    postedAt: String(crm.postedAt ?? crm.scrapedAt ?? new Date().toISOString()),
    applicantCount: 0,
    viewCount: 0,
    status: 'active',
    featured: false,
    external: true,
    applyUrl: String(crm.url ?? ''),
    source: String(crm.source ?? 'external'),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase()
  const workMode = searchParams.getAll('workMode')
  const status = searchParams.get('status') ?? 'active'
  const includeExternal = searchParams.get('external') !== 'false'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  try {
    const [internalRes, crmRes] = await Promise.all([
      db.send(
        new ScanCommand({
          TableName: Tables.Jobs,
          FilterExpression: '#s = :status',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':status': status },
        }),
      ),
      includeExternal
        ? db.send(new ScanCommand({ TableName: Tables.CrmJobs })).catch(() => ({ Items: [] }))
        : Promise.resolve({ Items: [] }),
    ])

    const internalRaw = (internalRes.Items ?? []) as Job[]
    const internal = await hydrateJobsWithCompanies(internalRaw)
    const crm = ((crmRes.Items ?? []) as Job[]).map(normalizeCrmJob).filter((j) => j.id && j.title)

    let jobs = [...internal, ...crm]

    if (search) {
      jobs = jobs.filter(
        (j) =>
          (j.title as string)?.toLowerCase().includes(search) ||
          (j.description as string)?.toLowerCase().includes(search) ||
          (j.skills as string[] | undefined)?.some((s) => s.toLowerCase().includes(search)),
      )
    }
    if (workMode.length) {
      jobs = jobs.filter((j) => workMode.includes(j.workMode as string))
    }

    jobs.sort((a, b) => {
      const at = new Date(String(a.postedAt ?? '')).getTime() || 0
      const bt = new Date(String(b.postedAt ?? '')).getTime() || 0
      return bt - at
    })

    const start = (page - 1) * limit
    return NextResponse.json(jobs.slice(start, start + limit))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch jobs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
