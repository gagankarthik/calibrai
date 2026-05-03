'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Link2,
  Sparkles,
  ExternalLink,
  Wifi,
  Building2,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CrmJob {
  jobId?: string
  pk?: string
  id?: string
  title?: string
  company?: string
  location?: string
  salary?: string
  salaryRange?: string
  source?: string
  skills?: string[]
  url?: string
  description?: string
  remote?: boolean
  jobType?: string
  postedAt?: string | null
  scrapedAt?: string
  createdAt?: string
  requirements?: string[]
}

interface ExtractedJob {
  title: string
  company: string
  location?: string
  salary?: string
  description?: string
  requirements?: string[]
  skills?: string[]
  jobType?: string
  remote?: boolean
  postedAt?: string
  url?: string
}

interface PreviewResponse {
  source: string
  pageTitle: string
  pagesVisited: number
  jobLinksFound: number
  jobs: ExtractedJob[]
  warning?: string
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source?: string }) {
  const s = (source ?? '').toLowerCase()
  const known: Record<string, string> = {
    remoteok: 'bg-tl-teal/10 text-tl-teal border-tl-teal/30',
    linkedin: 'bg-tl-blue/10 text-tl-blue border-tl-blue/30',
    indeed: 'bg-tl-gold/10 text-tl-gold border-tl-gold/30',
    greenhouse: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    lever: 'bg-purple-100 text-purple-700 border-purple-200',
    workday: 'bg-orange-100 text-orange-700 border-orange-200',
    remotive: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  }
  const cls = known[s] ?? 'bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border-[var(--tl-border-default)]'
  return (
    <span className={cn('inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap', cls)}>
      {source ?? 'unknown'}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCrmJobs() {
  const [jobs, setJobs] = useState<CrmJob[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const LIMIT = 25

  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Scrape preview state
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const [saveAllRunning, setSaveAllRunning] = useState(false)
  const [saveSummary, setSaveSummary] = useState<{ saved: number; skipped: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (sourceFilter) params.set('source', sourceFilter)
      const res = await fetch(`/api/admin/crm/jobs?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = (await res.json()) as { jobs: CrmJob[]; total: number }
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to load CRM jobs.')
    } finally {
      setLoading(false)
    }
  }, [page, sourceFilter])

  useEffect(() => { load() }, [load])

  const knownSources = useMemo(() => {
    const set = new Set<string>()
    jobs.forEach((j) => { if (j.source) set.add(j.source) })
    return Array.from(set).sort()
  }, [jobs])

  const filtered = useMemo(() => {
    let list = jobs
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (j) =>
          (j.title ?? '').toLowerCase().includes(q) ||
          (j.company ?? '').toLowerCase().includes(q) ||
          (j.location ?? '').toLowerCase().includes(q) ||
          (j.skills ?? []).some((s) => s.toLowerCase().includes(q)),
      )
    }
    if (remoteOnly) list = list.filter((j) => j.remote)
    return list
  }, [jobs, search, remoteOnly])

  // ── Scrape (preview only, no DB writes) ────────────────────────────────────
  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!scrapeUrl.trim()) return
    setScraping(true)
    setPreviewError('')
    setPreview(null)
    setSavedIds(new Set())
    setSavingIds(new Set())
    setSaveSummary(null)
    try {
      const res = await fetch('/api/admin/crm/jobs/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<PreviewResponse> & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Scrape failed')
      setPreview({
        source: data.source ?? scrapeUrl,
        pageTitle: data.pageTitle ?? '',
        pagesVisited: data.pagesVisited ?? 0,
        jobLinksFound: data.jobLinksFound ?? 0,
        jobs: Array.isArray(data.jobs) ? data.jobs : [],
        warning: data.warning,
      })
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to scrape URL')
    } finally {
      setScraping(false)
    }
  }

  // ── Save one or all ────────────────────────────────────────────────────────
  async function saveJobs(indices: number[]) {
    if (!preview || indices.length === 0) return null
    const jobsToSend = indices.map((i) => preview.jobs[i]).filter(Boolean)
    if (jobsToSend.length === 0) return null
    const res = await fetch('/api/admin/crm/jobs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: preview.source, jobs: jobsToSend }),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? 'Save failed')
    }
    return (await res.json()) as { saved: number; skipped: number }
  }

  async function handleAddOne(idx: number) {
    setSavingIds((s) => new Set(s).add(idx))
    try {
      const r = await saveJobs([idx])
      if (r) {
        setSavedIds((s) => new Set(s).add(idx))
        setSaveSummary((p) => ({
          saved: (p?.saved ?? 0) + r.saved,
          skipped: (p?.skipped ?? 0) + r.skipped,
        }))
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingIds((s) => {
        const next = new Set(s)
        next.delete(idx)
        return next
      })
    }
  }

  async function handleAddAll() {
    if (!preview) return
    setSaveAllRunning(true)
    const allIdx = preview.jobs.map((_, i) => i).filter((i) => !savedIds.has(i))
    try {
      const r = await saveJobs(allIdx)
      if (r) {
        setSavedIds(new Set([...savedIds, ...allIdx]))
        setSaveSummary((p) => ({
          saved: (p?.saved ?? 0) + r.saved,
          skipped: (p?.skipped ?? 0) + r.skipped,
        }))
      }
      await load()
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaveAllRunning(false)
    }
  }

  function dismissPreview() {
    setPreview(null)
    setPreviewError('')
    setSavedIds(new Set())
    setSaveSummary(null)
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const activeFilterCount = (sourceFilter ? 1 : 0) + (remoteOnly ? 1 : 0) + (search.trim() ? 1 : 0)
  const clearFilters = () => { setSourceFilter(''); setRemoteOnly(false); setSearch(''); setPage(1) }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">CRM — Scraped Jobs</h1>
        <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
          {total} job{total === 1 ? '' : 's'} in your DB · paste a URL below to preview, then click Add to save
        </p>
      </motion.div>

      {/* ─── Scrape from URL ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="tl-card p-4 sm:p-5 mb-5 border border-tl-gold/25 bg-gradient-to-br from-tl-gold/5 via-transparent to-transparent"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-tl-gold/15 border border-tl-gold/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-tl-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-[var(--tl-text-primary)]">
              Scrape jobs from any URL
            </h2>
            <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5">
              Paste a job posting or careers page. AI extracts the jobs into a preview — nothing is saved until you click <span className="font-semibold text-tl-gold">Add</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
            <input
              type="url"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://jobs.example.com/posting-url"
              required
              disabled={scraping}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] text-sm text-[var(--tl-text-primary)] placeholder:text-[var(--tl-text-secondary)]/60 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={scraping || !scrapeUrl.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold hover:bg-tl-gold/90 transition-all shadow-md shadow-tl-gold/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {scraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scraping…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Scrape
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {previewError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-tl-rose/8 border border-tl-rose/25 text-xs">
                <AlertCircle className="w-4 h-4 text-tl-rose mt-0.5 shrink-0" />
                <p className="text-[var(--tl-text-primary)] flex-1 whitespace-pre-line">{previewError}</p>
                <button
                  onClick={() => setPreviewError('')}
                  className="p-1 -m-1 text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)]"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Preview list ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {preview && (
          <motion.section
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-6 rounded-2xl border border-tl-teal/30 bg-gradient-to-br from-tl-teal/5 via-transparent to-transparent overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-tl-teal/20 flex-wrap">
              <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--tl-text-primary)] truncate">
                  {preview.jobs.length} job{preview.jobs.length === 1 ? '' : 's'} extracted from this page
                </p>
                <p className="text-[11px] text-[var(--tl-text-secondary)] truncate">
                  {preview.source} · {preview.pagesVisited} page{preview.pagesVisited === 1 ? '' : 's'}
                  {preview.jobLinksFound > 0 ? ` · ${preview.jobLinksFound} job link${preview.jobLinksFound === 1 ? '' : 's'} crawled` : ''}
                </p>
                {saveSummary && (
                  <p className="text-[11px] text-tl-teal mt-0.5 font-medium">
                    Saved {saveSummary.saved} · Skipped {saveSummary.skipped} duplicate{saveSummary.skipped === 1 ? '' : 's'}
                  </p>
                )}
              </div>
              {preview.jobs.length > 0 && (
                <button
                  onClick={handleAddAll}
                  disabled={saveAllRunning || savedIds.size === preview.jobs.length}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-teal text-white text-xs font-semibold hover:bg-tl-teal/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {saveAllRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {savedIds.size === preview.jobs.length ? 'All added' : `Add all (${preview.jobs.length - savedIds.size})`}
                </button>
              )}
              <button
                onClick={dismissPreview}
                className="p-1.5 rounded-lg text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] hover:bg-tl-bg-elevated transition-colors shrink-0"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {preview.warning && preview.jobs.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--tl-text-secondary)]">
                {preview.warning}
              </div>
            ) : (
              <ul className="divide-y divide-tl-border-subtle">
                {preview.jobs.map((j, idx) => {
                  const isSaving = savingIds.has(idx)
                  const isSaved = savedIds.has(idx)
                  return (
                    <motion.li
                      key={`${j.title}-${idx}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                      className="px-4 sm:px-5 py-3.5 flex items-start gap-3 hover:bg-tl-bg-elevated/40 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4 text-tl-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--tl-text-primary)]">
                          {j.title}
                        </p>
                        <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5">
                          {j.company}
                          {j.location ? ` · ${j.location}` : ''}
                          {j.salary ? ` · ` : ''}
                          {j.salary && <span className="text-tl-teal font-medium font-mono">{j.salary}</span>}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {j.remote && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-tl-teal/10 text-tl-teal border border-tl-teal/30">
                              <Wifi className="w-2.5 h-2.5" /> Remote
                            </span>
                          )}
                          {j.jobType && (
                            <span className="inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)] capitalize">
                              {j.jobType}
                            </span>
                          )}
                          {(j.skills ?? []).slice(0, 5).map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]"
                            >
                              {s}
                            </span>
                          ))}
                          {(j.skills ?? []).length > 5 && (
                            <span className="text-[10px] text-[var(--tl-text-secondary)]">
                              +{(j.skills ?? []).length - 5}
                            </span>
                          )}
                        </div>
                        {j.description && (
                          <p className="text-[11px] text-[var(--tl-text-secondary)] mt-1.5 leading-snug line-clamp-2">
                            {j.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {j.url && (
                          <a
                            href={j.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[var(--tl-text-secondary)] hover:text-tl-gold transition-colors"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => handleAddOne(idx)}
                          disabled={isSaving || isSaved}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors',
                            isSaved
                              ? 'bg-tl-teal/10 text-tl-teal border border-tl-teal/30 cursor-default'
                              : 'bg-tl-gold text-tl-bg-base hover:bg-tl-gold/90 disabled:opacity-50 disabled:cursor-not-allowed',
                          )}
                        >
                          {isSaved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Added
                            </>
                          ) : isSaving ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" /> Add
                            </>
                          )}
                        </button>
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── Filter bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, company, skills…"
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] text-sm text-[var(--tl-text-primary)] focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
          className="py-2 px-3 rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] text-sm text-[var(--tl-text-primary)] focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30"
        >
          <option value="">All sources</option>
          {knownSources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--tl-border-default)] bg-[var(--tl-bg-surface)] cursor-pointer hover:border-tl-gold/40 transition-colors">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="accent-tl-gold w-4 h-4"
          />
          <Wifi className="w-3.5 h-3.5 text-tl-teal" />
          <span className="text-sm text-[var(--tl-text-primary)]">Remote only</span>
        </label>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-tl-rose/80 hover:text-tl-rose font-medium"
          >
            Clear filters · {activeFilterCount}
          </button>
        )}

        <button
          onClick={load}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--tl-border-default)] text-sm text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] hover:border-tl-gold/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* ─── List ────────────────────────────────────────────────────────── */}
      {error ? (
        <div className="py-16 text-center">
          <p className="text-tl-rose text-sm">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-tl-gold hover:underline">Retry</button>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="tl-card p-4 animate-pulse h-[72px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="tl-card py-16 flex flex-col items-center text-center px-6">
          <Globe className="w-10 h-10 mb-3 text-[var(--tl-text-secondary)] opacity-30" />
          <p className="text-sm font-medium text-[var(--tl-text-primary)]">
            {jobs.length === 0 ? 'No scraped jobs yet' : 'No jobs match your filters'}
          </p>
          <p className="text-xs text-[var(--tl-text-secondary)] mt-1 max-w-md">
            {jobs.length === 0
              ? 'Paste a job URL above to preview jobs with AI, then click Add to save them here.'
              : 'Try clearing filters or searching for something else.'}
          </p>
          {jobs.length > 0 && activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 text-xs text-tl-gold hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } }}
          className="space-y-2"
        >
          {filtered.map((job, i) => {
            const id = String(job.jobId ?? job.pk ?? job.id ?? i)
            const salary = job.salary ?? job.salaryRange
            const posted = job.postedAt ?? job.scrapedAt ?? job.createdAt
            return (
              <motion.li
                key={id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                className="tl-card px-4 sm:px-5 py-3.5 hover:border-tl-gold/30 transition-colors flex items-center gap-3 sm:gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-tl-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[var(--tl-text-primary)] truncate">
                      {job.title ?? 'Untitled job'}
                    </p>
                    <SourceBadge source={job.source} />
                    {job.remote && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-tl-teal/10 text-tl-teal border border-tl-teal/30">
                        <Wifi className="w-2.5 h-2.5" /> Remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--tl-text-secondary)] flex-wrap">
                    <span className="font-medium">{job.company ?? '—'}</span>
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {job.location}
                      </span>
                    )}
                    {salary && (
                      <span className="text-tl-teal font-medium font-mono">{salary}</span>
                    )}
                    {posted && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {timeAgo(posted)}
                      </span>
                    )}
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {job.skills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]"
                        >
                          {s}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-[10px] text-[var(--tl-text-secondary)]">
                          +{job.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--tl-border-default)] text-xs font-medium text-[var(--tl-text-primary)] hover:border-tl-gold/40 hover:text-tl-gold transition-colors shrink-0"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.li>
            )
          })}
        </motion.ul>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--tl-border-default)] text-sm text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] hover:border-tl-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-[var(--tl-text-secondary)] font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--tl-border-default)] text-sm text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] hover:border-tl-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
