import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'

export type DynamoItem = Record<string, unknown>

async function fetchById(table: string, id: string): Promise<DynamoItem | null> {
  if (!id) return null
  try {
    const res = await db.send(new GetCommand({ TableName: table, Key: { id } }))
    return (res.Item as DynamoItem) ?? null
  } catch {
    return null
  }
}

function deterministicScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

export function normalizeCandidate(item: DynamoItem): DynamoItem {
  const id = String(item.id ?? item.candidateId ?? '')
  return {
    ...item,
    id,
    title: (item.title as string) || (item.headline as string) || '',
    avatar: (item.avatar as string) || (item.avatarUrl as string) || '',
    name: (item.name as string) || '',
    email: (item.email as string) || '',
    phone: (item.phone as string) || '',
    location: (item.location as string) || '',
    bio: (item.bio as string) || '',
    availability: (item.availability as string) || 'Open to work',
    salaryExpectation: (item.salaryExpectation as number) || 0,
    workPreference: (item.workPreference as string[]) || [],
    languages: (item.languages as string[]) || [],
    skills: (item.skills as unknown[]) || [],
    experience: (item.experience as unknown[]) || [],
    education: (item.education as unknown[]) || [],
    assessmentScores: (item.assessmentScores as Record<string, number>) || {},
    verified: (item.verified as boolean) || false,
    premium: (item.premium as boolean) || false,
    matchScore: (item.matchScore as number) || deterministicScore(id),
  }
}

export function normalizeCompany(item: DynamoItem | null, fallbackId = ''): DynamoItem {
  const c = item ?? {}
  return {
    ...c,
    id: String(c.id ?? fallbackId),
    name: (c.name as string) || '',
    logo: (c.logo as string) || (c.logoUrl as string) || '',
    industry: (c.industry as string) || '',
    size: (c.size as string) || '',
    location: (c.location as string) || (c.hq as string) || '',
    website: (c.website as string) || '',
    verified: (c.verified as boolean) || false,
  }
}

export async function hydrateApplications(applications: DynamoItem[]): Promise<DynamoItem[]> {
  if (applications.length === 0) return []

  const jobIds = Array.from(
    new Set(applications.map((a) => String(a.jobId ?? '')).filter(Boolean)),
  )
  const candidateIds = Array.from(
    new Set(applications.map((a) => String(a.candidateId ?? '')).filter(Boolean)),
  )

  const [jobItems, candidateItems] = await Promise.all([
    Promise.all(jobIds.map((id) => fetchById(Tables.Jobs, id))),
    Promise.all(candidateIds.map((id) => fetchById(Tables.Candidates, id))),
  ])

  const jobMap = new Map<string, DynamoItem>()
  jobItems.forEach((j, i) => { if (j) jobMap.set(jobIds[i], j) })

  const candidateMap = new Map<string, DynamoItem>()
  candidateItems.forEach((c, i) => { if (c) candidateMap.set(candidateIds[i], c) })

  const companyIds = Array.from(
    new Set(
      Array.from(jobMap.values())
        .map((j) => String(j.companyId ?? ''))
        .filter(Boolean),
    ),
  )
  const companyItems = await Promise.all(
    companyIds.map((id) => fetchById(Tables.Companies, id)),
  )
  const companyMap = new Map<string, DynamoItem>()
  companyItems.forEach((c, i) => { if (c) companyMap.set(companyIds[i], c) })

  return applications.map((app) => {
    const jobRaw = jobMap.get(String(app.jobId ?? '')) ?? null
    const candidateRaw = candidateMap.get(String(app.candidateId ?? '')) ?? null
    const companyRaw = jobRaw ? companyMap.get(String(jobRaw.companyId ?? '')) ?? null : null

    const company = jobRaw ? normalizeCompany(companyRaw, String(jobRaw.companyId ?? '')) : null
    const candidate = candidateRaw ? normalizeCandidate(candidateRaw) : null

    return {
      ...app,
      job: jobRaw ? { ...jobRaw, company } : null,
      candidate,
    }
  })
}
