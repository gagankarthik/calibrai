'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import {
  Briefcase, Sparkles, Users, ChevronRight, ArrowRight, CheckCircle2,
  Target, Zap, Brain,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { PageHero } from '@/components/landing/page-hero'
import { LogoMarquee } from '@/components/landing/logo-marquee'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

interface Step {
  number: string
  Icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  bullets: string[]
  accent: string
  iconCls: string
  visual: React.ReactNode
}

// ─── Mini visuals per step ───────────────────────────────────────────────────

function PostMock() {
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-3">Post a job</p>
      <div className="space-y-2">
        <div className="h-9 rounded-lg border border-tl-border-subtle bg-tl-bg-elevated px-3 flex items-center text-xs text-tl-text-primary font-medium">
          Senior Backend Engineer
        </div>
        <div className="h-9 rounded-lg border border-tl-border-subtle bg-tl-bg-elevated px-3 flex items-center gap-2 text-xs text-tl-text-secondary">
          Remote · USD $140K – $180K
        </div>
        <div className="rounded-lg border border-tl-gold/30 bg-tl-gold/8 p-3 mt-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-tl-gold shrink-0" />
          <span className="text-xs text-tl-text-primary">AI drafts the description in 8 seconds</span>
        </div>
      </div>
    </div>
  )
}

function MatchMock() {
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-3">AI ranks the talent pool</p>
      <div className="space-y-2.5">
        {[
          { name: 'Sarah Jin', score: 94, color: 'text-tl-teal', bg: 'bg-tl-teal' },
          { name: 'Marcus Lee', score: 88, color: 'text-tl-gold', bg: 'bg-tl-gold' },
          { name: 'Priya Mehta', score: 82, color: 'text-tl-gold', bg: 'bg-tl-gold' },
          { name: 'Daniel Cho', score: 71, color: 'text-tl-text-secondary', bg: 'bg-tl-text-secondary/40' },
        ].map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: EASE }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tl-indigo to-tl-teal text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {c.name.split(' ').map((p) => p[0]).join('')}
            </div>
            <span className="text-xs font-medium text-tl-text-primary flex-1 truncate">{c.name}</span>
            <div className="w-20 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${c.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
                className={cn('h-full rounded-full', c.bg)}
              />
            </div>
            <span className={cn('text-xs font-mono font-bold w-9 text-right', c.color)}>{c.score}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VerdictMock() {
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-md">
      <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-3">Review with reasons</p>
      <div className="rounded-xl border border-tl-teal/30 bg-tl-teal/8 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-tl-teal" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-tl-teal">Strong Yes</span>
        </div>
        <p className="text-xs text-tl-text-primary leading-relaxed mb-2">
          Verified Python (top 5%), 4y backend at fintech, 3 production React apps on GitHub.
        </p>
        <ul className="space-y-1.5">
          {['Skills match: 94%', 'Experience aligned: 92%', 'Salary fit: in range'].map((b) => (
            <li key={b} className="flex items-start gap-2 text-[11px] text-tl-text-secondary">
              <CheckCircle2 className="w-3 h-3 text-tl-teal mt-0.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PipelineMock() {
  return (
    <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-4 shadow-md">
      <p className="text-[11px] font-semibold text-tl-text-secondary uppercase tracking-wider mb-3 px-1">Move forward</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: 'Screen', count: 3, color: 'bg-tl-gold' },
          { name: 'Interview', count: 2, color: 'bg-tl-teal' },
          { name: 'Offer', count: 1, color: 'bg-emerald-500' },
        ].map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: EASE }}
            className="rounded-lg border border-tl-border-subtle bg-tl-bg-elevated/60 p-2"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', c.color)} />
              <span className="text-[10px] font-semibold text-tl-text-primary">{c.name}</span>
              <span className="ml-auto text-[10px] font-mono font-bold text-tl-text-secondary">{c.count}</span>
            </div>
            <div className="space-y-1">
              {Array.from({ length: c.count }).map((_, k) => (
                <div key={k} className="h-5 rounded-md bg-tl-bg-surface border border-tl-border-subtle" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const STEPS: Step[] = [
  {
    number: '01',
    Icon: Briefcase,
    title: 'Post the role (or paste a URL)',
    description: 'Type a brief and let AI draft the description, or paste a Lever / Greenhouse / Workday URL — we extract every posting and add it to your board.',
    bullets: ['AI-drafted descriptions in seconds', 'Universal scrape from any URL', 'Salary transparency required'],
    accent: 'from-tl-indigo to-tl-teal',
    iconCls: 'text-tl-indigo',
    visual: <PostMock />,
  },
  {
    number: '02',
    Icon: Brain,
    title: 'AI ranks every candidate',
    description: 'The match engine reads skills, experience, salary fit, work mode, and (for tech) GitHub signal — then sorts your entire talent pool by fit.',
    bullets: ['GitHub-aware for tech roles', 'Bidirectional — talent sees their score too', 'Find Talent: rank in one click'],
    accent: 'from-tl-teal to-tl-gold',
    iconCls: 'text-tl-teal',
    visual: <MatchMock />,
  },
  {
    number: '03',
    Icon: Sparkles,
    title: 'Review with reasons',
    description: 'Each top candidate comes with a verdict — Strong Yes, Move Forward, Maybe, Not a Fit — and the reasons + risks worth probing in interview.',
    bullets: ['Recommendations, not opaque scores', 'Risk flags surfaced upfront', 'Interview prep questions on demand'],
    accent: 'from-tl-gold to-tl-rose',
    iconCls: 'text-tl-gold',
    visual: <VerdictMock />,
  },
  {
    number: '04',
    Icon: Users,
    title: 'Move forward, fast',
    description: 'Drag candidates through screen → interview → offer. Stage moves trigger candidate notifications. Stale rows get nudged automatically.',
    bullets: ['Kanban + list views', 'Real-time updates without refresh', 'Auto-flag candidates stalled > 7 days'],
    accent: 'from-tl-rose to-tl-indigo',
    iconCls: 'text-tl-rose',
    visual: <PipelineMock />,
  },
]

// ─── Step row with sticky number + scroll-linked progress ────────────────────

function StepRow({ step, idx, isLast }: { step: Step; idx: number; isLast: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })

  return (
    <div ref={ref} className="relative">
      {/* Connecting line below this step (except last) */}
      {!isLast && (
        <motion.div
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          style={{ originY: 0 }}
          className="absolute left-[31px] top-16 bottom-0 w-0.5 bg-gradient-to-b from-tl-gold/50 via-tl-indigo/30 to-transparent"
        />
      )}

      <div className="grid lg:grid-cols-[64px_1fr_1fr] gap-5 lg:gap-10 items-start relative">
        {/* Number capsule */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative shrink-0"
        >
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-bold text-xl text-white shadow-lg bg-gradient-to-br',
            step.accent,
          )}>
            {step.number}
          </div>
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 }}
            className={cn(
              'absolute inset-0 rounded-2xl border-2 -z-10',
              idx === 0 ? 'border-tl-indigo' : idx === 1 ? 'border-tl-teal' : idx === 2 ? 'border-tl-gold' : 'border-tl-rose',
            )}
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        >
          <div className="flex items-center gap-2 mb-3">
            <step.Icon className={cn('w-5 h-5', step.iconCls)} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-text-secondary">
              Step {step.number}
            </p>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-tl-text-primary leading-tight mb-3">
            {step.title}
          </h3>
          <p className="text-[15px] text-tl-text-secondary leading-relaxed mb-5">
            {step.description}
          </p>
          <ul className="space-y-2">
            {step.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-tl-text-secondary">
                <CheckCircle2 className="w-4 h-4 text-tl-teal mt-0.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
          className="hidden lg:block"
        >
          {step.visual}
        </motion.div>
      </div>
    </div>
  )
}

// ─── Hero side preview: vertical step orbs ───────────────────────────────────

function StepsPreview() {
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-tl-indigo/15 via-tl-teal/10 to-tl-gold/10 blur-2xl" />
      <div className="relative rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 shadow-xl">
        {STEPS.slice(0, 4).map((s, i) => (
          <motion.div
            key={s.number}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.45, ease: EASE }}
            className="flex items-center gap-3 py-2.5 border-b border-tl-border-subtle last:border-0"
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white bg-gradient-to-br shrink-0',
              s.accent,
            )}>
              {s.number}
            </div>
            <p className="text-sm font-medium text-tl-text-primary truncate">{s.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      <PageHero
        eyebrow="How it works"
        title={
          <>
            From open role to hired in{' '}
            <span className="bg-gradient-to-r from-tl-indigo via-tl-teal to-tl-gold bg-clip-text text-transparent">
              days, not months.
            </span>
          </>
        }
        subtitle="Four steps. Each one is doing the heavy lifting your team used to do across four tools. Watch how a posting goes from idea to offer."
        rightSlot={<StepsPreview />}
      />

      <LogoMarquee />

      {/* Steps */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(79,70,229,0.10) 1px, transparent 1.4px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 space-y-16 sm:space-y-20">
          {STEPS.map((step, idx) => (
            <StepRow key={step.number} step={step} idx={idx} isLast={idx === STEPS.length - 1} />
          ))}
        </div>
      </section>

      {/* Outcome strip */}
      <section className="relative py-20 sm:py-24 border-y border-tl-border-subtle bg-tl-bg-surface/60 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(238,242,255,0.7) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-tl-text-primary leading-tight mb-3">
            Average outcome across our pilot cohort
          </h2>
          <p className="text-tl-text-secondary mb-12 max-w-xl mx-auto">
            Pulled from real customer benchmarks vs. the platforms they replaced.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { Icon: Target, value: '18d', label: 'Time-to-hire (was 52d)' },
              { Icon: Brain, value: '94%', label: 'Match accuracy on offers' },
              { Icon: Zap, value: '3×', label: 'Qualified candidates per role' },
              { Icon: Users, value: '0', label: 'Tools to glue together' },
            ].map(({ Icon, value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6"
              >
                <div className="inline-flex w-10 h-10 rounded-xl bg-tl-gold/10 border border-tl-gold/25 items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-tl-gold" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-tl-text-primary leading-none mb-2">
                  {value}
                </p>
                <p className="text-[12.5px] text-tl-text-secondary leading-snug">{label}</p>
              </motion.div>
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
              'radial-gradient(at 50% 50%, rgba(79,70,229,0.10) 0px, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary leading-tight mb-5">
            Try the four steps{' '}
            <span className="bg-gradient-to-r from-tl-indigo to-tl-teal bg-clip-text text-transparent">
              on your next role.
            </span>
          </h2>
          <p className="text-tl-text-secondary text-lg leading-relaxed mb-9 max-w-xl mx-auto">
            Free 14-day trial. No credit card. Bring an open role — the AI handles the first 100 applicants.
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
              href="/customers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[15px] font-semibold hover:border-tl-gold/40 transition-colors"
            >
              See customer results
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
