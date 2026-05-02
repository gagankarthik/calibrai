import { NextRequest, NextResponse } from 'next/server'
import { cognitoSignOut, extractBearerToken } from '@/lib/aws/cognito'

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

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('tb-company-token')
  response.cookies.delete('tb-talent-token')
  return response
}
