import { NextRequest, NextResponse } from 'next/server'
import { verifyCognitoToken } from '@/lib/aws/cognito'

function decodeJwtPayload(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
  } catch { return {} }
}

export async function GET(req: NextRequest) {
  // Try company token first, then talent token
  const companyToken = req.cookies.get('tb-company-token')?.value
  const talentToken  = req.cookies.get('tb-talent-token')?.value
  const token = companyToken ?? talentToken

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await verifyCognitoToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = decodeJwtPayload(token)

  return NextResponse.json({
    id:          (payload['sub']              as string) ?? null,
    email:       (payload['email']            as string) ?? null,
    name:        (payload['name']             as string) ?? null,
    role:        (payload['custom:role']      as string) ?? null,
    companyName: (payload['custom:companyName'] as string) ?? null,
  })
}
