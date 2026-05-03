import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'
import { hydrateApplications, type DynamoItem } from '@/lib/server/applications'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyCognitoToken(token, 'company')
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const result = await db.send(
      new QueryCommand({
        TableName: Tables.Applications,
        IndexName: 'jobId-index',
        KeyConditionExpression: 'jobId = :jid',
        ExpressionAttributeValues: { ':jid': id },
        ScanIndexForward: false,
      }),
    )
    const raw = (result.Items as DynamoItem[]) ?? []
    raw.sort((a, b) =>
      String(b.appliedAt ?? '').localeCompare(String(a.appliedAt ?? '')),
    )
    const hydrated = await hydrateApplications(raw)

    // Shape for the job-detail applicants list (flat fields the UI expects)
    const flat = hydrated.map((app) => {
      const candidate = (app.candidate as DynamoItem | null) ?? null
      return {
        ...app,
        candidateName: (candidate?.name as string) || '',
        candidateEmail: (candidate?.email as string) || '',
        candidateTitle: (candidate?.title as string) || (candidate?.headline as string) || '',
        candidateAvatar: (candidate?.avatar as string) || '',
      }
    })

    return NextResponse.json(flat)
  } catch (err) {
    console.error('[company/jobs/[id]/applications GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
