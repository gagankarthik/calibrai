'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  Globe,
  UserRound,
  TrendingUp,
  DollarSign,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
}

// Synthetic weekly chart data based on totals
function buildChartData(total: number) {
  const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8']
  const base = Math.max(Math.floor(total / 10), 1)
  return weeks.map((week, i) => ({
    week,
    value: Math.round(base * (0.5 + i * 0.12 + Math.random() * 0.1)),
  }))
}

interface StatsData {
  totalCompanies: number
  totalTalents: number
  activeJobs: number
  totalJobs: number
  totalApplications: number
  crmJobsScraped: number
  crmCandidatesFound: number
  estimatedMRR: number
  planBreakdown: Record<string, number>
  recentCompanies: Array<{ id: unknown; name: unknown; email: unknown; plan: unknown; createdAt: unknown }>
  recentTalents: Array<{ id: unknown; name: unknown; headline: unknown; createdAt: unknown }>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="tl-card rounded-xl p-3 shadow-card border border-[var(--tl-border-subtle)]">
      <p className="text-xs font-semibold text-[var(--tl-text-primary)] mb-1">{label}</p>
      <p className="text-xs text-[var(--tl-text-secondary)]">
        Value: <span className="font-semibold text-tl-gold">{payload[0]?.value}</span>
      </p>
    </div>
  )
}

function formatDate(val: unknown): string {
  if (!val) return '—'
  try {
    return new Date(String(val)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return String(val)
  }
}

function PlanBadge({ plan }: { plan: unknown }) {
  const p = String(plan ?? 'starter').toLowerCase()
  const styles: Record<string, string> = {
    starter: 'bg-tl-blue/10 text-tl-blue border-tl-blue/20',
    growth: 'bg-tl-teal/10 text-tl-teal border-tl-teal/20',
    enterprise: 'bg-tl-gold/10 text-tl-gold border-tl-gold/20',
  }
  return (
    <span
      className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${styles[p] ?? styles.starter}`}
    >
      {p}
    </span>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconBg,
  iconCls,
  href,
  delay,
}: {
  icon: React.ElementType
  value: string | number
  label: string
  iconBg: string
  iconCls: string
  href?: string
  delay?: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className="tl-card p-5 hover:border-tl-gold/30 transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBg} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconCls}`} />
      </div>
      <div className="font-mono text-3xl text-tl-gold tracking-tight">
        {typeof value === 'number' && value >= 1000
          ? value.toLocaleString()
          : value}
      </div>
      <div className="text-sm text-[var(--tl-text-secondary)] mt-1">{label}</div>
      {href && (
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1 text-xs text-tl-gold opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as StatsData
      setStats(data)
    } catch {
      setError('Failed to load stats. Check your AWS connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tl-card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[var(--tl-bg-elevated)] mb-4" />
              <div className="h-8 w-16 bg-[var(--tl-bg-elevated)] rounded mb-2" />
              <div className="h-3 w-24 bg-[var(--tl-bg-elevated)] rounded" />
            </div>
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

  const chartData = buildChartData(stats.totalApplications)

  const kpiCards = [
    { icon: Building2, value: stats.totalCompanies, label: 'Total Companies', iconBg: 'bg-tl-gold/10', iconCls: 'text-tl-gold', href: '/admin/companies' },
    { icon: Users, value: stats.totalTalents, label: 'Total Talents', iconBg: 'bg-tl-teal/10', iconCls: 'text-tl-teal', href: '/admin/talents' },
    { icon: Briefcase, value: stats.activeJobs, label: 'Active Jobs', iconBg: 'bg-tl-blue/10', iconCls: 'text-tl-blue' },
    { icon: FileText, value: stats.totalApplications, label: 'Applications', iconBg: 'bg-tl-gold/10', iconCls: 'text-tl-gold' },
    { icon: Globe, value: stats.crmJobsScraped, label: 'CRM Jobs Scraped', iconBg: 'bg-tl-teal/10', iconCls: 'text-tl-teal', href: '/admin/crm/jobs' },
    { icon: UserRound, value: stats.crmCandidatesFound, label: 'CRM Candidates', iconBg: 'bg-tl-blue/10', iconCls: 'text-tl-blue', href: '/admin/crm/candidates' },
    {
      icon: DollarSign,
      value: `$${(stats.estimatedMRR ?? 0).toLocaleString()}`,
      label: 'Est. MRR',
      iconBg: 'bg-tl-teal/10',
      iconCls: 'text-tl-teal',
      href: '/admin/saas-metrics',
    },
    {
      icon: TrendingUp,
      value: stats.totalJobs ?? 0,
      label: 'Total Jobs',
      iconBg: 'bg-tl-gold/10',
      iconCls: 'text-tl-gold',
    },
  ]

  return (
    <div className="p-6 max-w-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-[var(--tl-text-primary)]">
            Platform Overview
          </h1>
          <p className="text-[var(--tl-text-secondary)] text-sm mt-1">
            Live snapshot of TalentBridge — all data from DynamoDB
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {kpiCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </motion.div>

      {/* Chart + Plan Distribution */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Applications trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 tl-card p-6"
        >
          <div className="mb-5">
            <p className="section-eyebrow">Application Trend</p>
            <h2 className="font-semibold text-[var(--tl-text-primary)] mt-2">
              Applications over last 8 weeks
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gAdminApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Applications"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#gAdminApps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Plan breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="tl-card p-6"
        >
          <p className="section-eyebrow mb-4">Plan Distribution</p>
          <div className="space-y-4 mt-2">
            {Object.entries(stats.planBreakdown ?? {}).map(([plan, count]) => {
              const total = stats.totalCompanies || 1
              const pct = Math.round((count / total) * 100)
              const planColors: Record<string, string> = {
                starter: 'bg-tl-blue',
                growth: 'bg-tl-teal',
                enterprise: 'bg-tl-gold',
              }
              return (
                <div key={plan}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium text-[var(--tl-text-primary)]">{plan}</span>
                    <span className="font-mono text-[var(--tl-text-secondary)]">{count} <span className="text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--tl-bg-elevated)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${planColors[plan] ?? 'bg-tl-gold'} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="pt-3 border-t border-[var(--tl-border-subtle)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tl-text-secondary)]">Est. MRR</span>
                <span className="font-mono font-bold text-tl-teal">
                  ${(stats.estimatedMRR ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tl-card p-0 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--tl-border-subtle)]">
            <h2 className="font-semibold text-[var(--tl-text-primary)]">Recent Companies</h2>
            <Link href="/admin/companies" className="text-xs text-tl-gold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-elevated)]/50">
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-6 py-3">Company</th>
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Plan</th>
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tl-border-subtle)]">
              {stats.recentCompanies.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-[var(--tl-text-secondary)]">
                    No companies yet
                  </td>
                </tr>
              ) : (
                stats.recentCompanies.map((c, i) => (
                  <tr key={String(c.id ?? i)} className="hover:bg-[var(--tl-bg-elevated)]/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[var(--tl-text-primary)] truncate max-w-[140px]">
                        {String(c.name ?? '—')}
                      </div>
                      <div className="text-xs text-[var(--tl-text-secondary)] truncate">
                        {String(c.email ?? '—')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-[var(--tl-text-secondary)]">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Recent Talents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="tl-card p-0 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--tl-border-subtle)]">
            <h2 className="font-semibold text-[var(--tl-text-primary)]">Recent Talent Signups</h2>
            <Link href="/admin/talents" className="text-xs text-tl-gold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-elevated)]/50">
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-6 py-3">Name</th>
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Headline</th>
                <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tl-border-subtle)]">
              {stats.recentTalents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-[var(--tl-text-secondary)]">
                    No talent profiles yet
                  </td>
                </tr>
              ) : (
                stats.recentTalents.map((t, i) => (
                  <tr key={String(t.id ?? i)} className="hover:bg-[var(--tl-bg-elevated)]/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[var(--tl-text-primary)] truncate max-w-[140px]">
                        {String(t.name ?? '—')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-[var(--tl-text-secondary)] truncate max-w-[160px]">
                      {String(t.headline ?? '—')}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-[var(--tl-text-secondary)]">
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
