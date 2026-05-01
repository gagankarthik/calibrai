'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { applications } from '@/lib/data'
import {
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  Download,
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

// ─── Mock data ─────────────────────────────────────────────────────────────────

const weeklyData = [
  { name: 'Jan W1', apps: 8, interviews: 3, offers: 1 },
  { name: 'Jan W2', apps: 14, interviews: 5, offers: 2 },
  { name: 'Jan W3', apps: 19, interviews: 7, offers: 2 },
  { name: 'Feb W1', apps: 12, interviews: 4, offers: 1 },
  { name: 'Feb W2', apps: 22, interviews: 9, offers: 3 },
  { name: 'Feb W3', apps: 28, interviews: 11, offers: 4 },
  { name: 'Mar W1', apps: 18, interviews: 6, offers: 2 },
  { name: 'Mar W2', apps: 31, interviews: 13, offers: 5 },
]

const sources = [
  { name: 'LinkedIn', value: 35, color: '#3B82F6' },
  { name: 'Direct', value: 25, color: '#8B5CF6' },
  { name: 'Referral', value: 20, color: '#10B981' },
  { name: 'GitHub', value: 12, color: '#F59E0B' },
  { name: 'Other', value: 8, color: '#6B7280' },
]

const funnel = [
  { stage: 'Applied', count: 847, pct: 100, color: 'hsl(var(--primary))' },
  { stage: 'Screened', count: 381, pct: 45, color: '#8B5CF6' },
  { stage: 'Interviewed', count: 186, pct: 22, color: '#F59E0B' },
  { stage: 'Offered', count: 68, pct: 8, color: '#10B981' },
  { stage: 'Hired', count: 42, pct: 5, color: '#22C55E' },
]

const deptData = [
  { dept: 'Engineering', days: 18 },
  { dept: 'Design', days: 12 },
  { dept: 'Product', days: 15 },
  { dept: 'Marketing', days: 10 },
  { dept: 'Sales', days: 21 },
]

const sourcingRoi = [
  { source: 'LinkedIn', color: '#3B82F6', applications: 434, interviews: 89, hires: 18, convRate: 4.1, avgCost: 1200 },
  { source: 'Direct', color: '#8B5CF6', applications: 310, interviews: 72, hires: 14, convRate: 4.5, avgCost: 420 },
  { source: 'Referral', color: '#10B981', applications: 248, interviews: 81, hires: 19, convRate: 7.7, avgCost: 280 },
  { source: 'GitHub', color: '#F59E0B', applications: 149, interviews: 44, hires: 8, convRate: 5.4, avgCost: 640 },
  { source: 'Job Boards', color: '#6B7280', applications: 99, interviews: 21, hires: 3, convRate: 3.0, avgCost: 890 },
]

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

function HiringFunnel() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="space-y-3">
      {funnel.map((stage, i) => (
        <div key={stage.stage} className="flex items-center gap-3">
          <div className="w-24 text-xs text-muted-foreground text-right shrink-0">{stage.stage}</div>
          <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
            <motion.div
              className="h-full rounded-lg flex items-center px-3"
              initial={{ width: 0 }}
              animate={{ width: inView ? `${stage.pct}%` : 0 }}
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
          <div className="w-12 text-right">
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

  const totalApplications = applications.length

  const kpiCards = [
    {
      icon: Users,
      iconBg: 'bg-blue-500/10',
      iconCls: 'text-blue-400',
      label: 'Applications',
      value: totalApplications.toLocaleString(),
      trend: '+18%',
      trendDesc: 'vs last period',
    },
    {
      icon: Clock,
      iconBg: 'bg-purple-500/10',
      iconCls: 'text-purple-400',
      label: 'Avg Time to Hire',
      value: '14 days',
      trend: '-21% faster',
      trendDesc: 'vs last quarter',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-emerald-500/10',
      iconCls: 'text-emerald-400',
      label: 'Offer Acceptance',
      value: '87%',
      trend: '+5%',
      trendDesc: 'vs last quarter',
    },
    {
      icon: DollarSign,
      iconBg: 'bg-amber-500/10',
      iconCls: 'text-amber-400',
      label: 'Cost Per Hire',
      value: '$2,840',
      trend: '-12% reduction',
      trendDesc: 'vs last quarter',
    },
  ]

  return (
    <div className="p-6 max-w-screen-xl">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Data-driven hiring decisions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Range pills */}
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {kpiCards.map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconCls}`} />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span className="hidden sm:inline">{card.trend}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
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
        className="grid lg:grid-cols-3 gap-6 mb-6"
      >
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-foreground">Hiring Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applications, interviews, and offers over time
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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
              <XAxis
                dataKey="name"
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text, paddingTop: 12 }}
              />
              <Area
                type="monotone"
                dataKey="apps"
                name="Applications"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#gaApps)"
              />
              <Area
                type="monotone"
                dataKey="interviews"
                name="Interviews"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#gaInt)"
              />
              <Area
                type="monotone"
                dataKey="offers"
                name="Offers"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#gaOff)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-foreground">Application Sources</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Where candidates come from</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={sources}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {sources.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend */}
          <div className="flex flex-wrap gap-2 mt-2">
            {sources.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: entry.color }}
                />
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
        className="grid lg:grid-cols-2 gap-6 mb-6"
      >
        {/* Hiring Funnel */}
        <div className="glass-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-foreground">Hiring Funnel Conversion</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Candidate progression through each stage</p>
          </div>
          <HiringFunnel />
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-6">
          <div className="mb-5">
            <h2 className="font-semibold text-foreground">Avg Days to Hire by Dept</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Average days from application to offer</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="dept"
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: CHART_COLORS.text, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                }}
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
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="font-semibold text-foreground">Sourcing ROI</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Performance and cost breakdown by source</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border bg-muted/20">
                {['Source', 'Applications', 'Interviews', 'Hires', 'Conv. Rate', 'Avg Cost'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sourcingRoi.map((row) => (
                <tr key={row.source} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: row.color }}
                      />
                      <span className="font-medium text-foreground">{row.source}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {row.applications.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{row.interviews}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">{row.hires}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[60px]">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(row.convRate * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{row.convRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    ${row.avgCost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
