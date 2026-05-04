import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { db, Tables, ScanCommand, PutCommand } from '@/lib/aws/dynamodb'
import { getCompanyIdFromRequest, type SourcerBrief } from '@/lib/server/sourcer'
import { logAuditEvent } from '@/lib/audit'

export const runtime = 'nodejs'

const briefSchema = z.object({
  title: z.string().min(2).max(200).trim(),
  mustHaves: z.array(z.string().max(120)).max(20).default([]),
  niceToHaves: z.array(z.string().max(120)).max(20).default([]),
  location: z.string().max(200).trim().default(''),
  workMode: z.enum(['remote', 'hybrid', 'onsite', 'any']).default('any'),
  experienceMin: z.coerce.number().int().min(0).max(40).default(0),
  experienceMax: z.coerce.number().int().min(0).max(40).default(15),
  signalSources: z.array(z.string().max(40)).max(10).default([]),
  bar: z.string().max(2000).default(''),
})

export async function GET(req: NextRequest) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Scan and filter — small per-company volume; consistent with rest of codebase.
    const result = await db.send(
      new ScanCommand({
        TableName: Tables.SourcerBriefs,
        FilterExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
      }),
    )
    const items = ((result.Items ?? []) as SourcerBrief[]).sort((a, b) =>
      String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')),
    )
    return NextResponse.json(items)
  } catch (err) {
    console.error('[sourcer/briefs GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = briefSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  const body = parsed.data

  if (body.experienceMax < body.experienceMin) {
    return NextResponse.json(
      { error: 'experienceMax must be >= experienceMin' },
      { status: 400 },
    )
  }

  try {
    const id = `br-${uuidv4()}`
    const now = new Date().toISOString()
    const brief: SourcerBrief = {
      id,
      companyId,
      title: body.title,
      mustHaves: body.mustHaves,
      niceToHaves: body.niceToHaves,
      location: body.location,
      workMode: body.workMode,
      experienceMin: body.experienceMin,
      experienceMax: body.experienceMax,
      signalSources: body.signalSources,
      bar: body.bar,
      shortlist: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: brief }))

    await logAuditEvent({
      action: 'sourcer.brief.created',
      resource: 'sourcer-brief',
      resourceId: id,
      userId: companyId,
      companyId,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      newValue: { title: brief.title },
    })

    return NextResponse.json(brief, { status: 201 })
  } catch (err) {
    console.error('[sourcer/briefs POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
