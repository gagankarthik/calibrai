import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand, QueryCommand } from '@/lib/aws/dynamodb'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase()
  const workMode = searchParams.getAll('workMode')
  const status = searchParams.get('status') ?? 'active'
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  try {
    // Scan all jobs — in production this would use OpenSearch or a GSI on status
    const result = await db.send(
      new ScanCommand({
        TableName: Tables.Jobs,
        FilterExpression: '#s = :status',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':status': status },
      }),
    )

    let jobs = result.Items ?? []

    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(search) ||
          j.description?.toLowerCase().includes(search) ||
          j.skills?.some((s: string) => s.toLowerCase().includes(search)),
      )
    }
    if (workMode.length) {
      jobs = jobs.filter((j) => workMode.includes(j.workMode))
    }

    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())

    const start = (page - 1) * limit
    return NextResponse.json(jobs.slice(start, start + limit))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch jobs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
