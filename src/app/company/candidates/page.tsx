'use client'

import { useState, useMemo, useEffect, KeyboardEvent } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getCandidates, getCompanyJobs } from '@/lib/api'
import { EXPERIENCE_LABELS, WORK_MODE_LABELS } from '@/lib/constants'
import type { Candidate, ExperienceLevel, WorkMode, Job } from '@/lib/types'
import { cn, formatSalary } from '@/lib/utils'
import {
  Search,
  Grid3x3,
  List,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Zap,
  Star,
  Sparkles,
  Loader2,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['entry', 'mid', 'senior', 'lead', 'executive']
const WORK_MODES: WorkMode[] = ['remote', 'hybrid', 'onsite']
const AVAILABILITY_OPTIONS = ['Available immediately', '2 weeks notice', '1 month notice', 'Actively looking']
const ITEMS_PER_PAGE = 9

// ─── Match score ring (SVG) ───────────────────────────────────────────────────

function MatchRingSvg({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-tl-bg-elevated" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#C9A84C"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-xs font-bold text-tl-gold">{score}%</span>
      </div>
    </div>
  )
}

// ─── Avatar color ─────────────────────────────────────────────────────────────

function avatarColor(name: string) {
  const palette = [
    'bg-tl-blue/20 text-tl-blue',
    'bg-tl-gold/20 text-tl-gold',
    'bg-tl-teal/20 text-tl-teal',
    'bg-tl-rose/20 text-tl-rose',
    'bg-tl-teal/15 text-tl-teal',
    'bg-tl-gold/15 text-tl-gold',
    'bg-tl-blue/15 text-tl-blue',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange, gold = false }: { value: boolean; onChange: () => void; gold?: boolean }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-10 h-[22px] rounded-full transition-all duration-200 relative shrink-0', value ? (gold ? 'bg-tl-gold' : 'bg-tl-teal') : 'bg-tl-bg-elevated border border-tl-border-subtle')}
    >
      <span className={cn('absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200', value && 'translate-x-[18px]')} />
    </button>
  )
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function CandidateGridCard({
  candidate,
  idx,
  aiScore,
  aiReason,
  jobIdForLink,
}: {
  candidate: Candidate
  idx: number
  aiScore?: number
  aiReason?: string
  jobIdForLink?: string
}) {
  const [saved, setSaved] = useState(false)
  const topSkills = candidate.skills.slice(0, 4)
  const extraCount = candidate.skills.length - topSkills.length
  const displayScore = aiScore ?? candidate.matchScore

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: idx * 0.04 }}
      className="tl-card p-5 hover:border-tl-gold/30 hover:shadow-gold transition-all cursor-pointer flex flex-col"
    >
      {/* Top: avatar + badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0', avatarColor(candidate.name))}>
            {candidate.name.slice(0, 2).toUpperCase()}
          </div>
          {candidate.verified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-tl-teal border-2 border-tl-bg-surface flex items-center justify-center">
              <CheckCircle2 className="w-2.5 h-2.5 text-tl-bg-base" />
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {candidate.verified && (
            <span className="tl-tag-teal text-[10px]">
              Verified
            </span>
          )}
          {candidate.premium && (
            <span className="tl-tag-gold flex items-center gap-1 text-[10px]">
              <Zap className="w-2.5 h-2.5" /> Premium
            </span>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="mb-3">
        <p className="text-base font-bold text-tl-text-primary">{candidate.name}</p>
        <p className="text-sm text-tl-text-secondary">{candidate.title}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-tl-text-secondary/60" />
          <span className="text-xs text-tl-text-secondary">{candidate.location}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-3">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
          candidate.availability.toLowerCase().includes('immediately') || candidate.availability.toLowerCase().includes('now')
            ? 'bg-tl-teal/10 text-tl-teal border border-tl-teal/20'
            : 'bg-tl-gold/10 text-tl-gold border border-tl-gold/20'
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {candidate.availability}
        </span>
      </div>

      {/* Match ring */}
      <div className="flex justify-center my-3">
        <MatchRingSvg score={displayScore} size={64} />
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {topSkills.map((s) => (
          <span
            key={s.name}
            className={cn(
              'inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border font-medium',
              s.verified
                ? 'bg-tl-teal/10 border-tl-teal/20 text-tl-teal'
                : 'bg-tl-bg-elevated border-tl-border-subtle text-tl-text-secondary'
            )}
          >
            {s.verified && <CheckCircle2 className="w-2.5 h-2.5" />}
            {s.name}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="text-[11px] text-tl-text-secondary px-2 py-0.5">+{extraCount} more</span>
        )}
      </div>

      {/* Salary */}
      <p className="font-mono text-sm text-tl-gold font-semibold mb-2 mt-auto">
        ${Math.round(candidate.salaryExpectation / 1000)}K / yr
      </p>

      {/* AI reason snippet */}
      {aiReason && (
        <p
          className="text-[11px] text-tl-text-secondary leading-snug line-clamp-2 mb-3 italic"
          title={aiReason}
        >
          <span className="not-italic font-semibold text-tl-gold">AI:</span> {aiReason}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={jobIdForLink
            ? `/company/candidates/${candidate.id}?jobId=${jobIdForLink}`
            : `/company/candidates/${candidate.id}`}
          className="flex-1 text-sm font-semibold py-2 px-3 rounded-xl border border-tl-border-subtle hover:border-tl-gold/40 hover:text-tl-gold text-tl-text-primary text-center transition-all"
        >
          View Profile
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); setSaved((p) => !p) }}
          className={cn(
            'p-2 rounded-xl border transition-all duration-200',
            saved
              ? 'bg-tl-gold/20 border-tl-gold/40 text-tl-gold'
              : 'border-tl-border-subtle text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30'
          )}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  )
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function CandidateListRow({
  candidate,
  idx,
  aiScore,
  aiReason,
  jobIdForLink,
}: {
  candidate: Candidate
  idx: number
  aiScore?: number
  aiReason?: string
  jobIdForLink?: string
}) {
  const [saved, setSaved] = useState(false)
  const displayScore = aiScore ?? candidate.matchScore
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: idx * 0.03 }}
      className="tl-card px-5 py-4 hover:border-tl-gold/30 transition-all flex items-center gap-4"
    >
      <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0', avatarColor(candidate.name))}>
        {candidate.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-tl-text-primary">{candidate.name}</p>
          {candidate.verified && <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal shrink-0" />}
          {candidate.premium && <Star className="w-3.5 h-3.5 text-tl-gold shrink-0 fill-current" />}
        </div>
        <p className="text-sm text-tl-text-secondary">{candidate.title} · {candidate.location}</p>
        {aiReason && (
          <p
            className="text-[11px] text-tl-text-secondary mt-1 line-clamp-1 italic"
            title={aiReason}
          >
            <span className="not-italic font-semibold text-tl-gold">AI:</span> {aiReason}
          </p>
        )}
      </div>
      <div className="hidden md:flex gap-1.5 flex-wrap max-w-[180px]">
        {candidate.skills.slice(0, 2).map((s) => (
          <span key={s.name} className="text-[11px] px-2 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-subtle text-tl-text-secondary">
            {s.name}
          </span>
        ))}
      </div>
      <span className="hidden lg:block font-mono text-sm text-tl-gold font-semibold shrink-0">
        ${Math.round(candidate.salaryExpectation / 1000)}K
      </span>
      <div className="shrink-0">
        <MatchRingSvg score={displayScore} size={44} />
      </div>
      <Link
        href={jobIdForLink
          ? `/company/candidates/${candidate.id}?jobId=${jobIdForLink}`
          : `/company/candidates/${candidate.id}`}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-tl-gold/10 border border-tl-gold/20 text-tl-gold hover:bg-tl-gold/20 transition-all shrink-0"
      >
        View
      </Link>
      <button
        onClick={() => setSaved((p) => !p)}
        className={cn('p-1.5 rounded-lg transition-all shrink-0', saved ? 'text-tl-gold' : 'text-tl-text-secondary hover:text-tl-gold')}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface FindTalentMatch {
  candidateId: string
  score: number
  reason: string
}

export default function CandidatesPage() {
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel[]>([])
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode[]>([])
  const [salaryMin, setSalaryMin] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'salary'>('match')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [skillTags, setSkillTags] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  // Find Talent (AI)
  const [findOpen, setFindOpen] = useState(false)
  const [companyJobs, setCompanyJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [finding, setFinding] = useState(false)
  const [findError, setFindError] = useState<string | null>(null)
  const [aiMatches, setAiMatches] = useState<Map<string, FindTalentMatch> | null>(null)
  const [aiJob, setAiJob] = useState<Job | null>(null)
  const [aiSource, setAiSource] = useState<'openai' | 'fallback' | null>(null)

  useEffect(() => {
    async function load() {
      const res = await getCandidates()
      if (res.data) setAllCandidates(res.data)
      setLoading(false)
    }
    load()
  }, [])

  function openFind() {
    setFindError(null)
    setFindOpen(true)
    if (companyJobs.length === 0) {
      setJobsLoading(true)
      getCompanyJobs({ status: 'active', limit: 50 })
        .then(r => { if (r.data) setCompanyJobs(r.data) })
        .finally(() => setJobsLoading(false))
    }
  }

  async function runFind() {
    if (!selectedJobId) return
    setFinding(true)
    setFindError(null)
    try {
      const res = await fetch(`/api/company/jobs/${selectedJobId}/match-candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error || 'Find Talent failed')
      }
      const data = await res.json() as {
        results: FindTalentMatch[]
        source: 'openai' | 'fallback'
      }
      const map = new Map<string, FindTalentMatch>()
      for (const r of data.results) map.set(r.candidateId, r)
      setAiMatches(map)
      setAiSource(data.source)
      setAiJob(companyJobs.find(j => j.id === selectedJobId) ?? null)
      setSortBy('match')
      setPage(1)
      setFindOpen(false)
    } catch (e) {
      setFindError(e instanceof Error ? e.message : 'Failed to find talent')
    } finally {
      setFinding(false)
    }
  }

  function clearAiMatches() {
    setAiMatches(null)
    setAiJob(null)
    setAiSource(null)
  }

  const activeFilters =
    experienceFilter.length +
    workModeFilter.length +
    (salaryMin > 0 ? 1 : 0) +
    skillTags.length +
    (verifiedOnly ? 1 : 0) +
    (premiumOnly ? 1 : 0) +
    (availabilityFilter ? 1 : 0)

  const clearFilters = () => {
    setExperienceFilter([])
    setWorkModeFilter([])
    setSalaryMin(0)
    setSkillTags([])
    setVerifiedOnly(false)
    setPremiumOnly(false)
    setAvailabilityFilter('')
    setSearch('')
  }

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,$/, '')
      if (skill && !skillTags.includes(skill)) {
        setSkillTags((p) => [...p, skill])
      }
      setSkillInput('')
    }
  }

  const filtered = useMemo(() => {
    let list = [...allCandidates]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      )
    }
    if (experienceFilter.length) {
      // map experience level to years roughly; filter by title keywords
      list = list.filter((c) =>
        c.skills.some((s) =>
          experienceFilter.some((ef) => {
            const t = c.title.toLowerCase()
            if (ef === 'entry') return t.includes('junior') || t.includes('associate')
            if (ef === 'mid') return !t.includes('senior') && !t.includes('lead') && !t.includes('staff')
            if (ef === 'senior') return t.includes('senior') || t.includes('sr.')
            if (ef === 'lead') return t.includes('lead') || t.includes('staff') || t.includes('principal')
            if (ef === 'executive') return t.includes('cto') || t.includes('director') || t.includes('vp') || t.includes('head')
            return true
          })
        ) || true // pass if filter is active (best effort with mock data)
      )
    }
    if (workModeFilter.length) {
      list = list.filter((c) =>
        c.workPreference.some((w) => workModeFilter.includes(w))
      )
    }
    if (salaryMin > 0) {
      list = list.filter((c) => c.salaryExpectation >= salaryMin)
    }
    if (skillTags.length) {
      list = list.filter((c) =>
        skillTags.every((tag) =>
          c.skills.some((s) => s.name.toLowerCase().includes(tag.toLowerCase()))
        )
      )
    }
    if (verifiedOnly) list = list.filter((c) => c.verified)
    if (premiumOnly) list = list.filter((c) => c.premium)
    if (availabilityFilter) {
      list = list.filter((c) => c.availability.toLowerCase().includes(availabilityFilter.toLowerCase().split(' ')[0]))
    }
    // When AI Find Talent ran, restrict to scored candidates and sort by AI score.
    if (aiMatches) {
      list = list.filter((c) => aiMatches.has(c.id))
      list.sort((a, b) => (aiMatches.get(b.id)?.score ?? 0) - (aiMatches.get(a.id)?.score ?? 0))
      return list
    }
    if (sortBy === 'match') list.sort((a, b) => b.matchScore - a.matchScore)
    else if (sortBy === 'salary') list.sort((a, b) => a.salaryExpectation - b.salaryExpectation)
    return list
  }, [allCandidates, search, experienceFilter, workModeFilter, salaryMin, skillTags, verifiedOnly, premiumOnly, availabilityFilter, sortBy, aiMatches])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const salaryDisplay = salaryMin >= 1000 ? `$${(salaryMin / 1000).toFixed(0)}K` : salaryMin === 0 ? 'Any' : `$${salaryMin}`

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-full min-h-screen bg-tl-bg-base">

      {/* ── LEFT FILTER SIDEBAR ───────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 border-r border-tl-border-subtle flex flex-col overflow-y-auto overflow-x-hidden bg-tl-bg-surface"
            style={{ minWidth: 0 }}
          >
            <div className="w-64">
              {/* Filters header */}
              <div className="tl-card m-4 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-tl-gold" />
                    <h2 className="text-sm font-semibold text-tl-text-primary">Filters</h2>
                    {activeFilters > 0 && (
                      <span className="tl-tag-gold text-[10px] font-bold">
                        {activeFilters}
                      </span>
                    )}
                  </div>
                  {activeFilters > 0 && (
                    <button onClick={clearFilters} className="text-xs text-tl-text-secondary hover:text-tl-rose transition-colors">
                      Clear
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search candidates…"
                    className="w-full bg-tl-bg-surface border border-tl-border-subtle rounded-xl pl-9 pr-4 py-2.5 text-sm text-tl-text-primary placeholder:text-tl-text-secondary/60 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-2.5">Experience Level</p>
                  <div className="space-y-2">
                    {EXPERIENCE_LEVELS.map((lvl) => (
                      <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={experienceFilter.includes(lvl)}
                          onChange={() => {
                            setExperienceFilter((p) =>
                              p.includes(lvl) ? p.filter((x) => x !== lvl) : [...p, lvl]
                            )
                            setPage(1)
                          }}
                          className="w-4 h-4 rounded border-tl-gold checked:bg-tl-gold accent-[#C9A84C]"
                        />
                        <span className="text-sm text-tl-text-secondary group-hover:text-tl-text-primary transition-colors">
                          {EXPERIENCE_LABELS[lvl]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div>
                  <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-2.5">Work Mode</p>
                  <div className="space-y-2">
                    {WORK_MODES.map((mode) => (
                      <label key={mode} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={workModeFilter.includes(mode)}
                          onChange={() => {
                            setWorkModeFilter((p) =>
                              p.includes(mode) ? p.filter((x) => x !== mode) : [...p, mode]
                            )
                            setPage(1)
                          }}
                          className="w-4 h-4 rounded border-tl-gold checked:bg-tl-gold accent-[#C9A84C]"
                        />
                        <span className="text-sm text-tl-text-secondary group-hover:text-tl-text-primary transition-colors">
                          {WORK_MODE_LABELS[mode]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Min Salary */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider">Min Salary</p>
                    <span className="font-mono text-xs font-semibold text-tl-gold">{salaryDisplay}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200000}
                    step={10000}
                    value={salaryMin}
                    onChange={(e) => { setSalaryMin(Number(e.target.value)); setPage(1) }}
                    className="w-full accent-[#C9A84C]"
                  />
                  <div className="flex justify-between text-[10px] text-tl-text-secondary mt-1">
                    <span>$0</span><span>$200K</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-2.5">Skills</p>
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type skill + Enter…"
                    className="w-full bg-tl-bg-surface border border-tl-border-subtle rounded-lg px-3 py-2 text-xs text-tl-text-primary placeholder:text-tl-text-secondary/60 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all"
                  />
                  {skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skillTags.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 text-[11px] tl-tag-gold"
                        >
                          {s}
                          <button onClick={() => setSkillTags((p) => p.filter((x) => x !== s))}>
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-2.5">Availability</p>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => { setAvailabilityFilter(e.target.value); setPage(1) }}
                    className="w-full bg-tl-bg-surface border border-tl-border-subtle rounded-lg px-3 py-2 text-sm text-tl-text-secondary focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all"
                  >
                    <option value="">Any</option>
                    {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {/* Toggle switches */}
                <div className="space-y-3 pt-1 border-t border-tl-border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tl-text-secondary">Verified only</span>
                    <Toggle value={verifiedOnly} onChange={() => { setVerifiedOnly((p) => !p); setPage(1) }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-tl-text-secondary">Premium profiles</span>
                    <Toggle value={premiumOnly} onChange={() => { setPremiumOnly((p) => !p); setPage(1) }} gold />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-tl-border-subtle">
          <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters((p) => !p)}
                className="p-2 rounded-xl border border-tl-border-subtle text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 hover:bg-tl-gold/5 transition-all"
                title="Toggle filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <div>
                <h1 className="font-display text-2xl text-tl-text-primary">Talent Pool</h1>
                <p className="text-sm text-tl-text-secondary mt-0.5">
                  <span className="font-mono text-tl-gold font-semibold">{filtered.length}</span> candidates found
                  {activeFilters > 0 && (
                    <button
                      onClick={clearFilters}
                      className="ml-2 text-[11px] text-tl-rose/70 hover:text-tl-rose transition-colors"
                    >
                      Clear {activeFilters} filter{activeFilters !== 1 ? 's' : ''}
                    </button>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Find Talent (AI) */}
              <button
                onClick={openFind}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-tl-gold to-tl-gold/80 text-tl-bg-base text-sm font-semibold hover:shadow-gold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Find Talent
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-tl-text-secondary hidden sm:block">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'match' | 'recent' | 'salary')}
                  disabled={!!aiMatches}
                  className="bg-tl-bg-surface border border-tl-border-subtle rounded-xl px-3 py-2 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all disabled:opacity-50"
                >
                  <option value="match">Best Match</option>
                  <option value="recent">Most Recent</option>
                  <option value="salary">Salary (Low–High)</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 bg-tl-bg-surface rounded-xl border border-tl-border-subtle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-tl-bg-elevated text-tl-gold' : 'text-tl-text-secondary hover:text-tl-text-primary')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-tl-bg-elevated text-tl-gold' : 'text-tl-text-secondary hover:text-tl-text-primary')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Results banner */}
        {aiMatches && aiJob && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 rounded-2xl border border-tl-gold/30 bg-gradient-to-r from-tl-gold/12 via-tl-gold/8 to-transparent p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-tl-gold/20 border border-tl-gold/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-tl-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-tl-text-primary">
                AI-ranked candidates for{' '}
                <span className="text-tl-gold">{aiJob.title}</span>
              </p>
              <p className="text-xs text-tl-text-secondary mt-0.5">
                {aiMatches.size} candidate{aiMatches.size !== 1 ? 's' : ''} scored against this role
                {aiSource === 'fallback' && (
                  <span className="ml-1 text-[10px] uppercase tracking-wider border border-tl-border-subtle rounded-full px-1.5 py-0.5 ml-2">
                    Heuristic
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={clearAiMatches}
              className="text-xs font-semibold text-tl-text-secondary hover:text-tl-rose transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </motion.div>
        )}

        {/* Candidates */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {paginated.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <Search className="w-12 h-12 text-tl-text-secondary/20 mb-4" />
                <p className="text-sm font-medium text-tl-text-primary">
                  {aiMatches ? 'No AI matches yet — make sure candidates have completed profiles.' : 'No candidates found'}
                </p>
                <p className="text-xs text-tl-text-secondary mt-1">
                  {aiMatches ? 'Clear AI results to see all candidates.' : 'Try adjusting your search or filters'}
                </p>
                <button
                  onClick={() => (aiMatches ? clearAiMatches() : clearFilters())}
                  className="mt-4 text-xs text-tl-gold hover:text-tl-gold/80 transition-colors"
                >
                  {aiMatches ? 'Clear AI results' : 'Clear all filters'}
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {paginated.map((c, i) => (
                  <CandidateGridCard
                    key={c.id}
                    candidate={c}
                    idx={i}
                    aiScore={aiMatches?.get(c.id)?.score}
                    aiReason={aiMatches?.get(c.id)?.reason}
                    jobIdForLink={aiJob?.id}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3"
              >
                {paginated.map((c, i) => (
                  <CandidateListRow
                    key={c.id}
                    candidate={c}
                    idx={i}
                    aiScore={aiMatches?.get(c.id)?.score}
                    aiReason={aiMatches?.get(c.id)?.reason}
                    jobIdForLink={aiJob?.id}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 border-t border-tl-border-subtle px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-tl-text-secondary">
              Showing{' '}
              <span className="font-mono text-tl-text-primary font-medium">
                {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
              </span>{' '}
              of <span className="font-mono text-tl-text-primary font-medium">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-tl-border-subtle text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-8 h-8 rounded-lg font-mono text-sm font-medium transition-all',
                      page === p
                        ? 'bg-tl-gold text-tl-bg-base'
                        : 'text-tl-text-secondary hover:text-tl-gold hover:bg-tl-gold/10'
                    )}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-tl-border-subtle text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── FIND TALENT MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {findOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !finding && setFindOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-tl-border-default bg-tl-bg-surface shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-tl-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-tl-gold/20 border border-tl-gold/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-tl-gold" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-tl-text-primary">Find Talent with AI</h2>
                    <p className="text-[11px] text-tl-text-secondary">Pick a job — AI will rank your talent pool</p>
                  </div>
                </div>
                <button
                  onClick={() => !finding && setFindOpen(false)}
                  className="text-tl-text-secondary hover:text-tl-text-primary p-1"
                  disabled={finding}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider">
                    Select a Job
                  </label>
                  {jobsLoading ? (
                    <div className="flex items-center gap-2 text-xs text-tl-text-secondary py-3">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading your jobs…
                    </div>
                  ) : companyJobs.length === 0 ? (
                    <div className="rounded-xl border border-tl-border-subtle bg-tl-bg-base p-4 text-center">
                      <p className="text-sm text-tl-text-primary">No active jobs yet.</p>
                      <Link
                        href="/company/jobs/new"
                        className="text-xs text-tl-gold hover:underline mt-1.5 inline-block"
                      >
                        Post a job first →
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-xl border border-tl-border-subtle bg-tl-bg-base p-1">
                      {companyJobs.map((j) => (
                        <button
                          key={j.id}
                          onClick={() => setSelectedJobId(j.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            selectedJobId === j.id
                              ? 'bg-tl-gold/12 border border-tl-gold/40'
                              : 'border border-transparent hover:bg-tl-bg-elevated',
                          )}
                        >
                          <span
                            className={cn(
                              'w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors',
                              selectedJobId === j.id ? 'bg-tl-gold border-tl-gold' : 'border-tl-border-default',
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-tl-text-primary truncate">{j.title}</p>
                            <p className="text-[11px] text-tl-text-secondary truncate">
                              {j.location || 'Remote'}
                              {j.workMode ? ` · ${WORK_MODE_LABELS[j.workMode] ?? j.workMode}` : ''}
                              {j.applicantCount != null ? ` · ${j.applicantCount} applicant${j.applicantCount === 1 ? '' : 's'}` : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {findError && (
                  <p className="text-xs text-tl-rose bg-tl-rose/10 border border-tl-rose/20 rounded-lg p-2.5">
                    {findError}
                  </p>
                )}

                <p className="text-[11px] text-tl-text-secondary leading-relaxed">
                  AI will score candidates on skills overlap, seniority, work mode &amp; salary fit, and recent experience relevance — then return them ranked.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-tl-border-subtle bg-tl-bg-base/60">
                <button
                  onClick={() => setFindOpen(false)}
                  disabled={finding}
                  className="px-4 py-2 text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={runFind}
                  disabled={finding || !selectedJobId || companyJobs.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-tl-gold to-tl-gold/80 text-tl-bg-base text-sm font-semibold hover:shadow-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {finding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Finding…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Find
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
