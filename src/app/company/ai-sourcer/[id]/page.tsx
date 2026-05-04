'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Sparkles, ChevronLeft, MapPin, Brain, Globe, SlidersHorizontal,
  MessageCircle, ThumbsUp, ThumbsDown, Loader2, Mail, Linkedin,
  Phone, RefreshCw, Send, Copy, Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface ShortlistEntry {
  candidateId: string
  score: number
  reason: string
  sourcedAt: string
  calibration?: { vote: 'up' | 'down'; note?: string; votedAt: string }
  outreach?: { subject: string; body: string; status: 'drafted' | 'sent'; generatedAt: string }
}

interface Brief {
  id: string
  title: string
  mustHaves: string[]
  niceToHaves: string[]
  location: string
  workMode: 'remote' | 'hybrid' | 'onsite' | 'any'
  experienceMin: number
  experienceMax: number
  signalSources: string[]
  bar: string
  shortlist: ShortlistEntry[]
  lastSourcedAt?: string
  status: 'draft' | 'active' | 'paused'
  createdAt: string
}

interface CandidateMin {
  id: string
  name?: string
  headline?: string
  title?: string
  location?: string
  skills?: Array<{ name?: string }>
  email?: string
}

export default function BriefDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const briefId = params.id

  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [sourcing, setSourcing] = useState(false)
  const [candidateMap, setCandidateMap] = useState<Record<string, CandidateMin>>({})

  const fetchBrief = useCallback(async () => {
    const res = await fetch(`/api/company/sourcer/briefs/${briefId}`, { credentials: 'include' })
    if (res.status === 401) { router.push('/auth/login?role=company'); return }
    if (!res.ok) { toast.error('Failed to load brief'); return }
    const data = (await res.json()) as Brief
    setBrief(data)
  }, [briefId, router])

  useEffect(() => {
    setLoading(true)
    fetchBrief().finally(() => setLoading(false))
  }, [fetchBrief])

  // Lightweight candidate metadata fetch — pulls names for the shortlist
  useEffect(() => {
    if (!brief || brief.shortlist.length === 0) return
    fetch('/api/company/candidates', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((items: CandidateMin[]) => {
        const map: Record<string, CandidateMin> = {}
        for (const c of items) {
          if (c.id) map[c.id] = c
        }
        setCandidateMap(map)
      })
      .catch(() => {})
  }, [brief])

  async function runSourcing() {
    setSourcing(true)
    try {
      const res = await fetch(`/api/company/sourcer/briefs/${briefId}/source`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(err.error ?? 'Sourcing failed')
      }
      const data = (await res.json()) as { brief: Brief; source: 'openai' | 'fallback'; scored: number }
      setBrief(data.brief)
      toast.success(
        `Sourced ${data.scored} candidate${data.scored === 1 ? '' : 's'} (${data.source === 'openai' ? 'AI' : 'heuristic'})`,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sourcing failed')
    } finally {
      setSourcing(false)
    }
  }

  async function calibrate(candidateId: string, vote: 'up' | 'down') {
    try {
      const res = await fetch(`/api/company/sourcer/briefs/${briefId}/calibrate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, vote }),
      })
      if (!res.ok) throw new Error('Calibration failed')
      setBrief((await res.json()) as Brief)
      toast.success(vote === 'up' ? 'Marked as a fit' : 'Marked as not a fit')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Calibration failed')
    }
  }

  async function generateOutreach(candidateId: string) {
    try {
      const res = await fetch(
        `/api/company/sourcer/briefs/${briefId}/candidates/${candidateId}/engage`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 'email', tone: 'warm', intent: 'initial' }),
        },
      )
      if (!res.ok) throw new Error('Draft failed')
      const data = (await res.json()) as { brief: Brief; source: string }
      setBrief(data.brief)
      toast.success(`Outreach drafted (${data.source === 'openai' ? 'AI' : 'template'})`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to draft outreach')
    }
  }

  async function markSent(candidateId: string) {
    try {
      const res = await fetch(
        `/api/company/sourcer/briefs/${briefId}/candidates/${candidateId}/engage`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markSent: true }),
        },
      )
      if (!res.ok) throw new Error('Failed')
      setBrief(((await res.json()) as { brief: Brief }).brief)
      toast.success('Marked as sent')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tl-bg-base">
        <Loader2 className="w-6 h-6 animate-spin text-tl-indigo" />
      </div>
    )
  }
  if (!brief) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tl-bg-base text-tl-text-secondary">
        Brief not found.
      </div>
    )
  }

  const phaseStats = computePhaseStats(brief)

  return (
    <div className="min-h-screen bg-tl-bg-base">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/company/ai-sourcer"
          className="inline-flex items-center gap-1 text-[13px] text-tl-text-secondary hover:text-tl-text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> All briefs
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tl-indigo/10 border border-tl-indigo/20 text-[10px] font-bold tracking-[0.18em] uppercase text-tl-indigo">
                <Sparkles className="w-3 h-3" /> AI Sourcer
              </span>
              {brief.lastSourcedAt && (
                <span className="text-[11px] text-tl-text-tertiary">
                  Last run · {new Date(brief.lastSourcedAt).toLocaleString()}
                </span>
              )}
            </div>
            <h1 className="text-[26px] sm:text-3xl font-semibold tracking-tight text-tl-text-primary">
              {brief.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[13px] text-tl-text-secondary">
              {brief.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-tl-text-tertiary" /> {brief.location}
                </span>
              )}
              <span className="capitalize">{brief.workMode}</span>
              <span>{brief.experienceMin}–{brief.experienceMax} years</span>
              <span>·</span>
              <span>{brief.shortlist.length} shortlisted</span>
            </div>
          </div>
          <button
            onClick={runSourcing}
            disabled={sourcing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-tl-indigo hover:bg-tl-indigo/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition-colors disabled:opacity-60"
          >
            {sourcing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sourcing…</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> Run sourcing</>
            )}
          </button>
        </div>

        {/* Phase strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <PhaseCard
            icon={Brain}
            name="Understanding"
            value={`${brief.mustHaves.length + brief.niceToHaves.length} signals`}
            sub={brief.bar ? 'Bar set' : 'No bar text'}
            accent="#4F46E5"
          />
          <PhaseCard
            icon={Globe}
            name="Sourcing"
            value={`${brief.shortlist.length} found`}
            sub={brief.lastSourcedAt ? 'Up to date' : 'Not run yet'}
            accent="#059669"
          />
          <PhaseCard
            icon={SlidersHorizontal}
            name="Calibration"
            value={`${phaseStats.calibrated} rated`}
            sub={`${phaseStats.likes}↑ ${phaseStats.dislikes}↓`}
            accent="#D97706"
          />
          <PhaseCard
            icon={MessageCircle}
            name="Engagement"
            value={`${phaseStats.drafted} drafted`}
            sub={`${phaseStats.sent} sent`}
            accent="#E11D48"
          />
        </div>

        {/* Brief summary card */}
        <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6 mb-6">
          <h2 className="text-[14px] font-semibold text-tl-text-primary mb-3">Phase 1 · Understanding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-2">Must-haves</div>
              <div className="flex flex-wrap gap-1.5">
                {brief.mustHaves.length === 0 && <span className="text-tl-text-tertiary text-[12px]">—</span>}
                {brief.mustHaves.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded-md bg-tl-indigo/10 border border-tl-indigo/20 text-[12px] font-medium text-tl-indigo">
                    {m}
                  </span>
                ))}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-2 mt-4">Nice-to-haves</div>
              <div className="flex flex-wrap gap-1.5">
                {brief.niceToHaves.length === 0 && <span className="text-tl-text-tertiary text-[12px]">—</span>}
                {brief.niceToHaves.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[12px] font-medium text-emerald-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-2">Signal sources</div>
              <div className="flex flex-wrap gap-1.5">
                {brief.signalSources.length === 0 && <span className="text-tl-text-tertiary text-[12px]">—</span>}
                {brief.signalSources.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-tl-bg-elevated border border-tl-border-default text-[12px] text-tl-text-secondary">
                    {s}
                  </span>
                ))}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-2 mt-4">The bar</div>
              <p className="text-[13.5px] text-tl-text-secondary leading-relaxed">
                {brief.bar || <span className="text-tl-text-tertiary">No bar set — add criteria for a sharper shortlist.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Shortlist */}
        <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-tl-border-default flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-tl-text-primary">Phases 2–4 · Sourcing, Calibration, Engagement</h2>
              <p className="text-[12px] text-tl-text-secondary mt-0.5">
                Run sourcing to populate. Rate ↑/↓ to teach the AI your taste — the next run uses your feedback.
              </p>
            </div>
          </div>

          {brief.shortlist.length === 0 ? (
            <div className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-tl-bg-elevated border border-tl-border-default mb-3">
                <Globe className="w-5 h-5 text-tl-text-tertiary" />
              </div>
              <p className="text-sm text-tl-text-secondary">No shortlist yet — click <strong>Run sourcing</strong> to start.</p>
            </div>
          ) : (
            <ul className="divide-y divide-tl-border-default">
              {brief.shortlist.map((entry) => (
                <CandidateRow
                  key={entry.candidateId}
                  entry={entry}
                  candidate={candidateMap[entry.candidateId]}
                  onCalibrate={(vote) => calibrate(entry.candidateId, vote)}
                  onGenerate={() => generateOutreach(entry.candidateId)}
                  onMarkSent={() => markSent(entry.candidateId)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function PhaseCard({
  icon: Icon, name, value, sub, accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <div className="rounded-xl border border-tl-border-default bg-tl-bg-surface p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-tl-text-tertiary">{name}</span>
      </div>
      <div className="text-[18px] font-semibold text-tl-text-primary">{value}</div>
      <div className="text-[11px] text-tl-text-tertiary mt-0.5">{sub}</div>
    </div>
  )
}

function computePhaseStats(brief: Brief) {
  let likes = 0
  let dislikes = 0
  let drafted = 0
  let sent = 0
  for (const e of brief.shortlist) {
    if (e.calibration?.vote === 'up') likes++
    else if (e.calibration?.vote === 'down') dislikes++
    if (e.outreach) {
      drafted++
      if (e.outreach.status === 'sent') sent++
    }
  }
  return {
    likes,
    dislikes,
    calibrated: likes + dislikes,
    drafted,
    sent,
  }
}

function CandidateRow({
  entry, candidate, onCalibrate, onGenerate, onMarkSent,
}: {
  entry: ShortlistEntry
  candidate: CandidateMin | undefined
  onCalibrate: (v: 'up' | 'down') => void
  onGenerate: () => void | Promise<void>
  onMarkSent: () => void | Promise<void>
}) {
  const [busy, setBusy] = useState<'engage' | 'sent' | null>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const name = candidate?.name ?? `Candidate ${entry.candidateId.slice(0, 6)}`
  const headline = candidate?.headline ?? candidate?.title ?? '—'
  const skills = (candidate?.skills ?? []).map((s) => s.name).filter(Boolean).slice(0, 6)
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const scoreColor = entry.score >= 80
    ? '#059669'
    : entry.score >= 60
    ? '#D97706'
    : '#6B7280'

  return (
    <li className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold"
          style={{ background: 'rgba(79,70,229,0.10)', color: '#4F46E5' }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[15px] font-semibold text-tl-text-primary truncate">{name}</h3>
                {entry.calibration && (
                  <span
                    className={
                      'text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ' +
                      (entry.calibration.vote === 'up'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200')
                    }
                  >
                    {entry.calibration.vote === 'up' ? 'Liked' : 'Rejected'}
                  </span>
                )}
                {entry.outreach && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-tl-indigo/10 text-tl-indigo border border-tl-indigo/20">
                    {entry.outreach.status === 'sent' ? 'Sent' : 'Draft'}
                  </span>
                )}
              </div>
              <p className="text-[12.5px] text-tl-text-secondary truncate">{headline}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[22px] font-bold tabular-nums leading-none" style={{ color: scoreColor }}>
                {entry.score}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-tl-text-tertiary mt-0.5">match</div>
            </div>
          </div>

          {entry.reason && (
            <p className="text-[12.5px] text-tl-text-secondary mt-2 leading-relaxed">{entry.reason}</p>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-tl-bg-elevated border border-tl-border-default text-[10.5px] text-tl-text-secondary">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => onCalibrate('up')}
              className={
                'inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border text-[12px] font-medium transition-all ' +
                (entry.calibration?.vote === 'up'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-emerald-300 hover:text-emerald-700')
              }
            >
              <ThumbsUp className="w-3.5 h-3.5" /> Fit
            </button>
            <button
              onClick={() => onCalibrate('down')}
              className={
                'inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border text-[12px] font-medium transition-all ' +
                (entry.calibration?.vote === 'down'
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-rose-300 hover:text-rose-700')
              }
            >
              <ThumbsDown className="w-3.5 h-3.5" /> Pass
            </button>

            <span className="w-px h-5 bg-tl-border-default mx-1" />

            {entry.outreach ? (
              <>
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-tl-border-default text-tl-text-secondary text-[12px] font-medium hover:border-tl-indigo/40 hover:text-tl-indigo transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> {open ? 'Hide draft' : 'View draft'}
                </button>
                <button
                  onClick={async () => { setBusy('engage'); try { await onGenerate() } finally { setBusy(null) } }}
                  disabled={busy === 'engage'}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-tl-border-default text-tl-text-secondary text-[12px] font-medium hover:border-tl-indigo/40 hover:text-tl-indigo transition-all disabled:opacity-50"
                >
                  {busy === 'engage' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Regenerate
                </button>
                {entry.outreach.status === 'drafted' && (
                  <button
                    onClick={async () => { setBusy('sent'); try { await onMarkSent() } finally { setBusy(null) } }}
                    disabled={busy === 'sent'}
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-tl-indigo text-white text-[12px] font-semibold hover:bg-tl-indigo/90 transition-colors disabled:opacity-50"
                  >
                    {busy === 'sent' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Mark sent
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={async () => { setBusy('engage'); try { await onGenerate() } finally { setBusy(null) } }}
                disabled={busy === 'engage'}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-tl-indigo text-white text-[12px] font-semibold hover:bg-tl-indigo/90 transition-colors disabled:opacity-50"
              >
                {busy === 'engage' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Draft outreach
              </button>
            )}

            {candidate && (
              <Link
                href={`/company/candidates/${entry.candidateId}`}
                className="ml-auto inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-tl-text-secondary text-[12px] font-medium hover:text-tl-indigo transition-colors"
              >
                Open profile →
              </Link>
            )}
          </div>

          {/* Draft viewer */}
          {open && entry.outreach && (
            <div className="mt-3 rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4">
              {entry.outreach.subject && (
                <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-1">Subject</div>
              )}
              {entry.outreach.subject && (
                <div className="text-[14px] font-medium text-tl-text-primary mb-3">{entry.outreach.subject}</div>
              )}
              <div className="text-[11px] uppercase tracking-wider text-tl-text-tertiary font-semibold mb-1">Body</div>
              <pre className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-tl-text-primary font-sans">
                {entry.outreach.body}
              </pre>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-tl-border-default">
                <span className="text-[11px] text-tl-text-tertiary">
                  Drafted {new Date(entry.outreach.generatedAt).toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    const text = entry.outreach?.subject
                      ? `Subject: ${entry.outreach.subject}\n\n${entry.outreach.body}`
                      : entry.outreach?.body ?? ''
                    navigator.clipboard.writeText(text).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1600)
                    })
                  }}
                  className="inline-flex items-center gap-1 text-[12px] text-tl-indigo font-semibold hover:text-tl-indigo/80 transition-colors"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
