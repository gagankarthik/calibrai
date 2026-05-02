import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCognitoToken } from '@/lib/aws/cognito'
import { db, Tables, QueryCommand, UpdateCommand } from '@/lib/aws/dynamodb'

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return {}
  }
}

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('tb-talent-token')?.value
  if (!token) return null
  try {
    await verifyCognitoToken(token, 'talent')
    const claims = decodeJwtPayload(token)
    return (claims.sub as string) ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await db.send(new QueryCommand({
      TableName: Tables.Notifications,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': userId },
      ScanIndexForward: false,
      Limit: 50,
    }))
    return NextResponse.json({ notifications: res.Items ?? [] })
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { ids?: string[]; markAll?: boolean }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.markAll) {
    try {
      const res = await db.send(new QueryCommand({
        TableName: Tables.Notifications,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        FilterExpression: 'attribute_not_exists(readAt)',
        ExpressionAttributeValues: { ':uid': userId },
      }))
      const unread = res.Items ?? []
      await Promise.all(unread.map((n: Record<string, unknown>) =>
        db.send(new UpdateCommand({
          TableName: Tables.Notifications,
          Key: { id: n.id },
          UpdateExpression: 'SET readAt = :now',
          ExpressionAttributeValues: { ':now': new Date().toISOString() },
        }))
      ))
    } catch {
      // table may not exist yet
    }
  }

  return NextResponse.json({ ok: true })
}
