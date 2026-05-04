import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, PutCommand, DeleteCommand } from '@/lib/aws/dynamodb'
import { getCompanyIdFromRequest, type SourcerBrief } from '@/lib/server/sourcer'

export const runtime = 'nodejs'

const patchSchema = z.object({
  title: z.string().min(2).max(200).trim().optional(),
  mustHaves: z.array(z.string().max(120)).max(20).optional(),
  niceToHaves: z.array(z.string().max(120)).max(20).optional(),
  location: z.string().max(200).trim().optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite', 'any']).optional(),
  experienceMin: z.coerce.number().int().min(0).max(40).optional(),
  experienceMax: z.coerce.number().int().min(0).max(40).optional(),
  signalSources: z.array(z.string().max(40)).max(10).optional(),
  bar: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'paused']).optional(),
})

async function loadOwnedBrief(id: string, companyId: string): Promise<SourcerBrief | null> {
  const res = await db.send(new GetCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  const brief = res.Item as SourcerBrief | undefined
  if (!brief || brief.companyId !== companyId) return null
  return brief
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const brief = await loadOwnedBrief(id, companyId)
  if (!brief) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(brief)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const brief = await loadOwnedBrief(id, companyId)
  if (!brief) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const next: SourcerBrief = {
    ...brief,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  }
  await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: next }))
  return NextResponse.json(next)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const brief = await loadOwnedBrief(id, companyId)
  if (!brief) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.send(new DeleteCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  return NextResponse.json({ ok: true })
}
