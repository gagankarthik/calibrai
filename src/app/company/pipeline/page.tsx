'use client'

import { useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MatchScore } from '@/components/shared/match-score'
import { pipelineColumns } from '@/lib/data'
import { cn, timeAgo } from '@/lib/utils'
import { PipelineColumn, Application } from '@/lib/types'
import {
  Plus, Filter, ChevronDown, Star, Calendar, Send, Eye,
  TrendingUp, Clock, BarChart2, ChevronUp,
} from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

const STAGE_CONFIG: Record<string, {
  color: string; dot: string; badge: string; action: string; bg: string
}> = {
  new:          { color: 'text-blue-400',    dot: 'bg-blue-400',    badge: 'bg-blue-500/10 border-blue-500/20',    action: 'Schedule Screen',     bg: 'from-blue-500/10' },
  screening:    { color: 'text-purple-400',  dot: 'bg-purple-400',  badge: 'bg-purple-500/10 border-purple-500/20',action: 'Move to Phone Screen', bg: 'from-purple-500/10' },
  phone_screen: { color: 'text-cyan-400',    dot: 'bg-cyan-400',    badge: 'bg-cyan-500/10 border-cyan-500/20',    action: 'Schedule Interview',   bg: 'from-cyan-500/10' },
  technical:    { color: 'text-amber-400',   dot: 'bg-amber-400',   badge: 'bg-amber-500/10 border-amber-500/20',  action: 'Schedule Onsite',      bg: 'from-amber-500/10' },
  onsite:       { color: 'text-orange-400',  dot: 'bg-orange-400',  badge: 'bg-orange-500/10 border-orange-500/20',action: 'Prepare Offer',        bg: 'from-orange-500/10' },
  offer:        { color: 'text-emerald-400', dot: 'bg-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20',action: 'Send Offer',          bg: 'from-emerald-500/10' },
}

const AVG_DAYS: Record<string, number> = {
  new: 1, screening: 3, phone_screen: 5, technical: 7, onsite: 4, offer: 2,
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('w-3 h-3', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
      ))}
    </div>
  )
}

function CandidateCard({ app, stageId }: { app: Application; stageId: string }) {
  const cfg = STAGE_CONFIG[stageId]
  const candidate = app.candidate
  if (!candidate) return null

  const daysInStage = Math.max(1, Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / 86400000))

  return (
    <div className="glass-card p-4 cursor-grab active:cursor-grabbing hover:border-white/[0.18] hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative">
          <Avatar className="w-9 h-9 ring-2 ring-white/10">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback className="text-xs bg-secondary">{candidate.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{candidate.name}</p>
          <p className="text-xs text-muted-foreground truncate">{candidate.title}</p>
        </div>
        <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', cfg.badge, cfg.color)}>
          Day {daysInStage}
        </span>
      </div>

      {/* Job applied */}
      <p className="text-xs text-muted-foreground mb-2 truncate">
        <span className="text-foreground/60">For:</span> {app.job.title}
      </p>

      {/* Match score */}
      <div className="flex items-center justify-between mb-3">
        <MatchScore score={app.matchScore} size="sm" showLabel={false} />
        {app.rating && <StarRating rating={app.rating} />}
      </div>

      {/* Status note */}
      {app.notes && (
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2 italic border-l-2 border-white/10 pl-2">
          {app.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all">
          <Eye className="w-3 h-3" /> View
        </button>
        <button className={cn('flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1.5 rounded-lg border transition-all', cfg.badge, cfg.color, 'hover:opacity-80')}>
          {stageId === 'offer' ? <Send className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          {cfg.action.split(' ')[0]}
        </button>
      </div>
    </div>
  )
}

function KanbanColumn({ col, collapsed, onToggle }: {
  col: PipelineColumn; collapsed: boolean; onToggle: () => void
}) {
  const cfg = STAGE_CONFIG[col.id]
  return (
    <div className={cn('flex flex-col flex-shrink-0 transition-all duration-300', collapsed ? 'w-14' : 'w-72')}>
      {/* Column header */}
      <div className={cn('glass rounded-2xl mb-3 p-3 flex items-center gap-2 bg-gradient-to-b to-transparent', cfg.bg)}>
        {collapsed ? (
          <button onClick={onToggle} className="w-full flex flex-col items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
            <span className={cn('text-[10px] font-bold [writing-mode:vertical-lr] rotate-180 tracking-wider', cfg.color)}>
              {col.label.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-foreground bg-white/10 rounded-full w-6 h-6 flex items-center justify-center">
              {col.candidates.length}
            </span>
          </button>
        ) : (
          <>
            <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.dot)} />
            <span className={cn('text-sm font-semibold flex-1', cfg.color)}>{col.label}</span>
            <span className="text-xs font-bold text-foreground bg-white/10 rounded-full px-2 py-0.5">
              {col.candidates.length}
            </span>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
              <ChevronUp className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className="flex flex-col gap-3 flex-1">
          {col.candidates.length === 0 ? (
            <div className="border-2 border-dashed border-white/[0.06] rounded-2xl h-28 flex items-center justify-center">
              <p className="text-xs text-muted-foreground/50">Drop candidates here</p>
            </div>
          ) : (
            col.candidates.map(app => (
              <CandidateCard key={app.id} app={app} stageId={col.id} />
            ))
          )}

          {/* Add button */}
          <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-white/[0.1] text-xs text-muted-foreground hover:text-foreground hover:border-white/[0.2] hover:bg-white/[0.03] transition-all duration-200">
            <Plus className="w-3.5 h-3.5" /> Add Candidate
          </button>
        </div>
      )}
    </div>
  )
}

const funnelData = pipelineColumns.map(c => ({
  name: c.label,
  candidates: c.candidates.length,
}))

export default function PipelinePage() {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showFunnel, setShowFunnel] = useState(false)
  const [filterJob, setFilterJob] = useState('all')

  const totalActive = pipelineColumns.reduce((s, c) => s + c.candidates.length, 0)
  const offerCount = pipelineColumns.find(c => c.id === 'offer')?.candidates.length ?? 0

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hiring Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track candidates across all stages</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Stats */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 glass rounded-xl">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-foreground font-medium">{totalActive}</span> active
              <span className="text-white/20 mx-1">|</span>
              <span className="text-foreground font-medium">{offerCount}</span> offer{offerCount !== 1 ? 's' : ''} extended
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterJob}
                onChange={e => setFilterJob(e.target.value)}
                className="appearance-none bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-sm text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Jobs</option>
                <option value="j1">Senior Frontend Engineer</option>
                <option value="j2">Product Manager, Growth</option>
                <option value="j3">Staff Software Engineer</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFunnel(p => !p)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200',
                showFunnel
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'bg-white/[0.05] border-white/[0.1] text-muted-foreground hover:text-foreground hover:border-white/[0.2]'
              )}
            >
              <BarChart2 className="w-4 h-4" /> Funnel View
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Stage analytics strip */}
        <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Avg days per stage:</span>
          {pipelineColumns.map(col => (
            <span key={col.id} className="flex items-center gap-1">
              <span className={cn('font-medium', STAGE_CONFIG[col.id].color)}>{col.label}</span>
              <span className="text-foreground font-semibold">{AVG_DAYS[col.id]}d</span>
            </span>
          ))}
        </div>
      </div>

      {/* Funnel chart */}
      {showFunnel && (
        <div className="flex-shrink-0 border-b border-white/[0.06] px-6 py-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Pipeline Funnel</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={funnelData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(222 47% 7%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                labelStyle={{ color: 'hsl(213 31% 91%)', fontWeight: 600, fontSize: 12 }}
                itemStyle={{ color: 'hsl(213 31% 91%)', fontSize: 12 }}
              />
              <Bar dataKey="candidates" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-h-[600px]">
          {pipelineColumns.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              collapsed={!!collapsed[col.id]}
              onToggle={() => toggleCollapse(col.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
