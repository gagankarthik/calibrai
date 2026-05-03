import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, PutCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { logAuditEvent } from '@/lib/audit'

const skillSchema = z.object({
  name: z.string().max(100).trim(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  verified: z.boolean().default(false),
  score: z.number().min(0).max(100).optional(),
})

const experienceSchema = z.object({
  id: z.string(),
  company: z.string().max(200).trim(),
  title: z.string().max(200).trim(),
  startDate: z.string().max(20),
  endDate: z.string().max(20).optional(),
  current: z.boolean(),
  description: z.string().max(5000).trim(),
  skills: z.array(z.string().max(100)).max(20),
})

const educationSchema = z.object({
  id: z.string(),
  institution: z.string().max(200).trim(),
  degree: z.string().max(200).trim(),
  field: z.string().max(200).trim(),
  startDate: z.string().max(20),
  endDate: z.string().max(20),
  gpa: z.number().min(0).max(10).optional(),
})

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
  skills: z.array(skillSchema).max(50).optional(),
  experience: z.array(experienceSchema).max(30).optional(),
  education: z.array(educationSchema).max(20).optional(),
  jobTypes: z.array(z.string().max(50)).max(10).optional(),
  industries: z.array(z.string().max(100)).max(20).optional(),
  noticePeriod: z.string().max(50).optional(),
  resumeUrl: z.string().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().max(500).optional().or(z.literal('')),
}).strict()

async function getTokenPayload(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value
  if (!token) return null
  try {
    return await verifyCognitoToken(token, 'talent')
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const payload = await getTokenPayload(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const candidateId = payload.sub
  const jwtEmail = (payload.email as string) ?? ''
  const jwtName = (payload.name as string) ?? ''

  try {
    const result = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { id: candidateId } }),
    )
    if (!result.Item) {
      const emptyProfile = {
        id: candidateId,
        email: jwtEmail,
        name: jwtName,
        headline: '',
        bio: '',
        location: '',
        skills: [],
        workPreference: [],
        availability: 'open',
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await db.send(new PutCommand({ TableName: Tables.Candidates, Item: emptyProfile }))
      return NextResponse.json(emptyProfile)
    }
    const item = result.Item as Record<string, unknown>
    return NextResponse.json({
      ...item,
      email: (item.email as string) || jwtEmail,
      name: (item.name as string) || jwtName,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const payload = await getTokenPayload(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const candidateId = payload.sub

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

    const updatable = [
      'headline', 'bio', 'location', 'phone', 'salaryExpectation', 'availability',
      'workPreference', 'github', 'linkedin', 'portfolio', 'languages',
      'skills', 'experience', 'education', 'jobTypes', 'industries',
      'noticePeriod', 'resumeUrl', 'avatarUrl',
    ]

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
        Key: { id: candidateId },
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
