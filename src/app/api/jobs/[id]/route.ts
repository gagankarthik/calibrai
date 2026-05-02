import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, UpdateCommand } from '@/lib/aws/dynamodb'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await db.send(new GetCommand({ TableName: Tables.Jobs, Key: { id } }))
    const job = result.Item
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Async view count increment (best-effort)
    db.send(
      new UpdateCommand({
        TableName: Tables.Jobs,
        Key: { id },
        UpdateExpression: 'SET viewCount = if_not_exists(viewCount, :zero) + :one',
        ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
      }),
    ).catch(() => {})

    return NextResponse.json(job)
  } catch (err) {
    console.error('[jobs/[id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}
