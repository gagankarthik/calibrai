'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Briefcase, ExternalLink, RefreshCw, MapPin, DollarSign,
  Tag, Loader2, X, ChevronDown, ChevronUp, Globe, Zap,
} from 'lucide-react'

interface CrmJob {
  jobId: string
  title: string
  company: string
  location: string
  salaryRange?: string
  description: string
  requirements: string[]
  skills: string[]
  url: string
  source: 'remoteok' | 'linkedin' | 'remotive' | 'ycombinator'
  jobType: string
  remote: boolean
  scrapedAt: string
  postedAt?: string
}

const SOURCE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  remoteok:    { label: 'RemoteOK',      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  linkedin:    { label: 'LinkedIn',      color: '#0a66c2', bg: 'rgba(10,102,194,0.1)' },
  remotive:    { label: 'Remotive',      color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  ycombinator: { label: 'HN Jobs',       color: '#f43f5e', bg: 'rgba(244,63,94,0.1)'  },
}

function JobCard({ job }: { job: CrmJob }) {
  const [expanded, setExpanded] = useState(false)
  const badge = SOURCE_BADGE[job.source] ?? { label: job.source, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' }

  return (
    <motion.div
      layout
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-default transition-shadow duration-200"
      style={{
        background: 'var(--tl-bg-surface)',
        border: '1px solid var(--tl-border-subtle)',
        boxShadow: '0 1px 3px rgba(17,24,39,0.05)',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(17,24,39,0.1)' }}
    >
      {/* Source + remote badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.label}
        </span>
        {job.remote && (
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
          >
            Remote
          </span>
        )}
        {job.salaryRange && (
          <span
            className="ml-auto flex items-center gap-1 text-xs font-semibold"
            style={{ color: '#10b981' }}
          >
            <DollarSign className="w-3 h-3" />
            {job.salaryRange}
          </span>
        )}
      </div>

      {/* Title + company */}
      <div>
        <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--tl-text-primary)' }}>
          {job.title}
        </h3>
        <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--tl-text-secondary)' }}>
          <Briefcase className="w-3 h-3 shrink-0" />
          {job.company}
          <span className="mx-1 opacity-40">·</span>
          <MapPin className="w-3 h-3 shrink-0" />
          {job.location}
        </p>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 6).map(s => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: 'var(--tl-bg-elevated)',
                border: '1px solid var(--tl-border-subtle)',
                color: 'var(--tl-text-secondary)',
              }}
            >
              {s}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="text-[10px]" style={{ color: 'var(--tl-text-tertiary)' }}>
              +{job.skills.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Expandable description */}
      {job.description && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: 'var(--tl-text-tertiary)' }}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs leading-relaxed"
                style={{ color: 'var(--tl-text-secondary)', overflow: 'hidden' }}
              >
                {job.description}
              </motion.p>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t" style={{ borderColor: 'var(--tl-border-subtle)' }}>
        <span className="text-[10px]" style={{ color: 'var(--tl-text-tertiary)' }}>
          {job.scrapedAt ? new Date(job.scrapedAt).toLocaleDateString() : '—'}
        </span>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
          >
            View Job
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function CrmJobsPage() {
  const [jobs, setJobs] = useState<CrmJob[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [keywords, setKeywords] = useState('React, TypeScript, Next.js')
  const [location, setLocation] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'remoteok' | 'linkedin' | 'remotive' | 'ycombinator'>('all')
  const [showForm, setShowForm] = useState(false)
  const [lastScrapeCount, setLastScrapeCount] = useState<number | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      const res = await fetch(`/api/crm/jobs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setJobs(Array.isArray(data) ? data : [])
      }
    } catch { /* non-fatal */ }
  }, [sourceFilter])

  useEffect(() => {
    fetchJobs().finally(() => setInitialLoading(false))
  }, [fetchJobs])

  const handleScrape = async () => {
    setLoading(true)
    setLastScrapeCount(null)
    try {
      const kwArray = keywords.split(',').map(k => k.trim()).filter(Boolean)
      const res = await fetch('/api/crm/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kwArray, location: location || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setLastScrapeCount(data.scraped ?? 0)
        await fetchJobs()
        setShowForm(false)
      }
    } catch { /* non-fatal */ } finally {
      setLoading(false)
    }
  }

  // Client-side filter (API also filters, this handles immediate UI updates)
  const visible = jobs.filter(j => sourceFilter === 'all' || j.source === sourceFilter)

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--tl-text-primary)' }}>
            Job Discovery
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tl-text-secondary)' }}>
            Jobs scraped from RemoteOK, Remotive, HN Jobs, and LinkedIn
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {lastScrapeCount !== null && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              +{lastScrapeCount} jobs found
            </span>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,0.35)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            Scrape Jobs
          </button>
        </div>
      </div>

      {/* Scrape form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'var(--tl-bg-surface)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--tl-text-primary)' }}>
                Configure Scrape
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" style={{ color: 'var(--tl-text-tertiary)' }} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tl-text-secondary)' }}>
                  Keywords (comma-separated)
                </label>
                <input
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="React, TypeScript, Next.js"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--tl-bg-elevated)',
                    border: '1px solid var(--tl-border-default)',
                    color: 'var(--tl-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tl-text-secondary)' }}>
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, Remote, New York…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--tl-bg-elevated)',
                    border: '1px solid var(--tl-border-default)',
                    color: 'var(--tl-text-primary)',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleScrape}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Scraping…' : 'Run Scrape'}
              </button>
              <p className="text-xs" style={{ color: 'var(--tl-text-tertiary)' }}>
                Fetches RemoteOK + Remotive + HN Jobs APIs + LinkedIn via Playwright (~30s)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        {([
          { key: 'all',         label: `All (${jobs.length})` },
          { key: 'remoteok',    label: `RemoteOK (${jobs.filter(j => j.source === 'remoteok').length})` },
          { key: 'remotive',    label: `Remotive (${jobs.filter(j => j.source === 'remotive').length})` },
          { key: 'ycombinator', label: `HN Jobs (${jobs.filter(j => j.source === 'ycombinator').length})` },
          { key: 'linkedin',    label: `LinkedIn (${jobs.filter(j => j.source === 'linkedin').length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSourceFilter(key)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={
              sourceFilter === key
                ? { background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }
                : { color: 'var(--tl-text-secondary)', border: '1px solid transparent' }
            }
          >
            {label}
          </button>
        ))}

        <button
          onClick={() => fetchJobs()}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--tl-text-tertiary)' }}
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Content */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366f1' }} />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(99,102,241,0.08)' }}
          >
            <Globe className="w-7 h-7" style={{ color: '#6366f1' }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
            No jobs yet
          </h3>
          <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--tl-text-secondary)' }}>
            Click &ldquo;Scrape Jobs&rdquo; to discover live listings from the internet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Zap className="w-4 h-4" />
            Scrape Jobs Now
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {visible.map((job, i) => (
              <motion.div
                key={job.jobId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
