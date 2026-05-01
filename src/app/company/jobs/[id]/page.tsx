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
  new: 'bg-tl-blue',
  screening: 'bg-tl-gold',
  phone_screen: 'bg-tl-teal',
  technical: 'bg-tl-gold',
  onsite: 'bg-tl-teal',
  offer: 'bg-tl-teal',
  hired: 'bg-tl-teal',
  rejected: 'bg-tl-rose',
}

function avatarBg(name: string): string {
  const palette = [
    'from-tl-gold/60 to-tl-gold/30',
    'from-tl-teal/60 to-tl-teal/30',
    'from-tl-blue/60 to-tl-blue/30',
    'from-tl-rose/60 to-tl-rose/30',
    'from-tl-teal/40 to-tl-gold/40',
    'from-tl-gold/40 to-tl-teal/40',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

function matchColor(score: number) {
  if (score >= 90) return 'bg-tl-teal/15 text-tl-teal border-tl-teal/25'
  if (score >= 75) return 'bg-tl-gold/15 text-tl-gold border-tl-gold/25'
  if (score >= 60) return 'bg-tl-gold/10 text-tl-gold border-tl-gold/20'
  return 'bg-tl-rose/15 text-tl-rose border-tl-rose/25'
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-12 h-6 rounded-full transition-all duration-200 relative shrink-0', value ? 'bg-tl-teal' : 'bg-tl-bg-elevated border border-tl-border-subtle')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200', value && 'translate-x-6')} />
    </button>
  )
}

function SmallToggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-10 h-[22px] rounded-full transition-all duration-200 relative shrink-0', value ? 'bg-tl-gold' : 'bg-tl-bg-elevated border border-tl-border-subtle')}
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
    { name: 'TalentLoop', pct: 48, color: 'bg-tl-gold' },
    { name: 'LinkedIn', pct: 28, color: 'bg-tl-teal' },
    { name: 'Referrals', pct: 14, color: 'bg-tl-blue' },
    { name: 'Direct', pct: 10, color: 'bg-tl-rose' },
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
        <Link href="/company/jobs" className="inline-flex items-center gap-2 text-sm text-tl-text-secondary hover:text-tl-gold transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
      </motion.div>

      {/* ── JOB HEADER CARD ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="tl-card-elevated p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          {/* Company avatar */}
          <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 bg-gradient-to-br', avatarBg(job.company.name))}>
            {job.company.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Center content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-tl-text-secondary">{job.company.name}</span>
              {job.company.verified && (
                <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0" />
              )}
            </div>
            <h1 className="font-display text-3xl text-tl-text-primary mb-3">{job.title}</h1>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', isPaused
                ? 'bg-tl-gold/10 text-tl-gold border-tl-gold/20'
                : 'tl-tag-teal'
              )}>
                <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse', isPaused ? 'bg-tl-gold' : 'bg-tl-teal')} />
                {isPaused ? 'Paused' : 'Active'}
              </span>
              <span className="tl-tag-teal text-xs">
                {workModeLabel}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-tl-bg-elevated border-tl-border-subtle text-tl-text-secondary">
                {levelLabel}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-tl-bg-elevated border-tl-border-subtle text-tl-text-secondary capitalize">
                {job.type}
              </span>
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1.5 font-mono font-semibold text-tl-gold">
              <span>${Math.round(job.salaryMin / 1000)}K</span>
              <span className="text-tl-text-secondary">–</span>
              <span>${Math.round(job.salaryMax / 1000)}K</span>
              <span className="text-sm font-normal text-tl-text-secondary">/ year</span>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-tl-border-subtle text-sm text-tl-text-secondary">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold text-tl-text-primary">{job.applicantCount}</span> applicants
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold text-tl-text-primary">{job.viewCount.toLocaleString()}</span> views
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Posted <span className="font-mono font-semibold text-tl-text-primary ml-1">{daysPosted}d ago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Expires in <span className="font-mono font-semibold text-tl-text-primary ml-1">{daysUntilExpiry}d</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="px-3 py-1 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-tl-gold" />
                  <span className="font-mono text-xs text-tl-gold font-medium">Avg match: <span className="font-bold">{avgMatch}%</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => setIsPaused((p) => !p)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all',
                isPaused
                  ? 'border-tl-teal/30 text-tl-teal hover:bg-tl-teal/10'
                  : 'border-tl-border-subtle text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated'
              )}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'Activate' : 'Pause'}
            </button>
            <button className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm">
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
        <div className="flex gap-1 border-b border-tl-border-subtle mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px',
                activeTab === t.key
                  ? 'text-tl-gold border-tl-gold'
                  : 'text-tl-text-secondary hover:text-tl-text-primary border-transparent'
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
                  <div className="tl-card p-6">
                    <h3 className="text-base font-semibold text-tl-text-primary mb-3">About the Role</h3>
                    <p className="text-sm text-tl-text-secondary leading-relaxed mb-6">{job.description}</p>

                    <h4 className="text-sm font-semibold text-tl-text-primary mb-3">Requirements</h4>
                    <ul className="space-y-2.5 mb-6">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-tl-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-tl-teal mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>

                    {job.niceToHave.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-tl-text-primary mb-3">Nice to Have</h4>
                        <ul className="space-y-2.5 mb-6">
                          {job.niceToHave.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-tl-text-secondary">
                              <Plus className="w-4 h-4 text-tl-gold mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <h4 className="text-sm font-semibold text-tl-text-primary mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill) => (
                        <span key={skill} className="tl-tag-teal text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-semibold text-tl-text-primary mb-3">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((b) => (
                        <span key={b} className="tl-tag-gold text-xs font-medium">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="tl-card p-6">
                    <h3 className="text-base font-semibold text-tl-text-primary mb-3">About {job.company.name}</h3>
                    <p className="text-sm text-tl-text-secondary leading-relaxed mb-4">{job.company.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.company.culture.map((c) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-tl-bg-elevated border border-tl-border-subtle text-tl-text-secondary">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: AI insights */}
                <div className="space-y-4">
                  <div className="tl-card-gold p-5">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-9 h-9 rounded-xl bg-tl-gold/20 border border-tl-gold/30 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-tl-gold" />
                      </div>
                      <h3 className="text-sm font-semibold text-tl-text-primary">AI Insights</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-tl-bg-base border border-tl-border-subtle">
                        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-1">Predicted Fill Time</p>
                        <p className="font-mono text-lg font-bold text-tl-text-primary">22 days</p>
                        <div className="h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden mt-2">
                          <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-tl-gold to-tl-teal" />
                        </div>
                        <p className="text-[10px] text-tl-text-secondary mt-1">Day 14 of projected 22</p>
                      </div>

                      <div className="p-3 rounded-xl bg-tl-gold/[0.06] border border-tl-gold/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-tl-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-tl-gold/80 uppercase tracking-wider font-semibold mb-1">Market Signal</p>
                            <p className="text-sm text-tl-text-primary">Candidate market: Tight</p>
                            <p className="text-xs text-tl-text-secondary mt-0.5">8% fewer qualified candidates vs last month</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-tl-teal/[0.06] border border-tl-teal/20">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-tl-teal shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-tl-teal/80 uppercase tracking-wider font-semibold mb-1">Salary Insight</p>
                            <p className="text-sm text-tl-text-primary">Adjust +$15K to target</p>
                            <p className="text-xs text-tl-text-secondary mt-0.5">Increases qualified applicants by ~34%</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-tl-bg-base border border-tl-border-subtle">
                        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-1.5">Top Competing Companies</p>
                        {[
                          { name: 'Google', color: 'text-tl-rose' },
                          { name: 'Meta', color: 'text-tl-teal' },
                          { name: 'Vercel', color: 'text-tl-text-secondary' },
                        ].map((c) => (
                          <div key={c.name} className="flex items-center justify-between py-1">
                            <span className="text-sm text-tl-text-secondary">{c.name}</span>
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
              <div className="tl-card p-4 mb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-tl-text-secondary shrink-0" />
                    {/* All stages pill */}
                    <button
                      onClick={() => setStageFilter('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        stageFilter === 'all'
                          ? 'bg-tl-gold/20 border-tl-gold/40 text-tl-gold'
                          : 'bg-tl-bg-elevated border-tl-border-subtle text-tl-text-secondary hover:text-tl-text-primary'
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
                              ? 'tl-tag-teal'
                              : 'bg-tl-bg-elevated border-tl-border-subtle text-tl-text-secondary hover:text-tl-text-primary'
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search…"
                        className="pl-9 pr-3 py-1.5 bg-tl-bg-surface border border-tl-border-subtle rounded-xl text-xs text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 w-40 transition-all"
                      />
                    </div>

                    {/* Bulk actions */}
                    {selectedIds.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-tl-text-secondary">{selectedIds.size} selected</span>
                        <button className="tl-tag-teal text-xs px-3 py-1.5">
                          Move Stage
                        </button>
                        <button className="btn-ghost text-xs px-3 py-1.5">
                          Send Email
                        </button>
                        <button className="text-xs px-3 py-1.5 rounded-xl border border-tl-rose/30 text-tl-rose hover:bg-tl-rose/10 transition-all">
                          Reject
                        </button>
                      </div>
                    )}

                    <button
                      onClick={toggleAll}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      {selectedIds.size === filteredApps.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <button className="btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Applicant list */}
              <div className="space-y-3">
                {filteredApps.length === 0 ? (
                  <div className="tl-card p-16 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-tl-text-secondary/20 mb-4" />
                    <p className="text-sm font-medium text-tl-text-primary">No applicants in this stage</p>
                    <p className="text-xs text-tl-text-secondary mt-1">Try a different filter</p>
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
                          'tl-card p-4 hover:border-tl-gold/30 transition-all',
                          isSelected && 'border-tl-gold/40 bg-tl-gold/[0.02]'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(app.id)}
                            className="w-4 h-4 rounded accent-[#C9A84C] shrink-0"
                          />
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white bg-gradient-to-br', avatarBg(candidate.name))}>
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-tl-text-primary">{candidate.name}</span>
                              {candidate.verified && <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal shrink-0" />}
                            </div>
                            <p className="text-xs text-tl-text-secondary">{candidate.title}</p>
                          </div>
                          <span className={cn('hidden sm:inline-flex font-mono text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0', matchColor(app.matchScore))}>
                            {app.matchScore}% match
                          </span>
                          <span className="hidden md:inline-flex tl-tag-teal text-xs shrink-0">
                            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', STAGE_DOT[app.stage])} />
                            {STAGE_LABELS[app.stage]}
                          </span>
                          <span className="hidden lg:block text-xs text-tl-text-secondary shrink-0">{timeAgo(app.appliedAt)}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                            <Link
                              href={`/company/candidates/${candidate.id}`}
                              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-tl-gold/10 border border-tl-gold/20 text-tl-gold hover:bg-tl-gold/20 transition-all"
                            >
                              View Profile
                            </Link>
                            <button className="p-1.5 rounded-lg text-tl-text-secondary hover:text-tl-gold hover:bg-tl-gold/10 transition-all">
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-tl-text-secondary hover:text-tl-teal hover:bg-tl-teal/10 transition-all">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg text-tl-text-secondary hover:text-tl-gold hover:bg-tl-gold/10 transition-all">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {app.notes && (
                          <div className="mt-3 ml-14 text-xs text-tl-text-secondary bg-tl-bg-base border border-tl-border-subtle rounded-lg px-3 py-2">
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
              <div className="tl-card p-6">
                <p className="section-eyebrow mb-1">Applications Over Time</p>
                <h3 className="text-base font-semibold text-tl-text-primary mb-5">Weekly Application Volume</h3>
                <div className="flex items-end gap-3 h-36">
                  {weeklyData.map((d, i) => (
                    <div key={d.week} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex items-end w-full h-24">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.apps / maxApps) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-tl-gold to-tl-gold/60"
                          title={`${d.apps} applications`}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-tl-text-secondary whitespace-nowrap">{d.week}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Source breakdown */}
                <div className="tl-card p-6">
                  <p className="section-eyebrow mb-1">Source Breakdown</p>
                  <h3 className="text-base font-semibold text-tl-text-primary mb-5">Where Applicants Come From</h3>
                  <div className="space-y-4">
                    {sourcesData.map((s, i) => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-tl-text-secondary">{s.name}</span>
                          <span className="font-mono text-sm font-semibold text-tl-gold">{s.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-tl-bg-elevated overflow-hidden">
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
                <div className="tl-card p-6">
                  <p className="section-eyebrow mb-1">Hiring Funnel</p>
                  <h3 className="text-base font-semibold text-tl-text-primary mb-5">Conversion by Stage</h3>
                  <div className="space-y-3">
                    {funnelData.map((item, i) => (
                      <div key={item.stage} className="flex items-center gap-3">
                        <span className="text-xs text-tl-text-secondary w-24 shrink-0">{item.stage}</span>
                        <div className="flex-1 h-2 rounded-full bg-tl-bg-elevated overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-teal"
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-tl-gold w-8 text-right">{item.count}</span>
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
              <div className="tl-card p-5">
                <h3 className="text-base font-semibold text-tl-text-primary mb-4">Job Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tl-text-primary">Active Listing</p>
                    <p className="text-xs text-tl-text-secondary mt-0.5">
                      {isJobActive ? 'Visible to candidates, accepting applications' : 'Paused — not visible to candidates'}
                    </p>
                  </div>
                  <Toggle value={isJobActive} onChange={() => setIsJobActive((p) => !p)} />
                </div>
              </div>

              {/* Expiry date */}
              <div className="tl-card p-5">
                <h3 className="text-base font-semibold text-tl-text-primary mb-4">Expiry Date</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle text-sm text-tl-text-primary">
                    <Calendar className="w-4 h-4 text-tl-text-secondary" />
                    {formatDate(job.expiresAt)}
                  </div>
                  <button className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm">
                    <Edit className="w-3.5 h-3.5" />
                    Edit Date
                  </button>
                </div>
                <p className="text-xs text-tl-text-secondary mt-2">Job expires in {daysUntilExpiry} days</p>
              </div>

              {/* Notifications */}
              <div className="tl-card p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <Bell className="w-4 h-4 text-tl-gold" />
                  <h3 className="text-base font-semibold text-tl-text-primary">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'New Application', desc: 'Get notified when someone applies', value: notifyNewApp, set: () => setNotifyNewApp((p) => !p) },
                    { label: 'High Match Found', desc: 'Alert when AI score > 90% candidate applies', value: notifyHighMatch, set: () => setNotifyHighMatch((p) => !p) },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-tl-text-primary">{s.label}</p>
                        <p className="text-xs text-tl-text-secondary mt-0.5">{s.desc}</p>
                      </div>
                      <SmallToggle value={s.value} onChange={s.set} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="tl-card p-5 border-tl-rose/20 bg-tl-rose/[0.02]">
                <h3 className="text-base font-semibold text-tl-rose mb-2">Danger Zone</h3>
                <p className="text-sm text-tl-text-secondary mb-4">
                  Closing this job will hide it from candidates and end all active applications. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-tl-gold/30 text-tl-gold hover:bg-tl-gold/10 text-sm transition-all">
                    <Pause className="w-4 h-4" />
                    Pause Job
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-tl-rose/30 text-tl-rose hover:bg-tl-rose/10 text-sm transition-all">
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
