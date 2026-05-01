'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { jobs, applications } from '@/lib/data'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Kanban,
  Calendar,
  BarChart3,
  ChevronRight,
  AlertCircle,
  Info,
  Zap,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ─── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
}

// ─── Static data ───────────────────────────────────────────────────────────────

const chartData = [
  { week: 'Wk 1', applications: 12, interviews: 4, offers: 1 },
  { week: 'Wk 2', applications: 19, interviews: 7, offers: 2 },
  { week: 'Wk 3', applications: 15, interviews: 5, offers: 3 },
  { week: 'Wk 4', applications: 28, interviews: 9, offers: 2 },
  { week: 'Wk 5', applications: 22, interviews: 11, offers: 4 },
  { week: 'Wk 6', applications: 31, interviews: 8, offers: 3 },
  { week: 'Wk 7', applications: 25, interviews: 12, offers: 5 },
  { week: 'Wk 8', applications: 38, interviews: 14, offers: 6 },
]

const STAGE_DOT_COLORS = [
  'bg-blue-400',
  'bg-purple-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-green-400',
]

const activityEvents = [
  {
    id: '1',
    initial: 'E',
    initBg: 'bg-blue-500/20 text-blue-400',
    text: 'Emma R. applied for Senior Engineer',
    time: '2 min ago',
    badge: 'New Application',
    badgeCls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: '2',
    initial: 'J',
    initBg: 'bg-purple-500/20 text-purple-400',
    text: 'James T. interview scheduled for Product Manager',
    time: '18 min ago',
    badge: 'Interview Scheduled',
    badgeCls: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    id: '3',
    initial: 'S',
    initBg: 'bg-emerald-500/20 text-emerald-400',
    text: 'Sarah K. received an offer for Staff Engineer',
    time: '1h ago',
    badge: 'Offer Sent',
    badgeCls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: '4',
    initial: 'M',
    initBg: 'bg-amber-500/20 text-amber-400',
    text: 'Alex P. moved to Technical Interview stage',
    time: '3h ago',
    badge: 'Stage Moved',
    badgeCls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: '5',
    initial: 'M',
    initBg: 'bg-gray-500/20 text-gray-400',
    text: 'Maria L. application viewed by hiring manager',
    time: '2h ago',
    badge: 'Viewed',
    badgeCls: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  {
    id: '6',
    initial: 'R',
    initBg: 'bg-cyan-500/20 text-cyan-400',
    text: 'Ryan M. sent a message about the Design Lead role',
    time: '5h ago',
    badge: 'Message',
    badgeCls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
]

const CHART_COLORS = {
  grid: 'rgba(255,255,255,0.05)',
  text: 'hsl(215,20%,55%)',
}

// ─── Custom tooltip ─────────────────────────────────────────────────────────────

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

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Real data
  const activeJobs = jobs.filter((j) => j.status === 'active')
  const totalApplicants = applications.length
  const hiredThisMonth = applications.filter((a) => a.status === 'hired').length
  const avgDaysToHire = 14

  const kpiCards = [
    {
      icon: Briefcase,
      iconBg: 'bg-blue-500/10',
      iconCls: 'text-blue-400',
      value: activeJobs.length.toString(),
      label: 'Active Jobs',
      trend: '+2 this week',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: Users,
      iconBg: 'bg-purple-500/10',
      iconCls: 'text-purple-400',
      value: totalApplicants.toLocaleString(),
      label: 'Total Applicants',
      trend: '+23 today',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: UserCheck,
      iconBg: 'bg-emerald-500/10',
      iconCls: 'text-emerald-400',
      value: hiredThisMonth.toString(),
      label: 'Hired This Month',
      trend: '+3 vs last month',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconCls: 'text-amber-400',
      value: `${avgDaysToHire} days`,
      label: 'Avg Time to Hire',
      trend: '-3 days improvement',
      trendType: 'positive' as const,
      TrendIcon: TrendingDown,
    },
  ]

  const aiRecommendations = [
    {
      id: 'r1',
      icon: AlertCircle,
      iconCls: 'text-amber-400',
      bg: 'bg-amber-500/10',
      text: 'Emma R. in Screening for 9 days — Move to Interview?',
      action: 'Schedule',
      actionCls: 'text-amber-400 hover:bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'r2',
      icon: Info,
      iconCls: 'text-blue-400',
      bg: 'bg-blue-500/10',
      text: 'Senior Engineer has 40% fewer views this week — Boost listing?',
      action: 'Boost',
      actionCls: 'text-blue-400 hover:bg-blue-500/10 border-blue-500/30',
    },
    {
      id: 'r3',
      icon: Zap,
      iconCls: 'text-purple-400',
      bg: 'bg-purple-500/10',
      text: '2 offers haven\'t been responded to in 3+ days — Follow up?',
      action: 'Follow Up',
      actionCls: 'text-purple-400 hover:bg-purple-500/10 border-purple-500/30',
    },
  ]

  const quickActions = [
    {
      icon: Plus,
      label: 'Post Job',
      desc: 'Start a new role',
      href: '/company/jobs/new',
      iconBg: 'bg-blue-500/10',
      iconCls: 'text-blue-400',
    },
    {
      icon: Kanban,
      label: 'Pipeline',
      desc: 'Review candidates',
      href: '/company/pipeline',
      iconBg: 'bg-purple-500/10',
      iconCls: 'text-purple-400',
    },
    {
      icon: Calendar,
      label: 'Schedule',
      desc: 'Book interviews',
      href: '/company/pipeline',
      iconBg: 'bg-amber-500/10',
      iconCls: 'text-amber-400',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      desc: 'View insights',
      href: '/company/analytics',
      iconBg: 'bg-emerald-500/10',
      iconCls: 'text-emerald-400',
    },
  ]

  return (
    <div className="p-6 max-w-screen-xl">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Good morning, Stripe Corp 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Thursday, May 1, 2026 · 3 urgent items need your attention
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Hiring Health: Strong
          </span>
          <Button asChild className="gap-2 bg-primary text-primary-foreground">
            <Link href="/company/jobs/new">
              <Plus className="w-4 h-4" /> Post New Job
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {kpiCards.map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            className="glass-card p-5 hover:border-primary/30 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.iconBg} transition-transform duration-200 group-hover:scale-110`}>
              <card.icon className={`w-5 h-5 ${card.iconCls}`} />
            </div>
            <div className="text-3xl font-black text-foreground tracking-tight">{card.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{card.label}</div>
            <div className="flex items-center gap-1 mt-2">
              <card.TrendIcon
                className={`w-3 h-3 ${card.trendType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}
              />
              <span
                className={`text-xs font-medium ${card.trendType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN CONTENT — 3-col grid ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* LEFT: Hiring Activity Chart + Jobs table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hiring Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-semibold text-foreground">Hiring Activity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Applications, interviews and offers over time</p>
              </div>
              {/* Time range pills */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                {(['7d', '30d', '90d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      timeRange === r
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={timeRange}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOffs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="week" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: CHART_COLORS.text, paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: CHART_COLORS.text }}>{value}</span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#gApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interviews"
                      name="Interviews"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#gInts)"
                    />
                    <Area
                      type="monotone"
                      dataKey="offers"
                      name="Offers"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#gOffs)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Active Jobs Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="glass-card p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">Active Jobs Overview</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{activeJobs.length} positions currently open</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1">
                <Link href="/company/jobs">
                  Manage all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">
                      Job Title
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                      Applicants
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                      Pipeline
                    </th>
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeJobs.slice(0, 5).map((job) => (
                    <tr key={job.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-foreground">{job.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">
                            {job.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{job.applicantCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          {STAGE_DOT_COLORS.map((cls, i) => (
                            <span key={i} className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            job.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}
                        >
                          {job.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link href="/company/pipeline">View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: AI Recommendations + Recent Activity */}
        <div className="lg:col-span-1 space-y-4">
          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="font-semibold text-foreground">AI Insights</h2>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                3 actions
              </span>
            </div>
            <div className="space-y-3">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg ${rec.bg} shrink-0 mt-0.5`}>
                      <rec.icon className={`w-3.5 h-3.5 ${rec.iconCls}`} />
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{rec.text}</p>
                  </div>
                  <button
                    className={`w-full text-[11px] font-semibold py-1.5 rounded-lg border transition-all ${rec.actionCls}`}
                  >
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="font-semibold text-foreground">Live Feed</h2>
              </div>
              <Link
                href="/company/pipeline"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {activityEvents.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ev.initBg}`}
                  >
                    {ev.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{ev.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ev.time}</p>
                  </div>
                  <span
                    className={`hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${ev.badgeCls}`}
                  >
                    {ev.badge}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {quickActions.map((action) => (
          <motion.div key={action.label} variants={itemVariants}>
            <Link
              href={action.href}
              className="glass-card p-5 hover:border-primary/30 cursor-pointer transition-all group block text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
              >
                <action.icon className={`w-5 h-5 ${action.iconCls}`} />
              </div>
              <div className="font-semibold text-foreground text-sm">{action.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{action.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
