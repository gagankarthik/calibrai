'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Zap,
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

/* ── Animation variants ── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

/* ── Field helper ── */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all'

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">
          Calibr<span className="gradient-text">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-xl relative z-10">
        {/* Progress bar */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
          {/* Step labels */}
          <div className="flex justify-between pt-1">
            {['Company Profile', 'Team & Culture', 'All Done!'].map((label, i) => (
              <span
                key={label}
                className={cn(
                  'text-xs transition-colors',
                  step === i + 1
                    ? 'text-primary font-medium'
                    : step > i + 1
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/40'
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
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
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Company Profile</h2>
          <p className="text-sm text-muted-foreground">Tell us about your organization</p>
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

        <div className="grid grid-cols-2 gap-4">
          <Field label="Industry">
            <Select value={form.industry} onValueChange={(v) => update('industry', v)}>
              <SelectTrigger className={cn(inputCls, 'flex items-center justify-between')}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
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
                  <SelectItem key={i} value={i}>
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
              <SelectContent>
                {['1–10', '11–50', '51–200', '201–1,000', '1,000+'].map((s) => (
                  <SelectItem key={s} value={s}>
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

        {/* Logo upload — visual only */}
        <Field label="Company logo">
          <div className="flex items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-xs font-medium">Click to upload logo</span>
              <span className="text-xs text-muted-foreground/60">PNG, JPG up to 2 MB</span>
            </div>
          </div>
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="gap-2"
          size="lg"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
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
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Team & Culture</h2>
          <p className="text-sm text-muted-foreground">What makes your company great?</p>
        </div>
      </div>

      <div className="space-y-5">
        <Field label="What makes your company stand out?">
          <textarea
            className={cn(inputCls, 'min-h-[100px] resize-none leading-relaxed')}
            placeholder="• We ship fast and trust our engineers&#10;• Remote-first with great async culture&#10;• Competitive pay and equity"
            value={form.culture}
            onChange={(e) => update('culture', e.target.value)}
          />
        </Field>

        <Field label="Remote policy">
          <div className="grid grid-cols-3 gap-3">
            {remotePolicies.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => update('remotePolicy', p.value)}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-xl border px-3 py-3 text-left transition-all duration-200',
                  form.remotePolicy === p.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    form.remotePolicy === p.value ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {p.label}
                </span>
                <span className="text-xs text-muted-foreground">{p.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Hiring frequency">
          <Select
            value={form.hiringFrequency}
            onValueChange={(v) => update('hiringFrequency', v)}
          >
            <SelectTrigger className={cn(inputCls, 'flex items-center justify-between')}>
              <SelectValue placeholder="How often do you hire?" />
            </SelectTrigger>
            <SelectContent>
              {['1–5 hires/month', '5–20 hires/month', '20+ hires/month'].map((h) => (
                <SelectItem key={h} value={h}>
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
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2" size="lg">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ── Step 3: Ready! ── */

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
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      icon: Users,
      title: 'Browse Talent Pool',
      desc: 'Explore 50k+ verified profiles',
      href: '/company/candidates',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      icon: Plug,
      title: 'Set Up Integrations',
      desc: 'Connect your existing tools',
      href: '/company/settings',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Animated checkmark */}
      <div className="flex flex-col items-center text-center gap-4 pt-2">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-primary/20 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="overflow-visible">
              <motion.circle
                cx="24"
                cy="24"
                r="22"
                stroke="url(#grad1)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
              />
              <motion.path
                d="M14 24l7 7 13-13"
                stroke="url(#grad2)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.7 }}
              />
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="grad2" x1="14" y1="17" x2="27" y2="31" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-1"
        >
          <h2 className="text-3xl font-bold gradient-text">Your workspace is ready!</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Here&apos;s a summary of what you&apos;ve configured.
          </p>
        </motion.div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="glass-card rounded-xl p-4 space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Company', value: form.companyName || '—' },
            { label: 'Industry', value: form.industry || '—' },
            { label: 'Culture', value: form.remotePolicy ? (form.remotePolicy === 'remote' ? 'Remote-first' : form.remotePolicy === 'hybrid' ? 'Hybrid' : 'Office-first') : '—' },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
            </div>
          ))}
        </div>
        {form.roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.roles.map((r) => (
              <span
                key={r}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary"
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
        className="grid grid-cols-3 gap-3"
      >
        {nextSteps.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex flex-col gap-2.5 rounded-xl border bg-gradient-to-br p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
                item.color
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  item.iconBg
                )}
              >
                <Icon className={cn('w-4 h-4', item.iconColor)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
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

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <Button onClick={onDashboard} size="lg" className="gap-2 px-8">
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  )
}
