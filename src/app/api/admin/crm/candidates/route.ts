import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '24', 10)

    const result = await db.send(new ScanCommand({ TableName: Tables.DiscoveredCandidates }))
    let items = (result.Items ?? []) as Record<string, unknown>[]

    if (source) {
      items = items.filter((c) =>
        String(c.source ?? '').toLowerCase().includes(source.toLowerCase()),
      )
    }

    items.sort((a, b) => {
      const aTime = typeof a.createdAt === 'string' ? a.createdAt : ''
      const bTime = typeof b.createdAt === 'string' ? b.createdAt : ''
      return bTime.localeCompare(aTime)
    })

    const total = items.length
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)

    return NextResponse.json({ candidates: paginated, total, page, limit })
  } catch (err) {
    console.error('[admin/crm/candidates] error:', err)
    return NextResponse.json({ error: 'Failed to fetch CRM candidates' }, { status: 500 })
  }
}
