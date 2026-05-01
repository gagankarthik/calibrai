'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { jobs, applications } from '@/lib/data'
import { formatSalary, timeAgo, getMatchBg } from '@/lib/utils'
import { MatchScore, MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Bookmark,
  MapPin,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  FileText,
  Users,
  Award,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Target,
  DollarSign,
  Eye,
  Clock,
  Star,
  Wifi,
  Building2,
  Globe,
} from 'lucide-react'
import type { ApplicationStatus } from '@/lib/types'

// ─── Stagger variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Alex's skill set (matches data.ts candidates[0]) ─────────────────────────
const alexSkills = ['React', 'TypeScript', 'Next.js', 'CSS/Tailwind', 'GraphQL', 'Performance']

// ─── AI match reasons per job ─────────────────────────────────────────────────
const matchReasons: Record<string, string[]> = {
  j1: [
    'Your React expertise matches 96% of requirements',
    'Hybrid work mode aligns with your preference',
    'Salary range fits your $210K target',
  ],
  j2: [
    'Your TypeScript skills transfer well to growth PM',
    'Remote-first matches your work preference',
    'Salary range is within your expectations',
  ],
  j3: [
    'Senior-level experience aligns with Staff role',
    'Fully remote matches your work preference',
    'Top-of-market salary exceeds your target',
  ],
}

// ─── Status badge config ──────────────────────────────────────────────────────
const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: 'default' | 'purple' | 'cyan' | 'warning' | 'success' | 'rose' }
> = {
  applied: { label: 'Applied', variant: 'default' },
  screening: { label: 'Screening', variant: 'purple' },
  interview: { label: 'Interview', variant: 'cyan' },
  technical: { label: 'Technical', variant: 'warning' },
  offer: { label: 'Offer', variant: 'success' },
  hired: { label: 'Hired', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'rose' },
}

const stageLabels: Record<string, string> = {
  new: 'Application Received',
  screening: 'Resume Screening',
  phone_screen: 'Phone Screen',
  technical: 'Technical Interview',
  onsite: 'Onsite Interview',
  offer: 'Offer Extended',
  hired: 'Hired',
  rejected: 'Not Selected',
}

const workModeIcon: Record<string, React.ReactNode> = {
  remote: <Wifi className="w-3 h-3" />,
  hybrid: <Building2 className="w-3 h-3" />,
  onsite: <Globe className="w-3 h-3" />,
}

// ─── Application Timeline Card ────────────────────────────────────────────────
function ApplicationCard({ app }: { app: typeof applications[0] }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[app.status]

  return (
    <motion.div
      layout
      className="glass-card p-4 hover:border-white/[0.15] transition-all duration-300 cursor-pointer"
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="flex items-start gap-3">
        {/* Timeline dot */}
        <div className="mt-0.5 shrink-0 flex flex-col items-center gap-1">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              app.status === 'offer'
                ? 'bg-emerald-400'
                : app.status === 'interview' || app.status === 'technical'
                ? 'bg-blue-400'
                : app.status === 'rejected'
                ? 'bg-rose-400'
                : 'bg-muted-foreground/40'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {app.job.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">{app.job.company.name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(app.appliedAt)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Stage: <span className="text-foreground/80">{stageLabels[app.stage]}</span>
            </span>
          </div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-border space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Match Score</span>
                <MatchScore score={app.matchScore} size="sm" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Salary Range</span>
                <span className="text-emerald-400 font-medium">
                  {formatSalary(app.job.salaryMin, app.job.salaryMax)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last Update</span>
                <span className="text-foreground/80">{timeAgo(app.updatedAt)}</span>
              </div>
              {app.notes && (
                <p className="text-[11px] text-muted-foreground italic border-l-2 border-blue-500/40 pl-2">
                  {app.notes}
                </p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-1 text-xs h-7">
                View Application
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Job Match Card ───────────────────────────────────────────────────────────
function JobMatchCard({ job, index }: { job: typeof jobs[0]; index: number }) {
  const score = index === 0 ? 96 : index === 1 ? 84 : 78
  const reasons = matchReasons[job.id] ?? matchReasons.j1

  return (
    <motion.div
      variants={item}
      className="relative group overflow-hidden rounded-2xl"
      style={{
        background:
          'linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box, linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.35), rgba(6,182,212,0.3)) border-box',
        border: '1px solid transparent',
      }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ boxShadow: 'inset 0 0 60px rgba(59,130,246,0.06)' }} />

      {/* Featured badge */}
      {job.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
            <Star className="w-2.5 h-2.5 fill-current" />
            Featured
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Company row */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-11 w-11 ring-2 ring-white/10 shrink-0">
            <AvatarImage src={job.company.logo} />
            <AvatarFallback className="text-sm font-bold">
              {job.company.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-medium text-foreground">{job.company.name}</span>
              {job.company.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground mt-0.5 leading-snug pr-16">
              {job.title}
            </h3>
          </div>

          {/* Match Ring — hero element */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <MatchRing score={score} size={64} strokeWidth={5} />
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">
              AI Match
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="ghost" className="flex items-center gap-1 text-[11px]">
            {workModeIcon[job.workMode]}
            <span className="capitalize">{job.workMode}</span>
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
            <Clock className="w-3 h-3" />
            {timeAgo(job.postedAt)}
          </span>
        </div>

        {/* AI Reasons */}
        <div className="mb-4 space-y-1.5">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
              </div>
              <span className="text-xs text-muted-foreground leading-snug">{r}</span>
            </div>
          ))}
        </div>

        {/* Skills match */}
        <div className="mb-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
            Skills Match
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((skill) => {
              const have = alexSkills.includes(skill)
              return (
                <span
                  key={skill}
                  className={`tag text-[11px] ${
                    have
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground'
                  }`}
                >
                  {have && <CheckCircle2 className="w-2.5 h-2.5" />}
                  {skill}
                </span>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button className="flex-1 h-9 text-sm">
            Apply Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Quick Action Card ────────────────────────────────────────────────────────
function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  gradient,
}: {
  icon: React.ElementType
  label: string
  description: string
  href: string
  gradient: string
}) {
  return (
    <Link href={href}>
      <motion.div
        variants={item}
        whileHover={{ y: -2 }}
        className="glass-card p-4 hover:border-white/[0.18] transition-all duration-300 cursor-pointer group h-full"
      >
        <div
          className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-0.5">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </motion.div>
    </Link>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentDashboardPage() {
  const topJobs = jobs.slice(0, 3)
  const recentApps = applications.slice(0, 5)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ── Section 1: Welcome Banner ── */}
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 50%, rgba(6,182,212,0.08) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, Alex{' '}
                    <span role="img" aria-label="wave">👋</span>
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    You have{' '}
                    <span className="text-blue-400 font-semibold">5 new job matches</span> and{' '}
                    <span className="text-purple-400 font-semibold">2 messages</span> waiting.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0" asChild>
                  <Link href="/talent/profile">
                    Complete Profile
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              {/* Inline stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  {
                    label: 'Profile Strength',
                    value: '82%',
                    sub: 'Strong',
                    icon: Target,
                    color: 'text-blue-400',
                  },
                  {
                    label: 'Applications This Week',
                    value: '3',
                    sub: '+1 from last week',
                    icon: FileText,
                    color: 'text-purple-400',
                  },
                  {
                    label: 'Interview Rate',
                    value: '67%',
                    sub: 'Above average',
                    icon: TrendingUp,
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Profile Views',
                    value: '148',
                    sub: '+23 this week',
                    icon: Eye,
                    color: 'text-cyan-400',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3"
                  >
                    <div className={`flex items-center gap-1.5 mb-1.5 ${stat.color}`}>
                      <stat.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Top Job Matches ── */}
        <motion.div variants={item} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground">Your Top Matches Today</h2>
              <span className="section-eyebrow text-xs py-0.5 px-2.5">
                <Sparkles className="w-3 h-3" />
                Powered by AI
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" asChild>
              <Link href="/talent/jobs">
                View all 42 matches
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <motion.div
            variants={container}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            {topJobs.map((job, i) => (
              <JobMatchCard key={job.id} job={job} index={i} />
            ))}
          </motion.div>
        </motion.div>

        {/* ── Section 3: Two-column ── */}
        <motion.div variants={item} className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Application Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Application Activity</h2>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
                <Link href="/talent/applications">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentApps.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>
          </div>

          {/* Career Insights */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Career Insights</h2>

            {/* Profile Strength */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  Profile Strength
                </h3>
                <span className="text-lg font-bold text-blue-400">82%</span>
              </div>
              <Progress value={82} className="h-2.5 mb-4" />
              <div className="space-y-2">
                {[
                  { text: 'Add 2 more skills to strengthen your profile', icon: '✦' },
                  { text: 'Upload portfolio or work samples', icon: '✦' },
                  { text: 'Complete your work history section', icon: '✦' },
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-amber-400 text-xs mt-0.5 shrink-0">{rec.icon}</span>
                    <p className="text-xs text-muted-foreground">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Position */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Market Position
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Your skills are in the{' '}
                <span className="text-emerald-400 font-semibold">top 23%</span> of React
                developers in San Francisco.
              </p>
              {/* Percentile bar */}
              <div className="relative mb-2">
                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400"
                    style={{ width: '77%' }}
                  />
                </div>
                {/* Marker at 77th percentile */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-background shadow-lg shadow-emerald-500/40"
                  style={{ left: '77%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Bottom</span>
                <span className="text-emerald-400 font-semibold">You — 77th percentile</span>
                <span>Top 1%</span>
              </div>
            </div>

            {/* Salary Benchmark */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Salary Benchmark
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                React Devs in SF earn{' '}
                <span className="text-foreground font-medium">$185K–$240K</span> avg. Your
                target{' '}
                <span className="text-emerald-400 font-semibold">$210K</span> is competitive.
              </p>
              {/* Range bar */}
              <div className="relative">
                <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500/50 to-purple-500/50"
                    style={{ width: '100%' }}
                  />
                </div>
                {/* Your target marker at ~45% along 185-240 range => (210-185)/(240-185) = 45% */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-400 border-2 border-background shadow-lg shadow-purple-500/40"
                  style={{ left: '45%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                <span>$185K</span>
                <span className="text-purple-400 font-semibold">$210K target</span>
                <span>$240K</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Section 4: Quick Actions ── */}
        <motion.div variants={item} className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              icon={Briefcase}
              label="Browse 42 Jobs"
              description="See all AI-matched opportunities"
              href="/talent/jobs"
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <QuickAction
              icon={Users}
              label="Update Profile"
              description="Strengthen to 100% for more matches"
              href="/talent/profile"
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <QuickAction
              icon={Award}
              label="Skill Assessment"
              description="Verify skills and boost credibility"
              href="/talent/skills"
              gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            <QuickAction
              icon={Download}
              label="Download PDF"
              description="Export your profile as a resume"
              href="/talent/profile"
              gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
