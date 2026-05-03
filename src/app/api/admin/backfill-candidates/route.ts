import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@/lib/aws/dynamodb'
import { cognitoGetUser } from '@/lib/aws/cognito'

interface BackfillResult {
  scanned: number
  uniqueCandidates: number
  created: number
  updated: number
  skipped: number
  failed: Array<{ id: string; reason: string }>
}

async function fetchCognitoIdentity(candidateId: string): Promise<{ name: string; email: string } | null> {
  try {
    const res = await cognitoGetUser(candidateId)
    const attrs = res.UserAttributes ?? []
    const name = attrs.find((a) => a.Name === 'name')?.Value ?? ''
    const email = attrs.find((a) => a.Name === 'email')?.Value ?? ''
    if (!name && !email) return null
    return { name, email }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const provided = req.headers.get('x-admin-password') ?? ''
  if (!adminPassword || provided !== adminPassword) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const result: BackfillResult = {
    scanned: 0,
    uniqueCandidates: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: [],
  }

  try {
    // 1. Scan all applications, paging through any LastEvaluatedKey
    const seen = new Set<string>()
    let lastKey: Record<string, unknown> | undefined
    do {
      const page = await db.send(
        new ScanCommand({
          TableName: Tables.Applications,
          ExclusiveStartKey: lastKey as Record<string, never> | undefined,
        }),
      )
      const items = (page.Items ?? []) as Array<{ candidateId?: string }>
      result.scanned += items.length
      for (const a of items) {
        if (a.candidateId) seen.add(String(a.candidateId))
      }
      lastKey = page.LastEvaluatedKey as Record<string, unknown> | undefined
    } while (lastKey)

    result.uniqueCandidates = seen.size

    // 2. For each candidateId, ensure the Candidates row has name + email
    for (const candidateId of seen) {
      try {
        const existing = await db.send(
          new GetCommand({ TableName: Tables.Candidates, Key: { id: candidateId } }),
        )
        const item = existing.Item as Record<string, unknown> | undefined

        const haveName = !!(item?.name as string)
        const haveEmail = !!(item?.email as string)

        if (item && haveName && haveEmail) {
          result.skipped += 1
          continue
        }

        const identity = await fetchCognitoIdentity(candidateId)
        if (!identity) {
          result.failed.push({ id: candidateId, reason: 'Cognito user not found' })
          continue
        }

        const now = new Date().toISOString()

        if (!item) {
          await db.send(
            new PutCommand({
              TableName: Tables.Candidates,
              Item: {
                id: candidateId,
                email: identity.email,
                name: identity.name,
                headline: '',
                bio: '',
                location: '',
                skills: [],
                workPreference: [],
                availability: 'open',
                verified: false,
                createdAt: now,
                updatedAt: now,
              },
            }),
          )
          result.created += 1
        } else {
          const setName = !haveName && identity.name
          const setEmail = !haveEmail && identity.email
          if (!setName && !setEmail) {
            result.skipped += 1
            continue
          }
          await db.send(
            new UpdateCommand({
              TableName: Tables.Candidates,
              Key: { id: candidateId },
              UpdateExpression:
                'SET' +
                (setName ? ' #n = :name,' : '') +
                (setEmail ? ' email = :email,' : '') +
                ' updatedAt = :ts',
              ExpressionAttributeNames: setName ? { '#n': 'name' } : undefined,
              ExpressionAttributeValues: {
                ...(setName ? { ':name': identity.name } : {}),
                ...(setEmail ? { ':email': identity.email } : {}),
                ':ts': now,
              },
            }),
          )
          result.updated += 1
        }
      } catch (err) {
        result.failed.push({ id: candidateId, reason: err instanceof Error ? err.message : 'unknown' })
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[admin/backfill-candidates]', err)
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}
