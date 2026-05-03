'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn, formatSalary, timeAgo, candidateAvatarSrc, candidateDisplayName } from '@/lib/utils'
import { STAGE_LABELS } from '@/lib/constants'
import {
  ArrowLeft, Pencil, Save, X, MapPin, Briefcase, Wifi, Building2,
  MonitorSmartphone, DollarSign, Users, Calendar, Tag, Layers,
  CheckCircle2, Sparkles, Eye, Plus, Trash2, FileText, Mail, MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────

interface JobDetail {
  id: string
  title: string
  department: string
  type: string
  workMode: string
  level: string
  location: string
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string[]
  niceToHave: string[]
  skills: string[]
  benefits: string[]
  status: string
  featured: boolean
  postedAt: string
  expiresAt: string
  applicantCount: number
}

interface Applicant {
  id: string
  candidateId?: string
  candidateName?: string
  candidateEmail?: string
  candidateTitle?: string
  candidateAvatar?: string
  matchScore?: number
  status?: string
  stage?: string
  appliedAt?: string
  updatedAt?: string
  coverLetter?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior',
  lead: 'Lead / Staff', executive: 'Executive',
}
const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time',
  contract: 'Contract', internship: 'Internship', freelance: 'Freelance',
}
const WM: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  remote: { label: 'Remote', icon: <Wifi className="w-3.5 h-3.5" />,             cls: 'text-cyan-400'   },
  hybrid: { label: 'Hybrid', icon: <MonitorSmartphone className="w-3.5 h-3.5"/>, cls: 'text-purple-400' },
  onsite: { label: 'Onsite', icon: <Building2 className="w-3.5 h-3.5" />,        cls: 'text-blue-400'   },
}
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  closed: 'bg-muted/50 text-muted-foreground border-border',
}
const STAGE_DOT: Record<string, string> = {
  new: 'bg-tl-blue', screening: 'bg-tl-gold', phone_screen: 'bg-tl-teal',
  technical: 'bg-tl-gold', onsite: 'bg-tl-teal', offer: 'bg-tl-teal',
  hired: 'bg-tl-teal', rejected: 'bg-tl-rose',
}

function daysAgo(iso?: string) {
  if (!iso) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

function matchColor(score: number) {
  if (score >= 90) return 'bg-tl-teal/15 text-tl-teal border-tl-teal/25'
  if (score >= 75) return 'bg-tl-gold/15 text-tl-gold border-tl-gold/25'
  if (score >= 60) return 'bg-tl-gold/10 text-tl-gold border-tl-gold/20'
  return 'bg-tl-rose/15 text-tl-rose border-tl-rose/25'
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [job, setJob]               = useState<JobDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<'overview' | 'applicants'>(
    searchParams.get('tab') === 'applicants' ? 'applicants' : 'overview'
  )

  const [editing, setEditing]       = useState(searchParams.get('edit') === '1')
  const [saving, setSaving]         = useState(false)

  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [appsLoading, setAppsLoading] = useState(false)

  // Edit fields
  const [editTitle,      setEditTitle]      = useState('')
  const [editDesc,       setEditDesc]       = useState('')
  const [editSalaryMin,  setEditSalaryMin]  = useState(0)
  const [editSalaryMax,  setEditSalaryMax]  = useState(0)
  const [editSkills,     setEditSkills]     = useState<string[]>([])
  const [editSkillInput, setEditSkillInput] = useState('')
  const [editReqs,       setEditReqs]       = useState<string[]>([])
  const [editStatus,     setEditStatus]     = useState('active')

  // Load job
  useEffect(() => {
    fetch(`/api/company/jobs/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: JobDetail) => {
        setJob(data)
        setEditTitle(data.title ?? '')
        setEditDesc(data.description ?? '')
        setEditSalaryMin(data.salaryMin ?? 0)
        setEditSalaryMax(data.salaryMax ?? 0)
        setEditSkills(data.skills ?? [])
        setEditReqs(data.requirements ?? [])
        setEditStatus(data.status ?? 'active')
        setLoading(false)
      })
      .catch(() => { toast.error('Job not found'); router.push('/company/jobs') })
  }, [id, router])

  // Load applicants when tab is opened
  useEffect(() => {
    if (tab !== 'applicants' || !id) return
    setAppsLoading(true)
    fetch(`/api/company/jobs/${id}/applications`)
      .then(r => r.ok ? r.json() : [])
      .then((items: Applicant[]) => setApplicants(Array.isArray(items) ? items : []))
      .catch(() => setApplicants([]))
      .finally(() => setAppsLoading(false))
  }, [tab, id])

  const cancelEdit = () => {
    if (!job) return
    setEditTitle(job.title); setEditDesc(job.description)
    setEditSalaryMin(job.salaryMin); setEditSalaryMax(job.salaryMax)
    setEditSkills(job.skills ?? []); setEditReqs(job.requirements ?? [])
    setEditStatus(job.status); setEditing(false)
  }

  const save = async () => {
    if (!job) return
    setSaving(true)
    try {
      const res = await fetch(`/api/company/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          salaryMin: Number(editSalaryMin),
          salaryMax: Number(editSalaryMax),
          skills: editSkills,
          requirements: editReqs.filter(Boolean),
          status: editStatus,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string; issues?: Record<string, string[]> }
        const msg = err.issues
          ? Object.entries(err.issues).map(([f, m]) => `${f}: ${(m as string[]).join(', ')}`).join('; ')
          : (err.error ?? 'Failed to save')
        throw new Error(msg)
      }
      const updated = await res.json() as Partial<JobDetail>
      setJob(prev => prev ? { ...prev, ...updated } : prev)
      setEditing(false)
      toast.success('Job updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && editSkillInput.trim()) {
      e.preventDefault()
      const s = editSkillInput.trim().replace(/,$/, '')
      if (s && !editSkills.includes(s)) setEditSkills(p => [...p, s])
      setEditSkillInput('')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!job) return null

  const wm = WM[job.workMode] ?? WM.onsite
  const currentStatus = editing ? editStatus : job.status

  return (
    <div className="p-4 sm:p-6 max-w-5xl space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="w-8 h-8 mt-0.5 shrink-0">
            <Link href="/company/jobs"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="min-w-0">
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="bg-tl-bg-elevated border border-tl-border-default rounded-lg px-2 py-1 text-xl font-bold text-tl-text-primary focus:outline-none focus:border-tl-gold w-full max-w-md"
              />
            ) : (
              <h1 className="text-xl font-bold text-tl-text-primary truncate">{job.title}</h1>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', STATUS_STYLES[currentStatus])}>
                {currentStatus}
              </span>
              <span className="text-[10px] font-mono text-tl-text-secondary bg-tl-bg-elevated px-1.5 py-0.5 rounded border border-tl-border-subtle select-all">
                {job.id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} className="gap-1.5 text-xs h-8">
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}
                className="gap-1.5 text-xs h-8 bg-tl-gold text-white hover:bg-tl-gold/90">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditing(true)} className="gap-1.5 text-xs h-8">
              <Pencil className="w-3.5 h-3.5" /> Edit Job
            </Button>
          )}
        </div>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-tl-border-subtle">
        {([
          { id: 'overview',   label: 'Overview',  icon: FileText },
          { id: 'applicants', label: 'Applicants', icon: Users, count: tab === 'applicants' ? applicants.length : (job.applicantCount ?? 0) },
        ] as const).map(t => {
          const Icon = t.icon
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-tl-gold text-tl-gold'
                  : 'border-transparent text-tl-text-secondary hover:text-tl-text-primary'
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {'count' in t && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold',
                  isActive ? 'bg-tl-gold/15 text-tl-gold' : 'bg-tl-bg-elevated text-tl-text-secondary'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === 'overview' ? (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            {/* Meta grid */}
            <div className="tl-card p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Meta label="Department" icon={<Briefcase className="w-3.5 h-3.5" />} value={job.department || '—'} />
              <Meta label="Type"       icon={<Tag className="w-3.5 h-3.5" />}        value={TYPE_LABELS[job.type] ?? job.type} />
              <Meta label="Level"      icon={<Layers className="w-3.5 h-3.5" />}     value={LEVEL_LABELS[job.level] ?? job.level} />
              <Meta label="Location"   icon={<MapPin className="w-3.5 h-3.5" />}     value={job.location || 'Remote'} />
              <div>
                <p className="text-tl-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1">Work Mode</p>
                <div className={cn('flex items-center gap-1.5 text-sm font-medium', wm.cls)}>{wm.icon}{wm.label}</div>
              </div>
              <div>
                <p className="text-tl-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1">Salary</p>
                {editing ? (
                  <div className="flex items-center gap-1 text-sm">
                    <input type="number" value={editSalaryMin} onChange={e => setEditSalaryMin(Number(e.target.value))}
                      className="w-20 bg-tl-bg-elevated border border-tl-border-default rounded px-1.5 py-0.5 text-xs text-tl-text-primary focus:outline-none focus:border-tl-gold" />
                    <span className="text-tl-text-secondary text-xs">–</span>
                    <input type="number" value={editSalaryMax} onChange={e => setEditSalaryMax(Number(e.target.value))}
                      className="w-20 bg-tl-bg-elevated border border-tl-border-default rounded px-1.5 py-0.5 text-xs text-tl-text-primary focus:outline-none focus:border-tl-gold" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm font-semibold font-mono text-tl-teal">
                    <DollarSign className="w-3.5 h-3.5" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                )}
              </div>
              <Meta label="Posted" icon={<Calendar className="w-3.5 h-3.5" />} value={`${daysAgo(job.postedAt)}d ago`} />
              {editing && (
                <div>
                  <p className="text-tl-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1">Status</p>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                    className="bg-tl-bg-elevated border border-tl-border-default rounded-lg px-2 py-1 text-xs text-tl-text-primary focus:outline-none focus:border-tl-gold">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="tl-card p-5 space-y-2">
              <h2 className="text-sm font-semibold text-tl-text-primary flex items-center gap-2">
                <Eye className="w-4 h-4 text-tl-text-secondary" /> About the Role
              </h2>
              {editing ? (
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={8}
                  className="w-full bg-tl-bg-elevated border border-tl-border-default rounded-xl px-3 py-2.5 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold resize-none" />
              ) : (
                <p className="text-sm text-tl-text-secondary leading-relaxed whitespace-pre-wrap">{job.description}</p>
              )}
            </div>

            {/* Requirements */}
            <div className="tl-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-tl-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-tl-teal" /> Requirements
              </h2>
              {editing ? (
                <div className="space-y-2">
                  {editReqs.map((req, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={req}
                        onChange={e => { const n = [...editReqs]; n[i] = e.target.value; setEditReqs(n) }}
                        placeholder={`Requirement ${i + 1}`}
                        className="flex-1 bg-tl-bg-elevated border border-tl-border-default rounded-lg px-3 py-1.5 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold" />
                      <button onClick={() => setEditReqs(editReqs.filter((_, j) => j !== i))}
                        className="p-1.5 text-tl-rose hover:bg-tl-rose/10 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setEditReqs([...editReqs, ''])}
                    className="flex items-center gap-1.5 text-xs text-tl-text-secondary hover:text-tl-gold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add requirement
                  </button>
                </div>
              ) : (job.requirements ?? []).length > 0 ? (
                <ul className="space-y-2">
                  {(job.requirements ?? []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-tl-text-secondary">
                      <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0 mt-0.5" />{r}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-tl-text-secondary/50 italic">No requirements listed.</p>}
            </div>

            {/* Skills */}
            <div className="tl-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-tl-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-tl-gold" /> Required Skills
              </h2>
              {editing ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {editSkills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 tl-tag-gold text-xs">
                        {s}
                        <button onClick={() => setEditSkills(editSkills.filter(x => x !== s))}
                          className="hover:text-tl-rose ml-0.5"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <input value={editSkillInput} onChange={e => setEditSkillInput(e.target.value)}
                    onKeyDown={handleSkillKey}
                    placeholder="Type skill and press Enter or comma…"
                    className="w-full bg-tl-bg-elevated border border-tl-border-default rounded-lg px-3 py-1.5 text-sm text-tl-text-primary focus:outline-none focus:border-tl-gold" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {(job.skills ?? []).length > 0
                    ? (job.skills ?? []).map(s => <span key={s} className="tl-tag-gold text-xs">{s}</span>)
                    : <p className="text-sm text-tl-text-secondary/50 italic">No skills listed.</p>}
                </div>
              )}
            </div>

            {/* Danger zone */}
            {!editing && (
              <div className="tl-card p-4 border border-tl-rose/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-tl-text-primary">Close this job</p>
                  <p className="text-xs text-tl-text-secondary mt-0.5">Stops accepting new applications.</p>
                </div>
                <Button variant="outline" size="sm"
                  className="gap-1.5 text-xs border-tl-rose/30 text-tl-rose hover:bg-tl-rose/10 shrink-0"
                  onClick={async () => {
                    if (!confirm('Close this job posting?')) return
                    await fetch(`/api/company/jobs/${id}`, { method: 'DELETE' })
                    toast.success('Job closed')
                    router.push('/company/jobs')
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Close Job
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="applicants"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {appsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
              </div>
            ) : applicants.length === 0 ? (
              <div className="tl-card p-12 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-tl-bg-elevated flex items-center justify-center">
                  <Users className="w-6 h-6 text-tl-text-secondary/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-tl-text-primary">No applicants yet</p>
                  <p className="text-xs text-tl-text-secondary mt-1 max-w-sm">
                    Once candidates apply to this role, they&rsquo;ll show up here with match scores and pipeline stage.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-8 mt-2">
                  <Link href="/company/pipeline"><Eye className="w-3.5 h-3.5" /> Open Pipeline</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {applicants.map(app => {
                  const name = candidateDisplayName({
                    name: app.candidateName,
                    email: app.candidateEmail,
                    id: app.candidateId,
                  })
                  const stage = (app.stage ?? 'new') as keyof typeof STAGE_LABELS
                  const avatar = candidateAvatarSrc({ avatar: app.candidateAvatar, name }, name)
                  const profileHref = app.candidateId
                    ? `/company/candidates/${app.candidateId}?jobId=${id}`
                    : null

                  const onRowClick = () => {
                    if (profileHref) router.push(profileHref)
                  }
                  const onRowKey = (e: React.KeyboardEvent) => {
                    if (!profileHref) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(profileHref)
                    }
                  }

                  return (
                    <div
                      key={app.id}
                      role={profileHref ? 'link' : undefined}
                      tabIndex={profileHref ? 0 : undefined}
                      onClick={onRowClick}
                      onKeyDown={onRowKey}
                      className={cn(
                        'tl-card p-4 flex items-center gap-4 transition-colors',
                        profileHref
                          ? 'hover:border-tl-gold/40 hover:bg-tl-bg-elevated/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-tl-gold/40'
                          : 'hover:border-tl-gold/30',
                      )}
                    >
                      <img
                        src={avatar}
                        alt={name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-tl-border-subtle bg-tl-bg-elevated"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-tl-text-primary">{name}</span>
                          {typeof app.matchScore === 'number' && app.matchScore > 0 && (
                            <span className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border', matchColor(app.matchScore))}>
                              {app.matchScore}% match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-tl-text-secondary">
                          {app.candidateTitle && <span>{app.candidateTitle}</span>}
                          {app.candidateEmail && <span className="truncate max-w-[180px]">{app.candidateEmail}</span>}
                          {app.appliedAt && <span>· {timeAgo(app.appliedAt)}</span>}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        <span className={cn('w-1.5 h-1.5 rounded-full', STAGE_DOT[stage] ?? 'bg-tl-text-secondary')} />
                        <span className="text-xs text-tl-text-secondary">{STAGE_LABELS[stage] ?? stage}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {app.candidateEmail && (
                          <Button asChild variant="ghost" size="icon" className="w-8 h-8" title="Email">
                            <a href={`mailto:${app.candidateEmail}`}><Mail className="w-3.5 h-3.5" /></a>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="icon" className="w-8 h-8" title="Message">
                          <Link href={`/company/messages?candidate=${app.candidateId ?? ''}`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function Meta({ label, icon, value }: { label: string; icon: React.ReactNode; value: string }) {
  return (
    <div>
      <p className="text-tl-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-1.5 text-sm text-tl-text-primary">
        <span className="text-tl-text-secondary">{icon}</span>
        {value}
      </div>
    </div>
  )
}
