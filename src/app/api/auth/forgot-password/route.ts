import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cognitoForgotPassword } from '@/lib/aws/cognito'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  email: z.string().email().max(254),
  role: z.enum(['company', 'talent']),
})

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = rateLimit(`forgot-${ip}`, 3, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  try {
    await cognitoForgotPassword(parsed.data.email, parsed.data.role)
    // Always return success to avoid email enumeration
    return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' }, { status: 200 })
  } catch (err) {
    console.error('[auth/forgot-password]', err)
    return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' }, { status: 200 })
  }
}
