'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { jobs } from '@/lib/data'
import { formatSalary, timeAgo, cn } from '@/lib/utils'
import { MatchScore, MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Globe,
  MapPin,
  CheckCircle2,
  Bookmark,
  Star,
  LayoutGrid,
  List,
  Wifi,
  Building2,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import type { Job, WorkMode, JobType } from '@/lib/types'

// ─── Simulated match scores per job id ───────────────────────────────────────
const jobScores: Record<string, number> = {
  j1: 96,
  j2: 84,
  j3: 78,
  j4: 72,
  j5: 88,
  j6: 65,
}

// ─── Simulated perks per job ──────────────────────────────────────────────────
const jobPerks: Record<string, string[]> = {
  j1: ['Equity', 'Health', 'Remote Options', '$1K Equipment'],
  j2: ['Remote', 'Equity', 'Unlimited PTO', 'Wellness'],
  j3: ['Fully Remote', 'Equity', 'Conference Budget'],
  j4: ['Equity', 'High Autonomy', 'Top Salary'],
  j5: ['Equity', 'Remote Options', '401K'],
  j6: ['Hybrid', 'Health', '401K Match'],
}

const workModeIcon: Record<string, React.ReactNode> = {
  remote: <Wifi className="w-3 h-3" />,
  hybrid: <Building2 className="w-3 h-3" />,
  onsite: <Globe className="w-3 h-3" />,
}

const typeBadgeVariant: Record<string, 'default' | 'purple' | 'cyan' | 'ghost'> = {
  'full-time': 'default',
  'contract': 'purple',
  'part-time': 'cyan',
  'internship': 'ghost',
  'freelance': 'ghost',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Pill filter button ───────────────────────────────────────────────────────
function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
        active
          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
          : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

// ─── List View Job Card ───────────────────────────────────────────────────────
function JobListCard({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  const score = jobScores[job.id] ?? 70
  const perks = jobPerks[job.id] ?? []

  return (
    <motion.div
      variants={cardItem}
      className="glass-card p-4 hover:border-white/[0.2] hover:shadow-[0_0_30px_rgba(59,130,246,0.06)] transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Company Avatar */}
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
          <AvatarImage src={job.company.logo} />
          <AvatarFallback className="text-sm font-bold">
            {job.company.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Center content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              {/* Company */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs text-muted-foreground font-medium">{job.company.name}</span>
                {job.company.verified && (
                  <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                )}
                {job.featured && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-semibold">
                    <Star className="w-2 h-2 fill-current" />
                    Featured
                  </span>
                )}
              </div>
              {/* Title */}
              <h3 className="text-sm font-semibold text-foreground leading-snug">{job.title}</h3>
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {workModeIcon[job.workMode]}
                  <span className="capitalize">{job.workMode}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <Badge variant={typeBadgeVariant[job.type] ?? 'ghost'} className="text-[10px]">
                  {job.type}
                </Badge>
                <span className="text-xs font-semibold text-emerald-400">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
              {/* Skills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {job.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="tag text-[10px] bg-white/[0.04] border-white/[0.08] text-muted-foreground">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{job.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Right: Match + Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <MatchRing score={score} size={56} strokeWidth={4} />
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(job.postedAt)}
              </span>
              <div className="flex items-center gap-1.5">
                <Button size="sm" className="h-8 text-xs px-3">
                  Apply
                  <ArrowRight className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-8 w-8',
                    saved && 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  )}
                  onClick={(e) => { e.stopPropagation(); onSave() }}
                >
                  <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
                </Button>
              </div>
            </div>
          </div>

          {/* Perks row */}
          {perks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
              {perks.map((perk) => (
                <span
                  key={perk}
                  className="tag text-[10px] bg-purple-500/[0.06] border-purple-500/20 text-purple-400"
                >
                  {perk}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Grid View Job Card ───────────────────────────────────────────────────────
function JobGridCard({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) {
  const score = jobScores[job.id] ?? 70

  return (
    <motion.div
      variants={cardItem}
      className="glass-card p-4 hover:border-white/[0.2] hover:shadow-[0_0_30px_rgba(59,130,246,0.06)] transition-all duration-300 group cursor-pointer flex flex-col"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white/10">
            <AvatarImage src={job.company.logo} />
            <AvatarFallback className="text-xs font-bold">
              {job.company.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground truncate">{job.company.name}</span>
              {job.company.verified && <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />}
            </div>
            {job.featured && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-semibold">
                <Star className="w-2 h-2 fill-current" />
                Featured
              </span>
            )}
          </div>
        </div>
        <MatchRing score={score} size={48} strokeWidth={4} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug">{job.title}</h3>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          {workModeIcon[job.workMode]}
          <span className="capitalize">{job.workMode}</span>
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {job.location}
        </span>
      </div>

      <p className="text-xs font-semibold text-emerald-400 mb-3">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-3 flex-1">
        {job.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="tag text-[10px] bg-white/[0.04] border-white/[0.08] text-muted-foreground">
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="text-[10px] text-muted-foreground self-center">
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(job.postedAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-xs px-3">Apply</Button>
          <Button
            variant="outline"
            size="icon"
            className={cn('h-7 w-7', saved && 'bg-blue-500/10 border-blue-500/30 text-blue-400')}
            onClick={(e) => { e.stopPropagation(); onSave() }}
          >
            <Bookmark className={cn('w-3 h-3', saved && 'fill-current')} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'grid'
type SortKey = 'match' | 'recent' | 'salary-high' | 'salary-low'

const WORK_MODES: Array<WorkMode | 'all'> = ['all', 'remote', 'hybrid', 'onsite']
const JOB_TYPES: Array<JobType | 'all'> = ['all', 'full-time', 'contract', 'part-time']
const EXP_LEVELS = ['all', 'entry', 'mid', 'senior', 'lead', 'executive'] as const

const PAGE_SIZE = 4

export default function JobDiscoveryPage() {
  const [search, setSearch] = useState('')
  const [locationQ, setLocationQ] = useState('')
  const [workMode, setWorkMode] = useState<WorkMode | 'all'>('all')
  const [jobType, setJobType] = useState<JobType | 'all'>('all')
  const [expLevel, setExpLevel] = useState<string>('all')
  const [minScore, setMinScore] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('match')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = jobs.filter((job) => {
      if (
        search &&
        !job.title.toLowerCase().includes(search.toLowerCase()) &&
        !job.company.name.toLowerCase().includes(search.toLowerCase()) &&
        !job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
        return false

      if (
        locationQ &&
        !job.location.toLowerCase().includes(locationQ.toLowerCase())
      )
        return false

      if (workMode !== 'all' && job.workMode !== workMode) return false
      if (jobType !== 'all' && job.type !== jobType) return false
      if (expLevel !== 'all' && job.level !== expLevel) return false

      if (minScore && (jobScores[job.id] ?? 0) < 80) return false

      return true
    })

    // ── Sorting ──────────────────────────────────────────────────────────────
    result = [...result].sort((a, b) => {
      if (sortKey === 'match') return (jobScores[b.id] ?? 0) - (jobScores[a.id] ?? 0)
      if (sortKey === 'recent')
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      if (sortKey === 'salary-high') return b.salaryMax - a.salaryMax
      if (sortKey === 'salary-low') return a.salaryMin - b.salaryMin
      return 0
    })

    return result
  }, [search, locationQ, workMode, jobType, expLevel, minScore, sortKey])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

  const highMatchCount = jobs.filter((j) => (jobScores[j.id] ?? 0) >= 90).length

  const clearFilters = () => {
    setSearch('')
    setLocationQ('')
    setWorkMode('all')
    setJobType('all')
    setExpLevel('all')
    setMinScore(false)
    setPage(1)
  }

  const hasActiveFilters =
    search || locationQ || workMode !== 'all' || jobType !== 'all' || expLevel !== 'all' || minScore

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Discovery</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              AI-matched opportunities based on your profile
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                {jobs.length} jobs match your profile
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Star className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                {highMatchCount} are 90%+ matches
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search & Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-card p-5 space-y-4"
      >
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search job title, company, or skill..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <div className="relative sm:w-52">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Location..."
              value={locationQ}
              onChange={(e) => { setLocationQ(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {/* Work Mode */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              Work Mode
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WORK_MODES.map((mode) => (
                <PillButton
                  key={mode}
                  active={workMode === mode}
                  onClick={() => { setWorkMode(mode); setPage(1) }}
                >
                  {mode === 'all' ? 'All' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              Job Type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {JOB_TYPES.map((type) => (
                <PillButton
                  key={type}
                  active={jobType === type}
                  onClick={() => { setJobType(type); setPage(1) }}
                >
                  {type === 'all'
                    ? 'All'
                    : type === 'full-time'
                    ? 'Full-time'
                    : type === 'part-time'
                    ? 'Part-time'
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
              Experience Level
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXP_LEVELS.map((lvl) => (
                <PillButton
                  key={lvl}
                  active={expLevel === lvl}
                  onClick={() => { setExpLevel(lvl); setPage(1) }}
                >
                  {lvl === 'all' ? 'All' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </PillButton>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle + Clear */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-border">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <Switch
              checked={minScore}
              onCheckedChange={(v) => { setMinScore(v); setPage(1) }}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Show only{' '}
              <span className="text-foreground font-medium">80%+ matches</span>
            </span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Sort bar ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="w-4 h-4" />
          <span>
            Showing{' '}
            <span className="text-foreground font-semibold">{filtered.length}</span> matches
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match Score</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="salary-high">Salary: High → Low</SelectItem>
                <SelectItem value="salary-low">Salary: Low → High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'h-8 w-8 flex items-center justify-center transition-colors',
                viewMode === 'list' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-8 w-8 flex items-center justify-center transition-colors border-l border-border',
                viewMode === 'grid' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Job Listings ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="glass-card p-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Try adjusting your filters or search terms to find more opportunities.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4" />
              Clear all filters
            </Button>
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            key="list"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {paginated.map((job) => (
              <JobListCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onSave={() => toggleSave(job.id)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {paginated.map((job) => (
              <JobGridCard
                key={job.id}
                job={job}
                saved={savedIds.has(job.id)}
                onSave={() => toggleSave(job.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {hasMore && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-2"
        >
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            className="px-8"
          >
            Load {Math.min(PAGE_SIZE, filtered.length - paginated.length)} more jobs
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* All loaded message */}
      {!hasMore && filtered.length > 0 && filtered.length > PAGE_SIZE && (
        <p className="text-center text-xs text-muted-foreground pt-2">
          All {filtered.length} results loaded
        </p>
      )}
    </div>
  )
}
