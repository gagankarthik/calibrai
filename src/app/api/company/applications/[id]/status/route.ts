import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

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

  try {
    const { status, notes } = (await req.json()) as { status: string; notes?: string }

    const scan = await db.send(
      new ScanCommand({
        TableName: Tables.Applications,
        FilterExpression: 'applicationId = :id',
        ExpressionAttributeValues: { ':id': id },
      }),
    )
    const app = scan.Items?.[0]
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

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

    return NextResponse.json(result.Attributes ?? {})
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
