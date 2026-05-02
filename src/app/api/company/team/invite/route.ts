import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken, cognitoSignUp } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

const inviteSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['admin', 'recruiter', 'interviewer', 'viewer']),
})

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let companyId: string
  try {
    const payload = await verifyCognitoToken(token, 'company')
    companyId = (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { email, role } = parsed.data

  try {
    const tempPassword = `Temp${uuidv4().slice(0, 8)}!`
    await cognitoSignUp(email, tempPassword, 'company', {
      'custom:companyId': companyId,
      'custom:role': role,
      email,
    })

    const member = {
      userId: email,
      email,
      fullName: '',
      role,
      companyId,
      inviteAcceptedAt: null,
      createdAt: new Date().toISOString(),
    }

    await db.send(new PutCommand({ TableName: Tables.Users, Item: member }))

    return NextResponse.json(member, { status: 201 })
  } catch (err) {
    console.error('[company/team/invite POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
