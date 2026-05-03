'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getCompanyJobs, getApplications } from '@/lib/api'
import type { Job, Application } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import { STAGE_LABELS } from '@/lib/constants'
import {
  Briefcase, Users, UserCheck, Clock,
  TrendingUp, Plus, Kanban, Calendar, BarChart3,
  ChevronRight, AlertCircle, Info, Zap, Sparkles,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
}

const AVATAR_PALETTES = [
  'bg-tl-blue/20 text-tl-blue',
  'bg-tl-gold/20 text-tl-gold',
  'bg-tl-teal/20 text-tl-teal',
  'bg-tl-rose/20 text-tl-rose',
]

function avatarPalette(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

const STAGE_BADGE_CLS: Record<string, string> = {
  new: 'tl-tag-teal', screening: 'tl-tag-gold', phone_screen: 'tl-tag-teal',
  technical: 'tl-tag-gold', onsite: 'tl-tag-teal', offer: 'tl-tag-gold',
  hired: 'tl-tag-teal', rejected: 'tl-tag-rose',
}

interface ChartTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}
function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="tl-card rounded-xl p-3 min-w-[160px] shadow-card border border-tl-border-subtle">
      <p className="text-xs font-semibold text-tl-text-primary mb-2">{label}</p>
      {payload.map(e => (
        <div key={e.name} className="flex items-center gap-2 text-xs py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-tl-text-secondary">{e.name}:</span>
          <span className="text-tl-text-primary font-medium ml-auto">{e.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CompanyDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const [jobsRes, appsRes, userRes] = await Promise.all([
        getCompanyJobs({ limit: 100 }),
        getApplications(),
        fetch('/api/auth/me').then(r => r.ok ? r.json() : null).catch(() => null),
      ])
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      if (userRes && !userRes.error) {
        setCompanyName(userRes.companyName ?? userRes.name ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Derived metrics ────────────────────────────────────────────────────────
  const activeJobs = useMemo(() => jobs.filter(j => j.status === 'active'), [jobs])
  const totalApplicants = applications.length
  const hiredCount = applications.filter(a => a.stage === 'hired').length

  const avgDaysToHire = useMemo(() => {
    const hired = applications.filter(a => a.stage === 'hired')
    if (!hired.length) return null
    const avg = hired.reduce((sum, a) => {
      return sum + Math.max(1, (new Date(a.updatedAt).getTime() - new Date(a.appliedAt).getTime()) / 86400000)
    }, 0) / hired.length
    return Math.round(avg)
  }, [applications])

  // ── Chart data — last N weeks of activity ─────────────────────────────────
  const chartData = useMemo(() => {
    const weeks = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : 12
    return Array.from({ length: Math.max(4, weeks) }, (_, i) => {
      const weekEnd = new Date(Date.now() - (weeks - 1 - i) * 7 * 86400000)
      const weekStart = new Date(weekEnd.getTime() - 7 * 86400000)
      const weekApps = applications.filter(a => {
        const d = new Date(a.appliedAt)
        return d >= weekStart && d < weekEnd
      })
      return {
        week: `Wk ${i + 1}`,
        applications: weekApps.length,
        interviews: weekApps.filter(a => ['phone_screen', 'technical', 'onsite'].includes(a.stage)).length,
        offers: weekApps.filter(a => a.stage === 'offer' || a.stage === 'hired').length,
      }
    })
  }, [applications, timeRange])

  // ── Activity feed from real applications ─────────────────────────────────
  const activityEvents = useMemo(() => {
    const sorted = [...applications]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 6)

    if (sorted.length === 0) return []

    return sorted.map(app => {
      const name = app.candidate?.name ?? `Applicant #${app.id?.slice(-4) ?? '—'}`
      const initial = name[0]?.toUpperCase() ?? '?'
      const role = app.job?.title ?? 'a position'
      const stage = app.stage ?? 'applied'
      const isNew = stage === 'new'
      return {
        id: app.id ?? Math.random().toString(),
        initial,
        initBg: avatarPalette(name),
        text: isNew
          ? `${name} applied for ${role}`
          : `${name} moved to ${STAGE_LABELS[app.stage] ?? stage} for ${role}`,
        time: timeAgo(app.appliedAt),
        badge: isNew ? 'New' : STAGE_LABELS[app.stage] ?? stage,
        badgeCls: STAGE_BADGE_CLS[stage] ?? 'tl-tag-gold',
      }
    })
  }, [applications])

  // ── AI Insights derived from real data ───────────────────────────────────
  const aiRecommendations = useMemo(() => {
    const recs = []
    const stale = applications.filter(a => {
      const days = (Date.now() - new Date(a.updatedAt).getTime()) / 86400000
      return days > 7 && !['hired', 'rejected'].includes(a.stage)
    })
    if (stale.length > 0) {
      recs.push({
        id: 'stale', icon: AlertCircle, iconCls: 'text-tl-gold', bg: 'bg-tl-gold/10',
        text: `${stale.length} candidate${stale.length > 1 ? 's have' : ' has'} been in the pipeline for over 7 days — review their status`,
        action: 'Review Pipeline',
      })
    }
    const pendingOffers = applications.filter(a => a.stage === 'offer')
    if (pendingOffers.length > 0) {
      recs.push({
        id: 'offers', icon: Info, iconCls: 'text-tl-teal', bg: 'bg-tl-teal/10',
        text: `${pendingOffers.length} pending offer${pendingOffers.length > 1 ? 's' : ''} awaiting response — follow up to close faster`,
        action: 'Follow Up',
      })
    }
    if (activeJobs.length > 0 && totalApplicants === 0) {
      recs.push({
        id: 'noApps', icon: Zap, iconCls: 'text-tl-gold', bg: 'bg-tl-gold/10',
        text: `${activeJobs.length} active job${activeJobs.length > 1 ? 's' : ''} with no applicants yet — boost visibility to attract candidates`,
        action: 'Boost Listing',
      })
    }
    if (recs.length === 0) {
      recs.push({
        id: 'healthy', icon: Sparkles, iconCls: 'text-tl-teal', bg: 'bg-tl-teal/10',
        text: 'Your hiring pipeline looks healthy! Keep reviewing candidates regularly for the best results.',
        action: 'View Pipeline',
      })
    }
    return recs
  }, [applications, activeJobs, totalApplicants])

  const quickActions = [
    { icon: Plus,     label: 'Post Job',  desc: 'Start a new role',     href: '/company/jobs/new',  iconBg: 'bg-tl-gold/10',  iconCls: 'text-tl-gold' },
    { icon: Kanban,   label: 'Pipeline',  desc: 'Review candidates',    href: '/company/pipeline',  iconBg: 'bg-tl-teal/10',  iconCls: 'text-tl-teal' },
    { icon: Calendar, label: 'Schedule',  desc: 'Book interviews',      href: '/company/pipeline',  iconBg: 'bg-tl-gold/10',  iconCls: 'text-tl-gold' },
    { icon: BarChart3, label: 'Analytics', desc: 'View insights',       href: '/company/analytics', iconBg: 'bg-tl-teal/10',  iconCls: 'text-tl-teal' },
  ]

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const urgentCount = aiRecommendations.filter(r => r.id !== 'healthy').length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const kpiCards = [
    {
      icon: Briefcase, iconBg: 'bg-tl-gold/10', iconCls: 'text-tl-gold',
      value: activeJobs.length.toString(), label: 'Active Jobs',
      sub: `${jobs.length} total`, TrendIcon: TrendingUp, trendType: 'positive' as const,
    },
    {
      icon: Users, iconBg: 'bg-tl-teal/10', iconCls: 'text-tl-teal',
      value: totalApplicants.toLocaleString(), label: 'Total Applicants',
      sub: `${applications.filter(a => a.stage === 'new').length} new`, TrendIcon: TrendingUp, trendType: 'positive' as const,
    },
    {
      icon: UserCheck, iconBg: 'bg-tl-teal/10', iconCls: 'text-tl-teal',
      value: hiredCount.toString(), label: 'Hired',
      sub: `${applications.filter(a => a.stage === 'offer').length} offers pending`, TrendIcon: TrendingUp, trendType: 'positive' as const,
    },
    {
      icon: Clock, iconBg: 'bg-tl-gold/10', iconCls: 'text-tl-gold',
      value: avgDaysToHire != null ? `${avgDaysToHire}d` : '—', label: 'Avg Time to Hire',
      sub: hiredCount > 0 ? `Based on ${hiredCount} hires` : 'No hires yet', TrendIcon: TrendingUp, trendType: 'positive' as const,
    },
  ]

  return (
    <div className="p-4 sm:p-6">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-6 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-tl-text-primary">
            {greeting}{companyName ? `, ${companyName}` : ''}
          </h1>
          <p className="text-tl-text-secondary text-sm mt-1">
            {today}
            {urgentCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-tl-gold">
                · {urgentCount} item{urgentCount > 1 ? 's' : ''} need attention
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {totalApplicants > 0 && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-tl-teal/10 text-tl-teal border border-tl-teal/20">
              <span className="w-1.5 h-1.5 rounded-full bg-tl-teal animate-pulse" />
              Hiring Active
            </span>
          )}
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
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        {kpiCards.map(card => (
          <motion.div key={card.label} variants={itemVariants} className="tl-card p-4 sm:p-5 hover:border-tl-gold/30 transition-all group">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${card.iconBg} transition-transform duration-200 group-hover:scale-110`}>
              <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconCls}`} />
            </div>
            <div className="font-mono text-2xl sm:text-3xl text-tl-gold tracking-tight">{card.value}</div>
            <div className="text-xs sm:text-sm text-tl-text-secondary mt-1">{card.label}</div>
            <div className="text-[10px] sm:text-xs text-tl-text-secondary/70 mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* LEFT: Chart + Jobs table */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="tl-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2">
              <div>
                <p className="section-eyebrow">Hiring Activity</p>
                <h2 className="font-semibold text-tl-text-primary mt-0.5 text-sm sm:text-base">Applications, interviews &amp; offers over time</h2>
              </div>
              <div className="flex items-center gap-0.5 p-0.5 bg-tl-bg-base rounded-lg">
                {(['7d', '30d', '90d'] as const).map(r => (
                  <button key={r} onClick={() => setTimeRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${timeRange === r ? 'bg-tl-gold/20 text-tl-gold border border-tl-gold/30' : 'text-tl-text-secondary hover:text-tl-text-primary'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={timeRange} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <ResponsiveContainer width="100%" height={200}>
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
                    <XAxis dataKey="week" tick={{ fill: '#9B9890', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9B9890', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#9B9890', paddingTop: 8 }} formatter={v => <span style={{ color: '#9B9890' }}>{v}</span>} />
                    <Area type="monotone" dataKey="applications" name="Applications" stroke="#C9A84C" strokeWidth={2} fill="url(#gApps)" />
                    <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#1ECDB3" strokeWidth={2} fill="url(#gInts)" />
                    <Area type="monotone" dataKey="offers" name="Offers" stroke="#FF5C7A" strokeWidth={2} fill="url(#gOffs)" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Active Jobs Table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="tl-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-tl-border-subtle">
              <div>
                <h2 className="font-semibold text-tl-text-primary text-sm sm:text-base">Active Jobs</h2>
                <p className="text-xs text-tl-text-secondary mt-0.5">{activeJobs.length} open position{activeJobs.length !== 1 ? 's' : ''}</p>
              </div>
              <Link href="/company/jobs" className="btn-ghost text-xs inline-flex items-center gap-1">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {activeJobs.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Briefcase className="w-10 h-10 mx-auto mb-3 text-tl-text-secondary/20" />
                <p className="text-sm text-tl-text-secondary">No active jobs yet.</p>
                <Link href="/company/jobs/new" className="btn-gold text-xs mt-4 inline-flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Post your first job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-tl-border-subtle bg-tl-bg-base/50">
                      {['Job Title', 'Applicants', 'Status', ''].map(h => (
                        <th key={h} className="text-left text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wide px-4 sm:px-6 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tl-border-subtle">
                    {activeJobs.slice(0, 6).map(job => (
                      <tr key={job.id} className="hover:bg-tl-bg-elevated/50 transition-colors group">
                        <td className="px-4 sm:px-6 py-3">
                          <div className="font-medium text-tl-text-primary text-sm">{job.title}</div>
                          {job.location && <div className="text-xs text-tl-text-secondary mt-0.5">{job.location}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-tl-text-secondary" />
                            <span className="font-mono font-semibold text-tl-text-primary text-sm">{job.applicantCount ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            job.status === 'active'
                              ? 'bg-tl-teal/10 text-tl-teal border-tl-teal/20'
                              : 'bg-tl-bg-elevated text-tl-text-secondary border-tl-border-subtle'
                          }`}>
                            {job.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/company/jobs/${job.id}`} className="text-xs font-medium text-tl-gold hover:text-tl-gold/80 opacity-0 group-hover:opacity-100 transition-opacity">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT: AI Insights + Live Feed */}
        <div className="space-y-4">
          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.12 }} className="tl-card-gold p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-tl-gold" />
              <h2 className="font-semibold text-tl-text-primary text-sm">AI Insights</h2>
              {urgentCount > 0 && (
                <span className="tl-tag-gold text-[10px] ml-auto">{urgentCount} action{urgentCount > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="space-y-3">
              {aiRecommendations.map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-tl-bg-base/50 border border-tl-border-subtle space-y-2">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-lg ${rec.bg} shrink-0 mt-0.5`}>
                      <rec.icon className={`w-3.5 h-3.5 ${rec.iconCls}`} />
                    </div>
                    <p className="text-xs text-tl-text-primary leading-relaxed">{rec.text}</p>
                  </div>
                  <Link href="/company/pipeline" className="btn-ghost w-full text-[11px] font-semibold py-1.5 rounded-lg block text-center">
                    {rec.action}
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live Feed */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="tl-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tl-teal animate-pulse" />
                <h2 className="font-semibold text-tl-text-primary text-sm">Recent Activity</h2>
              </div>
              <Link href="/company/pipeline" className="text-xs text-tl-text-secondary hover:text-tl-gold transition-colors">
                View All
              </Link>
            </div>

            {activityEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-tl-text-secondary/20" />
                <p className="text-xs text-tl-text-secondary">No activity yet. Post a job to get started.</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-tl-border-subtle">
                {activityEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="flex items-center gap-3 py-2.5 hover:bg-tl-bg-elevated/30 transition-colors px-1 rounded-lg"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${ev.initBg}`}>
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
            )}
          </motion.div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {quickActions.map(action => (
          <motion.div key={action.label} variants={itemVariants}>
            <Link href={action.href} className="tl-card p-4 sm:p-5 hover:border-tl-gold/30 cursor-pointer transition-all group block text-center shadow-card hover:shadow-gold">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.iconCls}`} />
              </div>
              <div className="font-semibold text-tl-text-primary text-sm">{action.label}</div>
              <div className="text-xs text-tl-text-secondary mt-0.5">{action.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
