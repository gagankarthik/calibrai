'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Quote,
  Star,
  TrendingDown,
  Users,
  Brain,
  Layers,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import {
  Em,
  Ticker,
  Grain,
  ScribbleUnderline,
  ScribbleCircle,
  StackCard,
  MouseSpotlight,
  Marquee,
} from '@/components/landing/editorial'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Customer logos / names ──────────────────────────────────────────────────

const LOGOS = [
  'Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon', 'Dropfleet', 'Meridian',
  'Calypso', 'Northwind', 'Helio', 'Strata', 'Bayline', 'Orbital',
  'Halcyon', 'Boreal', 'Cascade', 'Teal Lab',
]

// ─── Testimonials ────────────────────────────────────────────────────────────

const QUOTES = [
  {
    quote: 'We cut time-to-hire from six weeks to twelve days. The AI ranking is genuinely better than our manual process.',
    name: 'Sarah Kim',
    title: 'Head of Talent',
    company: 'Dropfleet',
    color: '#4F46E5',
  },
  {
    quote: 'The match quality is remarkable. We\'re hiring better candidates and our 90-day retention is up forty percent.',
    name: 'James Park',
    title: 'VP Engineering',
    company: 'Archon Labs',
    color: '#10b981',
  },
  {
    quote: 'Setup took under twenty minutes. Within a week we had three strong candidates in final rounds.',
    name: 'Priya Mehta',
    title: 'Recruiting Lead',
    company: 'Nexus Health',
    color: '#C9A84C',
  },
]

const PULL_QUOTES = [
  { author: 'Sarah K.', text: 'six weeks → twelve days' },
  { author: 'James P.', text: 'retention up forty percent' },
  { author: 'Priya M.', text: 'three finalists in week one' },
]

// ─── Reveal helper ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 24, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      {/* ─── Editorial hero ────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-14 sm:pb-20 overflow-hidden">
        <Grain opacity={0.05} />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 20% 18%, rgba(79,70,229,0.16) 0px, transparent 55%),' +
              'radial-gradient(at 85% 30%, rgba(5,150,105,0.12) 0px, transparent 55%),' +
              'radial-gradient(at 50% 110%, rgba(2,132,199,0.10) 0px, transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 mb-7 flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase font-semibold text-tl-text-tertiary">
          <span>TalentBridge</span>
          <span className="h-px flex-1 bg-tl-text-tertiary/20" />
          <span>Issue 03 · Customer Outcomes</span>
          <span className="h-px flex-1 bg-tl-text-tertiary/20" />
          <span>2026</span>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-12 gap-7 items-end">
          <div className="lg:col-span-9">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="[font-family:'Fraunces',Georgia,serif] [font-variation-settings:'opsz'_144,'SOFT'_30,'WONK'_0] font-light text-[clamp(2.25rem,6.4vw,5rem)] leading-[1.0] tracking-[-0.04em] text-tl-text-primary [text-wrap:balance]"
            >
              Hiring teams who
              <br />
              decided{' '}
              <span className="relative inline-block">
                <Em>not to wait.</Em>
                <ScribbleUnderline color="#C9A84C" delay={0.5} />
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
              className="mt-5 text-[15px] sm:text-base text-tl-text-secondary max-w-xl leading-relaxed"
            >
              Sixty-three companies. Three industries. One thing in common: they replaced
              four tools with one workspace and started measuring results in days, not weeks.
            </motion.p>
          </div>

          {/* Sidebar dossier */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
            className="lg:col-span-3 lg:pl-6 lg:border-l lg:border-tl-border-default"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-tl-gold mb-3">
              At a glance
            </p>
            <dl className="space-y-3 text-sm">
              {[
                { k: 'Customers', v: '63' },
                { k: 'Hires made', v: '2,471' },
                { k: 'Avg. days/hire', v: '18' },
                { k: 'Industries', v: '3' },
              ].map((row) => (
                <div key={row.k} className="flex items-baseline justify-between gap-3 border-b border-dotted border-tl-border-default pb-2">
                  <dt className="text-tl-text-secondary text-xs">{row.k}</dt>
                  <dd className="font-mono font-bold text-tl-text-primary tabular-nums">{row.v}</dd>
                </div>
              ))}
            </dl>
          </motion.aside>
        </div>
      </section>

      {/* ─── Logo marquee strip ────────────────────────────────────────────── */}
      <section className="relative py-8 border-y border-tl-border-subtle bg-tl-bg-surface/60">
        <Marquee
          speed={42}
          items={LOGOS.map((name) => (
            <span
              key={name}
              className="text-2xl sm:text-3xl font-semibold tracking-tight text-tl-text-primary/85 hover:text-tl-text-primary transition-colors [font-family:'Instrument_Serif',Georgia,serif] italic"
            >
              {name}
            </span>
          ))}
        />
      </section>

      {/* ─── Big numbers (editorial financial-report style) ────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <Grain opacity={0.04} />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-tl-gold mb-3">
              The numbers
            </p>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-tl-text-primary leading-[0.98] mb-3">
              Replace four tools.{' '}
              <span className="relative inline-block">
                <Em className="text-tl-indigo">Hire three×</Em>
                <ScribbleCircle color="#4F46E5" delay={0.3} />
              </span>{' '}
              faster.
            </h2>
          </Reveal>

          {/* Stat list — typeset like a stock ticker / accounting schedule */}
          <div className="mt-14 sm:mt-20 space-y-0">
            {[
              {
                label: 'Average time to hire',
                from: '52 days',
                to: 65,
                suffix: '%',
                meta: 'reduction',
                Icon: TrendingDown,
              },
              {
                label: 'Match accuracy',
                from: '—',
                to: 94,
                suffix: '%',
                meta: 'on offers extended',
                Icon: Brain,
              },
              {
                label: 'Qualified candidates per role',
                from: '~10',
                to: 3,
                suffix: '×',
                meta: 'more',
                Icon: Users,
              },
              {
                label: 'Tools replaced',
                from: 'Indeed + Greenhouse + HackerRank + Gem',
                to: 1,
                suffix: '',
                meta: 'workspace',
                Icon: Layers,
              },
            ].map((row, i) => (
              <Reveal key={row.label} delay={i * 0.06}>
                <div className="grid grid-cols-12 items-baseline gap-3 sm:gap-6 py-7 sm:py-10 border-b border-tl-border-default last:border-0">
                  <div className="col-span-12 sm:col-span-1 text-tl-text-tertiary font-mono text-xs sm:text-sm">
                    0{i + 1}
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-tl-text-secondary font-semibold mb-1">
                      {row.label}
                    </p>
                    <p className="text-sm text-tl-text-tertiary">Before: <span className="text-tl-text-secondary font-medium">{row.from}</span></p>
                  </div>
                  <div className="col-span-9 sm:col-span-5 text-right sm:text-left">
                    <span className="text-5xl sm:text-7xl font-semibold tracking-[-0.04em] text-tl-text-primary tabular-nums">
                      <Ticker to={row.to} suffix={row.suffix} duration={1.5} />
                    </span>
                    <span className="ml-3 text-sm text-tl-text-secondary italic">{row.meta}</span>
                  </div>
                  <div className="hidden sm:flex sm:col-span-1 justify-end">
                    <div className="w-9 h-9 rounded-xl bg-tl-gold/10 border border-tl-gold/25 flex items-center justify-center">
                      <row.Icon className="w-4 h-4 text-tl-gold" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pull quote / oversize statement ───────────────────────────────── */}
      <section className="relative py-24 sm:py-32 border-y border-tl-border-subtle bg-tl-bg-surface/60 overflow-hidden">
        <Grain opacity={0.05} />
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-tl-indigo/8 blur-[120px]"
        />
        <Reveal>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <Quote className="w-12 h-12 text-tl-gold/50 mb-6 -ml-1" strokeWidth={1.2} />
            <blockquote className="text-3xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-tl-text-primary [text-wrap:balance]">
              <span>We had </span>
              <Em className="text-tl-indigo">three strong candidates</Em>
              <span> in final rounds within </span>
              <Em className="text-tl-teal">a week.</Em>
              <span> Setup took less than </span>
              <Em className="text-tl-gold">twenty minutes.</Em>
            </blockquote>
            <div className="mt-8 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tl-gold via-tl-teal to-tl-indigo" />
              <div>
                <p className="text-sm font-semibold text-tl-text-primary">Priya Mehta</p>
                <p className="text-xs text-tl-text-secondary">Recruiting Lead · Nexus Health</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Quote cards — asymmetric column heights ───────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-tl-gold mb-3">
              In their words
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary leading-[1.05] mb-12">
              No fluff. Just teams who{' '}
              <Em className="text-tl-indigo">stopped guessing.</Em>
            </h2>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {QUOTES.map((q, i) => (
              <Reveal key={q.name} delay={i * 0.08} className={cn(
                // Asymmetric vertical staggering — middle card hangs lower
                i === 1 && 'lg:translate-y-12',
                i === 2 && 'lg:translate-y-4',
              )}>
                <StackCard offset={8} shadowColor="rgba(17,24,39,0.10)">
                  <MouseSpotlight color={`${q.color}28`} className="rounded-2xl">
                    <article className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-7 h-full flex flex-col gap-5">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star key={k} className="w-3.5 h-3.5 text-tl-gold" style={{ fill: 'currentColor' }} />
                        ))}
                      </div>
                      <Quote className="w-7 h-7 text-tl-text-secondary/30" strokeWidth={1.4} />
                      <p className="text-lg leading-snug text-tl-text-primary [font-family:'Instrument_Serif',Georgia,serif] italic">
                        “{q.quote}”
                      </p>
                      <div className="mt-auto pt-5 border-t border-tl-border-subtle flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full"
                          style={{ background: `linear-gradient(135deg, ${q.color}, ${q.color}55)` }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-tl-text-primary">{q.name}</p>
                          <p className="text-xs text-tl-text-secondary truncate">
                            {q.title} · {q.company}
                          </p>
                        </div>
                      </div>
                    </article>
                  </MouseSpotlight>
                </StackCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pull-quote ribbon (third marquee — text-only) ────────────────── */}
      <section className="relative py-12 border-y border-tl-border-subtle bg-tl-bg-elevated/40 overflow-hidden">
        <Marquee
          reverse
          speed={48}
          items={PULL_QUOTES.map((p, i) => (
            <span key={i} className="inline-flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl tracking-tight text-tl-text-primary [font-family:'Instrument_Serif',Georgia,serif] italic">
                “{p.text}”
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-tl-gold">
                — {p.author}
              </span>
            </span>
          ))}
          separator="✦"
          itemClassName="[font-family:inherit]"
        />
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-28 sm:py-32 overflow-hidden">
        <Grain opacity={0.04} />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 50% 0%, rgba(238,242,255,0.85) 0%, transparent 70%)',
          }}
        />
        <Reveal>
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-tl-gold mb-4">
              The next chapter
            </p>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-tl-text-primary leading-[1.0] mb-6">
              Be the next one.
              <br />
              <span className="relative inline-block">
                <Em className="text-tl-indigo">Start hiring this week.</Em>
                <ScribbleUnderline color="#4F46E5" delay={0.4} />
              </span>
            </h2>
            <p className="text-tl-text-secondary text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Free 14-day trial. No credit card. The AI handles the first hundred applicants — you handle the conversation that matters.
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
                href="/product"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[15px] font-semibold hover:border-tl-gold/40 transition-colors"
              >
                Tour the product
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </main>
  )
}
