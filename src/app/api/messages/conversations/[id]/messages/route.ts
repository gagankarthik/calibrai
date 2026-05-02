import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'

const messageSchema = z.object({
  body: z.string().min(1).max(5000).trim(),
  type: z.enum(['text', 'interview_request']).default('text'),
})

function sanitizeText(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim()
}

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

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = messageSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { body: rawMessage, type } = parsed.data
  const sanitizedBody = sanitizeText(rawMessage)

  try {

    const messageId = `m-${uuidv4()}`
    const timestamp = new Date().toISOString()

    const message = {
      conversationId,
      messageId,
      senderId,
      content: sanitizedBody,
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
        ExpressionAttributeValues: { ':msg': sanitizedBody, ':ts': timestamp },
      }),
    ).catch(() => {})

    return NextResponse.json(message, { status: 201 })
  } catch (err) {
    console.error('[messages/conversations/[id]/messages POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
