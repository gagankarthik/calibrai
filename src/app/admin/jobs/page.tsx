'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Zap, RefreshCw, Globe, MapPin, DollarSign,
  Briefcase, CheckSquare, Square, UploadCloud, ChevronLeft,
  ChevronRight, ExternalLink, Database, Layers,
} from 'lucide-react'

interface ScrapedJob {
  jobId: string
  title: string
  company: string
  location: string
  salaryRange?: string
  skills: string[]
  url: string
  description: string
  remote: boolean
  source: string
}

interface PublishedJob {
  jobId: string
  title: string
  company?: { name?: string }
  location?: string
  skills?: string[]
  sourceUrl?: string
  postedAt?: string
}

type Tab = 'scrape' | 'published'

function JobSourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase">
      <Globe className="w-2.5 h-2.5" />
      hiring.cafe
    </span>
  )
}

export default function AdminJobsPage() {
  const [tab, setTab] = useState<Tab>('scrape')
  const [keywords, setKeywords] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [publishing, setPublishing] = useState(false)
  const [publishedCount, setPublishedCount] = useState(0)
  const [scrapedAt, setScrapedAt] = useState<Date | null>(null)

  const [publishedJobs, setPublishedJobs] = useState<PublishedJob[]>([])
  const [publishedTotal, setPublishedTotal] = useState(0)
  const [loadingPublished, setLoadingPublished] = useState(false)
  const [pubPage, setPubPage] = useState(1)
  const PUB_LIMIT = 20

  const loadPublished = useCallback(async () => {
    setLoadingPublished(true)
    try {
      const res = await fetch('/api/admin/jobs/publish')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { jobs: PublishedJob[]; total: number }
      setPublishedJobs(data.jobs ?? [])
      setPublishedTotal(data.total ?? 0)
    } catch {
      // ignore
    } finally {
      setLoadingPublished(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'published') loadPublished()
  }, [tab, loadPublished])

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    setScraping(true)
    setScrapedJobs([])
    setSelected(new Set())
    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean)
      const res = await fetch('/api/admin/scrape/hiring-cafe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kws, limit: 40 }),
      })
      const data = await res.json() as { jobs: ScrapedJob[]; count: number }
      setScrapedJobs(data.jobs ?? [])
      setScrapedAt(new Date())
    } catch {
      // ignore
    } finally {
      setScraping(false)
    }
  }

  async function handlePublish() {
    const toPublish = scrapedJobs.filter(j => selected.has(j.jobId))
    if (toPublish.length === 0) return
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/jobs/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobs: toPublish.map(j => ({
            title: j.title,
            company: j.company,
            location: j.location,
            salary: j.salaryRange,
            skills: j.skills,
            description: j.description,
            url: j.url,
            remote: j.remote,
          })),
        }),
      })
      const data = await res.json() as { published: number }
      setPublishedCount(prev => prev + (data.published ?? 0))
      // Remove published jobs from scraped list
      setScrapedJobs(prev => prev.filter(j => !selected.has(j.jobId)))
      setSelected(new Set())
    } catch {
      // ignore
    } finally {
      setPublishing(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set(scrapedJobs.map(j => j.jobId)))
  const clearAll = () => setSelected(new Set())

  const pubPages = Math.max(1, Math.ceil(publishedTotal / PUB_LIMIT))
  const pubSlice = publishedJobs.slice((pubPage - 1) * PUB_LIMIT, pubPage * PUB_LIMIT)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">Jobs Board</h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            Scrape from hiring.cafe and publish jobs to the public board
          </p>
        </div>
        {publishedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tl-teal/8 border border-tl-teal/20 text-tl-teal text-sm font-medium">
            <Database className="w-4 h-4" />
            {publishedCount} published this session
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-[var(--tl-bg-elevated)] w-fit border border-[var(--tl-border-subtle)]">
        {(['scrape', 'published'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? 'bg-[var(--tl-bg-surface)] text-[var(--tl-text-primary)] shadow-sm border border-[var(--tl-border-subtle)]'
                : 'text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)]'
            }`}
          >
            {t === 'scrape' ? (
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />Scrape Jobs</span>
            ) : (
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />Published ({publishedTotal})</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'scrape' ? (
          <motion.div key="scrape" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Scrape form */}
            <form onSubmit={handleScrape} className="tl-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--tl-text-primary)]">Scrape from hiring.cafe</p>
                  <p className="text-xs text-[var(--tl-text-secondary)]">Enter keywords to search, or leave blank for latest jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
                  <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="Keywords (comma separated): react, senior, typescript…"
                    className="input-field pl-10 py-2.5 w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={scraping}
                  className="btn-gold flex items-center gap-2 text-sm shrink-0 disabled:opacity-50"
                >
                  {scraping ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {scraping ? 'Scraping…' : 'Scrape Now'}
                </button>
              </div>
            </form>

            {/* Results toolbar */}
            {scrapedJobs.length > 0 && (
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--tl-text-secondary)]">
                    <span className="font-semibold text-[var(--tl-text-primary)]">{scrapedJobs.length}</span> jobs found
                    {scrapedAt && <span className="ml-1.5 opacity-60">· {scrapedAt.toLocaleTimeString()}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selected.size > 0 && (
                    <span className="text-xs text-tl-gold font-medium">{selected.size} selected</span>
                  )}
                  <button onClick={selectAll} className="btn-ghost text-xs py-1.5 flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5" /> Select All
                  </button>
                  {selected.size > 0 && (
                    <>
                      <button onClick={clearAll} className="btn-ghost text-xs py-1.5 flex items-center gap-1">
                        <Square className="w-3.5 h-3.5" /> Clear
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="btn-gold text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {publishing ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        Publish {selected.size} to Board
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Job cards */}
            {scraping ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="tl-card p-5 animate-pulse">
                    <div className="h-4 w-3/4 bg-[var(--tl-bg-elevated)] rounded mb-3" />
                    <div className="h-3 w-1/2 bg-[var(--tl-bg-elevated)] rounded mb-2" />
                    <div className="h-3 w-2/3 bg-[var(--tl-bg-elevated)] rounded" />
                  </div>
                ))}
              </div>
            ) : scrapedJobs.length === 0 ? (
              <div className="py-20 text-center">
                <Globe className="w-10 h-10 mx-auto mb-3 text-[var(--tl-text-secondary)] opacity-30" />
                <p className="text-[var(--tl-text-secondary)] text-sm">Enter keywords and click &ldquo;Scrape Now&rdquo; to pull jobs from hiring.cafe</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {scrapedJobs.map(job => {
                  const isSelected = selected.has(job.jobId)
                  return (
                    <motion.div
                      key={job.jobId}
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      onClick={() => toggleSelect(job.jobId)}
                      className={`tl-card p-5 flex flex-col gap-3 cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'border-tl-gold/50 bg-tl-gold/3'
                          : 'hover:border-[var(--tl-border-default)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all ${isSelected ? 'bg-tl-gold/15 border-tl-gold/40' : 'bg-[var(--tl-bg-elevated)] border-[var(--tl-border-subtle)]'}`}>
                          {isSelected
                            ? <CheckSquare className="w-4 h-4 text-tl-gold" />
                            : <Briefcase className="w-4 h-4 text-[var(--tl-text-secondary)]" />
                          }
                        </div>
                        <JobSourceBadge />
                      </div>

                      <div>
                        <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] line-clamp-2 leading-snug">
                          {job.title}
                        </h3>
                        <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5">{job.company}</p>
                      </div>

                      <div className="space-y-1">
                        {job.location && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--tl-text-secondary)]">
                            <MapPin className="w-3 h-3 shrink-0" />{job.location}
                          </div>
                        )}
                        {job.salaryRange && (
                          <div className="flex items-center gap-1.5 text-xs text-tl-teal font-medium">
                            <DollarSign className="w-3 h-3 shrink-0" />{job.salaryRange}
                          </div>
                        )}
                      </div>

                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 4).map(s => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]">
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="text-[10px] text-[var(--tl-text-secondary)]">+{job.skills.length - 4}</span>
                          )}
                        </div>
                      )}

                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="mt-auto flex items-center gap-1 btn-ghost text-xs py-1.5 justify-center"
                        >
                          <ExternalLink className="w-3 h-3" /> View on hiring.cafe
                        </a>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="published" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--tl-text-secondary)]">
                <span className="text-[var(--tl-text-primary)] font-semibold">{publishedTotal}</span> jobs published to the public board
              </p>
              <button onClick={loadPublished} disabled={loadingPublished} className="btn-ghost flex items-center gap-1.5 text-sm">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPublished ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loadingPublished ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="tl-card p-5 animate-pulse">
                    <div className="h-4 w-3/4 bg-[var(--tl-bg-elevated)] rounded mb-3" />
                    <div className="h-3 w-1/2 bg-[var(--tl-bg-elevated)] rounded" />
                  </div>
                ))}
              </div>
            ) : pubSlice.length === 0 ? (
              <div className="py-20 text-center">
                <Database className="w-10 h-10 mx-auto mb-3 text-[var(--tl-text-secondary)] opacity-30" />
                <p className="text-[var(--tl-text-secondary)] text-sm">No jobs published yet. Scrape and publish jobs from the Scrape tab.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pubSlice.map(job => (
                  <div key={job.jobId} className="tl-card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-tl-teal" />
                      </div>
                      <JobSourceBadge />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] line-clamp-2 leading-snug">{job.title}</h3>
                      <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5">{job.company?.name ?? '—'}</p>
                    </div>
                    {job.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--tl-text-secondary)]">
                        <MapPin className="w-3 h-3 shrink-0" />{job.location}
                      </div>
                    )}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    {job.sourceUrl && (
                      <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="mt-auto flex items-center gap-1 btn-ghost text-xs py-1.5 justify-center">
                        <ExternalLink className="w-3 h-3" /> View Original
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {pubPages > 1 && !loadingPublished && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button onClick={() => setPubPage(p => Math.max(1, p - 1))} disabled={pubPage === 1}
                  className="flex items-center gap-1.5 btn-ghost text-sm disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm text-[var(--tl-text-secondary)]">{pubPage} / {pubPages}</span>
                <button onClick={() => setPubPage(p => Math.min(pubPages, p + 1))} disabled={pubPage === pubPages}
                  className="flex items-center gap-1.5 btn-ghost text-sm disabled:opacity-30">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
