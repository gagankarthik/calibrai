'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getJob, getJobs, getTalentProfile, applyToJob } from '@/lib/api'
import type { Job } from '@/lib/types'
import { formatSalary, timeAgo, cn, companyLogoSrc } from '@/lib/utils'
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

// â”€â”€â”€ Deterministic match score (fallback only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 25)
}

interface MatchInfo {
  score: number
  reason: string
}

// â”€â”€â”€ Avatar color hash â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AVATAR_COLORS = [
  'bg-tl-blue', 'bg-tl-teal', 'bg-tl-rose', 'bg-tl-gold',
  'bg-blue-700', 'bg-cyan-700', 'bg-fuchsia-700', 'bg-teal-700',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// â”€â”€â”€ Benefit icon map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function benefitIcon(benefit: string): React.ReactNode {
  const b = benefit.toLowerCase()
  if (b.includes('remote') || b.includes('wifi'))  return <Wifi className="w-4 h-4 text-tl-teal shrink-0" />
  if (b.includes('health') || b.includes('wellness') || b.includes('benefit')) return <Heart className="w-4 h-4 text-tl-rose shrink-0" />
  if (b.includes('401') || b.includes('pension'))  return <TrendingUp className="w-4 h-4 text-tl-teal shrink-0" />
  if (b.includes('learn') || b.includes('education') || b.includes('conference')) return <BookOpen className="w-4 h-4 text-tl-blue shrink-0" />
  if (b.includes('pto') || b.includes('vacation') || b.includes('unlimited')) return <Calendar className="w-4 h-4 text-violet-400 shrink-0" />
  if (b.includes('equity') || b.includes('stock') || b.includes('salary')) return <TrendingUp className="w-4 h-4 text-tl-gold shrink-0" />
  return <Zap className="w-4 h-4 text-tl-gold shrink-0" />
}

// â”€â”€â”€ Work mode badge config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WORK_MODE_STYLES: Record<string, string> = {
  remote: 'tl-tag-teal',
  hybrid: 'bg-violet-500/10 border border-violet-500/30 text-violet-400',
  onsite: 'tl-tag-blue',
}

function WorkModeIcon({ mode }: { mode: string }) {
  if (mode === 'remote') return <Wifi className="w-3.5 h-3.5" />
  if (mode === 'hybrid') return <Building2 className="w-3.5 h-3.5" />
  return <Globe className="w-3.5 h-3.5" />
}

// â”€â”€â”€ Toggle Switch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
        checked ? 'bg-tl-teal' : 'bg-tl-bg-elevated'
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

// â”€â”€â”€ Fade-up animation helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function JobDetailPage() {
  const params = useParams()
  const jobId  = params.id as string

  const [job, setJob]                   = useState<Job | null>(null)
  const [allJobs, setAllJobs]           = useState<Job[]>([])
  const [userSkills, setUserSkills]     = useState<Set<string> | null>(null) // null = still loading
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [saved, setSaved]               = useState(false)
  const [applied, setApplied]           = useState(false)
  const [alertOn, setAlertOn]           = useState(false)
  const [match, setMatch]               = useState<MatchInfo | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [shareCopied, setShareCopied]   = useState(false)

  useEffect(() => {
    async function load() {
      const [jobRes, allRes, profileRes] = await Promise.all([
        getJob(jobId),
        getJobs(),
        getTalentProfile(),
      ])

      if (jobRes.data) {
        setJob(jobRes.data)
      } else {
        setError(jobRes.error ?? 'Job not found')
      }

      if (allRes.data) setAllJobs(allRes.data)

      // Build the real user skill set (lowercase). Fall back to empty set on any error.
      if (profileRes.data) {
        const skills = new Set(
          profileRes.data.skills.map(s => s.name.toLowerCase())
        )
        setUserSkills(skills)
      } else {
        setUserSkills(new Set())
      }

      setLoading(false)
    }
    load()
  }, [jobId])

  useEffect(() => {
    if (!job || job.external) return
    let cancelled = false
    setMatchLoading(true)
    fetch('/api/talent/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds: [job.id] }),
    })
      .then(async r => (r.ok ? r.json() as Promise<{ results: Array<{ jobId: string; score: number; reason: string }> }> : null))
      .then(data => {
        if (cancelled || !data?.results?.[0]) return
        const r = data.results[0]
        setMatch({ score: r.score, reason: r.reason })
      })
      .catch(() => { /* fall back to deterministic */ })
      .finally(() => { if (!cancelled) setMatchLoading(false) })
    return () => { cancelled = true }
  }, [job])

  // hasSkill is only meaningful once userSkills is loaded (not null).
  // Returns null while loading so callers can treat skills as "unknown".
  function hasSkill(skill: string): boolean | null {
    if (userSkills === null) return null
    const low = skill.toLowerCase()
    return userSkills.has(low) || [...userSkills].some(s => low.includes(s) || s.includes(low.split(' ')[0]))
  }

  const handleApply = async () => {
    if (!job) return
    const res = await applyToJob(job.id)
    if (res.data || res.status === 201) setApplied(true)
  }

  const score = match?.score ?? (job ? getMatchScore(job.id) : 0)
  const matchReason = match?.reason ?? ''

  const matchedSkills = useMemo(() => {
    if (!job || userSkills === null) return []
    return job.skills.filter(s => hasSkill(s) === true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, userSkills])

  const missingSkills = useMemo(() => {
    if (!job || userSkills === null) return []
    return job.skills.filter(s => hasSkill(s) === false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, userSkills])

  const topThree = matchedSkills.slice(0, 3)

  const similarJobs = useMemo(() => {
    if (!job) return []
    const targetSkills = new Set((job.skills ?? []).map(s => s.toLowerCase()))
    const targetIndustry = job.company?.industry?.toLowerCase()

    const scored = allJobs
      .filter(j => j.id !== job.id)
      .map(j => {
        let signal = 0
        if (targetIndustry && j.company?.industry?.toLowerCase() === targetIndustry) signal += 3
        if (j.workMode === job.workMode) signal += 1
        if (j.level === job.level) signal += 1
        const overlap = (j.skills ?? []).reduce(
          (acc, s) => acc + (targetSkills.has(s.toLowerCase()) ? 1 : 0),
          0,
        )
        signal += overlap
        return { job: j, signal }
      })
      .sort((a, b) => {
        if (b.signal !== a.signal) return b.signal - a.signal
        return new Date(b.job.postedAt).getTime() - new Date(a.job.postedAt).getTime()
      })
      .slice(0, 4)
      .map(({ job: j }) => ({ ...j, score: getMatchScore(j.id) }))

    return scored
  }, [job, allJobs])

  async function handleShare() {
    if (typeof window === 'undefined' || !job) return
    const url = window.location.href
    const text = `${job.title} at ${job.company?.name ?? 'Company'}`
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url })
        return
      } catch {
        /* user dismissed — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      window.prompt('Copy this job link:', url)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !job) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-tl-text-secondary">{error ?? 'Job not found'}</p>
    </div>
  )

  const daysPosted = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / 86400000)
  const daysLeft   = job.expiresAt
    ? Math.max(0, Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86400000))
    : 0

  // While profile is still loading, skills are "unknown" â€” show a neutral state
  const skillsLoaded = userSkills !== null

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* â”€â”€ BREADCRUMB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div {...fadeUp(0)} className="flex items-center gap-2 text-sm text-tl-text-secondary mb-6">
        <Link
          href="/talent/jobs"
          className="inline-flex items-center gap-1.5 hover:text-tl-text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-tl-text-primary font-medium truncate">{job.title}</span>
      </motion.div>

      {/* â”€â”€ JOB HEADER CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div {...fadeUp(0.05)} className="tl-card-elevated p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">

          {/* Left: avatar + center info */}
          <div className="flex flex-col sm:flex-row gap-5 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black', avatarColor(job.company?.name ?? job.title ?? 'C'))}>
                {(job.company?.name ?? job.title ?? 'C')[0]}
              </div>
              {job.company?.verified && (
                <span className="tl-tag-teal inline-flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-display font-black text-tl-text-primary leading-tight mb-1">{job.title}</h1>
              <p className="text-xl text-tl-text-secondary font-medium mb-3">{job.company?.name}</p>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', WORK_MODE_STYLES[job.workMode] ?? WORK_MODE_STYLES.onsite)}>
                  <WorkModeIcon mode={job.workMode} />
                  {WORK_MODE_LABELS[job.workMode]}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-tl-border-default bg-tl-bg-elevated text-xs text-tl-text-secondary">
                  <MapPin className="w-3 h-3" />{job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-tl-border-default bg-tl-bg-elevated text-xs text-tl-text-secondary">
                  <Briefcase className="w-3 h-3" />{JOB_TYPE_LABELS[job.type]}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-tl-border-default bg-tl-bg-elevated text-xs text-tl-text-secondary">
                  {EXPERIENCE_LABELS[job.level]}
                </span>
              </div>

              {/* Salary */}
              <p className="text-2xl font-bold font-mono text-tl-gold">
                ${job.salaryMin.toLocaleString()} &ndash; ${job.salaryMax.toLocaleString()}
                <span className="text-sm font-normal text-tl-text-secondary ml-1">/ year</span>
              </p>
            </div>
          </div>

          {/* Right: match ring + CTA */}
          <div className="flex flex-col items-center gap-3 shrink-0 sm:min-w-[160px]">
            <MatchRing score={score} size={100} />
            <p className="text-sm font-semibold font-mono text-tl-gold text-center">{score}% match</p>
            <button
              className="btn-gold h-12 w-48 text-base font-semibold"
              onClick={handleApply}
            >
              {applied ? ' Applied!' : 'Apply Now'}
            </button>
            <button
              className={cn('btn-ghost w-48 gap-2 flex items-center justify-center', saved && 'text-tl-gold')}
              onClick={() => setSaved(!saved)}
            >
              <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
              {saved ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-tl-border-subtle mt-6 pt-6 flex flex-wrap gap-8 text-sm text-tl-text-secondary">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />{job.applicantCount} applicants
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />{(job.viewCount || 892).toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />Posted {daysPosted}d ago
          </span>
          {job.expiresAt && daysLeft > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />Expires in {daysLeft}d
            </span>
          )}
        </div>
      </motion.div>

      {/* â”€â”€ TWO-COLUMN LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">

        {/* â”€â”€ LEFT COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="lg:col-span-2 space-y-6">

          {/* About the Role */}
          <motion.div {...fadeUp(0.1)} className="tl-card p-6">
            <h3 className="text-lg font-display font-semibold text-tl-text-primary mb-4">About the Role</h3>
            <p className="text-sm text-tl-text-secondary leading-relaxed">{job.description}</p>
          </motion.div>

          {/* What You'll Do */}
          <motion.div {...fadeUp(0.14)} className="tl-card p-6">
            <h3 className="text-lg font-display font-semibold text-tl-text-primary mb-4">What You&apos;ll Do</h3>
            <ul className="space-y-3">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-tl-text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-tl-teal mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Nice to Have */}
          {(job.niceToHave?.length ?? 0) > 0 && (
            <motion.div {...fadeUp(0.17)} className="tl-card p-6">
              <h3 className="text-lg font-display font-semibold text-tl-text-primary mb-4">Nice to Have</h3>
              <ul className="space-y-3">
                {(job.niceToHave ?? []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-tl-text-secondary">
                    <Plus className="w-4 h-4 text-tl-text-secondary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* What We Offer */}
          {(job.benefits?.length ?? 0) > 0 && (
            <motion.div {...fadeUp(0.2)} className="tl-card p-6">
              <h3 className="text-lg font-display font-semibold text-tl-text-primary mb-4">What We Offer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(job.benefits ?? []).map(b => (
                  <div key={b} className="flex items-center gap-3 text-sm text-tl-text-secondary">
                    {benefitIcon(b)}
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* About Company */}
          <motion.div {...fadeUp(0.23)} className="tl-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display font-semibold text-tl-text-primary">
                About {job.company?.name ?? 'this company'}
              </h3>
              {job.company?.website && (
                <a
                  href={job.company.website.startsWith('http') ? job.company.website : `https://${job.company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tl-gold/10 border border-tl-gold/30 text-xs font-semibold text-tl-gold hover:bg-tl-gold/15 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Visit Website
                </a>
              )}
            </div>

            <div className="flex items-start gap-4 mb-5">
              <img
                src={companyLogoSrc(job.company, job.title)}
                alt={job.company?.name ?? job.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-tl-border-subtle bg-tl-bg-elevated"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-tl-text-primary text-base">
                  {job.company?.name ?? 'External Employer'}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {job.company?.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-tl-teal bg-tl-teal/10 border border-tl-teal/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified Employer
                    </span>
                  )}
                  {job.external && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                      <ExternalLink className="w-2.5 h-2.5" /> {job.source ?? 'Partner'}
                    </span>
                  )}
                  {job.company?.website && (
                    <span className="text-[11px] text-tl-text-secondary truncate">
                      {job.company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {(job.company?.industry || job.company?.size || job.company?.hq || job.company?.location || job.company?.founded) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                {job.company?.industry && (
                  <div className="rounded-xl bg-tl-bg-elevated border border-tl-border-subtle p-3">
                    <p className="text-[10px] uppercase tracking-wider text-tl-text-secondary font-semibold mb-1">Industry</p>
                    <p className="text-xs font-medium text-tl-text-primary truncate">{job.company.industry}</p>
                  </div>
                )}
                {job.company?.size && (
                  <div className="rounded-xl bg-tl-bg-elevated border border-tl-border-subtle p-3">
                    <p className="text-[10px] uppercase tracking-wider text-tl-text-secondary font-semibold mb-1">Company Size</p>
                    <p className="text-xs font-medium text-tl-text-primary truncate">
                      {job.company.size}{/^\d/.test(job.company.size) ? ' employees' : ''}
                    </p>
                  </div>
                )}
                {(job.company?.hq || job.company?.location) && (
                  <div className="rounded-xl bg-tl-bg-elevated border border-tl-border-subtle p-3">
                    <p className="text-[10px] uppercase tracking-wider text-tl-text-secondary font-semibold mb-1">HQ</p>
                    <p className="text-xs font-medium text-tl-text-primary truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {job.company?.hq ?? job.company?.location}
                    </p>
                  </div>
                )}
                {job.company?.founded && (
                  <div className="rounded-xl bg-tl-bg-elevated border border-tl-border-subtle p-3">
                    <p className="text-[10px] uppercase tracking-wider text-tl-text-secondary font-semibold mb-1">Founded</p>
                    <p className="text-xs font-medium text-tl-text-primary truncate">{job.company.founded}</p>
                  </div>
                )}
              </div>
            )}

            {job.company?.description ? (
              <p className="text-sm text-tl-text-secondary leading-relaxed whitespace-pre-line">
                {job.company.description}
              </p>
            ) : job.external ? (
              <p className="text-sm text-tl-text-secondary leading-relaxed">
                This role is sourced from {job.source ?? 'a partner job board'}. Apply on the original posting to start the conversation with the hiring team.
              </p>
            ) : (
              <p className="text-sm text-tl-text-secondary/70 italic">
                The company hasn&apos;t added a description yet — visit their website to learn more.
              </p>
            )}
          </motion.div>

        </div>

        {/* â”€â”€ RIGHT STICKY COLUMN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="lg:col-span-1 space-y-4">

          {/* Match Analysis â€” gold card */}
          <motion.div {...fadeUp(0.1)} className="tl-card-gold p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-tl-text-primary">Why You&apos;re a Strong Match</h4>
              <div className="flex items-center gap-2">
                {matchLoading && (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-tl-gold/30 border-t-tl-gold animate-spin" />
                )}
                <span className="text-3xl font-mono font-bold text-tl-gold">{score}%</span>
              </div>
            </div>
            {!skillsLoaded ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-tl-bg-elevated/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topThree.length > 0 ? (
              <div className="space-y-2.5">
                {topThree.map((skill, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-tl-text-secondary">
                    <div className="w-5 h-5 rounded-full bg-tl-teal/15 border border-tl-teal/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-tl-teal" />
                    </div>
                    <span>Your <span className="text-tl-text-primary font-medium">{skill}</span> expertise matches this role</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-tl-text-secondary">Build your skills to improve your match score.</p>
            )}
            {(matchReason || matchLoading) && (
              <p className="mt-3 text-[11px] text-tl-text-secondary italic bg-tl-bg-elevated rounded-lg p-2.5 leading-relaxed border border-tl-border-subtle">
                <span className="not-italic font-semibold text-tl-gold">AI:</span>{' '}
                {matchReason
                  ? matchReason
                  : matchLoading
                    ? 'Analyzing your profile against this role…'
                    : 'Strong technical alignment based on your profile and this role’s requirements.'}
              </p>
            )}
          </motion.div>

          {/* Skills Breakdown */}
          <motion.div {...fadeUp(0.14)} className="tl-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-tl-text-primary">Skills Breakdown</h4>
              {skillsLoaded ? (
                <span className="text-xs font-mono text-tl-text-secondary">{matchedSkills.length}/{job.skills.length} matched</span>
              ) : (
                <span className="text-xs font-mono text-tl-text-secondary/50">Loadingâ€¦</span>
              )}
            </div>

            {!skillsLoaded ? (
              /* Loading state: neutral pills */
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map(s => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-[10px] text-tl-text-secondary/60 animate-pulse">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <>
                {matchedSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-tl-teal mb-2">Matched</p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map(s => (
                        <span key={s} className="tl-tag-teal inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />{s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {missingSkills.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-tl-gold mb-2">To Learn</p>
                    <div className="flex flex-wrap gap-1.5 border border-tl-gold/30 p-3 rounded-lg">
                      {missingSkills.slice(0, 5).map(s => (
                        <span key={s} className="tl-tag-gold inline-flex items-center gap-1 border rounded-lg border-tl-gold/30 bg-tl-gold/10 text-[10px] p-1">
                          <Info className="w-3 h-3 shrink-0" />{s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Set Job Alert */}
          <motion.div {...fadeUp(0.18)} className="tl-card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-tl-text-primary">Get notified of similar roles</p>
              {alertOn && (
                <p className="text-xs text-tl-gold mt-0.5 flex items-center gap-1">
                  <Bell className="w-3 h-3" /> Alert is active
                </p>
              )}
            </div>
            <ToggleSwitch checked={alertOn} onChange={setAlertOn} />
          </motion.div>

          {/* Share */}
          <motion.div {...fadeUp(0.21)}>
            <button
              type="button"
              onClick={handleShare}
              className="btn-ghost w-full gap-2 flex items-center justify-center text-tl-text-secondary hover:text-tl-text-primary"
            >
              {shareCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-tl-teal" /> Link copied
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" /> Share This Job
                </>
              )}
            </button>
          </motion.div>

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <motion.div {...fadeUp(0.24)} className="tl-card p-5">
              <h4 className="text-sm font-semibold text-tl-text-primary mb-3">Similar Jobs</h4>
              <div className="space-y-2">
                {similarJobs.map(sj => {
                  const externalUrl = (sj.external && sj.applyUrl) || ''
                  const inner = (
                    <>
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(sj.company?.name ?? sj.title))}>
                        {(sj.company?.name ?? sj.title)[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-tl-text-primary truncate group-hover:text-tl-gold transition-colors">{sj.title}</p>
                        <p className="text-xs text-tl-text-secondary truncate">
                          {sj.company?.name}
                          {sj.location ? ` · ${sj.location}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-tl-gold shrink-0">{sj.score}%</span>
                    </>
                  )
                  return externalUrl ? (
                    <a
                      key={sj.id}
                      href={externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-2.5 rounded-xl border border-tl-border-subtle hover:border-tl-gold/30 hover:bg-tl-bg-elevated/40 transition-all"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      key={sj.id}
                      href={`/talent/jobs/${sj.id}`}
                      className="group flex items-center gap-3 p-2.5 rounded-xl border border-tl-border-subtle hover:border-tl-gold/30 hover:bg-tl-bg-elevated/40 transition-all"
                    >
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Report */}
          <motion.div {...fadeUp(0.27)} className="text-center">
            <button className="text-xs text-tl-text-secondary/60 hover:text-tl-text-secondary transition-colors underline underline-offset-2">
              Report listing
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
