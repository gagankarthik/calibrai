'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { jobs } from '@/lib/data'
import { formatSalary, timeAgo, cn } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Building2,
  Globe,
  Briefcase,
  Users,
  Eye,
  CheckCircle2,
  Info,
  Bookmark,
  Share2,
  Clock,
  Zap,
  Heart,
  BookOpen,
  TrendingUp,
  Bell,
  Plus,
  ExternalLink,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { WORK_MODE_LABELS, JOB_TYPE_LABELS, EXPERIENCE_LABELS } from '@/lib/constants'

// ─── Deterministic match score ────────────────────────────────────────────────
function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}

// ─── Avatar color hash ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// ─── Benefit icon map ─────────────────────────────────────────────────────────
function benefitIcon(benefit: string): React.ReactNode {
  const b = benefit.toLowerCase()
  if (b.includes('remote') || b.includes('wifi'))  return <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
  if (b.includes('health') || b.includes('wellness') || b.includes('benefit')) return <Heart className="w-4 h-4 text-rose-400 shrink-0" />
  if (b.includes('401') || b.includes('pension'))  return <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
  if (b.includes('learn') || b.includes('education') || b.includes('conference')) return <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
  if (b.includes('pto') || b.includes('vacation') || b.includes('unlimited')) return <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
  if (b.includes('equity') || b.includes('stock') || b.includes('salary')) return <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
  return <Zap className="w-4 h-4 text-amber-400 shrink-0" />
}

// ─── Work mode badge config ───────────────────────────────────────────────────
const WORK_MODE_STYLES: Record<string, string> = {
  remote: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  hybrid: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  onsite: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
}

function WorkModeIcon({ mode }: { mode: string }) {
  if (mode === 'remote') return <Wifi className="w-3.5 h-3.5" />
  if (mode === 'hybrid') return <Building2 className="w-3.5 h-3.5" />
  return <Globe className="w-3.5 h-3.5" />
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
        checked ? 'bg-primary' : 'bg-muted'
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
          checked && 'translate-x-[18px]'
        )}
      />
    </button>
  )
}

// ─── Alex's skills for match analysis ────────────────────────────────────────
const ALEX_SKILLS = ['react', 'typescript', 'next.js', 'css', 'tailwind', 'graphql', 'node.js', 'javascript', 'performance']
function hasSkill(skill: string): boolean {
  const low = skill.toLowerCase()
  return ALEX_SKILLS.some(s => low.includes(s) || s.includes(low.split(' ')[0]))
}

// ─── Fade-up animation helper ─────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job     = jobs.find(j => j.id === params.id) ?? jobs[0]
  const score   = getMatchScore(job.id)
  const [saved, setSaved]     = useState(false)
  const [applied, setApplied] = useState(false)
  const [alertOn, setAlertOn] = useState(false)

  const matchedSkills  = useMemo(() => job.skills.filter(s => hasSkill(s)), [job.skills])
  const missingSkills  = useMemo(() => job.skills.filter(s => !hasSkill(s)), [job.skills])
  const topThree       = matchedSkills.slice(0, 3)

  const similarJobs = useMemo(() =>
    jobs
      .filter(j => j.id !== job.id && j.company.industry === job.company.industry)
      .slice(0, 3)
      .map(j => ({ ...j, score: getMatchScore(j.id) })),
    [job]
  )

  const daysPosted = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000)
  const daysLeft   = Math.max(0, Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86400000))

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── BREADCRUMB ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/talent/jobs"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-foreground font-medium truncate">{job.title}</span>
      </motion.div>

      {/* ── JOB HEADER CARD ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)} className="glass-card p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">

          {/* Left: avatar + center info */}
          <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black', avatarColor(job.company.name))}>
                {job.company.name[0]}
              </div>
              {job.company.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-foreground leading-tight mb-1">{job.title}</h1>
              <p className="text-xl text-muted-foreground font-medium mb-3">{job.company.name}</p>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium', WORK_MODE_STYLES[job.workMode] ?? WORK_MODE_STYLES.onsite)}>
                  <WorkModeIcon mode={job.workMode} />
                  {WORK_MODE_LABELS[job.workMode]}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs text-muted-foreground">
                  <Briefcase className="w-3 h-3" />{JOB_TYPE_LABELS[job.type]}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs text-muted-foreground">
                  {EXPERIENCE_LABELS[job.level]}
                </span>
              </div>

              {/* Salary */}
              <p className="text-2xl font-bold text-primary">
                ${job.salaryMin.toLocaleString()} &ndash; ${job.salaryMax.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">/ year</span>
              </p>
            </div>
          </div>

          {/* Right: match ring + CTA */}
          <div className="flex flex-col items-center gap-3 shrink-0 sm:min-w-[160px]">
            <MatchRing score={score} size={100} />
            <p className="text-sm font-semibold text-foreground text-center">You're a {score}% match</p>
            <Button
              className="h-12 w-48 text-base font-semibold"
              onClick={() => setApplied(true)}
            >
              {applied ? '✓ Applied!' : 'Apply Now →'}
            </Button>
            <Button
              variant="ghost"
              className={cn('w-48 gap-2', saved && 'text-primary')}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
              {saved ? 'Saved' : 'Save Job'}
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-border mt-6 pt-6 flex flex-wrap gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />{job.applicantCount} applicants
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />{(job.viewCount || 892).toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />Posted {daysPosted}d ago
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />Expires in {daysLeft}d
          </span>
        </div>
      </motion.div>

      {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">

        {/* ── LEFT COLUMN ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* About the Role */}
          <motion.div {...fadeUp(0.1)} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">About the Role</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
          </motion.div>

          {/* What You'll Do */}
          <motion.div {...fadeUp(0.14)} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">What You&apos;ll Do</h3>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Nice to Have */}
          {job.niceToHave.length > 0 && (
            <motion.div {...fadeUp(0.17)} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Nice to Have</h3>
              <ul className="space-y-3">
                {job.niceToHave.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Plus className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* What We Offer */}
          {job.benefits.length > 0 && (
            <motion.div {...fadeUp(0.2)} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">What We Offer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map(b => (
                  <div key={b} className="flex items-center gap-3 text-sm text-muted-foreground">
                    {benefitIcon(b)}
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* About Company */}
          <motion.div {...fadeUp(0.23)} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">About {job.company.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0', avatarColor(job.company.name))}>
                {job.company.name[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground">{job.company.name}</p>
                {job.company.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-400">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Company
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground">{job.company.industry}</span>
              <span className="px-2.5 py-1 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground">{job.company.size} employees</span>
              <span className="px-2.5 py-1 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />{job.company.location}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{job.company.description}</p>
            <a
              href={`https://${job.company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit Website
            </a>
          </motion.div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <motion.div {...fadeUp(0.26)} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Similar Jobs</h3>
              <div className="space-y-1">
                {similarJobs.map(sj => (
                  <div key={sj.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(sj.company.name))}>
                      {sj.company.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sj.title}</p>
                      <p className="text-xs text-muted-foreground">{sj.company.name}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-primary">{sj.score}%</span>
                      <Link href={`/talent/jobs/${sj.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT STICKY COLUMN ──────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4 sticky top-24 self-start">

          {/* Why You're a Strong Match */}
          <motion.div {...fadeUp(0.1)} className="glass-card p-5">
            <h4 className="text-sm font-semibold text-foreground mb-3">Why You&apos;re a Strong Match</h4>
            {topThree.length > 0 ? (
              <div className="space-y-2.5">
                {topThree.map((skill, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span>Your <span className="text-foreground font-medium">{skill}</span> expertise matches this role</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Build your skills to improve your match score.</p>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground italic bg-muted/30 rounded-lg p-2.5 leading-relaxed">
              AI Analysis: Strong technical alignment based on your profile and this role&apos;s requirements.
            </p>
          </motion.div>

          {/* Skills Breakdown */}
          <motion.div {...fadeUp(0.14)} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground">Skills Breakdown</h4>
              <span className="text-xs text-muted-foreground">{matchedSkills.length}/{job.skills.length} matched</span>
            </div>

            {matchedSkills.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 mb-2">Matched</p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />{s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingSkills.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 mb-2">To Learn</p>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.slice(0, 5).map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium">
                      <Info className="w-3 h-3 shrink-0" />{s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Set Job Alert */}
          <motion.div {...fadeUp(0.18)} className="glass-card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Get notified of similar roles</p>
              {alertOn && (
                <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Alert is active
                </p>
              )}
            </div>
            <ToggleSwitch checked={alertOn} onChange={setAlertOn} />
          </motion.div>

          {/* Share */}
          <motion.div {...fadeUp(0.21)}>
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
              <Share2 className="w-4 h-4" /> Share This Job
            </Button>
          </motion.div>

          {/* Report */}
          <motion.div {...fadeUp(0.23)} className="text-center">
            <button className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2">
              Report listing
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
