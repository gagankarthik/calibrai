'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { jobs, companies } from '@/lib/data'
import { formatSalary, timeAgo, formatDate, cn } from '@/lib/utils'
import { MatchScore, MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
  CheckCheck,
  X,
  Shield,
  Star,
  Bookmark,
  Share2,
  Bell,
  Clock,
  DollarSign,
  Sparkles,
  ChevronRight,
  MonitorSmartphone,
  GraduationCap,
  Heart,
} from 'lucide-react'
import type { Job } from '@/lib/types'

// Alex's known skills
const alexSkills = ['React', 'TypeScript', 'Next.js', 'CSS/Tailwind', 'GraphQL', 'Performance']

const workModeConfig: Record<string, { icon: React.ReactNode; label: string; badgeVariant: 'cyan' | 'purple' | 'blue' }> = {
  remote: { icon: <Wifi className="w-3 h-3" />, label: 'Remote', badgeVariant: 'cyan' },
  hybrid: { icon: <MonitorSmartphone className="w-3 h-3" />, label: 'Hybrid', badgeVariant: 'purple' },
  onsite: { icon: <Building2 className="w-3 h-3" />, label: 'On-site', badgeVariant: 'blue' },
}

const levelLabels: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior Level',
  lead: 'Lead / Staff',
  executive: 'Executive',
}

const jobScores: Record<string, number> = {
  j1: 94,
  j2: 84,
  j3: 78,
  j4: 72,
  j5: 88,
  j6: 65,
}

const benefitIcons: Record<string, React.ReactNode> = {
  'Equity': <Star className="w-4 h-4 text-amber-400" />,
  'Remote': <Wifi className="w-4 h-4 text-cyan-400" />,
  'Remote Options': <Wifi className="w-4 h-4 text-cyan-400" />,
  'Fully Remote': <Wifi className="w-4 h-4 text-cyan-400" />,
  'Top Health': <Heart className="w-4 h-4 text-rose-400" />,
  '$1K Equipment': <Briefcase className="w-4 h-4 text-blue-400" />,
  'Learning Budget': <GraduationCap className="w-4 h-4 text-emerald-400" />,
  '401K Match': <DollarSign className="w-4 h-4 text-emerald-400" />,
}

function CompactJobCard({ job }: { job: Job }) {
  const score = jobScores[job.id] ?? 70
  const wm = workModeConfig[job.workMode]
  return (
    <Link href={`/talent/jobs/${job.id}`}>
      <div className="glass-card p-4 hover:border-white/[0.2] hover:shadow-[0_0_24px_rgba(59,130,246,0.07)] transition-all duration-300 cursor-pointer group">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
            <AvatarImage src={job.company.logo} />
            <AvatarFallback className="text-xs font-bold">{job.company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">{job.company.name}</p>
            <p className="text-sm font-semibold text-foreground leading-snug truncate">{job.title}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {wm.icon}
                {wm.label}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            </div>
          </div>
          <MatchRing score={score} size={44} strokeWidth={3} />
        </div>
      </div>
    </Link>
  )
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobs.find((j) => j.id === params.id) || jobs[0]
  const company = job.company
  const score = jobScores[job.id] ?? 94
  const wm = workModeConfig[job.workMode]
  const [saved, setSaved] = useState(false)
  const [alertEnabled, setAlertEnabled] = useState(false)

  // Similar jobs (exclude current)
  const similarJobs = jobs.filter((j) => j.id !== job.id).slice(0, 3)

  // Skill match analysis
  const normalizedAlexSkills = alexSkills.map((s) => s.toLowerCase())
  const skillMatchData = job.skills.map((skill) => {
    const hasSkill = normalizedAlexSkills.some(
      (as) => as.includes(skill.toLowerCase()) || skill.toLowerCase().includes(as.replace('css/', '').replace('/tailwind', ''))
    )
    const isVerified = ['React', 'TypeScript', 'Next.js', 'CSS/Tailwind'].some(
      (v) => v.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(v.toLowerCase().split('/')[0])
    )
    return { name: skill, has: hasSkill, verified: isVerified && hasSkill }
  })
  const matchedCount = skillMatchData.filter((s) => s.has).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link
          href="/talent/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Job Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6"
          >
            {/* Company row */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-14 w-14 ring-2 ring-white/10">
                <AvatarImage src={company.logo} />
                <AvatarFallback className="text-base font-bold">
                  {company.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{company.name}</span>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{company.industry} · {company.size} employees</p>
              </div>
              <div className="ml-auto">
                <MatchScore score={score} size="lg" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-4">{job.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <Badge variant={wm.badgeVariant} className="flex items-center gap-1">
                {wm.icon}
                {wm.label}
              </Badge>
              <Badge variant="ghost" className="capitalize">{job.type}</Badge>
              <Badge variant="ghost">{levelLabels[job.level]}</Badge>
            </div>

            {/* Salary */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-emerald-400">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="text-sm text-muted-foreground ml-2">/ year</span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Posted {timeAgo(job.postedAt)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {job.applicantCount} applicants
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {job.viewCount.toLocaleString()} views
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Expires {formatDate(job.expiresAt)}
              </span>
            </div>

            {/* Skills tags */}
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="tag text-xs bg-blue-500/[0.07] border-blue-500/20 text-blue-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* About the Role */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">About the Role</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{job.description}</p>

            {/* Requirements */}
            <h3 className="text-sm font-semibold text-foreground mb-3">Requirements</h3>
            <ul className="space-y-2.5 mb-6">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {req}
                </li>
              ))}
            </ul>

            {/* Nice to Have */}
            {job.niceToHave && job.niceToHave.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-foreground mb-3">Nice to Have</h3>
                <ul className="space-y-2.5">
                  {job.niceToHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>

          {/* Skills Match */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Your Skills Match</h2>
              <MatchRing score={score} size={64} strokeWidth={5} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {skillMatchData.map((skill) => (
                <div
                  key={skill.name}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-xl border transition-all',
                    skill.has
                      ? 'bg-emerald-500/[0.06] border-emerald-500/20'
                      : 'bg-white/[0.03] border-white/[0.08]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {skill.has ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={cn('text-sm font-medium', skill.has ? 'text-foreground' : 'text-muted-foreground')}>
                      {skill.name}
                    </span>
                  </div>
                  {skill.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                      <Shield className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              You match{' '}
              <span className="text-emerald-400 font-semibold">{matchedCount} of {skillMatchData.length}</span>
              {' '}required skills
            </p>
          </motion.div>

          {/* About the Company */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <Avatar className="h-11 w-11 ring-2 ring-white/10">
                <AvatarImage src={company.logo} />
                <AvatarFallback className="text-sm font-bold">{company.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">About {company.name}</h2>
                <p className="text-xs text-muted-foreground">{company.website}</p>
              </div>
            </div>

            {/* Company badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="ghost">{company.industry}</Badge>
              <Badge variant="ghost">{company.size} employees</Badge>
              <Badge variant="ghost">
                <MapPin className="w-3 h-3" />
                {company.location}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{company.description}</p>

            {/* Culture */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Culture</p>
              <div className="flex flex-wrap gap-2">
                {company.culture.map((c) => (
                  <span key={c} className="tag text-xs bg-purple-500/[0.07] border-purple-500/20 text-purple-400">{c}</span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Benefits</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {company.benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                    {benefitIcons[b] ?? <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn('w-4 h-4', i < Math.round(company.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30')}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{company.rating}</span>
              <span className="text-xs text-muted-foreground">({company.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <Link
              href={`/company/profile`}
              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
            >
              View Company Profile
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Similar Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Similar Jobs</h2>
            <div className="space-y-3">
              {similarJobs.map((sj) => (
                <CompactJobCard key={sj.id} job={sj} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN (Sticky Apply Sidebar) ──────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="gradient-border p-5 bg-card"
            >
              {/* Match ring */}
              <div className="flex flex-col items-center mb-5">
                <MatchRing score={score} size={72} strokeWidth={5} />
                <p className="text-xs text-muted-foreground mt-2">AI Match Score</p>
              </div>

              {/* Apply heading */}
              <div className="text-center mb-5">
                <h3 className="text-base font-bold text-foreground">Apply to {job.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">At {company.name}</p>
                <p className="text-lg font-bold text-emerald-400 mt-2">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">/ year</span>
                </p>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="text-center p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <Wifi className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Remote-Friendly</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <Briefcase className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Full-time</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <GraduationCap className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Senior Level</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2.5 mb-5">
                <Button className="w-full btn-primary font-semibold">
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className={cn('w-full gap-2', saved && 'border-blue-500/40 text-blue-400 bg-blue-500/10')}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
                  {saved ? 'Saved' : 'Save for Later'}
                </Button>
              </div>

              <Separator className="mb-5" />

              {/* AI reasons */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Why you're a strong match
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, text: 'React expertise: 96% skill overlap' },
                    { icon: <Wifi className="w-3.5 h-3.5 text-cyan-400 shrink-0" />, text: 'Work mode: Remote aligns with your preference' },
                    { icon: <DollarSign className="w-3.5 h-3.5 text-amber-400 shrink-0" />, text: 'Salary: Within your $210K target' },
                  ].map((reason, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      {reason.icon}
                      <span>{reason.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="mb-5" />

              {/* Alert toggle */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Set Job Alert</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Get notified of similar openings</p>
                </div>
                <button
                  onClick={() => setAlertEnabled(!alertEnabled)}
                  className={cn(
                    'w-10 h-[22px] rounded-full transition-all duration-200 relative flex-shrink-0',
                    alertEnabled ? 'bg-blue-500' : 'bg-white/10'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
                      alertEnabled && 'translate-x-[18px]'
                    )}
                  />
                </button>
              </div>

              {/* Share */}
              <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                <Share2 className="w-4 h-4" />
                Share this Job
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
