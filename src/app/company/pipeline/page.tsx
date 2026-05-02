'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getJobs, getApplications } from '@/lib/api'
import { STAGE_LABELS, STAGE_COLORS, PIPELINE_STAGES } from '@/lib/constants'
import type { Job, PipelineStage, Application } from '@/lib/types'
import { cn, timeAgo } from '@/lib/utils'
import {
  Plus,
  ChevronDown,
  Calendar,
  MessageSquare,
  ChevronRight,
  Kanban,
  LayoutList,
  Search,
  MoreHorizontal,
  Users,
  Clock,
} from 'lucide-react'

// ─── Stage dot colors (TalentBridge palette) ────────────────────────────────────

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

const STAGE_TEXT: Record<PipelineStage, string> = {
  new: 'text-tl-blue',
  screening: 'text-tl-gold',
  phone_screen: 'text-tl-teal',
  technical: 'text-tl-gold',
  onsite: 'text-tl-teal',
  offer: 'text-tl-teal',
  hired: 'text-tl-teal',
  rejected: 'text-tl-rose',
}

// ─── Match score color ────────────────────────────────────────────────────────

function matchColor(score: number) {
  if (score >= 90) return 'bg-tl-teal/15 text-tl-teal border-tl-teal/25'
  if (score >= 75) return 'bg-tl-gold/15 text-tl-gold border-tl-gold/25'
  if (score >= 60) return 'bg-tl-gold/10 text-tl-gold border-tl-gold/20'
  return 'bg-tl-rose/15 text-tl-rose border-tl-rose/25'
}

// ─── Avatar color from name ───────────────────────────────────────────────────

function avatarColor(name: string): string {
  const colors = [
    'bg-tl-blue/20 text-tl-blue',
    'bg-tl-gold/20 text-tl-gold',
    'bg-tl-teal/20 text-tl-teal',
    'bg-tl-rose/20 text-tl-rose',
    'bg-tl-teal/15 text-tl-teal',
    'bg-tl-gold/15 text-tl-gold',
    'bg-tl-blue/15 text-tl-blue',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({ app }: { app: Application }) {
  const candidate = app.candidate
  if (!candidate) return null

  const daysInStage = Math.max(1, Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86_400_000))
  const isStale = daysInStage > 7
  const initials = candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarCls = avatarColor(candidate.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="tl-card p-4 cursor-pointer hover:border-tl-gold/40 transition-all group shadow-card"
    >
      {/* Top row */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarCls)}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-tl-text-primary truncate">{candidate.name}</p>
          <p className="text-xs text-tl-text-secondary truncate">{candidate.title}</p>
        </div>
        <button className="hidden group-hover:flex p-1 rounded-lg hover:bg-tl-bg-elevated text-tl-text-secondary transition-all shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Match + days */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={cn('text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border', matchColor(app.matchScore))}>
          {app.matchScore}% match
        </span>
        <span className={cn(
          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
          isStale
            ? 'bg-tl-rose/10 text-tl-rose border border-tl-rose/20'
            : 'bg-tl-bg-elevated text-tl-text-secondary'
        )}>
          {daysInStage}d
        </span>
      </div>

      {/* Applied role */}
      <p className="text-[11px] text-tl-text-secondary truncate mb-3">
        {app.job?.title ?? 'Unknown Role'}
      </p>

      {/* Action row */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          title="Schedule Interview"
          className="flex items-center justify-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-tl-bg-elevated hover:bg-tl-gold/10 text-tl-text-secondary hover:text-tl-gold transition-colors flex-1"
        >
          <Calendar className="w-3 h-3" />
          <span>Schedule</span>
        </button>
        <button
          title="Message"
          className="flex items-center justify-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-tl-bg-elevated hover:bg-tl-teal/10 text-tl-text-secondary hover:text-tl-teal transition-colors flex-1"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Message</span>
        </button>
        <button
          title="Move to next stage"
          className="p-1.5 rounded-lg bg-tl-gold/10 hover:bg-tl-gold/20 text-tl-gold transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  cards,
}: {
  stage: PipelineStage
  cards: Application[]
}) {
  return (
    <div className="min-w-[270px] w-[270px] flex-shrink-0 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', STAGE_DOT[stage])} />
          <span className={cn('font-mono text-sm font-semibold', STAGE_TEXT[stage])}>
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="font-mono text-xs font-bold bg-tl-bg-elevated text-tl-text-secondary px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
        {cards.length === 0 ? (
          <div className="border-2 border-dashed border-tl-border-subtle rounded-xl py-8 flex items-center justify-center">
            <p className="text-xs text-tl-text-secondary/50">No candidates in {STAGE_LABELS[stage]}</p>
          </div>
        ) : (
          cards.map((app) => <CandidateCard key={app.id} app={app} />)
        )}
      </div>

      {/* Footer add button */}
      <button className="flex items-center justify-center gap-1.5 py-2.5 w-full rounded-xl border border-dashed border-tl-border-subtle text-xs text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 hover:bg-tl-gold/5 transition-all duration-200">
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
    </div>
  )
}

// ─── List View Row ────────────────────────────────────────────────────────────

function ListRow({ app, idx }: { app: Application; idx: number }) {
  const candidate = app.candidate
  if (!candidate) return null

  const daysInStage = Math.max(1, Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86_400_000))
  const initials = candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: idx * 0.04 }}
      className="border-b border-tl-border-subtle hover:bg-tl-bg-elevated/30 transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarColor(candidate.name))}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-tl-text-primary">{candidate.name}</p>
            <p className="text-xs text-tl-text-secondary">{candidate.title}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn('tl-tag-teal text-xs font-medium')}>
          {STAGE_LABELS[app.stage]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-tl-text-secondary">{app.job?.title ?? '—'}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-tl-text-secondary">{timeAgo(app.appliedAt)}</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('font-mono text-xs font-semibold px-2 py-0.5 rounded-full border', matchColor(app.matchScore))}>
          {app.matchScore}%
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'font-mono text-xs font-semibold px-2 py-0.5 rounded-full',
          daysInStage > 7 ? 'text-tl-rose bg-tl-rose/10' : 'text-tl-text-secondary bg-tl-bg-elevated'
        )}>
          {daysInStage}d
        </span>
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/company/candidates/${candidate.id}`}
          className="text-xs font-medium text-tl-gold hover:text-tl-gold/80 opacity-0 group-hover:opacity-100 transition-all"
        >
          View →
        </Link>
      </td>
    </motion.tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      const [jobsRes, appsRes] = await Promise.all([getJobs(), getApplications()])
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  // Build all apps list (exclude rejected)
  const allApps = useMemo(() => {
    return applications.filter((a) => a.stage !== 'rejected')
  }, [applications])

  // Filter by job + search
  const filteredApps = useMemo(() => {
    return allApps.filter((app) => {
      const matchesJob = selectedJob === 'all' || app.jobId === selectedJob
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        (app.candidate?.name ?? '').toLowerCase().includes(query) ||
        (app.candidate?.title ?? '').toLowerCase().includes(query) ||
        (app.job?.title ?? '').toLowerCase().includes(query)
      return matchesJob && matchesSearch
    })
  }, [allApps, selectedJob, searchQuery])

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Partial<Record<PipelineStage, number>> = {}
    for (const stage of PIPELINE_STAGES) {
      counts[stage] = filteredApps.filter((a) => a.stage === stage).length
    }
    return counts
  }, [filteredApps])

  // Kanban columns
  const kanbanData = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage,
      cards: filteredApps.filter((a) => a.stage === stage),
    }))
  }, [filteredApps])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-full min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-tl-border-subtle">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Left: title + count */}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-tl-text-primary">Hiring Pipeline</h1>
            <span className="font-mono text-xs font-bold bg-tl-gold/10 text-tl-gold border border-tl-gold/20 px-2.5 py-1 rounded-full">
              {filteredApps.length} candidates
            </span>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates…"
                className="pl-9 pr-4 py-2 bg-tl-bg-surface border border-tl-border-subtle rounded-xl text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 w-48 transition-all"
              />
            </div>

            {/* Job filter */}
            <div className="relative">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="appearance-none bg-tl-bg-surface border border-tl-border-subtle rounded-xl pl-3 pr-8 py-2 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all"
              >
                <option value="all">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-tl-bg-surface rounded-xl border border-tl-border-subtle">
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban view"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  viewMode === 'kanban'
                    ? 'bg-tl-bg-elevated text-tl-gold border border-tl-gold/30'
                    : 'text-tl-text-secondary hover:text-tl-text-primary'
                )}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-tl-bg-elevated text-tl-gold border border-tl-gold/30'
                    : 'text-tl-text-secondary hover:text-tl-text-primary'
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Add candidate */}
            <button className="btn-gold flex items-center gap-1.5 px-3 py-2 text-sm">
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        </div>

        {/* Stage stats strip */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {PIPELINE_STAGES.map((stage) => (
            <button
              key={stage}
              className="tl-tag-teal flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 whitespace-nowrap"
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STAGE_DOT[stage])} />
              {STAGE_LABELS[stage]}
              <span className="font-mono font-bold">{stageCounts[stage] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto p-6 pb-4">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 min-h-[600px]"
            >
              {kanbanData.map(({ stage, cards }) => (
                <KanbanColumn key={stage} stage={stage} cards={cards} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="tl-card overflow-hidden"
            >
              {filteredApps.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center text-center">
                  <Users className="w-12 h-12 text-tl-text-secondary/20 mb-4" />
                  <p className="text-sm font-medium text-tl-text-primary">No candidates found</p>
                  <p className="text-xs text-tl-text-secondary mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-tl-border-subtle bg-tl-bg-base/50">
                      {['Candidate', 'Stage', 'Applied For', 'Applied Date', 'Match', 'Days', 'Actions'].map((h) => (
                        <th key={h} className="text-left text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app, idx) => (
                      <ListRow key={app.id} app={app} idx={idx} />
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stage velocity strip ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pb-6">
        <div className="tl-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-tl-text-secondary" />
            <h3 className="text-sm font-semibold text-tl-text-primary">Avg. Days Per Stage</h3>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {PIPELINE_STAGES.slice(0, -1).map((stage, i) => {
              const days = [1, 3, 5, 8, 5, 3][i] ?? 2
              return (
                <div key={stage} className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className="w-16 py-2 rounded-xl text-xs font-mono font-bold text-center bg-tl-gold/10 text-tl-gold border border-tl-gold/20">
                      {days}d
                    </div>
                    <div className="text-[10px] text-tl-text-secondary mt-1 w-16 text-center truncate">
                      {STAGE_LABELS[stage]}
                    </div>
                  </div>
                  {i < PIPELINE_STAGES.length - 2 && (
                    <ChevronRight className="w-3.5 h-3.5 text-tl-border-subtle shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
