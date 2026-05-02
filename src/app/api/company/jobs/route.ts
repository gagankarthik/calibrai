import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, QueryCommand, PutCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'
import { logAuditEvent } from '@/lib/audit'

const listQuery = z.object({
  status: z.enum(['active', 'paused', 'closed']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const createJobSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  department: z.string().max(100).trim().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  workMode: z.enum(['remote', 'hybrid', 'onsite']),
  level: z.enum(['junior', 'mid', 'senior', 'lead', 'executive']),
  location: z.string().min(1).max(200).trim(),
  salaryMin: z.number().min(0).max(10_000_000).optional(),
  salaryMax: z.number().min(0).max(10_000_000).optional(),
  currency: z.string().length(3).default('USD'),
  description: z.string().min(50).max(10_000).trim(),
  requirements: z.array(z.string().max(500)).max(30).optional(),
  niceToHave: z.array(z.string().max(500)).max(20).optional(),
  skills: z.array(z.string().max(50)).min(1).max(20),
  benefits: z.array(z.string().max(200)).max(20).optional(),
  expiresAt: z.string().datetime().optional(),
}).refine(
  (d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin,
  { message: 'salaryMax must be >= salaryMin', path: ['salaryMax'] },
)

async function getCompanyId(req: NextRequest): Promise<string | null> {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'company')
    return (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const queryParsed = listQuery.safeParse({
    status: searchParams.get('status') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })
  if (!queryParsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: queryParsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.Jobs,
        KeyConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
        ScanIndexForward: false,
      }),
    )
    let items = result.Items ?? []
    if (queryParsed.data.status) {
      items = items.filter((j) => j.status === queryParsed.data.status)
    }
    const { page, limit } = queryParsed.data
    const start = (page - 1) * limit
    return NextResponse.json(items.slice(start, start + limit))
  } catch (err) {
    console.error('[company/jobs GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createJobSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const body = parsed.data

  try {
    const jobId = `j-${uuidv4()}`
    const now = new Date().toISOString()

    const job = {
      companyId,
      jobId,
      ...body,
      department: body.department ?? '',
      currency: body.currency ?? 'USD',
      salaryMin: body.salaryMin ?? 0,
      salaryMax: body.salaryMax ?? 0,
      requirements: body.requirements ?? [],
      niceToHave: body.niceToHave ?? [],
      benefits: body.benefits ?? [],
      postedAt: now,
      expiresAt: body.expiresAt ?? new Date(Date.now() + 30 * 86_400_000).toISOString(),
      applicantCount: 0,
      viewCount: 0,
      status: 'active',
      featured: false,
    }

    await db.send(new PutCommand({ TableName: Tables.Jobs, Item: job }))

    await logAuditEvent({
      action: 'job.created',
      resource: 'job',
      resourceId: jobId,
      userId: companyId,
      companyId,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      newValue: { title: job.title, status: job.status },
    })

    // Trigger candidate discovery in background (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${appUrl}/api/company/jobs/${jobId}/discover-candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({ job }),
    }).catch(() => {})

    return NextResponse.json(job, { status: 201 })
  } catch (err) {
    console.error('[company/jobs POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
