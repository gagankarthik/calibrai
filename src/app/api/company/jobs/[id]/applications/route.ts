import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.Applications,
        IndexName: 'jobId-index',
        KeyConditionExpression: 'jobId = :jid',
        ExpressionAttributeValues: { ':jid': id },
        ScanIndexForward: false,
      }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch (err) {
    console.error('[company/jobs/[id]/applications GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
