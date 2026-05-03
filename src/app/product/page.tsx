'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  Brain, Github, Globe2, Layers, Workflow, Sparkles, ArrowRight,
  CheckCircle2, AlertTriangle, BarChart3, MessageSquare, Star,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { PageHero } from '@/components/landing/page-hero'
import { LogoMarquee } from '@/components/landing/logo-marquee'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Scroll-reveal helper ────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 18, className }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
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

// ─── Tilt card on hover ──────────────────────────────────────────────────────

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
      transition={{ duration: 0.25, ease: EASE }}
      style={{ transformStyle: 'preserve-3d' }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated AI verdict mock ────────────────────────────────────────────────

function AiVerdictMock() {
  const reasons = [
    'Verified Python (top 5%) + 3 fintech projects',
    'GitHub: 6 active repos · TypeScript & Go',
    '4y senior backend matches role level',
  ]
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tl-indigo to-tl-teal flex items-center justify-center text-white font-bold">
          SJ
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-tl-text-primary truncate">Sarah Jin</p>
          <p className="text-xs text-tl-text-secondary truncate">Senior Backend · Python · Remote</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tl-teal/10 text-tl-teal border border-tl-teal/30 text-[11px] font-bold">
          <Sparkles className="w-3 h-3" /> Strong Yes
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[94, 92, 88, 90].map((v, i) => {
          const labels = ['Overall', 'Skills', 'Culture', 'Experience']
          return (
            <motion.div
              key={labels[i]}
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
              className="flex items-center gap-3"
            >
              <span className="text-[11px] text-tl-text-secondary w-20">{labels[i]}</span>
              <div className="flex-1 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${v}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
                  className="h-full rounded-full bg-gradient-to-r from-tl-gold to-tl-gold/60"
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-tl-gold w-9 text-right">{v}%</span>
            </motion.div>
          )
        })}
      </div>
      <ul className="space-y-2">
        {reasons.map((r, i) => (
          <motion.li
            key={r}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.06, duration: 0.4, ease: EASE }}
            className="flex items-start gap-2 text-xs text-tl-text-secondary"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-tl-teal mt-0.5 shrink-0" />
            <span>{r}</span>
          </motion.li>
        ))}
        <li className="flex items-start gap-2 text-xs text-tl-gold">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Tenure under 2y at last 2 jobs — verify in interview</span>
        </li>
      </ul>
    </div>
  )
}

// ─── GitHub mock ─────────────────────────────────────────────────────────────

function GitHubMock() {
  const langs = [
    { name: 'TypeScript', pct: 38, color: 'bg-tl-indigo' },
    { name: 'Go', pct: 27, color: 'bg-tl-teal' },
    { name: 'Python', pct: 19, color: 'bg-tl-gold' },
    { name: 'Rust', pct: 16, color: 'bg-tl-rose' },
  ]
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Github className="w-4 h-4 text-tl-text-primary" />
        <span className="text-sm font-semibold text-tl-text-primary">@sarahj-dev</span>
        <span className="ml-auto text-[11px] text-tl-text-secondary">122 repos · 4.1k stars</span>
      </div>
      <div className="space-y-2 mb-4">
        {langs.map((l, i) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-tl-text-primary font-medium">{l.name}</span>
              <span className="font-mono text-tl-text-secondary">{l.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${l.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
                className={cn('h-full rounded-full', l.color)}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['payments-gateway', 'rate-limiter-go'].map((repo) => (
          <div key={repo} className="rounded-xl border border-tl-border-subtle bg-tl-bg-elevated px-3 py-2.5">
            <p className="text-xs font-semibold text-tl-text-primary truncate">{repo}</p>
            <p className="text-[10px] text-tl-text-secondary mt-0.5">⭐ 1.2k · TS</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Universal-scrape mock ───────────────────────────────────────────────────

function ScrapeMock() {
  const cards = [
    { title: 'Senior Frontend', co: 'Lever Inc.', salary: '$140K–$180K', tag: 'lever.co' },
    { title: 'Staff ML Engineer', co: 'Greenhouse Ltd', salary: '$210K–$260K', tag: 'greenhouse.io' },
    { title: 'Site Reliability', co: 'Workday Co.', salary: '$160K–$200K', tag: 'workday.com' },
  ]
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-tl-bg-elevated border border-tl-border-subtle mb-4">
        <Globe2 className="w-3.5 h-3.5 text-tl-indigo" />
        <span className="text-[11px] font-mono text-tl-text-secondary truncate flex-1">jobs.example.com/careers</span>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-[10px] font-bold text-tl-teal"
        >
          ⏵ Scraping
        </motion.span>
      </div>
      <div className="space-y-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.4, ease: EASE }}
            className="rounded-xl border border-tl-border-subtle bg-tl-bg-base px-3 py-2.5 flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-md bg-tl-gold/15 border border-tl-gold/30 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-tl-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-tl-text-primary truncate">{c.title}</p>
              <p className="text-[10px] text-tl-text-secondary truncate">{c.co} · {c.tag}</p>
            </div>
            <span className="text-[10px] font-mono font-semibold text-tl-teal shrink-0">{c.salary}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Pipeline mock ───────────────────────────────────────────────────────────

function PipelineMock() {
  const cols = [
    { name: 'New', count: 12, color: 'bg-tl-blue' },
    { name: 'Screening', count: 8, color: 'bg-tl-gold' },
    { name: 'Interview', count: 4, color: 'bg-tl-teal' },
    { name: 'Offer', count: 2, color: 'bg-emerald-500' },
  ]
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-4 shadow-md">
      <div className="grid grid-cols-4 gap-2">
        {cols.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: EASE }}
            className="rounded-xl border border-tl-border-subtle bg-tl-bg-elevated/60 p-2"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className={cn('w-1.5 h-1.5 rounded-full', c.color)} />
              <span className="text-[10px] font-semibold text-tl-text-primary truncate">{c.name}</span>
              <span className="ml-auto text-[10px] font-mono font-bold text-tl-text-secondary">{c.count}</span>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(c.count, 3) }).map((_, k) => (
                <div key={k} className="h-7 rounded-md bg-tl-bg-surface border border-tl-border-subtle" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Bidirectional mock ──────────────────────────────────────────────────────

function BidirectionalMock() {
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md grid grid-cols-2 gap-3 items-center relative overflow-hidden">
      <div className="rounded-xl border border-tl-indigo/30 bg-tl-indigo/5 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-tl-indigo">Talent</p>
        <p className="text-2xl font-bold text-tl-text-primary mt-1">94%</p>
        <p className="text-[10px] text-tl-text-secondary mt-1">match this job</p>
      </div>
      <div className="rounded-xl border border-tl-teal/30 bg-tl-teal/5 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-tl-teal">Company</p>
        <p className="text-2xl font-bold text-tl-text-primary mt-1">94%</p>
        <p className="text-[10px] text-tl-text-secondary mt-1">match this candidate</p>
      </div>
      <motion.div
        aria-hidden
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-tl-gold to-transparent"
      />
    </div>
  )
}

// ─── Feature spotlight rows ──────────────────────────────────────────────────

interface Feature {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  visual: React.ReactNode
  reverse?: boolean
  href: string
  cta: string
}

const FEATURES: Feature[] = [
  {
    eyebrow: 'AI MATCHING',
    title: 'Verdicts, not black-box scores',
    description: 'Every candidate comes with a recommendation, not a number. See the reasons, the risks worth probing, and the underlying skill / culture / experience breakdown — all grounded in the actual data.',
    bullets: ['Strong Yes / Move Forward / Maybe / Not a Fit', 'Source-grounded reasons + risk flags', 'Recommendations explain themselves'],
    visual: <AiVerdictMock />,
    reverse: false,
    href: '/auth/register?role=company',
    cta: 'Try the engine',
  },
  {
    eyebrow: 'GITHUB-AWARE',
    title: 'Read the work, not just the resume',
    description: 'For tech roles, what someone ships is the resume. We pull public GitHub data — top languages, repo activity, stars — and feed it into the match engine alongside skills and experience.',
    bullets: ['Live GitHub repos + languages', 'Top-repo activity weighted into score', 'Verified vs. self-reported skills'],
    visual: <GitHubMock />,
    reverse: true,
    href: '/auth/register?role=company',
    cta: 'See it work',
  },
  {
    eyebrow: 'UNIVERSAL INGESTION',
    title: 'Paste any URL — get structured jobs',
    description: 'Lever, Greenhouse, Workday, a competitor\'s careers page. AI loads the page and extracts every posting into the same shape your talent feed already understands.',
    bullets: ['Listing pages + single-job pages', 'Auto-pagination across multiple pages', 'Preview before saving — nothing imports without your click'],
    visual: <ScrapeMock />,
    reverse: false,
    href: '/admin/crm/jobs',
    cta: 'See the scraper',
  },
  {
    eyebrow: 'ONE STACK',
    title: 'Sourcing → screen → interview → hire',
    description: 'Drag-and-drop kanban, AI quick-actions, real-time updates. No more cobbling together five SaaS tools and copy-pasting between them.',
    bullets: ['Kanban + list views', 'AI suggestions on stale candidates', 'Real-time updates without refresh'],
    visual: <PipelineMock />,
    reverse: true,
    href: '/auth/register?role=company',
    cta: 'See the pipeline',
  },
  {
    eyebrow: 'BIDIRECTIONAL AI',
    title: 'Same engine for both sides',
    description: 'Talent sees the same fit reasons companies see. They get matched jobs ranked by AI with a one-line "why you match." No silence. No ghosting.',
    bullets: ['Talent sees match score on every job', 'Companies see ranked candidates with reasoning', 'Trust restored via transparency'],
    visual: <BidirectionalMock />,
    reverse: false,
    href: '/auth/register?role=talent',
    cta: 'See it from talent side',
  },
]

// ─── Hero side: animated bento preview ──────────────────────────────────────

function HeroBento() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-tl-indigo/15 via-tl-teal/10 to-tl-gold/10 blur-2xl"
      />
      <div className="relative grid grid-cols-2 gap-3">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="col-span-2 rounded-2xl border border-tl-border-default bg-tl-bg-surface p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tl-indigo to-tl-teal" />
            <div className="flex-1 min-w-0">
              <div className="h-2 w-24 bg-tl-text-primary/80 rounded-full" />
              <div className="h-1.5 w-16 bg-tl-text-secondary/40 rounded-full mt-1" />
            </div>
            <span className="text-[9px] font-bold text-tl-teal bg-tl-teal/10 border border-tl-teal/30 px-1.5 py-0.5 rounded-full">
              94% MATCH
            </span>
          </div>
          <div className="space-y-1.5">
            {[88, 76, 64].map((w) => (
              <div key={w} className="h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                <div className="h-full rounded-full bg-tl-gold" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-3 shadow-md"
        >
          <Github className="w-4 h-4 text-tl-text-primary mb-2" />
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-tl-indigo/50 rounded-full" />
            <div className="h-1.5 w-2/3 bg-tl-teal/50 rounded-full" />
            <div className="h-1.5 w-1/2 bg-tl-gold/50 rounded-full" />
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="rounded-2xl border border-tl-gold/30 bg-gradient-to-br from-tl-gold/10 to-transparent p-3 shadow-md"
        >
          <Sparkles className="w-4 h-4 text-tl-gold mb-2" />
          <p className="text-[10px] font-bold text-tl-gold leading-tight">Strong Yes</p>
          <p className="text-[8px] text-tl-text-secondary mt-1">Verified Python</p>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      <PageHero
        eyebrow="Product"
        title={
          <>
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-tl-indigo via-tl-teal to-tl-gold bg-clip-text text-transparent">
              hire smarter.
            </span>
          </>
        }
        subtitle="Five capabilities that replace four subscriptions and the spreadsheet glue between them. Each one explains itself, scores both sides, and stays out of your way."
        rightSlot={<HeroBento />}
      />

      <LogoMarquee />

      {/* Feature spotlight rows */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-20 sm:space-y-28">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={0}>
              <div
                className={cn(
                  'grid lg:grid-cols-2 gap-8 lg:gap-14 items-center',
                  f.reverse && 'lg:[&>*:first-child]:order-2',
                )}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-3">
                    {f.eyebrow}
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-tl-text-primary leading-[1.1] mb-4">
                    {f.title}
                  </h2>
                  <p className="text-[15.5px] text-tl-text-secondary leading-relaxed mb-5">
                    {f.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-tl-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-tl-teal mt-0.5 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={f.href}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-tl-gold hover:gap-2 transition-all"
                  >
                    {f.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <TiltCard>{f.visual}</TiltCard>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mini stats strip */}
      <section className="relative py-20 sm:py-24 border-y border-tl-border-subtle bg-tl-bg-surface/40 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 18% 22%, rgba(79,70,229,0.16) 0px, transparent 55%),' +
              'radial-gradient(at 82% 78%, rgba(5,150,105,0.14) 0px, transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { Icon: Brain, value: '94%', label: 'Match accuracy on offers extended' },
              { Icon: BarChart3, value: '52→18', label: 'Days, time-to-hire' },
              { Icon: MessageSquare, value: '3×', label: 'More qualified candidates per role' },
              { Icon: Star, value: '0', label: 'Tools to glue together' },
            ].map(({ Icon, value, label }, i) => (
              <Reveal key={label} delay={i * 0.05}>
                <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6 hover:border-tl-gold/30 transition-colors">
                  <div className="inline-flex w-10 h-10 rounded-xl border border-tl-border-subtle bg-tl-bg-elevated items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-tl-gold" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-tl-text-primary leading-none mb-2">
                    {value}
                  </p>
                  <p className="text-[12.5px] text-tl-text-secondary leading-snug">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(238,242,255,0.85) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <Reveal>
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary leading-tight mb-5">
              Less searching.{' '}
              <span className="bg-gradient-to-r from-tl-indigo to-tl-teal bg-clip-text text-transparent">
                More hiring.
              </span>
            </h2>
            <p className="text-tl-text-secondary text-lg leading-relaxed mb-9 max-w-xl mx-auto">
              The AI handles the first 100 applicants. You handle the conversation that matters.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register?role=company"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-gold text-tl-bg-base text-[15px] font-semibold hover:bg-tl-gold/90 transition-all shadow-xl shadow-tl-gold/30"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[15px] font-semibold hover:border-tl-gold/40 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <LandingFooter />
    </main>
  )
}
