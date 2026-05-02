'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs, getApplications } from '@/lib/api'
import type { Job, Application } from '@/lib/types'
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
  'bg-tl-blue',
  'bg-tl-teal',
  'bg-tl-gold',
  'bg-tl-rose',
  'bg-tl-teal',
]

const activityEvents = [
  {
    id: '1',
    initial: 'E',
    initBg: 'bg-tl-blue/20 text-tl-blue',
    text: 'Emma R. applied for Senior Engineer',
    time: '2 min ago',
    badge: 'New Application',
    badgeCls: 'tl-tag-teal',
  },
  {
    id: '2',
    initial: 'J',
    initBg: 'bg-tl-gold/20 text-tl-gold',
    text: 'James T. interview scheduled for Product Manager',
    time: '18 min ago',
    badge: 'Interview Scheduled',
    badgeCls: 'tl-tag-gold',
  },
  {
    id: '3',
    initial: 'S',
    initBg: 'bg-tl-teal/20 text-tl-teal',
    text: 'Sarah K. received an offer for Staff Engineer',
    time: '1h ago',
    badge: 'Offer Sent',
    badgeCls: 'tl-tag-teal',
  },
  {
    id: '4',
    initial: 'A',
    initBg: 'bg-tl-gold/20 text-tl-gold',
    text: 'Alex P. moved to Technical Interview stage',
    time: '3h ago',
    badge: 'Stage Moved',
    badgeCls: 'tl-tag-gold',
  },
  {
    id: '5',
    initial: 'M',
    initBg: 'bg-tl-text-secondary/20 text-tl-text-secondary',
    text: 'Maria L. application viewed by hiring manager',
    time: '2h ago',
    badge: 'Viewed',
    badgeCls: 'tl-tag-blue',
  },
  {
    id: '6',
    initial: 'R',
    initBg: 'bg-tl-teal/20 text-tl-teal',
    text: 'Ryan M. sent a message about the Design Lead role',
    time: '5h ago',
    badge: 'Message',
    badgeCls: 'tl-tag-teal',
  },
]

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
    <div className="tl-card rounded-xl p-3 min-w-[160px] shadow-card border border-tl-border-subtle">
      <p className="text-xs font-semibold text-tl-text-primary mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-tl-text-secondary">{entry.name}:</span>
          <span className="text-tl-text-primary font-medium ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [jobsRes, appsRes] = await Promise.all([getJobs(), getApplications()])
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  // Real data
  const activeJobs = jobs.filter((j) => j.status === 'active')
  const totalApplicants = applications.length
  const hiredThisMonth = applications.filter((a) => a.status === 'hired').length
  const avgDaysToHire = 14

  const kpiCards = [
    {
      icon: Briefcase,
      iconBg: 'bg-tl-gold/10',
      iconCls: 'text-tl-gold',
      value: activeJobs.length.toString(),
      label: 'Active Jobs',
      trend: '+2 this week',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: Users,
      iconBg: 'bg-tl-teal/10',
      iconCls: 'text-tl-teal',
      value: totalApplicants.toLocaleString(),
      label: 'Total Applicants',
      trend: '+23 today',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: UserCheck,
      iconBg: 'bg-tl-teal/10',
      iconCls: 'text-tl-teal',
      value: hiredThisMonth.toString(),
      label: 'Hired This Month',
      trend: '+3 vs last month',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: Clock,
      iconBg: 'bg-tl-gold/10',
      iconCls: 'text-tl-gold',
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
      iconCls: 'text-tl-gold',
      bg: 'bg-tl-gold/10',
      text: 'Emma R. in Screening for 9 days — Move to Interview?',
      action: 'Schedule',
    },
    {
      id: 'r2',
      icon: Info,
      iconCls: 'text-tl-teal',
      bg: 'bg-tl-teal/10',
      text: 'Senior Engineer has 40% fewer views this week — Boost listing?',
      action: 'Boost',
    },
    {
      id: 'r3',
      icon: Zap,
      iconCls: 'text-tl-gold',
      bg: 'bg-tl-gold/10',
      text: '2 offers haven\'t been responded to in 3+ days — Follow up?',
      action: 'Follow Up',
    },
  ]

  const quickActions = [
    {
      icon: Plus,
      label: 'Post Job',
      desc: 'Start a new role',
      href: '/company/jobs/new',
      iconBg: 'bg-tl-gold/10',
      iconCls: 'text-tl-gold',
    },
    {
      icon: Kanban,
      label: 'Pipeline',
      desc: 'Review candidates',
      href: '/company/pipeline',
      iconBg: 'bg-tl-teal/10',
      iconCls: 'text-tl-teal',
    },
    {
      icon: Calendar,
      label: 'Schedule',
      desc: 'Book interviews',
      href: '/company/pipeline',
      iconBg: 'bg-tl-gold/10',
      iconCls: 'text-tl-gold',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      desc: 'View insights',
      href: '/company/analytics',
      iconBg: 'bg-tl-teal/10',
      iconCls: 'text-tl-teal',
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-screen">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-tl-text-primary">
            Good morning, Stripe Corp
          </h1>
          <p className="text-tl-text-secondary text-sm mt-1">
            Thursday, May 1, 2026 · 3 urgent items need your attention
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-tl-teal/10 text-tl-teal border border-tl-teal/20">
            <span className="w-1.5 h-1.5 rounded-full bg-tl-teal animate-pulse" />
            Hiring Health: Strong
          </span>
          <Link href="/company/jobs/new" className="btn-gold inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Post New Job
          </Link>
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
            className="tl-card p-5 hover:border-tl-gold/30 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.iconBg} transition-transform duration-200 group-hover:scale-110`}>
              <card.icon className={`w-5 h-5 ${card.iconCls}`} />
            </div>
            <div className="font-mono text-3xl text-tl-gold tracking-tight">{card.value}</div>
            <div className="text-sm text-tl-text-secondary mt-1">{card.label}</div>
            <div className="flex items-center gap-1 mt-2">
              <card.TrendIcon
                className={`w-3 h-3 ${card.trendType === 'positive' ? 'text-tl-teal' : 'text-tl-rose'}`}
              />
              <span
                className={`text-xs font-medium ${card.trendType === 'positive' ? 'text-tl-teal' : 'text-tl-rose'}`}
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
            className="tl-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="section-eyebrow">Hiring Activity</p>
                <h2 className="font-semibold text-tl-text-primary mt-1">Applications, interviews and offers over time</h2>
              </div>
              {/* Time range pills */}
              <div className="flex items-center gap-1 p-1 bg-tl-bg-base rounded-lg">
                {(['7d', '30d', '90d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      timeRange === r
                        ? 'bg-tl-gold/20 text-tl-gold border border-tl-gold/30'
                        : 'text-tl-text-secondary hover:text-tl-text-primary'
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
                        <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1ECDB3" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#1ECDB3" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOffs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5C7A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF5C7A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(242,240,232,0.06)" />
                    <XAxis dataKey="week" tick={{ fill: '#9B9890', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9B9890', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#9B9890', paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: '#9B9890' }}>{value}</span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#C9A84C"
                      strokeWidth={2}
                      fill="url(#gApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interviews"
                      name="Interviews"
                      stroke="#1ECDB3"
                      strokeWidth={2}
                      fill="url(#gInts)"
                    />
                    <Area
                      type="monotone"
                      dataKey="offers"
                      name="Offers"
                      stroke="#FF5C7A"
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
            className="tl-card p-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-tl-border-subtle">
              <div>
                <h2 className="font-semibold text-tl-text-primary">Active Jobs Overview</h2>
                <p className="text-xs text-tl-text-secondary mt-0.5">{activeJobs.length} positions currently open</p>
              </div>
              <Link href="/company/jobs" className="btn-ghost text-xs inline-flex items-center gap-1">
                Manage all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tl-border-subtle bg-tl-bg-base/50">
                    <th className="text-left text-xs font-semibold text-tl-text-secondary uppercase tracking-wide px-6 py-3">
                      Job Title
                    </th>
                    <th className="text-left text-xs font-semibold text-tl-text-secondary uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                      Applicants
                    </th>
                    <th className="text-left text-xs font-semibold text-tl-text-secondary uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                      Pipeline
                    </th>
                    <th className="text-left text-xs font-semibold text-tl-text-secondary uppercase tracking-wide px-4 py-3">
                      Status
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-tl-border-subtle">
                  {activeJobs.slice(0, 5).map((job) => (
                    <tr key={job.id} className="hover:bg-tl-bg-elevated/50 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-tl-text-primary">{job.title}</div>
                        <div className="text-xs text-tl-text-secondary mt-0.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-tl-bg-elevated text-tl-text-secondary text-[10px]">
                            {job.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-tl-text-secondary" />
                          <span className="font-mono font-semibold text-tl-text-primary">{job.applicantCount}</span>
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
                              ? 'bg-tl-teal/10 text-tl-teal border-tl-teal/20'
                              : 'bg-tl-bg-elevated text-tl-text-secondary border-tl-border-subtle'
                          }`}
                        >
                          {job.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href="/company/pipeline"
                          className="btn-ghost text-xs h-7 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center px-3"
                        >
                          View
                        </Link>
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
            className="tl-card-gold p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tl-gold" />
                <h2 className="font-semibold text-tl-text-primary">AI Insights</h2>
              </div>
              <span className="tl-tag-gold text-[10px]">
                3 actions
              </span>
            </div>
            <div className="space-y-3">
              {aiRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-tl-bg-base/50 border border-tl-border-subtle space-y-2.5"
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg ${rec.bg} shrink-0 mt-0.5`}>
                      <rec.icon className={`w-3.5 h-3.5 ${rec.iconCls}`} />
                    </div>
                    <p className="text-xs text-tl-text-primary leading-relaxed">{rec.text}</p>
                  </div>
                  <button className="btn-ghost w-full text-[11px] font-semibold py-1.5 rounded-lg">
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
            className="tl-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tl-teal animate-pulse" />
                <h2 className="font-semibold text-tl-text-primary">Live Feed</h2>
              </div>
              <Link
                href="/company/pipeline"
                className="text-xs text-tl-text-secondary hover:text-tl-gold transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-1 divide-y divide-tl-border-subtle">
              {activityEvents.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-center gap-3 py-2.5 hover:bg-tl-bg-elevated/30 transition-colors px-1 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ev.initBg}`}
                  >
                    {ev.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-tl-text-primary truncate">{ev.text}</p>
                    <p className="text-[10px] text-tl-text-secondary mt-0.5">{ev.time}</p>
                  </div>
                  <span className={`hidden sm:inline-flex text-[10px] font-medium shrink-0 ${ev.badgeCls}`}>
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
              className="tl-card p-5 hover:border-tl-gold/30 cursor-pointer transition-all group block text-center shadow-card hover:shadow-gold"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
              >
                <action.icon className={`w-5 h-5 ${action.iconCls}`} />
              </div>
              <div className="font-semibold text-tl-text-primary text-sm">{action.label}</div>
              <div className="text-xs text-tl-text-secondary mt-1">{action.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
