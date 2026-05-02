import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, PutCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

const applySchema = z.object({
  coverLetter: z.string().max(5000).trim().optional(),
})

function sanitizeText(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value

  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

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

  const parsed = applySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const coverLetter = parsed.data.coverLetter ? sanitizeText(parsed.data.coverLetter) : ''

  try {
    const jobResult = await db.send(new GetCommand({ TableName: Tables.Jobs, Key: { id: jobId } }))
    const job = jobResult.Item
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const applicationId = `app-${uuidv4()}`
    const now = new Date().toISOString()

    const application = {
      id: applicationId,
      jobId,
      candidateId,
      companyId: job.companyId,
      status: 'applied',
      stage: 'new',
      appliedAt: now,
      updatedAt: now,
      matchScore: 0,
      coverLetter,
    }

    await db.send(new PutCommand({ TableName: Tables.Applications, Item: application }))

    await db.send(
      new UpdateCommand({
        TableName: Tables.Jobs,
        Key: { id: jobId },
        UpdateExpression: 'SET applicantCount = if_not_exists(applicantCount, :zero) + :one',
        ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
      }),
    )

    return NextResponse.json(application, { status: 201 })
  } catch (err) {
    console.error('[jobs/[id]/apply POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
