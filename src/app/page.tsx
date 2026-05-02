'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, useInView, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  ArrowRight, Sparkles, BarChart3, Users, Shield,
  Search, Brain, MessageSquare, CheckCircle2,
  Star, TrendingUp, Bot, Workflow, Target, Rocket, Globe2,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

// ─── Scroll-triggered fade-in ────────────────────────────────────────────────

function FadeIn({
  children, delay = 0, className, y = 24,
}: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero video background ───────────────────────────────────────────────────

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)

  // Force-play on mobile (some browsers require touch to start)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true })
    return () => document.removeEventListener('touchstart', tryPlay)
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-transparent">
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />
      
    </div>
  )
}

// ─── Animated typing badge ───────────────────────────────────────────────────

function LiveBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tl-bg-elevated border border-tl-gold/20 backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tl-teal opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-tl-teal" />
      </span>
      <span className="text-[12px] font-medium text-tl-text-secondary">
        <span className="text-tl-gold">AI-powered</span> · 12,000+ candidates ranked today
      </span>
    </motion.div>
  )
}

// ─── 3D tilt mock dashboard ──────────────────────────────────────────────────

const MOCK_CANDIDATES = [
  { name: 'Sarah Chen',    role: 'Sr. Software Engineer', score: 97, init: 'SC' },
  { name: 'Marcus Johnson', role: 'Full-Stack Developer', score: 94, init: 'MJ' },
  { name: 'Priya Patel',   role: 'ML Engineer',           score: 91, init: 'PP' },
  { name: 'Alex Rivera',   role: 'Backend Engineer',      score: 88, init: 'AR' },
]

function HeroDashboard() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 150, damping: 20 })

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mouseX.set(e.clientX - r.left - r.width / 2)
    mouseY.set(e.clientY - r.top - r.height / 2)
  }
  const onLeave = () => { mouseX.set(0); mouseY.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="relative w-full max-w-4xl mx-auto"
    >
      {/* Glow */}
      <div className="absolute -inset-8 bg-gradient-to-tr from-tl-gold/30 via-tl-teal/20 to-tl-blue/20 blur-3xl opacity-60 rounded-3xl pointer-events-none" />

      <div className="relative rounded-2xl overflow-hidden border border-tl-border-default bg-tl-bg-surface/90 backdrop-blur-xl shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 bg-tl-bg-base/60 border-b border-tl-border-subtle">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-tl-rose/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-tl-gold/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-tl-teal/60" />
          </div>
          <div className="flex-1 bg-tl-bg-elevated border border-tl-border-subtle rounded-md px-3 py-[5px] text-[11px] font-mono text-tl-text-tertiary text-center truncate select-none">
            app.talentbridge.ai / pipeline
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-tl-border-subtle">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-tl-text-primary">Senior Software Engineer</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-tl-teal/10 text-tl-teal border border-tl-teal/20">
                Active
              </span>
            </div>
            <span className="text-[11px] text-tl-text-tertiary mt-0.5 block">Acme Corp · Remote · 24 applicants</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tl-gold/15 text-tl-gold text-[11px] font-semibold border border-tl-gold/25">
            <Sparkles className="w-3 h-3" /> AI Rank
          </div>
        </div>

        {/* Stage counts */}
        <div className="grid grid-cols-4 divide-x divide-tl-border-subtle border-b border-tl-border-subtle bg-tl-bg-base/30">
          {[
            { label: 'Applied', n: 24 },
            { label: 'Screened', n: 11 },
            { label: 'Interview', n: 6 },
            { label: 'Offer', n: 2 },
          ].map(s => (
            <div key={s.label} className="py-2.5 text-center">
              <div className="text-[13px] font-bold text-tl-text-primary">{s.n}</div>
              <div className="text-[9.5px] text-tl-text-tertiary mt-0.5 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* AI insight */}
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-tl-gold/8 border border-tl-gold/20">
          <Sparkles className="w-3 h-3 text-tl-gold shrink-0" />
          <span className="text-[10.5px] text-tl-gold font-medium">
            AI ranked 24 candidates · top 4 scored above 85% · 3 ready for interview
          </span>
        </div>

        {/* Candidates */}
        <div className="p-4 space-y-2">
          {MOCK_CANDIDATES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-tl-border-subtle bg-tl-bg-elevated/50 hover:border-tl-gold/30 hover:bg-tl-bg-elevated transition-colors"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 bg-tl-gold/15 text-tl-gold border border-tl-gold/25">
                {c.init}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-tl-text-primary truncate">{c.name}</div>
                <div className="text-[10px] text-tl-text-tertiary">{c.role}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] font-bold text-tl-teal tabular-nums">{c.score}%</div>
                <div className="text-[9px] text-tl-text-tertiary uppercase tracking-wider">match</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating badge — match score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.8, type: 'spring' }}
        className="hidden sm:flex absolute -right-6 top-1/3 items-center gap-2 px-3 py-2 rounded-xl bg-tl-bg-surface/95 backdrop-blur-xl border border-tl-teal/30 shadow-xl"
        style={{ transform: 'translateZ(60px)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-tl-teal/15 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-tl-teal" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-tl-text-primary">+340%</div>
          <div className="text-[9px] text-tl-text-tertiary uppercase tracking-wider">match quality</div>
        </div>
      </motion.div>

      {/* Floating badge — time saved */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.0, type: 'spring' }}
        className="hidden sm:flex absolute -left-6 bottom-12 items-center gap-2 px-3 py-2 rounded-xl bg-tl-bg-surface/95 backdrop-blur-xl border border-tl-gold/30 shadow-xl"
        style={{ transform: 'translateZ(60px)' }}
      >
        <div className="w-8 h-8 rounded-lg bg-tl-gold/15 flex items-center justify-center">
          <Bot className="w-4 h-4 text-tl-gold" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-tl-text-primary">12 days</div>
          <div className="text-[9px] text-tl-text-tertiary uppercase tracking-wider">avg. time-to-hire</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-24 overflow-hidden min-h-screen">
      <HeroVideo />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mx-auto mb-12 sm:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[40px] sm:text-[64px] lg:text-[80px] font-semibold tracking-tight text-white leading-[1.02] mb-6 [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]"
          >
            Hire the right people,{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-tl-gold via-tl-teal to-tl-blue bg-clip-text text-transparent">
                10× faster.
              </span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-1 left-0 right-0 h-1 origin-left bg-gradient-to-r from-tl-gold via-tl-teal to-tl-blue rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[16px] sm:text-[18px] text-white/85 leading-[1.65] mb-9 max-w-2xl mx-auto px-2 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]"
          >
            TalentBridge sources, ranks, and matches top candidates to every open role using AI
            — so your team spends time on interviews, not spreadsheets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap justify-center items-center gap-3"
          >
            <Link
              href="/auth/register?role=company"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-tl-gold text-white text-[15px] font-semibold hover:bg-tl-gold/90 transition-all shadow-xl shadow-tl-gold/25 hover:shadow-tl-gold/40 hover:-translate-y-0.5"
            >
              Start hiring
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-tl-bg-elevated text-tl-text-primary text-[15px] font-semibold border border-tl-border-default hover:border-tl-gold/40 hover:bg-tl-bg-overlay transition-colors"
            >
              See how it works
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Logos ───────────────────────────────────────────────────────────────────

const LOGOS = ['Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon', 'Dropfleet', 'Meridian']

function LogosSection() {
  return (
    <FadeIn className="py-14 sm:py-16 border-y border-tl-border-subtle bg-tl-bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-[11.5px] font-semibold text-tl-text-tertiary uppercase tracking-[0.18em] mb-7">
          Trusted by talent teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-5">
          {LOGOS.map((name, i) => (
            <FadeIn key={name} delay={i * 0.05} y={0}>
              <span className="text-[15px] sm:text-[16px] font-semibold text-tl-text-tertiary/80 hover:text-tl-text-secondary transition-colors select-none cursor-default">
                {name}
              </span>
            </FadeIn>
          ))}
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Features (Bento grid) ───────────────────────────────────────────────────

function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-tl-gold/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14 sm:mb-16">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-3">
            Built for modern teams
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary mb-4 leading-[1.1]">
            Everything you need to hire.
            <br />
            <span className="text-tl-text-secondary">Nothing you don&rsquo;t.</span>
          </h2>
        </FadeIn>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 auto-rows-[minmax(220px,auto)]">

          {/* Hero feature — AI Sourcing (spans 2 cols) */}
          <FadeIn className="md:col-span-2" delay={0}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-8 overflow-hidden hover:border-tl-gold/40 transition-all duration-300">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-tl-gold/10 blur-3xl group-hover:bg-tl-gold/20 transition-all" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-tl-gold/15 border border-tl-gold/25 flex items-center justify-center mb-5">
                  <Brain className="w-5 h-5 text-tl-gold" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-tl-text-primary mb-2">
                  AI Candidate Sourcing
                </h3>
                <p className="text-[14px] text-tl-text-secondary leading-relaxed mb-6 max-w-md">
                  Automatically find qualified candidates from GitHub, LinkedIn, and job boards.
                  No manual searching, no wasted hours.
                </p>
                {/* Mini visual */}
                <div className="flex flex-wrap gap-2">
                  {['GitHub', 'LinkedIn', 'AngelList', 'Stack Overflow', 'Discord'].map((src, i) => (
                    <motion.span
                      key={src}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-tl-bg-elevated border border-tl-border-subtle text-tl-text-secondary"
                    >
                      {src}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* 94% match accuracy */}
          <FadeIn delay={0.05}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-7 overflow-hidden hover:border-tl-teal/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-tl-teal/15 border border-tl-teal/25 flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5 text-tl-teal" />
              </div>
              <div className="text-[44px] font-bold tracking-tight text-tl-teal leading-none mb-1 tabular-nums">94%</div>
              <h3 className="text-[16px] font-semibold text-tl-text-primary mb-1.5">Match Accuracy</h3>
              <p className="text-[13px] text-tl-text-secondary leading-relaxed">
                Validated across 50,000+ successful hires.
              </p>
            </div>
          </FadeIn>

          {/* Automated Outreach */}
          <FadeIn delay={0.1}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-7 overflow-hidden hover:border-tl-gold/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-tl-gold/15 border border-tl-gold/25 flex items-center justify-center mb-5">
                <MessageSquare className="w-5 h-5 text-tl-gold" />
              </div>
              <h3 className="text-[16px] font-semibold text-tl-text-primary mb-1.5">Automated Outreach</h3>
              <p className="text-[13px] text-tl-text-secondary leading-relaxed">
                Personalized multi-step sequences sent on your behalf.
              </p>
            </div>
          </FadeIn>

          {/* Pipeline Intelligence */}
          <FadeIn delay={0.15}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-7 overflow-hidden hover:border-tl-blue/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-tl-blue/15 border border-tl-blue/25 flex items-center justify-center mb-5">
                <Workflow className="w-5 h-5 text-tl-blue" />
              </div>
              <h3 className="text-[16px] font-semibold text-tl-text-primary mb-1.5">Pipeline Intelligence</h3>
              <p className="text-[13px] text-tl-text-secondary leading-relaxed">
                Bottlenecks, conversion rates, time-per-stage in one view.
              </p>
            </div>
          </FadeIn>

          {/* Zero Ghosting (spans 2 cols) */}
          <FadeIn className="md:col-span-2" delay={0.2}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-8 overflow-hidden hover:border-tl-teal/40 transition-all">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-tl-teal/10 blur-3xl group-hover:bg-tl-teal/20 transition-all" />
              <div className="relative flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="w-12 h-12 rounded-xl bg-tl-teal/15 border border-tl-teal/25 flex items-center justify-center mb-5">
                    <Users className="w-5 h-5 text-tl-teal" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-tl-text-primary mb-2">
                    Zero Ghosting
                  </h3>
                  <p className="text-[14px] text-tl-text-secondary leading-relaxed max-w-md">
                    Smart nudges keep candidates engaged throughout. Every applicant gets
                    a response. No offer goes unanswered.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {['Day 1: Auto-confirm', 'Day 3: Status update', 'Day 7: Next steps'].map((t, i) => (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2 text-[12px] text-tl-text-secondary px-3 py-2 rounded-lg bg-tl-bg-elevated border border-tl-border-subtle"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal shrink-0" />
                      {t}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Enterprise Security */}
          <FadeIn delay={0.25}>
            <div className="group relative h-full rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm p-6 sm:p-7 overflow-hidden hover:border-tl-gold/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-tl-gold/15 border border-tl-gold/25 flex items-center justify-center mb-5">
                <Shield className="w-5 h-5 text-tl-gold" />
              </div>
              <h3 className="text-[16px] font-semibold text-tl-text-primary mb-1.5">Enterprise Security</h3>
              <p className="text-[13px] text-tl-text-secondary leading-relaxed mb-3">
                SOC2 Type II · GDPR · SSO/SAML
              </p>
              <div className="flex gap-1.5">
                {['SOC2', 'GDPR', 'ISO'].map(b => (
                  <span key={b} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tl-bg-elevated border border-tl-border-subtle text-tl-text-tertiary">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}

// ─── How it works ────────────────────────────────────────────────────────────

const STEPS = [
  { icon: Search,        title: 'Post a role',         desc: 'Describe the position in plain language. AI extracts skills automatically.' },
  { icon: Brain,         title: 'AI sources & ranks',  desc: 'We surface the top 10 candidates from across the internet.' },
  { icon: MessageSquare, title: 'Engage automatically',desc: 'Personalized outreach sequences. Interested candidates land in your pipeline.' },
  { icon: Rocket,        title: 'Hire with confidence',desc: 'Data-backed decisions. Transparent scores. No guesswork.' },
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
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-tr from-tl-gold/20 to-tl-teal/20 blur-3xl opacity-40 rounded-3xl pointer-events-none" />
      <div className="relative rounded-2xl border border-tl-border-default bg-tl-bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-tl-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tl-gold/15 border border-tl-gold/30 flex items-center justify-center text-[12px] font-bold text-tl-gold">SC</div>
            <div>
              <div className="text-[13px] font-semibold text-tl-text-primary">Sarah Chen</div>
              <div className="text-[11px] text-tl-text-tertiary">Sr. Software Engineer · 6 yrs exp.</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-bold text-tl-teal tabular-nums leading-none">97%</div>
            <div className="text-[10px] text-tl-text-tertiary uppercase tracking-wider mt-1">AI match</div>
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10.5px] font-semibold text-tl-text-tertiary uppercase tracking-[0.14em] mb-3.5">
            Skill match breakdown
          </div>
          <div className="space-y-2.5">
            {SKILL_BARS.map((s, idx) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-tl-text-primary">{s.label}</span>
                  <span className="text-[11px] font-semibold text-tl-text-secondary tabular-nums">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-tl-bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.05 + idx * 0.08, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-teal"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-tl-gold/8 border border-tl-gold/20">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-tl-gold mt-0.5 shrink-0" />
              <p className="text-[11.5px] text-tl-text-primary leading-relaxed">
                Strong match on all core requirements. Recommend fast-track to technical interview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HowSection() {
  return (
    <section id="how" className="relative py-24 sm:py-32 border-y border-tl-border-subtle bg-tl-bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <FadeIn>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary mb-5 leading-[1.1]">
                From open role to hired —
                <br />
                <span className="bg-gradient-to-r from-tl-gold to-tl-teal bg-clip-text text-transparent">
                  in days, not months.
                </span>
              </h2>
              <p className="text-[15px] text-tl-text-secondary mb-10 leading-relaxed max-w-md">
                TalentBridge handles the entire top of funnel so your team can focus on
                meaningful conversations with the right candidates.
              </p>
            </FadeIn>

            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                return (
                  <FadeIn key={step.title} delay={i * 0.08}>
                    <div className="group flex gap-4 p-4 rounded-xl border border-transparent hover:border-tl-border-subtle hover:bg-tl-bg-elevated/50 transition-all">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-tl-bg-elevated border border-tl-border-default flex items-center justify-center group-hover:border-tl-gold/40 group-hover:bg-tl-gold/10 transition-colors">
                          <Icon className="w-4.5 h-4.5 text-tl-text-secondary group-hover:text-tl-gold transition-colors" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tl-gold text-[9px] font-bold text-white flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      <div className="pt-0.5">
                        <div className="text-[14.5px] font-semibold text-tl-text-primary mb-0.5">{step.title}</div>
                        <div className="text-[13px] text-tl-text-secondary leading-relaxed">{step.desc}</div>
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          <FadeIn delay={0.15}>
            <MatchMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ─── Stats with hover animation ──────────────────────────────────────────────

const STATS = [
  { value: '12', unit: 'days', label: 'Average time to hire',         Icon: Target },
  { value: '94', unit: '%',    label: 'Candidate match accuracy',     Icon: BarChart3 },
  { value: '3×', unit: '',     label: 'More qualified interviews',    Icon: TrendingUp },
  { value: '0',  unit: '',     label: 'Candidates lost to ghosting',  Icon: Users },
]

function StatsSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-tl-teal/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary mb-4 leading-[1.1]">
            Results that speak <span className="text-tl-text-secondary">for themselves.</span>
          </h2>
          <p className="text-[15.5px] text-tl-text-secondary max-w-md mx-auto">
            Consistent outcomes across every company using TalentBridge.
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {STATS.map(({ value, unit, label, Icon }, i) => (
            <FadeIn key={label} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group p-6 sm:p-7 rounded-2xl border border-tl-border-default bg-tl-bg-surface/60 backdrop-blur-sm hover:border-tl-gold/40 transition-colors duration-300 cursor-default"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle mb-4 group-hover:bg-tl-gold/10 group-hover:border-tl-gold/30 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-tl-text-secondary group-hover:text-tl-gold transition-colors" />
                </div>
                <div className="text-[36px] sm:text-[44px] font-bold text-tl-text-primary tracking-tight leading-none mb-2 tabular-nums">
                  {value}
                  {unit && (
                    <span className="text-[20px] sm:text-[24px] text-tl-gold ml-1">{unit}</span>
                  )}
                </div>
                <div className="text-[12px] sm:text-[13px] text-tl-text-secondary leading-snug">{label}</div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials (marquee) ──────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'We cut time-to-hire from 6 weeks to 12 days. The AI ranking is genuinely better than our manual process.',
    name: 'Sarah Kim', title: 'Head of Talent', company: 'Dropfleet', init: 'SK',
  },
  {
    quote: "The match quality is remarkable. We're hiring better candidates and our 90-day retention is up 40%.",
    name: 'James Park', title: 'VP Engineering', company: 'Archon Labs', init: 'JP',
  },
  {
    quote: 'Setup took under 20 minutes. Within a week we had 3 strong candidates in final rounds.',
    name: 'Priya Mehta', title: 'Recruiting Lead', company: 'Nexus Health', init: 'PM',
  },
]

function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 border-y border-tl-border-subtle bg-tl-bg-surface/30 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <div className="flex justify-center gap-0.5 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-tl-gold" style={{ fill: 'currentColor' }} />
            ))}
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary mb-3 leading-[1.1]">
            Loved by talent teams <span className="text-tl-text-secondary">everywhere.</span>
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative p-6 rounded-2xl bg-tl-bg-surface/80 backdrop-blur-sm border border-tl-border-default flex flex-col h-full hover:border-tl-gold/40 transition-colors"
              >
                <div className="absolute top-4 right-5 text-[60px] leading-none font-serif text-tl-gold/20 select-none">&ldquo;</div>
                <p className="relative text-[14px] text-tl-text-secondary leading-relaxed flex-1 mb-5">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-tl-gold/15 border border-tl-gold/25 flex items-center justify-center text-[11px] font-bold text-tl-gold shrink-0">
                    {t.init}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-tl-text-primary">{t.name}</div>
                    <div className="text-[11.5px] text-tl-text-tertiary">{t.title} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full bg-tl-gold/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-tl-teal/10 blur-[100px]" />
      </div>

      <FadeIn>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tl-bg-elevated border border-tl-gold/25 mb-6">
            <Globe2 className="w-3.5 h-3.5 text-tl-gold" />
            <span className="text-[12px] font-medium text-tl-text-secondary">Available worldwide</span>
          </div>
          <h2 className="text-3xl sm:text-[52px] font-semibold tracking-tight text-tl-text-primary leading-[1.05] mb-5">
            Ready to transform <br className="sm:hidden" /> your hiring?
          </h2>
          <p className="text-[15.5px] sm:text-[17px] text-tl-text-secondary mb-9 leading-relaxed max-w-xl mx-auto">
            Join hundreds of companies that have cut time-to-hire, improved candidate quality,
            and stopped losing talent to slow processes.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <Link
              href="/auth/register?role=company"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-gold text-white text-[15px] font-semibold hover:bg-tl-gold/90 transition-all shadow-xl shadow-tl-gold/30 hover:shadow-tl-gold/50 hover:-translate-y-0.5"
            >
              Start hiring
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-bg-elevated text-tl-text-primary text-[15px] font-semibold border border-tl-border-default hover:border-tl-gold/40 transition-colors"
            >
              Talk to sales
            </Link>
          </div>
          <p className="text-[12.5px] text-tl-text-tertiary">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TalentBridgePage() {
  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />
      <HeroSection />
      <LogosSection />
      <FeaturesSection />
      <HowSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </main>
  )
}
