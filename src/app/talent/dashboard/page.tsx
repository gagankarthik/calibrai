'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { jobs, applications } from '@/lib/data'
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
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

// ─── Status pill config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; className: string; dotClass: string }> = {
  applied:   { label: 'Applied',      className: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       dotClass: 'bg-blue-400' },
  screening: { label: 'Screening',    className: 'bg-purple-500/10 text-purple-400 border-purple-500/30', dotClass: 'bg-violet-400' },
  interview: { label: 'Interview',    className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',    dotClass: 'bg-amber-400' },
  technical: { label: 'Technical',    className: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dotClass: 'bg-orange-400' },
  offer:     { label: 'Offer',        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dotClass: 'bg-emerald-400' },
  hired:     { label: 'Hired',        className: 'bg-green-500/10 text-green-400 border-green-500/30',    dotClass: 'bg-green-400' },
  rejected:  { label: 'Not Selected', className: 'bg-red-500/10 text-red-400 border-red-500/30',          dotClass: 'bg-red-400' },
}

const STATUS_ORDER: ApplicationStatus[] = ['applied', 'screening', 'interview', 'offer', 'hired']

// ─── In-demand skills ─────────────────────────────────────────────────────────
const DEMAND_SKILLS = [
  { name: 'React',      pct: 94, color: 'bg-emerald-500' },
  { name: 'TypeScript', pct: 89, color: 'bg-emerald-500' },
  { name: 'Node.js',    pct: 78, color: 'bg-blue-500' },
  { name: 'AWS',        pct: 71, color: 'bg-blue-500' },
  { name: 'GraphQL',    pct: 65, color: 'bg-amber-500' },
]

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

// ─── Skill demand bar row ─────────────────────────────────────────────────────
function DemandBar({ skill, index }: { skill: typeof DEMAND_SKILLS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="text-xs text-foreground w-20 shrink-0">{skill.name}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.pct}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
          className={cn('h-full rounded-full', skill.color)}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-8 text-right font-medium">{skill.pct}%</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentDashboardPage() {
  const [jobAlerts, setJobAlerts] = useState(true)

  const topMatches = useMemo(
    () => jobs.slice(0, 4).map(j => ({ ...j, score: getMatchScore(j.id) })),
    []
  )
  const recentApps = applications.slice(0, 5)

  const strongMatchCount = topMatches.filter(j => j.score >= 85).length
  const interviewCount   = recentApps.filter(a => a.status === 'interview').length

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── WELCOME BANNER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-6 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Alex 👋</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            You have{' '}
            <span className="text-primary font-semibold">{strongMatchCount} strong matches</span>
            {' '}and{' '}
            <span className="text-amber-400 font-semibold">{interviewCount} upcoming interviews</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Profile completion */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground">Profile 82% complete</span>
              <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: '82%' }} />
              </div>
            </div>
            <Link href="/talent/profile" className="text-xs font-semibold text-primary hover:underline whitespace-nowrap flex items-center gap-1">
              Complete <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {/* Job Alerts toggle */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
            <Bell className={cn('w-4 h-4', jobAlerts ? 'text-primary' : 'text-muted-foreground')} />
            <span className="text-xs font-medium text-foreground">Job Alerts</span>
            <ToggleSwitch checked={jobAlerts} onChange={setJobAlerts} />
          </div>
        </div>
      </motion.div>

      {/* ── STATS ROW ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: Sparkles, value: jobs.length, label: 'Jobs Matched',
            iconClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            icon: FileText, value: applications.length, label: 'Applications Sent',
            iconClass: 'text-violet-400', bgClass: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            icon: Calendar, value: applications.filter(a => a.status === 'interview').length, label: 'Interviews',
            iconClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            icon: Award, value: applications.filter(a => a.status === 'offer').length, label: 'Offers',
            iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10 border-emerald-500/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="glass-card p-4 text-center"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 border', stat.bgClass)}>
              <stat.icon className={cn('w-4 h-4', stat.iconClass)} />
            </div>
            <p className={cn('text-2xl font-bold', stat.iconClass)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── TOP MATCHES ─────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">AI-curated for you</p>
            <h2 className="text-xl font-bold text-foreground">Your Top Matches</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
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
              className="w-72 shrink-0 glass-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-all duration-300 cursor-pointer group"
            >
              {/* Company row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(job.company.name))}>
                    {job.company.name[0]}
                  </div>
                  {job.company.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {job.title}
              </h3>

              {/* Company + location */}
              <p className="text-sm text-muted-foreground flex items-center gap-1 -mt-1">
                {job.company.name}
                <span className="inline-block mx-1 opacity-30">·</span>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.location}</span>
              </p>

              {/* Work mode + salary */}
              <div className="flex gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-muted/60 border border-border text-muted-foreground capitalize">{job.workMode}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>

              {/* Match ring centered */}
              <div className="flex flex-col items-center gap-1 py-1">
                <MatchRing score={job.score} size={72} />
                <span className="text-xs text-muted-foreground font-medium">{job.score}% match</span>
              </div>

              {/* Why you match — skill tags */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Why you match</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-2 mt-auto pt-1">
                <Button size="sm" className="flex-1 h-8 text-xs">Apply Now</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                  <Bookmark className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TWO-COLUMN MIDDLE ────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Application Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Application Activity</h3>
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
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', avatarColor(app.job.company.name))}>
                    {app.job.company.name[0]}
                  </div>

                  {/* Center */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{app.job.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.job.company.name}</p>
                    {/* 5-dot stage progress */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {STATUS_ORDER.map((s, idx) => (
                        <div
                          key={s}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            idx < currentIdx ? 'bg-primary/60' :
                            idx === currentIdx && app.status !== 'rejected' ? 'bg-primary' :
                            app.status === 'rejected' && idx === 0 ? 'bg-red-500' :
                            'bg-muted'
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
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Updated {timeAgo(app.updatedAt)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Link href="/talent/applications" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              View All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Career Insights */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Career Insights</h3>

          {/* Market Position */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Market Position</p>
            <p className="text-sm font-medium text-foreground mb-3">Your target: $145k – $165k</p>

            {/* CSS gauge */}
            <div className="relative">
              <div className="bg-muted rounded-full h-2 w-full" />
              {/* market range band */}
              <div className="absolute top-0 h-2 rounded-full bg-primary/20" style={{ left: '28%', width: '38%' }} />
              {/* your range marker */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/40" style={{ left: '60%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>P25 $120k</span>
              <span>P50 $148k</span>
              <span>P75 $172k</span>
            </div>
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
              <CheckCircle2 className="w-2.5 h-2.5" /> You're at market rate
            </span>
          </div>

          {/* In-Demand Skills */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">In-Demand Skills</p>
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
        <h2 className="text-lg font-bold text-foreground mb-4">Recommended Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              iconClass: 'text-amber-400',
              iconBg: 'bg-amber-500/10 border-amber-500/20',
              title: 'Verify Your Skills',
              subtitle: '3 skill verifications boost applications 3x',
              cta: 'Verify Now →',
            },
            {
              icon: Users,
              iconClass: 'text-blue-400',
              iconBg: 'bg-blue-500/10 border-blue-500/20',
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
              className="glass-card p-5 hover:border-primary/30 cursor-pointer transition-all duration-300 group"
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 border', card.iconBg)}>
                <card.icon className={cn('w-5 h-5', card.iconClass)} />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{card.title}</h4>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{card.subtitle}</p>
              <span className="text-xs font-semibold text-primary group-hover:underline">{card.cta}</span>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  )
}
