import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { discoverJobsForCrm } from '@/lib/playwright/job-discovery'

const scrapeSchema = z.object({
  keywords: z.array(z.string().max(50).trim()).min(1).max(10),
  location: z.string().max(100).trim().optional(),
})

export const runtime = 'nodejs'
export const maxDuration = 120

// GET — return all scraped CRM jobs from DynamoDB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const source = searchParams.get('source') // 'remoteok' | 'linkedin' | 'remotive' | 'ycombinator'
    const remote = searchParams.get('remote')  // 'true'

    // Scan full table — CrmJobs uses jobId as PK, so we scan
    const result = await db.send(new ScanCommand({ TableName: Tables.CrmJobs }))
    let jobs = (result.Items ?? []) as Array<Record<string, unknown>>

    if (source) jobs = jobs.filter(j => j.source === source)
    if (remote === 'true') jobs = jobs.filter(j => j.remote === true)

    jobs.sort((a, b) => {
      const at = (a.scrapedAt as string) ?? ''
      const bt = (b.scrapedAt as string) ?? ''
      return bt.localeCompare(at)
    })

    return NextResponse.json(jobs)
  } catch (err) {
    console.error('[CRM Jobs GET]', err)
    return NextResponse.json([], { status: 200 })
  }
}

// POST — trigger scraping (RemoteOK + Remotive + HN + LinkedIn), persist to DynamoDB
export async function POST(req: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = scrapeSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { keywords, location } = parsed.data

  try {
    const jobs = await discoverJobsForCrm(keywords, location)

    // Save each job with deduplication — skip if already exists (pk = jobId)
    const writes = jobs.map(job =>
      db
        .send(
          new PutCommand({
            TableName: Tables.CrmJobs,
            Item: { ...job, pk: job.jobId },
            ConditionExpression: 'attribute_not_exists(pk)',
          }),
        )
        .catch(() => {}), // ignore ConditionalCheckFailedException (already exists)
    )
    await Promise.allSettled(writes)

    // Return fresh list from DB so the client always sees the full dataset
    const result = await db.send(new ScanCommand({ TableName: Tables.CrmJobs }))
    const allJobs = (result.Items ?? []).sort((a, b) => {
      const at = (a.scrapedAt as string) ?? ''
      const bt = (b.scrapedAt as string) ?? ''
      return bt.localeCompare(at)
    })

    return NextResponse.json({ scraped: jobs.length, jobs: allJobs })
  } catch (err) {
    console.error('[CRM Jobs POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
