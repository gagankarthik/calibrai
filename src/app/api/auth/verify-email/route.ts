import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoConfirmSignUp } from '@/lib/aws/cognito'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email().max(254),
  code: z.string().length(6).regex(/^\d{6}$/),
  role: z.enum(['company', 'talent']),
})

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`verify-${ip}`, 10, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, code, role } = parsed.data

  try {
    await cognitoConfirmSignUp(email, code, role)
    return NextResponse.json({ message: 'Email verified successfully.' }, { status: 200 })
  } catch (err: unknown) {
    console.error('[auth/verify-email]', err)
    const name = (err as { name?: string }).name
    if (name === 'CodeMismatchException') {
      return NextResponse.json({ error: 'Incorrect verification code.' }, { status: 400 })
    }
    if (name === 'ExpiredCodeException') {
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 })
    }
    if (name === 'NotAuthorizedException') {
      return NextResponse.json({ error: 'Account is already verified.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
