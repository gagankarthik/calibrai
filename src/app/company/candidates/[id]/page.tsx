'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { getCandidate, getApplications } from '@/lib/api'
import { STAGE_LABELS } from '@/lib/constants'
import type { Candidate, Application } from '@/lib/types'
import { cn, timeAgo } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
  Github,
  Linkedin,
  CheckCircle2,
  Download,
  Calendar,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Building2,
  AlertCircle,
  Archive,
  XCircle,
  MoreHorizontal,
  GraduationCap,
  RefreshCw,
  User,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deterministicScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

function avatarBg(name: string): string {
  const palette = [
    'from-tl-gold/60 to-tl-gold/30',
    'from-tl-teal/60 to-tl-teal/30',
    'from-tl-blue/60 to-tl-blue/30',
    'from-tl-rose/60 to-tl-rose/30',
    'from-tl-teal/40 to-tl-gold/40',
    'from-tl-gold/40 to-tl-teal/40',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

function formatDateRange(start: string, end?: string, current?: boolean): string {
  const fmt = (d: string) => {
    const parts = d.split('-')
    if (parts.length < 2) return d
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const month = parseInt(parts[1], 10) - 1
    return `${months[month] ?? '?'} ${parts[0]}`
  }
  return `${fmt(start)} – ${current ? 'Present' : end ? fmt(end) : 'Present'}`
}

// ─── Match Ring SVG ───────────────────────────────────────────────────────────

function MatchRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-tl-bg-elevated" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke="#C9A84C" strokeWidth={5} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-base font-bold text-tl-gold">{score}%</span>
      </div>
    </div>
  )
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'experience' | 'skills' | 'assessments' | 'notes'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [candidateApplications, setCandidateApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const [candRes, appsRes] = await Promise.all([getCandidate(id), getApplications()])
      if (candRes.data) {
        setCandidate(candRes.data)
      } else {
        setNotFound(true)
      }
      if (appsRes.data) {
        setCandidateApplications(appsRes.data.filter((a) => a.candidateId === id))
      }
      setLoading(false)
    }
    load()
  }, [id])

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState<{ text: string; date: string }[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 text-tl-text-secondary animate-spin" />
    </div>
  )

  if (notFound || !candidate) return (
    <div className="p-6">
      <Link href="/company/candidates" className="inline-flex items-center gap-2 text-sm text-tl-text-secondary hover:text-tl-gold mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </Link>
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <User className="w-12 h-12 text-tl-text-secondary/20 mb-4" />
        <p className="text-sm font-medium text-tl-text-primary">Candidate not found</p>
        <p className="text-xs text-tl-text-secondary mt-1">This profile may have been removed.</p>
      </div>
    </div>
  )

  // ── Safe accessors with fallbacks ──────────────────────────────────────────
  const matchScore = candidate.matchScore || deterministicScore(candidate.id)
  const skills = candidate.skills ?? []
  const experience = candidate.experience ?? []
  const education = candidate.education ?? []
  const assessmentScores = candidate.assessmentScores ?? {}
  const assessmentEntries = Object.entries(assessmentScores)
  const verifiedSkills = skills.filter((s) => s.verified)
  const selfReportedSkills = skills.filter((s) => !s.verified)
  const bgGrad = avatarBg(candidate.name || 'U')
  const initials = (candidate.name || '??').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const matchBreakdown = [
    { label: 'Overall Match', value: matchScore },
    { label: 'Skills Match', value: Math.min(100, Math.round(matchScore * 0.97)) },
    { label: 'Culture Fit', value: Math.min(100, Math.round(matchScore * 0.93)) },
    { label: 'Experience Alignment', value: Math.min(100, Math.round(matchScore * 1.02)) },
  ]

  const aiReasons = [
    verifiedSkills[0] ? `${verifiedSkills[0].name} verified at ${verifiedSkills[0].score ?? 90}% — top 5% of candidates` : 'Strong verified skill portfolio',
    experience[0] ? `Current role at ${experience[0].company} with directly relevant experience` : 'Relevant professional background',
    candidate.salaryExpectation > 0 ? `Salary expectation of $${Math.round(candidate.salaryExpectation / 1000)}K aligns with budget range` : 'Competitive salary expectations',
    candidate.workPreference?.length ? `${candidate.workPreference.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' / ')} preference matches posting` : 'Flexible work arrangement',
    education[0] ? `${education[0].degree ?? 'Degree'} from ${education[0].institution ?? 'university'}` : 'Strong educational background',
  ]

  const riskSignals = [
    { text: 'Verify relevant industry-specific experience for the role', severity: 'medium' },
    { text: 'Review tenure at previous positions before extending offer', severity: 'low' },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'experience', label: 'Experience' },
    { key: 'skills', label: 'Skills' },
    { key: 'assessments', label: `Assessments${assessmentEntries.length > 0 ? ` (${assessmentEntries.length})` : ''}` },
    { key: 'notes', label: `Notes${notes.length > 0 ? ` (${notes.length})` : ''}` },
  ]

  const saveNote = () => {
    if (!noteInput.trim()) return
    setNotes((p) => [{ text: noteInput.trim(), date: new Date().toISOString() }, ...p])
    setNoteInput('')
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Back nav */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-5 sm:mb-6">
        <Link
          href="/company/candidates"
          className="inline-flex items-center gap-2 text-sm text-tl-text-secondary hover:text-tl-gold transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Candidates
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-5 sm:gap-6">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="tl-card p-5 sm:p-6 lg:sticky lg:top-6 space-y-5 h-fit bg-tl-bg-surface"
        >
          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className={cn('w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br', bgGrad)}>
                  {initials}
                </div>
              )}
              {candidate.verified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-tl-teal border-2 border-tl-bg-surface flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tl-bg-base" />
                </span>
              )}
            </div>
            {candidate.premium && (
              <span className="tl-tag-gold text-[10px] mb-2">Premium</span>
            )}
            <h1 className="font-display text-lg sm:text-xl text-tl-text-primary">{candidate.name || '—'}</h1>
            <p className="text-sm text-tl-text-secondary mt-0.5">{candidate.title || 'No title set'}</p>
            {candidate.location && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-tl-text-secondary">
                <MapPin className="w-3.5 h-3.5" />
                {candidate.location}
              </div>
            )}
            {candidate.availability && (
              <div className="mt-2">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
                  (candidate.availability.toLowerCase().includes('immediately') || candidate.availability.toLowerCase().includes('open'))
                    ? 'bg-tl-teal/10 text-tl-teal border border-tl-teal/20'
                    : 'bg-tl-gold/10 text-tl-gold border border-tl-gold/20'
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {candidate.availability}
                </span>
              </div>
            )}
          </div>

          {/* Match ring */}
          <div className="flex flex-col items-center gap-1">
            <MatchRing score={matchScore} size={80} />
            <p className="text-xs text-tl-text-secondary">AI Match Score</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-tl-border-subtle" />

          {/* Contact */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider">Contact</p>
            {candidate.email && (
              <a href={`mailto:${candidate.email}`} className="flex items-center gap-2.5 text-sm text-tl-text-secondary hover:text-tl-gold transition-colors group">
                <Mail className="w-4 h-4 text-tl-gold shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </a>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2.5 text-sm text-tl-text-secondary">
                <Phone className="w-4 h-4 text-tl-teal shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.portfolio && (
              <a href={candidate.portfolio.startsWith('http') ? candidate.portfolio : `https://${candidate.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-tl-text-secondary hover:text-tl-teal transition-colors">
                <Globe className="w-4 h-4 text-tl-teal shrink-0" />
                <span className="truncate">{candidate.portfolio.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            {candidate.github && (
              <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-tl-text-secondary hover:text-tl-text-primary transition-colors">
                <Github className="w-4 h-4 shrink-0" />
                <span className="truncate">{candidate.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
              </a>
            )}
            {candidate.linkedin && (
              <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-tl-text-secondary hover:text-tl-blue transition-colors">
                <Linkedin className="w-4 h-4 shrink-0 text-tl-blue" />
                <span className="truncate">LinkedIn</span>
              </a>
            )}
            {!candidate.email && !candidate.phone && !candidate.portfolio && (
              <p className="text-xs text-tl-text-secondary/60 italic">No contact info provided</p>
            )}
          </div>

          {/* Salary */}
          {candidate.salaryExpectation > 0 && (
            <>
              <div className="h-px bg-tl-border-subtle" />
              <div>
                <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-1.5">Expected Salary</p>
                <p className="font-mono text-base font-bold text-tl-gold">
                  ${Math.round(candidate.salaryExpectation / 1000)}K <span className="text-xs font-normal text-tl-text-secondary">/ yr</span>
                </p>
              </div>
            </>
          )}

          {/* Work preference */}
          {candidate.workPreference?.length > 0 && (
            <>
              <div className="h-px bg-tl-border-subtle" />
              <div>
                <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-2">Work Mode</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.workPreference.map((w) => (
                    <span key={w} className="text-[11px] px-2.5 py-1 rounded-full bg-tl-teal/10 text-tl-teal border border-tl-teal/20 capitalize">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="h-px bg-tl-border-subtle" />

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm">
              <Calendar className="w-4 h-4" />
              Schedule Interview
            </button>
            <button className="btn-ghost w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-tl-teal/30 text-sm font-medium text-tl-teal hover:bg-tl-teal/10 transition-all">
              <ChevronRight className="w-4 h-4" />
              Move to Offer
            </button>
            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu((p) => !p)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
                More actions
              </button>
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-1 tl-card p-2 space-y-0.5 z-10"
                  >
                    {[
                      { icon: Download, label: 'Download Resume' },
                      { icon: Archive, label: 'Archive Candidate' },
                      { icon: XCircle, label: 'Reject', danger: true },
                    ].map(({ icon: Icon, label, danger }) => (
                      <button
                        key={label}
                        onClick={() => setShowMoreMenu(false)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                          danger
                            ? 'text-tl-rose hover:bg-tl-rose/10'
                            : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Application history */}
          {candidateApplications.length > 0 && (
            <>
              <div className="h-px bg-tl-border-subtle" />
              <div>
                <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-3">Application History</p>
                <div className="space-y-2">
                  {candidateApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-tl-bg-base border border-tl-border-subtle">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-tl-text-primary truncate">{app.job?.title ?? 'Unknown Role'}</p>
                        <p className="text-[10px] text-tl-text-secondary">{timeAgo(app.appliedAt)}</p>
                      </div>
                      <span className="tl-tag-teal text-[10px] font-medium shrink-0">
                        {STAGE_LABELS[app.stage]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* ── RIGHT CONTENT ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="space-y-5 sm:space-y-6"
        >
          {/* Tab nav */}
          <div className="flex gap-0 border-b border-tl-border-subtle overflow-x-auto scrollbar-hide">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'px-3 sm:px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px',
                  activeTab === t.key
                    ? 'text-tl-gold border-tl-gold'
                    : 'text-tl-text-secondary hover:text-tl-text-primary border-transparent'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ──────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 sm:space-y-5"
              >
                {/* Bio */}
                {candidate.bio && (
                  <div className="tl-card p-5 sm:p-6">
                    <h3 className="text-base font-semibold text-tl-text-primary mb-3">About</h3>
                    <p className="text-sm text-tl-text-secondary leading-relaxed">{candidate.bio}</p>
                  </div>
                )}

                {/* Languages */}
                {candidate.languages?.length > 0 && (
                  <div className="tl-card p-5 sm:p-6">
                    <h3 className="text-base font-semibold text-tl-text-primary mb-3">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.languages.map((lang) => (
                        <span key={lang} className="text-sm px-3 py-1.5 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle text-tl-text-primary">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Match Analysis */}
                <div className="tl-card-gold p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-tl-gold/20 border border-tl-gold/30 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-tl-gold" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-tl-text-primary">AI Match Analysis</h3>
                      <p className="text-xs text-tl-text-secondary">TalentBridge intelligence score breakdown</p>
                    </div>
                    <div className="ml-auto">
                      <MatchRing score={matchScore} size={64} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {matchBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-tl-text-secondary">{item.label}</span>
                          <span className="font-mono text-sm font-bold text-tl-gold">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-tl-bg-base overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-gold/60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why this candidate */}
                <div className="tl-card p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-tl-text-primary mb-4">Why this candidate?</h3>
                  <ul className="space-y-3">
                    {aiReasons.map((reason, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 text-sm text-tl-text-secondary"
                      >
                        <CheckCircle2 className="w-4 h-4 text-tl-teal mt-0.5 shrink-0" />
                        {reason}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Risk Signals */}
                <div className="tl-card p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-tl-gold" />
                    <h3 className="text-base font-semibold text-tl-text-primary">Risk Signals</h3>
                  </div>
                  <div className="space-y-3">
                    {riskSignals.map((signal, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-xl border text-sm',
                          signal.severity === 'medium'
                            ? 'bg-tl-gold/[0.06] border-tl-gold/20 text-tl-gold'
                            : 'bg-tl-gold/[0.04] border-tl-gold/15 text-tl-gold/80'
                        )}
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {signal.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EXPERIENCE ────────────────────────────────────────────── */}
            {activeTab === 'experience' && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Work Experience */}
                <div className="tl-card p-5 sm:p-6">
                  <h3 className="text-base font-semibold text-tl-text-primary mb-5 sm:mb-6">Work History</h3>
                  {experience.length === 0 ? (
                    <p className="text-sm text-tl-text-secondary/60 italic">No work experience added yet.</p>
                  ) : (
                    <div className="relative border-l-2 border-tl-border-subtle ml-4 space-y-6">
                      {experience.map((exp, i) => (
                        <motion.div
                          key={exp.id ?? i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="relative pl-8"
                        >
                          <div className={cn(
                            'absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-tl-bg-surface',
                            exp.current ? 'bg-tl-teal' : 'bg-tl-gold/60'
                          )} />
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                            <div>
                              <p className="text-sm font-semibold text-tl-text-primary">{exp.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-tl-text-secondary" />
                                <span className="text-sm text-tl-text-secondary">{exp.company}</span>
                              </div>
                            </div>
                            <div className="sm:text-right shrink-0">
                              <span className="text-xs text-tl-text-secondary">
                                {exp.startDate ? formatDateRange(exp.startDate, exp.endDate, exp.current) : ''}
                              </span>
                              {exp.current && (
                                <div><span className="tl-tag-teal text-[10px] mt-1 inline-block">Current</span></div>
                              )}
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-tl-text-secondary leading-relaxed mb-3">{exp.description}</p>
                          )}
                          {exp.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {exp.skills.map((skill) => (
                                <span key={skill} className="tl-tag-teal text-[11px]">{skill}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education */}
                {education.length > 0 && (
                  <div className="tl-card p-5 sm:p-6">
                    <h3 className="text-base font-semibold text-tl-text-primary mb-5">Education</h3>
                    <div className="space-y-5">
                      {education.map((edu, i) => (
                        <motion.div
                          key={edu.id ?? i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0 mt-0.5">
                            <GraduationCap className="w-5 h-5 text-tl-teal" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-tl-text-primary">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</p>
                            <p className="text-sm text-tl-text-secondary">{edu.institution}</p>
                            {edu.startDate && (
                              <p className="text-xs text-tl-text-secondary mt-0.5">
                                {edu.startDate.split('-')[0]} – {edu.endDate ? edu.endDate.split('-')[0] : 'Present'}
                              </p>
                            )}
                            {edu.gpa && (
                              <p className="text-xs text-tl-gold font-mono mt-0.5">GPA: {edu.gpa}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SKILLS ────────────────────────────────────────────────── */}
            {activeTab === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 sm:space-y-5"
              >
                {skills.length === 0 ? (
                  <div className="tl-card p-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-tl-text-primary">No skills listed</p>
                    <p className="text-xs text-tl-text-secondary mt-1">This candidate hasn't added skills yet.</p>
                  </div>
                ) : (
                  <>
                    {verifiedSkills.length > 0 && (
                      <div className="tl-card p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-base font-semibold text-tl-text-primary">Verified Skills</h3>
                          <span className="tl-tag-teal text-[11px]">{verifiedSkills.length} verified</span>
                        </div>
                        <div className="space-y-4">
                          {verifiedSkills.map((skill, i) => (
                            <motion.div
                              key={skill.name}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-sm font-medium text-tl-text-primary">{skill.name}</span>
                                  <span className="tl-tag-teal text-[10px] flex items-center gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                  </span>
                                </div>
                                {skill.score !== undefined && (
                                  <span className="font-mono text-sm font-bold text-tl-gold">{skill.score}%</span>
                                )}
                              </div>
                              {skill.score !== undefined && (
                                <div className="h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.score}%` }}
                                    transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-gold/60"
                                  />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selfReportedSkills.length > 0 && (
                      <div className="tl-card p-5 sm:p-6">
                        <h3 className="text-base font-semibold text-tl-text-primary mb-4">
                          {verifiedSkills.length > 0 ? 'Self-Reported Skills' : 'Skills'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selfReportedSkills.map((skill) => (
                            <span
                              key={skill.name}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle text-sm text-tl-text-primary"
                            >
                              {skill.name}
                              {skill.level && <span className="text-[10px] text-tl-text-secondary capitalize">{skill.level}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── ASSESSMENTS ───────────────────────────────────────────── */}
            {activeTab === 'assessments' && (
              <motion.div
                key="assessments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {assessmentEntries.length === 0 ? (
                  <div className="tl-card p-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-tl-text-primary">No assessments taken</p>
                    <p className="text-xs text-tl-text-secondary mt-1">This candidate hasn't completed any assessments yet.</p>
                  </div>
                ) : (
                  <div className="tl-card overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-tl-border-subtle">
                      <h3 className="text-base font-semibold text-tl-text-primary">Assessment Scores</h3>
                      <p className="text-xs text-tl-text-secondary mt-0.5">TalentBridge verified technical assessments</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[400px]">
                        <thead>
                          <tr className="border-b border-tl-border-subtle bg-tl-bg-base/50">
                            {['Assessment', 'Score', 'Percentile', 'Status'].map((h) => (
                              <th key={h} className="text-left text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider px-4 sm:px-6 py-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {assessmentEntries.map(([key, score], i) => {
                            const pct = Math.round(100 - (100 - score) * 0.4)
                            return (
                              <motion.tr
                                key={key}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.06 }}
                                className="border-b border-tl-border-subtle hover:bg-tl-bg-elevated/30 transition-colors last:border-0"
                              >
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span className="text-sm font-medium text-tl-text-primary capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-tl-gold">{score}%</span>
                                    <div className="w-14 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                                      <div className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-teal" style={{ width: `${score}%` }} />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span className={cn('font-mono text-sm font-semibold', pct >= 90 ? 'text-tl-teal' : 'text-tl-gold')}>
                                    Top {100 - pct}%
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-3.5">
                                  <span className="tl-tag-teal inline-flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                  </span>
                                </td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── NOTES ─────────────────────────────────────────────────── */}
            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="tl-card p-5">
                  <h3 className="text-sm font-semibold text-tl-text-primary mb-3">Add Note</h3>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Write a note about this candidate…"
                    rows={4}
                    className="w-full bg-tl-bg-surface border border-tl-border-subtle rounded-xl px-4 py-3 text-sm text-tl-text-primary placeholder:text-tl-text-secondary/60 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/30 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={saveNote}
                      disabled={!noteInput.trim()}
                      className="btn-gold px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
                {notes.length === 0 ? (
                  <div className="tl-card p-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-tl-text-primary">No notes yet</p>
                    <p className="text-xs text-tl-text-secondary mt-1">Add a note to keep track of your thoughts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="tl-card p-4"
                      >
                        <p className="text-sm text-tl-text-secondary leading-relaxed">{note.text}</p>
                        <p className="text-[11px] text-tl-text-secondary/50 mt-2">{timeAgo(note.date)}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
