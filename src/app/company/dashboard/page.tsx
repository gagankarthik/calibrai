'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { analytics, applications, jobs } from '@/lib/data'
import { MatchScore } from '@/components/shared/match-score'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Briefcase,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Clock3,
  Target,
  AlertTriangle,
  Eye,
  ArrowRight,
  Plus,
  Search,
  Kanban,
  Download,
  Calendar,
  MapPin,
  Wifi,
  Building2,
  MonitorSmartphone,
  DollarSign,
} from 'lucide-react'
import { formatSalary, timeAgo } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: 'Applied', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  screening: { label: 'Screening', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  interview: { label: 'Interview', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  technical: { label: 'Technical', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  offer: { label: 'Offer', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  hired: { label: 'Hired', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const workModeIcon: Record<string, React.ReactNode> = {
  remote: <Wifi className="w-3 h-3" />,
  hybrid: <MonitorSmartphone className="w-3 h-3" />,
  onsite: <Building2 className="w-3 h-3" />,
}

export default function CompanyDashboard() {
  const kpiCards: Array<{ icon: React.ElementType; iconColor: string; iconBg: string; label: string; value: number; valueDisplay: string; trend: string; trendType: 'positive' | 'negative' | 'neutral'; TrendIcon: React.ElementType }> = [
    {
      icon: Briefcase,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      label: 'Total Active Jobs',
      value: analytics.totalJobs,
      valueDisplay: analytics.totalJobs.toString(),
      trend: '+2 this week',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      label: 'Total Applicants',
      value: analytics.totalApplicants,
      valueDisplay: analytics.totalApplicants.toLocaleString(),
      trend: '+287 this week',
      trendType: 'positive' as const,
      TrendIcon: TrendingUp,
    },
    {
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      label: 'Hired This Month',
      value: analytics.hiredThisMonth,
      valueDisplay: analytics.hiredThisMonth.toString(),
      trend: 'On track',
      trendType: 'neutral' as const,
      TrendIcon: Minus,
    },
    {
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      label: 'Avg Time to Hire',
      value: analytics.avgTimeToHire,
      valueDisplay: `${analytics.avgTimeToHire}d`,
      trend: '-4 days vs last month',
      trendType: 'positive' as const,
      TrendIcon: TrendingDown,
    },
  ]

  const aiInsights = [
    {
      icon: Clock3,
      iconColor: 'text-blue-400',
      borderColor: 'border-l-blue-500',
      title: 'Peak Apply Time',
      description: 'Tuesdays 10am–12pm see 3.2× more quality applications. Schedule job boosts accordingly.',
    },
    {
      icon: Target,
      iconColor: 'text-emerald-400',
      borderColor: 'border-l-emerald-500',
      title: 'Top Source',
      description: 'Calibr drives 46% of quality hires. Consider increasing budget allocation here.',
    },
    {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      borderColor: 'border-l-amber-500',
      title: 'Candidate Drop-off',
      description: 'Technical stage has 52% drop-off. Consider switching to an async assessment format.',
    },
  ]

  const quickActions = [
    { icon: Plus, label: 'Post New Job', href: '/company/jobs/new', gradient: 'from-blue-600 to-purple-600' },
    { icon: Search, label: 'Browse Talent Pool', href: '/company/candidates', gradient: 'from-purple-600 to-pink-600' },
    { icon: Kanban, label: 'View Pipeline', href: '/company/pipeline', gradient: 'from-cyan-600 to-blue-600' },
    { icon: Download, label: 'Download Report', href: '/company/analytics', gradient: 'from-emerald-600 to-cyan-600' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-screen-xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Good morning, Stripe Team 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's your hiring overview for today
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants} className="stat-card group">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  card.trendType === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : card.trendType === 'negative'
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-white/5 text-muted-foreground'
                }`}
              >
                <card.TrendIcon className="w-3 h-3" />
                <span>{card.trend}</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {card.valueDisplay}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ROI Metrics */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass-card p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10">
            <DollarSign className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">ROI at a Glance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your investment vs. outcomes this quarter</p>
          </div>
        </div>

        {/* 4 metric blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cost per Hire */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Cost per Hire</div>
            <div className="text-2xl font-bold text-foreground">$3,200</div>
            <div className="text-xs text-emerald-400 font-medium">vs $5,800 industry avg</div>
          </div>

          {/* Time to Fill */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Time to Fill</div>
            <div className="text-2xl font-bold text-foreground">18 days</div>
            <div className="text-xs text-emerald-400 font-medium">Industry avg: 42 days</div>
          </div>

          {/* Quality of Hire Score */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quality of Hire Score</div>
            <div className="text-2xl font-bold text-foreground">4.6/5</div>
            <div className="text-xs text-muted-foreground font-medium">Based on 30-day performance</div>
          </div>

          {/* Revenue Impact */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue Impact</div>
            <div className="text-2xl font-bold text-foreground">$2.4M</div>
            <div className="text-xs text-emerald-400 font-medium">Estimated productivity unlocked</div>
          </div>
        </div>

        {/* Savings progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Calibr savings vs traditional recruiting</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Traditional: $87,000</span>
            <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden flex">
              <div
                className="h-full rounded-l-full bg-rose-500/60"
                style={{ width: `${(32 / 87) * 100}%` }}
              />
              <div
                className="h-full rounded-r-full bg-emerald-500/70"
                style={{ width: `${((87 - 32) / 87) * 100}%` }}
              />
            </div>
            <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">With Calibr: $32,000</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500/60" />Spend retained</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500/70" />Savings: $55,000 (63%)</span>
          </div>
        </div>
      </motion.div>

      {/* Two-column: Applications + AI Insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Applications (2/3) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Recent Applications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest candidate activity</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1">
              <Link href="/company/pipeline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => {
              const candidate = app.candidate
              if (!candidate) return null
              const statusCfg = statusConfig[app.status] ?? statusConfig.applied
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-white/10">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                      {candidate.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{candidate.name}</span>
                      <MatchScore score={app.matchScore} size="sm" showLabel={false} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground truncate">{app.job.title}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(app.appliedAt)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Profile
                    </Button>
                    <Button size="sm" className="h-7 text-xs px-2.5 bg-blue-600/80 hover:bg-blue-600 text-white">
                      <ArrowRight className="w-3.5 h-3.5 mr-1" />
                      Next Stage
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* AI Insights (1/3) */}
        <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Insights</h2>
              <p className="text-xs text-muted-foreground">Powered by Calibr AI</p>
            </div>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.title}
                className={`p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-2 ${insight.borderColor} hover:bg-white/[0.05] transition-all duration-200`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <insight.icon className={`w-4 h-4 ${insight.iconColor} shrink-0`} />
                  <span className="text-sm font-semibold text-foreground">{insight.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Offer Accept Rate</span>
              <span className="font-semibold text-emerald-400">{analytics.offerAcceptRate}%</span>
            </div>
            <Progress value={analytics.offerAcceptRate} className="mt-2 h-1.5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Row: Active Jobs + Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Active Jobs */}
        <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Active Jobs</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{jobs.filter(j => j.status === 'active').length} positions open</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1">
              <Link href="/company/jobs">
                Manage all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group"
              >
                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">{job.title}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                      {job.department}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {workModeIcon[job.workMode]}
                      <span className="capitalize">{job.workMode}</span>
                    </span>
                  </div>
                </div>

                {/* Applicants */}
                <div className="hidden sm:block text-right shrink-0">
                  <div className="text-sm font-semibold text-foreground">{job.applicantCount}</div>
                  <div className="text-[10px] text-muted-foreground">applicants</div>
                </div>

                {/* Posted date */}
                <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>

                {/* View button */}
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Link href={`/company/jobs`}>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-foreground">Quick Actions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Jump to common tasks</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="glass-card p-4 flex flex-col items-center gap-3 text-center hover:border-white/[0.15] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground leading-snug">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Bottom stats strip */}
          <div className="pt-2 border-t border-border grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{analytics.offerAcceptRate}%</div>
              <div className="text-[10px] text-muted-foreground">Offer Accept</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-lg font-bold text-foreground">${(analytics.costPerHire / 1000).toFixed(1)}K</div>
              <div className="text-[10px] text-muted-foreground">Cost/Hire</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{analytics.qualityOfHire}/5</div>
              <div className="text-[10px] text-muted-foreground">Quality Score</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
