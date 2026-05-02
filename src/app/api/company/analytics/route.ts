import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, QueryCommand, ScanCommand } from '@/lib/aws/dynamodb'
import { extractBearerToken, verifyCognitoToken } from '@/lib/aws/cognito'

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'))
    ?? req.cookies.get('tb-company-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let companyId: string
  try {
    const payload = await verifyCognitoToken(token, 'company')
    companyId = (payload['custom:companyId'] as string) ?? payload.sub
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    // Fetch all jobs for this company
    const jobsResult = await db.send(
      new QueryCommand({
        TableName: Tables.Jobs,
        IndexName: 'companyId-index',
        KeyConditionExpression: 'companyId = :cid',
        ExpressionAttributeValues: { ':cid': companyId },
      }),
    )
    const jobs = jobsResult.Items ?? []
    const jobIds = jobs.map((j) => j.id as string)

    // Fetch applications for all jobs
    let applications: Record<string, unknown>[] = []
    for (const jobId of jobIds.slice(0, 20)) {
      const appResult = await db.send(
        new QueryCommand({
          TableName: Tables.Applications,
          IndexName: 'jobId-index',
          KeyConditionExpression: 'jobId = :jid',
          ExpressionAttributeValues: { ':jid': jobId },
        }),
      )
      applications.push(...(appResult.Items ?? []))
    }

    const totalJobs = jobs.length
    const activeJobs = jobs.filter((j) => j.status === 'active').length
    const totalApplicants = applications.length
    const hiredThisMonth = applications.filter((a) => {
      const updated = new Date(a.updatedAt as string)
      const now = new Date()
      return a.status === 'hired' &&
        updated.getMonth() === now.getMonth() &&
        updated.getFullYear() === now.getFullYear()
    }).length

    const statusCounts = applications.reduce<Record<string, number>>((acc, a) => {
      const s = a.status as string
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {})

    const hiringFunnel = [
      { stage: 'Applied', count: totalApplicants, percentage: 100, dropoff: 0 },
      { stage: 'Screening', count: statusCounts.screening ?? 0, percentage: totalApplicants ? Math.round((statusCounts.screening ?? 0) / totalApplicants * 100) : 0, dropoff: 0 },
      { stage: 'Interview', count: statusCounts.interview ?? 0, percentage: totalApplicants ? Math.round((statusCounts.interview ?? 0) / totalApplicants * 100) : 0, dropoff: 0 },
      { stage: 'Technical', count: statusCounts.technical ?? 0, percentage: totalApplicants ? Math.round((statusCounts.technical ?? 0) / totalApplicants * 100) : 0, dropoff: 0 },
      { stage: 'Offer', count: statusCounts.offer ?? 0, percentage: totalApplicants ? Math.round((statusCounts.offer ?? 0) / totalApplicants * 100) : 0, dropoff: 0 },
      { stage: 'Hired', count: statusCounts.hired ?? 0, percentage: totalApplicants ? Math.round((statusCounts.hired ?? 0) / totalApplicants * 100) : 0, dropoff: 0 },
    ]

    // Weekly applications (last 8 weeks)
    const weeklyApplications = Array.from({ length: 8 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay())
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7)
      const weekApps = applications.filter((a) => {
        const t = new Date(a.appliedAt as string)
        return t >= weekStart && t < weekEnd
      })
      return {
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications: weekApps.length,
        interviews: weekApps.filter((a) => ['interview', 'technical', 'offer', 'hired'].includes(a.status as string)).length,
        offers: weekApps.filter((a) => ['offer', 'hired'].includes(a.status as string)).length,
      }
    }).reverse()

    return NextResponse.json({
      totalJobs,
      activeJobs,
      totalApplicants,
      hiredThisMonth,
      avgTimeToHire: 28,
      offerAcceptRate: 84,
      qualityOfHire: 91,
      costPerHire: 3200,
      hiringFunnel,
      weeklyApplications,
      sourcingChannels: [
        { name: 'TalentBridge AI', applicants: Math.round(totalApplicants * 0.45), hired: Math.round(hiredThisMonth * 0.5), percentage: 45 },
        { name: 'Direct Apply', applicants: Math.round(totalApplicants * 0.30), hired: Math.round(hiredThisMonth * 0.3), percentage: 30 },
        { name: 'LinkedIn', applicants: Math.round(totalApplicants * 0.15), hired: Math.round(hiredThisMonth * 0.15), percentage: 15 },
        { name: 'Referral', applicants: Math.round(totalApplicants * 0.10), hired: Math.round(hiredThisMonth * 0.05), percentage: 10 },
      ],
      diversityMetrics: {
        gender: { Male: 58, Female: 38, 'Non-binary': 4 },
        ethnicity: { White: 42, Asian: 28, Hispanic: 16, Black: 10, Other: 4 },
        ageGroup: { '18-24': 18, '25-34': 42, '35-44': 28, '45-54': 9, '55+': 3 },
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
