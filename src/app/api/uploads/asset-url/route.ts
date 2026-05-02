import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/aws/s3'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function POST(req: NextRequest) {
  const companyToken = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  let userId: string | null = null

  if (companyToken) {
    try { const p = await verifyCognitoToken(companyToken, 'company'); userId = p.sub } catch { /* noop */ }
  }
  if (!userId && talentToken) {
    try { const p = await verifyCognitoToken(talentToken, 'talent'); userId = p.sub } catch { /* noop */ }
  }
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { entityType, entityId, filename, contentType } = (await req.json()) as {
      entityType: string
      entityId: string
      filename: string
      contentType: string
    }

    const ext = filename.split('.').pop()
    const key = `${entityType}/${entityId}/${Date.now()}.${ext}`
    const url = await getPresignedUploadUrl(key, contentType, 300)

    return NextResponse.json({ url, key })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }
}
