'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  UserRound,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface DiscoveredCandidate {
  candidateId?: string
  id?: string
  name?: string
  fullName?: string
  title?: string
  headline?: string
  skills?: string[]
  source?: string
  profileUrl?: string
  avatarUrl?: string
  location?: string
  createdAt?: string
}

const SOURCE_OPTIONS = ['', 'github', 'linkedin', 'twitter', 'portfolio']

function SourceBadge({ source }: { source: string | undefined }) {
  const s = (source ?? '').toLowerCase()
  const styles: Record<string, string> = {
    github: 'bg-gray-100 text-gray-700 border-gray-200',
    linkedin: 'bg-tl-blue/10 text-tl-blue border-tl-blue/20',
    twitter: 'bg-sky-50 text-sky-600 border-sky-200',
    portfolio: 'bg-tl-gold/10 text-tl-gold border-tl-gold/20',
  }
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${styles[s] ?? 'bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border-[var(--tl-border-subtle)]'}`}>
      {source ?? 'unknown'}
    </span>
  )
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-[var(--tl-border-subtle)]"
      />
    )
  }
  const initials = name
    .split(' ')
    .map((n) => n[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-tl-teal">{initials || '?'}</span>
    </div>
  )
}

export default function AdminCrmCandidates() {
  const [candidates, setCandidates] = useState<DiscoveredCandidate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const LIMIT = 24

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (source) params.set('source', source)
      const res = await fetch(`/api/admin/crm/candidates?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { candidates: DiscoveredCandidate[]; total: number }
      setCandidates(data.candidates ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to load CRM candidates.')
    } finally {
      setLoading(false)
    }
  }, [page, source])

  useEffect(() => { load() }, [load])

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
          <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">CRM — Discovered Candidates</h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            {total} candidates discovered from external sources
          </p>
        </div>
        <button
          onClick={() => load()}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Source filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wider">Source:</span>
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

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tl-card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[var(--tl-bg-elevated)]" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-[var(--tl-bg-elevated)] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-[var(--tl-bg-elevated)] rounded" />
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-5 w-12 bg-[var(--tl-bg-elevated)] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-tl-rose text-sm">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 text-sm">Retry</button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="py-20 text-center">
          <UserRound className="w-10 h-10 mx-auto mb-3 text-[var(--tl-text-secondary)] opacity-30" />
          <p className="text-[var(--tl-text-secondary)]">No discovered candidates yet.</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {candidates.map((c, i) => {
            const name = String(c.name ?? c.fullName ?? 'Unknown')
            const headline = String(c.headline ?? c.title ?? '')
            return (
              <motion.div
                key={String(c.candidateId ?? c.id ?? i)}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                className="tl-card p-5 flex flex-col gap-3 hover:border-tl-gold/30 transition-all"
              >
                {/* Avatar + source */}
                <div className="flex items-start justify-between">
                  <Avatar name={name} avatarUrl={c.avatarUrl} />
                  <SourceBadge source={c.source} />
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-semibold text-sm text-[var(--tl-text-primary)]">{name}</h3>
                  {headline && (
                    <p className="text-xs text-[var(--tl-text-secondary)] mt-0.5 line-clamp-2">{headline}</p>
                  )}
                  {c.location && (
                    <p className="text-[10px] text-[var(--tl-text-secondary)] mt-1">
                      {c.location}
                    </p>
                  )}
                </div>

                {/* Skills */}
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]"
                      >
                        {s}
                      </span>
                    ))}
                    {c.skills.length > 4 && (
                      <span className="text-[10px] text-[var(--tl-text-secondary)]">+{c.skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Profile link */}
                {c.profileUrl && (
                  <a
                    href={c.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto btn-ghost text-xs py-1.5 flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </a>
                )}
              </motion.div>
            )
          })}
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
