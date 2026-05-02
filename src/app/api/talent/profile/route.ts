import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { logAuditEvent } from '@/lib/audit'

const updateProfileSchema = z.object({
  headline: z.string().max(200).trim().optional(),
  bio: z.string().max(2000).trim().optional(),
  location: z.string().max(200).trim().optional(),
  phone: z.string().max(20).regex(/^[\d\s+\-().]+$/).optional().or(z.literal('')),
  salaryExpectation: z.number().min(0).max(10_000_000).optional(),
  availability: z.string().max(50).optional(),
  workPreference: z.array(z.enum(['remote', 'hybrid', 'onsite'])).max(3).optional(),
  github: z.string().url().max(200).optional().or(z.literal('')),
  linkedin: z.string().url().max(200).optional().or(z.literal('')),
  portfolio: z.string().url().max(200).optional().or(z.literal('')),
  languages: z.array(z.string().max(50)).max(20).optional(),
}).strict()

async function getCandidateId(req: NextRequest): Promise<string | null> {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'talent')
    return payload.sub
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { candidateId } }),
    )
    if (!result.Item) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    return NextResponse.json(result.Item)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateProfileSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const updates = parsed.data as Record<string, unknown>

    const updatable = ['headline', 'bio', 'location', 'phone', 'salaryExpectation', 'availability',
      'workPreference', 'github', 'linkedin', 'portfolio', 'languages']

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
        TableName: Tables.Candidates,
        Key: { candidateId },
        UpdateExpression: `SET ${expressions.join(', ')}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    )

    await logAuditEvent({
      action: 'talent_profile.updated',
      resource: 'talent_profile',
      resourceId: candidateId,
      userId: candidateId,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json(result.Attributes ?? {})
  } catch (err) {
    console.error('[talent/profile PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
