import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

/**
 * Diagnostic endpoint — returns the JWT claims, resolved companyId, and the
 * jobs visible to the current company user. Helps debug auth/data mismatches.
 */
export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
    ?? req.cookies.get('tb-talent-token')?.value

  if (!token) {
    return NextResponse.json({ ok: false, reason: 'No auth cookie present' }, { status: 200 })
  }

  let claims: Record<string, unknown> = {}
  try {
    claims = await verifyCognitoToken(token) as Record<string, unknown>
  } catch (err) {
    return NextResponse.json({
      ok: false,
      reason: 'Token verification failed',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 200 })
  }

  const sub = claims.sub as string | undefined
  const customCompanyId = claims['custom:companyId'] as string | undefined
  const resolvedCompanyId = customCompanyId ?? sub

  // What the company/jobs API would query
  let jobsForResolvedCompany: unknown[] = []
  try {
    const r = await db.send(new QueryCommand({
      TableName: Tables.Jobs,
      IndexName: 'companyId-index',
      KeyConditionExpression: 'companyId = :cid',
      ExpressionAttributeValues: { ':cid': resolvedCompanyId },
    }))
    jobsForResolvedCompany = (r.Items ?? []).map(j => ({ id: j.id, title: j.title, companyId: j.companyId, status: j.status }))
  } catch (err) {
    return NextResponse.json({ ok: true, claims, resolvedCompanyId, queryError: String(err) }, { status: 200 })
  }

  // All jobs in the table (for cross-checking which companyId actually owns them)
  let allJobs: unknown[] = []
  try {
    const r = await db.send(new ScanCommand({
      TableName: Tables.Jobs,
      ProjectionExpression: 'id, companyId, title, postedAt',
    }))
    allJobs = r.Items ?? []
  } catch { /* ignore */ }

  return NextResponse.json({
    ok: true,
    claims: {
      sub,
      email: claims.email,
      name: claims.name,
      role: claims['custom:role'],
      customCompanyId,
      customCompanyName: claims['custom:companyName'],
      iat: claims.iat,
      exp: claims.exp,
      tokenAgeMinutes: claims.iat ? Math.floor((Date.now() / 1000 - (claims.iat as number)) / 60) : null,
    },
    resolvedCompanyId,
    jobsForResolvedCompany,
    jobsForResolvedCompanyCount: jobsForResolvedCompany.length,
    allJobsInTable: allJobs,
  })
}
