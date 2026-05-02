import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, PutCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await params
  const companyToken = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  const talentToken = req.cookies.get('tb-talent-token')?.value

  let senderId: string | null = null

  if (companyToken) {
    try { const p = await verifyCognitoToken(companyToken, 'company'); senderId = p.sub } catch { /* noop */ }
  }
  if (!senderId && talentToken) {
    try { const p = await verifyCognitoToken(talentToken, 'talent'); senderId = p.sub } catch { /* noop */ }
  }
  if (!senderId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { body, type = 'text' } = (await req.json()) as { body: string; type?: string }

    const messageId = `m-${uuidv4()}`
    const timestamp = new Date().toISOString()

    const message = {
      conversationId,
      messageId,
      senderId,
      content: body,
      timestamp,
      read: false,
      type,
    }

    await db.send(new PutCommand({ TableName: Tables.Messages, Item: message }))

    await db.send(
      new UpdateCommand({
        TableName: Tables.Conversations,
        Key: { conversationId },
        UpdateExpression: 'SET lastMessage = :msg, lastMessageTime = :ts',
        ExpressionAttributeValues: { ':msg': body, ':ts': timestamp },
      }),
    ).catch(() => {})

    return NextResponse.json(message, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
