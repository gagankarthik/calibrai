import { NextRequest, NextResponse } from 'next/server'
import { verifyCognitoToken } from '@/lib/aws/cognito'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type JwtPayload = Record<string, unknown>

function decodeJwtPayload(token: string): JwtPayload {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  } catch {
    return {}
  }
}

function isUnexpired(payload: JwtPayload): boolean {
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  return exp > 0 && exp * 1000 > Date.now()
}

async function tryToken(token: string | undefined): Promise<JwtPayload | null> {
  if (!token) return null
  // Cheap local check first — skip verification calls for tokens that are obviously stale.
  const payload = decodeJwtPayload(token)
  if (!isUnexpired(payload)) return null
  try {
    await verifyCognitoToken(token)
    return payload
  } catch {
    return null
  }
}

function noStore(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}

export async function GET(req: NextRequest) {
  const companyToken = req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  // Try BOTH tokens — a stale cookie from one role shouldn't shadow a valid one in the other.
  const payload = (await tryToken(companyToken)) ?? (await tryToken(talentToken))

  if (!payload) {
    return noStore(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  return noStore(
    NextResponse.json({
      id: (payload['sub'] as string) ?? null,
      email: (payload['email'] as string) ?? null,
      name: (payload['name'] as string) ?? null,
      role: (payload['custom:role'] as string) ?? null,
      companyName: (payload['custom:companyName'] as string) ?? null,
    }),
  )
}
