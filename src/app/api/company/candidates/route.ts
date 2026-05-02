import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyCognitoToken(token, 'company')
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const skills = searchParams.getAll('skills')
  const workPreference = searchParams.getAll('workPreference')
  const salaryMax = searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined
  const verified = searchParams.get('verified') === 'true'

  try {
    const result = await db.send(new ScanCommand({ TableName: Tables.Candidates }))
    let candidates = result.Items ?? []

    if (skills.length) {
      candidates = candidates.filter((c) =>
        skills.some((fs) =>
          c.skills?.some((cs: { name: string }) => cs.name?.toLowerCase() === fs.toLowerCase()),
        ),
      )
    }
    if (workPreference.length) {
      candidates = candidates.filter((c) =>
        c.workPreference?.some((wp: string) => workPreference.includes(wp)),
      )
    }
    if (salaryMax !== undefined) {
      candidates = candidates.filter((c) => (c.salaryExpectation ?? 0) <= salaryMax)
    }
    if (verified) {
      candidates = candidates.filter((c) => c.verified === true)
    }

    return NextResponse.json(candidates)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
