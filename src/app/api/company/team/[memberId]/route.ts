import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, DeleteCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let companyId: string
  try {
    const payload = await verifyCognitoToken(token, 'company')
    companyId = (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { memberId: rawMemberId } = await params
  const memberId = decodeURIComponent(rawMemberId)

  try {
    await db.send(
      new DeleteCommand({
        TableName: Tables.Users,
        Key: { userId: memberId },
        ConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
      }),
    )
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'ConditionalCheckFailedException') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
