'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { testimonials, pricingPlans } from '@/lib/data'
import { formatNumber } from '@/lib/utils'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  Brain,
  CheckCircle2,
  Star,
  ChevronRight,
  Building2,
  Target,
  Eye,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart2,
  Play,
  Briefcase,
  UserCheck,
  Kanban,
  MessageSquare,
  Lock,
  Globe,
} from 'lucide-react'

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const duration = 2000
          const step = target / (duration / 16)
          let cur = 0
          const timer = setInterval(() => {
            cur += step
            if (cur >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(cur))
          }, 16)
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{prefix}{formatNumber(count)}{suffix}</span>
}

// ─── SECTION REVEAL ──────────────────────────────────────────────────────────

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const metrics = [
  { label: 'Companies Hiring', value: 14200, suffix: '+', prefix: '' },
  { label: 'Successful Hires', value: 87400, suffix: '+', prefix: '' },
  { label: 'Days to Hire (avg)', value: 18, suffix: '', prefix: '' },
  { label: 'Match Accuracy', value: 94, suffix: '%', prefix: '' },
]

const companyFeatures = [
  { icon: Brain, title: 'AI Candidate Ranking', desc: 'Every applicant scored on skills, culture fit, and growth potential — not just keywords. Top 5% surface instantly.', metric: '40x faster screening' },
  { icon: Kanban, title: 'Pipeline Kanban', desc: 'Drag-drop hiring pipeline with 6 stages, team scorecards, and automated interview scheduling built in.', metric: '65% less admin work' },
  { icon: BarChart2, title: 'Hiring Analytics', desc: 'Full funnel analytics — cost per hire, time-to-fill, source attribution, diversity metrics, and offer accept rates.', metric: 'See full ROI' },
  { icon: Users, title: 'Collaborative Hiring', desc: 'Invite your whole team. Share feedback, score candidates, and align on decisions — all in one place.', metric: 'No more email chains' },
]

const talentFeatures = [
  { icon: Target, title: 'Match Score per Job', desc: 'See exactly how well you fit each role before applying. Stop wasting time on roles where you have <50% match.', metric: '3x more interviews' },
  { icon: Eye, title: 'Zero Ghosting Guarantee', desc: 'Real-time status at every stage. We contractually require companies to update you within 5 business days.', metric: '89% response rate' },
  { icon: DollarSign, title: 'Verified Salary Data', desc: 'See real compensation from actual offers — not self-reported surveys. Know your market value before the call.', metric: 'Avg. +$18K negotiated' },
  { icon: UserCheck, title: 'Skills Verification', desc: 'Complete short assessments to verify your skills. Verified candidates get 3x more matches than unverified.', metric: '300% more visibility' },
]

const companies = ['Stripe', 'Notion', 'Vercel', 'Linear', 'Figma', 'Airtable', 'Loom', 'Retool']

const trustBadges = [
  { icon: Shield, label: 'SOC2 Type II' },
  { icon: Lock, label: 'GDPR Compliant' },
  { icon: Globe, label: '99.9% Uptime SLA' },
  { icon: Users, label: '14,200+ Companies' },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'company' | 'talent'>('company')

  return (
    <div className="bg-background overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full opacity-10 dark:opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 91% 60%), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full opacity-8 dark:opacity-12 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(270 70% 60%), transparent 70%)', filter: 'blur(80px)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-500 dark:text-blue-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Hiring · Trusted by 14,200+ companies
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tight mb-6"
          >
            Hire smarter.
            <br />
            <span className="gradient-text">Get hired faster.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            Calibr is an AI hiring platform that helps{' '}
            <strong className="text-foreground font-semibold">companies find qualified candidates in 18 days</strong>
            {' '}and helps{' '}
            <strong className="text-foreground font-semibold">job seekers land roles that actually fit</strong> — with zero ghosting.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-600/30 px-8 h-12 text-base"
            >
              <Link href="/register">
                Start Hiring Free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/talent/jobs">
                Find Jobs
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-5 mb-14 text-sm text-muted-foreground"
          >
            {['No credit card required', '14-day free trial', 'Cancel anytime', 'SOC2 Type II'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {t}
              </div>
            ))}
          </motion.div>

          {/* Product preview */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-6 rounded-3xl opacity-30 dark:opacity-50 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.4), hsl(270 70% 60% / 0.3))', filter: 'blur(40px)' }} />

            {/* Browser chrome */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5 max-w-xs mx-auto">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    app.calibr.io/company/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard mockup content */}
              <div className="p-5 bg-background">
                {/* Top stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Applicants', value: '1,847', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Time to Hire', value: '18d', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    { label: 'Hired / Month', value: '7', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  ].map((s) => (
                    <div key={s.label} className="glass-card p-3">
                      <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                        <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                      </div>
                      <div className="text-lg font-bold text-foreground">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Candidates table */}
                <div className="glass-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground">Top Matched Candidates</span>
                    <span className="text-[10px] text-primary">View all →</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Alex Chen', role: 'Sr. Frontend Engineer', score: 96, skills: ['React', 'TypeScript'], salary: '$210K', color: 'from-blue-500 to-blue-600' },
                      { name: 'Sofia Reyes', role: 'Product Designer', score: 93, skills: ['Figma', 'Systems'], salary: '$185K', color: 'from-purple-500 to-purple-600' },
                      { name: 'Marcus Johnson', role: 'Staff Engineer', score: 88, skills: ['Go', 'Kubernetes'], salary: '$270K', color: 'from-cyan-500 to-cyan-600' },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                          {c.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.role}</p>
                        </div>
                        <div className="hidden sm:flex gap-1">
                          {c.skills.map((s: string) => (
                            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{s}</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-emerald-500 font-semibold shrink-0">{c.salary}</span>
                        <div className="w-8 h-8 relative shrink-0">
                          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="13" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                            <circle cx="16" cy="16" r="13" fill="none" stroke="#10b981"
                              strokeWidth="2.5"
                              strokeDasharray={`${(c.score / 100) * 81.7} 81.7`}
                              strokeLinecap="round" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">{c.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 glass-card px-3 py-2 text-xs font-semibold text-emerald-500 shadow-lg hidden md:flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              96% Match Found
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -bottom-4 -right-4 glass-card px-3 py-2 text-xs font-semibold text-blue-500 shadow-lg hidden md:flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3" />
              Hired in 18 days
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ LOGOS STRIP ═════════════════════════════════════════════════════════ */}
      <section className="border-y border-border py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            Trusted by engineering teams at
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8 md:gap-12">
            {companies.map((name) => (
              <span key={name} className="text-sm font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors uppercase tracking-widest">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT IS TALENTBRIDGE ════════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="section-eyebrow mb-4">The Platform</div>
          <h2 className="section-title mb-4">
            One platform. <span className="gradient-text">Both sides win.</span>
          </h2>
          <p className="section-subtitle">
            Calibr is the first hiring platform built equally for companies AND candidates — with AI that serves both sides fairly.
          </p>
        </Reveal>

        {/* Tab selector */}
        <Reveal delay={0.1}>
          <div className="flex justify-center mb-10">
            <div className="flex gap-1 p-1 rounded-2xl bg-muted border border-border">
              {(['company', 'talent'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'company' ? <Building2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {tab === 'company' ? 'For Companies' : 'For Job Seekers'}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {(activeTab === 'company' ? companyFeatures : talentFeatures).map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="glass-card p-6 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{f.metric}</div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <Reveal delay={0.2} className="mt-8 text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href={activeTab === 'company' ? '/company/dashboard' : '/talent/dashboard'}>
              See the full {activeTab === 'company' ? 'company' : 'talent'} dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="section-eyebrow mb-4">How It Works</div>
            <h2 className="section-title mb-4">
              Up and running <span className="gradient-text">in minutes</span>
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Company steps */}
            <Reveal delay={0.1}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-bold text-foreground">For Companies</h3>
              </div>
              <div className="space-y-6">
                {[
                  { n: '01', title: 'Post Your Role', desc: 'Rich job posting with salary ranges, culture signals, and team insights. AI auto-generates the description from your requirements. Takes 5 minutes.', tag: '5 min setup' },
                  { n: '02', title: 'AI Ranks Applicants', desc: 'Every applicant scored on skills, culture fit, and growth potential — not keywords. Only the top candidates surface. No resume-reading needed.', tag: '94% accuracy' },
                  { n: '03', title: 'Hire in 18 Days', desc: 'Kanban pipeline, collaborative scorecards, and automated scheduling built in. Team alignment happens in the platform, not in email threads.', tag: '65% faster' },
                ].map((step, i) => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">{step.tag}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0">
                  <Link href="/register">Start Hiring Free <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </Reveal>

            {/* Talent steps */}
            <Reveal delay={0.2}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="font-bold text-foreground">For Job Seekers</h3>
              </div>
              <div className="space-y-6">
                {[
                  { n: '01', title: 'Build Your Profile', desc: 'Skills, experience, salary expectations. Complete in 10 minutes. Verify your skills to get 3x more matches. No cover letters needed.', tag: '10 min setup' },
                  { n: '02', title: 'See Your Match Score', desc: 'Daily feed of roles where you\'re genuinely competitive — with a % match score and salary intel for every role. Stop applying blindly.', tag: 'Know your odds' },
                  { n: '03', title: 'Track with Full Visibility', desc: 'Every application has a real-time status. You\'ll always know where you stand. Zero ghosting — companies must update you within 5 business days.', tag: 'Zero ghosting' },
                ].map((step, i) => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                      {step.n}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-semibold border border-purple-500/20">{step.tag}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link href="/talent/jobs">Browse Jobs <ChevronRight className="w-4 h-4 ml-1" /></Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ METRICS ═════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <div className="section-eyebrow mb-4">By the Numbers</div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Results that speak for themselves
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.1} className="glass-card p-8 text-center group hover:border-primary/30 transition-all duration-300">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                <AnimatedCounter target={m.value} suffix={m.suffix} prefix={m.prefix} />
              </div>
              <p className="text-sm text-muted-foreground">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ PROBLEM → SOLUTION ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="section-eyebrow mb-4">The Problem</div>
            <h2 className="section-title mb-4">
              Hiring is broken <span className="gradient-text">for everyone.</span>
            </h2>
            <p className="section-subtitle">
              Traditional job boards created a lose-lose: companies drown in unqualified resumes, candidates disappear into black holes.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Company pains */}
            <Reveal delay={0.1} className="glass-card p-8">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-bold text-foreground">Companies struggle with:</h3>
              </div>
              <div className="space-y-4">
                {[
                  { pain: '250 applicants. 22 qualified.', stat: '91% wasted effort' },
                  { pain: '44-day average time-to-hire', stat: '$4,700 per empty seat/day' },
                  { pain: 'Offer rejections after weeks of interviews', stat: '62% offer drop-off' },
                  { pain: 'No visibility into sourcing ROI', stat: 'Budget wasted blindly' },
                ].map((item) => (
                  <div key={item.pain} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{item.pain}</span>
                    <span className="text-xs font-semibold text-red-500 shrink-0 bg-red-500/10 px-2 py-0.5 rounded-full">{item.stat}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Candidate pains */}
            <Reveal delay={0.15} className="glass-card p-8">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-bold text-foreground">Candidates struggle with:</h3>
              </div>
              <div className="space-y-4">
                {[
                  { pain: '"Applied to 80 jobs, heard from 3"', stat: '96% ghosting rate' },
                  { pain: 'ATS rejected before a human saw the resume', stat: '75% filtered out' },
                  { pain: 'No idea what salary to expect', stat: 'Avg. $18K left on table' },
                  { pain: 'Ghosted after making the final round', stat: 'Months of silence' },
                ].map((item) => (
                  <div key={item.pain} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                    <span className="text-sm text-foreground">{item.pain}</span>
                    <span className="text-xs font-semibold text-red-500 shrink-0 bg-red-500/10 px-2 py-0.5 rounded-full">{item.stat}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Solution arrow */}
          <Reveal className="text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Calibr fixes both sides simultaneously</h3>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {[
                  { icon: Brain, text: 'AI ranks applicants — only top 10% surface' },
                  { icon: Clock, text: '18-day average time to hire' },
                  { icon: Eye, text: 'Contractual candidate updates at every stage' },
                  { icon: DollarSign, text: 'Salary intel aligns both sides before call 1' },
                  { icon: Target, text: 'Skills verification replaces credential theater' },
                ].map((s) => (
                  <div key={s.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground">
                    <s.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {s.text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <div className="section-eyebrow mb-4">Testimonials</div>
          <h2 className="section-title mb-4">
            Don&apos;t take our word for it
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-foreground">4.9/5</span>
            <span className="text-sm text-muted-foreground ml-1">from 6,200+ reviews</span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1} className="glass-card p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ PRICING PREVIEW ═════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <div className="section-eyebrow mb-4">Pricing</div>
            <h2 className="section-title mb-4">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="section-subtitle">Start free. Scale as you hire.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.1} className={`glass-card p-7 flex flex-col ${plan.highlighted ? 'border-primary/50 ring-1 ring-primary/20 relative' : ''}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-foreground text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-foreground">${plan.monthlyPrice.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0'
                    : ''}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <Link href="/register">{plan.highlighted ? 'Start Free Trial' : 'Get Started'}</Link>
                </Button>
              </Reveal>
            ))}
          </div>

          <Reveal className="text-center mt-8">
            <Link href="/pricing" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Compare all features <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ TRUST BADGES ════════════════════════════════════════════════════════ */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((b, i) => (
            <Reveal key={b.label} delay={i * 0.08} className="glass-card p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <b.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{b.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(217 91% 60%), transparent)' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <div className="section-eyebrow mb-6">Get Started Today</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Ready to hire smarter
              <br />
              <span className="gradient-text">and get hired faster?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join 14,200+ companies and 87,000+ professionals already on Calibr. Free to start, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-600/30 px-8 h-12 text-base"
              >
                <Link href="/register">
                  Start Free — No Card Needed
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/contact">
                  Talk to Sales
                  <MessageSquare className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
