'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs } from '@/lib/api'
import type { Job } from '@/lib/types'
import { formatSalary, timeAgo, cn, companyLogoSrc } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Button } from '@/components/ui/button'
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
  Sparkles,
} from 'lucide-react'
import type { WorkMode, JobType, ExperienceLevel } from '@/lib/types'
import { WORK_MODE_LABELS, JOB_TYPE_LABELS, EXPERIENCE_LABELS } from '@/lib/constants'

// â”€â”€â”€ Match score helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 25)
}

interface MatchInfo {
  score: number
  reason: string
}


// â”€â”€â”€ Filter Pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 shrink-0',
        active
          ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
          : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20 hover:text-tl-text-primary'
      )}
    >
      {children}
    </button>
  )
}

// â”€â”€â”€ Checkbox row (for sidebar) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CheckboxRow({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <span
        onClick={onChange}
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 shrink-0',
          checked
            ? 'bg-tl-gold border-tl-gold'
            : 'bg-tl-bg-elevated border-tl-border-default group-hover:border-tl-gold/40'
        )}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-tl-bg-base" fill="none" viewBox="0 0 10 10">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span
        onClick={onChange}
        className={cn(
          'text-sm transition-colors',
          checked ? 'text-tl-text-primary font-medium' : 'text-tl-text-secondary group-hover:text-tl-text-primary'
        )}
      >
        {label}
      </span>
    </label>
  )
}

// â”€â”€â”€ Toggle Switch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
          checked ? 'bg-tl-teal' : 'bg-tl-bg-elevated'
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
      <span className="text-sm text-tl-text-secondary group-hover:text-tl-text-primary transition-colors">
        <span className="text-tl-text-primary font-medium">{label}</span>
      </span>
    </label>
  )
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type SortBy = 'match' | 'newest' | 'salary'
const ITEMS = 10

// â”€â”€â”€ Job Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function JobCard({ job, saved, onSave, matchReason, matchLoading }: { job: Job & { score: number }; saved: boolean; onSave: () => void; matchReason?: string; matchLoading?: boolean }) {
  const isNew = (Date.now() - new Date(job.postedAt).getTime()) < 1000 * 60 * 60 * 48

  return (
    <div className="tl-card p-4 sm:p-5 hover:border-tl-gold/40 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Left: avatar + featured badge */}
        <div className="relative shrink-0">
          <img src={companyLogoSrc(job.company, job.title)} alt={job.company?.name ?? ''} className="w-14 h-14 rounded-2xl object-cover" />
          {job.featured && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-tl-gold flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-tl-bg-base fill-current" />
            </span>
          )}
        </div>

        {/* Center */}
        <div className="flex-1 min-w-0">
          {/* Row 1: title + NEW badge */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {job.external && job.applyUrl ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-tl-text-primary hover:text-tl-gold transition-colors leading-tight"
              >
                {job.title}
              </a>
            ) : (
              <Link
                href={`/talent/jobs/${job.id}`}
                className="text-lg font-bold text-tl-text-primary hover:text-tl-gold transition-colors leading-tight"
              >
                {job.title}
              </Link>
            )}
            {isNew && (
              <span className="tl-tag-teal text-[10px] font-bold leading-none">
                NEW
              </span>
            )}
            {job.featured && (
              <span className="tl-tag-gold text-[10px] font-semibold">
                Featured
              </span>
            )}
            {job.external && (
              <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-400 inline-flex items-center gap-1">
                External · {job.source ?? 'partner'}
              </span>
            )}
          </div>

          {/* Row 2: company + location + salary */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mb-2 text-sm text-tl-text-secondary">
            <span className="flex items-center gap-1 font-medium">
              {job.company?.name}
              {job.company?.verified && <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal" />}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3 shrink-0" />{job.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-tl-teal font-semibold font-mono">
              <Banknote className="w-3 h-3 shrink-0" />{formatSalary(job.salaryMin, job.salaryMax)}
            </span>
          </div>

          {/* Row 3: badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.workMode === 'remote' ? (
              <span className="tl-tag-teal capitalize">{WORK_MODE_LABELS[job.workMode]}</span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-[10px] text-tl-text-secondary capitalize">
                {WORK_MODE_LABELS[job.workMode]}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-[10px] text-tl-text-secondary">
              {JOB_TYPE_LABELS[job.type]}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-[10px] text-tl-text-secondary">
              {EXPERIENCE_LABELS[job.level]}
            </span>
          </div>

          {/* Row 4: skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="tl-tag-gold text-[10px]">
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-tl-text-secondary self-center">+{job.skills.length - 4} more</span>
            )}
          </div>

          {/* Row 5: meta */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-tl-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Posted {timeAgo(job.postedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {job.applicantCount} applicants
            </span>
          </div>
        </div>

        {/* Right: match ring + actions */}
        <div className="shrink-0 flex flex-col items-center gap-2 max-w-[140px]">
          <div className="relative">
            <MatchRing score={job.score} size={72} />
            {matchLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-5 h-5 rounded-full border-2 border-tl-gold/30 border-t-tl-gold animate-spin" />
              </span>
            )}
          </div>
          <span className="text-xs text-center font-mono text-tl-gold font-semibold">{job.score}%</span>
          {matchReason && (
            <p
              title={matchReason}
              className="text-[10px] text-tl-text-secondary leading-snug text-center line-clamp-3"
            >
              {matchReason}
            </p>
          )}
          {job.external && job.applyUrl ? (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold h-12 text-xs p-4 inline-flex items-center justify-center gap-1.5"
            >
              Apply <span aria-hidden>↗</span>
            </a>
          ) : (
            <Link href={`/talent/jobs/${job.id}`}>
              <button className="btn-gold h-12 text-xs p-4">Apply</button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 text-tl-text-secondary hover:text-tl-gold', saved && 'text-tl-gold')}
            onClick={e => { e.stopPropagation(); onSave() }}
          >
            <Bookmark className={cn('w-3.5 h-3.5', saved && 'fill-current')} />
          </Button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Filter sidebar content (shared between desktop sidebar + mobile drawer) â”€â”€
function FilterSidebarContent({
  search,
  setSearch,
  workModes,
  setWorkModes,
  jobTypes,
  setJobTypes,
  experienceLevels,
  setExperienceLevels,
  salaryMin,
  setSalaryMin,
  salaryMax,
  setSalaryMax,
  minMatch,
  setMinMatch,
  setPage,
  clearAll,
  activeFilterCount,
}: {
  search: string
  setSearch: (v: string) => void
  workModes: string[]
  setWorkModes: (v: string[]) => void
  jobTypes: string[]
  setJobTypes: (v: string[]) => void
  experienceLevels: string[]
  setExperienceLevels: (v: string[]) => void
  salaryMin: string
  setSalaryMin: (v: string) => void
  salaryMax: string
  setSalaryMax: (v: string) => void
  minMatch: boolean
  setMinMatch: (v: boolean) => void
  setPage: (v: number) => void
  clearAll: () => void
  activeFilterCount: number
}) {
  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setPage(1)
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-display font-semibold text-tl-text-primary">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-tl-text-secondary hover:text-tl-rose transition-colors"
          >
            <X className="w-3 h-3" /> Reset all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative bg-tl-bg-surface border border-tl-border-default focus-within:border-tl-gold rounded-xl transition-colors">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
        <input
          placeholder="Job title or company"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-transparent pl-9 pr-4 py-2.5 text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none rounded-xl"
        />
        {search && (
          <button
            onClick={() => { setSearch(''); setPage(1) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tl-text-secondary hover:text-tl-text-primary"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-tl-border-subtle" />

      {/* Work Mode */}
      <div>
        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-2.5">Work Mode</p>
        <div className="space-y-1.5">
          {(['remote', 'hybrid', 'onsite'] as WorkMode[]).map(m => (
            <CheckboxRow
              key={m}
              checked={workModes.includes(m)}
              onChange={() => toggleFilter(workModes, setWorkModes, m)}
              label={WORK_MODE_LABELS[m]}
            />
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-2.5">Job Type</p>
        <div className="space-y-1.5">
          {(['full-time', 'part-time', 'contract', 'internship', 'freelance'] as JobType[]).map(t => (
            <CheckboxRow
              key={t}
              checked={jobTypes.includes(t)}
              onChange={() => toggleFilter(jobTypes, setJobTypes, t)}
              label={JOB_TYPE_LABELS[t]}
            />
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-2.5">Experience Level</p>
        <div className="space-y-1.5">
          {(['entry', 'mid', 'senior', 'lead', 'executive'] as ExperienceLevel[]).map(l => (
            <CheckboxRow
              key={l}
              checked={experienceLevels.includes(l)}
              onChange={() => toggleFilter(experienceLevels, setExperienceLevels, l)}
              label={EXPERIENCE_LABELS[l]}
            />
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-2.5">Salary Range (USD)</p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={salaryMin}
              onChange={e => { setSalaryMin(e.target.value); setPage(1) }}
              className="w-full bg-tl-bg-surface border border-tl-border-default focus:border-tl-gold rounded-lg px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none transition-colors"
            />
          </div>
          <span className="text-tl-text-secondary text-xs shrink-0">to</span>
          <div className="flex-1">
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={salaryMax}
              onChange={e => { setSalaryMax(e.target.value); setPage(1) }}
              className="w-full bg-tl-bg-surface border border-tl-border-default focus:border-tl-gold rounded-lg px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-tl-border-subtle" />

      {/* 80%+ Match toggle */}
      <ToggleSwitch
        checked={minMatch}
        onChange={v => { setMinMatch(v); setPage(1) }}
        label="80%+ Match only"
      />
    </div>
  )
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function JobsPage() {
  const [search, setSearch]                   = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [workModes, setWorkModes]             = useState<string[]>([])
  const [jobTypes, setJobTypes]               = useState<string[]>([])
  const [experienceLevels, setExperienceLevels] = useState<string[]>([])
  const [salaryMin, setSalaryMin]             = useState('')
  const [salaryMax, setSalaryMax]             = useState('')
  const [minMatch, setMinMatch]               = useState(false)
  const [sortBy, setSortBy]                   = useState<SortBy>('match')
  const [page, setPage]                       = useState(1)
  const [savedIds, setSavedIds]               = useState<Set<string>>(new Set())
  const [allJobs, setAllJobs]                 = useState<Job[]>([])
  const [loading, setLoading]                 = useState(true)
  const [matchMap, setMatchMap]               = useState<Map<string, MatchInfo>>(new Map())
  const [matchLoading, setMatchLoading]       = useState(false)
  const [aiCurated, setAiCurated]             = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getJobs()
      if (res.data) setAllJobs(res.data)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (allJobs.length === 0) return
    let cancelled = false
    setMatchLoading(true)

    const ids = allJobs.slice(0, 30).map(j => j.id)
    fetch('/api/talent/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds: ids }),
    })
      .then(async r => (r.ok ? r.json() as Promise<{ results: Array<{ jobId: string; score: number; reason: string }> }> : null))
      .then(data => {
        if (cancelled || !data?.results) return
        const next = new Map<string, MatchInfo>()
        for (const r of data.results) {
          next.set(r.jobId, { score: r.score, reason: r.reason })
        }
        setMatchMap(next)
      })
      .catch(() => { /* fall back to deterministic */ })
      .finally(() => { if (!cancelled) setMatchLoading(false) })

    return () => { cancelled = true }
  }, [allJobs])

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setShowMobileFilters(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const jobsWithScore = useMemo(
    () => allJobs.map(j => ({
      ...j,
      score: matchMap.get(j.id)?.score ?? getMatchScore(j.id),
    })),
    [allJobs, matchMap]
  )

  const salaryMinNum = salaryMin ? parseInt(salaryMin, 10) : undefined
  const salaryMaxNum = salaryMax ? parseInt(salaryMax, 10) : undefined

  const filtered = useMemo(() => {
    let result = jobsWithScore
    if (aiCurated) result = result.filter(j => matchMap.has(j.id) && j.score >= 70)
    if (search) result = result.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.name.toLowerCase().includes(search.toLowerCase())
    )
    if (workModes.length) result = result.filter(j => workModes.includes(j.workMode))
    if (jobTypes.length)  result = result.filter(j => jobTypes.includes(j.type))
    if (experienceLevels.length) result = result.filter(j => experienceLevels.includes(j.level))
    if (salaryMinNum !== undefined) result = result.filter(j => j.salaryMax >= salaryMinNum)
    if (salaryMaxNum !== undefined) result = result.filter(j => j.salaryMin <= salaryMaxNum)
    if (minMatch) result = result.filter(j => j.score >= 80)
    if (sortBy === 'match')  result = [...result].sort((a, b) => b.score - a.score)
    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    if (sortBy === 'salary') result = [...result].sort((a, b) => b.salaryMax - a.salaryMax)
    return result
  }, [jobsWithScore, search, workModes, jobTypes, experienceLevels, salaryMinNum, salaryMaxNum, minMatch, sortBy, aiCurated, matchMap])

  const paginated      = filtered.slice((page - 1) * ITEMS, page * ITEMS)
  const totalPages     = Math.ceil(filtered.length / ITEMS)
  const highMatchCount = jobsWithScore.filter(j => j.score >= 80).length

  const activeFilterCount = [
    workModes.length > 0,
    jobTypes.length > 0,
    experienceLevels.length > 0,
    !!salaryMin,
    !!salaryMax,
    minMatch,
  ].filter(Boolean).length

  const clearAll = () => {
    setSearch(''); setWorkModes([]); setJobTypes([])
    setExperienceLevels([]); setSalaryMin(''); setSalaryMax('')
    setMinMatch(false); setPage(1)
  }

  const sharedFilterProps = {
    search, setSearch,
    workModes, setWorkModes,
    jobTypes, setJobTypes,
    experienceLevels, setExperienceLevels,
    salaryMin, setSalaryMin,
    salaryMax, setSalaryMax,
    minMatch, setMinMatch,
    setPage,
    clearAll,
    activeFilterCount,
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  }

  return (
    <div className="h-full flex overflow-hidden">

      {/* â”€â”€ DESKTOP FILTER SIDEBAR â€” fixed beside main sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-tl-border-subtle overflow-y-auto bg-tl-bg-surface/60"
      >
        <div className="p-4 flex-1">
          <FilterSidebarContent {...sharedFilterProps} />
        </div>
      </motion.aside>

      {/* â”€â”€ RIGHT: scrollable jobs column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-3xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-4"
          >
            <h1 className="text-xl font-display font-bold text-tl-text-primary">Find Your Next Role</h1>
            <p className="text-tl-text-secondary mt-0.5 text-sm">
              {allJobs.length} jobs available &middot;{' '}
              <span className="text-tl-teal font-semibold font-mono">{highMatchCount} match 80%+</span>
            </p>
          </motion.div>

          {/* AI curation toggle */}
          <motion.button
            type="button"
            onClick={() => { setAiCurated(v => !v); setPage(1) }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 }}
            className={cn(
              'w-full mb-4 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
              aiCurated
                ? 'border-tl-gold/40 bg-gradient-to-r from-tl-gold/12 via-tl-gold/8 to-transparent shadow-[0_0_0_1px_rgba(201,168,76,0.15)]'
                : 'border-tl-border-default bg-tl-bg-surface hover:border-tl-gold/30',
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <span className={cn(
                'mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-xl border shrink-0',
                aiCurated
                  ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
                  : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary',
              )}>
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-tl-text-primary">AI-recommended jobs</span>
                  {aiCurated && matchLoading && (
                    <span className="text-[10px] uppercase tracking-wider text-tl-text-secondary inline-flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-tl-gold/30 border-t-tl-gold animate-spin" />
                      Scoring
                    </span>
                  )}
                </div>
                <p className="text-xs text-tl-text-secondary mt-0.5 line-clamp-2">
                  {aiCurated
                    ? 'Showing only roles matched to your profile and GitHub. Toggle off to browse every job.'
                    : 'Showing every available job. Toggle on for AI-curated picks based on your skills and experience.'}
                </p>
              </div>
            </div>
            <span
              role="switch"
              aria-checked={aiCurated}
              className={cn(
                'relative w-11 h-6 rounded-full shrink-0 transition-colors',
                aiCurated ? 'bg-tl-gold' : 'bg-tl-bg-elevated border border-tl-border-default',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  aiCurated && 'translate-x-5',
                )}
              />
            </span>
          </motion.button>

          {/* Mobile filter + sort bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:hidden flex items-center gap-2 mb-4"
          >
            <button
              onClick={() => setShowMobileFilters(true)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200',
                activeFilterCount > 0
                  ? 'bg-tl-gold/10 border-tl-gold/40 text-tl-gold'
                  : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20 hover:text-tl-text-primary'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-tl-gold text-tl-bg-base text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="flex-1">
              <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
                <SelectTrigger className="h-10 w-full text-sm bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Best Match</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="salary">Salary: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Desktop: result count + sort row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="hidden lg:flex items-center justify-between gap-3 mb-4"
          >
            <p className="text-sm text-tl-text-secondary">
              <span className="text-tl-text-primary font-semibold font-mono">{filtered.length}</span> jobs found
              {search && <span className="ml-1">for &ldquo;{search}&rdquo;</span>}
            </p>
            <Select value={sortBy} onValueChange={v => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-9 w-44 text-sm bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="salary">Salary: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Mobile result count */}
          <p className="lg:hidden text-sm text-tl-text-secondary mb-3">
            <span className="text-tl-text-primary font-semibold font-mono">{filtered.length}</span> jobs found
            {search && <span className="ml-1">for &ldquo;{search}&rdquo;</span>}
          </p>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {workModes.map(m => (
                <span key={m} className="inline-flex items-center gap-1 tl-tag-gold">
                  {WORK_MODE_LABELS[m as WorkMode]}
                  <button onClick={() => { setWorkModes(workModes.filter(x => x !== m)); setPage(1) }} className="hover:text-tl-rose ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {jobTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1 tl-tag-gold">
                  {JOB_TYPE_LABELS[t as JobType]}
                  <button onClick={() => { setJobTypes(jobTypes.filter(x => x !== t)); setPage(1) }} className="hover:text-tl-rose ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {experienceLevels.map(l => (
                <span key={l} className="inline-flex items-center gap-1 tl-tag-gold">
                  {EXPERIENCE_LABELS[l as ExperienceLevel]}
                  <button onClick={() => { setExperienceLevels(experienceLevels.filter(x => x !== l)); setPage(1) }} className="hover:text-tl-rose ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {(salaryMin || salaryMax) && (
                <span className="inline-flex items-center gap-1 tl-tag-gold">
                  {salaryMin && salaryMax ? `$${salaryMin}â€“$${salaryMax}` : salaryMin ? `Min $${salaryMin}` : `Max $${salaryMax}`}
                  <button onClick={() => { setSalaryMin(''); setSalaryMax(''); setPage(1) }} className="hover:text-tl-rose ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {minMatch && (
                <span className="inline-flex items-center gap-1 tl-tag-gold">
                  80%+ Match
                  <button onClick={() => { setMinMatch(false); setPage(1) }} className="hover:text-tl-rose ml-0.5">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Job list */}
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="tl-card p-12 flex flex-col items-center text-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-tl-bg-elevated flex items-center justify-center">
                  {aiCurated
                    ? <Sparkles className="w-7 h-7 text-tl-gold/50" />
                    : <Search className="w-7 h-7 text-tl-text-secondary/40" />}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-tl-text-primary mb-1">
                    {aiCurated ? 'No AI-recommended matches yet' : 'No jobs found'}
                  </h3>
                  <p className="text-sm text-tl-text-secondary max-w-xs">
                    {aiCurated
                      ? matchLoading
                        ? 'Scoring jobs against your profile…'
                        : 'Either your profile needs more skills/experience, or the available roles aren\'t a strong fit. Toggle AI off to browse all jobs.'
                      : 'Try adjusting your filters or search terms.'}
                  </p>
                </div>
                {aiCurated ? (
                  <button
                    className="btn-ghost"
                    onClick={() => { setAiCurated(false); setPage(1) }}
                  >
                    Show all jobs
                  </button>
                ) : (
                  <button className="btn-ghost" onClick={clearAll}>
                    <X className="w-4 h-4 mr-2" /> Clear Filters
                  </button>
                )}
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
                      matchReason={matchMap.get(job.id)?.reason}
                      matchLoading={matchLoading && !matchMap.has(job.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="btn-ghost h-9 w-9 p-0 flex items-center justify-center disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-9 w-9 rounded-xl text-sm font-mono font-semibold border transition-all duration-200',
                    page === p
                      ? 'bg-tl-gold text-tl-bg-base border-tl-gold'
                      : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-gold/40 hover:text-tl-text-primary'
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn-ghost h-9 w-9 p-0 flex items-center justify-center disabled:opacity-40"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-xs text-tl-text-secondary mt-3 font-mono">
              Showing {(page - 1) * ITEMS + 1}â€“{Math.min(page * ITEMS, filtered.length)} of {filtered.length} jobs
            </p>
          )}
        </div>
      </div>

      {/* â”€â”€ MOBILE FILTER DRAWER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Slide-up drawer */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-tl-bg-base rounded-t-2xl border-t border-tl-border-default lg:hidden max-h-[85dvh] flex flex-col"
            >
              {/* Drawer handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-tl-border-default" />
              </div>

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-tl-border-subtle shrink-0">
                <span className="font-display font-semibold text-tl-text-primary">Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-8 h-8 rounded-full bg-tl-bg-elevated flex items-center justify-center text-tl-text-secondary hover:text-tl-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable filter content */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <FilterSidebarContent {...sharedFilterProps} />
              </div>

              {/* Done button */}
              <div className="px-5 py-4 border-t border-tl-border-subtle shrink-0">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="btn-gold w-full h-11 text-sm font-semibold"
                >
                  Show {filtered.length} jobs
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
