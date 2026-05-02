import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret') ?? req.cookies.get('tb-admin-verified')?.value
  const expectedSecret = process.env.INTERNAL_API_SECRET ?? 'talentbridge-admin'
  if (adminSecret !== expectedSecret && adminSecret !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const search = searchParams.get('search') ?? ''

    const result = await db.send(new ScanCommand({ TableName: Tables.Companies }))
    let items = (result.Items ?? []) as Record<string, unknown>[]

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (c) =>
          String(c.name ?? c.companyName ?? '').toLowerCase().includes(q) ||
          String(c.email ?? '').toLowerCase().includes(q),
      )
    }

    // Sort by createdAt desc
    items.sort((a, b) => {
      const aTime = typeof a.createdAt === 'string' ? a.createdAt : ''
      const bTime = typeof b.createdAt === 'string' ? b.createdAt : ''
      return bTime.localeCompare(aTime)
    })

    const total = items.length
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)

    return NextResponse.json({ companies: paginated, total, page, limit })
  } catch (err) {
    console.error('[admin/companies] error:', err)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
