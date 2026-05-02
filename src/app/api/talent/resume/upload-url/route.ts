import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPresignedUploadUrl } from '@/lib/aws/s3'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const resumeUploadSchema = z.object({
  filename: z.string()
    .max(255)
    .regex(/^[a-zA-Z0-9_.\-]+$/, 'Filename must be alphanumeric with dots/dashes only')
    .refine((f) => !f.includes('..'), 'Path traversal not allowed'),
  contentType: z.enum([
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
})

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

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = resumeUploadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { filename, contentType } = parsed.data

  try {
    const ext = filename.split('.').pop()
    const key = `resumes/${candidateId}/${Date.now()}.${ext}`

    const url = await getPresignedUploadUrl(key, contentType, 300)

    return NextResponse.json({ url, key })
  } catch (err) {
    console.error('[talent/resume/upload-url POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
