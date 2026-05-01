'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { jobs as allJobs } from '@/lib/data'
import type { Job } from '@/lib/types'
import { formatSalary, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  Users,
  Calendar,
  Pencil,
  Pause,
  Play,
  Eye,
  Wifi,
  Building2,
  MonitorSmartphone,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  PackageOpen,
} from 'lucide-react'

const PAGE_SIZE = 6

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  closed: 'bg-muted/50 text-muted-foreground border-border',
}

const workModeStyles: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  remote: {
    icon: <Wifi className="w-3 h-3" />,
    label: 'Remote',
    className: 'text-cyan-400',
  },
  hybrid: {
    icon: <MonitorSmartphone className="w-3 h-3" />,
    label: 'Hybrid',
    className: 'text-purple-400',
  },
  onsite: {
    icon: <Building2 className="w-3 h-3" />,
    label: 'Onsite',
    className: 'text-blue-400',
  },
}

const levelLabels: Record<string, string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive',
}

function daysActive(postedAt: string): number {
  const diff = Date.now() - new Date(postedAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [workModeFilter, setWorkModeFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  // Track paused jobs locally
  const [pausedJobs, setPausedJobs] = useState<Set<string>>(new Set())

  const togglePause = (jobId: string) => {
    setPausedJobs((prev) => {
      const next = new Set(prev)
      if (next.has(jobId)) next.delete(jobId)
      else next.add(jobId)
      return next
    })
  }

  const getEffectiveStatus = (job: Job) => {
    if (pausedJobs.has(job.id)) return 'paused'
    return job.status
  }

  const filtered = useMemo(() => {
    return allJobs.filter((job) => {
      const effectiveStatus = pausedJobs.has(job.id) ? 'paused' : job.status
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
      const matchesWorkMode = workModeFilter === 'all' || job.workMode === workModeFilter
      const matchesLevel = levelFilter === 'all' || job.level === levelFilter
      return matchesSearch && matchesStatus && matchesWorkMode && matchesLevel
    })
  }, [search, statusFilter, workModeFilter, levelFilter, pausedJobs])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setWorkModeFilter('all')
    setLevelFilter('all')
    setPage(1)
  }

  const hasFilters = search || statusFilter !== 'all' || workModeFilter !== 'all' || levelFilter !== 'all'

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your open positions</p>
        </div>
        <Button asChild className="btn-primary gap-2 shrink-0">
          <Link href="/company/jobs/new">
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        </Button>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="glass-card p-4 space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, department, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 bg-white/[0.04] border-white/[0.08] h-10"
            />
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-white/[0.04] border-white/[0.08]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Work Mode filter */}
          <Select value={workModeFilter} onValueChange={(v) => { setWorkModeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-white/[0.04] border-white/[0.08]">
              <SelectValue placeholder="Work Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
            </SelectContent>
          </Select>

          {/* Level filter */}
          <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-white/[0.04] border-white/[0.08]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="entry">Entry</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>
              <span className="font-semibold text-foreground">{filtered.length}</span> job{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Jobs List */}
      {paginated.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 flex flex-col items-center gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
            <PackageOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">No jobs found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Try adjusting your filters or post a new job to get started.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear Filters
            </Button>
            <Button asChild size="sm">
              <Link href="/company/jobs/new">
                <Plus className="w-4 h-4 mr-1.5" />
                Post New Job
              </Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3"
        >
          {paginated.map((job, idx) => {
            const effectiveStatus = getEffectiveStatus(job)
            const isPaused = pausedJobs.has(job.id)
            const wm = workModeStyles[job.workMode]
            const active = daysActive(job.postedAt)
            const applicantPct = Math.min((job.applicantCount / 500) * 100, 100)

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="glass-card p-4 hover:border-white/[0.15] transition-all duration-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company + Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center border border-white/10">
                      <img
                        src={job.company.logo}
                        alt={job.company.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">{job.title}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                          {job.department}
                        </Badge>
                        {job.featured && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-amber-500/15 text-amber-400 border-amber-500/20 shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className={cn('flex items-center gap-1 text-xs font-medium', wm.className)}>
                          {wm.icon}
                          {wm.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Layers className="w-3 h-3" />
                          {levelLabels[job.level]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="hidden lg:flex flex-col items-center shrink-0 min-w-[100px]">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">per year</div>
                  </div>

                  {/* Applicants + Progress */}
                  <div className="hidden lg:flex flex-col shrink-0 min-w-[120px] gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {job.applicantCount} applicants
                      </span>
                    </div>
                    <Progress value={applicantPct} className="h-1.5" />
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border capitalize',
                      statusStyles[effectiveStatus]
                    )}>
                      {effectiveStatus}
                    </span>
                  </div>

                  {/* Days active */}
                  <div className="hidden xl:flex flex-col items-center shrink-0 min-w-[64px]">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {active}d ago
                    </div>
                    <div className="text-[10px] text-muted-foreground">posted</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.08]"
                      title="Edit Job"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.08]"
                      title={isPaused ? 'Activate' : 'Pause'}
                      onClick={() => togglePause(job.id)}
                    >
                      {isPaused ? (
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.08]"
                      title="View Applications"
                    >
                      <Link href="/company/pipeline">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2"
        >
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-semibold text-foreground">
              {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-foreground">{filtered.length}</span> results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-3 gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'ghost'}
                  size="icon"
                  className={cn('w-8 h-8 text-xs', p === page && 'bg-primary text-primary-foreground')}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 px-3 gap-1.5"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
