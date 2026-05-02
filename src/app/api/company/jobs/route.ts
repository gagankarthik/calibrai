import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand, PutCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { v4 as uuidv4 } from 'uuid'
import type { CreateJobInput } from '@/lib/api'

async function getCompanyId(req: NextRequest): Promise<string | null> {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'company')
    return (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.Jobs,
        KeyConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
        ScanIndexForward: false,
      }),
    )
    return NextResponse.json(result.Items ?? [])
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = (await req.json()) as CreateJobInput

    const jobId = `j-${uuidv4()}`
    const now = new Date().toISOString()

    const job = {
      companyId,
      jobId,
      ...body,
      department: body.department ?? '',
      currency: body.currency ?? 'USD',
      salaryMin: body.salaryMin ?? 0,
      salaryMax: body.salaryMax ?? 0,
      requirements: body.requirements ?? [],
      niceToHave: body.niceToHave ?? [],
      benefits: body.benefits ?? [],
      postedAt: now,
      expiresAt: body.expiresAt ?? new Date(Date.now() + 30 * 86_400_000).toISOString(),
      applicantCount: 0,
      viewCount: 0,
      status: 'active',
      featured: false,
    }

    await db.send(new PutCommand({ TableName: Tables.Jobs, Item: job }))

    // Trigger candidate discovery in background (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${appUrl}/api/company/jobs/${jobId}/discover-candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({ job }),
    }).catch(() => {})

    return NextResponse.json(job, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create job'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
