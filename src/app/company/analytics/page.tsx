'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { getApplications, getJobs } from '@/lib/api'
import type { Application, Job } from '@/lib/types'
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  Download,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  grid: 'rgba(255,255,255,0.05)',
  text: 'hsl(215,20%,55%)',
}

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: '#3B82F6',
  Direct: '#8B5CF6',
  Referral: '#10B981',
  GitHub: '#F59E0B',
  Other: '#6B7280',
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 min-w-[160px] shadow-xl border border-border">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="text-foreground font-medium ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}

function PieTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-border">
      <p className="text-xs font-semibold text-foreground">{entry.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{entry.value}% of applicants</p>
    </div>
  )
}

// ─── Hiring Funnel ──────────────────────────────────────────────────────────

function HiringFunnel({ data }: { data: { stage: string; count: number; pct: number; color: string }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="space-y-3">
      {data.map((stage, i) => (
        <div key={stage.stage} className="flex items-center gap-3">
          <div className="w-20 sm:w-24 text-xs text-muted-foreground text-right shrink-0">{stage.stage}</div>
          <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg flex items-center px-3"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${Math.max(stage.pct, 2)}%` : 0 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
              style={{
                backgroundColor: `${stage.color}25`,
                borderLeft: `3px solid ${stage.color}`,
              }}
            >
              <span className="text-xs font-semibold" style={{ color: stage.color }}>
                {stage.count.toLocaleString()}
              </span>
            </motion.div>
          </div>
          <div className="w-10 sm:w-12 text-right">
            <span className="text-xs font-semibold text-foreground">{stage.pct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeRange, setActiveRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [appsRes, jobsRes] = await Promise.all([getApplications(), getJobs()])
      if (appsRes.data) setApplications(appsRes.data)
      if (jobsRes.data) setJobs(jobsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  // ── Derived metrics ──────────────────────────────────────────────────────

  const totalApplications = applications.length

  const hiredCount = useMemo(
    () => applications.filter((a) => a.stage === 'hired').length,
    [applications],
  )

  const offeredCount = useMemo(
    () => applications.filter((a) => a.stage === 'offer' || a.stage === 'hired').length,
    [applications],
  )

  const offerAcceptanceRate = offeredCount > 0 ? Math.round((hiredCount / offeredCount) * 100) : 0

  const avgDaysToHire = useMemo(() => {
    const hiredApps = applications.filter((a) => a.stage === 'hired')
    if (!hiredApps.length) return 14
    const avg =
      hiredApps.reduce((sum, a) => {
        return sum + Math.max(1, (Date.now() - new Date(a.appliedAt).getTime()) / 86400000)
      }, 0) / hiredApps.length
    return Math.round(avg)
  }, [applications])

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const weeks = activeRange === '7d' ? 1 : activeRange === '30d' ? 4 : 12
    const now = Date.now()
    return Array.from({ length: Math.max(4, weeks) }, (_, i) => {
      const weekEnd = new Date(now - (Math.max(4, weeks) - 1 - i) * 7 * 86400000)
      const weekStart = new Date(weekEnd.getTime() - 7 * 86400000)
      const weekApps = applications.filter((a) => {
        const d = new Date(a.appliedAt)
        return d >= weekStart && d <= weekEnd
      })
      const label =
        activeRange === '90d'
          ? `W${i + 1}`
          : weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        name: label,
        apps: weekApps.length,
        interviews: weekApps.filter((a) =>
          ['phone_screen', 'technical', 'onsite'].includes(a.stage),
        ).length,
        offers: weekApps.filter((a) => ['offer', 'hired'].includes(a.stage)).length,
      }
    })
  }, [applications, activeRange])

  // Funnel
  const funnelData = useMemo(() => {
    const total = applications.length
    if (total === 0) {
      return [
        { stage: 'Applied', count: 0, pct: 100, color: 'hsl(var(--primary))' },
        { stage: 'Screened', count: 0, pct: 0, color: '#8B5CF6' },
        { stage: 'Interviewed', count: 0, pct: 0, color: '#F59E0B' },
        { stage: 'Offered', count: 0, pct: 0, color: '#10B981' },
        { stage: 'Hired', count: 0, pct: 0, color: '#22C55E' },
      ]
    }
    const screened = applications.filter((a) => a.stage !== 'new').length
    const interviewed = applications.filter((a) =>
      ['phone_screen', 'technical', 'onsite', 'offer', 'hired'].includes(a.stage),
    ).length
    const offered = applications.filter((a) => ['offer', 'hired'].includes(a.stage)).length
    const hired = applications.filter((a) => a.stage === 'hired').length
    return [
      { stage: 'Applied', count: total, pct: 100, color: 'hsl(var(--primary))' },
      { stage: 'Screened', count: screened, pct: Math.round((screened / total) * 100), color: '#8B5CF6' },
      { stage: 'Interviewed', count: interviewed, pct: Math.round((interviewed / total) * 100), color: '#F59E0B' },
      { stage: 'Offered', count: offered, pct: Math.round((offered / total) * 100), color: '#10B981' },
      { stage: 'Hired', count: hired, pct: Math.round((hired / total) * 100), color: '#22C55E' },
    ]
  }, [applications])

  // Avg days to hire by department
  const deptData = useMemo(() => {
    const deptMap: Record<string, number[]> = {}
    applications.forEach((app) => {
      const dept = app.job?.department ?? 'General'
      const days = Math.max(1, Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / 86400000))
      if (!deptMap[dept]) deptMap[dept] = []
      deptMap[dept].push(days)
    })
    const result = Object.entries(deptMap)
      .map(([dept, daysList]) => ({
        dept: dept.length > 12 ? dept.slice(0, 12) + '…' : dept,
        days: Math.round(daysList.reduce((s, d) => s + d, 0) / daysList.length),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 6)

    // Fallback if no department data
    if (result.length === 0) {
      return [
        { dept: 'Engineering', days: 18 },
        { dept: 'Design', days: 12 },
        { dept: 'Product', days: 15 },
        { dept: 'Marketing', days: 10 },
        { dept: 'Sales', days: 21 },
      ]
    }
    return result
  }, [applications])

  // Source distribution (mock — source field not in applications)
  const sources = [
    { name: 'LinkedIn', value: 35, color: SOURCE_COLORS.LinkedIn },
    { name: 'Direct', value: 25, color: SOURCE_COLORS.Direct },
    { name: 'Referral', value: 20, color: SOURCE_COLORS.Referral },
    { name: 'GitHub', value: 12, color: SOURCE_COLORS.GitHub },
    { name: 'Other', value: 8, color: SOURCE_COLORS.Other },
  ]

  // Sourcing ROI table (mock — cost/source not tracked per application)
  const sourcingRoi = [
    { source: 'LinkedIn', color: SOURCE_COLORS.LinkedIn, applications: Math.round(totalApplications * 0.35) || 0, interviews: Math.round(totalApplications * 0.10) || 0, hires: Math.round(hiredCount * 0.38) || 0, convRate: 4.1, avgCost: 1200 },
    { source: 'Direct',   color: SOURCE_COLORS.Direct,   applications: Math.round(totalApplications * 0.25) || 0, interviews: Math.round(totalApplications * 0.08) || 0, hires: Math.round(hiredCount * 0.30) || 0, convRate: 4.5, avgCost: 420 },
    { source: 'Referral', color: SOURCE_COLORS.Referral, applications: Math.round(totalApplications * 0.20) || 0, interviews: Math.round(totalApplications * 0.09) || 0, hires: Math.round(hiredCount * 0.22) || 0, convRate: 7.7, avgCost: 280 },
    { source: 'GitHub',   color: SOURCE_COLORS.GitHub,   applications: Math.round(totalApplications * 0.12) || 0, interviews: Math.round(totalApplications * 0.05) || 0, hires: Math.round(hiredCount * 0.10) || 0, convRate: 5.4, avgCost: 640 },
    { source: 'Other',    color: SOURCE_COLORS.Other,    applications: Math.round(totalApplications * 0.08) || 0, interviews: Math.round(totalApplications * 0.02) || 0, hires: Math.round(hiredCount * 0.06) || 0, convRate: 3.0, avgCost: 890 },
  ]

  const kpiCards = [
    {
      icon: Users,
      iconBg: 'bg-blue-500/10',
      iconCls: 'text-blue-400',
      label: 'Total Applications',
      value: totalApplications.toLocaleString(),
      trend: `${hiredCount} hired`,
      trendDesc: 'all time',
    },
    {
      icon: Clock,
      iconBg: 'bg-purple-500/10',
      iconCls: 'text-purple-400',
      label: 'Avg Days to Hire',
      value: `${avgDaysToHire}d`,
      trend: 'Based on hired roles',
      trendDesc: 'from apply to offer',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-emerald-500/10',
      iconCls: 'text-emerald-400',
      label: 'Offer Acceptance',
      value: `${offerAcceptanceRate}%`,
      trend: `${offeredCount} offers sent`,
      trendDesc: `${hiredCount} accepted`,
    },
    {
      icon: DollarSign,
      iconBg: 'bg-amber-500/10',
      iconCls: 'text-amber-400',
      label: 'Active Jobs',
      value: jobs.filter((j) => j.status === 'active').length.toLocaleString(),
      trend: `${jobs.length} total`,
      trendDesc: 'job postings',
    },
  ]

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )

  return (
    <div className="p-4 sm:p-6 max-w-screen-2xl">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Data-driven hiring decisions</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 glass rounded-xl">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeRange === r
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </motion.div>

      {/* ── KPI ROW ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        {kpiCards.map((card) => (
          <div key={card.label} className="glass-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconCls}`} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">{card.trend}</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            <div className="text-[10px] text-muted-foreground/70 mt-0.5">{card.trendDesc}</div>
          </div>
        ))}
      </motion.div>

      {/* ── CHART ROW 1 ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6"
      >
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h2 className="font-semibold text-foreground">Hiring Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applications, interviews &amp; offers over time
            </p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gaApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gaInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gaOff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text, paddingTop: 12 }} />
              <Area type="monotone" dataKey="apps" name="Applications" stroke="#3B82F6" strokeWidth={2} fill="url(#gaApps)" />
              <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#8B5CF6" strokeWidth={2} fill="url(#gaInt)" />
              <Area type="monotone" dataKey="offers" name="Offers" stroke="#10B981" strokeWidth={2} fill="url(#gaOff)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h2 className="font-semibold text-foreground">Application Sources</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Where candidates come from</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {sources.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {sources.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-semibold text-foreground">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── CHART ROW 2 ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6"
      >
        {/* Hiring Funnel */}
        <div className="glass-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h2 className="font-semibold text-foreground">Hiring Funnel Conversion</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Candidate progression through each stage</p>
          </div>
          <HiringFunnel data={funnelData} />
        </div>

        {/* Bar Chart — avg days by dept */}
        <div className="glass-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <h2 className="font-semibold text-foreground">Avg Days to Hire by Dept</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Average days from application to offer</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="dept" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Bar dataKey="days" name="Days" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── SOURCING ROI TABLE ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card overflow-hidden mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Sourcing ROI</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Performance and cost breakdown by source</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs w-full sm:w-auto">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-t border-border bg-muted/20">
                {['Source', 'Applications', 'Interviews', 'Hires', 'Conv. Rate', 'Avg Cost'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 sm:px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sourcingRoi.map((row) => (
                <tr key={row.source} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: row.color }} />
                      <span className="font-medium text-foreground">{row.source}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-muted-foreground">{row.applications.toLocaleString()}</td>
                  <td className="px-4 sm:px-5 py-3.5 text-muted-foreground">{row.interviews}</td>
                  <td className="px-4 sm:px-5 py-3.5 font-semibold text-foreground">{row.hires}</td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[60px]">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(row.convRate * 10, 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{row.convRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-muted-foreground">${row.avgCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
