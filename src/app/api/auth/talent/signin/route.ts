import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoSignIn } from '@/lib/aws/cognito'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const signinSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(1).max(128),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`signin-talent-${ip}`, 5, 60_000) // 5 attempts per minute
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
    const authResult = await cognitoSignIn(email, password, 'talent')
    if (!authResult?.IdToken) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Get talent profile from DynamoDB
    const candidateResult = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { candidateId: email } }),
    )
    const talent = candidateResult.Item ?? null

    const response = NextResponse.json({
      token: authResult.IdToken,
      accessToken: authResult.AccessToken,
      talent,
    })

    response.cookies.set('tb-talent-token', authResult.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('NotAuthorizedException') || message.includes('UserNotFoundException')) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    console.error('[talent/signin]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
