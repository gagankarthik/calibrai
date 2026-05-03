'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Target,
  BarChart2,
  Briefcase,
  Clock,
  RefreshCw,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsData {
  totalCompanies: number
  totalTalents: number
  activeJobs: number
  totalJobs: number
  totalApplications: number
  crmJobsScraped: number
  crmCandidatesFound: number
  hiredCount: number
  avgTimeToHire: number | null
  estimatedMRR: number
  estimatedARR: number
  planBreakdown: Record<string, number>
  planPrices: Record<string, number>
  weeklyApplications: Array<{ week: string; count: number }>
  monthlySignups: Array<{ month: string; companies: number; mrr: number; cumulativeMrr: number }>
}

const PLAN_COLORS: Record<string, string> = {
  starter: '#6366f1',
  growth: '#10b981',
  enterprise: '#C9A84C',
}

function fmtCurrency(n: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(n)) return '$0'
  if (opts.compact && n >= 1000) {
    return `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K`
  }
  return `$${n.toLocaleString()}`
}

function MrrTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { companies?: number } }>; label?: string }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] px-3 py-2 text-xs shadow-md">
      <p className="text-[var(--tl-text-secondary)] mb-1">{label}</p>
      <p className="font-bold text-tl-teal">{fmtCurrency(p.value, { compact: true })}</p>
      {typeof p.payload?.companies === 'number' && (
        <p className="text-[10px] text-[var(--tl-text-secondary)] mt-0.5">+{p.payload.companies} new</p>
      )}
    </div>
  )
}

function PlanTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { customers: number } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-[var(--tl-text-primary)] mb-0.5 capitalize">{d.name}</p>
      <p className="text-[var(--tl-text-secondary)]">{d.payload.customers} customer{d.payload.customers === 1 ? '' : 's'}</p>
      <p className="text-tl-indigo font-bold">{fmtCurrency(d.value)} MRR</p>
    </div>
  )
}

function WeeklyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] px-3 py-2 text-xs shadow-md">
      <p className="text-[var(--tl-text-secondary)] mb-1">{label}</p>
      <p className="font-bold text-tl-indigo">{payload[0].value} applications</p>
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function SaasMetricsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as StatsData
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tl-card p-5 animate-pulse h-[124px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="tl-card p-5 animate-pulse h-[400px]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-tl-rose text-sm">{error}</p>
        <button onClick={() => load()} className="btn-gold text-sm px-4 py-2">Retry</button>
      </div>
    )
  }

  if (!stats) return null

  // Plan rows for the breakdown chart, derived from real plan counts × prices.
  const planEntries = Object.entries(stats.planBreakdown)
    .filter(([, count]) => count > 0)
    .map(([name, customers]) => {
      const price = stats.planPrices?.[name] ?? 0
      return {
        name,
        customers,
        mrr: customers * price,
        fill: PLAN_COLORS[name] ?? '#6366f1',
      }
    })
  const totalPlanMrr = planEntries.reduce((s, p) => s + p.mrr, 0)

  // 8-month real MRR series (cumulative)
  const mrrSeries = stats.monthlySignups.map((m) => ({
    month: m.month,
    mrr: m.cumulativeMrr,
    companies: m.companies,
  }))
  const firstMrr = mrrSeries[0]?.mrr ?? 0
  const lastMrr = mrrSeries[mrrSeries.length - 1]?.mrr ?? 0
  const mrrGrowthPct = firstMrr > 0 ? Math.round(((lastMrr - firstMrr) / firstMrr) * 100) : null

  // Real KPI cards — only metrics we can actually compute from DynamoDB.
  const kpiCards = [
    {
      icon: DollarSign,
      iconColor: 'text-tl-teal',
      iconBg: 'bg-tl-teal/10',
      label: 'MRR',
      value: fmtCurrency(stats.estimatedMRR),
      sub: `${stats.totalCompanies} paying customer${stats.totalCompanies === 1 ? '' : 's'}`,
    },
    {
      icon: TrendingUp,
      iconColor: 'text-tl-indigo',
      iconBg: 'bg-tl-indigo/10',
      label: 'ARR (run-rate)',
      value: fmtCurrency(stats.estimatedARR),
      sub: 'MRR × 12',
    },
    {
      icon: Users,
      iconColor: 'text-tl-gold',
      iconBg: 'bg-tl-gold/10',
      label: 'Active Companies',
      value: stats.totalCompanies.toLocaleString(),
      sub: `${stats.totalTalents.toLocaleString()} talent profiles`,
    },
    {
      icon: Briefcase,
      iconColor: 'text-tl-blue',
      iconBg: 'bg-tl-blue/10',
      label: 'Active Jobs',
      value: stats.activeJobs.toLocaleString(),
      sub: `${stats.totalJobs.toLocaleString()} all-time`,
    },
    {
      icon: Award,
      iconColor: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      label: 'Hires Facilitated',
      value: stats.hiredCount.toLocaleString(),
      sub: `${stats.totalApplications.toLocaleString()} applications`,
    },
    {
      icon: Clock,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
      label: 'Avg Time-to-Hire',
      value: stats.avgTimeToHire != null ? `${stats.avgTimeToHire}d` : '—',
      sub: stats.hiredCount === 0 ? 'No hires yet' : `Across ${stats.hiredCount} hire${stats.hiredCount === 1 ? '' : 's'}`,
    },
  ]

  // Metrics we cannot compute without additional tracking.
  const trackingRequired = [
    { label: 'LTV', sub: 'Needs revenue history per customer' },
    { label: 'Churn rate', sub: 'Needs cancellation events' },
    { label: 'CAC', sub: 'Needs marketing spend tracking' },
    { label: 'NPS score', sub: 'Needs survey integration' },
  ]

  return (
    <div className="min-h-screen bg-[var(--tl-bg-base)]">
      {/* Header bar */}
      <header className="border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-surface)]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <span className="font-bold text-sm tracking-tight text-[var(--tl-text-primary)]">TalentBridge</span>
          <span className="text-[var(--tl-text-secondary)]/40 text-lg">—</span>
          <span className="text-sm text-[var(--tl-text-secondary)]">SaaS Metrics</span>
          <span className="ml-auto text-[11px] font-medium bg-tl-rose/10 text-tl-rose border border-tl-rose/20 px-2 py-0.5 rounded-full">
            Leadership only
          </span>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="ml-2 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-[var(--tl-border-default)] hover:border-tl-gold/40 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-10 space-y-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-2">
            Internal Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--tl-text-primary)]">
            SaaS Metrics
          </h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            Real-time view of TalentBridge revenue, customers, and hiring outcomes — all values come from DynamoDB.
          </p>
        </motion.div>

        {/* KPI grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {kpiCards.map((card) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="tl-card p-4 flex flex-col gap-2.5 hover:border-tl-gold/30 transition-colors"
            >
              <div className={cn('inline-flex w-9 h-9 rounded-xl items-center justify-center', card.iconBg)}>
                <card.icon className={cn('w-4 h-4', card.iconColor)} />
              </div>
              <div>
                <div className="text-2xl font-bold text-[var(--tl-text-primary)] tracking-tight leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] text-[var(--tl-text-secondary)] mt-1.5 leading-snug">
                  {card.label}
                </div>
              </div>
              <div className="mt-auto text-[10px] text-[var(--tl-text-secondary)]/80">{card.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Plan breakdown */}
          <motion.div variants={itemVariants} className="tl-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-tl-indigo/10">
                <BarChart2 className="w-4 h-4 text-tl-indigo" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[var(--tl-text-primary)]">Plan Breakdown</h2>
                <p className="text-[11px] text-[var(--tl-text-secondary)]">Revenue by tier</p>
              </div>
            </div>

            {planEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <Info className="w-7 h-7 text-[var(--tl-text-secondary)]/30 mb-2" />
                <p className="text-sm text-[var(--tl-text-secondary)]">No companies on a paid plan yet.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={planEntries}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="mrr"
                        nameKey="name"
                      >
                        {planEntries.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<PlanTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {planEntries.map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.fill }} />
                        <span className="text-[var(--tl-text-secondary)] capitalize">{p.name}</span>
                        <span className="text-[var(--tl-text-secondary)]/60">({p.customers})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--tl-text-primary)]">${p.mrr.toLocaleString()}</span>
                        <span className="text-[var(--tl-text-secondary)]/60 text-[10px]">
                          {totalPlanMrr > 0 ? Math.round((p.mrr / totalPlanMrr) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={70}>
                  <BarChart data={planEntries} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<PlanTooltip />} />
                    <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                      {planEntries.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </motion.div>

          {/* MRR growth */}
          <motion.div variants={itemVariants} className="tl-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-tl-teal/10">
                <TrendingUp className="w-4 h-4 text-tl-teal" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[var(--tl-text-primary)]">MRR Growth</h2>
                <p className="text-[11px] text-[var(--tl-text-secondary)]">Last 8 months · cumulative</p>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-[var(--tl-text-primary)]">
                  {fmtCurrency(stats.estimatedMRR, { compact: true })}
                </div>
                <div className="text-[11px] text-[var(--tl-text-secondary)]">Current MRR</div>
              </div>
              {mrrGrowthPct != null && (
                <div className="text-right">
                  <div className={cn('text-sm font-bold', mrrGrowthPct >= 0 ? 'text-tl-teal' : 'text-tl-rose')}>
                    {mrrGrowthPct >= 0 ? '+' : ''}{mrrGrowthPct}%
                  </div>
                  <div className="text-[11px] text-[var(--tl-text-secondary)]">8-month change</div>
                </div>
              )}
            </div>

            {mrrSeries.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--tl-text-secondary)]">
                Not enough history yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={mrrSeries} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<MrrTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#mrrGrad)"
                    dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Application velocity */}
          <motion.div variants={itemVariants} className="tl-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-tl-indigo/10">
                <Target className="w-4 h-4 text-tl-indigo" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-[var(--tl-text-primary)]">Application Velocity</h2>
                <p className="text-[11px] text-[var(--tl-text-secondary)]">Last 8 weeks</p>
              </div>
            </div>

            {(stats.weeklyApplications ?? []).length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--tl-text-secondary)]">
                No applications yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.weeklyApplications} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.05)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<WeeklyTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--tl-border-subtle)]">
              <div>
                <p className="text-[10px] text-[var(--tl-text-secondary)] uppercase tracking-wider font-semibold">Total apps</p>
                <p className="text-base font-bold text-[var(--tl-text-primary)] mt-0.5">{stats.totalApplications.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--tl-text-secondary)] uppercase tracking-wider font-semibold">Hired</p>
                <p className="text-base font-bold text-tl-teal mt-0.5">{stats.hiredCount.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tracking-required disclosure */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tl-card p-5 border border-amber-200 bg-amber-50/40"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--tl-text-primary)]">
                Metrics that need additional tracking
              </h3>
              <p className="text-xs text-[var(--tl-text-secondary)] mt-1 leading-relaxed">
                These don&apos;t appear above because we don&apos;t have the source events yet. Wire them up before quoting them externally.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {trackingRequired.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-amber-200/70 bg-white/60 p-3"
                  >
                    <p className="text-xs font-semibold text-[var(--tl-text-primary)]">{m.label}</p>
                    <p className="text-[10px] text-[var(--tl-text-secondary)] mt-0.5 leading-snug">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
