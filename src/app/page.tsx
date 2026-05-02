'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, Sparkles, BarChart3, Users, Zap, Shield,
  Search, Menu, X, Clock, Brain, MessageSquare,
  Lock, CheckCircle2, Star, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Scroll-triggered fade-in wrapper ────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className,
  up = true,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  up?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: up ? 20 : 0 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Logo mark ────────────────────────────────────────────────────────────────

function TBMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tbm-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#tbm-g)" />
      <circle cx="16" cy="16" r="2.5" fill="white" />
      <circle cx="8.5"  cy="16" r="1.5" fill="white" fillOpacity="0.7" />
      <circle cx="23.5" cy="16" r="1.5" fill="white" fillOpacity="0.7" />
      <circle cx="16"   cy="8.5" r="1.5" fill="white" fillOpacity="0.7" />
      <circle cx="16"   cy="23.5" r="1.5" fill="white" fillOpacity="0.7" />
      <line x1="10" y1="16" x2="13.5" y2="16" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="18.5" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="16" y1="10" x2="16" y2="13.5" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="16" y1="18.5" x2="16" y2="22" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="10.5" y1="13" x2="13.5" y2="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="21.5" y1="13" x2="18.5" y2="10" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="10.5" y1="19" x2="13.5" y2="22" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="21.5" y1="19" x2="18.5" y2="22" stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
    </svg>
  )
}

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Product',      href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing',      href: '/pricing' },
  { label: 'For Talent',   href: '/auth/register?role=talent' },
]

function Nav() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/[0.97] backdrop-blur-md border-b border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
          : 'bg-white/80 backdrop-blur-sm',
      )}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <TBMark size={26} />
          <span className="text-[14.5px] font-semibold text-slate-900 tracking-tight">
            TalentBridge
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3.5 py-2 text-[13.5px] font-medium text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA group */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-[13.5px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register?role=company"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-[13.5px] font-semibold hover:bg-slate-700 transition-colors duration-150"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
          {[...NAV_ITEMS, { label: 'Sign in', href: '/auth/login' }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth/register?role=company"
            onClick={() => setOpen(false)}
            className="block mt-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold text-center"
          >
            Get started free
          </Link>
        </div>
      )}
    </header>
  )
}

// ─── Product mockup ───────────────────────────────────────────────────────────

const MOCK_CANDIDATES = [
  { name: 'Sarah Chen',    role: 'Sr. Software Engineer', score: 97, stage: 'Interview', init: 'SC', clr: '#4f46e5' },
  { name: 'Marcus Johnson', role: 'Full-Stack Developer', score: 94, stage: 'Screened',  init: 'MJ', clr: '#059669' },
  { name: 'Priya Patel',   role: 'ML Engineer',           score: 91, stage: 'Offer',     init: 'PP', clr: '#dc2626' },
  { name: 'Alex Rivera',   role: 'Backend Engineer',      score: 88, stage: 'Applied',   init: 'AR', clr: '#d97706' },
]

function ProductMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.10)] ring-1 ring-slate-900/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-[5px] text-[11px] text-slate-400 text-center truncate select-none">
          app.talentbridge.ai / jobs / senior-engineer / pipeline
        </div>
      </div>

      {/* Job header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-slate-900">Senior Software Engineer</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Active
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Acme Corp · Remote · 24 applicants</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold cursor-default select-none">
          <Sparkles className="w-3 h-3" />
          AI Rank
        </div>
      </div>

      {/* Stage counts */}
      <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/40">
        {[
          { label: 'Applied', n: 24 },
          { label: 'Screened', n: 11 },
          { label: 'Interview', n: 6 },
          { label: 'Offer', n: 2 },
        ].map(s => (
          <div key={s.label} className="py-2.5 text-center">
            <div className="text-[12px] font-bold text-slate-900">{s.n}</div>
            <div className="text-[9.5px] text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI insight */}
      <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
        <span className="text-[10.5px] text-indigo-700 font-medium">
          AI ranked 24 candidates · top 4 scored above 85% · 3 ready for interview
        </span>
      </div>

      {/* Candidates */}
      <div className="p-4 space-y-2">
        {MOCK_CANDIDATES.map(c => (
          <div
            key={c.name}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/40 transition-colors cursor-default"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: c.clr + '18', color: c.clr, border: `1.5px solid ${c.clr}28` }}
            >
              {c.init}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-900 truncate">{c.name}</div>
              <div className="text-[10px] text-slate-400">{c.role}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[12px] font-bold text-emerald-600">{c.score}%</div>
              <div className="text-[9px] text-slate-400">match</div>
            </div>
            <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
              {c.stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-[60px] pb-16 overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          autoPlay
          playsInline
          muted
          loop
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content — centered */}
      <div className="relative z-10 mx-auto max-w-4xl w-full px-4 sm:px-6 text-center">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.07 }}
          className="text-[42px] sm:text-[58px] lg:text-[68px] font-semibold tracking-tight text-white leading-[1.06] mb-6"
        >
          Hire the right&nbsp;people,{' '}
          <span className="text-indigo-400">10× faster.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-[18px] text-white leading-[1.7] mb-10 max-w-2xl mx-auto"
        >
          TalentBridge sources, ranks, and matches top candidates to every
          open role using AI — so your team spends time on interviews, not
          spreadsheets.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="flex flex-wrap justify-center items-center gap-3 mb-10"
        >
          <Link
            href="/auth/register?role=company"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-500 text-white text-[15px] font-semibold hover:bg-indigo-400 transition-colors duration-150 shadow-lg shadow-indigo-500/25"
          >
            Start hiring free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white text-[15px] font-semibold border border-white/20 hover:bg-white/15 transition-colors duration-150 backdrop-blur-sm"
          >
            See how it works
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Social proof (logos) ─────────────────────────────────────────────────────

const LOGOS = [
  'Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon Tech', 'Dropfleet', 'Meridian',
]

function LogosSection() {
  return (
    <FadeIn up={false} className="py-14 border-y border-slate-100 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-[11.5px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-7">
          Trusted by talent teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5">
          {LOGOS.map(name => (
            <span
              key={name}
              className="text-[15px] font-semibold text-slate-300 select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Candidate Sourcing',
    desc: 'Automatically find qualified candidates from GitHub, LinkedIn, and job boards. No manual searching, no wasted hours.',
    accent: 'indigo',
  },
  {
    icon: BarChart3,
    title: '94% Match Accuracy',
    desc: 'Our ML model scores candidate fit against your requirements — validated across 50,000+ successful hires.',
    accent: 'emerald',
  },
  {
    icon: MessageSquare,
    title: 'Automated Outreach',
    desc: 'Personalized multi-step sequences sent on your behalf. Candidates respond to relevance, not volume.',
    accent: 'violet',
  },
  {
    icon: Zap,
    title: 'Pipeline Intelligence',
    desc: 'Full funnel visibility in one view. Bottlenecks, conversion rates, time-per-stage. Always know what to fix.',
    accent: 'amber',
  },
  {
    icon: Users,
    title: 'Zero Ghosting',
    desc: 'Smart nudges keep candidates engaged throughout. Every applicant gets a response. No offer goes unanswered.',
    accent: 'rose',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'SOC2 Type II certified. GDPR compliant. SSO/SAML supported. Your data, your control.',
    accent: 'slate',
  },
] as const

const ACCENT: Record<string, { bg: string; icon: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  ring: 'ring-indigo-100' },
  emerald:{ bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  violet: { bg: 'bg-violet-50',  icon: 'text-violet-600',  ring: 'ring-violet-100' },
  amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'ring-amber-100' },
  rose:   { bg: 'bg-rose-50',    icon: 'text-rose-600',    ring: 'ring-rose-100' },
  slate:  { bg: 'bg-slate-100',  icon: 'text-slate-600',   ring: 'ring-slate-200' },
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <FadeIn className="mb-14">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-indigo-600 mb-3">
            Built for modern teams
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4 max-w-xl leading-tight">
            Everything you need to hire. Nothing you don&rsquo;t.
          </h2>
          <p className="text-[16px] text-slate-500 max-w-lg leading-relaxed">
            A complete AI hiring stack designed for speed, quality, and team clarity.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const c = ACCENT[f.accent]
            const Icon = f.icon
            return (
              <FadeIn key={f.title} delay={i * 0.06}>
                <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200 h-full flex flex-col gap-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center ring-1', c.bg, c.ring)}>
                    <Icon className={cn('w-5 h-5', c.icon)} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Showcase (how it works + match breakdown mockup) ─────────────────────────

const STEPS = [
  {
    icon: Search,
    title: 'Post a role',
    desc: 'Describe the position in plain language. AI extracts required skills and builds a match profile instantly.',
  },
  {
    icon: Brain,
    title: 'AI sources & ranks',
    desc: 'We surface the top 10 candidates from across the internet. You review signal, not noise.',
  },
  {
    icon: MessageSquare,
    title: 'Engage automatically',
    desc: 'Personalized outreach sequences go out on your behalf. Interested candidates land in your pipeline.',
  },
  {
    icon: CheckCircle2,
    title: 'Hire with confidence',
    desc: 'Data-backed decisions. Transparent scores. No gut feelings, no spreadsheets, no guesswork.',
  },
]

const SKILL_BARS = [
  { label: 'React',         pct: 98 },
  { label: 'TypeScript',    pct: 95 },
  { label: 'Node.js',       pct: 89 },
  { label: 'System Design', pct: 82 },
  { label: 'AWS',           pct: 76 },
]

function MatchMockup() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden ring-1 ring-slate-900/5">
      {/* Candidate header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-600 ring-2 ring-indigo-100">
            SC
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">Sarah Chen</div>
            <div className="text-[11px] text-slate-400">Sr. Software Engineer · 6 yrs exp.</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">97%</div>
          <div className="text-[10px] text-slate-400">AI match score</div>
        </div>
      </div>

      {/* Skills breakdown */}
      <div className="p-5">
        <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-[0.1em] mb-3.5">
          Skill match breakdown
        </div>
        <div className="space-y-2.5">
          {SKILL_BARS.map((s, idx) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-slate-700">{s.label}</span>
                <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{s.pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.05 + idx * 0.07, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              Strong match on all core requirements. Shipped at scale. Recommend fast-track to technical interview.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ShowcaseSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-slate-50/60 border-y border-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <FadeIn>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-indigo-600 mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-5 leading-tight">
                From open role to hired — in&nbsp;days, not months.
              </h2>
              <p className="text-[15.5px] text-slate-500 mb-10 leading-relaxed">
                TalentBridge handles the entire top of funnel so your team can focus on meaningful conversations with the right candidates.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <FadeIn key={step.title} delay={i * 0.08}>
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="pt-0.5">
                        <div className="text-[14px] font-semibold text-slate-900 mb-0.5">{step.title}</div>
                        <div className="text-[13.5px] text-slate-500 leading-relaxed">{step.desc}</div>
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          {/* Right — match mockup */}
          <FadeIn delay={0.12}>
            <MatchMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '12',  unit: ' days', label: 'Average time to hire',        Icon: Clock },
  { value: '94',  unit: '%',     label: 'Candidate match accuracy',    Icon: BarChart3 },
  { value: '3×',  unit: '',      label: 'More qualified interviews',   Icon: TrendingUp },
  { value: '0',   unit: '',      label: 'Candidates lost to ghosting', Icon: Users },
]

function StatsSection() {
  return (
    <section className="py-24 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4 leading-tight">
            Results that speak for themselves.
          </h2>
          <p className="text-[15.5px] text-slate-500 max-w-md mx-auto">
            Consistent outcomes across every company using TalentBridge.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map(({ value, unit, label, Icon }, i) => (
            <FadeIn key={label} delay={i * 0.07}>
              <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white text-center hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-[32px] sm:text-[38px] font-bold text-slate-900 tracking-tight leading-none mb-2">
                  {value}
                  <span className="text-indigo-600">{unit}</span>
                </div>
                <div className="text-[12.5px] text-slate-400 leading-snug">{label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      'We cut time-to-hire from 6 weeks to 12 days. The AI ranking is genuinely better than our manual process — and the team is spending half the time in screens.',
    name: 'Sarah Kim',
    title: 'Head of Talent',
    company: 'Dropfleet',
    init: 'SK',
    clr: '#4f46e5',
  },
  {
    quote:
      "The match quality is remarkable. We're interviewing fewer candidates but consistently hiring better ones. Our 90-day retention is up 40% since we switched.",
    name: 'James Park',
    title: 'VP Engineering',
    company: 'Archon Labs',
    init: 'JP',
    clr: '#059669',
  },
  {
    quote:
      'Setup took under 20 minutes. Within a week we had 3 strong candidates in final rounds. The zero-ghosting feature alone is worth it — people actually show up.',
    name: 'Priya Mehta',
    title: 'Recruiting Lead',
    company: 'Nexus Health',
    init: 'PM',
    clr: '#dc2626',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-28 bg-slate-50/60 border-y border-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <div className="flex justify-center gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400" style={{ fill: '#f59e0b' }} />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-3 leading-tight">
            Loved by talent teams everywhere.
          </h2>
          <p className="text-[15px] text-slate-500">Don&rsquo;t take our word for it.</p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.09}>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col h-full hover:border-slate-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-200">
                <p className="text-[14px] text-slate-600 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: t.clr }}
                  >
                    {t.init}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">{t.name}</div>
                    <div className="text-[11.5px] text-slate-400">{t.title} · {t.company}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <FadeIn>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1] mb-5">
            Ready to transform your hiring?
          </h2>
          <p className="text-[16px] sm:text-[17px] text-slate-500 mb-9 leading-relaxed">
            Join hundreds of companies that have cut time-to-hire, improved candidate quality,
            and stopped losing talent to slow processes.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <Link
              href="/auth/register?role=company"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white text-[14.5px] font-semibold hover:bg-slate-700 transition-colors duration-150 shadow-sm"
            >
              Start hiring free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-700 text-[14.5px] font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
            >
              Talk to sales
            </Link>
          </div>
          <p className="text-[12.5px] text-slate-400">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const FOOTER_COLS = {
  Product:   ['AI Matching', 'Candidate Discovery', 'Pipeline View', 'Analytics', 'Integrations'],
  Company:   ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Documentation', 'Help Center', 'Security', 'Status'],
  Legal:     ['Privacy', 'Terms', 'Cookies', 'GDPR'],
}

function FooterSection() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <TBMark size={24} />
              <span className="text-[14px] font-semibold text-slate-900">TalentBridge</span>
            </Link>
            <p className="text-[13px] text-slate-400 leading-relaxed max-w-[180px]">
              The AI hiring platform that fills your pipeline faster.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_COLS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[11px] font-semibold text-slate-800 uppercase tracking-[0.12em] mb-4">
                {group}
              </div>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors duration-150"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
          <p className="text-[12.5px] text-slate-400">
            © {new Date().getFullYear()} TalentBridge Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { icon: Shield,       label: 'SOC2 Type II' },
              { icon: Lock,         label: 'GDPR Compliant' },
              { icon: CheckCircle2, label: '99.9% Uptime SLA' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[12px] text-slate-400">
                <Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TalentBridgePage() {
  return (
    <main className="bg-white font-sans antialiased">
      <Nav />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <ShowcaseSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </main>
  )
}
