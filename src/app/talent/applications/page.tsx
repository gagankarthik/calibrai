'use client'

import { useState } from 'react'
import { applications } from '@/lib/data'
import { ApplicationStatus, PipelineStage } from '@/lib/types'
import { formatSalary, timeAgo, formatDate } from '@/lib/utils'
import { MatchScore } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Briefcase,
  MapPin,
  Clock,
  Star,
  MessageSquare,
  ExternalLink,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Building2,
  FileText,
  TrendingUp,
  AlertCircle,
  Zap,
  BadgeCheck,
  DollarSign,
} from 'lucide-react'

type FilterStatus = 'all' | ApplicationStatus

const statusFilters: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'technical', label: 'Technical' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
]

const pipelineStages: { id: PipelineStage; label: string }[] = [
  { id: 'new', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'phone_screen', label: 'Phone Screen' },
  { id: 'technical', label: 'Technical' },
  { id: 'onsite', label: 'Onsite' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
]

const stageOrder: PipelineStage[] = ['new', 'screening', 'phone_screen', 'technical', 'onsite', 'offer', 'hired']

const statusConfig: Record<ApplicationStatus, { label: string; color: string; bg: string; border: string; description: string }> = {
  applied: {
    label: 'Applied',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Your application was submitted. The hiring team will review it shortly.',
  },
  screening: {
    label: 'Screening',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Your application is being reviewed by the hiring team. Typically takes 3–5 business days.',
  },
  interview: {
    label: 'Interview',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    description: 'Congratulations! You have been selected for an interview. Check your email for scheduling details.',
  },
  technical: {
    label: 'Technical',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'You are in the technical assessment phase. Prepare to demonstrate your skills and problem-solving ability.',
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'An offer has been extended! Review the details carefully and respond within the deadline.',
  },
  hired: {
    label: 'Hired',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Welcome aboard! You have successfully joined the team.',
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Unfortunately, the company has decided not to move forward at this time. Keep applying!',
  },
}

const workModeColors: Record<string, string> = {
  remote: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  hybrid: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  onsite: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
}

function StageTimeline({ current, status }: { current: PipelineStage; status: ApplicationStatus }) {
  const currentIdx = stageOrder.indexOf(current)
  const isRejected = status === 'rejected'

  return (
    <div className="flex items-center gap-0">
      {pipelineStages.map((stage, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx && !isRejected
        const isFuture = idx > currentIdx

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                  ${isCurrent ? 'bg-blue-500/20 border-blue-400 text-blue-400 ring-2 ring-blue-400/30 ring-offset-1 ring-offset-background animate-pulse' : ''}
                  ${isFuture ? 'bg-white/5 border-border text-muted-foreground' : ''}
                  ${isRejected && idx === currentIdx ? 'bg-red-500/20 border-red-400 text-red-400' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[9px] font-medium whitespace-nowrap ${
                  isCompleted ? 'text-emerald-400' :
                  isCurrent ? 'text-blue-400' :
                  'text-muted-foreground/50'
                }`}
              >
                {stage.label}
              </span>
            </div>
            {idx < pipelineStages.length - 1 && (
              <div
                className={`h-px w-6 sm:w-8 mb-4 transition-all ${
                  idx < currentIdx ? 'bg-emerald-500' : 'bg-border'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
        />
      ))}
    </div>
  )
}

export default function ApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')

  // In a real app, filter by candidateId === 'can1'. For demo, show all.
  const allApplications = applications

  const filtered = activeFilter === 'all'
    ? allApplications
    : allApplications.filter(app => app.status === activeFilter)

  const stats = {
    total: allApplications.length,
    active: allApplications.filter(a => !['hired', 'rejected'].includes(a.status)).length,
    interviews: allApplications.filter(a => ['interview', 'technical', 'onsite'].includes(a.status)).length,
    offers: allApplications.filter(a => a.status === 'offer').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow mb-3 inline-flex">
            <FileText className="w-3.5 h-3.5" />
            No More Black Holes
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track every application in real time — know exactly where you stand
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <TrendingUp className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applied', value: stats.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Active', value: stats.active, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Interviews', value: stats.interviews, icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Offers', value: stats.offers, icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`glass-card p-4 border ${stat.bg}`}>
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(filter => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
              activeFilter === filter.value
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
            }`}
          >
            {filter.label}
            {filter.value !== 'all' && (
              <span className={`ml-1.5 text-[11px] ${activeFilter === filter.value ? 'text-white/70' : 'text-muted-foreground/60'}`}>
                {allApplications.filter(a => a.status === filter.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Application Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-border flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start applying to matched jobs and track every application in real time — no more guessing where you stand.
            </p>
          </div>
          <Button className="mt-2">
            <Zap className="w-4 h-4 mr-2" />
            Browse Matched Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const config = statusConfig[app.status]
            const job = app.job
            const company = job.company
            const canWithdraw = !['hired', 'rejected'].includes(app.status)
            const daysSince = Math.floor((Date.now() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24))

            return (
              <div
                key={app.id}
                className="glass-card p-5 sm:p-6 space-y-5 hover:border-white/[0.15] transition-all duration-300"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Company logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-border bg-white/5 flex items-center justify-center shrink-0">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground">{job.title}</h3>
                          {company.verified && (
                            <BadgeCheck className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-medium text-blue-400">{company.name}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-xs text-muted-foreground">{company.industry}</span>
                        </div>
                      </div>
                      <MatchScore score={app.matchScore} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${workModeColors[job.workMode] ?? 'bg-white/5 border-border text-muted-foreground'} capitalize`}>
                        {job.workMode}
                      </span>
                      <Badge variant="outline" className="text-[11px] h-5 capitalize">
                        {job.department}
                      </Badge>
                      {job.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Application Timeline</p>
                  <div className="overflow-x-auto pb-1">
                    <StageTimeline current={app.stage} status={app.status} />
                  </div>
                </div>

                {/* Status explanation */}
                <div className={`flex items-start gap-2.5 p-3 rounded-xl ${config.bg} border ${config.border}`}>
                  <AlertCircle className={`w-4 h-4 ${config.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-xs font-semibold ${config.color} mb-0.5`}>
                      Status: {config.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>

                {/* Notes & Rating */}
                {(app.notes || app.rating) && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    {app.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Rating:</span>
                        <StarRating rating={app.rating} />
                      </div>
                    )}
                    {app.notes && (
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        &ldquo;{app.notes}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Applied {daysSince === 0 ? 'today' : `${daysSince}d ago`} — {formatDate(app.appliedAt)}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" />
                      Last updated {timeAgo(app.updatedAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      View Job
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Message
                    </Button>
                    {canWithdraw && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
