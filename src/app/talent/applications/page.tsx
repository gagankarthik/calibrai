'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { applications } from '@/lib/data'
import { formatSalary, timeAgo, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Download,
  FileText,
  Zap,
  MessageSquare,
  BadgeCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Briefcase,
  TrendingUp,
} from 'lucide-react'
import type { ApplicationStatus, PipelineStage } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/constants'

// ─── Avatar color hash ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; badgeClass: string; dotClass: string; tabClass: string }> = {
  applied:   { label: 'Applied',       badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',       dotClass: 'bg-blue-400',    tabClass: 'text-blue-400' },
  screening: { label: 'Screening',     badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30', dotClass: 'bg-violet-400',  tabClass: 'text-violet-400' },
  interview: { label: 'Interview',     badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',    dotClass: 'bg-amber-400',   tabClass: 'text-amber-400' },
  technical: { label: 'Technical',     badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dotClass: 'bg-orange-400',  tabClass: 'text-orange-400' },
  offer:     { label: 'Offer',         badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dotClass: 'bg-emerald-400', tabClass: 'text-emerald-400' },
  hired:     { label: 'Hired',         badgeClass: 'bg-green-500/15 text-green-400 border-green-500/30',    dotClass: 'bg-green-400',   tabClass: 'text-green-400' },
  rejected:  { label: 'Not Selected',  badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',          dotClass: 'bg-red-400',     tabClass: 'text-red-400' },
}

// ─── Pipeline stages (excluding rejected) for timeline ───────────────────────
type NonRejectedStage = 'new' | 'screening' | 'phone_screen' | 'technical' | 'onsite' | 'offer' | 'hired'
const STAGES: NonRejectedStage[] = ['new', 'screening', 'phone_screen', 'technical', 'onsite', 'offer', 'hired']

// ─── Stage Timeline ───────────────────────────────────────────────────────────
function StageTimeline({ currentStage }: { currentStage: PipelineStage }) {
  const displayStages = STAGES
  const safeStage: NonRejectedStage = (currentStage === 'rejected' ? 'new' : currentStage) as NonRejectedStage
  const currentIdx = displayStages.indexOf(safeStage)

  return (
    <div className="flex items-center gap-0 my-3">
      {displayStages.map((stage, i) => (
        <div key={stage} className="flex items-center">
          <div
            className={cn(
              'w-3 h-3 rounded-full border-2 transition-all',
              i < currentIdx  ? 'bg-primary border-primary' :
              i === currentIdx ? 'bg-primary border-primary ring-2 ring-primary/30' :
              'bg-background border-border'
            )}
            title={STAGE_LABELS[stage as PipelineStage]}
          />
          {i < displayStages.length - 1 && (
            <div className={cn('h-0.5 w-6 lg:w-8', i < currentIdx ? 'bg-primary' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Filter type ─────────────────────────────────────────────────────────────
type FilterStatus = ApplicationStatus | 'all'

const FILTER_TABS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'all',       label: 'All' },
  { value: 'applied',   label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'technical', label: 'Technical' },
  { value: 'offer',     label: 'Offer' },
  { value: 'hired',     label: 'Hired' },
  { value: 'rejected',  label: 'Rejected' },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter)

  const counts = Object.fromEntries(
    ['applied', 'screening', 'interview', 'technical', 'offer', 'hired', 'rejected'].map(s => [
      s,
      applications.filter(a => a.status === s).length,
    ])
  ) as Record<ApplicationStatus, number>

  const stats = {
    total:     applications.length,
    active:    applications.filter(a => !['hired', 'rejected'].includes(a.status)).length,
    interview: applications.filter(a => a.status === 'interview').length,
    offers:    applications.filter(a => a.status === 'offer').length,
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track every application in one place</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </motion.div>

      {/* ── STATS ROW ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Total Applied',  value: stats.total,     icon: FileText,    iconClass: 'text-blue-400',    bgClass: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Active',         value: stats.active,    icon: Zap,         iconClass: 'text-violet-400',  bgClass: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'In Interview',   value: stats.interview, icon: Calendar,    iconClass: 'text-amber-400',   bgClass: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Offers',         value: stats.offers,    icon: TrendingUp,  iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2 border', stat.bgClass)}>
              <stat.icon className={cn('w-4 h-4', stat.iconClass)} />
            </div>
            <p className={cn('text-2xl font-bold', stat.iconClass)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── STATUS FILTER TABS ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {FILTER_TABS.map(tab => {
          const count = tab.value === 'all' ? applications.length : (counts[tab.value as ApplicationStatus] ?? 0)
          const isActive = statusFilter === tab.value
          const cfg = tab.value !== 'all' ? STATUS_CONFIG[tab.value as ApplicationStatus] : null

          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-[10px] font-semibold',
                isActive ? 'text-primary-foreground/70' : (cfg?.tabClass ?? 'text-muted-foreground/60')
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* ── APPLICATION LIST ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-16 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No applications yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start applying to matched jobs and track every application in real time.
              </p>
            </div>
            <Button asChild>
              <Link href="/talent/jobs">Browse Jobs</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={statusFilter}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filtered.map(app => {
              const cfg        = STATUS_CONFIG[app.status]
              const isRejected = app.status === 'rejected'

              return (
                <motion.div
                  key={app.id}
                  variants={cardVariants}
                  className={cn(
                    'glass-card p-5 transition-all duration-300',
                    isRejected ? 'opacity-75 border-red-500/20' : 'hover:border-primary/20'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar + status dot */}
                    <div className="relative shrink-0">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base', avatarColor(app.job.company.name))}>
                        {app.job.company.name[0]}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background', cfg.dotClass)} />
                    </div>

                    {/* Center */}
                    <div className="flex-1 min-w-0">
                      {/* Title + status pill */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-foreground leading-tight truncate">{app.job.title}</h3>
                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0', cfg.badgeClass)}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground mb-1">
                        <span className="flex items-center gap-1 font-medium">
                          {app.job.company.name}
                          {app.job.company.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-muted/50 border border-border text-[10px] capitalize">{app.job.workMode}</span>
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />{app.job.location}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold">
                          {formatSalary(app.job.salaryMin, app.job.salaryMax)}
                        </span>
                      </div>

                      {/* Stage timeline */}
                      <StageTimeline currentStage={app.stage} />

                      {/* Last update */}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last update: {timeAgo(app.updatedAt)}
                      </p>

                      {/* Notes preview */}
                      {app.notes && (
                        <p className="text-xs text-muted-foreground italic mt-2 line-clamp-1">&ldquo;{app.notes}&rdquo;</p>
                      )}

                      {/* Rejected message */}
                      {isRejected && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <span className="text-red-400 font-semibold">Not Selected</span>
                          {' '}· The team decided to move forward with other candidates.
                        </p>
                      )}
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                        <Link href={`/talent/jobs/${app.jobId}`}>
                          <Briefcase className="w-3 h-3 mr-1" /> View Details
                        </Link>
                      </Button>
                      {!isRejected && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <MessageSquare className="w-3 h-3 mr-1" /> Message Recruiter
                        </Button>
                      )}
                      {isRejected && (
                        <span className="text-xs text-muted-foreground text-center px-2">Not Selected</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
