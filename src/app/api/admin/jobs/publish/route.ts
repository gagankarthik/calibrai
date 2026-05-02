import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, PutCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { v4 as uuidv4 } from 'uuid'

const jobSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  location: z.string().max(200).default(''),
  salary: z.string().max(100).optional(),
  skills: z.array(z.string().max(50)).max(20).default([]),
  description: z.string().max(5000).default(''),
  url: z.string().max(500).default(''),
  remote: z.boolean().default(false),
})

const schema = z.object({
  jobs: z.array(jobSchema).min(1).max(50),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  }

  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const writes = parsed.data.jobs.map(async (job) => {
    const jobId = `hc-${uuidv4()}`
    const item = {
      companyId: 'hiring_cafe_sourced',
      jobId,
      title: job.title,
      company: {
        id: 'hiring_cafe_sourced',
        name: job.company,
        logo: '',
        industry: 'Technology',
        size: 'Unknown',
        location: job.location,
        website: '',
        description: '',
        culture: [],
        benefits: [],
        rating: 0,
        reviewCount: 0,
        verified: false,
        plan: 'starter',
      },
      department: '',
      type: 'full-time',
      workMode: job.remote ? 'remote' : 'hybrid',
      level: 'mid',
      location: job.location,
      salaryMin: 0,
      salaryMax: 0,
      currency: 'USD',
      description: job.description,
      requirements: [],
      niceToHave: [],
      skills: job.skills,
      benefits: [],
      postedAt: now,
      expiresAt,
      applicantCount: 0,
      viewCount: 0,
      status: 'active',
      featured: false,
      source: 'hiring_cafe',
      sourceUrl: job.url,
    }
    await db.send(new PutCommand({ TableName: Tables.Jobs, Item: item }))
    return jobId
  })

  const results = await Promise.allSettled(writes)
  const published = results.filter(r => r.status === 'fulfilled').length
  const errors = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ published, errors }, { status: 201 })
}

// GET — list already-published hiring.cafe jobs
export async function GET() {
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: Tables.Jobs,
        FilterExpression: '#src = :src',
        ExpressionAttributeNames: { '#src': 'source' },
        ExpressionAttributeValues: { ':src': 'hiring_cafe' },
      }),
    )
    const items = (result.Items ?? []).sort(
      (a, b) => new Date(b.postedAt ?? '').getTime() - new Date(a.postedAt ?? '').getTime(),
    )
    return NextResponse.json({ jobs: items, total: items.length })
  } catch (err) {
    console.error('[admin/jobs/publish GET]', err)
    return NextResponse.json({ error: 'Failed to fetch published jobs' }, { status: 500 })
  }
}
