'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  X,
  Minus,
  Brain,
  Github,
  Layers,
  Workflow,
  Globe2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Eye,
  Zap,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { SectionPattern } from '@/components/landing/section-pattern'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Comparison matrix ───────────────────────────────────────────────────────

type CellState = 'yes' | 'partial' | 'no'

interface Row {
  feature: string
  detail: string
  values: Record<string, CellState>
}

const COLUMNS = ['Indeed', 'ZipRecruiter', 'Dice', 'LinkedIn Recruiter', 'Greenhouse', 'TalentBridge'] as const
type Col = typeof COLUMNS[number]

const ROWS: Row[] = [
  {
    feature: 'AI candidate analysis with explained reasons',
    detail: 'Not a black-box score — actual reasoning, risks, and a Strong Yes / Maybe / No verdict.',
    values: { Indeed: 'no', ZipRecruiter: 'partial', Dice: 'no', 'LinkedIn Recruiter': 'partial', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'GitHub & portfolio signal in matching',
    detail: 'Reads top languages and repo activity for tech roles — the work is the resume.',
    values: { Indeed: 'no', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'no', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'Bidirectional AI (talent ↔ company)',
    detail: 'Talent sees match scores against jobs. Companies see match scores against candidates. Same engine.',
    values: { Indeed: 'no', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'no', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'Rank entire talent pool against any job',
    detail: 'Pick a job, click Find Talent — AI ranks every candidate by fit instantly.',
    values: { Indeed: 'no', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'partial', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'Universal URL → structured jobs',
    detail: 'Paste a Lever / Greenhouse / careers-page URL — AI extracts and indexes every posting.',
    values: { Indeed: 'no', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'no', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'End-to-end pipeline + ATS workflow',
    detail: 'Kanban + list + drag-and-drop + AI quick-actions, not just a job board.',
    values: { Indeed: 'no', ZipRecruiter: 'partial', Dice: 'no', 'LinkedIn Recruiter': 'no', Greenhouse: 'yes', TalentBridge: 'yes' },
  },
  {
    feature: 'Real-time application updates',
    detail: 'Stage moves and new applies appear without manual refresh — for both sides.',
    values: { Indeed: 'no', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'partial', Greenhouse: 'partial', TalentBridge: 'yes' },
  },
  {
    feature: 'Built-in candidate sourcing',
    detail: 'You don\'t bring your own pipeline — talent applies through the platform itself.',
    values: { Indeed: 'yes', ZipRecruiter: 'yes', Dice: 'partial', 'LinkedIn Recruiter': 'yes', Greenhouse: 'no', TalentBridge: 'yes' },
  },
  {
    feature: 'Transparent pricing',
    detail: 'No hidden enterprise calls. What you see is what you pay.',
    values: { Indeed: 'partial', ZipRecruiter: 'no', Dice: 'no', 'LinkedIn Recruiter': 'no', Greenhouse: 'no', TalentBridge: 'yes' },
  },
]

// ─── Deep-dive gaps ──────────────────────────────────────────────────────────

const GAPS: Array<{
  icon: React.ComponentType<{ className?: string }>
  iconCls: string
  bg: string
  title: string
  them: string
  themLabel: string
  us: string
  usLabel: string
}> = [
  {
    icon: Brain,
    iconCls: 'text-tl-indigo',
    bg: 'bg-tl-indigo/10 border-tl-indigo/25',
    title: 'Reasoning, not a score',
    themLabel: 'Most platforms',
    them: '"87% match" with no explanation. Recruiters still have to read every resume to figure out why — and reject 90% of them.',
    usLabel: 'TalentBridge',
    us: 'Every candidate gets a verdict — Strong Yes, Move Forward, Maybe, Not a Fit — plus 3-5 grounded reasons and the risks worth checking in interview.',
  },
  {
    icon: Github,
    iconCls: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Where engineers actually live',
    themLabel: 'Most platforms',
    them: 'Read keywords on a resume. A candidate who wrote 3 production React apps last year looks identical to one who took a course on it.',
    usLabel: 'TalentBridge',
    us: 'Pulls public GitHub data — top languages, repo activity, stars. Tech matches reflect what the candidate actually ships, not what they claim.',
  },
  {
    icon: Layers,
    iconCls: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    title: 'One stack, not five subscriptions',
    themLabel: 'The status quo',
    them: 'Sourcing on Indeed. ATS on Greenhouse. Assessments on HackerRank. Outreach on Gem. Five tools, five bills, six context-switches per candidate.',
    usLabel: 'TalentBridge',
    us: 'Sourcing, AI matching, pipeline, candidate analytics, and (soon) interviews — all on one workspace. Pay for one product, manage one queue.',
  },
  {
    icon: Workflow,
    iconCls: 'text-tl-teal',
    bg: 'bg-tl-teal/10 border-tl-teal/25',
    title: 'AI works for both sides',
    themLabel: 'Most platforms',
    them: 'Score candidates for the recruiter. Talent sees a black hole — apply to 100 jobs, hear back from 1. Trust collapses.',
    usLabel: 'TalentBridge',
    us: 'Talent sees the same fit reasons companies see. They get matched jobs ranked by AI, with a one-line "Why you match." No silence, no guessing.',
  },
  {
    icon: Globe2,
    iconCls: 'text-tl-blue',
    bg: 'bg-tl-blue/10 border-tl-blue/25',
    title: 'Universal ingestion',
    themLabel: 'Indeed / ZipRecruiter',
    them: 'You see Indeed jobs on Indeed. ZipRecruiter on ZipRecruiter. Cross-board search means scraping rituals or paying multiple vendors.',
    usLabel: 'TalentBridge',
    us: 'Paste any job URL — Lever, Greenhouse, Workday, a competitor\'s careers page. Our scraper + AI structures every posting and feeds it into your talent\'s feed.',
  },
  {
    icon: ShieldCheck,
    iconCls: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    title: 'Honest signal',
    themLabel: 'Across the industry',
    them: '20–30% of postings are ghost jobs (filled, never filled, or reposted forever). Reply rates are hidden. Salary is "competitive."',
    usLabel: 'TalentBridge',
    us: 'Salary transparency required. Reply-rate tracking. Every employer is verified before they post. You see exactly what you\'re applying to.',
  },
]

// ─── Cell renderer ───────────────────────────────────────────────────────────

function Cell({ state, isUs }: { state: CellState; isUs: boolean }) {
  if (state === 'yes') {
    return (
      <div className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-full',
        isUs ? 'bg-tl-teal text-white shadow-md shadow-tl-teal/30' : 'bg-tl-teal/15 text-tl-teal',
      )}>
        <Check className="w-4 h-4" strokeWidth={3} />
      </div>
    )
  }
  if (state === 'partial') {
    return (
      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700">
        <Minus className="w-4 h-4" strokeWidth={3} />
      </div>
    )
  }
  return (
    <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600">
      <X className="w-4 h-4" strokeWidth={3} />
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <SectionPattern variant="aurora" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tl-indigo/10 border border-tl-indigo/25 text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-indigo mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Why TalentBridge
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
            className="text-4xl sm:text-6xl font-semibold tracking-tight text-tl-text-primary leading-[1.05] mb-5"
          >
            Built for the{' '}
            <span className="bg-gradient-to-r from-tl-indigo via-tl-teal to-tl-indigo bg-clip-text text-transparent">
              AI hiring era.
            </span>
            <br />
            They search resumes. We understand candidates.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: EASE }}
            className="text-lg text-tl-text-secondary leading-relaxed max-w-2xl mx-auto"
          >
            Indeed, ZipRecruiter, Dice and LinkedIn Recruiter were built for the keyword era.
            Greenhouse and Lever solve the back office but make you bring your own pipeline.
            <span className="text-tl-text-primary font-semibold"> TalentBridge does both — with AI that explains itself.</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/auth/register?role=company"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold hover:bg-tl-gold/90 transition-all shadow-lg shadow-tl-gold/30"
            >
              Start hiring
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#how"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-sm font-semibold hover:border-tl-gold/40 transition-colors"
            >
              See how it works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Comparison matrix ─────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24 border-y border-tl-border-subtle bg-tl-bg-surface/60 overflow-hidden">
        <SectionPattern variant="grid" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-3">
              Feature-by-feature
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-tl-text-primary leading-tight">
              At a glance
            </h2>
            <p className="text-tl-text-secondary mt-3 max-w-xl mx-auto">
              The honest comparison. Some things competitors do well — we say so. The rest is the gap we built for.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="rounded-2xl border border-tl-border-default bg-tl-bg-surface shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-tl-border-subtle bg-tl-bg-elevated/60">
                    <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-tl-text-secondary min-w-[260px]">
                      Capability
                    </th>
                    {COLUMNS.map((c) => {
                      const isUs = c === 'TalentBridge'
                      return (
                        <th
                          key={c}
                          className={cn(
                            'px-3 sm:px-4 py-4 text-center text-[11px] font-semibold uppercase tracking-wider min-w-[110px]',
                            isUs
                              ? 'text-tl-gold bg-gradient-to-b from-tl-gold/10 to-transparent'
                              : 'text-tl-text-secondary',
                          )}
                        >
                          {isUs ? (
                            <span className="inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {c}
                            </span>
                          ) : (
                            c
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-tl-border-subtle last:border-0 hover:bg-tl-bg-elevated/40 transition-colors"
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-tl-text-primary leading-snug">{row.feature}</p>
                        <p className="text-[12px] text-tl-text-secondary leading-snug mt-1">{row.detail}</p>
                      </td>
                      {COLUMNS.map((c) => {
                        const isUs = c === 'TalentBridge'
                        return (
                          <td
                            key={c}
                            className={cn(
                              'px-3 sm:px-4 py-4 text-center align-middle',
                              isUs && 'bg-gradient-to-b from-tl-gold/5 to-transparent',
                            )}
                          >
                            <Cell state={row.values[c as Col]} isUs={isUs} />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="border-t border-tl-border-subtle bg-tl-bg-elevated/40 px-5 py-3 flex items-center gap-5 text-[11px] text-tl-text-secondary flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-tl-teal/15 text-tl-teal inline-flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                </span>
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center">
                  <Minus className="w-2.5 h-2.5" strokeWidth={3} />
                </span>
                Partial / paywalled
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center">
                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                </span>
                Not available
              </span>
              <span className="ml-auto text-tl-text-tertiary">Last reviewed: Q2 2026 · public information</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Deep-dive gap cards ───────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <SectionPattern variant="aurora" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-gold mb-3">
              The 6 gaps we built for
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-tl-text-primary leading-tight">
              What the others miss
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
            {GAPS.map((gap, i) => {
              const Icon = gap.icon
              return (
                <motion.div
                  key={gap.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
                  className="relative rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6 sm:p-7 hover:border-tl-gold/30 transition-colors"
                >
                  <div className={cn('inline-flex w-11 h-11 rounded-xl border items-center justify-center mb-4', gap.bg)}>
                    <Icon className={cn('w-5 h-5', gap.iconCls)} />
                  </div>
                  <h3 className="text-lg font-semibold text-tl-text-primary mb-3">{gap.title}</h3>

                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-tl-border-subtle bg-tl-bg-elevated/60 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-tl-text-tertiary mb-1">
                        {gap.themLabel}
                      </p>
                      <p className="text-[13.5px] text-tl-text-secondary leading-relaxed">{gap.them}</p>
                    </div>
                    <div className="rounded-xl border border-tl-gold/30 bg-tl-gold/[0.06] p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-tl-gold mb-1">
                        {gap.usLabel}
                      </p>
                      <p className="text-[13.5px] text-tl-text-primary leading-relaxed">{gap.us}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Outcome metrics ───────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24 border-y border-tl-border-subtle bg-tl-bg-surface/40 overflow-hidden">
        <SectionPattern variant="mesh" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-tl-text-primary leading-tight">
              What companies see when they switch
            </h2>
            <p className="text-tl-text-secondary mt-3 max-w-xl mx-auto">
              Pulled from internal benchmarks across our pilot cohort vs. the platforms they replaced.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: '52→18', unit: 'days', label: 'Average time-to-hire', Icon: TrendingUp, color: 'text-tl-indigo' },
              { value: '94', unit: '%', label: 'Match accuracy on offers extended', Icon: Brain, color: 'text-tl-teal' },
              { value: '3×', unit: '', label: 'More qualified candidates per role', Icon: Eye, color: 'text-tl-gold' },
              { value: '0', unit: '', label: 'Tools to glue together', Icon: Zap, color: 'text-rose-700' },
            ].map(({ value, unit, label, Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
                className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6"
              >
                <div className={cn('inline-flex w-10 h-10 rounded-xl border border-tl-border-subtle bg-tl-bg-elevated items-center justify-center mb-3', color)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-tl-text-primary leading-none mb-2 tabular-nums">
                  {value}
                  {unit && <span className="text-xl text-tl-gold ml-1">{unit}</span>}
                </p>
                <p className="text-[12.5px] text-tl-text-secondary leading-snug">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-28 overflow-hidden">
        <SectionPattern variant="soft" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-tl-text-primary leading-tight mb-5">
            Stop comparing.{' '}
            <span className="bg-gradient-to-r from-tl-indigo to-tl-teal bg-clip-text text-transparent">
              Start hiring.
            </span>
          </h2>
          <p className="text-tl-text-secondary text-lg leading-relaxed mb-9 max-w-xl mx-auto">
            Free 14-day trial. No credit card. Bring your open roles — the AI handles the first 100 applicants for you.
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
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[15px] font-semibold hover:border-tl-gold/40 transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
