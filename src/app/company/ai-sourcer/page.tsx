'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles, Plus, ArrowRight, MapPin, Target, Search, Sliders,
  Loader2, X,
} from 'lucide-react'
import { toast } from 'sonner'

interface BriefSummary {
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
  shortlist: Array<{ candidateId: string; score: number; calibration?: { vote: 'up' | 'down' } }>
  lastSourcedAt?: string
  status: 'draft' | 'active' | 'paused'
  createdAt: string
}

const SIGNAL_OPTIONS = [
  'GitHub', 'Portfolio', 'Open source', 'Conferences', 'Papers', 'LinkedIn', 'X / Twitter',
]

export default function AiSourcerIndexPage() {
  const router = useRouter()
  const [briefs, setBriefs] = useState<BriefSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetch('/api/company/sourcer/briefs', { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) { router.push('/auth/login?role=company'); return [] }
        return (await r.json()) as BriefSummary[]
      })
      .then((data) => setBriefs(data ?? []))
      .catch(() => toast.error('Failed to load briefs'))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-tl-bg-base">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tl-indigo/10 border border-tl-indigo/20 text-[10px] font-bold tracking-[0.18em] uppercase text-tl-indigo">
                <Sparkles className="w-3 h-3" />
                AI Sourcer
              </span>
            </div>
            <h1 className="text-[26px] sm:text-3xl font-semibold tracking-tight text-tl-text-primary">
              Hiring briefs
            </h1>
            <p className="text-sm text-tl-text-secondary mt-1">
              Each brief becomes an autonomous sourcer — understanding, sourcing, calibrating, and engaging on its own.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-tl-indigo hover:bg-tl-indigo/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition-colors"
          >
            <Plus className="w-4 h-4" /> New brief
          </button>
        </div>

        {/* Briefs grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-tl-indigo" />
          </div>
        ) : briefs.length === 0 ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefs.map((b) => (
              <BriefCard key={b.id} brief={b} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <NewBriefDialog
          onClose={() => setShowForm(false)}
          submitting={creating}
          onSubmit={async (payload) => {
            setCreating(true)
            try {
              const res = await fetch('/api/company/sourcer/briefs', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              })
              if (!res.ok) {
                const err = (await res.json().catch(() => ({}))) as { error?: string }
                throw new Error(err.error ?? 'Failed to create brief')
              }
              const created = (await res.json()) as BriefSummary
              toast.success('Brief created — opening it now.')
              router.push(`/company/ai-sourcer/${created.id}`)
            } catch (err) {
              toast.error(err instanceof Error ? err.message : 'Failed')
            } finally {
              setCreating(false)
            }
          }}
        />
      )}
    </div>
  )
}

function BriefCard({ brief }: { brief: BriefSummary }) {
  const liked = brief.shortlist.filter((e) => e.calibration?.vote === 'up').length
  const drafted = brief.shortlist.length
  return (
    <Link
      href={`/company/ai-sourcer/${brief.id}`}
      className="group rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6 transition-all hover:border-tl-indigo/40 hover:shadow-[0_10px_30px_rgba(17,24,39,0.06)]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[17px] font-semibold text-tl-text-primary tracking-tight group-hover:text-tl-indigo transition-colors">
          {brief.title}
        </h3>
        <span
          className={
            'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ' +
            (brief.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : brief.status === 'paused'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-tl-bg-elevated text-tl-text-tertiary border border-tl-border-default')
          }
        >
          {brief.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {brief.mustHaves.slice(0, 5).map((m) => (
          <span
            key={m}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-tl-indigo/8 border border-tl-indigo/20 text-[11px] font-medium text-tl-indigo"
          >
            {m}
          </span>
        ))}
        {brief.mustHaves.length > 5 && (
          <span className="text-[11px] text-tl-text-tertiary">+{brief.mustHaves.length - 5}</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-[12px] text-tl-text-secondary">
        {brief.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-tl-text-tertiary" />
            {brief.location}
          </span>
        )}
        <span className="capitalize">{brief.workMode}</span>
        <span>
          {brief.experienceMin}–{brief.experienceMax}y
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-tl-border-subtle flex items-center justify-between text-[12px]">
        <div className="flex items-center gap-3 text-tl-text-secondary">
          <span>
            <strong className="text-tl-text-primary">{drafted}</strong> shortlisted
          </span>
          <span className="text-tl-border-strong">·</span>
          <span>
            <strong className="text-emerald-700">{liked}</strong> liked
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-semibold text-tl-indigo group-hover:gap-1.5 transition-all">
          Open <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-tl-border-default bg-tl-bg-surface p-10 sm:p-14 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-tl-indigo/10 border border-tl-indigo/20 flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-tl-indigo" />
      </div>
      <h2 className="text-[18px] font-semibold text-tl-text-primary">No briefs yet</h2>
      <p className="text-sm text-tl-text-secondary max-w-sm mx-auto mt-1.5">
        A brief is the role you want filled. Your AI Sourcer reads it, hunts candidates, and learns from your feedback.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-tl-indigo hover:bg-tl-indigo/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition-colors"
      >
        <Plus className="w-4 h-4" /> Create your first brief
      </button>
    </div>
  )
}

interface NewBriefPayload {
  title: string
  mustHaves: string[]
  niceToHaves: string[]
  location: string
  workMode: 'remote' | 'hybrid' | 'onsite' | 'any'
  experienceMin: number
  experienceMax: number
  signalSources: string[]
  bar: string
}

function NewBriefDialog({
  onClose, onSubmit, submitting,
}: {
  onClose: () => void
  onSubmit: (p: NewBriefPayload) => void | Promise<void>
  submitting: boolean
}) {
  const [title, setTitle] = useState('')
  const [mustHaves, setMustHaves] = useState<string[]>([])
  const [niceToHaves, setNiceToHaves] = useState<string[]>([])
  const [mustInput, setMustInput] = useState('')
  const [niceInput, setNiceInput] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'onsite' | 'any'>('any')
  const [expMin, setExpMin] = useState(0)
  const [expMax, setExpMax] = useState(8)
  const [signalSources, setSignalSources] = useState<string[]>(['GitHub', 'LinkedIn'])
  const [bar, setBar] = useState('')

  function addChip(value: string, list: string[], setter: (v: string[]) => void, clear: () => void) {
    const trimmed = value.trim()
    if (!trimmed || list.includes(trimmed) || list.length >= 20) { clear(); return }
    setter([...list, trimmed])
    clear()
  }
  function removeChip(value: string, list: string[], setter: (v: string[]) => void) {
    setter(list.filter((v) => v !== value))
  }

  function toggleSignal(s: string) {
    setSignalSources((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-tl-bg-surface rounded-t-2xl sm:rounded-2xl border border-tl-border-default shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-tl-border-default sticky top-0 bg-tl-bg-surface z-10">
          <div>
            <h2 className="text-[18px] font-semibold text-tl-text-primary">New brief</h2>
            <p className="text-xs text-tl-text-secondary">Phase 1 of 4 — Understanding the role.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-tl-bg-elevated text-tl-text-tertiary hover:text-tl-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Title */}
          <Field label="Role title" hint="e.g. Senior Backend Engineer · Payments">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Backend Engineer"
              className="form-input"
            />
          </Field>

          {/* Must-haves */}
          <Field label="Must-haves" hint="Skills or signals that gate selection. Press Enter to add.">
            <ChipInput
              value={mustInput}
              onChange={setMustInput}
              onCommit={() =>
                addChip(mustInput, mustHaves, setMustHaves, () => setMustInput(''))
              }
              chips={mustHaves}
              onRemove={(v) => removeChip(v, mustHaves, setMustHaves)}
              accent="indigo"
              placeholder="e.g. Python · Postgres · Distributed systems"
            />
          </Field>

          {/* Nice-to-haves */}
          <Field label="Nice-to-haves" hint="Bonus signals — improve score but don't gate.">
            <ChipInput
              value={niceInput}
              onChange={setNiceInput}
              onCommit={() =>
                addChip(niceInput, niceToHaves, setNiceToHaves, () => setNiceInput(''))
              }
              chips={niceToHaves}
              onRemove={(v) => removeChip(v, niceToHaves, setNiceToHaves)}
              accent="emerald"
              placeholder="e.g. ML adjacent · Open source · Fintech"
            />
          </Field>

          {/* Location + work mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location" hint="City, region, or 'Anywhere'">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote · US"
                className="form-input"
              />
            </Field>
            <Field label="Work mode">
              <div className="flex gap-1.5 flex-wrap">
                {(['any', 'remote', 'hybrid', 'onsite'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWorkMode(m)}
                    className={
                      'px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ' +
                      (workMode === m
                        ? 'bg-tl-indigo/10 border-tl-indigo text-tl-indigo'
                        : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-indigo/40')
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Experience */}
          <Field label="Experience range (years)">
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} max={40}
                value={expMin}
                onChange={(e) => setExpMin(Number(e.target.value))}
                className="form-input !w-24"
              />
              <span className="text-tl-text-tertiary">to</span>
              <input
                type="number" min={0} max={40}
                value={expMax}
                onChange={(e) => setExpMax(Number(e.target.value))}
                className="form-input !w-24"
              />
            </div>
          </Field>

          {/* Signal sources */}
          <Field label="Signal sources" hint="Where the AI should look for proof of skill.">
            <div className="flex flex-wrap gap-1.5">
              {SIGNAL_OPTIONS.map((s) => {
                const on = signalSources.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSignal(s)}
                    className={
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ' +
                      (on
                        ? 'bg-tl-indigo/10 border-tl-indigo text-tl-indigo'
                        : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-indigo/40')
                    }
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Bar */}
          <Field label='The bar for "great"' hint='What does an excellent candidate look like? Used to calibrate scoring.'>
            <textarea
              value={bar}
              onChange={(e) => setBar(e.target.value)}
              rows={4}
              className="form-input !rounded-xl"
              placeholder="Has shipped distributed Python services that handle 1k+ rps. Comfortable owning a service end-to-end. Demonstrated thoughtfulness in a public GitHub repo or talk."
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-tl-border-default sticky bottom-0 bg-tl-bg-surface">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-xl text-sm font-medium text-tl-text-secondary hover:bg-tl-bg-elevated transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSubmit({
                title: title.trim(),
                mustHaves, niceToHaves, location: location.trim(),
                workMode,
                experienceMin: Math.min(expMin, expMax),
                experienceMax: Math.max(expMin, expMax),
                signalSources, bar: bar.trim(),
              })
            }
            disabled={submitting || title.trim().length < 2}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-tl-indigo hover:bg-tl-indigo/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <>Create brief <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>

        <style jsx>{`
          .form-input {
            width: 100%;
            background: var(--tl-bg-surface);
            border: 1px solid var(--tl-border-default);
            color: var(--tl-text-primary);
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 14px;
            outline: none;
            transition: all 0.15s ease;
          }
          .form-input::placeholder { color: var(--tl-text-tertiary); }
          .form-input:focus {
            border-color: var(--tl-indigo);
            box-shadow: 0 0 0 3px rgba(79,70,229,0.18);
          }
        `}</style>
      </div>
    </div>
  )
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-tl-text-primary block">{label}</label>
      {hint && <p className="text-[11px] text-tl-text-tertiary">{hint}</p>}
      {children}
    </div>
  )
}

function ChipInput({
  value, onChange, onCommit, chips, onRemove, placeholder, accent,
}: {
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  chips: string[]
  onRemove: (v: string) => void
  placeholder?: string
  accent: 'indigo' | 'emerald'
}) {
  const chipCls =
    accent === 'indigo'
      ? 'bg-tl-indigo/10 text-tl-indigo border-tl-indigo/25'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {chips.map((c) => (
          <span
            key={c}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[12px] font-medium ${chipCls}`}
          >
            {c}
            <button
              type="button"
              onClick={() => onRemove(c)}
              className="hover:opacity-60 transition-opacity"
              aria-label={`Remove ${c}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            onCommit()
          } else if (e.key === 'Backspace' && !value && chips.length > 0) {
            onRemove(chips[chips.length - 1])
          }
        }}
        onBlur={onCommit}
        placeholder={placeholder}
        className="form-input"
      />
      <style jsx>{`
        .form-input {
          width: 100%;
          background: var(--tl-bg-surface);
          border: 1px solid var(--tl-border-default);
          color: var(--tl-text-primary);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.15s ease;
        }
        .form-input::placeholder { color: var(--tl-text-tertiary); }
        .form-input:focus {
          border-color: var(--tl-indigo);
          box-shadow: 0 0 0 3px rgba(79,70,229,0.18);
        }
      `}</style>
    </div>
  )
}
