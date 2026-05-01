'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { candidates } from '@/lib/data'
import { formatSalary, formatDate, cn } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  Download,
  Send,
  UserPlus,
  Shield,
  AlertTriangle,
  Sparkles,
  Calendar,
  Building2,
  GraduationCap,
  Star,
  Trophy,
  Zap,
  ChevronRight,
  Briefcase,
} from 'lucide-react'

const levelColors: Record<string, string> = {
  beginner: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  expert: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const levelLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

function formatDateRange(start: string, end?: string, current?: boolean): string {
  const fmt = (d: string) => {
    const [year, month] = d.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }
  return `${fmt(start)} – ${current ? 'Present' : end ? fmt(end) : ''}`
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = candidates.find((c) => c.id === params.id) || candidates[0]
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const verifiedSkills = candidate.skills.filter((s) => s.verified)
  const selfReportedSkills = candidate.skills.filter((s) => !s.verified)

  const assessmentEntries = Object.entries(candidate.assessmentScores)

  // AI match breakdown (simulated)
  const matchBreakdown = [
    { label: 'Overall Match', value: candidate.matchScore, color: 'bg-emerald-500' },
    { label: 'Skills Match', value: Math.round(candidate.matchScore * 0.98), color: 'bg-blue-500' },
    { label: 'Culture Fit', value: Math.round(candidate.matchScore * 0.93), color: 'bg-purple-500' },
    { label: 'Experience Alignment', value: Math.round(candidate.matchScore * 1.01 > 100 ? 100 : candidate.matchScore * 1.01), color: 'bg-cyan-500' },
  ]

  const aiReasons = [
    `${verifiedSkills.length > 0 ? verifiedSkills[0].name : 'Primary skill'} verified at ${verifiedSkills[0]?.score ?? 90}% — top 5% of candidates`,
    'Current role at a tier-1 tech company with direct relevant experience',
    'Salary expectation of $' + Math.round(candidate.salaryExpectation / 1000) + 'K aligns with your budget range',
    `${candidate.workPreference.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' / ')} preference matches your job posting`,
    `${candidate.education[0]?.degree} from ${candidate.education[0]?.institution} — strong academic background`,
  ]

  const riskSignals = [
    { text: 'No direct fintech experience in work history', severity: 'medium' },
    { text: 'Gap in employment detected 2020–2021', severity: 'low' },
  ]

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
          href="/company/candidates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Candidates
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-6"
            >
              {/* Avatar + name */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="relative mb-3">
                  <Avatar className="w-24 h-24 ring-4 ring-white/10">
                    <AvatarImage src={candidate.avatar} alt={candidate.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {candidate.verified && (
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-2 border-card flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{candidate.title}</p>
                {candidate.experience[0] && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">at {candidate.experience[0].company}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {candidate.location}
                </div>
                <div className="mt-2">
                  <Badge variant="success" className="text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                    {candidate.availability}
                  </Badge>
                </div>
              </div>

              {/* Match ring */}
              <div className="flex flex-col items-center mb-5">
                <MatchRing score={candidate.matchScore} size={80} strokeWidth={6} />
                <p className="text-xs text-muted-foreground mt-2">AI Match Score</p>
              </div>

              <Separator className="mb-5" />

              {/* Contact info */}
              <div className="space-y-2.5 mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</p>
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate group-hover:text-blue-400">{candidate.email}</span>
                </a>
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="group-hover:text-emerald-400">{candidate.phone}</span>
                </a>
                {candidate.github && (
                  <a
                    href={`https://${candidate.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Github className="w-4 h-4 text-foreground shrink-0" />
                    <span className="truncate group-hover:text-foreground">{candidate.github}</span>
                  </a>
                )}
                {candidate.linkedin && (
                  <a
                    href={`https://${candidate.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Linkedin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate group-hover:text-blue-400">{candidate.linkedin}</span>
                  </a>
                )}
                {candidate.portfolio && (
                  <a
                    href={`https://${candidate.portfolio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate group-hover:text-purple-400">{candidate.portfolio}</span>
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 mb-5">
                <Button className="w-full btn-primary gap-2 font-semibold">
                  <UserPlus className="w-4 h-4" />
                  Move to Pipeline
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
                <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" />
                  Download Resume
                </Button>
              </div>

              <Separator className="mb-5" />

              {/* Preferences */}
              <div className="space-y-3 mb-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Salary Expectation</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    ${Math.round(candidate.salaryExpectation / 1000)}K
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Work Preference</span>
                  <span className="text-xs font-medium text-foreground text-right">
                    {candidate.workPreference.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(', ')}
                  </span>
                </div>
                {candidate.languages && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">Languages</span>
                    <span className="text-xs font-medium text-foreground text-right">
                      {candidate.languages.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <Separator className="mb-5" />

              {/* Recruiter notes */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  Recruiter Notes
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this candidate..."
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── RIGHT MAIN TABS ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-5">
                {/* Bio */}
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-3">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{candidate.bio}</p>
                </div>

                {/* AI Match Analysis */}
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">AI Match Analysis</h3>
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
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4">Why this candidate?</h3>
                  <ul className="space-y-3">
                    {aiReasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Signals */}
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4">Risk Signals</h3>
                  <div className="space-y-3">
                    {riskSignals.map((signal, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-xl border text-sm',
                          signal.severity === 'medium'
                            ? 'bg-amber-500/[0.06] border-amber-500/20 text-amber-400'
                            : 'bg-yellow-500/[0.04] border-yellow-500/15 text-yellow-500'
                        )}
                      >
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        {signal.text}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4">
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-5">Work History</h3>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-white/[0.08]" />
                    <div className="space-y-6">
                      {candidate.experience.map((exp, i) => (
                        <div key={exp.id} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={cn(
                            'absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-card',
                            exp.current ? 'bg-emerald-400' : 'bg-blue-500'
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
                                  <Badge variant="success" className="text-[10px] mt-1">Current</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{exp.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {exp.skills.map((skill) => (
                              <span key={skill} className="tag text-[11px] bg-blue-500/[0.06] border-blue-500/15 text-blue-400">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-4">
                <div className="glass-card p-5">
                  <h3 className="text-base font-semibold text-foreground mb-5">Education</h3>
                  <div className="space-y-5">
                    {candidate.education.map((edu) => (
                      <div key={edu.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {edu.degree} in {edu.field}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">{edu.institution}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDateRange(edu.startDate, edu.endDate)}
                            </span>
                          </div>
                          {edu.gpa && (
                            <div className="mt-2">
                              <Badge variant="ghost" className="text-[11px]">GPA: {edu.gpa}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-4">
                {/* Verified Skills */}
                {verifiedSkills.length > 0 && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <h3 className="text-base font-semibold text-foreground">Verified Skills</h3>
                      <Badge variant="blue" className="ml-auto text-[10px]">{verifiedSkills.length} verified</Badge>
                    </div>
                    <div className="space-y-4">
                      {verifiedSkills.map((skill) => (
                        <div key={skill.name}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', levelColors[skill.level])}>
                                {levelLabel[skill.level]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {skill.score !== undefined && (
                                <span className="text-sm font-bold text-foreground">{skill.score}%</span>
                              )}
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                <Shield className="w-2.5 h-2.5" />
                                Verified by Calibr
                              </span>
                            </div>
                          </div>
                          {skill.score !== undefined && (
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.score}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-Reported Skills */}
                {selfReportedSkills.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-foreground mb-5">Self-Reported Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selfReportedSkills.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                          <span className="text-sm text-foreground">{skill.name}</span>
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', levelColors[skill.level])}>
                            {levelLabel[skill.level]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Assessments Tab */}
              <TabsContent value="assessments" className="space-y-4">
                {/* Top callout */}
                <div className="glass-card p-5 bg-gradient-to-r from-emerald-500/[0.06] to-blue-500/[0.06] border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Top {Math.floor(100 - (Object.values(candidate.assessmentScores)[0] ?? 90))}% of{' '}
                        {Object.keys(candidate.assessmentScores)[0]
                          ? Object.keys(candidate.assessmentScores)[0].charAt(0).toUpperCase() +
                            Object.keys(candidate.assessmentScores)[0].slice(1)
                          : 'Technical'}{' '}
                        developers
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Based on Calibr verified assessments</p>
                    </div>
                  </div>
                </div>

                {/* Assessment table */}
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="text-base font-semibold text-foreground">Assessment Scores</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Assessment</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Score</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Percentile</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assessmentEntries.map(([key, score], i) => {
                          const percentile = Math.round(100 - (100 - score) * 0.4)
                          return (
                            <tr
                              key={key}
                              className={cn('border-b border-border/50 hover:bg-white/[0.02] transition-colors', i === assessmentEntries.length - 1 && 'border-0')}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
                                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                  <span className="text-sm font-medium text-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-foreground">{score}%</span>
                                  <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={cn(
                                  'text-sm font-semibold',
                                  percentile >= 90 ? 'text-emerald-400' : percentile >= 75 ? 'text-blue-400' : 'text-muted-foreground'
                                )}>
                                  Top {100 - percentile}%
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <Badge variant="success" className="text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
