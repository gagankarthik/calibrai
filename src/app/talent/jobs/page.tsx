'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { jobs } from '@/lib/data'
import { formatSalary, timeAgo, cn } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MapPin,
  CheckCircle2,
  Bookmark,
  Star,
  Clock,
  Users,
  SlidersHorizontal,
  X,
  Banknote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { WorkMode, JobType, ExperienceLevel } from '@/lib/types'
import { WORK_MODE_LABELS, JOB_TYPE_LABELS, EXPERIENCE_LABELS } from '@/lib/constants'

// ─── Deterministic match score ────────────────────────────────────────────────
function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

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

// ─── Filter Pill ──────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shrink-0',
        active
          ? 'bg-primary/15 border-primary/40 text-primary'
          : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
          checked ? 'bg-primary' : 'bg-muted'
        )}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
            checked && 'translate-x-[18px]'
          )}
        />
      </button>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        <span className="text-foreground font-medium">{label}</span>
      </span>
    </label>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SortBy = 'match' | 'newest' | 'salary'
const ITEMS = 10

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, saved, onSave }: { job: typeof jobs[0] & { score: number }; saved: boolean; onSave: () => void }) {
  const isNew = (Date.now() - new Date(job.postedAt).getTime()) < 1000 * 60 * 60 * 48

  return (
    <div className="glass-card p-5 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start gap-4">
        {/* Left: avatar + featured badge */}
        <div className="relative shrink-0">
          <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl', avatarColor(job.company.name))}>
            {job.company.name[0]}
          </div>
          {job.featured && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white fill-current" />
            </span>
          )}
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0">
          {/* Row 1: title + NEW badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              href={`/talent/jobs/${job.id}`}
              className="text-lg font-bold text-foreground hover:text-primary transition-colors leading-tight"
            >
              {job.title}
            </Link>
            {isNew && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                NEW
              </span>
            )}
            {job.featured && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                Featured
              </span>
            )}
          </div>

          {/* Row 2: company + location + salary */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mb-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              {job.company.name}
              {job.company.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3 shrink-0" />{job.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              <Banknote className="w-3 h-3 shrink-0" />{formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          {/* Row 3: badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-muted/50 border border-border text-[10px] text-muted-foreground capitalize">
              {WORK_MODE_LABELS[job.workMode]}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-muted/50 border border-border text-[10px] text-muted-foreground">
              {JOB_TYPE_LABELS[job.type]}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-muted/50 border border-border text-[10px] text-muted-foreground">
              {EXPERIENCE_LABELS[job.level]}
            </span>
          </div>

          {/* Row 4: skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15 text-[10px] text-primary font-medium">
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-muted-foreground self-center">+{job.skills.length - 4} more</span>
            )}
          </div>

          {/* Row 5: meta */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Posted {timeAgo(job.postedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {job.applicantCount} applicants
            </span>
          </div>
        </div>

        {/* Right: match ring + actions */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <MatchRing score={job.score} size={72} />
          <span className="text-xs text-center text-muted-foreground">{job.score}% match</span>
          <Link href={`/talent/jobs/${job.id}`}>
            <Button size="sm" className="h-8 text-xs px-4">Apply</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', saved && 'text-primary')}
            onClick={e => { e.stopPropagation(); onSave() }}
          >
            <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const [search, setSearch]         = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [workModes, setWorkModes]   = useState<string[]>([])
  const [jobTypes, setJobTypes]     = useState<string[]>([])
  const [experienceLevels, setExperienceLevels] = useState<string[]>([])
  const [minMatch, setMinMatch]     = useState(false)
  const [sortBy, setSortBy]         = useState<SortBy>('match')
  const [page, setPage]             = useState(1)
  const [savedIds, setSavedIds]     = useState<Set<string>>(new Set())

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const jobsWithScore = useMemo(
    () => jobs.map(j => ({ ...j, score: getMatchScore(j.id) })),
    []
  )

  const filtered = useMemo(() => {
    let result = jobsWithScore
    if (search) result = result.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.name.toLowerCase().includes(search.toLowerCase())
    )
    if (workModes.length) result = result.filter(j => workModes.includes(j.workMode))
    if (jobTypes.length)  result = result.filter(j => jobTypes.includes(j.type))
    if (experienceLevels.length) result = result.filter(j => experienceLevels.includes(j.level))
    if (minMatch) result = result.filter(j => j.score >= 80)
    if (sortBy === 'match')  result = [...result].sort((a, b) => b.score - a.score)
    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    if (sortBy === 'salary') result = [...result].sort((a, b) => b.salaryMax - a.salaryMax)
    return result
  }, [jobsWithScore, search, workModes, jobTypes, experienceLevels, minMatch, sortBy])

  const paginated       = filtered.slice((page - 1) * ITEMS, page * ITEMS)
  const totalPages      = Math.ceil(filtered.length / ITEMS)
  const highMatchCount  = jobsWithScore.filter(j => j.score >= 80).length

  const activeFilterCount = [
    workModes.length > 0,
    jobTypes.length > 0,
    experienceLevels.length > 0,
    minMatch,
  ].filter(Boolean).length

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setPage(1)
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const clearAll = () => {
    setSearch(''); setWorkModes([]); setJobTypes([])
    setExperienceLevels([]); setMinMatch(false); setPage(1)
  }

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Find Your Next Role</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {jobs.length} jobs available &middot;{' '}
          <span className="text-emerald-400 font-semibold">{highMatchCount} match 80%+</span>
        </p>
      </motion.div>

      {/* ── SEARCH + FILTER BAR ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.07 }}
        className="glass-card p-4 mb-4"
      >
        {/* Row 1 */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Job title, company, or keyword"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(p => !p)}
            className={cn('gap-2 shrink-0', showFilters && 'border-primary/40 bg-primary/10 text-primary')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
            <SelectTrigger className="h-10 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="salary">Salary: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Collapsible filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border pt-4 mt-4 space-y-4">
                {/* Work Mode */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Work Mode</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map(m => (
                      <FilterPill
                        key={m}
                        active={workModes.includes(m)}
                        onClick={() => toggleFilter(workModes, setWorkModes, m)}
                      >
                        {WORK_MODE_LABELS[m]}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Job Type</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['full-time', 'part-time', 'contract', 'internship', 'freelance'] as JobType[]).map(t => (
                      <FilterPill
                        key={t}
                        active={jobTypes.includes(t)}
                        onClick={() => toggleFilter(jobTypes, setJobTypes, t)}
                      >
                        {JOB_TYPE_LABELS[t]}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Experience Level</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['entry', 'mid', 'senior', 'lead', 'executive'] as ExperienceLevel[]).map(l => (
                      <FilterPill
                        key={l}
                        active={experienceLevels.includes(l)}
                        onClick={() => toggleFilter(experienceLevels, setExperienceLevels, l)}
                      >
                        {EXPERIENCE_LABELS[l]}
                      </FilterPill>
                    ))}
                  </div>
                </div>

                {/* 80%+ match toggle + clear */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-border">
                  <ToggleSwitch
                    checked={minMatch}
                    onChange={v => { setMinMatch(v); setPage(1) }}
                    label="80%+ Match only"
                  />
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Clear All
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── RESULTS COUNT + ACTIVE FILTERS ──────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{filtered.length}</span> jobs found
          {search && <span className="ml-1">for &ldquo;{search}&rdquo;</span>}
        </p>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {workModes.map(m => (
              <span key={m} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                {WORK_MODE_LABELS[m as WorkMode]}
                <button onClick={() => toggleFilter(workModes, setWorkModes, m)} className="hover:text-rose-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {jobTypes.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                {JOB_TYPE_LABELS[t as JobType]}
                <button onClick={() => toggleFilter(jobTypes, setJobTypes, t)} className="hover:text-rose-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {experienceLevels.map(l => (
              <span key={l} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                {EXPERIENCE_LABELS[l as ExperienceLevel]}
                <button onClick={() => toggleFilter(experienceLevels, setExperienceLevels, l)} className="hover:text-rose-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {minMatch && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                80%+ Match
                <button onClick={() => { setMinMatch(false); setPage(1) }} className="hover:text-rose-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── JOB LIST ────────────────────────────────────────────────────────── */}
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
              <Search className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No jobs found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Try adjusting your filters or search to find more opportunities.
              </p>
            </div>
            <Button variant="outline" onClick={clearAll}>
              <X className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={`list-${page}-${sortBy}`}
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {paginated.map(job => (
              <motion.div key={job.id} variants={cardVariants}>
                <JobCard
                  job={job}
                  saved={savedIds.has(job.id)}
                  onSave={() => toggleSave(job.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGINATION ──────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button
              key={p}
              variant={page === p ? 'default' : 'outline'}
              size="icon"
              className="h-9 w-9"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Showing {(page - 1) * ITEMS + 1}–{Math.min(page * ITEMS, filtered.length)} of {filtered.length} jobs
        </p>
      )}
    </div>
  )
}
