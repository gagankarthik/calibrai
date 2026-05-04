'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import { ArrowRight, ArrowUpRight, Quote, Brain, Globe, SlidersHorizontal, MessageCircle } from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  Em,
  Display,
  MonoNum,
  DottedLeader,
  ScribbleUnderline,
  ScribbleCircle,
  Marquee,
  Grain,
  Ticker,
} from '@/components/landing/editorial'
import { cn } from '@/lib/utils'
import { url } from 'inspector/promises'

const EASE = [0.16, 1, 0.3, 1] as const
const AWW_EASE = [0.22, 1, 0.36, 1] as const

// ─── Hero primitives (Awwwards-style) ───────────────────────────────────────

/**
 * Per-line clip-path mask reveal — text rises from 108% with a generous easing.
 */
function LineMask({
  children,
  delay = 0,
  duration = 0.95,
}: { children: React.ReactNode; delay?: number; duration?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block will-change-transform"
        initial={{ y: '108%' }}
        animate={{ y: '0%' }}
        transition={{ duration, delay, ease: AWW_EASE }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** Magnetic button — translates a few pixels toward the cursor on hover. */
function Magnetic({
  children,
  strength = 0.22,
  className,
}: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r || !ref.current) return
    const dx = (e.clientX - (r.left + r.width / 2)) * strength
    const dy = (e.clientY - (r.top + r.height / 2)) * strength
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)'
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('inline-block transition-transform duration-300 ease-out', className)}
    >
      {children}
    </div>
  )
}

/** Cursor halo confined to the hero area (md+). */
function HeroCursor({ container }: { container: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [hovering, setHovering] = useState(false)
  useEffect(() => {
    const node = container.current
    if (!node) return
    function onMove(e: MouseEvent) {
      if (!node) return
      const r = node.getBoundingClientRect()
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
    }
    function onEnter() { setHovering(true) }
    function onLeave() { setHovering(false) }
    node.addEventListener('mousemove', onMove)
    node.addEventListener('mouseenter', onEnter)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      node.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseenter', onEnter)
      node.removeEventListener('mouseleave', onLeave)
    }
  }, [container])
  if (!pos || !hovering) return null
  return (
    <motion.div
      aria-hidden
      style={{ left: pos.x, top: pos.y }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="hidden md:flex pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-tl-gold/15 border border-tl-gold/40 backdrop-blur-md items-center justify-center"
    >
      <span className="block w-1.5 h-1.5 rounded-full bg-tl-gold" />
    </motion.div>
  )
}

// ─── Hero — immersive, type-forward ─────────────────────────────────────────

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  // Scroll-linked transforms — headline parallaxes / scales / fades as you scroll past.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const headlineY = useTransform(scrollYProgress, [0, 1], ['0%', '-32%'])
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.4, 0])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])

  // Mouse-aware parallax for the background orbs.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 50, damping: 24, mass: 0.9 })
  const sy = useSpring(my, { stiffness: 50, damping: 24, mass: 0.9 })
  const orb1X = useTransform(sx, (v) => `${18 + v * 12}%`)
  const orb1Y = useTransform(sy, (v) => `${22 + v * 10}%`)
  const orb2X = useTransform(sx, (v) => `${82 - v * 14}%`)
  const orb2Y = useTransform(sy, (v) => `${72 - v * 10}%`)
  const orb3X = useTransform(sx, (v) => `${54 + (v - 0.5) * 18}%`)
  const orb3Y = useTransform(sy, (v) => `${52 + (v - 0.5) * 16}%`)

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    const r = sectionRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      className="relative pt-24 sm:pt-32 pb-0 overflow-hidden min-h-[100vh] flex flex-col"
    >
      {/* ── Atmospheric background ─────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {/* base wash */}
      
       <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          autoPlay
          playsInline
          muted
          loop
          className="w-full h-full object-cover"
        />
        </div>
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

// ─── Reveal helper ───────────────────────────────────────────────────────────

function Reveal({
  children, delay = 0, y = 22, className,
}: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ChapterMark — small numbered tag ────────────────────────────────────────

function ChapterMark({ number, label, className }: { number: string; label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 mb-5', className)}>
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase font-bold text-tl-gold">
        {number}
      </span>
      <span aria-hidden className="h-px flex-1 max-w-[100px] bg-tl-text-tertiary/30" />
      <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-tl-text-tertiary">
        {label}
      </span>
    </div>
  )
}

// ─── Trusted-by marquee ──────────────────────────────────────────────────────

const LOGOS = [
  'Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon', 'Dropfleet',
  'Meridian', 'Calypso', 'Northwind', 'Helio', 'Strata',
  'Bayline', 'Orbital', 'Halcyon', 'Boreal', 'Cascade',
]

function TrustedByMarquee() {
  return (
    <section className="relative pt-10 pb-9 border-y border-tl-border-subtle bg-tl-bg-surface/60 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-5 flex items-baseline gap-3 text-[10px] tracking-[0.22em] uppercase font-semibold text-tl-text-tertiary">
        <span>Trusted by talent teams across</span>
        <DottedLeader />
        <span>15 cohort companies</span>
      </div>
      <Marquee
        speed={42}
        items={LOGOS.map((name) => (
          <span
            key={name}
            className="text-xl sm:text-[26px] tracking-tight text-tl-text-primary/80 hover:text-tl-text-primary transition-colors [font-family:'Fraunces','Instrument_Serif',Georgia,serif] italic font-light [font-variation-settings:'opsz'_144,'SOFT'_60,'WONK'_1]"
          >
            {name}
          </span>
        ))}
        separator="·"
      />
    </section>
  )
}

// ─── AI Sourcer — the four-phase product showcase ───────────────────────────

interface SourcerPhase {
  id: string
  name: string
  percent: number
  blurb: string
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  accent: string        // CSS color
  accentSoft: string    // CSS color w/ alpha for tints
}

const SOURCER_PHASES: SourcerPhase[] = [
  {
    id: 'understanding',
    name: 'Understanding',
    percent: 15,
    blurb: 'Collaborates with hiring managers to understand specific job skills, must-haves, and the bar for "great" — before searching anyone.',
    Icon: Brain,
    accent: '#4F46E5',
    accentSoft: 'rgba(79,70,229,0.10)',
  },
  {
    id: 'sourcing',
    name: 'Sourcing',
    percent: 40,
    blurb: 'Searches candidates across the open web — GitHub, portfolios, conferences, signals — and evaluates each profile against your specific criteria.',
    Icon: Globe,
    accent: '#059669',
    accentSoft: 'rgba(5,150,105,0.10)',
  },
  {
    id: 'calibration',
    name: 'Calibration',
    percent: 40,
    blurb: 'Adapts and learns from hiring-manager feedback on candidate quality. The longer it runs, the closer it tracks your taste.',
    Icon: SlidersHorizontal,
    accent: '#D97706',
    accentSoft: 'rgba(217,119,6,0.10)',
  },
  {
    id: 'engagement',
    name: 'Engagement',
    percent: 15,
    blurb: 'Sends multi-channel, personalized outreach and cultivates relationships with candidates for current and future roles.',
    Icon: MessageCircle,
    accent: '#E11D48',
    accentSoft: 'rgba(225,29,72,0.10)',
  },
]

function AllocationBar({ inView }: { inView: boolean }) {
  return (
    <div className="relative w-full">
      {/* Top scale labels */}
      <div className="hidden sm:flex justify-between text-[10px] tracking-[0.22em] uppercase font-semibold text-tl-text-tertiary mb-2">
        <span>0%</span>
        <span>How an AI Sourcer spends its time</span>
        <span>100%</span>
      </div>

      {/* The stacked bar */}
      <div className="relative h-12 sm:h-14 rounded-2xl border border-tl-border-default bg-tl-bg-surface overflow-hidden flex shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
        {SOURCER_PHASES.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ width: 0 }}
            animate={inView ? { width: `${p.percent}%` } : { width: 0 }}
            transition={{ duration: 0.9, delay: 0.08 + i * 0.12, ease: AWW_EASE }}
            className="relative flex items-center justify-center group cursor-default"
            style={{
              background: `linear-gradient(180deg, ${p.accentSoft} 0%, ${p.accentSoft.replace('0.10', '0.18')} 100%)`,
              borderRight: i < SOURCER_PHASES.length - 1 ? '1px solid var(--tl-border-default)' : 'none',
            }}
          >
            {/* Color accent stripe at the bottom */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[3px]"
              style={{ background: p.accent }}
            />
            {/* Inline label — shown when segment is wide enough */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
              className="flex items-baseline gap-1.5 px-2 whitespace-nowrap"
            >
              <span
                className="text-[11px] sm:text-[12px] font-semibold tracking-wide"
                style={{ color: p.accent }}
              >
                {p.name}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PhaseCard({ phase, index, inView }: { phase: SourcerPhase; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay: 0.5 + index * 0.08, ease: AWW_EASE }}
      whileHover={{ y: -4 }}
      className="relative group rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6 sm:p-7 overflow-hidden transition-shadow hover:shadow-[0_10px_30px_rgba(17,24,39,0.06)]"
    >
      {/* Soft hover wash in the phase color */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(at 0% 0%, ${phase.accentSoft} 0%, transparent 60%)` }}
      />
      {/* Top-right phase index */}
      <div className="absolute top-4 right-5 text-[10px] tracking-[0.22em] uppercase font-bold text-tl-text-tertiary/70">
        0{index + 1}
      </div>

      <div className="relative">
        {/* Icon chip */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 border"
          style={{
            background: phase.accentSoft,
            borderColor: phase.accent + '33',
          }}
        >
          <phase.Icon className="w-5 h-5" style={{ color: phase.accent }} />
        </div>

        {/* Name + percentage */}
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <h3 className="text-[18px] sm:text-[20px] font-semibold text-tl-text-primary tracking-tight">
            {phase.name}
          </h3>
        </div>

        {/* Per-card progress bar */}
        <div className="h-1 rounded-full bg-tl-bg-elevated overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${phase.percent}%` } : { width: 0 }}
            transition={{ duration: 0.8, delay: 0.7 + index * 0.08, ease: AWW_EASE }}
            className="h-full rounded-full"
            style={{ background: phase.accent }}
          />
        </div>

        <p className="text-[13.5px] leading-relaxed text-tl-text-secondary">
          {phase.blurb}
        </p>
      </div>
    </motion.div>
  )
}

function AiSourcerSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="ai-sourcer"
      ref={ref}
      className="relative py-20 sm:py-28 border-y border-tl-border-default bg-tl-bg-surface/70 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(at 20% 0%, rgba(79,70,229,0.07) 0px, transparent 55%),' +
            'radial-gradient(at 85% 100%, rgba(217,119,6,0.05) 0px, transparent 55%)',
        }}
      />
      <Grain opacity={0.04} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tl-indigo/10 border border-tl-indigo/20">
            <span className="w-1.5 h-1.5 rounded-full bg-tl-indigo" />
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-tl-indigo">
              AI Sourcer
            </span>
          </span>
          <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-tl-text-tertiary">
            End-to-end · 24/7
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.05] tracking-[-0.02em] text-tl-text-primary [text-wrap:balance] max-w-4xl font-semibold"
        >
          An AI employee that performs the{' '}
          <span className="text-tl-indigo">end-to-end role of a talent sourcer</span>{' '}
          — so your team focuses on the conversations that close.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-5 max-w-2xl text-[15px] leading-relaxed text-tl-text-secondary"
        >
          Four phases, run continuously. The bar below shows where your AI Sourcer spends its time —
          most of it on finding the right people and learning from your feedback.
        </motion.p>

        {/* Allocation bar */}
        <div className="mt-10 sm:mt-14">
          <AllocationBar inView={inView} />
        </div>

        {/* Phase cards */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SOURCER_PHASES.map((p, i) => (
            <PhaseCard key={p.id} phase={p} index={i} inView={inView} />
          ))}
        </div>

        {/* Footer note + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-tl-border-subtle"
        >
          <p className="text-[13px] text-tl-text-tertiary">
            Allocation is approximate and adapts to each role. Engagement scales up once a calibrated shortlist exists.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-tl-indigo hover:text-tl-indigo/80 transition-colors group"
          >
            Hire your AI Sourcer
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Editorial Statement — Chapter I ────────────────────────────────────────

function EditorialStatement() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [40, -40])

  return (
    <section id="ch-1" ref={ref} className="relative py-16 sm:py-24 overflow-hidden">
      <Grain opacity={0.05} />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(at 18% 12%, rgba(79,70,229,0.16) 0px, transparent 55%),' +
            'radial-gradient(at 90% 80%, rgba(5,150,105,0.10) 0px, transparent 55%)',
        }}
      />
      <Reveal>
        <motion.div style={{ y }} className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <Display as="h2" className="text-[clamp(1.75rem,4.8vw,3.75rem)] leading-[1.05] [text-wrap:balance]">
            Resumes are PDFs from 2003.{' '}
            <span className="relative inline-block">
              <Em className="text-tl-indigo">We read the work</Em>
              <ScribbleCircle color="#4F46E5" delay={0.3} />
            </span>
            {' '}— GitHub, portfolios, verified skills, shipped artifacts. Then we{' '}
            <Em className="text-tl-teal">explain ourselves.</Em>
          </Display>
        </motion.div>
      </Reveal>
    </section>
  )
}

// ─── Inside (Table of Contents) — Chapter II ─────────────────────────────────

interface TocItem {
  number: string
  href: string
  title: string
  page: string
  excerpt: string
  accent: string
}

const TOC: TocItem[] = [
  { number: 'i.',   href: '/product',       title: 'The Product',     page: 'p. 04', excerpt: 'Verdicts, not opaque scores. Reasons grounded in the data, risks worth probing, and a recommendation you can defend.', accent: 'rgba(79,70,229,0.12)' },
  { number: 'ii.',  href: '/how-it-works',  title: 'The Flow',        page: 'p. 12', excerpt: 'Four steps. Post (or paste a URL). AI ranks. You review. You move forward. One workspace.', accent: 'rgba(5,150,105,0.12)' },
  { number: 'iii.', href: '/customers',     title: 'The Proof',       page: 'p. 22', excerpt: 'Sixty-three companies. Twenty-four hundred hires. Eighteen days average time-to-hire.', accent: 'rgba(201,168,76,0.14)' },
  { number: 'iv.',  href: '/compare',       title: 'The Comparison',  page: 'p. 30', excerpt: 'What Indeed, ZipRecruiter, Dice, LinkedIn Recruiter and Greenhouse miss.', accent: 'rgba(225,29,72,0.10)' },
]

function TocSection() {
  return (
    <section id="ch-2" className="relative py-16 sm:py-24 border-y border-tl-border-default bg-tl-bg-surface/60 overflow-hidden">
      <Grain opacity={0.04} />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <Display as="h2" className="text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] mb-2">
            Four rooms. <Em className="text-tl-indigo">One key.</Em>
          </Display>
          <p className="text-tl-text-secondary max-w-xl text-sm leading-relaxed mb-8 sm:mb-10">
            Each section is its own page — open the door you want.
          </p>
        </Reveal>

        <ul className="border-t border-tl-border-default">
          {TOC.map((item, i) => (
            <Reveal key={item.number} delay={i * 0.05}>
              <li className="border-b border-tl-border-default group">
                <Link
                  href={item.href}
                  className="relative grid grid-cols-12 gap-3 sm:gap-5 items-baseline py-5 sm:py-7 transition-colors"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `linear-gradient(90deg, ${item.accent}, transparent 80%)` }}
                  />
                  <Display className="col-span-2 sm:col-span-1 text-2xl sm:text-3xl text-tl-text-primary/85 group-hover:text-tl-gold transition-colors">
                    {item.number}
                  </Display>
                  <Display
                    as="span"
                    className="col-span-10 sm:col-span-4 text-2xl sm:text-3xl leading-[0.98] text-tl-text-primary"
                  >
                    {item.title}
                  </Display>
                  <p className="hidden sm:flex sm:col-span-6 text-[13px] text-tl-text-secondary leading-relaxed pt-1 items-baseline">
                    <span className="flex-1">{item.excerpt}</span>
                    <DottedLeader className="!min-w-[40px] hidden md:flex" />
                    <MonoNum className="text-[10px] tracking-widest uppercase font-bold text-tl-text-tertiary shrink-0">
                      {item.page}
                    </MonoNum>
                  </p>
                  <span
                    aria-hidden
                    className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-tl-border-default items-center justify-center transition-all group-hover:bg-tl-gold group-hover:border-tl-gold group-hover:text-tl-bg-base group-hover:rotate-12"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Numbers — Chapter III ───────────────────────────────────────────────────

function NumbersStrip() {
  const items = [
    { to: 94, suffix: '%', label: 'Match accuracy on offers extended' },
    { to: 18, suffix: 'd', label: 'Average time-to-hire across cohort' },
    { to: 3,  suffix: '×', label: 'More qualified candidates per role' },
    { to: 0,  suffix: '',  label: 'Tools to glue together' },
  ]
  return (
    <section id="ch-3" className="relative py-16 sm:py-24 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(180deg, rgba(238,242,255,0.5) 0%, rgba(255,255,255,0) 100%)' }}
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal>
          <Display as="h2" className="text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.05] mb-8 sm:mb-12">
            What changes when teams switch.
          </Display>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-tl-border-default border-y border-tl-border-default">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05}>
              <div className="px-5 py-7 sm:py-10">
                <Display as="p" className="text-[clamp(2.25rem,5vw,4rem)] tabular-nums [font-variation-settings:'opsz'_144,'SOFT'_50,'WONK'_1]">
                  <Ticker to={item.to} suffix={item.suffix} duration={1.4} />
                </Display>
                <p className="text-[11.5px] sm:text-[12.5px] text-tl-text-secondary mt-2 leading-snug max-w-[20ch]">
                  {item.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pull quote — Chapter IV ────────────────────────────────────────────────

function PullQuote() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section id="ch-4" ref={ref} className="relative py-16 sm:py-24 border-y border-tl-border-subtle bg-tl-bg-elevated/40 overflow-hidden">
      <Grain opacity={0.05} />
      <div aria-hidden className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-tl-indigo/10 blur-[120px]" />
      <Reveal>
        <motion.div style={{ y }} className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Quote className="w-9 h-9 text-tl-gold/50 mb-4 -ml-1" strokeWidth={1.2} />
          <Display
            as="blockquote"
            className="text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.15] [text-wrap:balance]"
          >
            <span>We had </span>
            <Em className="text-tl-indigo">three strong candidates</Em>
            <span> in final rounds within </span>
            <Em className="text-tl-teal">a week.</Em>
            <span> Setup took less than </span>
            <Em className="text-tl-gold">twenty minutes.</Em>
          </Display>
          <div className="mt-7 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tl-gold via-tl-teal to-tl-indigo" />
            <div>
              <p className="text-sm font-semibold text-tl-text-primary">Priya Mehta</p>
              <p className="text-xs text-tl-text-secondary">Recruiting Lead · Nexus Health</p>
            </div>
          </div>
        </motion.div>
      </Reveal>
    </section>
  )
}

// ─── Final CTA — Chapter V ───────────────────────────────────────────────────

function CtaSection() {
  return (
    <section id="ch-5" className="relative py-16 sm:py-24 overflow-hidden border-t border-tl-border-subtle">
      <Grain opacity={0.05} />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(at 50% 20%, rgba(79,70,229,0.14) 0px, transparent 60%),' +
            'radial-gradient(at 50% 95%, rgba(201,168,76,0.14) 0px, transparent 60%)',
        }}
      />
      <Reveal>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Display
            as="h2"
            className="text-[clamp(1.75rem,4.8vw,3.75rem)] leading-[1.0] mb-6 [text-wrap:balance]"
          >
            Stop scoring resumes.
            <br />
            <span className="relative inline-block">
              <Em className="text-tl-indigo">Start hiring people.</Em>
              <ScribbleUnderline color="#4F46E5" delay={0.4} />
            </span>
          </Display>
          <p className="text-tl-text-secondary text-[15px] leading-relaxed mb-7 max-w-xl mx-auto">
            Free 14-day trial. No credit card. AI handles the first hundred applicants —
            you handle the conversations that matter.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register?role=company"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-[14.5px] font-semibold hover:bg-tl-gold/90 transition-all shadow-xl shadow-tl-gold/30 hover:-translate-y-0.5"
            >
              Start free trial
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[14.5px] font-semibold hover:border-tl-gold/40 transition-colors"
            >
              Read customer stories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[12px] text-tl-text-tertiary mt-6">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </Reveal>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TalentBridgePage() {
  return (
    <main id="main-content" className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />
      <HeroSection />
      <TrustedByMarquee />
      <AiSourcerSection />
      <EditorialStatement />
      <TocSection />
      <NumbersStrip />
      <PullQuote />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}
