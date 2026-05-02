import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

async function getCandidateId(req: NextRequest): Promise<string | null> {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-talent-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'talent')
    return payload.sub
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { candidateId } }),
    )
    if (!result.Item) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    return NextResponse.json(result.Item)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const updates = (await req.json()) as Record<string, unknown>

    const updatable = ['headline', 'bio', 'location', 'phone', 'salaryExpectation', 'availability',
      'workPreference', 'skills', 'github', 'linkedin', 'portfolio', 'languages', 'resumeKey']

    const expressions: string[] = ['updatedAt = :ts']
    const names: Record<string, string> = {}
    const values: Record<string, unknown> = { ':ts': new Date().toISOString() }

    updatable.forEach((field) => {
      if (updates[field] !== undefined) {
        expressions.push(`#${field} = :${field}`)
        names[`#${field}`] = field
        values[`:${field}`] = updates[field]
      }
    })

    const result = await db.send(
      new UpdateCommand({
        TableName: Tables.Candidates,
        Key: { candidateId },
        UpdateExpression: `SET ${expressions.join(', ')}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: values,
        ReturnValues: 'ALL_NEW',
      }),
    )

    return NextResponse.json(result.Attributes ?? {})
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
