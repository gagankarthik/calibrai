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

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.Users,
        IndexName: 'companyId-index',
        KeyConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
      }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}
