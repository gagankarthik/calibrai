import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

function deterministicScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

function normalizeCandidate(item: Record<string, unknown>) {
  const id = String(item.id ?? item.candidateId ?? '')
  return {
    ...item,
    id,
    title: (item.title as string) || (item.headline as string) || '',
    avatar: (item.avatar as string) || (item.avatarUrl as string) || '',
    name: (item.name as string) || '',
    email: (item.email as string) || '',
    phone: (item.phone as string) || '',
    location: (item.location as string) || '',
    bio: (item.bio as string) || '',
    availability: (item.availability as string) || 'Open to work',
    salaryExpectation: (item.salaryExpectation as number) || 0,
    workPreference: (item.workPreference as string[]) || [],
    languages: (item.languages as string[]) || [],
    skills: (item.skills as unknown[]) || [],
    experience: (item.experience as unknown[]) || [],
    education: (item.education as unknown[]) || [],
    assessmentScores: (item.assessmentScores as Record<string, number>) || {},
    verified: (item.verified as boolean) || false,
    premium: (item.premium as boolean) || false,
    matchScore: (item.matchScore as number) || deterministicScore(id),
  }
}

export async function GET(req: NextRequest) {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
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
    let candidates = (result.Items ?? []).map((item) =>
      normalizeCandidate(item as Record<string, unknown>),
    )

    // Filter out incomplete profiles (no name means talent hasn't set up profile)
    candidates = candidates.filter((c) => c.name)

    if (skills.length) {
      candidates = candidates.filter((c) =>
        skills.some((fs) =>
          (c.skills as { name: string }[]).some(
            (cs) => cs.name?.toLowerCase() === fs.toLowerCase(),
          ),
        ),
      )
    }
    if (workPreference.length) {
      candidates = candidates.filter((c) =>
        (c.workPreference as string[]).some((wp) => workPreference.includes(wp)),
      )
    }
    if (salaryMax !== undefined) {
      candidates = candidates.filter((c) => (c.salaryExpectation as number) <= salaryMax)
    }
    if (verified) {
      candidates = candidates.filter((c) => c.verified === true)
    }

    return NextResponse.json(candidates)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}
