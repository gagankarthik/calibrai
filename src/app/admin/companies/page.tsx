'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Building2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

interface Company {
  companyId?: string
  id?: string
  name?: string
  companyName?: string
  email?: string
  plan?: string
  jobsPosted?: number
  createdAt?: string
}

function PlanBadge({ plan }: { plan: string | undefined }) {
  const p = (plan ?? 'starter').toLowerCase()
  const styles: Record<string, string> = {
    starter: 'bg-tl-blue/10 text-tl-blue border-tl-blue/20',
    growth: 'bg-tl-teal/10 text-tl-teal border-tl-teal/20',
    enterprise: 'bg-tl-gold/10 text-tl-gold border-tl-gold/20',
  }
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${styles[p] ?? styles.starter}`}>
      {p}
    </span>
  )
}

function formatDate(val: string | undefined): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return val }
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
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
      const res = await fetch(`/api/admin/companies?${params}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { companies: Company[]; total: number }
      setCompanies(data.companies ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setError('Failed to load companies.')
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl text-[var(--tl-text-primary)]">Companies</h1>
          <p className="text-sm text-[var(--tl-text-secondary)] mt-1">
            {total} companies registered on TalentBridge
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
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field pl-9 pr-24"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-gold text-xs px-3 py-1.5"
          >
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
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-6 py-3">Company</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3">Plan</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden md:table-cell">Jobs</th>
                    <th className="text-left text-[10px] font-semibold text-[var(--tl-text-secondary)] uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tl-border-subtle)]">
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-[var(--tl-text-secondary)]">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companies.map((c, i) => (
                      <motion.tr
                        key={String(c.companyId ?? c.id ?? i)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-[var(--tl-bg-elevated)]/50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-tl-gold">
                                {String(c.name ?? c.companyName ?? '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-[var(--tl-text-primary)] truncate max-w-[160px]">
                              {String(c.name ?? c.companyName ?? '—')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-[var(--tl-text-secondary)] text-xs truncate max-w-[180px]">
                          {String(c.email ?? '—')}
                        </td>
                        <td className="px-4 py-3.5">
                          <PlanBadge plan={c.plan} />
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell font-mono text-[var(--tl-text-primary)]">
                          {c.jobsPosted ?? 0}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-[var(--tl-text-secondary)]">
                          {formatDate(c.createdAt)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  <span className="text-xs text-[var(--tl-text-secondary)] px-2">
                    {page} / {totalPages}
                  </span>
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
