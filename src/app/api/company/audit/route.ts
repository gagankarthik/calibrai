import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'
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
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500)

  try {
    // Use Scan + filter — avoids requiring a GSI on companyId.
    // userId is the Cognito sub, which equals companyId for company accounts.
    const result = await db.send(
      new ScanCommand({
        TableName: Tables.AuditLogs,
        FilterExpression: 'companyId = :cid OR userId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
      }),
    )

    const items = (result.Items ?? [])
      .sort((a, b) => {
        const ta = String(a.createdAt ?? '')
        const tb = String(b.createdAt ?? '')
        return tb.localeCompare(ta)
      })
      .slice(0, limit)

    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 })
  }
}
