'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { pricingPlans } from '@/lib/data'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Building2,
  Users,
  DollarSign,
  Globe,
  Lock,
  HeadphonesIcon,
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Star,
  Calculator,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BillingPeriod = 'monthly' | 'annual'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const faqItems = [
  {
    q: "What's included in the free trial?",
    a: "Every plan starts with a 14-day free trial with full access to all features. No credit card required. You can post jobs, access AI matching, and see real candidate data during your trial.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade, downgrade, or cancel at any time. When you upgrade, you're billed the pro-rated difference. When you downgrade, you keep the higher plan until the end of the billing period.",
  },
  {
    q: "Do you charge per user or per hire?",
    a: "We charge a flat monthly fee per company, not per user or per hire. The Growth plan includes up to 10 team members; Enterprise is unlimited. We never charge success fees.",
  },
  {
    q: "How does the AI matching work?",
    a: "Our AI uses semantic understanding — not keyword matching — to evaluate candidate fit across skills, experience, work preferences, and cultural signals. Match scores are updated in real time as candidates complete assessments.",
  },
  {
    q: "What ATS integrations are available?",
    a: "Growth plans include native integrations with Greenhouse and Lever. Enterprise plans add Workday, BambooHR, and any custom ATS via our API. We can typically complete custom integrations in 2-4 weeks.",
  },
  {
    q: "How is our data secured?",
    a: "TalentBridge is SOC2 Type II certified. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Enterprise plans support custom data residency in the EU or US, and we offer a dedicated security review process.",
  },
]

const featureRows: {
  feature: string
  icon: React.ReactNode
  starter: boolean | string
  growth: boolean | string
  enterprise: boolean | string
}[] = [
  { feature: 'Active Job Postings', icon: <Zap className="w-4 h-4" />, starter: '5', growth: '20', enterprise: 'Unlimited' },
  { feature: 'Team Members', icon: <Users className="w-4 h-4" />, starter: '3', growth: '10', enterprise: 'Unlimited' },
  { feature: 'AI Match Credits / Month', icon: <Sparkles className="w-4 h-4" />, starter: '100', growth: '500', enterprise: 'Unlimited' },
  { feature: 'AI Candidate Matching', icon: <CheckCircle2 className="w-4 h-4" />, starter: true, growth: true, enterprise: true },
  { feature: 'Pipeline Management', icon: <BarChart3 className="w-4 h-4" />, starter: 'Basic', growth: 'Full Kanban', enterprise: 'Full + Automation' },
  { feature: 'Skills Assessments', icon: <CheckCircle2 className="w-4 h-4" />, starter: false, growth: true, enterprise: true },
  { feature: 'Bias Detection Reports', icon: <Shield className="w-4 h-4" />, starter: false, growth: true, enterprise: true },
  { feature: 'ATS Integrations', icon: <Globe className="w-4 h-4" />, starter: false, growth: 'Greenhouse, Lever', enterprise: 'All + Custom API' },
  { feature: 'Salary Intelligence', icon: <DollarSign className="w-4 h-4" />, starter: false, growth: true, enterprise: true },
  { feature: 'API Access', icon: <Globe className="w-4 h-4" />, starter: false, growth: false, enterprise: true },
  { feature: 'SSO / SAML', icon: <Lock className="w-4 h-4" />, starter: false, growth: false, enterprise: true },
  { feature: 'Dedicated CSM', icon: <HeadphonesIcon className="w-4 h-4" />, starter: false, growth: false, enterprise: true },
]

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-muted-foreground/30" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-center">
      <span className="text-xs text-foreground/80 text-center">{value}</span>
    </div>
  )
}

// ─── ROI SLIDER ──────────────────────────────────────────────────────────────

function RoiSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  accent = 'blue',
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format: (v: number) => string
  accent?: 'blue' | 'purple' | 'cyan' | 'emerald'
}) {
  const pct = ((value - min) / (max - min)) * 100

  const accentMap = {
    blue: { track: 'bg-blue-500', thumb: 'accent-blue-500' },
    purple: { track: 'bg-purple-500', thumb: 'accent-purple-500' },
    cyan: { track: 'bg-cyan-500', thumb: 'accent-cyan-500' },
    emerald: { track: 'bg-emerald-500', thumb: 'accent-emerald-500' },
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span className={`text-sm font-bold ${
          accent === 'blue' ? 'text-blue-400' :
          accent === 'purple' ? 'text-purple-400' :
          accent === 'cyan' ? 'text-cyan-400' :
          'text-emerald-400'
        } bg-white/5 px-3 py-1 rounded-full border border-white/10 tabular-nums`}>
          {format(value)}
        </span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${accentMap[accent].track} rounded-full transition-all duration-150`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer -mt-4 relative z-10 ${accentMap[accent].thumb}`}
        style={{
          background: 'transparent',
        }}
      />
    </div>
  )
}

// ─── ROI CALCULATOR ──────────────────────────────────────────────────────────

function RoiCalculator() {
  const [monthlyHires, setMonthlyHires] = useState(5)
  const [costPerHire, setCostPerHire] = useState(4700)
  const [timeToHire, setTimeToHire] = useState(44)
  const [avgSalary, setAvgSalary] = useState(120000)

  // Calculations
  const annualAgencySavings = Math.max(0, (costPerHire - 3200) * monthlyHires * 12)
  const timeSavedDays = Math.max(0, (timeToHire - 18) * monthlyHires * 12)
  const dailyRate = avgSalary / 260
  const productivityGain = Math.round(timeSavedDays * dailyRate)
  const totalRoi = annualAgencySavings + productivityGain

  // Days to pay off Growth plan ($1,999/mo annual)
  const annualPlanCost = 1999 * 12
  const dailySavings = totalRoi / 365
  const payoffDays = dailySavings > 0 ? Math.ceil(annualPlanCost / dailySavings) : 0

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n.toLocaleString()}`

  const metrics = [
    {
      label: 'Annual savings on agency fees',
      value: fmt(annualAgencySavings),
      icon: DollarSign,
      desc: `vs. $${costPerHire.toLocaleString()} cost per hire`,
      color: 'emerald',
    },
    {
      label: 'Time saved per year',
      value: `${timeSavedDays.toLocaleString()} days`,
      icon: Clock,
      desc: `${timeToHire - 18} fewer days per hire × ${monthlyHires * 12} hires`,
      color: 'blue',
    },
    {
      label: 'Productivity gain value',
      value: fmt(productivityGain),
      icon: TrendingUp,
      desc: `At $${Math.round(dailyRate).toLocaleString()} daily salary rate`,
      color: 'purple',
    },
    {
      label: 'Total 12-month ROI',
      value: fmt(totalRoi),
      icon: Award,
      desc: 'Agency savings + productivity gain combined',
      color: 'cyan',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Sliders */}
      <div className="grid md:grid-cols-2 gap-8">
        <RoiSlider
          label="Monthly hires"
          value={monthlyHires}
          min={1}
          max={50}
          step={1}
          onChange={setMonthlyHires}
          format={(v) => `${v} hires/mo`}
          accent="blue"
        />
        <RoiSlider
          label="Current cost per hire"
          value={costPerHire}
          min={1000}
          max={20000}
          step={100}
          onChange={setCostPerHire}
          format={(v) => `$${v.toLocaleString()}`}
          accent="purple"
        />
        <RoiSlider
          label="Current time to hire (days)"
          value={timeToHire}
          min={10}
          max={90}
          step={1}
          onChange={setTimeToHire}
          format={(v) => `${v} days`}
          accent="cyan"
        />
        <RoiSlider
          label="Average salary of hires"
          value={avgSalary}
          min={50000}
          max={300000}
          step={5000}
          onChange={setAvgSalary}
          format={(v) => `$${(v / 1000).toFixed(0)}K`}
          accent="emerald"
        />
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const colorMap = {
            emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: 'text-emerald-400', text: 'text-emerald-400' },
            blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: 'text-blue-400', text: 'text-blue-400' },
            purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/25', icon: 'text-purple-400', text: 'text-purple-400' },
            cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', icon: 'text-cyan-400', text: 'text-cyan-400' },
          }
          const c = colorMap[m.color as keyof typeof colorMap]

          return (
            <motion.div
              key={m.label}
              layout
              className={`glass-card p-5 ${c.border} border relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 ${c.bg} rounded-full blur-2xl pointer-events-none`} />
              <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                <m.icon className={`w-4 h-4 ${c.icon}`} />
              </div>
              <motion.div
                key={m.value}
                initial={{ scale: 0.95, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={`text-2xl font-bold ${c.text} tabular-nums mb-1`}
              >
                {m.value}
              </motion.div>
              <p className="text-[10px] font-semibold text-foreground/80 leading-tight mb-1">{m.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Payoff callout */}
      {payoffDays > 0 && (
        <motion.div
          layout
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-purple-500/10 border border-emerald-500/25"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Your plan pays for itself in{' '}
                <span className="text-emerald-400">{payoffDays} days</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Based on the Growth plan at $1,999/mo billed annually
              </p>
            </div>
          </div>
          <Button
            size="sm"
            asChild
            className="group bg-gradient-to-r from-emerald-600 to-emerald-500 border-0 shadow-glow-cyan shrink-0"
          >
            <Link href="/auth/register?role=company">
              Start capturing this ROI
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>('annual')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const getPrice = (plan: (typeof pricingPlans)[number]) =>
    billing === 'annual' ? plan.annualPrice : plan.monthlyPrice

  const savings = Math.round((1 - pricingPlans[1].annualPrice / pricingPlans[1].monthlyPrice) * 100)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="hero-glow bg-blue-500 opacity-15" style={{ top: '-10%', left: '20%' }} />
        <div className="hero-glow bg-purple-500 opacity-12" style={{ top: '0%', right: '20%' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-eyebrow inline-flex mx-auto"
          >
            <DollarSign className="w-4 h-4" />
            Simple, transparent pricing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-foreground leading-tight"
          >
            Start free.{' '}
            <span className="gradient-text">Scale as you grow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Cancel anytime. Average customer saves{' '}
            <span className="text-foreground font-semibold">$38,000/year</span>{' '}
            vs. traditional recruiting agencies.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-2"
          >
            <span className={cn('text-sm font-medium', billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground')}>
              Monthly
            </span>
            <button
              onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
              className={cn(
                'relative w-14 h-7 rounded-full border transition-all duration-300',
                billing === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500'
                  : 'bg-white/10 border-border'
              )}
              aria-label="Toggle billing period"
            >
              <div className={cn(
                'absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all duration-300',
                billing === 'annual' ? 'left-8' : 'left-1'
              )} />
            </button>
            <div className="flex items-center gap-2">
              <span className={cn('text-sm font-medium', billing === 'annual' ? 'text-foreground' : 'text-muted-foreground')}>
                Annual
              </span>
              <span className={cn(
                'px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all duration-200',
                billing === 'annual'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/60'
              )}>
                Save {savings}%
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {pricingPlans.map((plan, i) => {
            const isGrowth = plan.highlighted
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  'relative flex flex-col rounded-2xl transition-all duration-300',
                  isGrowth
                    ? 'gradient-border shadow-2xl shadow-blue-500/15 scale-[1.02]'
                    : 'glass-card hover:border-white/[0.15]'
                )}
              >
                {isGrowth && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30">
                      <Star className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">Most Popular</span>
                    </div>
                  </div>
                )}
                {plan.badge && !isGrowth && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-border text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className={cn('p-7 flex flex-col gap-6', isGrowth && 'pt-10')}>
                  {/* Plan header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        plan.id === 'starter' ? 'bg-blue-500/10' :
                        plan.id === 'growth' ? 'bg-purple-500/10' : 'bg-emerald-500/10'
                      )}>
                        {plan.id === 'starter' ? <Zap className="w-4 h-4 text-blue-400" /> :
                         plan.id === 'growth' ? <Users className="w-4 h-4 text-purple-400" /> :
                         <Building2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <h3 className={cn('text-xl font-bold', isGrowth ? 'gradient-text' : 'text-foreground')}>
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        ${getPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground text-sm mb-1.5">/month</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-emerald-400 mt-1">
                        Billed ${(getPrice(plan) * 12).toLocaleString()}/year — save ${((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString()}
                      </p>
                    )}
                    {billing === 'monthly' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ${plan.annualPrice.toLocaleString()}/mo if billed annually
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    size="lg"
                    className={cn(
                      'w-full gap-2 group',
                      isGrowth && 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 border-0'
                    )}
                    variant={plan.id === 'enterprise' ? 'outline' : 'default'}
                    asChild
                  >
                    <Link href="/auth/register?role=company">
                      {plan.id === 'enterprise' ? 'Talk to Sales' : 'Start Free Trial'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Separator />

                  {/* Features list */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          isGrowth ? 'bg-blue-500/20' : 'bg-emerald-500/10'
                        )}>
                          <Check className={cn('w-2.5 h-2.5', isGrowth ? 'text-blue-400' : 'text-emerald-400')} />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          All plans include a 14-day free trial · No credit card required · Cancel anytime
        </p>
      </section>

      {/* ── Feature Comparison Table ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <h2 className="text-3xl font-bold text-foreground">Full feature comparison</h2>
          <p className="text-muted-foreground">Everything you need to make the right decision for your team</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-4 border-b border-border bg-white/[0.02]">
            <div className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feature</span>
            </div>
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={cn('p-5 text-center', plan.highlighted && 'bg-blue-500/5')}>
                <p className={cn('text-sm font-bold', plan.highlighted ? 'gradient-text' : 'text-foreground')}>
                  {plan.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${getPrice(plan).toLocaleString()}/mo
                </p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {featureRows.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                'grid grid-cols-4 border-b border-border last:border-0 hover:bg-white/[0.015] transition-colors',
                i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
              )}
            >
              <div className="p-4 flex items-center gap-2.5">
                <span className="text-muted-foreground/50 shrink-0">{row.icon}</span>
                <span className="text-sm text-muted-foreground">{row.feature}</span>
              </div>
              <div className="p-4 flex items-center justify-center">
                <FeatureCell value={row.starter} />
              </div>
              <div className="p-4 flex items-center justify-center bg-blue-500/[0.025]">
                <FeatureCell value={row.growth} />
              </div>
              <div className="p-4 flex items-center justify-center">
                <FeatureCell value={row.enterprise} />
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ROI CALCULATOR SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden border-y border-border">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-background to-blue-950/15" />
        <div className="hero-glow bg-emerald-600 opacity-8" style={{ top: '10%', left: '15%' }} />
        <div className="hero-glow bg-blue-600 opacity-8" style={{ bottom: '10%', right: '10%' }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '35px 35px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
              <Calculator className="w-4 h-4" />
              ROI Calculator
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Calculate Your{' '}
              <span className="gradient-text">ROI</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Drag the sliders to match your hiring reality and see exactly how much TalentBridge saves you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="glass-card p-8 md:p-10 border-emerald-500/15"
          >
            <RoiCalculator />
          </motion.div>

          {/* How we calculate note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-border text-xs text-muted-foreground"
          >
            <p className="font-semibold text-foreground/70 mb-1.5">How we calculate this:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <p>Agency savings = (Current cost per hire – $3,200 TalentBridge cost) × monthly hires × 12</p>
              <p>Productivity gain = Time saved (days) × daily salary rate (annual salary ÷ 260 working days)</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ───────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <h2 className="text-3xl font-bold text-foreground">Frequently asked questions</h2>
          <p className="text-muted-foreground">Got more questions? We&apos;re happy to help.</p>
        </motion.div>

        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'glass-card overflow-hidden transition-all duration-300',
                openFaq === i ? 'border-white/[0.15]' : 'hover:border-white/[0.12]'
              )}
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left gap-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-semibold text-foreground">{item.q}</span>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                  openFaq === i ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-muted-foreground'
                )}>
                  {openFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <Separator className="mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">SOC2 Type II · GDPR Compliant · 99.9% Uptime SLA</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7 text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Still have questions?</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Our team is happy to walk you through the right plan for your hiring needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="w-full sm:w-auto gap-2 group" asChild>
                <Link href="#">
                  Talk to Sales
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="#">Read Documentation</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
              {['No credit card required', '14-day free trial', 'Cancel anytime'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
