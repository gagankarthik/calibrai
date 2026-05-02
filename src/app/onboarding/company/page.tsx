'use client'

import { useState, useEffect } from 'react'
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
  'Engineering', 'Design', 'Product', 'Marketing',
  'Sales', 'Operations', 'Finance', 'HR', 'Legal',
]

const STEP_LABELS = ['Company Profile', 'Team & Culture', 'All Done!']

/* ── Animation variants ── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

/* ── Field wrapper ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-tl-text-secondary">{label}</label>
      {children}
    </div>
  )
}

/* ── Progress Bar ── */

function GoldProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100)

  return (
    <div className="w-full max-w-lg mx-auto mb-5 relative z-10">
      <div className="flex justify-between mb-2">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className={cn(
              'font-mono text-[10px] font-bold transition-colors',
              step === i + 1 ? 'text-tl-gold' : step > i + 1 ? 'text-tl-text-secondary' : 'text-tl-text-muted'
            )}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={cn(
              'text-[10px] transition-colors hidden sm:block',
              step === i + 1 ? 'text-tl-text-primary font-medium' : step > i + 1 ? 'text-tl-text-secondary' : 'text-tl-text-muted'
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
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

  // Auth guard + pre-fill company name from registration
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) { router.replace('/auth/login?role=company&redirect=/onboarding/company'); return null }
        return r.json()
      })
      .then((user: { companyName?: string } | null) => {
        if (!user) return
        // Pre-fill the company name that was entered at registration
        if (user.companyName) setForm(prev => ({ ...prev, companyName: user.companyName! }))
        // Also try the profile API in case it has a more up-to-date name
        return fetch('/api/company/profile').then(r => r.ok ? r.json() : null)
      })
      .then((profile: { name?: string } | null | undefined) => {
        if (profile?.name) setForm(prev => ({ ...prev, companyName: profile.name! }))
      })
      .catch(() => router.replace('/auth/login?role=company&redirect=/onboarding/company'))
  }, [router])

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

  const saveProfile = async (data: FormData) => {
    try {
      await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.companyName,
          industry: data.industry,
          size: data.companySize,
          website: data.website,
          hq: data.headquarters,
          description: data.culture,
        }),
      })
    } catch {
      // Non-fatal — user can update from Settings
    }
  }

  const goNext = () => {
    setDirection(1)
    const nextStep = Math.min(step + 1, totalSteps)
    // Save profile data when completing Step 2 → Step 3
    if (step === 2) saveProfile(form)
    setStep(nextStep)
  }
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)) }

  return (
    <div className="min-h-screen bg-tl-bg-base flex flex-col items-center justify-start px-4 py-6 sm:py-10 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-tl-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-tl-teal/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tl-gold/30 to-transparent" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-5 relative z-10">
        <span className="w-2 h-2 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
        <span className="font-display font-bold text-lg gradient-text">TalentBridge</span>
      </Link>

      {/* Progress bar */}
      <GoldProgressBar step={step} total={totalSteps} />

      {/* Card */}
      <div className="w-full max-w-lg relative z-10">
        <div className="tl-card overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-5 sm:p-6"
            >
              {step === 1 && <Step1 form={form} update={update} onNext={goNext} />}
              {step === 2 && <Step2 form={form} update={update} toggleRole={toggleRole} onNext={goNext} onBack={goBack} />}
              {step === 3 && <Step3 form={form} onDashboard={() => router.push('/company/dashboard')} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ── Step 1: Company Profile ── */

function Step1({
  form, update, onNext,
}: {
  form: FormData
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void
  onNext: () => void
}) {
  const canContinue = !!(form.companyName && form.industry && form.companySize)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-tl-gold" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-tl-text-primary leading-tight">Company Profile</h2>
          <p className="text-xs text-tl-text-secondary">Tell us about your organization</p>
        </div>
      </div>

      <div className="space-y-3">
        <Field label="Company name *">
          <input
            className="input-field"
            placeholder="Acme Corp"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
          />
          <p className="text-[11px] text-tl-text-secondary mt-1">
            From your registration — feel free to update it
          </p>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Industry *">
            <Select value={form.industry} onValueChange={(v) => update('industry', v)}>
              <SelectTrigger className={cn('input-field flex items-center justify-between')}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
                {['Technology','Finance','Healthcare','E-commerce','Media & Entertainment','Education','Manufacturing','Consulting','Other'].map((i) => (
                  <SelectItem key={i} value={i} className="text-tl-text-primary hover:text-tl-gold">{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Company size *">
            <Select value={form.companySize} onValueChange={(v) => update('companySize', v)}>
              <SelectTrigger className={cn('input-field flex items-center justify-between')}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
                {['1–10','11–50','51–200','201–1,000','1,000+'].map((s) => (
                  <SelectItem key={s} value={s} className="text-tl-text-primary hover:text-tl-gold">{s} employees</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Website">
            <input
              className="input-field"
              placeholder="https://acme.com"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </Field>
          <Field label="Headquarters">
            <input
              className="input-field"
              placeholder="San Francisco, CA"
              value={form.headquarters}
              onChange={(e) => update('headquarters', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Company logo">
          <div className="flex items-center justify-center w-full h-14 rounded-xl border-2 border-dashed border-tl-gold/30 hover:border-tl-gold/60 hover:bg-tl-gold/5 transition-all cursor-pointer group">
            <div className="flex items-center gap-2 text-tl-text-secondary group-hover:text-tl-gold transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Click to upload logo</span>
              <span className="text-[10px] text-tl-text-muted">PNG / JPG · 2 MB</span>
            </div>
          </div>
        </Field>
      </div>

      <div className="flex justify-end pt-1">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-gold flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ── Step 2: Team & Culture ── */

function Step2({
  form, update, toggleRole, onNext, onBack,
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
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 text-tl-teal" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-tl-text-primary leading-tight">Team & Culture</h2>
          <p className="text-xs text-tl-text-secondary">What makes your company great?</p>
        </div>
      </div>

      <div className="space-y-3">
        <Field label="What makes your company stand out?">
          <textarea
            className={cn('input-field min-h-[72px] resize-none leading-relaxed text-sm')}
            placeholder={`• Fast-moving, trust our engineers\n• Remote-first, great async culture\n• Competitive pay and equity`}
            value={form.culture}
            onChange={(e) => update('culture', e.target.value)}
          />
        </Field>

        <Field label="Remote policy">
          <div className="grid grid-cols-3 gap-2">
            {remotePolicies.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => update('remotePolicy', p.value)}
                className={cn(
                  'tl-card flex flex-col items-start gap-0.5 px-2.5 py-2 text-left transition-all duration-200',
                  form.remotePolicy === p.value
                    ? 'border-tl-gold bg-tl-gold/5 shadow-gold'
                    : 'hover:border-tl-border-gold'
                )}
              >
                <span className={cn(
                  'text-xs font-semibold transition-colors',
                  form.remotePolicy === p.value ? 'text-tl-gold' : 'text-tl-text-secondary'
                )}>
                  {p.label}
                </span>
                <span className="text-[10px] text-tl-text-muted">{p.desc}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Hiring frequency">
          <Select value={form.hiringFrequency} onValueChange={(v) => update('hiringFrequency', v)}>
            <SelectTrigger className={cn('input-field flex items-center justify-between')}>
              <SelectValue placeholder="How often do you hire?" />
            </SelectTrigger>
            <SelectContent className="bg-tl-bg-elevated border-tl-border-default">
              {['1–5 hires/month','5–20 hires/month','20+ hires/month'].map((h) => (
                <SelectItem key={h} value={h} className="text-tl-text-primary hover:text-tl-gold">{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Typical roles you hire for">
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {ROLE_PILLS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200',
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

      <div className="flex justify-between pt-1">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={onNext}
          className="btn-gold flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ── Step 3: Success ── */

function Step3({ form, onDashboard }: { form: FormData; onDashboard: () => void }) {
  const nextSteps = [
    {
      icon: Briefcase,
      title: 'Post Your First Job',
      desc: 'Publish to top job boards',
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
    <div className="space-y-5">
      {/* Animated checkmark */}
      <div className="flex flex-col items-center text-center gap-3 pt-1">
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-tl-gold/20 blur-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.4 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.div
            className="relative w-16 h-16 rounded-full bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <svg width="44" height="44" viewBox="0 0 64 64" fill="none" className="overflow-visible" aria-hidden="true">
              <motion.circle
                cx="32" cy="32" r="28"
                stroke="#C9A84C" strokeWidth="2" fill="none" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
              />
              <motion.path
                d="M20 32l9 9 15-18"
                stroke="#E8C96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.8 }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="font-display text-xl font-bold gradient-text">Your workspace is ready!</h2>
          <p className="text-xs text-tl-text-secondary mt-0.5">Here&apos;s a summary of what you&apos;ve configured.</p>
        </motion.div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="tl-card-elevated p-3.5 space-y-2.5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-tl-text-secondary">Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Company', value: form.companyName || '—' },
            { label: 'Industry', value: form.industry || '—' },
            {
              label: 'Culture',
              value: form.remotePolicy
                ? form.remotePolicy === 'remote' ? 'Remote-first'
                  : form.remotePolicy === 'hybrid' ? 'Hybrid' : 'Office-first'
                : '—',
            },
          ].map((item) => (
            <div key={item.label} className="space-y-0.5 min-w-0">
              <p className="text-[10px] text-tl-text-secondary">{item.label}</p>
              <p className="text-xs font-medium text-tl-text-primary truncate">{item.value}</p>
            </div>
          ))}
        </div>
        {form.roles.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {form.roles.map((r) => (
              <span key={r} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-tl-gold/10 border border-tl-gold/25 text-[10px] text-tl-gold font-medium">
                <Check className="w-2 h-2" /> {r}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Next-step cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="grid grid-cols-3 gap-2"
      >
        {nextSteps.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group tl-card-elevated flex flex-col gap-2 p-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover',
                item.border
              )}
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', item.iconBg)}>
                <Icon className={cn('w-3.5 h-3.5', item.iconColor)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-tl-text-primary leading-tight">{item.title}</p>
                <p className="text-[10px] text-tl-text-secondary mt-0.5 leading-snug">{item.desc}</p>
              </div>
              <ArrowRight className={cn(
                'w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mt-auto',
                item.iconColor
              )} />
            </Link>
          )
        })}
      </motion.div>

      {/* Dashboard CTA */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center"
      >
        <button
          onClick={onDashboard}
          className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
