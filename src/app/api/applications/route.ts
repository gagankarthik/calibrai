import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { hydrateApplications, type DynamoItem } from '@/lib/server/applications'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  const companyToken = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  let candidateId: string | null = null
  let companyId: string | null = null
  let isCompany = false

  if (companyToken) {
    try {
      const payload = await verifyCognitoToken(companyToken, 'company')
      isCompany = true
      companyId = (payload['custom:companyId'] as string) ?? payload.sub
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
    let items: DynamoItem[] = []

    if (isCompany && jobId) {
      // Specific job under this company — also enforce ownership in filter.
      const result = await db.send(
        new QueryCommand({
          TableName: Tables.Applications,
          IndexName: 'jobId-index',
          KeyConditionExpression: 'jobId = :jid',
          FilterExpression: companyId ? 'companyId = :cid' : undefined,
          ExpressionAttributeValues: companyId
            ? { ':jid': jobId, ':cid': companyId }
            : { ':jid': jobId },
        }),
      )
      items = (result.Items as DynamoItem[]) ?? []
    } else if (isCompany) {
      // Whole-company view: only this company's applications, never other companies'.
      if (!companyId) {
        return NextResponse.json({ error: 'Missing companyId on token' }, { status: 403 })
      }
      const result = await db.send(
        new ScanCommand({
          TableName: Tables.Applications,
          FilterExpression: 'companyId = :cid',
          ExpressionAttributeValues: { ':cid': companyId },
        }),
      )
      items = (result.Items as DynamoItem[]) ?? []
    } else if (candidateId) {
      const result = await db.send(
        new QueryCommand({
          TableName: Tables.Applications,
          IndexName: 'candidateId-index',
          KeyConditionExpression: 'candidateId = :cid',
          ExpressionAttributeValues: { ':cid': candidateId },
        }),
      )
      items = (result.Items as DynamoItem[]) ?? []
    }

    items.sort((a, b) =>
      String(b.appliedAt ?? '').localeCompare(String(a.appliedAt ?? '')),
    )

    const hydrated = await hydrateApplications(items)
    return NextResponse.json(hydrated)
  } catch (err) {
    console.error('[applications GET]', err)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
