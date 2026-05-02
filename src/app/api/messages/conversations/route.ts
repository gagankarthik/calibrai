import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest) {
  const companyToken = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  let userId: string | null = null

  if (companyToken) {
    try {
      const p = await verifyCognitoToken(companyToken, 'company')
      userId = p.sub
    } catch { /* try talent */ }
  }
  if (!userId && talentToken) {
    try {
      const p = await verifyCognitoToken(talentToken, 'talent')
      userId = p.sub
    } catch { /* noop */ }
  }

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db.send(
      new ScanCommand({
        TableName: Tables.Conversations,
        FilterExpression: 'participant1Id = :uid OR participant2Id = :uid',
        ExpressionAttributeValues: { ':uid': userId },
      }),
    )
    const convos = (result.Items ?? []).sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime(),
    )
    return NextResponse.json(convos)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
