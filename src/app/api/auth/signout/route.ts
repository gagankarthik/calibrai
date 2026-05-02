import { NextRequest, NextResponse } from 'next/server'
import { cognitoSignOut, extractBearerToken } from '@/lib/aws/cognito'
import { logAuditEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const accessToken = extractBearerToken(authHeader)

  if (accessToken) {
    try {
      await cognitoSignOut(accessToken)
    } catch {
      // Best-effort global sign-out
    }
  }

  await logAuditEvent({
    action: 'auth.signout',
    resource: 'session',
    ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
  })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('tb-company-token', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  response.cookies.set('tb-talent-token', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  return response
}
