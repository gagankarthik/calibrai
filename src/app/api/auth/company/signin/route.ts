import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoSignIn } from '@/lib/aws/cognito'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logAuditEvent } from '@/lib/audit'

const signinSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(1).max(128),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`signin-company-${ip}`, 5, 60_000) // 5 attempts per minute
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = signinSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { email, password } = parsed.data

  try {
    const authResult = await cognitoSignIn(email, password, 'company')
    if (!authResult?.IdToken) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get company record from DynamoDB using the user's email
    const usersResult = await db.send(
      new GetCommand({ TableName: Tables.Users, Key: { userId: email } }),
    )
    const userRecord = usersResult.Item

    let company = null
    if (userRecord?.companyId) {
      const companyResult = await db.send(
        new GetCommand({ TableName: Tables.Companies, Key: { companyId: userRecord.companyId } }),
      )
      company = companyResult.Item ?? null
    }

    const response = NextResponse.json({
      token: authResult.IdToken,
      accessToken: authResult.AccessToken,
      company,
      user: {
        id: userRecord?.userId ?? email,
        email,
        fullName: userRecord?.fullName ?? '',
        role: userRecord?.role ?? 'admin',
        companyId: userRecord?.companyId,
      },
    })

    // Set httpOnly cookie for server-side auth checks
    response.cookies.set('tb-company-token', authResult.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
      path: '/',
    })

    await logAuditEvent({
      action: 'auth.signin',
      resource: 'session',
      userId: userRecord?.userId ?? undefined,
      userEmail: email,
      companyId: userRecord?.companyId ?? undefined,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('NotAuthorizedException') || message.includes('UserNotFoundException')) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    console.error('[company/signin]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
