import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, DeleteCommand } from '@/lib/aws/dynamodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function isAuthed(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const headerOk = !!adminPassword && req.headers.get('x-admin-password') === adminPassword
  const cookieOk = req.cookies.get('tb-admin-verified')?.value === 'true'
  return headerOk || cookieOk
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    await db.send(
      new DeleteCommand({
        TableName: Tables.CrmJobs,
        Key: { pk: id },
      }),
    )
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    console.error('[admin/crm/jobs DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
