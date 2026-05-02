'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = 'success' | 'warning' | 'error'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  resourceId: string
  ip: string
  status: Status
  details: string
  newValue?: Record<string, unknown>
  oldValue?: Record<string, unknown>
}

// ─── Normalise raw DynamoDB items → AuditEntry ────────────────────────────────

function buildDetails(item: Record<string, unknown>): string {
  const action = String(item.action ?? '')
  const resource = String(item.resource ?? '')
  const nv = item.newValue as Record<string, unknown> | undefined

  if (action === 'auth.signin')  return 'User signed in successfully.'
  if (action === 'auth.signout') return 'User signed out.'
  if (action === 'job.created')  return `Created job posting${nv?.title ? `: "${nv.title}"` : ''}.`
  if (action === 'job.updated')  return `Updated job posting${nv?.title ? `: "${nv.title}"` : ''}.`
  if (action === 'job.deleted')  return `Deleted job posting.`
  if (action === 'profile.updated') return 'Company profile updated.'
  if (action === 'application.status_changed') {
    const prev = (item.oldValue as Record<string, unknown>)?.status
    const next = nv?.status
    return prev && next ? `Application moved from "${prev}" to "${next}".` : 'Application status changed.'
  }
  if (nv && Object.keys(nv).length) return `${resource} ${action}: ${JSON.stringify(nv)}`
  return `${action} on ${resource}.`
}

function inferStatus(item: Record<string, unknown>): Status {
  const action = String(item.action ?? '')
  if (action.endsWith('.failed') || action.endsWith('.error')) return 'error'
  return 'success'
}

function normalizeEntry(item: Record<string, unknown>): AuditEntry {
  return {
    id:         String(item.id ?? ''),
    timestamp:  String(item.createdAt ?? ''),
    user:       String(item.userEmail ?? item.userId ?? 'System'),
    action:     String(item.action ?? ''),
    resource:   String(item.resource ?? ''),
    resourceId: String(item.resourceId ?? ''),
    ip:         String(item.ipAddress ?? '—'),
    status:     inferStatus(item),
    details:    buildDetails(item),
    newValue:   item.newValue as Record<string, unknown> | undefined,
    oldValue:   item.oldValue as Record<string, unknown> | undefined,
  }
}

// ─── Styling helpers ──────────────────────────────────────────────────────────

const ACTION_CATEGORIES = ['All Actions', 'Auth', 'Jobs', 'Applications', 'Settings', 'API']
const PAGE_SIZE = 10

function formatTimestamp(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

function getInitials(name: string) {
  return name.split(/[\s@]+/).slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name: string) {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

function statusConfig(status: Status) {
  switch (status) {
    case 'success': return { icon: CheckCircle2, label: 'Success', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' }
    case 'warning': return { icon: AlertTriangle, label: 'Warning', dot: 'bg-amber-400',  text: 'text-amber-400',  bg: 'bg-amber-400/10'  }
    case 'error':   return { icon: XCircle,       label: 'Error',   dot: 'bg-red-400',    text: 'text-red-400',   bg: 'bg-red-400/10'   }
  }
}

function actionBadgeStyle(action: string) {
  if (action.startsWith('job'))         return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (action.startsWith('application')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  if (action.startsWith('auth'))        return 'bg-green-500/10 text-green-400 border-green-500/20'
  if (action.startsWith('profile') || action.startsWith('settings')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  if (action.startsWith('api'))         return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  return 'bg-white/5 text-slate-400 border-white/10'
}

function matchesCategory(action: string, cat: string): boolean {
  const c = cat.toLowerCase()
  if (c === 'all actions') return true
  if (c === 'auth')         return action.startsWith('auth')
  if (c === 'jobs')         return action.startsWith('job')
  if (c === 'applications') return action.startsWith('application')
  if (c === 'settings')     return action.startsWith('profile') || action.startsWith('settings')
  if (c === 'api')          return action.startsWith('api')
  return true
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [logs, setLogs]               = useState<AuditEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [actionCategory, setActionCategory] = useState('All Actions')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchLogs = () => {
    setLoading(true)
    fetch('/api/company/audit?limit=200')
      .then(r => r.ok ? r.json() : [])
      .then((items: Record<string, unknown>[]) => {
        setLogs(Array.isArray(items) ? items.map(normalizeEntry) : [])
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = useMemo(() => logs.filter(entry => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      entry.user.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.resource.toLowerCase().includes(q) ||
      entry.details.toLowerCase().includes(q)
    const matchStatus   = statusFilter === 'all' || entry.status === statusFilter
    const matchCategory = matchesCategory(entry.action, actionCategory)
    return matchSearch && matchStatus && matchCategory
  }), [logs, search, statusFilter, actionCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(currentPage, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch   = (v: string) => { setSearch(v);           setCurrentPage(1) }
  const handleStatus   = (s: 'all' | Status) => { setStatusFilter(s); setCurrentPage(1) }
  const handleCategory = (c: string) => { setActionCategory(c);   setCurrentPage(1) }

  const successCount = logs.filter(e => e.status === 'success').length
  const successRate  = logs.length ? Math.round((successCount / logs.length) * 100) : 0
  const uniqueUsers  = new Set(logs.map(e => e.user)).size

  const handleExport = () => {
    const header = 'Timestamp,User,Action,Resource,Resource ID,IP,Status\n'
    const rows = filtered.map(e =>
      [e.timestamp, e.user, e.action, e.resource, e.resourceId, e.ip, e.status]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `audit-log-${Date.now()}.csv` })
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit log exported', { description: `${filtered.length} events downloaded` })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-tl-text-primary">Audit Log</h1>
          </div>
          <p className="text-tl-text-secondary text-sm ml-12">All activity for your company account</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2 text-xs" onClick={handleExport} disabled={!filtered.length}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events',   value: loading ? '…' : logs.length,    icon: Shield,       color: 'text-blue-400'   },
          { label: 'Success Rate',   value: loading ? '…' : `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Unique Users',   value: loading ? '…' : uniqueUsers,    icon: Filter,       color: 'text-purple-400' },
          { label: 'Filtered Events',value: loading ? '…' : filtered.length, icon: Search,       color: 'text-orange-400' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="flex items-center gap-3 px-4 py-3 tl-card rounded-xl">
              <Icon className={cn('w-4 h-4 flex-shrink-0', stat.color)} />
              <div>
                <p className="text-tl-text-primary font-semibold text-base leading-tight">{stat.value}</p>
                <p className="text-tl-text-secondary text-xs">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
          <Input
            placeholder="Search by user, action, resource…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 bg-tl-bg-elevated border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary"
          />
        </div>
        <div className="flex gap-1 p-1 bg-tl-bg-elevated border border-tl-border-default rounded-lg">
          {(['all', 'success', 'error'] as const).map(s => (
            <button key={s} onClick={() => handleStatus(s)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-150',
                statusFilter === s
                  ? s === 'all' ? 'bg-tl-bg-surface text-tl-text-primary'
                    : s === 'success' ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                  : 'text-tl-text-secondary hover:text-tl-text-primary'
              )}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative">
          <select value={actionCategory} onChange={e => handleCategory(e.target.value)}
            className="appearance-none bg-tl-bg-elevated border border-tl-border-default text-tl-text-primary text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-tl-gold/50 hover:bg-tl-bg-surface transition-colors">
            {ACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-tl-border-subtle overflow-hidden bg-tl-bg-surface">
        <div className="hidden md:grid grid-cols-[1.6fr_1.4fr_1.4fr_1fr_1fr_0.8fr] gap-3 px-4 py-3 bg-tl-bg-elevated border-b border-tl-border-subtle text-xs font-semibold text-tl-text-secondary uppercase tracking-wider">
          <span>Timestamp</span>
          <span>User</span>
          <span>Action</span>
          <span>Resource</span>
          <span>IP Address</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-tl-border-subtle">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-tl-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading audit log…</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-tl-text-secondary gap-3">
              <Shield className="w-8 h-8 opacity-30" />
              <p className="text-sm">{logs.length === 0 ? 'No audit events recorded yet.' : 'No entries match your filters.'}</p>
            </div>
          ) : (
            paginated.map((entry, i) => {
              const isExpanded = expandedRow === entry.id
              const sc = statusConfig(entry.status)
              return (
                <div key={entry.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    className={cn(
                      'grid grid-cols-1 md:grid-cols-[1.6fr_1.4fr_1.4fr_1fr_1fr_0.8fr] gap-2 md:gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150',
                      isExpanded ? 'bg-tl-bg-elevated' : 'hover:bg-tl-bg-elevated/50'
                    )}
                  >
                    {/* Timestamp */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-tl-text-secondary text-xs font-mono truncate">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    {/* User */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white', getAvatarColor(entry.user))}>
                        {getInitials(entry.user)}
                      </div>
                      <span className="text-tl-text-primary text-sm truncate">{entry.user}</span>
                    </div>
                    {/* Action */}
                    <div className="flex items-center min-w-0">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border truncate', actionBadgeStyle(entry.action))}>
                        {entry.action}
                      </span>
                    </div>
                    {/* Resource */}
                    <div className="flex items-center min-w-0">
                      <span className="text-tl-text-secondary text-sm truncate capitalize">{entry.resource}</span>
                    </div>
                    {/* IP */}
                    <div className="flex items-center min-w-0">
                      <span className="text-tl-text-secondary text-xs font-mono truncate">{entry.ip}</span>
                    </div>
                    {/* Status + chevron */}
                    <div className="flex items-center gap-2">
                      <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', sc.bg, sc.text)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', sc.dot)} />
                        {sc.label}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-tl-text-secondary flex-shrink-0 ml-auto" />
                        : <ChevronDown className="w-3.5 h-3.5 text-tl-text-secondary/40 flex-shrink-0 ml-auto" />
                      }
                    </div>
                  </motion.div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 bg-tl-bg-elevated border-t border-tl-border-subtle"
                    >
                      <div className="mt-3 grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-tl-bg-surface border border-tl-border-default">
                        <div className="sm:col-span-2 space-y-1">
                          <p className="text-tl-text-secondary text-xs font-semibold uppercase tracking-wider">Details</p>
                          <p className="text-tl-text-primary text-sm leading-relaxed">{entry.details}</p>
                          {entry.newValue && Object.keys(entry.newValue).length > 0 && (
                            <pre className="mt-2 text-[11px] text-tl-text-secondary bg-tl-bg-base rounded-lg p-2 overflow-x-auto">
                              {JSON.stringify(entry.newValue, null, 2)}
                            </pre>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-tl-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Full Timestamp</p>
                            <p className="text-tl-text-secondary text-xs font-mono">{entry.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-tl-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">IP Address</p>
                            <p className="text-tl-text-secondary text-xs font-mono">{entry.ip}</p>
                          </div>
                          <div>
                            <p className="text-tl-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Event ID</p>
                            <p className="text-tl-text-secondary text-xs font-mono break-all">{entry.id}</p>
                          </div>
                          {entry.resourceId && (
                            <div>
                              <p className="text-tl-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Resource ID</p>
                              <p className="text-tl-text-secondary text-xs font-mono break-all">{entry.resourceId}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-tl-text-secondary text-sm">
            Showing{' '}
            <span className="text-tl-text-primary font-medium">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{' '}
            of <span className="text-tl-text-primary font-medium">{filtered.length}</span> events
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="gap-1 text-xs">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === '...'
                    ? <span key={`e${idx}`} className="text-tl-text-secondary text-sm px-1">…</span>
                    : <button key={item} onClick={() => setCurrentPage(item as number)}
                        className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all',
                          safePage === item ? 'bg-tl-gold text-tl-bg-base shadow-sm' : 'text-tl-text-secondary hover:bg-tl-bg-elevated hover:text-tl-text-primary'
                        )}>
                        {item}
                      </button>
                )}
            </div>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="gap-1 text-xs">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
