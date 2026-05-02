'use client'

import { useState, useEffect } from 'react'
import { getTalentProfile } from '@/lib/api'
import { Skill } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Shield,
  Award,
  Plus,
  RotateCcw,
  Clock,
  ChevronRight,
  Zap,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  TrendingUp,
  Star,
  AlertTriangle,
  Code2,
  Cpu,
  Globe,
  Database,
  Layers,
  GitBranch,
  FlaskConical,
} from 'lucide-react'

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  expert: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const levelLabel: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

interface Assessment {
  id: string
  name: string
  icon: React.ReactNode
  duration: string
  questions: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  taken?: boolean
  score?: number
  takenAt?: string
  matchBoost: string
  category: string
}

const assessments: Assessment[] = [
  {
    id: 'react',
    name: 'React & Component Patterns',
    icon: <Code2 className="w-5 h-5 text-cyan-400" />,
    duration: '30 min',
    questions: 50,
    difficulty: 'Hard',
    taken: true,
    score: 94,
    takenAt: '2025-03-15',
    matchBoost: '+18%',
    category: 'Frontend',
  },
  {
    id: 'typescript',
    name: 'TypeScript & Type Systems',
    icon: <Code2 className="w-5 h-5 text-blue-400" />,
    duration: '25 min',
    questions: 45,
    difficulty: 'Hard',
    taken: true,
    score: 92,
    takenAt: '2025-03-18',
    matchBoost: '+16%',
    category: 'Frontend',
  },
  {
    id: 'javascript',
    name: 'JavaScript Fundamentals',
    icon: <Star className="w-5 h-5 text-amber-400" />,
    duration: '25 min',
    questions: 40,
    difficulty: 'Medium',
    taken: true,
    score: 96,
    takenAt: '2025-03-10',
    matchBoost: '+14%',
    category: 'Frontend',
  },
  {
    id: 'css',
    name: 'CSS & Design Systems',
    icon: <Layers className="w-5 h-5 text-purple-400" />,
    duration: '20 min',
    questions: 35,
    difficulty: 'Medium',
    taken: false,
    matchBoost: '+12%',
    category: 'Frontend',
  },
  {
    id: 'graphql',
    name: 'GraphQL & API Design',
    icon: <GitBranch className="w-5 h-5 text-pink-400" />,
    duration: '25 min',
    questions: 40,
    difficulty: 'Medium',
    taken: false,
    matchBoost: '+23%',
    category: 'Backend',
  },
  {
    id: 'system-design',
    name: 'System Design',
    icon: <Cpu className="w-5 h-5 text-orange-400" />,
    duration: '45 min',
    questions: 15,
    difficulty: 'Hard',
    taken: false,
    matchBoost: '+19%',
    category: 'Architecture',
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    icon: <FlaskConical className="w-5 h-5 text-green-400" />,
    duration: '60 min',
    questions: 30,
    difficulty: 'Hard',
    taken: false,
    matchBoost: '+21%',
    category: 'Computer Science',
  },
  {
    id: 'web-perf',
    name: 'Web Performance',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    duration: '20 min',
    questions: 30,
    difficulty: 'Medium',
    taken: false,
    matchBoost: '+15%',
    category: 'Frontend',
  },
]

const difficultyColors = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/30',
}

interface Certification {
  id: string
  name: string
  issuer: string
  obtainedAt: string
  expiresAt: string
  credentialUrl: string
  logo: string
}

const mockCerts: Certification[] = [
  {
    id: 'cert1',
    name: 'AWS Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    obtainedAt: '2024-06-10',
    expiresAt: '2027-06-10',
    credentialUrl: 'https://aws.amazon.com/certification/',
    logo: '☁️',
  },
  {
    id: 'cert2',
    name: 'Google Cloud Professional Developer',
    issuer: 'Google Cloud',
    obtainedAt: '2024-02-20',
    expiresAt: '2026-02-20',
    credentialUrl: 'https://cloud.google.com/certification/',
    logo: '🌐',
  },
  {
    id: 'cert3',
    name: 'Meta React Developer Certification',
    issuer: 'Meta',
    obtainedAt: '2023-11-05',
    expiresAt: '2025-11-05',
    credentialUrl: 'https://developers.facebook.com/',
    logo: '⚛️',
  },
  {
    id: 'cert4',
    name: 'GitHub Actions Certification',
    issuer: 'GitHub',
    obtainedAt: '2024-08-15',
    expiresAt: '2026-08-15',
    credentialUrl: 'https://github.com/certifications',
    logo: '🐙',
  },
]

const gapSkills = [
  {
    name: 'GraphQL (Advanced)',
    resource: 'The Guild — GraphQL Tutorials',
    href: '#',
    hours: '8h',
  },
  {
    name: 'WebGL & Canvas API',
    resource: 'WebGL Fundamentals by gfxfundamentals',
    href: '#',
    hours: '12h',
  },
  {
    name: 'Rust (Systems Programming)',
    resource: 'The Rust Programming Language Book',
    href: '#',
    hours: '20h',
  },
]

interface CertForm {
  name: string
  issuer: string
  obtainedAt: string
  expiresAt: string
  credentialUrl: string
}

const emptyCertForm: CertForm = {
  name: '', issuer: '', obtainedAt: '', expiresAt: '', credentialUrl: '',
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(d))
}

function isExpiringSoon(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff < 1000 * 60 * 60 * 24 * 90 // within 90 days
}

export default function SkillsPage() {
  const [certs, setCerts] = useState<Certification[]>(mockCerts)
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [certForm, setCertForm] = useState<CertForm>(emptyCertForm)
  const [assessmentList, setAssessmentList] = useState<Assessment[]>(assessments)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [verifiedSkills, setVerifiedSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await getTalentProfile()
      if (res.data) {
        setVerifiedSkills(res.data.skills.filter(s => s.verified))
      }
      setLoading(false)
    }
    load()
  }, [])

  const totalAssessmentsPassed = assessmentList.filter(a => a.taken).length
  const profileBoost = 34

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  function handleSaveCert() {
    if (!certForm.name || !certForm.issuer) return
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: certForm.name,
      issuer: certForm.issuer,
      obtainedAt: certForm.obtainedAt,
      expiresAt: certForm.expiresAt,
      credentialUrl: certForm.credentialUrl,
      logo: '🏅',
    }
    setCerts(prev => [...prev, newCert])
    setCertForm(emptyCertForm)
    setCertDialogOpen(false)
  }

  function handleStartAssessment(id: string) {
    setStartingId(id)
    setTimeout(() => {
      setAssessmentList(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, taken: true, score: Math.floor(Math.random() * 20 + 78), takenAt: new Date().toISOString().slice(0, 10) }
            : a
        )
      )
      setStartingId(null)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow mb-3 inline-flex">
            <FlaskConical className="w-3.5 h-3.5" />
            Skills Laboratory
          </div>
          <h1 className="text-2xl font-bold text-foreground">Skills & Certifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify your skills to unlock <span className="text-blue-400 font-semibold">3x more job matches</span>
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Verified Skills', value: verifiedSkills.length, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Assessments Passed', value: totalAssessmentsPassed, icon: Award, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Profile Boost', value: `+${profileBoost}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`glass-card p-4 border ${stat.bg}`}>
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Verified Skills Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-foreground">Verified Skills</h2>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
            {verifiedSkills.length} verified
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {verifiedSkills.map(skill => (
            <div
              key={skill.name}
              className="glass-card p-5 hover:border-emerald-500/25 transition-all duration-200 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground">{skill.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${levelColors[skill.level as SkillLevel]}`}>
                      {levelLabel[skill.level as SkillLevel]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-medium">Verified by Calibr</span>
                  </div>
                </div>
                {skill.score !== undefined && (
                  <MatchRing score={skill.score} size={52} strokeWidth={4} />
                )}
              </div>

              {skill.score !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Assessment Score</span>
                    <span className="font-bold text-emerald-400">{skill.score}/100</span>
                  </div>
                  <Progress value={skill.score} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Verified {formatDate('2025-03-15')}
                </span>
                <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Retake to Improve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Available Assessments Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-foreground">Available Assessments</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {assessmentList.filter(a => !a.taken).length} remaining
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessmentList.map(assessment => (
            <div
              key={assessment.id}
              className={cn(
                'glass-card p-5 space-y-4 transition-all duration-300',
                assessment.taken
                  ? 'hover:border-emerald-500/25'
                  : 'hover:border-blue-500/25'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center shrink-0">
                  {assessment.icon}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColors[assessment.difficulty]}`}>
                  {assessment.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground leading-tight">{assessment.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{assessment.category}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {assessment.duration}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {assessment.questions} questions
                </div>
              </div>

              {/* Score (if taken) */}
              {assessment.taken && assessment.score !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Your Score</span>
                    <span className="font-bold text-emerald-400">{assessment.score}/100</span>
                  </div>
                  <Progress value={assessment.score} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">
                    Taken {assessment.takenAt ? formatDate(assessment.takenAt) : ''}
                  </p>
                </div>
              )}

              {/* Match teaser */}
              {!assessment.taken && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-[11px] text-blue-400">
                    Unlock <span className="font-bold">{assessment.matchBoost}</span> more matches
                  </span>
                </div>
              )}

              {/* CTA */}
              <Button
                size="sm"
                className="w-full text-xs"
                variant={assessment.taken ? 'outline' : 'default'}
                onClick={() => handleStartAssessment(assessment.id)}
                disabled={startingId === assessment.id}
              >
                {startingId === assessment.id ? (
                  <>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Starting...
                  </>
                ) : assessment.taken ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Retake Assessment
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Start Assessment
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-foreground">Certifications</h2>
          </div>
          <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Certification</DialogTitle>
                <DialogDescription>
                  Add a professional certification to strengthen your profile.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Certification Name *</Label>
                  <Input
                    placeholder="e.g. AWS Solutions Architect"
                    value={certForm.name}
                    onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Issuing Organization *</Label>
                  <Input
                    placeholder="e.g. Amazon Web Services"
                    value={certForm.issuer}
                    onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date Obtained</Label>
                    <Input
                      type="date"
                      value={certForm.obtainedAt}
                      onChange={e => setCertForm(f => ({ ...f, obtainedAt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={certForm.expiresAt}
                      onChange={e => setCertForm(f => ({ ...f, expiresAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Credential URL</Label>
                  <Input
                    placeholder="https://..."
                    value={certForm.credentialUrl}
                    onChange={e => setCertForm(f => ({ ...f, credentialUrl: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="ghost" onClick={() => setCertDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveCert}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Certification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {certs.map(cert => {
            const expiring = cert.expiresAt ? isExpiringSoon(cert.expiresAt) : false
            return (
              <div
                key={cert.id}
                className={cn(
                  'glass-card p-4 flex items-center gap-4 hover:border-white/[0.15] transition-all duration-200',
                  expiring && 'border-amber-500/25'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-border flex items-center justify-center text-2xl shrink-0">
                  {cert.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{cert.name}</h3>
                    {expiring && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-medium">Expiring soon</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{cert.issuer}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span>Obtained {formatDate(cert.obtainedAt)}</span>
                    {cert.expiresAt && (
                      <>
                        <span>•</span>
                        <span>Expires {formatDate(cert.expiresAt)}</span>
                      </>
                    )}
                  </div>
                </div>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2 rounded-lg bg-white/5 border border-border hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Skills Gap Analysis — Premium Teaser */}
      <section>
        <div className="glass-card p-6 relative overflow-hidden">
          {/* Gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">Skills Gap Analysis</h2>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                      Premium
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    AI-powered gap analysis based on your target roles
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <p className="text-sm text-muted-foreground">
                Based on <span className="text-foreground font-medium">Senior Frontend Engineer</span> roles you&apos;re targeting, you&apos;re missing:
              </p>
              <div className="flex flex-wrap gap-2">
                {['WebGL', 'Rust', 'GraphQL (Advanced)'].map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs text-red-400"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Your recommended learning path:</p>
              {gapSkills.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.resource}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{item.hours}</span>
                    <a
                      href={item.href}
                      className="p-1.5 rounded-lg bg-white/5 border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full sm:w-auto gap-2">
              <Zap className="w-4 h-4" />
              Unlock Full Analysis
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
