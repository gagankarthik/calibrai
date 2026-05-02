'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  BarChart3,
  RefreshCw,
  Layers,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const PLAN_PRICES: Record<string, number> = { starter: 499, growth: 2499, enterprise: 7999 }
const PLAN_COLORS: Record<string, string> = {
  starter: '#0284C7',
  growth: '#059669',
  enterprise: '#4F46E5',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

interface StatsData {
  totalCompanies: number
  totalTalents: number
  activeJobs: number
  totalApplications: number
  crmJobsScraped: number
  crmCandidatesFound: number
  estimatedMRR: number
  planBreakdown: Record<string, number>
  totalJobs: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="tl-card rounded-xl p-3 shadow-card border border-[var(--tl-border-subtle)]">
      <p className="text-xs font-semibold text-[var(--tl-text-primary)] mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[var(--tl-text-secondary)]">{entry.name}:</span>
          <span className="font-semibold text-[var(--tl-text-primary)] ml-auto">
            {typeof entry.value === 'number' && entry.name.includes('MRR')
              ? `$${entry.value.toLocaleString()}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  value,
  label,
  sub,
  iconBg,
  iconCls,
}: {
  icon: React.ElementType
  value: string
  label: string
  sub?: string
  iconBg: string
  iconCls: string
}) {
  return (
    <motion.div variants={itemVariants} className="tl-card p-6 hover:border-tl-gold/30 transition-all group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconCls}`} />
      </div>
      <div className="font-mono text-3xl font-bold text-tl-gold tracking-tight">{value}</div>
      <div className="text-sm text-[var(--tl-text-secondary)] mt-1">{label}</div>
      {sub && <div className="text-xs text-[var(--tl-text-secondary)] mt-0.5 opacity-70">{sub}</div>}
    </motion.div>
  )
}

export default function AdminSaasMetrics() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as StatsData
      setStats(data)
    } catch {
      setError('Failed to load metrics. Check your AWS connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="tl-card p-6 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-[var(--tl-bg-elevated)] mb-4" />
              <div className="h-8 w-20 bg-[var(--tl-bg-elevated)] rounded mb-2" />
              <div className="h-3 w-28 bg-[var(--tl-bg-elevated)] rounded" />
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
        <button onClick={load} className="btn-gold text-sm px-4 py-2">Retry</button>
      </div>
    )
  }

  if (!stats) return null

  const plan = stats.planBreakdown ?? {}
  const totalMRR = stats.estimatedMRR ?? 0
  const totalCompanies = stats.totalCompanies ?? 0
  const avgMRRPerCompany = totalCompanies > 0 ? Math.round(totalMRR / totalCompanies) : 0
  const annualRunRate = totalMRR * 12
  const avgAppsPerJob = stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : '0'

  // Bar chart data by plan
  const planBarData = Object.entries(plan).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    companies: count,
    mrr: count * (PLAN_PRICES[name] ?? 0),
  }))

  // Pie data
  const pieData = Object.entries(plan).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: count,
    color: PLAN_COLORS[name] ?? '#9CA3AF',
  }))

  // Funnel data
  const funnelData = [
    { stage: 'Companies', value: stats.totalCompanies, color: '#4F46E5' },
    { stage: 'Jobs', value: stats.totalJobs, color: '#059669' },
    { stage: 'Applications', value: stats.totalApplications, color: '#0284C7' },
    { stage: 'CRM Jobs', value: stats.crmJobsScraped, color: '#D97706' },
    { stage: 'CRM Candidates', value: stats.crmCandidatesFound, color: '#E11D48' },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-[var(--tl-text-primary)]">SaaS Metrics</h1>
          <p className="text-[var(--tl-text-secondary)] text-sm mt-1">
            Revenue, growth, and platform health indicators
          </p>
        </div>
        <button
          onClick={load}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Key metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard
          icon={DollarSign}
          value={`$${totalMRR.toLocaleString()}`}
          label="Estimated MRR"
          sub="Monthly recurring revenue"
          iconBg="bg-tl-teal/10"
          iconCls="text-tl-teal"
        />
        <MetricCard
          icon={TrendingUp}
          value={`$${annualRunRate.toLocaleString()}`}
          label="Annual Run Rate"
          sub="MRR × 12"
          iconBg="bg-tl-gold/10"
          iconCls="text-tl-gold"
        />
        <MetricCard
          icon={Building2}
          value={`$${avgMRRPerCompany.toLocaleString()}`}
          label="Avg MRR / Company"
          sub="Revenue per account"
          iconBg="bg-tl-blue/10"
          iconCls="text-tl-blue"
        />
        <MetricCard
          icon={Activity}
          value={avgAppsPerJob}
          label="Avg Apps / Job"
          sub="Application rate"
          iconBg="bg-tl-gold/10"
          iconCls="text-tl-gold"
        />
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Bar: MRR by plan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 tl-card p-6"
        >
          <div className="mb-5">
            <p className="section-eyebrow">Revenue Breakdown</p>
            <h2 className="font-semibold text-[var(--tl-text-primary)] mt-2">MRR contribution by plan</h2>
          </div>
          {planBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[var(--tl-text-secondary)] text-sm">
              No plan data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={planBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="companies" name="Companies" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="mrr" name="MRR ($)" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie: plan distribution */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="tl-card p-6"
        >
          <div className="mb-4">
            <p className="section-eyebrow">Plan Mix</p>
            <h2 className="font-semibold text-[var(--tl-text-primary)] mt-2">Company distribution</h2>
          </div>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-[var(--tl-text-secondary)] text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    background: 'var(--tl-bg-surface)',
                    border: '1px solid var(--tl-border-subtle)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#6B7280', fontSize: '11px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Platform funnel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="tl-card p-6 mb-8"
      >
        <div className="mb-6">
          <p className="section-eyebrow">Platform Funnel</p>
          <h2 className="font-semibold text-[var(--tl-text-primary)] mt-2">Volume across all platform entities</h2>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--tl-bg-surface)',
                border: '1px solid var(--tl-border-subtle)',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {funnelData.map((entry) => (
                <Cell key={entry.stage} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Plan detail table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="tl-card p-0 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--tl-border-subtle)] flex items-center gap-2">
          <Layers className="w-4 h-4 text-tl-gold" />
          <h2 className="font-semibold text-[var(--tl-text-primary)]">Plan Revenue Details</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-elevated)]/50">
              <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-6 py-3">Plan</th>
              <th className="text-right text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3">Price / mo</th>
              <th className="text-right text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3">Companies</th>
              <th className="text-right text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3">MRR</th>
              <th className="text-right text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">% of MRR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--tl-border-subtle)]">
            {Object.entries(plan).map(([planName, count]) => {
              const price = PLAN_PRICES[planName] ?? 0
              const planMRR = count * price
              const pct = totalMRR > 0 ? ((planMRR / totalMRR) * 100).toFixed(1) : '0'
              return (
                <tr key={planName} className="hover:bg-[var(--tl-bg-elevated)]/50 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: PLAN_COLORS[planName] ?? '#9CA3AF' }}
                      />
                      <span className="font-medium text-[var(--tl-text-primary)] capitalize">{planName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[var(--tl-text-secondary)]">
                    ${price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-[var(--tl-text-primary)]">
                    {count}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-tl-teal">
                    ${planMRR.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--tl-bg-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: PLAN_COLORS[planName] ?? '#9CA3AF',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--tl-text-secondary)] w-10 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {/* Total row */}
            <tr className="border-t-2 border-[var(--tl-border-subtle)] bg-[var(--tl-bg-elevated)]/30">
              <td className="px-6 py-3.5 font-semibold text-[var(--tl-text-primary)]">Total</td>
              <td className="px-4 py-3.5" />
              <td className="px-4 py-3.5 text-right font-mono font-bold text-[var(--tl-text-primary)]">
                {totalCompanies}
              </td>
              <td className="px-4 py-3.5 text-right font-mono font-bold text-tl-gold text-base">
                ${totalMRR.toLocaleString()}
              </td>
              <td className="px-4 py-3.5 hidden sm:table-cell" />
            </tr>
          </tbody>
        </table>

        {/* Extra KPIs */}
        <div className="grid sm:grid-cols-3 gap-0 border-t border-[var(--tl-border-subtle)]">
          {[
            { icon: Users, label: 'Total Talents', value: stats.totalTalents.toLocaleString(), cls: 'text-tl-teal' },
            { icon: BarChart3, label: 'Active Jobs', value: stats.activeJobs.toLocaleString(), cls: 'text-tl-gold' },
            { icon: TrendingUp, label: 'ARR', value: `$${annualRunRate.toLocaleString()}`, cls: 'text-tl-blue' },
          ].map((kpi, i) => (
            <div
              key={kpi.label}
              className={`px-6 py-4 flex items-center gap-3 ${i < 2 ? 'border-r border-[var(--tl-border-subtle)]' : ''}`}
            >
              <kpi.icon className={`w-4 h-4 ${kpi.cls}`} />
              <div>
                <div className={`font-mono font-bold ${kpi.cls}`}>{kpi.value}</div>
                <div className="text-xs text-[var(--tl-text-secondary)]">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
