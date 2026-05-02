'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Globe,
  MapPin,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Search,
} from 'lucide-react'

interface CrmJob {
  jobId?: string
  id?: string
  title?: string
  company?: string
  location?: string
  salary?: string
  source?: string
  skills?: string[]
  url?: string
  description?: string
  createdAt?: string
}

const SOURCE_OPTIONS = ['', 'remoteok', 'linkedin', 'indeed', 'greenhouse']

function SourceBadge({ source }: { source: string | undefined }) {
  const s = (source ?? '').toLowerCase()
  const styles: Record<string, string> = {
    remoteok: 'bg-tl-teal/10 text-tl-teal border-tl-teal/20',
    linkedin: 'bg-tl-blue/10 text-tl-blue border-tl-blue/20',
    indeed: 'bg-tl-gold/10 text-tl-gold border-tl-gold/20',
    greenhouse: 'bg-purple-100 text-purple-600 border-purple-200',
  }
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${styles[s] ?? 'bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border-[var(--tl-border-subtle)]'}`}>
      {source ?? 'unknown'}
    </span>
  )
}

export default function AdminCrmJobs() {
  const [jobs, setJobs] = useState<CrmJob[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapeKeywords, setScrapeKeywords] = useState('')
  const [showScrapeInput, setShowScrapeInput] = useState(false)
  const LIMIT = 24

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (source) params.set('source', source)
      const res = await fetch(`/api/admin/crm/jobs?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { jobs: CrmJob[]; total: number }
      setJobs(data.jobs ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to load CRM jobs.')
    } finally {
      setLoading(false)
    }
  }, [page, source])

  useEffect(() => { load() }, [load])

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    setScraping(true)
    try {
      await fetch('/api/crm/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: scrapeKeywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      })
      await load()
      setShowScrapeInput(false)
      setScrapeKeywords('')
    } catch {
      // ignore
    } finally {
      setScraping(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">CRM — Scraped Jobs</h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            {total} jobs scraped from external sources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load()}
            disabled={loading}
            className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowScrapeInput((s) => !s)}
            className="btn-gold flex items-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            Trigger Scrape
          </button>
        </div>
      </motion.div>

      {/* Scrape form */}
      {showScrapeInput && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleScrape}
          className="tl-card-gold p-4 mb-6 flex items-center gap-3 flex-wrap"
        >
          <Search className="w-4 h-4 text-tl-gold shrink-0" />
          <input
            type="text"
            value={scrapeKeywords}
            onChange={(e) => setScrapeKeywords(e.target.value)}
            placeholder="Comma-separated keywords (e.g., react, senior engineer, python)…"
            className="input-field flex-1 min-w-0 py-2"
            required
          />
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
            {scraping ? 'Scraping…' : 'Run Scrape'}
          </button>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wider">
          Source:
        </span>
        {SOURCE_OPTIONS.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setSource(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              source === s
                ? 'bg-tl-gold/15 text-tl-gold border border-tl-gold/30'
                : 'text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] border border-[var(--tl-border-subtle)] hover:border-[var(--tl-border-default)]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tl-card p-5 animate-pulse">
              <div className="h-4 w-3/4 bg-[var(--tl-bg-elevated)] rounded mb-3" />
              <div className="h-3 w-1/2 bg-[var(--tl-bg-elevated)] rounded mb-2" />
              <div className="h-3 w-2/3 bg-[var(--tl-bg-elevated)] rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-tl-rose text-sm">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 text-sm">Retry</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center">
          <Globe className="w-10 h-10 mx-auto mb-3 text-[var(--tl-text-secondary)] opacity-30" />
          <p className="text-[var(--tl-text-secondary)]">No scraped jobs found. Trigger a scrape above.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {jobs.map((job, i) => (
            <motion.div
              key={String(job.jobId ?? job.id ?? i)}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="tl-card p-5 flex flex-col gap-3 hover:border-tl-gold/30 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-tl-gold" />
                </div>
                <SourceBadge source={job.source} />
              </div>

              <div>
                <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] line-clamp-2 leading-snug">
                  {job.title ?? 'Untitled Job'}
                </h3>
                <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5">
                  {job.company ?? '—'}
                </p>
              </div>

              <div className="space-y-1.5">
                {job.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--tl-text-secondary)]">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center gap-1.5 text-xs text-tl-teal font-medium">
                    <DollarSign className="w-3 h-3" />
                    {job.salary}
                  </div>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]"
                    >
                      {s}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="text-[10px] text-[var(--tl-text-secondary)]">+{job.skills.length - 3}</span>
                  )}
                </div>
              )}

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto btn-ghost text-xs py-1.5 text-center"
                >
                  View Listing
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 btn-ghost text-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-[var(--tl-text-secondary)]">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 btn-ghost text-sm disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
