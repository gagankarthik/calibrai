import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand } from '@/lib/aws/dynamodb'
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyCognitoToken(token, 'company')
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const result = await db.send(
      new GetCommand({ TableName: Tables.Candidates, Key: { id } }),
    )
    if (!result.Item) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    return NextResponse.json(normalizeCandidate(result.Item as Record<string, unknown>))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 })
  }
}
