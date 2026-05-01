'use client'

import { useState } from 'react'
import { analytics } from '@/lib/data'
import { cn, formatNumber } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Clock, DollarSign, Star,
  Users, ChevronDown, Award,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, LineChart, Line,
} from 'recharts'

const DATE_RANGES = ['This Week', 'This Month', 'Last Quarter', 'Custom']

const CHART_COLORS = {
  grid: 'rgba(255,255,255,0.05)',
  text: 'hsl(215,20%,55%)',
  applications: '#6366f1',
  interviews: '#06b6d4',
  offers: '#10b981',
}

const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

const GENDER_COLORS: Record<string, string> = {
  Male: '#6366f1', Female: '#06b6d4', 'Non-binary': '#10b981', 'Prefer not to say': '#64748b',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 min-w-[160px] shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="text-foreground font-medium ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function SparklineMini({ trend }: { trend: number[] }) {
  const data = trend.map((v, i) => ({ v }))
  const color = trend[trend.length - 1] >= trend[0] ? '#10b981' : '#ef4444'
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function KpiCard({
  label, value, sub, icon: Icon, color, trend, sparkData,
}: {
  label: string; value: string; sub: string; icon: React.ElementType
  color: string; trend?: 'up' | 'down'; sparkData?: number[]
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={cn('p-2.5 rounded-xl', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {sparkData && <SparklineMini trend={sparkData} />}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
        {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

function FunnelChart() {
  const data = analytics.hiringFunnel
  const maxCount = data[0].count

  return (
    <div className="space-y-3">
      {data.map((stage, i) => {
        const widthPct = (stage.count / maxCount) * 100
        const hue = 230 - i * 20
        const color = `hsl(${hue}, 80%, 60%)`
        return (
          <div key={stage.stage}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-28 text-xs text-muted-foreground text-right">{stage.stage}</div>
              <div className="flex-1 h-7 bg-white/[0.04] rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                  style={{ width: `${widthPct}%`, background: `${color}30`, borderLeft: `3px solid ${color}` }}
                >
                  <span className="text-xs font-semibold text-foreground">{formatNumber(stage.count)}</span>
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-xs font-semibold text-foreground">{stage.percentage}%</span>
              </div>
              {stage.dropoff > 0 && (
                <div className="w-20 text-right">
                  <span className="text-xs font-medium text-red-400">-{stage.dropoff}%</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2 pl-32">
        <span>Stage →</span>
        <span className="ml-auto mr-16">Rate</span>
        <span className="w-20 text-right">Dropoff</span>
      </div>
    </div>
  )
}

function SourcingRoiTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Channel', 'Applicants', 'Hired', 'Cost per Hire', 'Quality Score'].map(h => (
              <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {analytics.sourcingChannels.map((ch, i) => (
            <tr
              key={ch.name}
              className={cn(
                'border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors',
                i % 2 === 0 ? 'bg-white/[0.02]' : ''
              )}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="font-medium text-foreground">{ch.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{formatNumber(ch.applicants)}</td>
              <td className="py-3 px-4 text-foreground font-medium">{ch.hired}</td>
              <td className="py-3 px-4 text-muted-foreground">
                {ch.hired > 0 ? `$${Math.round(analytics.costPerHire / ch.hired).toLocaleString()}` : '—'}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full max-w-[80px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      style={{ width: `${ch.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{ch.percentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('This Month')

  const genderData = Object.entries(analytics.diversityMetrics.gender).map(([name, value]) => ({ name, value }))
  const ageData = Object.entries(analytics.diversityMetrics.ageGroup).map(([name, value]) => ({ name, value }))

  const sparkline = [68, 72, 75, 80, 84]

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Hiring performance and pipeline insights</p>
        </div>
        <div className="flex items-center gap-1 p-1 glass rounded-xl">
          {DATE_RANGES.map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                dateRange === r
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Offer Accept Rate"
          value="84%"
          sub="vs 71% industry avg"
          icon={Award}
          color="bg-emerald-500/10 text-emerald-400"
          trend="up"
          sparkData={sparkline}
        />
        <KpiCard
          label="Avg Time to Hire"
          value="28 days"
          sub="vs 44 days industry avg"
          icon={Clock}
          color="bg-blue-500/10 text-blue-400"
          trend="down"
          sparkData={[44, 40, 36, 30, 28]}
        />
        <KpiCard
          label="Cost Per Hire"
          value="$3,200"
          sub="vs $4,700 industry avg"
          icon={DollarSign}
          color="bg-purple-500/10 text-purple-400"
          trend="down"
          sparkData={[4700, 4200, 3900, 3500, 3200]}
        />
        <KpiCard
          label="Quality of Hire"
          value="4.3 / 5"
          sub="Based on 90-day retention"
          icon={Star}
          color="bg-amber-500/10 text-amber-400"
          trend="up"
          sparkData={[3.8, 4.0, 4.1, 4.2, 4.3]}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Area chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Weekly Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Applications, interviews, and offers over time</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.weeklyApplications} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.applications} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.applications} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.interviews} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CHART_COLORS.interviews} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.offers} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={CHART_COLORS.offers} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="week" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.text }} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke={CHART_COLORS.applications} strokeWidth={2} fill="url(#gApps)" />
              <Area type="monotone" dataKey="interviews" name="Interviews" stroke={CHART_COLORS.interviews} strokeWidth={2} fill="url(#gInt)" />
              <Area type="monotone" dataKey="offers" name="Offers" stroke={CHART_COLORS.offers} strokeWidth={2} fill="url(#gOff)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Sourcing Channels</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Where candidates are coming from</p>
            </div>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={220}>
              <PieChart>
                <Pie
                  data={analytics.sourcingChannels}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="applicants"
                >
                  {analytics.sourcingChannels.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'hsl(222 47% 7%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                  labelStyle={{ color: 'hsl(213 31% 91%)' }}
                  itemStyle={{ color: 'hsl(215,20%,55%)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 flex-1">
              {analytics.sourcingChannels.map((ch, i) => (
                <div key={ch.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-muted-foreground flex-1">{ch.name}</span>
                  <span className="text-sm font-medium text-foreground">{ch.percentage}%</span>
                  <span className="text-xs text-muted-foreground">({formatNumber(ch.applicants)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-foreground">Hiring Funnel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Candidate progression through each stage</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Count</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /> Dropoff</span>
          </div>
        </div>
        <FunnelChart />
      </div>

      {/* Diversity section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Gender donut */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-foreground mb-1">Gender Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Of applicants who self-identified</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={160}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {genderData.map(entry => (
                    <Cell key={entry.name} fill={GENDER_COLORS[entry.name] ?? '#64748b'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {genderData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: GENDER_COLORS[entry.name] ?? '#64748b' }} />
                  <span className="text-xs text-muted-foreground flex-1">{entry.name}</span>
                  <span className="text-xs font-semibold text-foreground">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Age bar chart */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-foreground mb-1">Age Groups</h2>
          <p className="text-xs text-muted-foreground mb-4">Applicant age distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ageData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 47% 7%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                itemStyle={{ color: 'hsl(215,20%,55%)' }}
              />
              <Bar dataKey="value" name="%" radius={[4, 4, 0, 0]}>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sourcing ROI table */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground">Sourcing ROI</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Performance by recruiting channel</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/[0.1] px-3 py-1.5 rounded-lg transition-all">
            Export <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
        <SourcingRoiTable />
      </div>
    </div>
  )
}
