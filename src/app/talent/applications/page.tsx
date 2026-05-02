'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getApplications } from '@/lib/api'
import type { Application } from '@/lib/types'
import { formatSalary, timeAgo, cn, companyAvatarUrl } from '@/lib/utils'
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


// â”€â”€â”€ Status config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; badgeClass: string; dotClass: string; tabClass: string }> = {
  applied:   { label: 'Applied',       badgeClass: 'tl-tag-blue',   dotClass: 'bg-tl-blue',   tabClass: 'text-tl-blue' },
  screening: { label: 'Screening',     badgeClass: 'bg-violet-500/15 text-violet-400 border border-violet-500/30', dotClass: 'bg-violet-400',  tabClass: 'text-violet-400' },
  interview: { label: 'Interview',     badgeClass: 'tl-tag-gold',   dotClass: 'bg-tl-gold',   tabClass: 'text-tl-gold' },
  technical: { label: 'Technical',     badgeClass: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', dotClass: 'bg-orange-400',  tabClass: 'text-orange-400' },
  offer:     { label: 'Offer',         badgeClass: 'tl-tag-teal',   dotClass: 'bg-tl-teal',   tabClass: 'text-tl-teal' },
  hired:     { label: 'Hired',         badgeClass: 'tl-tag-teal',   dotClass: 'bg-tl-teal',   tabClass: 'text-tl-teal' },
  rejected:  { label: 'Not Selected',  badgeClass: 'tl-tag-rose',   dotClass: 'bg-tl-rose',   tabClass: 'text-tl-rose' },
}

// â”€â”€â”€ Pipeline stages (excluding rejected) for timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type NonRejectedStage = 'new' | 'screening' | 'phone_screen' | 'technical' | 'onsite' | 'offer' | 'hired'
const STAGES: NonRejectedStage[] = ['new', 'screening', 'phone_screen', 'technical', 'onsite', 'offer', 'hired']

// â”€â”€â”€ Stage Timeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              i < currentIdx  ? 'bg-tl-teal border-tl-teal' :
              i === currentIdx ? 'bg-tl-gold border-tl-gold ring-2 ring-tl-gold/30' :
              'bg-tl-bg-elevated border-tl-border-default'
            )}
            title={STAGE_LABELS[stage as PipelineStage]}
          />
          {i < displayStages.length - 1 && (
            <div className={cn('h-0.5 w-6 lg:w-8', i < currentIdx ? 'bg-tl-gold' : 'bg-tl-border-subtle')} />
          )}
        </div>
      ))}
    </div>
  )
}

// â”€â”€â”€ Filter type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getApplications()
      if (res.data) setApplications(res.data)
      setLoading(false)
    }
    load()
  }, [])

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const listVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* â”€â”€ HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-tl-text-primary">My Applications</h1>
          <p className="text-sm text-tl-text-secondary mt-1">Track every application in one place</p>
        </div>
        <button className="btn-ghost gap-2 shrink-0 flex items-center">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* â”€â”€ STATS ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
      >
        {[
          { label: 'Total Applied',  value: stats.total,     icon: FileText,    iconClass: 'text-tl-blue',   bgClass: 'bg-tl-blue/10 border-tl-blue/20' },
          { label: 'Active',         value: stats.active,    icon: Zap,         iconClass: 'text-violet-400',  bgClass: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'In Interview',   value: stats.interview, icon: Calendar,    iconClass: 'text-tl-gold',   bgClass: 'bg-tl-gold/10 border-tl-gold/20' },
          { label: 'Offers',         value: stats.offers,    icon: TrendingUp,  iconClass: 'text-tl-teal',   bgClass: 'bg-tl-teal/10 border-tl-teal/20' },
        ].map(stat => (
          <div key={stat.label} className="tl-card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2 border', stat.bgClass)}>
              <stat.icon className={cn('w-4 h-4', stat.iconClass)} />
            </div>
            <p className={cn('text-2xl font-mono font-bold', stat.iconClass)}>{stat.value}</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* â”€â”€ STATUS FILTER TABS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex flex-wrap gap-2 mb-4 border-b border-tl-border-subtle pb-3"
      >
        {FILTER_TABS.map(tab => {
          const count = tab.value === 'all' ? applications.length : (counts[tab.value as ApplicationStatus] ?? 0)
          const isActive = statusFilter === tab.value

          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium border-b-2 -mb-[17px] transition-all duration-200 shrink-0',
                isActive
                  ? 'border-tl-gold text-tl-gold'
                  : 'border-transparent text-tl-text-secondary hover:text-tl-text-primary'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-[10px] font-mono font-semibold',
                isActive ? 'text-tl-gold' : 'text-tl-text-secondary/60'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* â”€â”€ APPLICATION LIST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="tl-card p-16 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-tl-bg-elevated flex items-center justify-center">
              <FileText className="w-8 h-8 text-tl-text-secondary/40" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-tl-text-primary mb-1">No applications yet</h3>
              <p className="text-sm text-tl-text-secondary max-w-sm">
                Start applying to matched jobs and track every application in real time.
              </p>
            </div>
            <Link href="/talent/jobs">
              <button className="btn-gold">Browse Jobs</button>
            </Link>
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
              const isInterview = app.status === 'interview'

              return (
                <motion.div
                  key={app.id}
                  variants={cardVariants}
                  className={cn(
                    'transition-all duration-300',
                    isInterview
                      ? 'tl-card-elevated border-l-4 border-l-tl-gold'
                      : isRejected
                      ? 'tl-card opacity-75 border-tl-rose/20'
                      : 'tl-card hover:border-tl-gold/20'
                  )}
                >
                  <div className="p-5 flex items-start gap-4">
                    {/* Avatar + status dot */}
                    <div className="relative shrink-0">
                      <img src={companyAvatarUrl(app.job?.company?.name)} alt={app.job?.company?.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-tl-bg-base', cfg.dotClass)} />
                    </div>

                    {/* Center */}
                    <div className="flex-1 min-w-0">
                      {/* Title + status pill */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-tl-text-primary leading-tight truncate">{app.job?.title}</h3>
                        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0', cfg.badgeClass)}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-tl-text-secondary mb-1">
                        <span className="flex items-center gap-1 font-medium">
                          {app.job?.company?.name}
                          {app.job?.company?.verified && <BadgeCheck className="w-3.5 h-3.5 text-tl-teal" />}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-[10px] capitalize">{app.job?.workMode}</span>
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3 h-3" />{app.job?.location}
                        </span>
                        <span className="text-xs text-tl-teal font-mono font-semibold">
                          {formatSalary(app.job.salaryMin, app.job.salaryMax)}
                        </span>
                      </div>

                      {/* Stage timeline */}
                      <StageTimeline currentStage={app.stage} />

                      {/* Last update */}
                      <p className="text-xs text-tl-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last update: {timeAgo(app.updatedAt)}
                      </p>

                      {/* Notes preview */}
                      {app.notes && (
                        <p className="text-xs text-tl-text-secondary italic mt-2 line-clamp-1">&ldquo;{app.notes}&rdquo;</p>
                      )}

                      {/* Interview upcoming highlight */}
                      {isInterview && (
                        <p className="mt-2 text-xs text-tl-gold font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Interview upcoming â€” check your email for details
                        </p>
                      )}

                      {/* Rejected message */}
                      {isRejected && (
                        <p className="mt-2 text-xs text-tl-text-secondary">
                          <span className="text-tl-rose font-semibold">Not Selected</span>
                          {' '}Â· The team decided to move forward with other candidates.
                        </p>
                      )}
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-tl-border-default text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-gold/40 bg-transparent" asChild>
                        <Link href={`/talent/jobs/${app.jobId}`}>
                          <Briefcase className="w-3 h-3 mr-1" /> View Details
                        </Link>
                      </Button>
                      {!isRejected && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-tl-text-secondary hover:text-tl-gold">
                          <MessageSquare className="w-3 h-3 mr-1" /> Message Recruiter
                        </Button>
                      )}
                      {isRejected && (
                        <span className="text-xs text-tl-text-secondary text-center px-2">Not Selected</span>
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
