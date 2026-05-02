import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
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
      new GetCommand({ TableName: Tables.Candidates, Key: { candidateId: id } }),
    )
    if (!result.Item) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    return NextResponse.json(result.Item)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
  }
}
