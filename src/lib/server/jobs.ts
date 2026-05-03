import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'

export type DynamoItem = Record<string, unknown>

function safeString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

export function normalizeCompanyForJob(item: DynamoItem | null, fallbackId = ''): DynamoItem {
  const c = item ?? {}
  return {
    id: safeString(c.id) || fallbackId,
    name: safeString(c.name),
    logo: safeString(c.logo) || safeString(c.logoUrl),
    industry: safeString(c.industry),
    size: safeString(c.size),
    location: safeString(c.location) || safeString(c.hq),
    hq: safeString(c.hq) || safeString(c.location),
    website: safeString(c.website),
    founded: safeString(c.founded) || safeString(c.foundedYear),
    description: safeString(c.description),
    verified: c.verified === true,
    plan: safeString(c.plan),
  }
}

async function fetchById(table: string, id: string): Promise<DynamoItem | null> {
  if (!id) return null
  try {
    const res = await db.send(new GetCommand({ TableName: table, Key: { id } }))
    return (res.Item as DynamoItem) ?? null
  } catch {
    return null
  }
}

export async function hydrateJobWithCompany(job: DynamoItem | null): Promise<DynamoItem | null> {
  if (!job) return null
  const companyId = String(job.companyId ?? '')
  const companyRaw = companyId ? await fetchById(Tables.Companies, companyId) : null
  return {
    ...job,
    company: normalizeCompanyForJob(companyRaw, companyId),
  }
}

export async function hydrateJobsWithCompanies(jobs: DynamoItem[]): Promise<DynamoItem[]> {
  if (jobs.length === 0) return []
  const ids = Array.from(
    new Set(jobs.map((j) => String(j.companyId ?? '')).filter(Boolean)),
  )
  const items = await Promise.all(ids.map((id) => fetchById(Tables.Companies, id)))
  const map = new Map<string, DynamoItem>()
  items.forEach((c, i) => { if (c) map.set(ids[i], c) })

  return jobs.map((j) => {
    const cid = String(j.companyId ?? '')
    return {
      ...j,
      company: normalizeCompanyForJob(map.get(cid) ?? null, cid),
    }
  })
}
