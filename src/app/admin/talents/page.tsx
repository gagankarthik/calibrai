'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface Talent {
  candidateId?: string
  id?: string
  name?: string
  fullName?: string
  headline?: string
  title?: string
  skills?: string[]
  location?: string
  applicationCount?: number
  createdAt?: string
}

function formatDate(val: string | undefined): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return val }
}

function SkillTags({ skills }: { skills: string[] | undefined }) {
  const list = skills ?? []
  const visible = list.slice(0, 3)
  const extra = list.length - visible.length
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((s) => (
        <span
          key={s}
          className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--tl-bg-elevated)] text-[var(--tl-text-secondary)] border border-[var(--tl-border-subtle)]"
        >
          {s}
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[10px] text-[var(--tl-text-secondary)]">+{extra}</span>
      )}
      {list.length === 0 && <span className="text-xs text-[var(--tl-text-secondary)]">—</span>}
    </div>
  )
}

export default function AdminTalents() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/talents?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { talents: Talent[]; total: number }
      setTalents(data.talents ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to load talents.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">Talent Profiles</h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            {total} talent profiles on the platform
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

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tl-text-secondary)]" />
          <input
            type="text"
            placeholder="Search by name, headline, or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9 pr-24"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold text-xs px-3 py-1.5">
            Search
          </button>
        </div>
      </form>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="tl-card p-0 overflow-hidden"
      >
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-2 border-tl-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-tl-rose text-sm">{error}</p>
            <button onClick={load} className="btn-ghost mt-3 text-sm">Retry</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--tl-border-subtle)] bg-[var(--tl-bg-elevated)]/50">
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-6 py-3">Name</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Headline</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden md:table-cell">Skills</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Location</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden xl:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tl-border-subtle)]">
                  {talents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-[var(--tl-text-secondary)]">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No talent profiles found
                      </td>
                    </tr>
                  ) : (
                    talents.map((t, i) => (
                      <motion.tr
                        key={String(t.candidateId ?? t.id ?? i)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[var(--tl-bg-elevated)]/50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-tl-teal">
                                {String(t.name ?? t.fullName ?? '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-[var(--tl-text-primary)] truncate max-w-[130px]">
                              {String(t.name ?? t.fullName ?? '—')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-[var(--tl-text-secondary)] truncate max-w-[180px]">
                          {String(t.headline ?? t.title ?? '—')}
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <SkillTags skills={t.skills} />
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {t.location ? (
                            <div className="flex items-center gap-1 text-xs text-[var(--tl-text-secondary)]">
                              <MapPin className="w-3 h-3" />
                              {t.location}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--tl-text-secondary)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden xl:table-cell text-xs text-[var(--tl-text-secondary)]">
                          {formatDate(t.createdAt)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--tl-border-subtle)]">
                <p className="text-xs text-[var(--tl-text-secondary)]">
                  Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-[var(--tl-text-secondary)] px-2">{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
