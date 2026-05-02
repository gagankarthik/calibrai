import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand, UpdateCommand } from '@/lib/aws/dynamodb'

async function findJobById(jobId: string) {
  const result = await db.send(
    new ScanCommand({
      TableName: Tables.Jobs,
      FilterExpression: 'jobId = :id',
      ExpressionAttributeValues: { ':id': jobId },
    }),
  )
  return result.Items?.[0] ?? null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const job = await findJobById(id)
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Async view count increment
    if (job.companyId) {
      db.send(
        new UpdateCommand({
          TableName: Tables.Jobs,
          Key: { companyId: job.companyId, jobId: id },
          UpdateExpression: 'SET viewCount = if_not_exists(viewCount, :zero) + :one',
          ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
        }),
      ).catch(() => {})
    }

    return NextResponse.json(job)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}
