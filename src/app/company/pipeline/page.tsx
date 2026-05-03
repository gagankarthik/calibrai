'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDraggable, useDroppable,
} from '@dnd-kit/core'
import { getCompanyJobs, getApplications } from '@/lib/api'
import { STAGE_LABELS, PIPELINE_STAGES } from '@/lib/constants'
import type { Job, PipelineStage, Application } from '@/lib/types'
import { cn, timeAgo, candidateAvatarSrc } from '@/lib/utils'
import {
  Plus, ChevronDown, Calendar, MessageSquare, ChevronRight,
  Kanban, LayoutList, Search, MoreHorizontal, Users, Clock,
  ChevronsLeft,
} from 'lucide-react'

// ─── Stage palette ────────────────────────────────────────────────────────────

const STAGE_DOT: Record<PipelineStage, string> = {
  new:          'bg-tl-blue',
  screening:    'bg-tl-gold',
  phone_screen: 'bg-tl-teal',
  technical:    'bg-tl-gold',
  onsite:       'bg-tl-teal',
  offer:        'bg-tl-teal',
  hired:        'bg-tl-teal',
  rejected:     'bg-tl-rose',
}

const STAGE_TEXT: Record<PipelineStage, string> = {
  new:          'text-tl-blue',
  screening:    'text-tl-gold',
  phone_screen: 'text-tl-teal',
  technical:    'text-tl-gold',
  onsite:       'text-tl-teal',
  offer:        'text-tl-teal',
  hired:        'text-tl-teal',
  rejected:     'text-tl-rose',
}

const STAGE_BORDER: Record<PipelineStage, string> = {
  new:          'border-tl-blue/20',
  screening:    'border-tl-gold/20',
  phone_screen: 'border-tl-teal/20',
  technical:    'border-tl-gold/20',
  onsite:       'border-tl-teal/20',
  offer:        'border-tl-teal/20',
  hired:        'border-tl-teal/20',
  rejected:     'border-tl-rose/20',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchColor(score: number) {
  if (score >= 90) return 'bg-tl-teal/15 text-tl-teal border-tl-teal/25'
  if (score >= 75) return 'bg-tl-gold/15 text-tl-gold border-tl-gold/25'
  if (score >= 60) return 'bg-tl-gold/10 text-tl-gold border-tl-gold/20'
  return 'bg-tl-rose/15 text-tl-rose border-tl-rose/25'
}

function fallbackName(app: Application): string {
  return (app.candidate?.name as string) || `Candidate ${String(app.candidateId ?? '').slice(-4)}`
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({ app, dragging = false }: { app: Application; dragging?: boolean }) {
  const candidate = app.candidate
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app.id })

  const daysInStage = Math.max(1, Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86_400_000))
  const isStale = daysInStage > 7
  const displayName = candidate?.name || fallbackName(app)
  const displayTitle = candidate?.title || 'Candidate'
  const avatar = candidateAvatarSrc(candidate, displayName)

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'tl-card p-3.5 cursor-grab active:cursor-grabbing hover:border-tl-gold/40 transition-all group touch-none',
        dragging && 'shadow-2xl border-tl-gold rotate-2 scale-105 cursor-grabbing'
      )}
    >
      <div className="flex items-start gap-2.5 mb-2">
        <img
          src={avatar}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover shrink-0 border border-tl-border-subtle bg-tl-bg-elevated"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-tl-text-primary truncate leading-tight">{displayName}</p>
          <p className="text-[11px] text-tl-text-secondary truncate mt-0.5">{displayTitle}</p>
        </div>
        <button className="hidden group-hover:flex p-1 rounded-lg hover:bg-tl-bg-elevated text-tl-text-secondary shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className={cn('text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border', matchColor(app.matchScore))}>
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

      <p className="text-[11px] text-tl-text-secondary truncate mb-2.5">
        {app.job?.title ?? 'Unknown Role'}
      </p>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button className="flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded-lg bg-tl-bg-elevated hover:bg-tl-gold/10 text-tl-text-secondary hover:text-tl-gold transition-colors flex-1">
          <Calendar className="w-3 h-3" />
          <span>Schedule</span>
        </button>
        <button className="flex items-center justify-center gap-1 text-[10px] px-2 py-1.5 rounded-lg bg-tl-bg-elevated hover:bg-tl-teal/10 text-tl-text-secondary hover:text-tl-teal transition-colors flex-1">
          <MessageSquare className="w-3 h-3" />
          <span>Message</span>
        </button>
        <button className="p-1.5 rounded-lg bg-tl-gold/10 hover:bg-tl-gold/20 text-tl-gold transition-colors shrink-0">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  stage, cards, collapsed, onToggle,
}: {
  stage: PipelineStage
  cards: Application[]
  collapsed: boolean
  onToggle: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}` })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col transition-all duration-300 rounded-xl border bg-[var(--tl-bg-surface)]/50',
        STAGE_BORDER[stage],
        isOver && 'ring-2 ring-tl-gold/40 bg-tl-gold/5',
        collapsed ? 'min-w-[48px] w-12' : 'min-w-[240px] w-60'
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          'flex items-center px-3 py-3 border-b shrink-0',
          STAGE_BORDER[stage],
          collapsed ? 'flex-col gap-2 py-4' : 'gap-2 justify-between'
        )}
      >
        {collapsed ? (
          <>
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-lg hover:bg-tl-bg-elevated flex items-center justify-center text-tl-text-secondary"
              title={`Expand ${STAGE_LABELS[stage]}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className={cn('text-[10px] font-bold uppercase tracking-widest writing-vertical-lr', STAGE_TEXT[stage])}
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
              {STAGE_LABELS[stage]}
            </span>
            <span className="font-mono text-[10px] font-bold bg-tl-bg-elevated text-tl-text-secondary w-6 h-6 rounded-full flex items-center justify-center border border-[var(--tl-border-subtle)]">
              {cards.length}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('w-2 h-2 rounded-full shrink-0', STAGE_DOT[stage])} />
              <span className={cn('font-semibold text-xs truncate', STAGE_TEXT[stage])}>
                {STAGE_LABELS[stage]}
              </span>
              <span className="font-mono text-[10px] font-bold bg-tl-bg-elevated text-tl-text-secondary px-1.5 py-0.5 rounded-full border border-[var(--tl-border-subtle)] shrink-0">
                {cards.length}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-lg hover:bg-tl-bg-elevated flex items-center justify-center text-tl-text-secondary shrink-0"
              title="Collapse column"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Cards area */}
      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2">
          {cards.length === 0 ? (
            <div className="border-2 border-dashed border-[var(--tl-border-subtle)] rounded-xl py-8 flex items-center justify-center">
              <p className="text-[10px] text-tl-text-secondary/50 text-center px-2">
                No candidates
              </p>
            </div>
          ) : (
            cards.map(app => <CandidateCard key={app.id} app={app} />)
          )}
        </div>
      )}

      {/* Add button (only when expanded) */}
      {!collapsed && (
        <div className="shrink-0 p-2 pt-0">
          <button className="flex items-center justify-center gap-1.5 py-2 w-full rounded-xl border border-dashed border-[var(--tl-border-subtle)] text-[11px] text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 hover:bg-tl-gold/5 transition-all">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      )}
    </div>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ListRow({ app, idx }: { app: Application; idx: number }) {
  const candidate = app.candidate
  const daysInStage = Math.max(1, Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86_400_000))
  const displayName = candidate?.name || fallbackName(app)
  const displayTitle = candidate?.title || 'Candidate'
  const avatar = candidateAvatarSrc(candidate, displayName)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: idx * 0.03 }}
      className="border-b border-tl-border-subtle hover:bg-tl-bg-elevated/30 transition-colors group"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-tl-border-subtle bg-tl-bg-elevated"
          />
          <div>
            <p className="text-sm font-semibold text-tl-text-primary">{displayName}</p>
            <p className="text-xs text-tl-text-secondary">{displayTitle}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STAGE_DOT[app.stage])} />
          <span className={cn('text-xs font-medium', STAGE_TEXT[app.stage])}>{STAGE_LABELS[app.stage]}</span>
        </div>
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
        {candidate?.id ? (
          <Link href={`/company/candidates/${candidate.id}`}
            className="text-xs font-medium text-tl-gold hover:text-tl-gold/80 opacity-0 group-hover:opacity-100 transition-all">
            View →
          </Link>
        ) : null}
      </td>
    </motion.tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string>(() => searchParams.get('job') ?? 'all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<PipelineStage>>(new Set())
  const [activeApp, setActiveApp] = useState<Application | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragStart = (e: DragStartEvent) => {
    const app = applications.find(a => a.id === e.active.id)
    setActiveApp(app ?? null)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveApp(null)
    if (!e.over) return
    const newStage = String(e.over.id).replace(/^col-/, '') as PipelineStage
    const appId = String(e.active.id)
    const app = applications.find(a => a.id === appId)
    if (!app || app.stage === newStage) return

    setApplications(prev => prev.map(a =>
      a.id === appId ? { ...a, stage: newStage, updatedAt: new Date().toISOString() } : a
    ))

    const stageToStatus: Record<PipelineStage, string> = {
      new: 'applied', screening: 'screening', phone_screen: 'interview',
      technical: 'technical', onsite: 'interview', offer: 'offer',
      hired: 'hired', rejected: 'rejected',
    }
    fetch(`/api/company/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: stageToStatus[newStage] }),
    })
      .then(r => r.ok ? toast.success(`Moved to ${STAGE_LABELS[newStage]}`) : toast.error('Failed to update'))
      .catch(() => toast.error('Failed to update'))
  }

  useEffect(() => {
    let cancelled = false

    async function load(initial = false) {
      const [jobsRes, appsRes] = await Promise.all([getCompanyJobs({ limit: 100 }), getApplications()])
      if (cancelled) return
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      if (initial) setLoading(false)
    }

    load(true)

    const interval = setInterval(() => load(false), 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const toggleCollapse = (stage: PipelineStage) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(stage) ? next.delete(stage) : next.add(stage)
      return next
    })
  }

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      if (app.stage === 'rejected') return false
      const matchesJob = selectedJob === 'all' || app.jobId === selectedJob
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        (app.candidate?.name ?? '').toLowerCase().includes(q) ||
        (app.candidate?.title ?? '').toLowerCase().includes(q) ||
        (app.job?.title ?? '').toLowerCase().includes(q)
      return matchesJob && matchesSearch
    })
  }, [applications, selectedJob, searchQuery])

  const stageCounts = useMemo(() => {
    const counts: Partial<Record<PipelineStage, number>> = {}
    for (const stage of PIPELINE_STAGES) {
      counts[stage] = filteredApps.filter(a => a.stage === stage).length
    }
    return counts
  }, [filteredApps])

  const kanbanData = useMemo(() => (
    PIPELINE_STAGES.map(stage => ({
      stage,
      cards: filteredApps.filter(a => a.stage === stage),
    }))
  ), [filteredApps])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden" style={{ height: 'calc(100svh - 57px)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-5 py-4 border-b border-tl-border-subtle bg-tl-bg-base/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-tl-text-primary">Pipeline</h1>
            <span className="font-mono text-xs font-bold bg-tl-gold/10 text-tl-gold border border-tl-gold/20 px-2.5 py-1 rounded-full">
              {filteredApps.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-1.5 bg-tl-bg-surface border border-tl-border-subtle rounded-xl text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none focus:border-tl-gold/50 w-36 sm:w-44 transition-all"
              />
            </div>

            {/* Job filter */}
            <div className="relative">
              <select
                value={selectedJob}
                onChange={e => setSelectedJob(e.target.value)}
                className="appearance-none bg-tl-bg-surface border border-tl-border-subtle rounded-xl pl-3 pr-7 py-1.5 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold/50 transition-all"
              >
                <option value="all">All Jobs</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-tl-bg-surface rounded-xl border border-tl-border-subtle">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === 'kanban'
                    ? 'bg-tl-bg-elevated text-tl-gold border border-tl-gold/25'
                    : 'text-tl-text-secondary hover:text-tl-text-primary'
                )}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  viewMode === 'list'
                    ? 'bg-tl-bg-elevated text-tl-gold border border-tl-gold/25'
                    : 'text-tl-text-secondary hover:text-tl-text-primary'
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <Link href="/company/jobs/new" className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Candidate
            </Link>
          </div>
        </div>

        {/* Stage stat pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {PIPELINE_STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => toggleCollapse(stage)}
              title={collapsed.has(stage) ? `Expand ${STAGE_LABELS[stage]}` : `Collapse ${STAGE_LABELS[stage]}`}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 transition-all',
                collapsed.has(stage)
                  ? 'bg-[var(--tl-bg-elevated)] border-[var(--tl-border-subtle)] text-[var(--tl-text-secondary)] opacity-60'
                  : 'bg-tl-teal/10 border-tl-teal/20 text-tl-teal'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', STAGE_DOT[stage])} />
              {STAGE_LABELS[stage]}
              <span className="font-mono font-bold">{stageCounts[stage] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Board ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-x-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex gap-3 h-full p-4 pb-3"
                style={{ minWidth: 'max-content' }}
              >
                {kanbanData.map(({ stage, cards }) => (
                  <KanbanColumn
                    key={stage}
                    stage={stage}
                    cards={cards}
                    collapsed={collapsed.has(stage)}
                    onToggle={() => toggleCollapse(stage)}
                  />
                ))}
              </motion.div>
              <DragOverlay dropAnimation={null}>
                {activeApp ? <CandidateCard app={activeApp} dragging /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto p-4"
            >
              <div className="tl-card overflow-hidden">
                {filteredApps.length === 0 ? (
                  <div className="p-16 flex flex-col items-center justify-center text-center">
                    <Users className="w-12 h-12 text-tl-text-secondary/20 mb-4" />
                    <p className="text-sm font-medium text-tl-text-primary">No candidates</p>
                    <p className="text-xs text-tl-text-secondary mt-1">Adjust your filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className="border-b border-tl-border-subtle bg-tl-bg-base/50">
                          {['Candidate', 'Stage', 'Applied For', 'Date', 'Match', 'Days', ''].map(h => (
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
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stage velocity footer ──────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-tl-border-subtle">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Clock className="w-3.5 h-3.5 text-tl-text-secondary shrink-0" />
          <span className="text-xs text-tl-text-secondary shrink-0 mr-1">Avg. days/stage:</span>
          {PIPELINE_STAGES.slice(0, -1).map((stage, i) => {
            const appsInStage = applications.filter(a => a.stage === stage)
            const avgDays = appsInStage.length > 0
              ? Math.round(appsInStage.reduce((s, a) => s + Math.max(1, (Date.now() - new Date(a.updatedAt).getTime()) / 86400000), 0) / appsInStage.length)
              : [1, 3, 5, 8, 5, 3][i] ?? 2
            return (
              <div key={stage} className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <div className="w-12 py-1 rounded-lg text-xs font-mono font-bold text-center bg-tl-gold/8 text-tl-gold border border-tl-gold/15">
                    {avgDays}d
                  </div>
                  <div className="text-[9px] text-tl-text-secondary mt-0.5 w-12 text-center truncate">
                    {STAGE_LABELS[stage]}
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 2 && (
                  <ChevronRight className="w-3 h-3 text-[var(--tl-border-subtle)] shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
