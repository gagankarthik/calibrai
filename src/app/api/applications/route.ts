import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  // Try company token first, then talent token
  const companyToken = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  let candidateId: string | null = null
  let isCompany = false

  if (companyToken) {
    try {
      await verifyCognitoToken(companyToken, 'company')
      isCompany = true
    } catch { /* try talent */ }
  }

  if (!isCompany && talentToken) {
    try {
      const payload = await verifyCognitoToken(talentToken, 'talent')
      candidateId = payload.sub
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!isCompany && !candidateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (isCompany && jobId) {
      const result = await db.send(
        new QueryCommand({
          TableName: Tables.Applications,
          KeyConditionExpression: 'jobId = :jid',
          ExpressionAttributeValues: { ':jid': jobId },
        }),
      )
      return NextResponse.json(result.Items ?? [])
    }

    if (candidateId) {
      // Query by candidateId GSI
      const result = await db.send(
        new QueryCommand({
          TableName: Tables.Applications,
          IndexName: 'candidateId-appliedAt-index',
          KeyConditionExpression: 'candidateId = :cid',
          ExpressionAttributeValues: { ':cid': candidateId },
          ScanIndexForward: false,
        }),
      )
      return NextResponse.json(result.Items ?? [])
    }

    // Company with no jobId filter — scan all (limited)
    const result = await db.send(
      new ScanCommand({ TableName: Tables.Applications, Limit: 100 }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
