import { NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'

const PLAN_PRICES: Record<string, number> = {
  starter: 499,
  growth: 2499,
  enterprise: 7999,
}

export async function GET() {
  try {
    const [companies, candidates, jobs, applications, crmJobs, discoveredCandidates] =
      await Promise.all([
        db.send(new ScanCommand({ TableName: Tables.Companies, Select: 'ALL_ATTRIBUTES' })),
        db.send(new ScanCommand({ TableName: Tables.Candidates, Select: 'ALL_ATTRIBUTES' })),
        db.send(new ScanCommand({ TableName: Tables.Jobs, Select: 'ALL_ATTRIBUTES' })),
        db.send(new ScanCommand({ TableName: Tables.Applications, Select: 'ALL_ATTRIBUTES' })),
        db.send(new ScanCommand({ TableName: Tables.CrmJobs, Select: 'ALL_ATTRIBUTES' })),
        db.send(new ScanCommand({ TableName: Tables.DiscoveredCandidates, Select: 'ALL_ATTRIBUTES' })),
      ])

    const companiesData = (companies.Items ?? []) as Record<string, unknown>[]
    const candidatesData = (candidates.Items ?? []) as Record<string, unknown>[]
    const jobsData = (jobs.Items ?? []) as Record<string, unknown>[]
    const appsData = (applications.Items ?? []) as Record<string, unknown>[]
    const crmJobsData = (crmJobs.Items ?? []) as Record<string, unknown>[]
    const discoveredData = (discoveredCandidates.Items ?? []) as Record<string, unknown>[]

    // Plan breakdown
    const planBreakdown: Record<string, number> = { starter: 0, growth: 0, enterprise: 0 }
    for (const c of companiesData) {
      const plan = (c.plan as string | undefined)?.toLowerCase() ?? 'starter'
      planBreakdown[plan] = (planBreakdown[plan] ?? 0) + 1
    }

    // Estimated MRR
    const estimatedMRR = Object.entries(planBreakdown).reduce((acc, [plan, count]) => {
      return acc + count * (PLAN_PRICES[plan] ?? 0)
    }, 0)

    // Active jobs
    const activeJobs = jobsData.filter((j) => j.status === 'active').length

    // Recent companies (sorted by createdAt desc, top 5)
    const recentCompanies = [...companiesData]
      .sort((a, b) => {
        const aTime = typeof a.createdAt === 'string' ? a.createdAt : ''
        const bTime = typeof b.createdAt === 'string' ? b.createdAt : ''
        return bTime.localeCompare(aTime)
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.companyId ?? c.id,
        name: c.name ?? c.companyName,
        email: c.email,
        plan: c.plan ?? 'starter',
        createdAt: c.createdAt,
      }))

    // Recent talents
    const recentTalents = [...candidatesData]
      .sort((a, b) => {
        const aTime = typeof a.createdAt === 'string' ? a.createdAt : ''
        const bTime = typeof b.createdAt === 'string' ? b.createdAt : ''
        return bTime.localeCompare(aTime)
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.candidateId ?? c.id,
        name: c.name ?? c.fullName,
        headline: c.headline ?? c.title,
        createdAt: c.createdAt,
      }))

    return NextResponse.json({
      totalCompanies: companiesData.length,
      totalTalents: candidatesData.length,
      activeJobs,
      totalJobs: jobsData.length,
      totalApplications: appsData.length,
      crmJobsScraped: crmJobsData.length,
      crmCandidatesFound: discoveredData.length,
      planBreakdown,
      estimatedMRR,
      recentCompanies,
      recentTalents,
    })
  } catch (err) {
    console.error('[admin/stats] error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
