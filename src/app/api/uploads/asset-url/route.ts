import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPresignedUploadUrl } from '@/lib/aws/s3'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

const uploadSchema = z.object({
  entityType: z.enum(['company', 'talent']),
  entityId: z.string().uuid().or(z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/)),
  filename: z.string()
    .max(255)
    .regex(/^[a-zA-Z0-9_.\-]+$/, 'Filename must be alphanumeric with dots/dashes only')
    .refine((f) => !f.includes('..'), 'Path traversal not allowed'),
  contentType: z.enum([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
})

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

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = uploadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { entityType, entityId, filename, contentType } = parsed.data

  try {
    const ext = filename.split('.').pop()
    const key = `${entityType}/${entityId}/${Date.now()}.${ext}`
    const url = await getPresignedUploadUrl(key, contentType, 300)

    return NextResponse.json({ url, key })
  } catch (err) {
    console.error('[uploads/asset-url POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
