import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { z } from 'zod'

async function getTokenPayload(req: NextRequest) {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
  if (!token) return null
  try {
    return await verifyCognitoToken(token, 'company')
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const payload = await getTokenPayload(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const companyId = (payload['custom:companyId'] as string) ?? (payload.sub as string)
  // JWT claims available as fallback when no DB record exists yet
  const jwtName = (payload['custom:companyName'] as string) ?? ''
  const jwtEmail = (payload.email as string) ?? ''

  try {
    const result = await db.send(
      new GetCommand({ TableName: Tables.Companies, Key: { id: companyId } }),
    )

    if (!result.Item) {
      // No profile saved yet — return JWT-derived skeleton so the form pre-fills
      return NextResponse.json({ id: companyId, name: jwtName, email: jwtEmail })
    }

    const item = result.Item as Record<string, unknown>
    // Ensure name is never blank when JWT has it (handles records saved before name was set)
    return NextResponse.json({
      ...item,
      name: (item.name as string) || jwtName,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

const profileSchema = z.object({
  name: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  website: z.string().max(500).optional(),
  hq: z.string().max(200).optional(),
  founded: z.string().max(10).optional(),
  description: z.string().max(2000).optional(),
})

export async function PUT(req: NextRequest) {
  const payload = await getTokenPayload(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const companyId = (payload['custom:companyId'] as string) ?? (payload.sub as string)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const data = parsed.data

  try {
    await db.send(
      new UpdateCommand({
        TableName: Tables.Companies,
        Key: { id: companyId },
        UpdateExpression:
          'SET #n = :name, industry = :industry, #sz = :size, website = :website, hq = :hq, founded = :founded, description = :description, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#n': 'name', '#sz': 'size' },
        ExpressionAttributeValues: {
          ':name': data.name ?? '',
          ':industry': data.industry ?? '',
          ':size': data.size ?? '',
          ':website': data.website ?? '',
          ':hq': data.hq ?? '',
          ':founded': data.founded ?? '',
          ':description': data.description ?? '',
          ':updatedAt': new Date().toISOString(),
        },
      }),
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
