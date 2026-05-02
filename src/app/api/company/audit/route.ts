import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let companyId: string
  try {
    const payload = await verifyCognitoToken(token, 'company')
    companyId = (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.AuditLogs,
        KeyConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
        ScanIndexForward: false,
        Limit: limit,
      }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}
