'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Check, Plus, Minus, Sparkles,
  Shield, Lock, HeadphonesIcon, BarChart3, Globe,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { pricingPlans } from '@/lib/data'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

function fmtPrice(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function Reveal({
  children, delay = 0, y = 18, className,
}: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Billing toggle ──────────────────────────────────────────────────────────

function BillingToggle({
  period, onChange,
}: { period: 'monthly' | 'annual'; onChange: (p: 'monthly' | 'annual') => void }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full border border-tl-border-default bg-tl-bg-surface shadow-sm">
      {(['monthly', 'annual'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'relative px-5 py-2 text-[13px] font-semibold rounded-full transition-colors capitalize',
            period === p ? 'text-white' : 'text-tl-text-secondary hover:text-tl-text-primary',
          )}
        >
          {period === p && (
            <motion.span
              layoutId="billing-pill"
              className="absolute inset-0 -z-10 rounded-full bg-tl-indigo"
              transition={{ duration: 0.25, ease: EASE }}
            />
          )}
          {p}
          {p === 'annual' && (
            <span
              className={cn(
                'ml-1.5 inline-flex items-center text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full',
                period === 'annual' ? 'bg-white/20 text-white' : 'bg-tl-teal/15 text-tl-teal',
              )}
            >
              Save 20%
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Plan card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan, period, index,
}: { plan: (typeof pricingPlans)[number]; period: 'monthly' | 'annual'; index: number }) {
  const price = period === 'annual' ? plan.annualPrice : plan.monthlyPrice
  const highlighted = plan.highlighted

  return (
    <Reveal delay={index * 0.06} className="h-full">
      <article
        className={cn(
          'relative h-full rounded-2xl border bg-tl-bg-surface p-7 sm:p-8 flex flex-col transition-all',
          highlighted
            ? 'border-tl-indigo/40 shadow-[0_20px_60px_rgba(79,70,229,0.12)] ring-1 ring-tl-indigo/15 lg:scale-[1.02]'
            : 'border-tl-border-default hover:border-tl-text-primary/20 hover:-translate-y-0.5',
        )}
      >
        {highlighted && plan.badge && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tl-indigo text-white text-[10.5px] font-bold uppercase tracking-wider shadow-md">
            <Sparkles className="w-3 h-3" />
            {plan.badge}
          </span>
        )}

        <h3 className="text-2xl font-bold tracking-tight text-tl-text-primary">{plan.name}</h3>
        <p className="text-[13.5px] text-tl-text-secondary mt-1.5 mb-7 leading-relaxed">{plan.description}</p>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-semibold text-tl-text-tertiary">$</span>
          <span className="text-5xl font-bold tabular-nums text-tl-text-primary tracking-tight">
            {fmtPrice(price)}
          </span>
          <span className="text-sm text-tl-text-secondary ml-1">/ mo</span>
        </div>
        <p className="text-[12px] text-tl-text-tertiary mb-7">
          {period === 'annual' ? 'Billed annually' : 'Billed monthly'} · USD
        </p>

        <Link
          href="/auth/register?role=company"
          className={cn(
            'group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors mb-7',
            highlighted
              ? 'bg-tl-indigo text-white hover:bg-tl-indigo/90 shadow-md shadow-tl-indigo/30'
              : 'border border-tl-border-default text-tl-text-primary hover:bg-tl-bg-elevated',
          )}
        >
          Start free trial
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <p className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-tl-text-tertiary mb-3">
          What&apos;s included
        </p>
        <ul className="space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-tl-text-secondary">
              <span className="w-4 h-4 rounded-full bg-tl-teal/15 inline-flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-tl-teal" strokeWidth={3} />
              </span>
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  )
}

// ─── Comparison table ────────────────────────────────────────────────────────

interface CompareRow {
  feature: string
  Icon?: React.ComponentType<{ className?: string }>
  starter: string | boolean
  growth: string | boolean
  enterprise: string | boolean
}

const COMPARE_GROUPS: Array<{ title: string; rows: CompareRow[] }> = [
  {
    title: 'Hiring capacity',
    rows: [
      { feature: 'Active job postings',     starter: '5',   growth: '20',          enterprise: 'Unlimited' },
      { feature: 'Team members',            starter: '3',   growth: '10',          enterprise: 'Unlimited' },
      { feature: 'AI match credits / month', starter: '100', growth: '500',         enterprise: 'Unlimited' },
    ],
  },
  {
    title: 'AI & matching',
    rows: [
      { feature: 'AI candidate matching',   starter: true, growth: true, enterprise: true,  Icon: Sparkles },
      { feature: 'Pipeline management',     starter: 'Basic', growth: 'Full Kanban', enterprise: 'Full + automation', Icon: BarChart3 },
      { feature: 'Skills assessments',      starter: false, growth: true, enterprise: true },
      { feature: 'Bias detection reports',  starter: false, growth: true, enterprise: true, Icon: Shield },
      { feature: 'Salary intelligence',     starter: false, growth: true, enterprise: true },
    ],
  },
  {
    title: 'Integrations & security',
    rows: [
      { feature: 'ATS integrations',        starter: false, growth: 'Greenhouse, Lever', enterprise: 'All + custom API', Icon: Globe },
      { feature: 'API access',              starter: false, growth: false, enterprise: true },
      { feature: 'SSO / SAML',              starter: false, growth: false, enterprise: true,  Icon: Lock },
      { feature: 'Dedicated CSM',           starter: false, growth: false, enterprise: true,  Icon: HeadphonesIcon },
    ],
  },
]

function CompareCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className={cn(
        'inline-flex w-6 h-6 rounded-full items-center justify-center mx-auto',
        highlight ? 'bg-tl-indigo/15 text-tl-indigo' : 'bg-tl-teal/15 text-tl-teal',
      )}>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
    )
  }
  if (value === false) {
    return <span aria-label="Not included" className="inline-block w-3 h-px bg-tl-text-tertiary/40" />
  }
  return (
    <span className={cn(
      'text-[12.5px] font-semibold tabular-nums',
      highlight ? 'text-tl-indigo' : 'text-tl-text-primary',
    )}>
      {value}
    </span>
  )
}

// ─── FAQ accordion ───────────────────────────────────────────────────────────

const FAQ = [
  { q: "What's included in the free trial?", a: 'Every plan starts with a 14-day free trial with full feature access. No credit card required. Post jobs, run AI matching, review real candidates.' },
  { q: 'Can I switch plans at any time?',   a: 'Yes. Upgrade, downgrade, or cancel any time. Upgrades are pro-rated; downgrades take effect at the end of the current billing cycle.' },
  { q: 'Do you charge per user or per hire?', a: 'Flat monthly fee per company. Growth includes 10 team members; Enterprise is unlimited. We never charge success fees.' },
  { q: 'How does the AI matching work?',    a: 'Semantic understanding, not keyword matching — skills, experience, work mode, salary fit, and (for tech) GitHub signal. Each match comes with a verdict and grounded reasons.' },
  { q: 'What ATS integrations are available?', a: 'Growth includes native Greenhouse and Lever. Enterprise adds Workday, BambooHR, and any custom ATS via API. Custom integrations typically ship in 2–4 weeks.' },
  { q: 'How is our data secured?',          a: 'SOC2 Type II certified. TLS 1.3 in transit, AES-256 at rest. Enterprise plans support EU/US data residency and a dedicated security review process.' },
]

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="border-b border-tl-border-default last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-4 py-5 text-left"
      >
        <h3 className={cn('flex-1 text-[15px] sm:text-base font-semibold transition-colors', open ? 'text-tl-text-primary' : 'text-tl-text-primary/95')}>
          {q}
        </h3>
        <span
          className={cn(
            'inline-flex w-8 h-8 rounded-full border items-center justify-center transition-all shrink-0',
            open
              ? 'bg-tl-indigo border-tl-indigo text-white rotate-180'
              : 'border-tl-border-default text-tl-text-secondary',
          )}
        >
          {open ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[14px] text-tl-text-secondary leading-relaxed max-w-3xl">
          {a}
        </p>
      </motion.div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('annual')

  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 50% 0%, rgba(79,70,229,0.10) 0px, transparent 60%),' +
              'radial-gradient(at 100% 100%, rgba(5,150,105,0.06) 0px, transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tl-indigo/25 bg-tl-indigo/8 text-tl-indigo text-[11px] font-semibold uppercase tracking-[0.16em] mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Pricing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="text-[clamp(2rem,5.2vw,4rem)] font-bold tracking-tight text-tl-text-primary leading-[1.05] [text-wrap:balance]"
          >
            Simple pricing.{' '}
            <span className="text-tl-indigo">Built for teams that hire often.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-5 text-[15px] sm:text-[17px] text-tl-text-secondary leading-relaxed max-w-xl mx-auto"
          >
            Flat monthly fee per company. No success fees. No per-seat surcharges. Pick a plan, switch any time.
          </motion.p>

          <Reveal delay={0.2} className="mt-9 flex flex-col items-center gap-3">
            <BillingToggle period={period} onChange={setPeriod} />
            <p className="text-[11.5px] text-tl-text-tertiary">
              All plans · 14-day free trial · No credit card required
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Plan cards ─────────────────────────────────────────────────── */}
      <section className="relative py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {pricingPlans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} period={period} index={i} />
          ))}
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-14 border-y border-tl-border-default bg-tl-bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-[10.5px] tracking-[0.18em] uppercase font-bold text-tl-text-tertiary mb-5">
            Included on every plan
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { Icon: Shield, label: 'SOC 2 Type II' },
              { Icon: Lock,   label: 'AES-256 + TLS 1.3' },
              { Icon: Globe,  label: '99.9% uptime SLA' },
              { Icon: HeadphonesIcon, label: 'Email support' },
            ].map(({ Icon, label }, i) => (
              <Reveal key={label} delay={i * 0.05}>
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex w-10 h-10 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-tl-indigo" />
                  </span>
                  <span className="text-[12.5px] font-semibold text-tl-text-primary">{label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ───────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold tracking-tight text-tl-text-primary leading-tight">
                Compare plans
              </h2>
              <p className="mt-3 text-[15px] text-tl-text-secondary max-w-xl mx-auto">
                Every capability, side by side.
              </p>
            </div>
          </Reveal>

          <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface overflow-hidden shadow-sm">
            {/* Sticky header */}
            <div className="grid grid-cols-12 gap-3 px-5 sm:px-7 py-4 border-b border-tl-border-default bg-tl-bg-elevated/50 text-[10.5px] uppercase tracking-[0.16em] font-bold text-tl-text-tertiary">
              <span className="col-span-6">Capability</span>
              <span className="col-span-2 text-center">Starter</span>
              <span className="col-span-2 text-center text-tl-indigo">Growth</span>
              <span className="col-span-2 text-center">Enterprise</span>
            </div>

            {COMPARE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="px-5 sm:px-7 py-3 border-b border-tl-border-subtle bg-tl-bg-elevated/30">
                  <p className="text-[10.5px] uppercase tracking-[0.16em] font-bold text-tl-text-secondary">
                    {group.title}
                  </p>
                </div>
                <ul>
                  {group.rows.map((row) => (
                    <li
                      key={row.feature}
                      className="grid grid-cols-12 gap-3 items-center px-5 sm:px-7 py-3.5 border-b border-tl-border-subtle last:border-0 hover:bg-tl-bg-elevated/30 transition-colors"
                    >
                      <span className="col-span-6 flex items-center gap-2.5 text-[13.5px] text-tl-text-primary">
                        {row.Icon && <row.Icon className="w-4 h-4 text-tl-text-secondary shrink-0" />}
                        {row.feature}
                      </span>
                      <span className="col-span-2 text-center"><CompareCell value={row.starter} /></span>
                      <span className="col-span-2 text-center bg-tl-indigo/[0.04] -mx-1 py-1 rounded">
                        <CompareCell value={row.growth} highlight />
                      </span>
                      <span className="col-span-2 text-center"><CompareCell value={row.enterprise} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI strip ──────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24 border-y border-tl-border-default bg-tl-bg-surface/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold tracking-tight text-tl-text-primary leading-tight">
                One saved hire pays for the year.
              </h2>
              <p className="mt-3 text-[15px] text-tl-text-secondary max-w-xl mx-auto">
                Real outcome benchmarks across our pilot cohort.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { v: '$30K',   l: 'Cost of one bad hire (industry avg.)' },
              { v: '52→18',  l: 'Days to hire (cohort avg.)' },
              { v: '94%',    l: 'Match accuracy on offers extended' },
              { v: '12×',    l: 'ROI vs. the Growth plan, year one' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.05}>
                <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6">
                  <p className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-bold tabular-nums text-tl-text-primary tracking-tight leading-none mb-2.5">
                    {s.v}
                  </p>
                  <p className="text-[12px] text-tl-text-secondary leading-snug max-w-[20ch]">
                    {s.l}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold tracking-tight text-tl-text-primary leading-tight">
                Frequently asked
              </h2>
              <p className="mt-3 text-[15px] text-tl-text-secondary">
                Still have questions?{' '}
                <Link href="/contact" className="text-tl-indigo hover:underline font-semibold">
                  Talk to sales →
                </Link>
              </p>
            </div>
          </Reveal>
          <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface px-5 sm:px-7 shadow-sm">
            {FAQ.map((item, i) => (
              <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20 border-t border-tl-border-default">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold tracking-tight text-tl-text-primary leading-tight">
              Try every feature for 14 days
            </h2>
            <p className="mt-3 text-[15px] text-tl-text-secondary max-w-xl mx-auto">
              No credit card. No success fees. Cancel any time.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register?role=company"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-indigo text-white text-[14.5px] font-semibold hover:bg-tl-indigo/90 transition-colors shadow-md shadow-tl-indigo/30"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[14.5px] font-semibold hover:border-tl-indigo/30 hover:bg-tl-bg-elevated transition-colors"
              >
                Talk to sales
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
