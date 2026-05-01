'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { jobs, applications } from '@/lib/data'
import { STAGE_LABELS, STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import type { PipelineStage } from '@/lib/types'
import { cn, timeAgo, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Users,
  Eye,
  Calendar,
  Clock,
  Briefcase,
  Pause,
  Play,
  Share2,
  Edit,
  CheckCircle2,
  Plus,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Bell,
  Trash2,
  Filter,
  Download,
  ChevronRight,
  MessageSquare,
  Search,
} from 'lucide-react'

// ─── Stage dot colors ─────────────────────────────────────────────────────────

const STAGE_DOT: Record<PipelineStage, string> = {
  new: 'bg-blue-400',
  screening: 'bg-purple-400',
  phone_screen: 'bg-indigo-400',
  technical: 'bg-amber-400',
  onsite: 'bg-cyan-400',
  offer: 'bg-emerald-400',
  hired: 'bg-green-400',
  rejected: 'bg-red-400',
}

function avatarBg(name: string): string {
  const palette = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

function matchColor(score: number) {
  if (score >= 90) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
  if (score >= 75) return 'bg-blue-500/15 text-blue-400 border-blue-500/25'
  if (score >= 60) return 'bg-amber-500/15 text-amber-400 border-amber-500/25'
  return 'bg-red-500/15 text-red-400 border-red-500/25'
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-12 h-6 rounded-full transition-all duration-200 relative shrink-0', value ? 'bg-emerald-500' : 'bg-white/10')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200', value && 'translate-x-6')} />
    </button>
  )
}

function SmallToggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-10 h-[22px] rounded-full transition-all duration-200 relative shrink-0', value ? 'bg-blue-500' : 'bg-white/10')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200', value && 'translate-x-[18px]')} />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobs.find((j) => j.id === params.id) ?? jobs[0]
  const jobApplications = useMemo(() => applications.filter((a) => a.jobId === job.id), [job.id])

  const [activeTab, setActiveTab] = useState<'overview' | 'applicants' | 'analytics' | 'settings'>('overview')
  const [isPaused, setIsPaused] = useState(false)
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isJobActive, setIsJobActive] = useState(true)
  const [notifyNewApp, setNotifyNewApp] = useState(true)
  const [notifyHighMatch, setNotifyHighMatch] = useState(true)

  // Use all applications as demo data if jobApplications is sparse
  const displayApps = jobApplications.length > 0 ? jobApplications : applications

  const filteredApps = useMemo(() => {
    return displayApps.filter((a) => {
      const matchesStage = stageFilter === 'all' || a.stage === stageFilter
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        (a.candidate?.name ?? '').toLowerCase().includes(q) ||
        (a.candidate?.title ?? '').toLowerCase().includes(q)
      return matchesStage && matchesSearch
    })
  }, [displayApps, stageFilter, searchQuery])

  const stageCounts = useMemo(() => {
    const c: Partial<Record<PipelineStage, number>> = {}
    for (const stage of PIPELINE_STAGES) {
      c[stage] = displayApps.filter((a) => a.stage === stage).length
    }
    return c
  }, [displayApps])

  const avgMatch = Math.round(
    displayApps.reduce((s, a) => s + a.matchScore, 0) / (displayApps.length || 1)
  )

  const daysPosted = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86_400_000)
  const daysUntilExpiry = Math.max(0, Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86_400_000))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    setSelectedIds(selectedIds.size === filteredApps.length ? new Set() : new Set(filteredApps.map((a) => a.id)))
  }

  // Analytics data
  const weeklyData = [
    { week: 'Apr 7', apps: 32 },
    { week: 'Apr 14', apps: 54 },
    { week: 'Apr 21', apps: 76 },
    { week: 'Apr 28', apps: 88 },
    { week: 'May 1', apps: 34 },
  ]
  const maxApps = Math.max(...weeklyData.map((d) => d.apps))

  const sourcesData = [
    { name: 'Calibr', pct: 48, color: 'bg-blue-500' },
    { name: 'LinkedIn', pct: 28, color: 'bg-purple-500' },
    { name: 'Referrals', pct: 14, color: 'bg-emerald-500' },
    { name: 'Direct', pct: 10, color: 'bg-amber-500' },
  ]

  const funnelData = [
    { stage: 'Applied', count: job.applicantCount, pct: 100 },
    { stage: 'Screened', count: Math.round(job.applicantCount * 0.30), pct: 30 },
    { stage: 'Phone Screen', count: Math.round(job.applicantCount * 0.13), pct: 13 },
    { stage: 'Technical', count: Math.round(job.applicantCount * 0.06), pct: 6 },
    { stage: 'Offer', count: Math.round(job.applicantCount * 0.014), pct: 1.4 },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'applicants', label: `Applicants (${job.applicantCount})` },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
  ] as const

  const workModeLabel = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }[job.workMode] ?? job.workMode
  const levelLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead', executive: 'Executive' }[job.level] ?? job.level

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Back nav */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-6">
        <Link href="/company/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
      </motion.div>

      {/* ── JOB HEADER CARD ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          {/* Company avatar */}
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 bg-gradient-to-br', avatarBg(job.company.name))}>
            {job.company.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Center content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">{job.company.name}</span>
              {job.company.verified && (
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{job.title}</h1>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', isPaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              )}>
                <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5', isPaused ? 'bg-amber-400' : 'bg-emerald-400')} />
                {isPaused ? 'Paused' : 'Active'}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                {workModeLabel}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-white/[0.05] border-white/[0.1] text-muted-foreground">
                {levelLabel}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-white/[0.05] border-white/[0.1] text-muted-foreground capitalize">
                {job.type}
              </span>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span>${Math.round(job.salaryMin / 1000)}K</span>
              <span className="text-muted-foreground">–</span>
              <span>${Math.round(job.salaryMax / 1000)}K</span>
              <span className="text-sm font-normal text-muted-foreground">/ year</span>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{job.applicantCount}</span> applicants
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{job.viewCount.toLocaleString()}</span> views
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Posted <span className="font-semibold text-foreground ml-1">{daysPosted}d ago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Expires in <span className="font-semibold text-foreground ml-1">{daysUntilExpiry}d</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">Avg match: <span className="font-bold">{avgMatch}%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all',
                isPaused
                  ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
              )}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'Activate' : 'Pause'}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {/* Tab nav */}
        <div className="flex gap-1 p-1 glass-card rounded-xl mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === t.key
                  ? 'bg-white/[0.1] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Left: job details */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">About the Role</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">{job.description}</p>

                    <h4 className="text-sm font-semibold text-foreground mb-3">Requirements</h4>
                    <ul className="space-y-2.5 mb-6">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>

                    {job.niceToHave.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Nice to Have</h4>
                        <ul className="space-y-2.5 mb-6">
                          {job.niceToHave.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <Plus className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <h4 className="text-sm font-semibold text-foreground mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill) => (
                        <span key={skill} className="text-xs px-3 py-1 rounded-full bg-blue-500/[0.07] border border-blue-500/20 text-blue-400 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-semibold text-foreground mb-3">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((b) => (
                        <span key={b} className="text-xs px-3 py-1 rounded-full bg-emerald-500/[0.07] border border-emerald-500/20 text-emerald-400 font-medium">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-foreground mb-3">About {job.company.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{job.company.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.company.culture.map((c) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: AI insights */}
                <div className="space-y-4">
                  <div className="glass-card p-5 border-blue-500/20 bg-gradient-to-b from-blue-500/[0.04] to-transparent">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Predicted Fill Time</p>
                        <p className="text-lg font-bold text-foreground">22 days</p>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-2">
                          <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Day 14 of projected 22</p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold mb-1">Market Signal</p>
                            <p className="text-sm text-foreground">Candidate market: Tight</p>
                            <p className="text-xs text-muted-foreground mt-0.5">8% fewer qualified candidates vs last month</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-semibold mb-1">Salary Insight</p>
                            <p className="text-sm text-foreground">Adjust +$15K to target</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Increases qualified applicants by ~34%</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Top Competing Companies</p>
                        {[
                          { name: 'Google', color: 'text-rose-400' },
                          { name: 'Meta', color: 'text-blue-400' },
                          { name: 'Vercel', color: 'text-muted-foreground' },
                        ].map((c) => (
                          <div key={c.name} className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground">{c.name}</span>
                            <span className={cn('text-[10px] font-medium', c.color)}>Hiring</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── APPLICANTS TAB ──────────────────────────────────────── */}
          {activeTab === 'applicants' && (
            <motion.div
              key="applicants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Filter bar */}
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                    {/* All stages pill */}
                    <button
                      onClick={() => setStageFilter('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        stageFilter === 'all'
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground'
                      )}
                    >
                      All ({displayApps.length})
                    </button>
                    {PIPELINE_STAGES.map((stage) => {
                      const count = stageCounts[stage] ?? 0
                      if (count === 0) return null
                      return (
                        <button
                          key={stage}
                          onClick={() => setStageFilter(stage)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                            stageFilter === stage
                              ? STAGE_COLORS[stage]
                              : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {STAGE_LABELS[stage]} ({count})
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search…"
                        className="pl-9 pr-3 py-1.5 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-40"
                      />
                    </div>

                    {/* Bulk actions */}
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
                        <button className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                          Move Stage
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
                          Send Email
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">
                          Reject
                        </button>
                      </div>
                    )}

                    <button
                      onClick={toggleAll}
                      className="text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all"
                    >
                      {selectedIds.size === filteredApps.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Applicant list */}
              <div className="space-y-3">
                {filteredApps.length === 0 ? (
                  <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
                    <p className="text-sm font-medium text-foreground">No applicants in this stage</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different filter</p>
                  </div>
                ) : (
                  filteredApps.map((app, idx) => {
                    const candidate = app.candidate
                    if (!candidate) return null
                    const isSelected = selectedIds.has(app.id)
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={cn(
                          'glass-card p-4 hover:border-white/[0.15] transition-all',
                          isSelected && 'border-blue-500/30 bg-blue-500/[0.02]'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(app.id)}
                            className="w-4 h-4 rounded accent-blue-500 shrink-0"
                          />
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br', avatarBg(candidate.name))}>
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{candidate.name}</span>
                              {candidate.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{candidate.title}</p>
                          </div>
                          <span className={cn('hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0', matchColor(app.matchScore))}>
                            {app.matchScore}% match
                          </span>
                          <span className={cn('hidden md:inline-flex text-xs font-medium px-2.5 py-1 rounded-full border shrink-0', STAGE_COLORS[app.stage])}>
                            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', STAGE_DOT[app.stage])} />
                            {STAGE_LABELS[app.stage]}
                          </span>
                          <span className="hidden lg:block text-xs text-muted-foreground shrink-0">{timeAgo(app.appliedAt)}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <Link
                              href={`/company/candidates/${candidate.id}`}
                              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                            >
                              View Profile
                            </Link>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {app.notes && (
                          <div className="mt-3 ml-14 text-xs text-muted-foreground bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2">
                            {app.notes}
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ───────────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Applications over time */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-foreground mb-5">Applications Over Time</h3>
                <div className="flex items-end gap-3 h-36">
                  {weeklyData.map((d, i) => (
                    <div key={d.week} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex items-end w-full h-24">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.apps / maxApps) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400"
                          title={`${d.apps} applications`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{d.week}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Source breakdown */}
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5">Source Breakdown</h3>
                  <div className="space-y-4">
                    {sourcesData.map((s, i) => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">{s.name}</span>
                          <span className="text-sm font-semibold text-foreground">{s.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', s.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Funnel */}
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-foreground mb-5">Hiring Funnel</h3>
                  <div className="space-y-3">
                    {funnelData.map((item, i) => (
                      <div key={item.stage} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 shrink-0">{item.stage}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl space-y-5"
            >
              {/* Job status */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Job Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Listing</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isJobActive ? 'Visible to candidates, accepting applications' : 'Paused — not visible to candidates'}
                    </p>
                  </div>
                  <Toggle value={isJobActive} onChange={() => setIsJobActive((p) => !p)} />
                </div>
              </div>

              {/* Expiry date */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Expiry Date</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-border text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(job.expiresAt)}
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-all">
                    <Edit className="w-3.5 h-3.5" />
                    Edit Date
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Job expires in {daysUntilExpiry} days</p>
              </div>

              {/* Notifications */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'New Application', desc: 'Get notified when someone applies', value: notifyNewApp, set: () => setNotifyNewApp((p) => !p) },
                    { label: 'High Match Found', desc: 'Alert when AI score > 90% candidate applies', value: notifyHighMatch, set: () => setNotifyHighMatch((p) => !p) },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                      <SmallToggle value={s.value} onChange={s.set} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="glass-card p-5 border-red-500/20 bg-red-500/[0.02]">
                <h3 className="text-base font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Closing this job will hide it from candidates and end all active applications. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-sm transition-all">
                    <Pause className="w-4 h-4" />
                    Pause Job
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    <Trash2 className="w-4 h-4" />
                    Close Job
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
