'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getJobs, getApplications } from '@/lib/api'
import type { Job, Application } from '@/lib/types'
import { formatSalary, timeAgo, cn } from '@/lib/utils'
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

// ─── Avatar color hash ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-tl-blue', 'bg-tl-teal', 'bg-tl-rose', 'bg-tl-gold',
  'bg-blue-700', 'bg-cyan-700', 'bg-fuchsia-700', 'bg-teal-700',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
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

// ─── Skill demand bar row ─────────────────────────────────────────────────────
function DemandBar({ skill, index }: { skill: typeof DEMAND_SKILLS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="text-xs text-tl-text-primary w-20 shrink-0 font-mono">{skill.name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.pct}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
          className="h-full rounded-full bg-tl-gold"
        />
      </div>
      <span className="text-[10px] text-tl-text-secondary w-8 text-right font-mono font-medium">{skill.pct}%</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentDashboardPage() {
  const [jobAlerts, setJobAlerts] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [jobsRes, appsRes] = await Promise.all([getJobs(), getApplications()])
      if (jobsRes.data) setJobs(jobsRes.data)
      if (appsRes.data) setApplications(appsRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const topMatches = useMemo(
    () => jobs.slice(0, 4).map(j => ({ ...j, score: getMatchScore(j.id) })),
    [jobs]
  )
  const recentApps = applications.slice(0, 5)

  const strongMatchCount = topMatches.filter(j => j.score >= 85).length
  const interviewCount   = recentApps.filter(a => a.status === 'interview').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── WELCOME BANNER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="tl-card p-6 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-tl-text-primary">
            Good morning, Alex
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
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-tl-text-primary">Profile 82% complete</span>
              <div className="w-32 h-1.5 rounded-full bg-tl-bg-base overflow-hidden">
                <div className="h-full rounded-full bg-tl-gold" style={{ width: '82%' }} />
              </div>
            </div>
            <Link href="/talent/profile" className="text-xs font-semibold text-tl-gold hover:underline whitespace-nowrap flex items-center gap-1">
              Complete <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {/* Job Alerts toggle */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <Bell className={cn('w-4 h-4', jobAlerts ? 'text-tl-gold' : 'text-tl-text-secondary')} />
            <span className="text-xs font-medium text-tl-text-primary">Job Alerts</span>
            <ToggleSwitch checked={jobAlerts} onChange={setJobAlerts} />
          </div>
        </div>
      </motion.div>

      {/* ── STATS ROW ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
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
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(job.company.name))}>
                    {job.company.name[0]}
                  </div>
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

      {/* ── TWO-COLUMN MIDDLE ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Application Activity */}
        <div className="lg:col-span-2 tl-card p-6">
          <h3 className="font-display font-semibold text-tl-text-primary mb-4">Application Activity</h3>
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
                  {/* Avatar */}
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(app.job.company.name))}>
                    {app.job.company.name[0]}
                  </div>

                  {/* Center */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-tl-text-primary truncate">{app.job.title}</p>
                    <p className="text-xs text-tl-text-secondary truncate">{app.job.company.name}</p>
                    {/* 5-dot stage progress */}
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

                  {/* Right */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold', cfg.className)}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-tl-text-secondary flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Updated {timeAgo(app.updatedAt)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-tl-border-subtle">
            <Link href="/talent/applications" className="text-sm text-tl-gold hover:underline font-medium flex items-center gap-1">
              View All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Career Insights */}
        <div className="tl-card p-6 space-y-5">
          <h3 className="font-display font-semibold text-tl-text-primary">Career Insights</h3>

          {/* Market Position */}
          <div>
            <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider mb-2">Market Position</p>
            <p className="text-sm font-medium text-tl-text-primary mb-3">Your target: $145k – $165k</p>

            {/* CSS gauge */}
            <div className="relative">
              <div className="bg-tl-bg-elevated rounded-full h-2 w-full" />
              {/* market range band */}
              <div className="absolute top-0 h-2 rounded-full bg-tl-gold/20" style={{ left: '28%', width: '38%' }} />
              {/* your range marker */}
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
          </div>

          {/* In-Demand Skills */}
          <div>
            <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider mb-3">In-Demand Skills</p>
            <div className="space-y-2.5">
              {DEMAND_SKILLS.map((s, i) => (
                <DemandBar key={s.name} skill={s} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RECOMMENDED ACTIONS ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-display font-bold text-tl-text-primary mb-4">Recommended Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              iconClass: 'text-tl-gold',
              iconBg: 'bg-tl-gold/10 border-tl-gold/20',
              title: 'Verify Your Skills',
              subtitle: '3 skill verifications boost applications 3x',
              cta: 'Verify Now →',
            },
            {
              icon: Users,
              iconClass: 'text-tl-blue',
              iconBg: 'bg-tl-blue/10 border-tl-blue/20',
              title: 'Request a Reference',
              subtitle: '2 past colleagues can vouch for you',
              cta: 'Request →',
            },
            {
              icon: Edit,
              iconClass: 'text-violet-400',
              iconBg: 'bg-violet-500/10 border-violet-500/20',
              title: 'Update Your Headline',
              subtitle: 'Fresh headlines get 40% more profile views',
              cta: 'Update →',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="tl-card p-5 hover:border-tl-gold/30 cursor-pointer transition-all duration-300 group"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 border', card.iconBg)}>
                <card.icon className={cn('w-5 h-5', card.iconClass)} />
              </div>
              <h4 className="text-sm font-semibold text-tl-text-primary mb-1">{card.title}</h4>
              <p className="text-xs text-tl-text-secondary mb-3 leading-relaxed">{card.subtitle}</p>
              <span className="text-xs font-semibold text-tl-gold group-hover:underline">{card.cta}</span>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}
