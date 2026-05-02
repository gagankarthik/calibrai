'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Briefcase,
  Users,
  Plug,
  ArrowRight,
  Check,
} from 'lucide-react'

/* ── Types ── */

interface FormData {
  companyName: string
  industry: string
  companySize: string
  website: string
  headquarters: string
  culture: string
  remotePolicy: 'remote' | 'hybrid' | 'office' | ''
  hiringFrequency: string
  roles: string[]
}

const initialFormData: FormData = {
  companyName: '',
  industry: '',
  companySize: '',
  website: '',
  headquarters: '',
  culture: '',
  remotePolicy: '',
  hiringFrequency: '',
  roles: [],
}

const ROLE_PILLS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Operations',
  'Finance',
  'HR',
  'Legal',
]

const STEP_LABELS = ['Company Profile', 'Team & Culture', 'All Done!']

/* ── Animation variants ── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

/* ── Input class ── */

const inputCls =
  'input-field'

/* ── Field wrapper ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-tl-text-primary">{label}</label>
      {children}
    </div>
  )
}

/* ── Gold Progress Bar ── */

function GoldProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100)

  return (
    <div className="w-full max-w-xl mx-auto mb-8 relative z-10">
      {/* Step numbers */}
      <div className="flex justify-between mb-3">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                'font-mono text-xs font-bold transition-colors',
                step === i + 1
                  ? 'text-tl-gold'
                  : step > i + 1
                  ? 'text-tl-text-secondary'
                  : 'text-tl-text-muted'
              )}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'text-xs transition-colors',
                step === i + 1
                  ? 'text-tl-text-primary font-medium'
                  : step > i + 1
                  ? 'text-tl-text-secondary'
                  : 'text-tl-text-muted'
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar track */}
      <div className="progress-gold">
        <motion.div
          className="progress-gold-fill"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

/* ── Main component ── */

export default function CompanyOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<FormData>(initialFormData)

  const totalSteps = 3

  const update = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }))
  }

  const goNext = () => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
  }

  return (
    <div className="min-h-screen bg-tl-bg-base flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-tl-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-tl-teal/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tl-gold/30 to-transparent" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 relative z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
        <span className="font-display font-bold text-xl gradient-text">TalentBridge</span>
      </Link>

      {/* Gold progress bar */}
      <GoldProgressBar step={step} total={totalSteps} />

      {/* Card */}
      <div className="w-full max-w-xl relative z-10">
        <div className="tl-card overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="p-8"
            >
              {step === 1 && (
                <Step1 form={form} update={update} onNext={goNext} />
              )}
              {step === 2 && (
                <Step2
                  form={form}
                  update={update}
                  toggleRole={toggleRole}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {step === 3 && (
                <Step3 form={form} onDashboard={() => router.push('/company/dashboard')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── Step 1: Company Profile ── */

function Step1({
  form,
  update,
  onNext,
}: {
  form: FormData
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  onNext: () => void
}) {
  const canContinue = !!(form.companyName && form.industry && form.companySize)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-tl-gold" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-tl-text-primary">Company Profile</h2>
          <p className="text-sm text-tl-text-secondary">Tell us about your organization</p>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Company name">
          <input
            className={inputCls}
            placeholder="Acme Corp"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Industry">
            <Select value={form.industry} onValueChange={(v) => update('industry', v)}>
              <SelectTrigger className={cn(inputCls, 'flex items-center justify-between')}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
                {[
                  'Technology',
                  'Finance',
                  'Healthcare',
                  'E-commerce',
                  'Media & Entertainment',
                  'Education',
                  'Manufacturing',
                  'Consulting',
                  'Other',
                ].map((i) => (
                  <SelectItem key={i} value={i} className="text-tl-text-primary hover:text-tl-gold">
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Company size">
            <Select value={form.companySize} onValueChange={(v) => update('companySize', v)}>
              <SelectTrigger className={cn(inputCls, 'flex items-center justify-between')}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
                {['1–10', '11–50', '51–200', '201–1,000', '1,000+'].map((s) => (
                  <SelectItem key={s} value={s} className="text-tl-text-primary hover:text-tl-gold">
                    {s} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Website URL">
          <input
            className={inputCls}
            placeholder="https://acme.com"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
          />
        </Field>

        <Field label="Headquarters location">
          <input
            className={inputCls}
            placeholder="San Francisco, CA"
            value={form.headquarters}
            onChange={(e) => update('headquarters', e.target.value)}
          />
        </Field>

        {/* Logo upload */}
        <Field label="Company logo">
          <div className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-tl-gold/30 hover:border-tl-gold/60 hover:bg-tl-gold/5 transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center gap-1.5 text-tl-text-secondary group-hover:text-tl-gold transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Click to upload logo</span>
              <span className="text-xs text-tl-text-muted">PNG, JPG up to 2 MB</span>
            </div>
          </div>
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ── Step 2: Team & Culture ── */

function Step2({
  form,
  update,
  toggleRole,
  onNext,
  onBack,
}: {
  form: FormData
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  toggleRole: (role: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const remotePolicies: { value: 'remote' | 'hybrid' | 'office'; label: string; desc: string }[] = [
    { value: 'remote', label: 'Remote-first', desc: 'Work from anywhere' },
    { value: 'hybrid', label: 'Hybrid', desc: 'Flexible mix' },
    { value: 'office', label: 'Office-first', desc: 'In-person culture' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-tl-teal" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-tl-text-primary">Team & Culture</h2>
          <p className="text-sm text-tl-text-secondary">What makes your company great?</p>
        </div>
      </div>

      <div className="space-y-5">
        <Field label="What makes your company stand out?">
          <textarea
            className={cn(inputCls, 'min-h-[100px] resize-none leading-relaxed')}
            placeholder={`• We ship fast and trust our engineers\n• Remote-first with great async culture\n• Competitive pay and equity`}
            value={form.culture}
            onChange={(e) => update('culture', e.target.value)}
          />
        </Field>

        <Field label="Remote policy">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {remotePolicies.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => update('remotePolicy', p.value)}
                className={cn(
                  'tl-card flex flex-col items-start gap-0.5 px-3 py-3 text-left transition-all duration-200',
                  form.remotePolicy === p.value
                    ? 'border-tl-gold bg-tl-gold/5 shadow-gold'
                    : 'hover:border-tl-border-gold'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    form.remotePolicy === p.value ? 'text-tl-gold' : 'text-tl-text-secondary'
                  )}
                >
                  {p.label}
                </span>
                <span className="text-xs text-tl-text-muted">{p.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Hiring frequency">
          <Select value={form.hiringFrequency} onValueChange={(v) => update('hiringFrequency', v)}>
            <SelectTrigger className={cn(inputCls, 'flex items-center justify-between')}>
              <SelectValue placeholder="How often do you hire?" />
            </SelectTrigger>
            <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
              {['1–5 hires/month', '5–20 hires/month', '20+ hires/month'].map((h) => (
                <SelectItem key={h} value={h} className="text-tl-text-primary hover:text-tl-gold">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Typical roles you hire for">
          <div className="flex flex-wrap gap-2 pt-1">
            {ROLE_PILLS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  form.roles.includes(role)
                    ? 'border-tl-gold bg-tl-gold/10 text-tl-gold shadow-gold'
                    : 'border-tl-border-default bg-tl-bg-elevated text-tl-text-secondary hover:border-tl-border-gold hover:text-tl-text-primary'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ── Step 3: Success ── */

function Step3({
  form,
  onDashboard,
}: {
  form: FormData
  onDashboard: () => void
}) {
  const nextSteps = [
    {
      icon: Briefcase,
      title: 'Post Your First Job',
      desc: 'Publish to top job boards instantly',
      href: '/company/jobs/new',
      border: 'border-tl-gold/20 hover:border-tl-gold/50',
      iconBg: 'bg-tl-gold/10 border border-tl-gold/20',
      iconColor: 'text-tl-gold',
    },
    {
      icon: Users,
      title: 'Browse Talent Pool',
      desc: 'Explore 50k+ verified profiles',
      href: '/company/candidates',
      border: 'border-tl-teal/20 hover:border-tl-teal/50',
      iconBg: 'bg-tl-teal/10 border border-tl-teal/20',
      iconColor: 'text-tl-teal',
    },
    {
      icon: Plug,
      title: 'Set Up Integrations',
      desc: 'Connect your existing tools',
      href: '/company/settings',
      border: 'border-tl-border-default hover:border-tl-border-gold',
      iconBg: 'bg-tl-bg-base border border-tl-border-default',
      iconColor: 'text-tl-text-secondary',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Animated checkmark */}
      <div className="flex flex-col items-center text-center gap-5 pt-2">
        <div className="relative">
          {/* Outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-tl-gold/20 blur-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          {/* Circle */}
          <motion.div
            className="relative w-24 h-24 rounded-full bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="overflow-visible" aria-hidden="true">
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                stroke="#C9A84C"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
              />
              <motion.path
                d="M20 32l9 9 15-18"
                stroke="#E8C96A"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.8 }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-1"
        >
          <h2 className="font-display text-3xl font-bold gradient-text">
            Your workspace is ready!
          </h2>
          <p className="text-tl-text-secondary text-sm max-w-xs mx-auto">
            Here&apos;s a summary of what you&apos;ve configured.
          </p>
        </motion.div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="tl-card-elevated p-5 space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-tl-text-secondary">
          Summary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Company', value: form.companyName || '—' },
            { label: 'Industry', value: form.industry || '—' },
            {
              label: 'Culture',
              value: form.remotePolicy
                ? form.remotePolicy === 'remote'
                  ? 'Remote-first'
                  : form.remotePolicy === 'hybrid'
                  ? 'Hybrid'
                  : 'Office-first'
                : '—',
            },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-xs text-tl-text-secondary">{item.label}</p>
              <p className="text-sm font-medium text-tl-text-primary truncate">{item.value}</p>
            </div>
          ))}
        </div>
        {form.roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.roles.map((r) => (
              <span
                key={r}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-tl-gold/10 border border-tl-gold/25 text-xs text-tl-gold font-medium"
              >
                <Check className="w-2.5 h-2.5" /> {r}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Next-step cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {nextSteps.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group tl-card-elevated flex flex-col gap-3 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover',
                item.border
              )}
              style={{ border: undefined }}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', item.iconBg)}>
                <Icon className={cn('w-4 h-4', item.iconColor)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-tl-text-primary">{item.title}</p>
                <p className="text-xs text-tl-text-secondary mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight
                className={cn(
                  'w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200',
                  item.iconColor
                )}
              />
            </Link>
          )
        })}
      </motion.div>

      {/* Dashboard CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <button
          onClick={onDashboard}
          className="btn-gold flex items-center gap-2 px-8 py-3 rounded-xl font-semibold"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
