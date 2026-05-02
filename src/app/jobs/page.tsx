'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Clock, Users, X, SlidersHorizontal,
  Briefcase, ChevronLeft, ChevronRight, ArrowRight, Globe,
  Banknote, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface JobCompany {
  name?: string
  verified?: boolean
  logo?: string
}

interface Job {
  jobId: string
  title: string
  company?: JobCompany | string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  type?: string
  workMode?: string
  level?: string
  skills?: string[]
  postedAt?: string
  applicantCount?: number
  status?: string
  source?: string
  sourceUrl?: string
  featured?: boolean
  description?: string
}

function getCompanyName(job: Job): string {
  if (!job.company) return 'Unknown Company'
  if (typeof job.company === 'string') return job.company
  return job.company.name ?? 'Unknown Company'
}

function isVerified(job: Job): boolean {
  if (typeof job.company === 'object' && job.company?.verified) return true
  return false
}

function formatSalary(min?: number, max?: number, currency = 'USD'): string {
  if (!min && !max) return ''
  const sym = currency === 'USD' ? '$' : currency
  if (min && max) return `${sym}${Math.round(min / 1000)}K–${sym}${Math.round(max / 1000)}K`
  if (max) return `Up to ${sym}${Math.round(max / 1000)}K`
  return `${sym}${Math.round((min ?? 0) / 1000)}K+`
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function isLoggedInAsTalent(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('tb-talent-token=')
}

const WORK_MODE_LABELS: Record<string, string> = {
  remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site',
}
const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract',
  internship: 'Internship', freelance: 'Freelance',
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job }: { job: Job }) {
  const companyName = getCompanyName(job)
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)
  const isNew = job.postedAt && (Date.now() - new Date(job.postedAt).getTime()) < 1000 * 60 * 60 * 48
  const isScraped = job.source === 'hiring_cafe'

  function handleApply(e: React.MouseEvent) {
    e.preventDefault()
    if (isLoggedInAsTalent()) {
      window.location.href = `/talent/jobs/${job.jobId}`
    } else if (isScraped && job.sourceUrl) {
      window.location.href = `/auth/login?next=${encodeURIComponent(job.sourceUrl)}`
    } else {
      window.location.href = `/auth/login?next=${encodeURIComponent(`/talent/jobs/${job.jobId}`)}`
    }
  }

  return (
    <Link href={`/jobs/${job.jobId}`} className="block group">
      <div className="tl-card p-4 sm:p-5 hover:border-tl-gold/40 transition-all duration-300 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Company avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-violet-400">
            {companyName.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base font-bold text-[var(--tl-text-primary)] group-hover:text-tl-gold transition-colors leading-tight">
                {job.title}
              </span>
              {isNew && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tl-teal/15 text-tl-teal border border-tl-teal/20">
                  NEW
                </span>
              )}
              {job.featured && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-tl-gold/15 text-tl-gold border border-tl-gold/20">
                  Featured
                </span>
              )}
              {isScraped && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-0.5">
                  <Globe className="w-2.5 h-2.5" />via hiring.cafe
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mb-2 text-sm text-[var(--tl-text-secondary)]">
              <span className="flex items-center gap-1 font-medium">
                {companyName}
                {isVerified(job) && <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal" />}
              </span>
              {job.location && (
                <span className="flex items-center gap-1 text-xs">
                  <MapPin className="w-3 h-3 shrink-0" />{job.location}
                </span>
              )}
              {salary && (
                <span className="flex items-center gap-1 text-xs text-tl-teal font-semibold font-mono">
                  <Banknote className="w-3 h-3 shrink-0" />{salary}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {job.workMode && (
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                  job.workMode === 'remote'
                    ? 'bg-tl-teal/10 border-tl-teal/20 text-tl-teal'
                    : 'bg-[var(--tl-bg-elevated)] border-[var(--tl-border-default)] text-[var(--tl-text-secondary)]'
                )}>
                  {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
                </span>
              )}
              {job.type && (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--tl-bg-elevated)] border border-[var(--tl-border-default)] text-[10px] text-[var(--tl-text-secondary)]">
                  {JOB_TYPE_LABELS[job.type] ?? job.type}
                </span>
              )}
              {job.skills?.slice(0, 3).map(s => (
                <span key={s} className="px-2.5 py-0.5 rounded-full bg-tl-gold/8 border border-tl-gold/15 text-[10px] text-tl-gold">
                  {s}
                </span>
              ))}
              {(job.skills?.length ?? 0) > 3 && (
                <span className="text-[10px] text-[var(--tl-text-secondary)] self-center">
                  +{(job.skills?.length ?? 0) - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--tl-text-secondary)]">
              {job.postedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(job.postedAt)}
                </span>
              )}
              {job.applicantCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {job.applicantCount} applicants
                </span>
              )}
            </div>
          </div>

          {/* Apply button */}
          <div className="shrink-0">
            <button
              onClick={handleApply}
              className="btn-gold h-9 text-xs px-5 flex items-center gap-1.5 shrink-0"
            >
              Apply <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12

export default function PublicJobsPage() {
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [workMode, setWorkMode] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/jobs?limit=200')
        if (res.ok) {
          const data = await res.json()
          setAllJobs(Array.isArray(data) ? data : [])
        }
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = allJobs
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        getCompanyName(j).toLowerCase().includes(q) ||
        j.skills?.some(s => s.toLowerCase().includes(q))
      )
    }
    if (workMode.length) result = result.filter(j => j.workMode && workMode.includes(j.workMode))
    return result
  }, [allJobs, search, workMode])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  function toggleWorkMode(m: string) {
    setPage(1)
    setWorkMode(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const activeFilters = workMode.length + (search ? 1 : 0)

  return (
    <div className="min-h-screen bg-[var(--tl-bg-base)]">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--tl-bg-surface)]/95 backdrop-blur-xl border-b border-[var(--tl-border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--tl-text-primary)] tracking-tight">TalentBridge</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm hidden sm:block">Sign in</Link>
            <Link href="/auth/register?role=talent" className="btn-gold text-sm">
              Join as Talent
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--tl-text-primary)] mb-2">
            Find Your Next Role
          </h1>
          <p className="text-[var(--tl-text-secondary)] text-base">
            {loading ? 'Loading jobs…' : `${allJobs.length} open positions · Browse freely, login to apply`}
          </p>
        </motion.div>

        {/* Search + filters bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
            <input
              type="text"
              placeholder="Search roles, companies, skills…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-10 py-3 w-full text-sm"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              activeFilters > 0
                ? 'bg-tl-gold/10 border-tl-gold/40 text-tl-gold'
                : 'bg-[var(--tl-bg-surface)] border-[var(--tl-border-default)] text-[var(--tl-text-secondary)] hover:border-tl-gold/30'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-tl-gold text-[var(--tl-bg-base)] text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </motion.div>

        {/* Filter chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="tl-card p-4 flex flex-wrap gap-3">
                <div>
                  <p className="text-[10px] text-[var(--tl-text-secondary)] uppercase tracking-wider font-semibold mb-2">Work Mode</p>
                  <div className="flex gap-2 flex-wrap">
                    {['remote', 'hybrid', 'onsite'].map(m => (
                      <button
                        key={m}
                        onClick={() => toggleWorkMode(m)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          workMode.includes(m)
                            ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
                            : 'bg-[var(--tl-bg-elevated)] border-[var(--tl-border-default)] text-[var(--tl-text-secondary)] hover:border-tl-gold/20'
                        )}
                      >
                        {WORK_MODE_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>
                {(workMode.length > 0) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => setWorkMode([])}
                      className="text-xs text-[var(--tl-text-secondary)] hover:text-tl-rose flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-[var(--tl-text-secondary)] mb-4">
            <span className="text-[var(--tl-text-primary)] font-semibold font-mono">{filtered.length}</span> jobs found
            {search && <span className="ml-1">for &ldquo;{search}&rdquo;</span>}
          </p>
        )}

        {/* Login-to-apply banner */}
        <div className="mb-5 px-4 py-3 rounded-xl bg-tl-gold/6 border border-tl-gold/20 flex items-center gap-3 text-sm">
          <div className="w-7 h-7 rounded-lg bg-tl-gold/15 border border-tl-gold/25 flex items-center justify-center shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-tl-gold" />
          </div>
          <p className="text-[var(--tl-text-secondary)]">
            Browse all jobs freely.{' '}
            <Link href="/auth/login" className="text-tl-gold font-semibold hover:underline">Sign in</Link>
            {' '}or{' '}
            <Link href="/auth/register?role=talent" className="text-tl-gold font-semibold hover:underline">create a free account</Link>
            {' '}to apply.
          </p>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="tl-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--tl-bg-elevated)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-[var(--tl-bg-elevated)] rounded" />
                    <div className="h-3 w-1/3 bg-[var(--tl-bg-elevated)] rounded" />
                    <div className="h-3 w-2/3 bg-[var(--tl-bg-elevated)] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="tl-card p-12 text-center">
            <Search className="w-10 h-10 mx-auto mb-3 text-[var(--tl-text-secondary)] opacity-30" />
            <h3 className="font-semibold text-[var(--tl-text-primary)] mb-1">No jobs found</h3>
            <p className="text-sm text-[var(--tl-text-secondary)] mb-4">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(''); setWorkMode([]); setPage(1) }} className="btn-ghost text-sm">
              Clear all filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {paginated.map(job => (
                <JobCard key={job.jobId} job={job} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              className="btn-ghost h-9 w-9 p-0 flex items-center justify-center disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : page - 3 + i)
              if (p < 1 || p > totalPages) return null
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-9 w-9 rounded-xl text-sm font-mono font-semibold border transition-all',
                    page === p
                      ? 'bg-tl-gold text-[var(--tl-bg-base)] border-tl-gold'
                      : 'bg-[var(--tl-bg-surface)] border-[var(--tl-border-default)] text-[var(--tl-text-secondary)] hover:border-tl-gold/40'
                  )}
                >{p}</button>
              )
            })}
            <button
              className="btn-ghost h-9 w-9 p-0 flex items-center justify-center disabled:opacity-40"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {filtered.length > 0 && !loading && (
          <p className="text-center text-xs text-[var(--tl-text-secondary)] mt-3 font-mono">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--tl-border-subtle)] mt-16 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-[var(--tl-text-secondary)] mb-2">
          <Briefcase className="w-4 h-4" />
          <Link href="/" className="font-semibold text-[var(--tl-text-primary)] hover:text-tl-gold transition-colors">TalentBridge</Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--tl-text-secondary)]">
          <Link href="/auth/register?role=company" className="hover:text-[var(--tl-text-primary)] transition-colors">Post a Job</Link>
          <Link href="/pricing" className="hover:text-[var(--tl-text-primary)] transition-colors">Pricing</Link>
          <Link href="/privacy" className="hover:text-[var(--tl-text-primary)] transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  )
}
