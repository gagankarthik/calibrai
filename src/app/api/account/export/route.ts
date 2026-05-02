/**
 * GET /api/account/export
 * GDPR Article 20 — Right to Data Portability
 *
 * Returns the authenticated talent's personal data as a downloadable JSON file.
 * Requires a valid talent auth token (Bearer header or tb-talent-token cookie).
 */
import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, GetCommand, QueryCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

async function getCandidateId(req: NextRequest): Promise<string | null> {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-talent-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'talent')
    return payload.sub
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch candidate profile
    const profileResult = await db.send(
      new GetCommand({
        TableName: Tables.Candidates,
        Key: { candidateId },
      }),
    )
    const profile = profileResult.Item ?? null

    // Fetch applications submitted by this candidate
    let applications: unknown[] = []
    try {
      const appsResult = await db.send(
        new ScanCommand({
          TableName: Tables.Applications,
          FilterExpression: 'candidateId = :cid',
          ExpressionAttributeValues: { ':cid': candidateId },
        }),
      )
      applications = appsResult.Items ?? []
    } catch {
      // Table may not exist in all environments — return empty array
      applications = []
    }

    // Fetch conversations involving this candidate
    let conversations: unknown[] = []
    try {
      const convResult = await db.send(
        new ScanCommand({
          TableName: Tables.Conversations,
          FilterExpression: 'candidateId = :cid',
          ExpressionAttributeValues: { ':cid': candidateId },
        }),
      )
      conversations = convResult.Items ?? []
    } catch {
      conversations = []
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      gdprNote:
        'This file contains all personal data TalentBridge holds about your account, exported pursuant to GDPR Article 20 (Right to Data Portability). For questions, contact oceanbluesolutions@gmail.com.',
      profile,
      applications,
      conversations,
    }

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=talentbridge-data-export.json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[GDPR Export] Error:', err)
    return NextResponse.json({ error: 'Failed to generate data export' }, { status: 500 })
  }
}
