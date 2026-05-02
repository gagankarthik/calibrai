import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, ScanCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { logAuditEvent } from '@/lib/audit'

const statusSchema = z.object({
  status: z.enum(['applied', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected']),
  notes: z.string().max(1000).trim().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyCognitoToken(token, 'company')
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { status, notes } = parsed.data

  try {
    const scan = await db.send(
      new ScanCommand({
        TableName: Tables.Applications,
        FilterExpression: 'applicationId = :id',
        ExpressionAttributeValues: { ':id': id },
      }),
    )
    const app = scan.Items?.[0]
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const oldStatus = app.status as string | undefined

    const stageMap: Record<string, string> = {
      applied: 'new',
      screening: 'screening',
      interview: 'phone_screen',
      technical: 'technical',
      offer: 'offer',
      hired: 'hired',
      rejected: 'rejected',
    }

    const result = await db.send(
      new UpdateCommand({
        TableName: Tables.Applications,
        Key: { jobId: app.jobId, applicationId: id },
        UpdateExpression: 'SET #s = :status, stage = :stage, updatedAt = :ts' + (notes ? ', notes = :notes' : ''),
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':status': status,
          ':stage': stageMap[status] ?? status,
          ':ts': new Date().toISOString(),
          ...(notes ? { ':notes': notes } : {}),
        },
        ReturnValues: 'ALL_NEW',
      }),
    )

    await logAuditEvent({
      action: 'application.status_changed',
      resource: 'application',
      resourceId: id,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      oldValue: { status: oldStatus },
      newValue: { status },
    })

    return NextResponse.json(result.Attributes ?? {})
  } catch (err) {
    console.error('[company/applications/[id]/status PATCH]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
