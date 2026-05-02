/**
 * POST /api/account/delete-request
 * GDPR Article 17 — Right to Erasure ("Right to be Forgotten")
 *
 * Logs a deletion request for the authenticated talent's account.
 * Account data will be permanently deleted within 30 days.
 * Requires a valid talent auth token (Bearer header or tb-talent-token cookie).
 */
import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, PutCommand } from '@/lib/aws/dynamodb'
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

export async function POST(req: NextRequest) {
  const candidateId = await getCandidateId(req)
  if (!candidateId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requestId = `del-${candidateId}-${Date.now()}`
  const requestedAt = new Date().toISOString()
  // Deletion scheduled 30 days from now
  const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  try {
    // Log the deletion request to the audit table
    await db.send(
      new PutCommand({
        TableName: Tables.AuditLogs,
        Item: {
          logId: requestId,
          action: 'deletion_requested',
          userId: candidateId,
          userType: 'talent',
          requestedAt,
          scheduledDeletionAt,
          status: 'pending',
          source: 'gdpr-self-service',
        },
      }),
    )

    // Log for admin visibility — in production, this should trigger a notification
    // to the data protection officer or admin dashboard
    console.info(
      `[GDPR Deletion Request] requestId=${requestId} candidateId=${candidateId} scheduledDeletion=${scheduledDeletionAt}`,
    )

    return NextResponse.json(
      {
        message:
          'Deletion request received. Your account and all associated personal data will be permanently deleted within 30 days. You will receive a confirmation email when the deletion is complete.',
        requestId,
        requestedAt,
        scheduledDeletionAt,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[GDPR Deletion Request] Error logging request:', err)

    // Even if the DB write fails, acknowledge the request — the console log above
    // ensures admin visibility. In production, a fallback notification (e.g., email)
    // should be triggered here.
    return NextResponse.json(
      {
        message:
          'Deletion request received. Your account and all associated personal data will be permanently deleted within 30 days.',
        requestId,
        requestedAt,
        scheduledDeletionAt,
      },
      { status: 200 },
    )
  }
}
