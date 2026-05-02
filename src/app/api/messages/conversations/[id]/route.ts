import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, QueryCommand } from '@/lib/aws/dynamodb'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const [convoResult, msgsResult] = await Promise.all([
      db.send(new GetCommand({ TableName: Tables.Conversations, Key: { conversationId: id } })),
      db.send(
        new QueryCommand({
          TableName: Tables.Messages,
          KeyConditionExpression: 'conversationId = :cid',
          ExpressionAttributeValues: { ':cid': id },
          ScanIndexForward: true,
        }),
      ),
    ])

    if (!convoResult.Item) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    return NextResponse.json({
      ...convoResult.Item,
      messages: msgsResult.Items ?? [],
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}
