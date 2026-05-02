'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

const AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'evt_001',
    timestamp: '2026-05-01T09:14:32Z',
    user: 'Sarah Kim',
    action: 'login',
    resource: 'Auth',
    resourceId: 'session_8f2a',
    ip: '192.168.1.42',
    status: 'success',
    details: 'Successful login via SSO (Google Workspace). Session created.',
  },
  {
    id: 'evt_002',
    timestamp: '2026-05-01T09:22:05Z',
    user: 'Sarah Kim',
    action: 'job.create',
    resource: 'Job',
    resourceId: 'job_1093',
    ip: '192.168.1.42',
    status: 'success',
    details: 'Created new job posting: "Senior Backend Engineer" in Engineering department.',
  },
  {
    id: 'evt_003',
    timestamp: '2026-05-01T10:05:18Z',
    user: 'James Park',
    action: 'candidate.view',
    resource: 'Candidate',
    resourceId: 'cand_4412',
    ip: '10.0.0.5',
    status: 'success',
    details: 'Viewed candidate profile: Alex Thompson. Resume and contact details accessed.',
  },
  {
    id: 'evt_004',
    timestamp: '2026-05-01T10:31:47Z',
    user: 'Mike Chen',
    action: 'candidate.export',
    resource: 'Candidate',
    resourceId: 'export_229',
    ip: '203.0.113.24',
    status: 'warning',
    details: 'Bulk export of 47 candidate records initiated. Awaiting compliance review for GDPR scope.',
  },
  {
    id: 'evt_005',
    timestamp: '2026-05-01T11:00:00Z',
    user: 'Admin (System)',
    action: 'mfa.enable',
    resource: 'Auth',
    resourceId: 'usr_james_park',
    ip: '10.0.0.1',
    status: 'success',
    details: 'MFA enforcement policy applied to account: James Park. TOTP enrolled.',
  },
  {
    id: 'evt_006',
    timestamp: '2026-05-01T11:45:03Z',
    user: 'Lisa Wang',
    action: 'settings.update',
    resource: 'Settings',
    resourceId: 'org_settings',
    ip: '10.0.0.11',
    status: 'success',
    details: 'Updated organization notification settings. Weekly digest disabled for all non-admin users.',
  },
  {
    id: 'evt_007',
    timestamp: '2026-05-01T12:02:59Z',
    user: 'James Park',
    action: 'pipeline.move',
    resource: 'Candidate',
    resourceId: 'cand_5581',
    ip: '10.0.0.5',
    status: 'success',
    details: 'Moved candidate Jordan Lee from "Phone Screen" to "Technical Interview" stage.',
  },
  {
    id: 'evt_008',
    timestamp: '2026-05-01T13:17:22Z',
    user: 'Mike Chen',
    action: 'api_key.create',
    resource: 'API',
    resourceId: 'key_7h3x',
    ip: '203.0.113.24',
    status: 'warning',
    details: 'New API key created with full read/write scope. Key starts with "tb_live_...". Notify security team.',
  },
  {
    id: 'evt_009',
    timestamp: '2026-05-01T13:55:10Z',
    user: 'Sarah Kim',
    action: 'job.update',
    resource: 'Job',
    resourceId: 'job_1093',
    ip: '192.168.1.42',
    status: 'success',
    details: 'Updated job posting salary range and requirements. Published changes to all connected boards.',
  },
  {
    id: 'evt_010',
    timestamp: '2026-05-01T14:30:05Z',
    user: 'Admin (System)',
    action: 'report.download',
    resource: 'Report',
    resourceId: 'rpt_diversity_q1',
    ip: '10.0.0.1',
    status: 'success',
    details: 'Q1 Diversity & Inclusion report generated and downloaded (PDF, 3.2 MB).',
  },
  {
    id: 'evt_011',
    timestamp: '2026-04-30T16:48:33Z',
    user: 'Lisa Wang',
    action: 'team.invite',
    resource: 'Team',
    resourceId: 'invite_33b2',
    ip: '10.0.0.11',
    status: 'success',
    details: 'Invited new team member: priya.patel@company.com with Recruiter role.',
  },
  {
    id: 'evt_012',
    timestamp: '2026-04-30T17:10:14Z',
    user: 'Mike Chen',
    action: 'billing.update',
    resource: 'Billing',
    resourceId: 'sub_pro_plan',
    ip: '203.0.113.24',
    status: 'error',
    details: 'Failed to upgrade to Enterprise plan. Payment method declined. Card ending in 4242.',
  },
  {
    id: 'evt_013',
    timestamp: '2026-04-30T17:55:40Z',
    user: 'James Park',
    action: 'logout',
    resource: 'Auth',
    resourceId: 'session_7c1b',
    ip: '10.0.0.5',
    status: 'success',
    details: 'User initiated logout. Session invalidated successfully.',
  },
  {
    id: 'evt_014',
    timestamp: '2026-04-30T18:22:01Z',
    user: 'Sarah Kim',
    action: 'job.delete',
    resource: 'Job',
    resourceId: 'job_0974',
    ip: '192.168.1.42',
    status: 'success',
    details: 'Deleted archived job posting: "Junior Data Analyst" (expired 30 days ago). 12 applications archived.',
  },
  {
    id: 'evt_015',
    timestamp: '2026-04-29T09:03:11Z',
    user: 'Admin (System)',
    action: 'settings.update',
    resource: 'Settings',
    resourceId: 'security_policy',
    ip: '10.0.0.1',
    status: 'success',
    details: 'Session timeout policy updated from 8h to 4h for all roles. Change effective immediately.',
  },
  {
    id: 'evt_016',
    timestamp: '2026-04-29T10:44:28Z',
    user: 'Lisa Wang',
    action: 'candidate.view',
    resource: 'Candidate',
    resourceId: 'cand_8820',
    ip: '10.0.0.11',
    status: 'success',
    details: 'Reviewed candidate portfolio and attached assessment scores for role: Product Designer.',
  },
  {
    id: 'evt_017',
    timestamp: '2026-04-29T13:15:55Z',
    user: 'Mike Chen',
    action: 'login',
    resource: 'Auth',
    resourceId: 'session_fail_9x',
    ip: '198.51.100.77',
    status: 'error',
    details: 'Login failed: invalid credentials. 3rd consecutive failure from this IP. Account temporarily locked.',
  },
  {
    id: 'evt_018',
    timestamp: '2026-04-28T11:30:00Z',
    user: 'Sarah Kim',
    action: 'report.download',
    resource: 'Report',
    resourceId: 'rpt_hiring_funnel',
    ip: '192.168.1.42',
    status: 'success',
    details: 'Hiring funnel report for April downloaded. 284 applicants, 12 offers, 8 accepted.',
  },
  {
    id: 'evt_019',
    timestamp: '2026-04-27T15:02:47Z',
    user: 'James Park',
    action: 'pipeline.move',
    resource: 'Candidate',
    resourceId: 'cand_3301',
    ip: '10.0.0.5',
    status: 'warning',
    details: 'Moved candidate to "Offer" stage without completing reference check step. Policy deviation flagged.',
  },
  {
    id: 'evt_020',
    timestamp: '2026-04-26T08:55:12Z',
    user: 'Admin (System)',
    action: 'mfa.enable',
    resource: 'Auth',
    resourceId: 'org_wide_mfa',
    ip: '10.0.0.1',
    status: 'success',
    details: 'Organization-wide MFA enforcement enabled. All users prompted to enroll on next login.',
  },
]

const ACTION_CATEGORIES = ['All Actions', 'Auth', 'Jobs', 'Candidates', 'Settings', 'Billing', 'Reports', 'API']

const PAGE_SIZE = 10

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-pink-500 to-pink-700',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function statusConfig(status: Status) {
  switch (status) {
    case 'success':
      return {
        icon: CheckCircle2,
        label: 'Success',
        dot: 'bg-emerald-400',
        text: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        label: 'Warning',
        dot: 'bg-amber-400',
        text: 'text-amber-400',
        bg: 'bg-amber-400/10',
      }
    case 'error':
      return {
        icon: XCircle,
        label: 'Error',
        dot: 'bg-red-400',
        text: 'text-red-400',
        bg: 'bg-red-400/10',
      }
  }
}

function actionBadgeStyle(action: string) {
  if (action.startsWith('job')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (action.startsWith('candidate')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  if (action === 'login' || action === 'logout' || action === 'mfa.enable')
    return 'bg-green-500/10 text-green-400 border-green-500/20'
  if (action.startsWith('billing') || action.startsWith('api_key'))
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (action.startsWith('settings') || action.startsWith('team'))
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  return 'bg-white/5 text-black/50 border-white/10'
}

function fakeRequestId(id: string) {
  return 'req_' + id.replace('evt_', '') + '_' + Math.abs(id.charCodeAt(4) * 13377) % 99999
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [actionCategory, setActionCategory] = useState('All Actions')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter logic
  const filtered = AUDIT_LOGS.filter((entry) => {
    const matchSearch =
      search === '' ||
      entry.user.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase()) ||
      entry.resource.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || entry.status === statusFilter

    const matchCategory =
      actionCategory === 'All Actions' ||
      (() => {
        const cat = actionCategory.toLowerCase()
        if (cat === 'auth') return entry.action === 'login' || entry.action === 'logout' || entry.action === 'mfa.enable'
        if (cat === 'jobs') return entry.action.startsWith('job')
        if (cat === 'candidates') return entry.action.startsWith('candidate') || entry.action === 'pipeline.move'
        if (cat === 'settings') return entry.action.startsWith('settings') || entry.action.startsWith('team')
        if (cat === 'billing') return entry.action.startsWith('billing')
        if (cat === 'reports') return entry.action.startsWith('report')
        if (cat === 'api') return entry.action.startsWith('api_key')
        return true
      })()

    return matchSearch && matchStatus && matchCategory
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (v: string) => {
    setSearch(v)
    setCurrentPage(1)
  }

  const handleStatusFilter = (s: 'all' | Status) => {
    setStatusFilter(s)
    setCurrentPage(1)
  }

  const handleCategory = (c: string) => {
    setActionCategory(c)
    setCurrentPage(1)
  }

  // Stats
  const totalEvents = AUDIT_LOGS.length
  const successCount = AUDIT_LOGS.filter((e) => e.status === 'success').length
  const successRate = Math.round((successCount / totalEvents) * 100)
  const uniqueUsers = new Set(AUDIT_LOGS.map((e) => e.user)).size

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-black">Audit Log</h1>
          </div>
          <p className="text-black/40 text-sm ml-12">7-year retention · SOC2 Type II compliant</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range selector (display only) */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-black/60 text-sm cursor-default">
            <span>Last 7 days</span>
            <ChevronDown className="w-3.5 h-3.5 text-black/30" />
          </div>

          <Button
            variant="outline"
            className="border-white/10 text-black/70 hover:bg-white/10 hover:text-black gap-2"
            onClick={() => toast.success('Audit log exported', { description: 'CSV download started' })}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: totalEvents, icon: Shield, color: 'text-blue-400' },
          { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Unique Users', value: uniqueUsers, icon: Filter, color: 'text-purple-400' },
          { label: 'Exports This Month', value: 7, icon: Download, color: 'text-orange-400' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3 bg-white/3 rounded-xl border border-white/8"
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', stat.color)} />
              <div>
                <p className="text-black font-semibold text-base leading-tight">{stat.value}</p>
                <p className="text-black/40 text-xs">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <Input
            placeholder="Search by user, action, resource…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-black placeholder:text-black/30 focus:border-blue-500/50"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg">
          {(['all', 'success', 'warning', 'error'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all duration-150',
                statusFilter === s
                  ? s === 'all'
                    ? 'bg-white/15 text-black'
                    : s === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : s === 'warning'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-red-500/20 text-red-400'
                  : 'text-black/40 hover:text-black/70'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Action category dropdown */}
        <div className="relative">
          <select
            value={actionCategory}
            onChange={(e) => handleCategory(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 text-black/70 text-sm rounded-lg px-3 py-2 pr-8 cursor-pointer focus:outline-none focus:border-blue-500/50 hover:bg-white/8 transition-colors"
          >
            {ACTION_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0f0f1a] text-black">
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden bg-white/[0.02]">
        {/* Table header */}
        <div className="grid grid-cols-[1.6fr_1.4fr_1.4fr_1fr_1fr_0.8fr] gap-3 px-4 py-3 bg-white/5 border-b border-white/10 text-xs font-semibold text-black/40 uppercase tracking-wider">
          <span>Timestamp</span>
          <span>User</span>
          <span>Action</span>
          <span>Resource</span>
          <span>IP Address</span>
          <span>Status</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-white/5">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-black/30 gap-3">
              <Search className="w-8 h-8 opacity-50" />
              <p className="text-sm">No entries match your filters</p>
            </div>
          ) : (
            paginated.map((entry, i) => {
              const isExpanded = expandedRow === entry.id
              const sc = statusConfig(entry.status)
              const StatusIcon = sc.icon

              return (
                <div key={entry.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    className={cn(
                      'grid grid-cols-[1.6fr_1.4fr_1.4fr_1fr_1fr_0.8fr] gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150',
                      isExpanded ? 'bg-white/5' : 'hover:bg-white/[0.035]'
                    )}
                  >
                    {/* Timestamp */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-black/50 text-xs font-mono truncate">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-black',
                          getAvatarColor(entry.user)
                        )}
                      >
                        {getInitials(entry.user)}
                      </div>
                      <span className="text-black/80 text-sm truncate">{entry.user}</span>
                    </div>

                    {/* Action */}
                    <div className="flex items-center min-w-0">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border truncate',
                          actionBadgeStyle(entry.action)
                        )}
                      >
                        {entry.action}
                      </span>
                    </div>

                    {/* Resource */}
                    <div className="flex items-center min-w-0">
                      <span className="text-black/60 text-sm truncate">{entry.resource}</span>
                    </div>

                    {/* IP */}
                    <div className="flex items-center min-w-0">
                      <span className="text-black/40 text-xs font-mono truncate">{entry.ip}</span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                          sc.bg,
                          sc.text
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', sc.dot)} />
                        {sc.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-black/30 flex-shrink-0 ml-auto" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-black/20 flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </motion.div>

                  {/* Expanded row */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 bg-white/[0.03] border-t border-white/5"
                    >
                      <div className="mt-3 grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/8">
                        <div className="sm:col-span-2 space-y-1">
                          <p className="text-black/40 text-xs font-semibold uppercase tracking-wider">Details</p>
                          <p className="text-black/70 text-sm leading-relaxed">{entry.details}</p>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Full Timestamp</p>
                            <p className="text-black/60 text-xs font-mono">{entry.timestamp}</p>
                          </div>
                          <div>
                            <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Request ID</p>
                            <p className="text-black/60 text-xs font-mono">{fakeRequestId(entry.id)}</p>
                          </div>
                          <div>
                            <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Resource ID</p>
                            <p className="text-black/60 text-xs font-mono">{entry.resourceId}</p>
                          </div>
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
      <div className="flex items-center justify-between">
        <p className="text-black/40 text-sm">
          Showing{' '}
          <span className="text-black/70 font-medium">
            {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)}
          </span>{' '}
          of <span className="text-black/70 font-medium">{filtered.length}</span> events
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border-white/10 text-black/60 hover:bg-white/10 hover:text-black disabled:opacity-30 gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...')
                }
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`ellipsis-${idx}`} className="text-black/30 text-sm px-1">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item as number)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150',
                      safePage === item
                        ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20'
                        : 'text-black/50 hover:bg-white/10 hover:text-black'
                    )}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="border-white/10 text-black/60 hover:bg-white/10 hover:text-black disabled:opacity-30 gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
