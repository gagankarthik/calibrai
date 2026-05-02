'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs, getApplications, getTalentProfile } from '@/lib/api'
import type { Job, Application, Candidate } from '@/lib/types'

type ExtendedCandidate = Candidate & { resumeUrl?: string; headline?: string; workPreference: string[] }
import { formatSalary, timeAgo, cn, companyAvatarUrl, userAvatarUrl } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Button } from '@/components/ui/button'
import {
  Bookmark,
  MapPin,
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Award,
  Sparkles,
  Bell,
  Zap,
  Edit,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { ApplicationStatus } from '@/lib/types'

// ─── Deterministic match score (no randomness) ────────────────────────────────
function getMatchScore(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return 70 + (Math.abs(hash) % 28)
}


// ─── Status pill config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; dotClass: string }> = {
  applied:   { label: 'Applied',      className: 'tl-tag-blue',               dotClass: 'bg-tl-blue' },
  screening: { label: 'Screening',    className: 'bg-violet-500/10 text-violet-400 border border-violet-500/30', dotClass: 'bg-violet-400' },
  interview: { label: 'Interview',    className: 'tl-tag-gold',               dotClass: 'bg-tl-gold' },
  technical: { label: 'Technical',    className: 'bg-orange-500/10 text-orange-400 border border-orange-500/30', dotClass: 'bg-orange-400' },
  offer:     { label: 'Offer',        className: 'tl-tag-teal',               dotClass: 'bg-tl-teal' },
  hired:     { label: 'Hired',        className: 'tl-tag-teal',               dotClass: 'bg-tl-teal' },
  rejected:  { label: 'Not Selected', className: 'tl-tag-rose',               dotClass: 'bg-tl-rose' },
}

const STATUS_ORDER: ApplicationStatus[] = ['applied', 'screening', 'interview', 'offer', 'hired']

// ─── In-demand skills ─────────────────────────────────────────────────────────
const DEMAND_SKILLS = [
  { name: 'React',      pct: 94 },
  { name: 'TypeScript', pct: 89 },
  { name: 'Node.js',    pct: 78 },
  { name: 'AWS',        pct: 71 },
  { name: 'GraphQL',    pct: 65 },
]

// ─── Toggle Switch ────────────────────────────────────────────────────────────
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


// ─── Profile completion ───────────────────────────────────────────────────────
function calcProfileCompletion(profile: Candidate): number {
  const fields = [
    Boolean(profile.title),
    Boolean(profile.bio),
    Boolean(profile.location),
    profile.skills.length > 0,
    profile.workPreference.length > 0,
    Boolean(profile.github),
    Boolean(profile.linkedin),
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentDashboardPage() {
  const [jobAlerts, setJobAlerts] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [profile, setProfile] = useState<ExtendedCandidate | null>(null)
  const [user, setUser] = useState<{ name?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [jobsRes, appsRes, profileRes] = await Promise.all([
        getJobs(),
        getApplications(),
        getTalentProfile(),
      ])
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      if (profileRes.data) setProfile(profileRes.data as ExtendedCandidate)
      setLoading(false)
    }
    load()

    // Fetch logged-in user name from session
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data) })
      .catch(() => {})
  }, [])

  const topMatches = useMemo(
    () => jobs.slice(0, 4).map(j => ({ ...j, score: getMatchScore(j.id) })),
    [jobs]
  )

  const newlyPosted = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    return jobs
      .filter(j => new Date(j.postedAt).getTime() > cutoff)
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
      .slice(0, 6)
      .map(j => ({ ...j, score: getMatchScore(j.id) }))
  }, [jobs])

  const recentApps = applications.slice(0, 5)

  const strongMatchCount = topMatches.filter(j => j.score >= 85).length
  const interviewCount   = recentApps.filter(a => a.status === 'interview').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* ── WELCOME BANNER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="tl-card p-4 mb-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-tl-text-primary">
            Good morning, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-tl-text-secondary mt-1 text-sm">
            You have{' '}
            <span className="text-tl-gold font-semibold">{strongMatchCount} strong matches</span>
            {' '}and{' '}
            <span className="text-tl-gold font-semibold">{interviewCount} upcoming interviews</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Profile completion */}
          {profile && (() => {
            const pct = calcProfileCompletion(profile)
            return (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-tl-text-primary">Profile {pct}% complete</span>
                  <div className="w-32 h-1.5 rounded-full bg-tl-bg-base overflow-hidden">
                    <div className="h-full rounded-full bg-tl-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <Link href="/talent/profile" className="text-xs font-semibold text-tl-gold hover:underline whitespace-nowrap flex items-center gap-1">
                  Complete <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )
          })()}
          {/* Job Alerts toggle */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <Bell className={cn('w-4 h-4', jobAlerts ? 'text-tl-gold' : 'text-tl-text-secondary')} />
            <span className="text-xs font-medium text-tl-text-primary">Job Alerts</span>
            <ToggleSwitch checked={jobAlerts} onChange={setJobAlerts} />
          </div>
        </div>
      </motion.div>

      {/* ── STATS ROW ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          {
            icon: Sparkles, value: jobs.length, label: 'Jobs Matched',
            iconClass: 'text-tl-blue', bgClass: 'bg-tl-blue/10 border-tl-blue/20',
          },
          {
            icon: FileText, value: applications.length, label: 'Applications Sent',
            iconClass: 'text-violet-400', bgClass: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            icon: Calendar, value: applications.filter(a => a.status === 'interview').length, label: 'Interviews',
            iconClass: 'text-tl-gold', bgClass: 'bg-tl-gold/10 border-tl-gold/20',
          },
          {
            icon: Award, value: applications.filter(a => a.status === 'offer').length, label: 'Offers',
            iconClass: 'text-tl-teal', bgClass: 'bg-tl-teal/10 border-tl-teal/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="tl-card p-4 text-center"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 border', stat.bgClass)}>
              <stat.icon className={cn('w-4 h-4', stat.iconClass)} />
            </div>
            <p className={cn('text-2xl font-mono font-bold', stat.iconClass)}>{stat.value}</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── TOP MATCHES ─────────────────────────────────────────────────────── */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="section-eyebrow mb-0.5">AI-curated for you</p>
            <h2 className="text-xl font-display font-bold text-tl-text-primary">Your Top Matches</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-tl-gold hover:text-tl-gold/80" asChild>
            <Link href="/talent/jobs">
              See all <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Horizontal scroll row */}
        <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
          {topMatches.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
              className="w-72 shrink-0 tl-card p-5 flex flex-col gap-3 hover:border-tl-gold/40 transition-all duration-300 cursor-pointer group"
            >
              {/* Company row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={companyAvatarUrl(job.company.name)} alt={job.company.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  {job.company.verified && (
                    <span className="tl-tag-teal inline-flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-tl-text-primary leading-tight group-hover:text-tl-gold transition-colors">
                {job.title}
              </h3>

              {/* Company + location */}
              <p className="text-sm text-tl-text-secondary flex items-center gap-1 -mt-1">
                {job.company.name}
                <span className="inline-block mx-1 opacity-30">·</span>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </p>

              {/* Work mode + salary */}
              <div className="flex gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-tl-text-secondary capitalize">{job.workMode}</span>
                <span className="tl-tag-teal font-semibold">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>

              {/* Match ring centered */}
              <div className="flex flex-col items-center gap-1 py-1">
                <MatchRing score={job.score} size={72} />
                <span className="text-xs font-mono text-tl-gold font-semibold">{job.score}% match</span>
              </div>

              {/* Why you match — skill tags */}
              <div>
                <p className="text-[10px] text-tl-text-secondary uppercase tracking-wider font-semibold mb-1.5">Why you match</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} className="tl-tag-gold text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-2 mt-auto pt-1">
                <button className="btn-gold flex-1 h-8 text-xs">Apply Now</button>
                <button className="btn-ghost h-8 w-8 shrink-0 p-0 flex items-center justify-center">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── NEWLY POSTED JOBS ───────────────────────────────────────────────── */}
      {newlyPosted.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="section-eyebrow mb-0.5">Fresh opportunities</p>
              <h2 className="text-xl font-display font-bold text-tl-text-primary">New This Week</h2>
            </div>
            <Link href="/talent/jobs?sort=newest" className="text-sm font-semibold text-tl-gold hover:opacity-80 transition-opacity flex items-center gap-1">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="tl-card divide-y divide-tl-border-subtle overflow-hidden">
            {newlyPosted.map((job, i) => {
              const isNew = (Date.now() - new Date(job.postedAt).getTime()) < 48 * 60 * 60 * 1000
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 p-3.5 hover:bg-tl-bg-elevated/40 transition-colors"
                >
                  <img src={companyAvatarUrl(job.company.name)} alt={job.company.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link href={`/talent/jobs/${job.id}`} className="text-sm font-semibold text-tl-text-primary hover:text-tl-gold transition-colors truncate">
                        {job.title}
                      </Link>
                      {isNew && <span className="tl-tag-teal text-[9px] font-bold leading-none shrink-0">NEW</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-tl-text-secondary flex-wrap">
                      <span className="flex items-center gap-1">
                        {job.company.name}
                        {job.company.verified && <CheckCircle2 className="w-3 h-3 text-tl-teal" />}
                      </span>
                      <span className="opacity-40">·</span>
                      <span className="capitalize">{job.workMode}</span>
                      <span className="opacity-40">·</span>
                      <span className="text-tl-teal font-mono font-semibold">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <span className="font-mono text-xs font-bold text-tl-gold">{job.score}%</span>
                    <span className="text-[10px] text-tl-text-secondary">{timeAgo(job.postedAt)}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── TWO-COLUMN MIDDLE ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">

        {/* Application Activity */}
        <div className="lg:col-span-2 tl-card p-4">
          <h3 className="font-display font-semibold text-tl-text-primary mb-3">Application Activity</h3>
          {recentApps.length === 0 ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-tl-bg-elevated animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-36 rounded bg-tl-bg-elevated animate-pulse" />
                    <div className="h-2.5 w-24 rounded bg-tl-bg-elevated animate-pulse" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-tl-bg-elevated animate-pulse shrink-0" />
                </div>
              ))}
              <div className="text-center pt-2">
                <p className="text-xs text-tl-text-secondary mb-2">No applications yet</p>
                <Link href="/talent/jobs" className="text-xs font-semibold text-tl-gold hover:underline">
                  Browse jobs to get started →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {recentApps.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status]
                const currentIdx = STATUS_ORDER.indexOf(app.status as ApplicationStatus)
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-tl-bg-elevated transition-colors cursor-pointer"
                  >
                    <img src={companyAvatarUrl(app.job.company.name)} alt={app.job.company.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-tl-text-primary truncate">{app.job.title}</p>
                      <p className="text-xs text-tl-text-secondary truncate">{app.job.company.name}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {STATUS_ORDER.map((s, idx) => (
                          <div
                            key={s}
                            className={cn(
                              'w-2 h-2 rounded-full transition-all',
                              idx < currentIdx ? 'bg-tl-teal' :
                              idx === currentIdx && app.status !== 'rejected' ? 'bg-tl-gold' :
                              app.status === 'rejected' && idx === 0 ? 'bg-tl-rose' :
                              'bg-tl-bg-elevated border border-tl-border-default'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold', cfg.className)}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-tl-text-secondary flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {timeAgo(app.updatedAt)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-tl-border-subtle">
            <Link href="/talent/applications" className="text-sm text-tl-gold hover:underline font-medium flex items-center gap-1">
              View All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Career Insights */}
        <div className="tl-card p-4 space-y-4">
          <h3 className="font-display font-semibold text-tl-text-primary">Career Insights</h3>

          {/* Market Position */}
          <div>
            <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider mb-2">Market Position</p>
            {profile?.salaryExpectation ? (
              <>
                <p className="text-sm font-medium text-tl-text-primary mb-3">
                  Your target: {formatSalary(profile.salaryExpectation, profile.salaryExpectation)}
                </p>
                <div className="relative">
                  <div className="bg-tl-bg-elevated rounded-full h-2 w-full" />
                  <div className="absolute top-0 h-2 rounded-full bg-tl-gold/20" style={{ left: '28%', width: '38%' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-tl-gold border-2 border-tl-bg-base shadow-gold" style={{ left: '60%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <div className="flex justify-between text-[10px] text-tl-text-secondary mt-1.5 font-mono">
                  <span>P25 $120k</span>
                  <span>P50 $148k</span>
                  <span>P75 $172k</span>
                </div>
                <span className="inline-flex items-center gap-1 mt-2 tl-tag-teal">
                  <CheckCircle2 className="w-2.5 h-2.5" /> You&apos;re at market rate
                </span>
              </>
            ) : (
              <p className="text-sm text-tl-text-secondary">
                No salary target set.{' '}
                <Link href="/talent/profile" className="text-tl-gold hover:underline font-medium">
                  Set your expectation
                </Link>
              </p>
            )}
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider mb-2">Your Skills</p>
            {profile && profile.skills.length > 0 ? (
              <div className="space-y-2">
                {profile.skills.slice(0, 5).map((skill, i) => {
                  const inDemand = DEMAND_SKILLS.find(d => d.name.toLowerCase() === skill.name.toLowerCase())
                  const barPct = inDemand ? inDemand.pct : skill.level === 'expert' ? 95 : skill.level === 'advanced' ? 75 : skill.level === 'intermediate' ? 55 : 30
                  return (
                    <div key={skill.name} className="flex items-center gap-2">
                      <span className="text-xs text-tl-text-primary w-20 shrink-0 truncate font-mono">{skill.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.07, ease: 'easeOut' }}
                          className="h-full rounded-full bg-tl-gold"
                        />
                      </div>
                      {inDemand && <span className="text-[10px] tl-tag-teal shrink-0">hot</span>}
                    </div>
                  )
                })}
                <Link href="/talent/profile" className="inline-flex items-center gap-1 text-xs text-tl-gold hover:underline font-medium mt-1">
                  Manage skills <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <Zap className="w-6 h-6 mx-auto mb-2 text-tl-text-secondary/30" />
                <p className="text-xs text-tl-text-secondary mb-2">Add skills to see how you compare to market demand</p>
                <Link href="/talent/profile" className="text-xs font-semibold text-tl-gold hover:underline">
                  Add skills →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECOMMENDED ACTIONS ──────────────────────────────────────────────── */}
      {(() => {
        const actions: Array<{
          icon: React.ElementType
          iconClass: string
          iconBg: string
          title: string
          subtitle: string
          cta: string
          href: string
        }> = []

        if (!profile?.resumeUrl)
          actions.push({ icon: FileText, iconClass: 'text-tl-gold', iconBg: 'bg-tl-gold/10 border-tl-gold/20', title: 'Upload Your Resume', subtitle: 'Resume-filled profiles get 5x more recruiter views', cta: 'Upload Resume →', href: '/talent/profile' })
        if (!profile?.headline)
          actions.push({ icon: Edit, iconClass: 'text-violet-400', iconBg: 'bg-violet-500/10 border-violet-500/20', title: 'Add a Headline', subtitle: 'A clear headline gets 40% more profile views', cta: 'Add Headline →', href: '/talent/profile' })
        if (!profile?.bio)
          actions.push({ icon: Sparkles, iconClass: 'text-tl-blue', iconBg: 'bg-tl-blue/10 border-tl-blue/20', title: 'Write Your Bio', subtitle: 'Tell recruiters what makes you unique', cta: 'Write Bio →', href: '/talent/profile' })
        if (!profile?.skills || profile.skills.length === 0)
          actions.push({ icon: Zap, iconClass: 'text-tl-teal', iconBg: 'bg-tl-teal/10 border-tl-teal/20', title: 'Add Your Skills', subtitle: 'Skills help AI match you to the right jobs', cta: 'Add Skills →', href: '/talent/profile' })
        if (applications.length === 0)
          actions.push({ icon: ArrowRight, iconClass: 'text-tl-gold', iconBg: 'bg-tl-gold/10 border-tl-gold/20', title: 'Apply to Your First Job', subtitle: `${jobs.length} open roles are waiting for you`, cta: 'Browse Jobs →', href: '/talent/jobs' })
        if (!profile?.workPreference || profile.workPreference.length === 0)
          actions.push({ icon: Users, iconClass: 'text-tl-blue', iconBg: 'bg-tl-blue/10 border-tl-blue/20', title: 'Set Job Preferences', subtitle: 'Help us show you the most relevant opportunities', cta: 'Set Preferences →', href: '/talent/profile' })

        // Cap at 3 and use defaults if everything is complete
        const shown = actions.slice(0, 3)
        if (shown.length === 0) return null

        return (
          <section>
            <h2 className="text-base font-display font-bold text-tl-text-primary mb-3">Recommended Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shown.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                >
                  <Link href={card.href} className="block tl-card p-4 hover:border-tl-gold/30 transition-all duration-300 group">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 border', card.iconBg)}>
                      <card.icon className={cn('w-4 h-4', card.iconClass)} />
                    </div>
                    <h4 className="text-sm font-semibold text-tl-text-primary mb-1">{card.title}</h4>
                    <p className="text-xs text-tl-text-secondary mb-2.5 leading-relaxed">{card.subtitle}</p>
                    <span className="text-xs font-semibold text-tl-gold group-hover:underline">{card.cta}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )
      })()}

    </div>
  )
}
