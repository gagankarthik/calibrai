import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken, cognitoSignUp } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

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

  try {
    const { email, role } = (await req.json()) as { email: string; role: string }

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
    const message = err instanceof Error ? err.message : 'Failed to invite'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
