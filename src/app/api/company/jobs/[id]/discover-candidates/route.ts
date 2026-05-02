import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, PutCommand, QueryCommand } from '@/lib/aws/dynamodb'
import { discoverCandidatesForJob } from '@/lib/playwright/candidate-discovery'
import { verifyCognitoToken, extractBearerToken } from '@/lib/aws/cognito'
import type { Job } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const isInternal =
    req.headers.get('x-internal-secret') === (process.env.INTERNAL_API_SECRET ?? '')
    && !!process.env.INTERNAL_API_SECRET // only if secret is non-empty

  let isAuthorized = false
  if (!isInternal) {
    const token =
      extractBearerToken(req.headers.get('Authorization'))
      ?? req.cookies.get('tb-company-token')?.value
    if (token) {
      try {
        await verifyCognitoToken(token, 'company')
        isAuthorized = true
      } catch { isAuthorized = false }
    }
  }

  if (!isInternal && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let job: Job | null = null

    try {
      const body = (await req.json()) as { job?: Job }
      job = body.job ?? null
    } catch {
      // fall through to DB lookup
    }

    if (!job) {
      const result = await db.send(
        new GetCommand({ TableName: Tables.Jobs, Key: { id } }),
      )
      job = (result.Item as Job) ?? null
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const discovered = await discoverCandidatesForJob(job)

    const writePromises = discovered.map((candidate) =>
      db.send(
        new PutCommand({
          TableName: Tables.DiscoveredCandidates,
          Item: { ...candidate, jobId: id },
        }),
      ).catch(() => {}),
    )

    await Promise.allSettled(writePromises)

    return NextResponse.json({ jobId: id, discovered: discovered.length, candidates: discovered })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discovery failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.DiscoveredCandidates,
        KeyConditionExpression: 'jobId = :id',
        ExpressionAttributeValues: { ':id': id },
      }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch discovered candidates' }, { status: 500 })
  }
}
