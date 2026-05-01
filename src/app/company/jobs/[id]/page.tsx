'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { jobs, applications, candidates } from '@/lib/data'
import { formatSalary, timeAgo, formatDate, cn } from '@/lib/utils'
import { MatchScore, MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Building2,
  MonitorSmartphone,
  Users,
  Eye,
  Calendar,
  Pencil,
  Pause,
  Play,
  Share2,
  CheckCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronRight,
  Download,
  Trash2,
  Bell,
  Settings,
  Filter,
  Star,
  ArrowRight,
  CircleDot,
  Layers,
  BrainCircuit,
} from 'lucide-react'

const workModeConfig: Record<string, { icon: React.ReactNode; label: string; badgeVariant: 'cyan' | 'purple' | 'blue' }> = {
  remote: { icon: <Wifi className="w-3 h-3" />, label: 'Remote', badgeVariant: 'cyan' },
  hybrid: { icon: <MonitorSmartphone className="w-3 h-3" />, label: 'Hybrid', badgeVariant: 'purple' },
  onsite: { icon: <Building2 className="w-3 h-3" />, label: 'On-site', badgeVariant: 'blue' },
}

const levelLabels: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior Level',
  lead: 'Lead / Staff',
  executive: 'Executive',
}

const stageLabels: Record<string, string> = {
  new: 'New',
  screening: 'Screening',
  phone_screen: 'Phone Screen',
  technical: 'Technical',
  onsite: 'Onsite',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

const stageBadgeVariant: Record<string, 'blue' | 'purple' | 'cyan' | 'warning' | 'success' | 'rose' | 'ghost'> = {
  new: 'blue',
  screening: 'purple',
  phone_screen: 'cyan',
  technical: 'warning',
  onsite: 'cyan',
  offer: 'success',
  hired: 'success',
  rejected: 'rose',
}

const STAGE_FILTERS = ['All', 'New', 'Screening', 'Interview', 'Technical', 'Offer']

// Fake weekly analytics data
const weeklyData = [
  { week: 'Apr 7', apps: 32, interviews: 5 },
  { week: 'Apr 14', apps: 54, interviews: 9 },
  { week: 'Apr 21', apps: 76, interviews: 14 },
  { week: 'Apr 28', apps: 88, interviews: 18 },
  { week: 'May 5', apps: 34, interviews: 7 },
]

// Source breakdown
const sourcesData = [
  { name: 'Calibr', pct: 48, color: 'bg-blue-500' },
  { name: 'LinkedIn', pct: 28, color: 'bg-purple-500' },
  { name: 'Referrals', pct: 14, color: 'bg-emerald-500' },
  { name: 'Direct', pct: 10, color: 'bg-amber-500' },
]

// Funnel conversion
const funnelData = [
  { stage: 'Applied', count: 284, pct: 100 },
  { stage: 'Screened', count: 86, pct: 30 },
  { stage: 'Phone Screen', count: 38, pct: 13 },
  { stage: 'Technical', count: 16, pct: 6 },
  { stage: 'Offer', count: 4, pct: 1.4 },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('w-3 h-3', i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  )
}

export default function CompanyJobDetailPage({ params }: { params: { id: string } }) {
  const job = jobs.find((j) => j.id === params.id) || jobs[0]
  const jobApplications = applications.filter((a) => a.jobId === job.id)
  const wm = workModeConfig[job.workMode]

  const [isPaused, setIsPaused] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [stageFilter, setStageFilter] = useState('All')
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set())
  const [isJobActive, setIsJobActive] = useState(true)
  const [notifyNewApp, setNotifyNewApp] = useState(true)
  const [notifyHighMatch, setNotifyHighMatch] = useState(true)

  // Get more applicants for display (use all candidates as mock applicants if few real apps)
  const displayApplicants = jobApplications.length > 0
    ? jobApplications
    : applications.slice(0, 3)

  const filteredApplicants = stageFilter === 'All'
    ? displayApplicants
    : displayApplicants.filter((a) => {
        const stageKey = stageFilter.toLowerCase().replace(' ', '_')
        return a.stage === stageKey || a.status === stageKey
      })

  const avgMatchScore = Math.round(
    displayApplicants.reduce((sum, a) => sum + a.matchScore, 0) / (displayApplicants.length || 1)
  )

  const toggleApplicant = (id: string) => {
    setSelectedApplicants((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedApplicants.size === displayApplicants.length) {
      setSelectedApplicants(new Set())
    } else {
      setSelectedApplicants(new Set(displayApplicants.map((a) => a.id)))
    }
  }

  const maxWeeklyApps = Math.max(...weeklyData.map((d) => d.apps))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          href="/company/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
      </motion.div>

      {/* ── Header Card ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Title + status */}
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <Badge variant={isPaused ? 'warning' : 'success'}>
                  <div className={cn('w-1.5 h-1.5 rounded-full', isPaused ? 'bg-amber-400' : 'bg-emerald-400')} />
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
                <Badge variant={wm.badgeVariant} className="flex items-center gap-1">
                  {wm.icon}
                  {wm.label}
                </Badge>
                <Badge variant="ghost">{levelLabels[job.level]}</Badge>
                <Badge variant="ghost" className="capitalize">{job.type}</Badge>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{job.applicantCount}</span> applicants
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{job.viewCount.toLocaleString()}</span> views
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Posted {timeAgo(job.postedAt)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Expires {formatDate(job.expiresAt)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
            </div>

            {/* AI Match Score avg */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">
                Average AI Match Score: <span className="font-bold">{avgMatchScore}%</span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="w-3.5 h-3.5" />
              Edit Job
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-2', isPaused && 'text-emerald-400 border-emerald-500/30')}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'Activate' : 'Pause Job'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applicants">
              Applicants ({job.applicantCount})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* ── Overview Tab ──────────────────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left: Job details */}
              <div className="lg:col-span-2 space-y-5">
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">About the Role</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{job.description}</p>

                  <h4 className="text-sm font-semibold text-foreground mb-3">Requirements</h4>
                  <ul className="space-y-2.5 mb-5">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>

                  {job.niceToHave.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Nice to Have</h4>
                      <ul className="space-y-2.5 mb-5">
                        {job.niceToHave.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <h4 className="text-sm font-semibold text-foreground mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="tag text-xs bg-blue-500/[0.07] border-blue-500/20 text-blue-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">Compensation & Benefits</h3>
                  <p className="text-xl font-bold text-emerald-400 mb-3">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">/ year</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b) => (
                      <span key={b} className="tag text-xs bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-400">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: AI Insights */}
              <div className="space-y-4">
                <div className="glass-card p-5 border-blue-500/20 bg-gradient-to-b from-blue-500/[0.05] to-transparent">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">AI Recruitment Insights</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Best Apply Time</p>
                      <p className="text-sm text-foreground font-medium">Tuesday 10am–12pm</p>
                      <p className="text-xs text-muted-foreground mt-0.5">2.4x more applications on average</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Top Competing Companies</p>
                      <div className="space-y-1.5">
                        {[
                          { name: 'Google', status: 'active', color: 'text-rose-400' },
                          { name: 'Meta', status: 'active', color: 'text-blue-400' },
                          { name: 'Vercel', status: 'paused', color: 'text-muted-foreground' },
                        ].map((c) => (
                          <div key={c.name} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{c.name}</span>
                            <span className={cn('text-[10px] font-medium', c.color)}>{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
                          <p className="text-xs text-muted-foreground mt-0.5">Increases qualified applicant volume by ~34%</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Predicted Time to Fill</p>
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-xl font-bold text-foreground">22 days</p>
                        <span className="text-xs text-emerald-400 font-medium">on track</span>
                      </div>
                      <Progress value={62} className="h-1.5 mt-2" />
                      <p className="text-[10px] text-muted-foreground mt-1">Day 14 of projected 22</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Applicants Tab ─────────────────────────────────────────────── */}
          <TabsContent value="applicants">
            {/* Filter bar */}
            <div className="glass-card p-4 mb-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1.5 flex-wrap">
                    {STAGE_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setStageFilter(f)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
                          stageFilter === f
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk actions */}
                <div className="flex items-center gap-2">
                  {selectedApplicants.size > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedApplicants.size} selected
                    </span>
                  )}
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={toggleAll}>
                    {selectedApplicants.size === displayApplicants.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" disabled={selectedApplicants.size === 0}>
                    <Layers className="w-3.5 h-3.5" />
                    Bulk Move Stage
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Applicant rows */}
            <div className="space-y-3">
              {filteredApplicants.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground">No applicants in this stage</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different filter</p>
                </div>
              ) : (
                filteredApplicants.map((app, idx) => {
                  const candidate = app.candidate
                  if (!candidate) return null
                  const isSelected = selectedApplicants.has(app.id)
                  const stageVariant = stageBadgeVariant[app.stage] ?? 'ghost'

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={cn(
                        'glass-card p-4 hover:border-white/[0.15] transition-all duration-200',
                        isSelected && 'border-blue-500/30 bg-blue-500/[0.03]'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Select checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleApplicant(app.id)}
                          className="w-4 h-4 rounded accent-blue-500 shrink-0"
                        />

                        {/* Avatar */}
                        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white/10">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} />
                          <AvatarFallback className="text-sm font-bold">
                            {candidate.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name + title */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{candidate.name}</span>
                            {candidate.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{candidate.title}</p>
                        </div>

                        {/* Match score */}
                        <div className="hidden sm:block shrink-0">
                          <MatchRing score={app.matchScore} size={44} strokeWidth={4} />
                        </div>

                        {/* Stage badge */}
                        <div className="hidden md:block shrink-0">
                          <Badge variant={stageVariant} className="text-xs capitalize">
                            {stageLabels[app.stage] ?? app.stage}
                          </Badge>
                        </div>

                        {/* Applied date */}
                        <div className="hidden lg:block shrink-0">
                          <span className="text-xs text-muted-foreground">{timeAgo(app.appliedAt)}</span>
                        </div>

                        {/* Rating */}
                        <div className="hidden xl:block shrink-0">
                          {app.rating ? <StarRating rating={app.rating} /> : <span className="text-xs text-muted-foreground/40">—</span>}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button asChild variant="ghost" size="sm" className="h-8 text-xs px-3 text-blue-400 hover:text-blue-300">
                            <Link href={`/company/candidates/${candidate.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs px-3 text-muted-foreground hover:text-foreground">
                            Move Stage
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 text-xs px-3 text-rose-400/70 hover:text-rose-400">
                            Reject
                          </Button>
                        </div>
                      </div>

                      {/* Notes preview */}
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
          </TabsContent>

          {/* ── Analytics Tab ─────────────────────────────────────────────── */}
          <TabsContent value="analytics">
            <div className="space-y-5">
              {/* Applications over time */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-5">Applications Over Time</h3>
                <div className="flex items-end gap-2 h-36">
                  {weeklyData.map((d, i) => (
                    <div key={d.week} className="flex-1 flex flex-col items-center gap-2">
                      <div className="flex items-end gap-0.5 h-24 w-full">
                        {/* Applications bar */}
                        <div className="flex-1 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.apps / maxWeeklyApps) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                            title={`${d.apps} applications`}
                          />
                        </div>
                        {/* Interviews bar */}
                        <div className="flex-1 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.interviews / maxWeeklyApps) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                            className="w-full rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400"
                            title={`${d.interviews} interviews`}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center">{d.week}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Applications</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-purple-500" />
                    <span className="text-xs text-muted-foreground">Interviews</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Source breakdown */}
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-5">Source Breakdown</h3>
                  <div className="space-y-3">
                    {sourcesData.map((s) => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">{s.name}</span>
                          <span className="text-sm font-semibold text-foreground">{s.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', s.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage Conversion */}
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-5">Stage Conversion</h3>
                  <div className="space-y-2.5">
                    {funnelData.map((stage, i) => (
                      <div key={stage.stage} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-24 shrink-0">{stage.stage}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stage.pct}%` }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{stage.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Settings Tab ──────────────────────────────────────────────── */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-5">
              {/* Job Status */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Job Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Active Listing</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isJobActive ? 'Job is visible and accepting applications' : 'Job is paused — not visible to candidates'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsJobActive(!isJobActive)}
                    className={cn(
                      'w-12 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                      isJobActive ? 'bg-emerald-500' : 'bg-white/10'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                        isJobActive && 'translate-x-6'
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Expiry date */}
              <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-foreground mb-4">Expiry Date</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {formatDate(job.expiresAt)}
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Date
                  </Button>
                </div>
              </div>

              {/* Notifications */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-semibold text-foreground">Notifications</h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: 'New Application',
                      description: 'Get notified when someone applies',
                      value: notifyNewApp,
                      toggle: () => setNotifyNewApp(!notifyNewApp),
                    },
                    {
                      label: 'High Match Found',
                      description: 'Alert when AI score > 90% candidate applies',
                      value: notifyHighMatch,
                      toggle: () => setNotifyHighMatch(!notifyHighMatch),
                    },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{setting.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
                      </div>
                      <button
                        onClick={setting.toggle}
                        className={cn(
                          'w-10 h-[22px] rounded-full transition-all duration-200 relative flex-shrink-0',
                          setting.value ? 'bg-blue-500' : 'bg-white/10'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
                            setting.value && 'translate-x-[18px]'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="glass-card p-5 border-rose-500/20 bg-rose-500/[0.02]">
                <h3 className="text-base font-semibold text-rose-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Archiving this job will hide it from candidates and remove it from active listings. This cannot be undone.
                </p>
                <Button variant="outline" className="gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
                  <Trash2 className="w-4 h-4" />
                  Archive Job
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
