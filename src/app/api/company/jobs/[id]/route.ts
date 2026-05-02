import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { logAuditEvent } from '@/lib/audit'

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  description: z.string().min(50).max(10_000).trim().optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  requirements: z.array(z.string().max(500)).max(30).optional(),
  featured: z.boolean().optional(),
}).strict()

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await db.send(new GetCommand({ TableName: Tables.Jobs, Key: { id } }))
    if (!result.Item) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json(result.Item)
  } catch (err) {
    console.error('[company/jobs/[id] GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateJobSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const updates = parsed.data as Record<string, unknown>
    const updatable = ['title', 'description', 'status', 'skills', 'requirements', 'salaryMin', 'salaryMax', 'featured']
    const expressions: string[] = ['updatedAt = :ts']
    const names: Record<string, string> = {}
    const values: Record<string, unknown> = { ':ts': new Date().toISOString() }

    updatable.forEach((field) => {
      if (updates[field] !== undefined) {
        expressions.push(`#${field} = :${field}`)
        names[`#${field}`] = field
        values[`:${field}`] = updates[field]
      }
    })

    const result = await db.send(
      new UpdateCommand({
        TableName: Tables.Jobs,
        Key: { id },
        ConditionExpression: 'companyId = :cid',
        UpdateExpression: `SET ${expressions.join(', ')}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: { ...values, ':cid': companyId },
        ReturnValues: 'ALL_NEW',
      }),
    )

    await logAuditEvent({
      action: 'job.updated',
      resource: 'job',
      resourceId: id,
      userId: companyId,
      companyId,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json(result.Attributes ?? {})
  } catch (err) {
    console.error('[company/jobs/[id] PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await db.send(
      new UpdateCommand({
        TableName: Tables.Jobs,
        Key: { id },
        ConditionExpression: 'companyId = :cid',
        UpdateExpression: 'SET #s = :closed, updatedAt = :ts',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':closed': 'closed', ':ts': new Date().toISOString(), ':cid': companyId },
      }),
    )

    await logAuditEvent({
      action: 'job.deleted',
      resource: 'job',
      resourceId: id,
      userId: companyId,
      companyId,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[company/jobs/[id] DELETE]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
