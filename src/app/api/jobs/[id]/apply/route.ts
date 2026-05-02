import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand, PutCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

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

  try {
    const { coverLetter } = (await req.json()) as { coverLetter?: string }

    const jobScan = await db.send(
      new ScanCommand({
        TableName: Tables.Jobs,
        FilterExpression: 'jobId = :id',
        ExpressionAttributeValues: { ':id': jobId },
      }),
    )
    const job = jobScan.Items?.[0]
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    const applicationId = `app-${uuidv4()}`
    const now = new Date().toISOString()

    const application = {
      applicationId,
      jobId,
      candidateId,
      status: 'applied',
      stage: 'new',
      appliedAt: now,
      updatedAt: now,
      matchScore: 0,
      coverLetter: coverLetter ?? '',
    }

    await db.send(new PutCommand({ TableName: Tables.Applications, Item: application }))

    await db.send(
      new UpdateCommand({
        TableName: Tables.Jobs,
        Key: { companyId: job.companyId, jobId },
        UpdateExpression: 'SET applicantCount = if_not_exists(applicantCount, :zero) + :one',
        ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
      }),
    )

    return NextResponse.json(application, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to apply'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
