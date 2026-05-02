import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoSignIn } from '@/lib/aws/cognito'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logAuditEvent } from '@/lib/audit'

const signinSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(1).max(128),
})

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`signin-company-${ip}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-in attempts. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
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

    // Decode JWT claims — role and profile info are embedded in the token
    const claims = decodeJwtPayload(authResult.IdToken)
    const role = (claims['custom:role'] as string) ?? 'company'

    if (role !== 'company') {
      return NextResponse.json(
        { error: 'This is a talent account. Please sign in on the talent tab.' },
        { status: 403 },
      )
    }

    const user = {
      id: (claims.sub as string) ?? email,
      email,
      fullName: (claims.name as string) ?? '',
      role,
      companyName: (claims['custom:companyName'] as string) ?? undefined,
    }

    const response = NextResponse.json({
      token: authResult.IdToken,
      accessToken: authResult.AccessToken,
      user,
      company: null,
    })

    // Cognito ID token expires after 1 hour — match the cookie so the browser
    // stops sending it once the JWT inside is no longer valid.
    response.cookies.set('tb-company-token', authResult.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    })

    await logAuditEvent({
      action: 'auth.signin',
      resource: 'session',
      userId: user.id,
      userEmail: email,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return response
  } catch (err) {
    const errName = (err as { name?: string }).name ?? ''
    if (errName === 'NotAuthorizedException' || errName === 'UserNotFoundException') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    if (errName === 'UserNotConfirmedException') {
      return NextResponse.json(
        { error: 'Please verify your email first. Check your inbox for the confirmation code.' },
        { status: 403 },
      )
    }
    console.error('[company/signin]', err)
    return NextResponse.json({ error: 'Sign in failed. Please try again.' }, { status: 500 })
  }
}
