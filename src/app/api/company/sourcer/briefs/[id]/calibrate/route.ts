import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, PutCommand } from '@/lib/aws/dynamodb'
import { getCompanyIdFromRequest, type SourcerBrief } from '@/lib/server/sourcer'

export const runtime = 'nodejs'

const calibrateSchema = z.object({
  candidateId: z.string().min(1),
  vote: z.enum(['up', 'down']),
  note: z.string().max(400).optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = calibrateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const briefRes = await db.send(new GetCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  const brief = briefRes.Item as SourcerBrief | undefined
  if (!brief || brief.companyId !== companyId) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  const now = new Date().toISOString()
  const idx = brief.shortlist.findIndex((e) => e.candidateId === parsed.data.candidateId)
  if (idx === -1) {
    return NextResponse.json({ error: 'Candidate not in shortlist' }, { status: 404 })
  }

  const next: SourcerBrief = {
    ...brief,
    shortlist: brief.shortlist.map((e, i) =>
      i === idx
        ? {
            ...e,
            calibration: {
              vote: parsed.data.vote,
              note: parsed.data.note,
              votedAt: now,
            },
          }
        : e,
    ),
    updatedAt: now,
  }

  await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: next }))
  return NextResponse.json(next)
}

// Clear a calibration signal
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const candidateId = new URL(req.url).searchParams.get('candidateId')
  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 })

  const briefRes = await db.send(new GetCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  const brief = briefRes.Item as SourcerBrief | undefined
  if (!brief || brief.companyId !== companyId) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  const next: SourcerBrief = {
    ...brief,
    shortlist: brief.shortlist.map((e) =>
      e.candidateId === candidateId ? { ...e, calibration: undefined } : e,
    ),
    updatedAt: new Date().toISOString(),
  }
  await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: next }))
  return NextResponse.json(next)
}
