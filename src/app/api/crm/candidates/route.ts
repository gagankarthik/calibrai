import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { discoverCandidatesByQuery } from '@/lib/playwright/candidate-discovery'

const discoverSchema = z.object({
  skills: z.array(z.string().max(50).trim()).min(1).max(10),
  location: z.string().max(100).trim().optional(),
})

export const runtime = 'nodejs'
export const maxDuration = 120

// GET — return all CRM-discovered candidates from DynamoDB
// Uses ScanCommand because talentbridge-discovered-candidates uses profileId as PK
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') // 'github' | 'linkedin'

    const result = await db.send(new ScanCommand({ TableName: Tables.DiscoveredCandidates }))

    let candidates = (result.Items ?? []) as Array<Record<string, unknown>>

    // Filter out non-CRM candidates (those tied to a specific jobId that isn't crm-discovery)
    candidates = candidates.filter(c => !c.jobId || c.jobId === 'crm-discovery')

    if (source) candidates = candidates.filter(c => c.source === source)

    candidates.sort((a, b) => {
      const at = (a.discoveredAt as string) ?? ''
      const bt = (b.discoveredAt as string) ?? ''
      return bt.localeCompare(at)
    })

    return NextResponse.json(candidates)
  } catch (err) {
    console.error('[CRM Candidates GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

// POST — trigger GitHub / LinkedIn discovery, persist to DynamoDB, return full list
export async function POST(req: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = discoverSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { skills, location } = parsed.data

  try {
    const candidates = await discoverCandidatesByQuery(skills, location)

    // Save with deduplication — pk = profileId
    const writes = candidates.map(candidate =>
      db
        .send(
          new PutCommand({
            TableName: Tables.DiscoveredCandidates,
            Item: { ...candidate, jobId: 'crm-discovery', pk: candidate.profileId },
            ConditionExpression: 'attribute_not_exists(pk)',
          }),
        )
        .catch(() => {}), // ignore ConditionalCheckFailedException (already exists)
    )
    await Promise.allSettled(writes)

    // Return full updated list
    const result = await db.send(new ScanCommand({ TableName: Tables.DiscoveredCandidates }))
    const allCandidates = ((result.Items ?? []) as Array<Record<string, unknown>>)
      .filter(c => !c.jobId || c.jobId === 'crm-discovery')
      .sort((a, b) => {
        const at = (a.discoveredAt as string) ?? ''
        const bt = (b.discoveredAt as string) ?? ''
        return bt.localeCompare(at)
      })

    return NextResponse.json({ discovered: candidates.length, candidates: allCandidates })
  } catch (err) {
    console.error('[CRM Candidates POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
