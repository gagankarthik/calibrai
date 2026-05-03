import { NextRequest, NextResponse } from 'next/server'
import { db, Tables, ScanCommand } from '@/lib/aws/dynamodb'

// Internal pricing reference. Used to compute MRR from plan counts; not a price quote.
const PLAN_PRICES: Record<string, number> = {
  starter: 499,
  growth: 2499,
  enterprise: 7999,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RecentCompany { id: unknown; name: unknown; email: unknown; plan: unknown; createdAt: unknown }
interface RecentTalent { id: unknown; name: unknown; headline: unknown; createdAt: unknown }
interface WeekBucket { week: string; count: number; iso: string }
interface MonthBucket { month: string; companies: number; mrr: number; cumulativeMrr: number; iso: string }

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  // Reset to Sunday
  out.setDate(out.getDate() - out.getDay())
  return out
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function fmtMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function fmtWeek(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function safeDate(v: unknown): Date | null {
  if (!v) return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d
}

export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret') ?? req.cookies.get('tb-admin-verified')?.value
  const expectedSecret = process.env.INTERNAL_API_SECRET ?? 'talentbridge-admin'
  if (adminSecret !== expectedSecret && adminSecret !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    // ── Plan breakdown ──────────────────────────────────────────────────────
    const planBreakdown: Record<string, number> = { starter: 0, growth: 0, enterprise: 0 }
    for (const c of companiesData) {
      const plan = (c.plan as string | undefined)?.toLowerCase() ?? 'starter'
      planBreakdown[plan] = (planBreakdown[plan] ?? 0) + 1
    }

    const estimatedMRR = Object.entries(planBreakdown).reduce(
      (acc, [plan, count]) => acc + count * (PLAN_PRICES[plan] ?? 0),
      0,
    )
    const estimatedARR = estimatedMRR * 12

    // ── Active / hired counts ───────────────────────────────────────────────
    const activeJobs = jobsData.filter((j) => j.status === 'active').length
    const hiredApps = appsData.filter((a) => (a.stage ?? a.status) === 'hired')
    const hiredCount = hiredApps.length

    // ── Avg time to hire (days) ─────────────────────────────────────────────
    let avgTimeToHire: number | null = null
    if (hiredCount > 0) {
      const totalDays = hiredApps.reduce((acc, a) => {
        const applied = safeDate(a.appliedAt)
        const updated = safeDate(a.updatedAt) ?? safeDate(a.hiredAt)
        if (!applied || !updated) return acc
        const days = (updated.getTime() - applied.getTime()) / 86_400_000
        return acc + Math.max(1, days)
      }, 0)
      avgTimeToHire = Math.round(totalDays / hiredCount)
    }

    // ── Weekly applications (last 8 weeks) ─────────────────────────────────
    const NOW = new Date()
    const WEEKS = 8
    const weekBuckets: WeekBucket[] = []
    for (let i = WEEKS - 1; i >= 0; i--) {
      const start = startOfWeek(new Date(NOW.getTime() - i * 7 * 86_400_000))
      weekBuckets.push({ week: fmtWeek(start), iso: start.toISOString(), count: 0 })
    }
    const earliestWeek = weekBuckets[0] ? new Date(weekBuckets[0].iso).getTime() : 0
    for (const a of appsData) {
      const applied = safeDate(a.appliedAt)
      if (!applied) continue
      if (applied.getTime() < earliestWeek) continue
      const weekStart = startOfWeek(applied).getTime()
      const idx = weekBuckets.findIndex((w) => new Date(w.iso).getTime() === weekStart)
      if (idx >= 0) weekBuckets[idx].count += 1
    }

    // ── Monthly company signups + cumulative MRR (last 8 months) ───────────
    const MONTHS = 8
    const monthBuckets: MonthBucket[] = []
    for (let i = MONTHS - 1; i >= 0; i--) {
      const start = startOfMonth(new Date(NOW.getFullYear(), NOW.getMonth() - i, 1))
      monthBuckets.push({
        month: fmtMonth(start),
        iso: start.toISOString(),
        companies: 0,
        mrr: 0,
        cumulativeMrr: 0,
      })
    }
    const earliestMonth = monthBuckets[0] ? new Date(monthBuckets[0].iso).getTime() : 0
    // companies that already existed before the window contribute to the starting cumulative
    let baselineMrr = 0
    for (const c of companiesData) {
      const created = safeDate(c.createdAt)
      const plan = (c.plan as string | undefined)?.toLowerCase() ?? 'starter'
      const price = PLAN_PRICES[plan] ?? 0
      if (!created || created.getTime() < earliestMonth) {
        baselineMrr += price
        continue
      }
      const monthStart = startOfMonth(created).getTime()
      const idx = monthBuckets.findIndex((m) => new Date(m.iso).getTime() === monthStart)
      if (idx >= 0) {
        monthBuckets[idx].companies += 1
        monthBuckets[idx].mrr += price
      }
    }
    let running = baselineMrr
    for (const m of monthBuckets) {
      running += m.mrr
      m.cumulativeMrr = running
    }

    // ── Recents ─────────────────────────────────────────────────────────────
    const recentCompanies: RecentCompany[] = [...companiesData]
      .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      .slice(0, 5)
      .map((c) => ({
        id: c.companyId ?? c.id,
        name: c.name ?? c.companyName,
        email: c.email,
        plan: c.plan ?? 'starter',
        createdAt: c.createdAt,
      }))

    const recentTalents: RecentTalent[] = [...candidatesData]
      .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
      .slice(0, 5)
      .map((c) => ({
        id: c.candidateId ?? c.id,
        name: c.name ?? c.fullName,
        headline: c.headline ?? c.title,
        createdAt: c.createdAt,
      }))

    return NextResponse.json({
      // Totals
      totalCompanies: companiesData.length,
      totalTalents: candidatesData.length,
      activeJobs,
      totalJobs: jobsData.length,
      totalApplications: appsData.length,
      crmJobsScraped: crmJobsData.length,
      crmCandidatesFound: discoveredData.length,

      // Hiring outcomes (real)
      hiredCount,
      avgTimeToHire,

      // Revenue (computed from PLAN_PRICES × counts — no fake numbers)
      planBreakdown,
      estimatedMRR,
      estimatedARR,
      planPrices: PLAN_PRICES,

      // Time-series (real, from createdAt / appliedAt timestamps)
      weeklyApplications: weekBuckets,
      monthlySignups: monthBuckets,

      // Recents
      recentCompanies,
      recentTalents,
    })
  } catch (err) {
    console.error('[admin/stats] error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
