import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoSignUp } from '@/lib/aws/cognito'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(100).trim(),
  role: z.enum(['company', 'talent']),
  companyName: z.string().min(1).max(200).trim().optional(),
})

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`register-${ip}`, 5, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, password, fullName, role, companyName } = parsed.data

  try {
    const attributes: Record<string, string> = {
      email,
      name: fullName,
      'custom:role': role,
    }
    if (role === 'company' && companyName) {
      attributes['custom:companyName'] = companyName
    }

    await cognitoSignUp(email, password, role, attributes)

    return NextResponse.json({ message: 'Account created. Check your email for the verification code.' }, { status: 201 })
  } catch (err: unknown) {
    console.error('[auth/register]', err)
    const code = (err as { name?: string }).name
    if (code === 'UsernameExistsException') {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
    if (code === 'InvalidPasswordException') {
      return NextResponse.json({ error: 'Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, and a number.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
