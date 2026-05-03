'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Quote } from 'lucide-react'
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
import { RunningHeader, ChapterIndex } from '@/components/landing/editorial-shell'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Hero video background (UNCHANGED) ───────────────────────────────────────

function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
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
        autoPlay muted loop playsInline preload="auto" disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />
    </div>
  )
}

// ─── Hero (UNCHANGED — content + layout preserved) ───────────────────────────

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
              href="/how-it-works"
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

// ─── Reveal helper ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 26, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ChapterMark — small numbered tag pinned to a section heading ────────────

function ChapterMark({ number, label, className }: { number: string; label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 mb-7', className)}>
      <span className="font-mono text-[11px] tracking-[0.22em] uppercase font-bold text-tl-gold">
        {number}
      </span>
      <span aria-hidden className="h-px flex-1 max-w-[120px] bg-tl-text-tertiary/30" />
      <span className="text-[11px] tracking-[0.22em] uppercase font-bold text-tl-text-tertiary">
        {label}
      </span>
    </div>
  )
}

// ─── Trusted-by marquee — kept, but with editorial dotted-leader header ─────

const LOGOS = [
  'Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon', 'Dropfleet',
  'Meridian', 'Calypso', 'Northwind', 'Helio', 'Strata',
  'Bayline', 'Orbital', 'Halcyon', 'Boreal', 'Cascade',
]

function TrustedByMarquee() {
  return (
    <section className="relative pt-14 pb-12 border-y border-tl-border-subtle bg-tl-bg-surface/60 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-7 flex items-baseline gap-3 text-[10px] tracking-[0.22em] uppercase font-semibold text-tl-text-tertiary">
        <span>Trusted by talent teams across</span>
        <DottedLeader />
        <span>15 cohort companies</span>
      </div>
      <Marquee
        speed={42}
        items={LOGOS.map((name) => (
          <span
            key={name}
            className="text-2xl sm:text-[34px] tracking-tight text-tl-text-primary/80 hover:text-tl-text-primary transition-colors [font-family:'Fraunces','Instrument_Serif',Georgia,serif] italic font-light [font-variation-settings:'opsz'_144,'SOFT'_60,'WONK'_1]"
          >
            {name}
          </span>
        ))}
        separator="·"
      />
    </section>
  )
}

// ─── Editorial Statement — Chapter I ────────────────────────────────────────

function EditorialStatement() {
  return (
    <section id="ch-1" className="relative py-32 sm:py-40 overflow-hidden">
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
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <ChapterMark number="Chapter I" label="The Brief" />
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <Display
              as="h2"
              className="lg:col-span-12 text-[clamp(2.5rem,9vw,8rem)] leading-[0.95] [font-variation-settings:'opsz'_144,'SOFT'_30,'WONK'_0]"
            >
              Resumes are PDFs from 2003.{' '}
              <span className="relative inline-block">
                <Em className="text-tl-indigo">We read the work</Em>
                <ScribbleCircle color="#4F46E5" delay={0.3} />
              </span>
              {' '}— GitHub, portfolios, verified skills, shipped artifacts. Then we{' '}
              <Em className="text-tl-teal">explain ourselves.</Em>
            </Display>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─── Inside (Table of Contents) — Chapter II ────────────────────────────────

interface TocItem {
  number: string
  href: string
  title: string
  page: string
  excerpt: string
  accent: string
}

const TOC: TocItem[] = [
  {
    number: 'i.',
    href: '/product',
    title: 'The Product',
    page: 'p. 04',
    excerpt: 'Verdicts, not opaque scores. Reasons grounded in the data, risks worth probing, and a recommendation you can actually defend.',
    accent: 'rgba(79,70,229,0.12)',
  },
  {
    number: 'ii.',
    href: '/how-it-works',
    title: 'The Flow',
    page: 'p. 12',
    excerpt: 'Four steps. Post (or paste a URL). AI ranks. You review. You move forward. The whole pipeline lives in one workspace.',
    accent: 'rgba(5,150,105,0.12)',
  },
  {
    number: 'iii.',
    href: '/customers',
    title: 'The Proof',
    page: 'p. 22',
    excerpt: 'Sixty-three companies. Twenty-four hundred hires. Eighteen days average time-to-hire. The numbers and the receipts.',
    accent: 'rgba(201,168,76,0.14)',
  },
  {
    number: 'iv.',
    href: '/compare',
    title: 'The Comparison',
    page: 'p. 30',
    excerpt: 'What Indeed, ZipRecruiter, Dice, LinkedIn Recruiter and Greenhouse miss — and why we built for the gap.',
    accent: 'rgba(225,29,72,0.10)',
  },
]

function TocSection() {
  return (
    <section id="ch-2" className="relative py-24 sm:py-32 border-y border-tl-border-default bg-tl-bg-surface/60 overflow-hidden">
      <Grain opacity={0.05} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <ChapterMark number="Chapter II" label="The Index" />
          <Display as="h2" className="text-[clamp(2.25rem,6.5vw,5rem)] leading-[0.98] mb-3">
            Four rooms. <Em className="text-tl-indigo">One key.</Em>
          </Display>
          <p className="text-tl-text-secondary max-w-xl text-[15.5px] leading-relaxed mb-12 sm:mb-16">
            Each section is its own page — open the door you want.
          </p>
        </Reveal>

        {/* Editorial table-of-contents lines */}
        <ul className="border-t border-tl-border-default">
          {TOC.map((item, i) => (
            <Reveal key={item.number} delay={i * 0.07}>
              <li className="border-b border-tl-border-default group">
                <Link
                  href={item.href}
                  className="relative grid grid-cols-12 gap-3 sm:gap-6 items-baseline py-7 sm:py-9 transition-colors"
                >
                  {/* Hover wash */}
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `linear-gradient(90deg, ${item.accent}, transparent 80%)` }}
                  />

                  {/* Numeral */}
                  <Display className="col-span-2 sm:col-span-1 text-3xl sm:text-5xl text-tl-text-primary/85 group-hover:text-tl-gold transition-colors">
                    {item.number}
                  </Display>

                  {/* Title */}
                  <Display
                    as="span"
                    className="col-span-10 sm:col-span-4 text-3xl sm:text-5xl leading-[0.95] [font-variation-settings:'opsz'_144,'SOFT'_30,'WONK'_0] text-tl-text-primary"
                  >
                    {item.title}
                  </Display>

                  {/* Excerpt + leader */}
                  <p className="hidden sm:flex sm:col-span-6 text-[14px] text-tl-text-secondary leading-relaxed pt-2 items-baseline">
                    <span className="flex-1">{item.excerpt}</span>
                    <DottedLeader className="!min-w-[40px] hidden md:flex" />
                    <MonoNum className="text-[10px] tracking-widest uppercase font-bold text-tl-text-tertiary shrink-0">
                      {item.page}
                    </MonoNum>
                  </p>

                  {/* Open arrow */}
                  <span
                    aria-hidden
                    className="hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-tl-border-default items-center justify-center transition-all group-hover:bg-tl-gold group-hover:border-tl-gold group-hover:text-tl-bg-base group-hover:rotate-12"
                  >
                    <ArrowUpRight className="w-4 h-4" />
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

// ─── Numbers — Chapter III (financial-schedule typography) ──────────────────

function NumbersStrip() {
  const items = [
    { to: 94, suffix: '%', label: 'Match accuracy on offers extended' },
    { to: 18, suffix: 'd', label: 'Average time-to-hire across cohort' },
    { to: 3, suffix: '×', label: 'More qualified candidates per role' },
    { to: 0, suffix: '', label: 'Tools to glue together' },
  ]
  return (
    <section id="ch-3" className="relative py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(238,242,255,0.5) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <ChapterMark number="Chapter III" label="The Receipts" />
          <Display as="h2" className="text-[clamp(2rem,6vw,5rem)] leading-[1.0] mb-12 sm:mb-16">
            What changes when teams switch.
          </Display>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-tl-border-default border-y border-tl-border-default">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06}>
              <div className="px-6 py-10 sm:py-14">
                <Display as="p" className="text-5xl sm:text-7xl tabular-nums [font-variation-settings:'opsz'_144,'SOFT'_50,'WONK'_1]">
                  <Ticker to={item.to} suffix={item.suffix} duration={1.4} />
                </Display>
                <p className="text-[12px] sm:text-sm text-tl-text-secondary mt-3 leading-snug max-w-[20ch]">
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
  return (
    <section id="ch-4" className="relative py-28 sm:py-36 border-y border-tl-border-subtle bg-tl-bg-elevated/40 overflow-hidden">
      <Grain opacity={0.05} />
      <div aria-hidden className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-tl-indigo/10 blur-[120px]" />
      <Reveal>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <ChapterMark number="Chapter IV" label="The Voice" />
          <Quote className="w-12 h-12 text-tl-gold/50 mb-6 -ml-1" strokeWidth={1.2} />
          <Display as="blockquote" className="text-[clamp(2rem,5vw,4rem)] leading-[1.05] [text-wrap:balance]">
            <span>We had </span>
            <Em className="text-tl-indigo">three strong candidates</Em>
            <span> in final rounds within </span>
            <Em className="text-tl-teal">a week.</Em>
            <span> Setup took less than </span>
            <Em className="text-tl-gold">twenty minutes.</Em>
          </Display>
          <div className="mt-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tl-gold via-tl-teal to-tl-indigo" />
            <div>
              <p className="text-sm font-semibold text-tl-text-primary">Priya Mehta</p>
              <p className="text-xs text-tl-text-secondary">Recruiting Lead · Nexus Health</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// ─── Final CTA — Chapter V ──────────────────────────────────────────────────

function CtaSection() {
  return (
    <section id="ch-5" className="relative py-28 sm:py-36 overflow-hidden border-t border-tl-border-subtle">
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
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <ChapterMark number="Chapter V" label="The Next Move" className="justify-center" />
          <Display
            as="h2"
            className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] mb-8 [text-wrap:balance] [font-variation-settings:'opsz'_144,'SOFT'_30,'WONK'_0]"
          >
            Stop scoring resumes.
            <br />
            <span className="relative inline-block">
              <Em className="text-tl-indigo">Start hiring people.</Em>
              <ScribbleUnderline color="#4F46E5" delay={0.4} />
            </span>
          </Display>
          <p className="text-tl-text-secondary text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Free 14-day trial. No credit card. AI handles the first hundred applicants —
            you handle the conversations that matter.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register?role=company"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-gold text-tl-bg-base text-[15px] font-semibold hover:bg-tl-gold/90 transition-all shadow-xl shadow-tl-gold/30 hover:-translate-y-0.5"
            >
              Start free trial
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[15px] font-semibold hover:border-tl-gold/40 transition-colors"
            >
              Read customer stories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[12.5px] text-tl-text-tertiary mt-8">
            Free 14-day trial · No credit card required · Cancel anytime
          </p>
        </div>
      </Reveal>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  { id: 'ch-1', title: 'The Brief',     number: 'I' },
  { id: 'ch-2', title: 'The Index',     number: 'II' },
  { id: 'ch-3', title: 'The Receipts',  number: 'III' },
  { id: 'ch-4', title: 'The Voice',     number: 'IV' },
  { id: 'ch-5', title: 'The Next Move', number: 'V' },
]

export default function TalentBridgePage() {
  return (
    <main id="main-content" className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />
      <RunningHeader />
      <ChapterIndex chapters={CHAPTERS} />
      <HeroSection />
      <TrustedByMarquee />
      <EditorialStatement />
      <TocSection />
      <NumbersStrip />
      <PullQuote />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}
