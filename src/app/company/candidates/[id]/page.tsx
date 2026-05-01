'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { candidates, applications } from '@/lib/data'
import { STAGE_LABELS, STAGE_COLORS } from '@/lib/constants'
import { cn, timeAgo } from '@/lib/utils'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Globe,
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
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

function avatarBg(name: string): string {
  const palette = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  return palette[Math.abs(hash) % palette.length]
}

function formatDateRange(start: string, end?: string, current?: boolean): string {
  const fmt = (d: string) => {
    const [year, month] = d.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(month, 10) - 1]} ${year}`
  }
  return `${fmt(start)} – ${current ? 'Present' : end ? fmt(end) : 'Present'}`
}

// ─── Match Ring SVG ───────────────────────────────────────────────────────────

function MatchRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const color =
    score >= 90 ? '#10b981' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-muted/30" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-foreground">{score}%</span>
      </div>
    </div>
  )
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'experience' | 'skills' | 'assessments' | 'notes'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = candidates.find((c) => c.id === params.id) ?? candidates[0]
  const candidateApplications = applications.filter((a) => a.candidateId === candidate.id)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState<{ text: string; date: string }[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const matchScore = candidate.matchScore ?? getMatchScore(candidate.id)
  const verifiedSkills = candidate.skills.filter((s) => s.verified)
  const selfReportedSkills = candidate.skills.filter((s) => !s.verified)
  const assessmentEntries = Object.entries(candidate.assessmentScores)
  const bgGrad = avatarBg(candidate.name)

  const matchBreakdown = [
    { label: 'Overall Match', value: matchScore, color: 'bg-emerald-500' },
    { label: 'Skills Match', value: Math.min(100, Math.round(matchScore * 0.97)), color: 'bg-blue-500' },
    { label: 'Culture Fit', value: Math.min(100, Math.round(matchScore * 0.93)), color: 'bg-purple-500' },
    { label: 'Experience Alignment', value: Math.min(100, Math.round(matchScore * 1.02)), color: 'bg-cyan-500' },
  ]

  const aiReasons = [
    `${verifiedSkills[0]?.name ?? 'Primary skill'} verified at ${verifiedSkills[0]?.score ?? 90}% — top 5% of candidates`,
    'Current role at a leading tech company with directly relevant experience',
    `Salary expectation of $${Math.round(candidate.salaryExpectation / 1000)}K aligns with budget range`,
    `${candidate.workPreference.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' / ')} preference matches posting`,
    `${candidate.education[0]?.degree ?? 'Degree'} from ${candidate.education[0]?.institution ?? 'university'} — strong background`,
  ]

  const riskSignals = [
    { text: 'No direct industry-specific experience in recent roles', severity: 'medium' },
    { text: 'Short tenure detected at previous position', severity: 'low' },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'experience', label: 'Experience' },
    { key: 'skills', label: 'Skills' },
    { key: 'assessments', label: 'Assessments' },
    { key: 'notes', label: `Notes${notes.length > 0 ? ` (${notes.length})` : ''}` },
  ]

  const saveNote = () => {
    if (!noteInput.trim()) return
    setNotes((p) => [{ text: noteInput.trim(), date: new Date().toISOString() }, ...p])
    setNoteInput('')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Back nav */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-6">
        <Link
          href="/company/candidates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Candidates
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-[300px,1fr] gap-6">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card p-6 lg:sticky lg:top-6 space-y-5 h-fit"
        >
          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className={cn('w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-br', bgGrad)}>
                {candidate.name.slice(0, 2).toUpperCase()}
              </div>
              {candidate.verified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-2 border-card flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </span>
              )}
            </div>
            {candidate.premium && (
              <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full mb-2">
                ⚡ Premium
              </span>
            )}
            <h1 className="text-xl font-bold text-foreground">{candidate.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{candidate.title}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {candidate.location}
            </div>
            <div className="mt-2">
              <span className={cn(
                'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium',
                candidate.availability.toLowerCase().includes('immediately') || candidate.availability.toLowerCase().includes('now')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {candidate.availability}
              </span>
            </div>
          </div>

          {/* Match ring */}
          <div className="flex flex-col items-center gap-1">
            <MatchRing score={matchScore} size={80} />
            <p className="text-xs text-muted-foreground">AI Match Score</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Contact */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
            <a href={`mailto:${candidate.email}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-blue-400 transition-colors group">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </a>
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{candidate.phone ?? '—'}</span>
            </div>
            {candidate.portfolio && (
              <a href={`https://${candidate.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-purple-400 transition-colors">
                <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">{candidate.portfolio}</span>
              </a>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
              <Calendar className="w-4 h-4" />
              Schedule Interview
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-white/[0.05] transition-all">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all">
              <ChevronRight className="w-4 h-4" />
              Move to Offer
            </button>
            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu((p) => !p)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
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
                    className="absolute bottom-full left-0 right-0 mb-1 glass-card p-2 space-y-0.5 z-10"
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
                            ? 'text-red-400 hover:bg-red-500/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
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
              <div className="h-px bg-border" />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Application History</p>
                <div className="space-y-2">
                  {candidateApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{app.job?.title ?? 'Unknown Role'}</p>
                        <p className="text-[10px] text-muted-foreground">{timeAgo(app.appliedAt)}</p>
                      </div>
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0', STAGE_COLORS[app.stage])}>
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
          className="space-y-6"
        >
          {/* Tab nav */}
          <div className="flex gap-1 p-1 glass-card rounded-xl overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  activeTab === t.key
                    ? 'bg-white/[0.1] text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
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
                className="space-y-5"
              >
                {/* Bio */}
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-foreground mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{candidate.bio}</p>
                </div>

                {/* AI Match Analysis */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">AI Match Analysis</h3>
                      <p className="text-xs text-muted-foreground">Calibr intelligence score breakdown</p>
                    </div>
                    <div className="ml-auto">
                      <MatchRing score={matchScore} size={64} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {matchBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-bold text-foreground">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', item.color)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why this candidate */}
                <div className="glass-card p-6">
                  <h3 className="text-base font-semibold text-foreground mb-4">Why this candidate?</h3>
                  <ul className="space-y-3">
                    {aiReasons.map((reason, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {reason}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Risk Signals */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-semibold text-foreground">Risk Signals</h3>
                  </div>
                  <div className="space-y-3">
                    {riskSignals.map((signal, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-3 p-3.5 rounded-xl border text-sm',
                          signal.severity === 'medium'
                            ? 'bg-amber-500/[0.06] border-amber-500/20 text-amber-400'
                            : 'bg-yellow-500/[0.04] border-yellow-500/15 text-yellow-500'
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
                className="glass-card p-6"
              >
                <h3 className="text-base font-semibold text-foreground mb-6">Work History</h3>
                <div className="relative border-l-2 border-primary/20 ml-4 space-y-6">
                  {candidate.experience.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="relative pl-8"
                    >
                      <div className={cn(
                        'absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-card',
                        exp.current ? 'bg-emerald-400' : 'bg-primary/60'
                      )} />
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{exp.company}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                          </span>
                          {exp.current && (
                            <div>
                              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Current
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{exp.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.skills.map((skill) => (
                          <span key={skill} className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/[0.07] border border-blue-500/15 text-blue-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                className="space-y-5"
              >
                {verifiedSkills.length > 0 && (
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-semibold text-foreground">Verified Skills</h3>
                      <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        {verifiedSkills.length} verified
                      </span>
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
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Verified
                              </span>
                            </div>
                            {skill.score !== undefined && (
                              <span className="text-sm font-bold text-foreground">{skill.score}%</span>
                            )}
                          </div>
                          {skill.score !== undefined && (
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.score}%` }}
                                transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selfReportedSkills.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-foreground mb-5">Self-Reported Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selfReportedSkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground"
                        >
                          {skill.name}
                          <span className="text-[10px] text-muted-foreground capitalize">{skill.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {assessmentEntries.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-base font-semibold text-foreground mb-5">Assessments Passed</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {assessmentEntries.map(([key, score], i) => {
                        const pct = Math.round(100 - (100 - score) * 0.4)
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-sm font-bold text-foreground">{score}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-1">
                              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${score}%` }} />
                            </div>
                            <p className={cn('text-xs font-medium', pct >= 90 ? 'text-emerald-400' : 'text-blue-400')}>
                              Top {100 - pct}%
                            </p>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
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
                className="glass-card overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-base font-semibold text-foreground">Assessment Scores</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Calibr verified technical assessments</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-white/[0.02]">
                        {['Assessment', 'Score', 'Percentile', 'Status'].map((h) => (
                          <th key={h} className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">
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
                            className="border-b border-border/50 hover:bg-white/[0.02] transition-colors last:border-0"
                          >
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-medium text-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">{score}%</span>
                                <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${score}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={cn('text-sm font-semibold', pct >= 90 ? 'text-emerald-400' : 'text-blue-400')}>
                                Top {100 - pct}%
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </span>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
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
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Add Note</h3>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Write a note about this candidate…"
                    rows={4}
                    className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={saveNote}
                      disabled={!noteInput.trim()}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
                {notes.length === 0 ? (
                  <div className="glass-card p-10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-foreground">No notes yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add a note to keep track of your thoughts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-4"
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed">{note.text}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-2">{timeAgo(note.date)}</p>
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
