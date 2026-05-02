import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl } from '@/lib/aws/s3'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let candidateId: string
  try {
    const payload = await verifyCognitoToken(token, 'talent')
    candidateId = payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const { filename, contentType } = (await req.json()) as { filename: string; contentType: string }

    const ext = filename.split('.').pop()
    const key = `resumes/${candidateId}/${Date.now()}.${ext}`

    const url = await getPresignedUploadUrl(key, contentType, 300)

    return NextResponse.json({ url, key })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate upload URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
