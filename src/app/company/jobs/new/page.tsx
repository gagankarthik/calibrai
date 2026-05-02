'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createJob } from '@/lib/api'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  X,
  Briefcase,
  MapPin,
  FileText,
  Eye,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Tag,
  Wifi,
  Building2,
  MonitorPlay,
} from 'lucide-react'

// ─── Schema ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  department: z.string().min(1, 'Please select a department'),
  jobType: z.string().min(1, 'Please select a job type'),
  workMode: z.string().min(1, 'Please select a work mode'),
  level: z.string().min(1, 'Please select an experience level'),
  location: z.string().min(2, 'Location is required for non-remote jobs'),
  currency: z.string().default('USD'),
  salaryMin: z.coerce.number().min(1, 'Enter minimum salary'),
  salaryMax: z.coerce.number().min(1, 'Enter maximum salary'),
})

const step2Schema = z.object({
  description: z.string().min(100, 'Description must be at least 100 characters'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance']
const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
]
const WORK_MODES = [
  { value: 'remote', label: 'Remote', icon: Wifi, desc: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', icon: MonitorPlay, desc: 'Mix of office & remote' },
  { value: 'onsite', label: 'On-site', icon: Building2, desc: 'Office based' },
]
const LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Staff' },
  { value: 'executive', label: 'Executive' },
]
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
const PRESET_BENEFITS = [
  { id: 'remote', label: 'Remote Work', emoji: '🌍' },
  { id: 'health', label: 'Health Insurance', emoji: '🏥' },
  { id: '401k', label: '401K Match', emoji: '💰' },
  { id: 'learning', label: 'Learning Budget', emoji: '📚' },
  { id: 'pto', label: 'Unlimited PTO', emoji: '🌴' },
  { id: 'equity', label: 'Equity', emoji: '📈' },
]

const STEPS = [
  { number: 1, title: 'Job Details', icon: Briefcase },
  { number: 2, title: 'Role Description', icon: FileText },
  { number: 3, title: 'Review & Publish', icon: Eye },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalaryDisplay(val: number): string {
  if (!val || isNaN(val)) return ''
  return val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostNewJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isPublishing, setIsPublishing] = useState(false)

  // Step 1
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      title: '',
      department: '',
      jobType: '',
      workMode: '',
      level: '',
      location: '',
      currency: 'USD',
      salaryMin: 0,
      salaryMax: 0,
    },
  })

  // Step 2
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { description: '' },
  })

  // Dynamic lists
  const [requirements, setRequirements] = useState<string[]>([''])
  const [niceToHave, setNiceToHave] = useState<string[]>([''])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])

  const step1Values = step1Form.watch()
  const description = step2Form.watch('description')

  // Skills
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim() && skills.length < 15) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,$/, '')
      if (skill && !skills.includes(skill)) setSkills((p) => [...p, skill])
      setSkillInput('')
    }
  }
  const removeSkill = (s: string) => setSkills((p) => p.filter((x) => x !== s))

  // Dynamic list helpers
  const updateItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list]; next[idx] = val; setList(next)
  }
  const addItem = (list: string[], setList: (v: string[]) => void) => setList([...list, ''])
  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx))

  const toggleBenefit = (id: string) =>
    setSelectedBenefits((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  // Navigation
  const goNext = async () => {
    if (currentStep === 1) {
      const valid = await step1Form.trigger()
      if (!valid) return
    }
    if (currentStep === 2) {
      const valid = await step2Form.trigger()
      if (!valid) return
    }
    setCurrentStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Preview helpers
  const workModeLabel = WORK_MODES.find((m) => m.value === step1Values.workMode)?.label ?? ''
  const levelLabel = LEVELS.find((l) => l.value === step1Values.level)?.label ?? ''
  const jobTypeLabel = JOB_TYPES.find((t) => t.value === step1Values.jobType)?.label ?? ''

  // Estimated applicants based on level
  const estApplicants = {
    entry: '300–500',
    mid: '200–350',
    senior: '80–150',
    lead: '40–80',
    executive: '20–50',
  }[step1Values.level] ?? '200–400'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Post New Job</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in the details to attract top candidates</p>
        </div>
        <button
          onClick={() => router.push('/company/jobs')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="glass-card p-5"
      >
        {/* Top progress line */}
        <div className="h-1.5 rounded-full bg-white/[0.06] mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.number
            const isDone = currentStep > step.number
            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold',
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white/[0.04] border-white/[0.12] text-muted-foreground'
                  )}>
                    {isDone ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    'text-xs font-medium mt-2 transition-colors',
                    isActive ? 'text-foreground' : isDone ? 'text-emerald-400' : 'text-muted-foreground'
                  )}>
                    {step.title}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full overflow-hidden bg-white/[0.08]">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: currentStep > step.number ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Step content */}
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Job Details ─────────────────────────────────────── */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Job Details</h2>
                <p className="text-xs text-muted-foreground">Basic information about the role</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">

              {/* Job Title */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <input
                  {...step1Form.register('title')}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                {step1Form.formState.errors.title && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Department <span className="text-red-400">*</span>
                </label>
                <select
                  value={step1Form.watch('department')}
                  onChange={(e) => step1Form.setValue('department', e.target.value, { shouldValidate: true })}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {step1Form.formState.errors.department && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.department.message}</p>
                )}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={step1Form.watch('jobType')}
                  onChange={(e) => step1Form.setValue('jobType', e.target.value, { shouldValidate: true })}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="">Select type</option>
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {step1Form.formState.errors.jobType && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.jobType.message}</p>
                )}
              </div>

              {/* Work Mode */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Work Mode <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {WORK_MODES.map((mode) => {
                    const selected = step1Form.watch('workMode') === mode.value
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => step1Form.setValue('workMode', mode.value, { shouldValidate: true })}
                        className={cn(
                          'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-medium transition-all duration-200',
                          selected
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                            : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                        )}
                      >
                        <mode.icon className="w-5 h-5" />
                        <span>{mode.label}</span>
                        <span className="text-[11px] font-normal opacity-70">{mode.desc}</span>
                      </button>
                    )
                  })}
                </div>
                {step1Form.formState.errors.workMode && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.workMode.message}</p>
                )}
              </div>

              {/* Experience Level */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Experience Level <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((lvl) => {
                    const selected = step1Form.watch('level') === lvl.value
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => step1Form.setValue('level', lvl.value, { shouldValidate: true })}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
                          selected
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                            : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                        )}
                      >
                        {lvl.label}
                      </button>
                    )
                  })}
                </div>
                {step1Form.formState.errors.level && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.level.message}</p>
                )}
              </div>

              {/* Location */}
              {step1Values.workMode !== 'remote' && (
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      {...step1Form.register('location')}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  {step1Form.formState.errors.location && (
                    <p className="text-xs text-red-400">{step1Form.formState.errors.location.message}</p>
                  )}
                </div>
              )}

              {/* Salary */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Salary Range <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={step1Form.watch('currency')}
                    onChange={(e) => step1Form.setValue('currency', e.target.value)}
                    className="w-20 shrink-0 bg-white/[0.05] border border-white/[0.1] rounded-xl px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    {...step1Form.register('salaryMin')}
                    type="number"
                    placeholder="Min e.g. 120000"
                    className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <span className="text-muted-foreground shrink-0">–</span>
                  <input
                    {...step1Form.register('salaryMax')}
                    type="number"
                    placeholder="Max e.g. 180000"
                    className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
                {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
                  <p className="text-xs text-emerald-400">
                    Range: {formatSalaryDisplay(step1Values.salaryMin)} – {formatSalaryDisplay(step1Values.salaryMax)} / year
                  </p>
                )}
                {(step1Form.formState.errors.salaryMin || step1Form.formState.errors.salaryMax) && (
                  <p className="text-xs text-red-400">Please enter a valid salary range</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Role Description ─────────────────────────────────── */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 space-y-7"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Role Description</h2>
                <p className="text-xs text-muted-foreground">Help candidates understand the opportunity</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <span className={cn('text-xs font-medium tabular-nums', description.length < 100 ? 'text-muted-foreground' : 'text-emerald-400')}>
                  {description.length} chars {description.length < 100 ? `(${100 - description.length} more needed)` : '✓'}
                </span>
              </div>
              <textarea
                {...step2Form.register('description')}
                placeholder="Describe the role, what you'll be working on, team structure, and what makes this an exciting opportunity..."
                rows={7}
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              />
              {step2Form.formState.errors.description && (
                <p className="text-xs text-red-400">{step2Form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Requirements</label>
              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-blue-400">{idx + 1}</span>
                    </div>
                    <input
                      value={req}
                      onChange={(e) => updateItem(requirements, setRequirements, idx, e.target.value)}
                      placeholder={`Requirement ${idx + 1}…`}
                      className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(requirements, setRequirements, idx)}
                      disabled={requirements.length === 1}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addItem(requirements, setRequirements)}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Requirement
              </button>
            </div>

            {/* Nice to Have */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Nice to Have</label>
              <div className="space-y-2">
                {niceToHave.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-purple-400">+</span>
                    </div>
                    <input
                      value={item}
                      onChange={(e) => updateItem(niceToHave, setNiceToHave, idx, e.target.value)}
                      placeholder={`Nice to have ${idx + 1}…`}
                      className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(niceToHave, setNiceToHave, idx)}
                      disabled={niceToHave.length === 1}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addItem(niceToHave, setNiceToHave)}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Nice to Have
              </button>
            </div>

            {/* Skills Tags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Required Skills</label>
                <span className="text-xs text-muted-foreground">{skills.length}/15 skills</span>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium">
                      <Tag className="w-3 h-3" />
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  disabled={skills.length >= 15}
                  placeholder="Type a skill and press Enter… (e.g. React, TypeScript)"
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all disabled:opacity-40"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Benefits</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_BENEFITS.map((b) => {
                  const on = selectedBenefits.includes(b.id)
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBenefit(b.id)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all duration-200',
                        on
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                      )}
                    >
                      <span className="text-base">{b.emoji}</span>
                      <span className="font-medium">{b.label}</span>
                      {on && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Review & Publish ──────────────────────────────────── */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Preview header */}
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Eye className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Preview & Review</h2>
                <p className="text-xs text-muted-foreground">This is how candidates will see your job posting</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live Preview</span>
              </div>
            </div>

            {/* Job preview card */}
            <div className="glass-card p-6 space-y-5 border-white/[0.12]">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {step1Values.title || <span className="text-muted-foreground italic">Job Title</span>}
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step1Values.department && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-muted-foreground">
                        {step1Values.department}
                      </span>
                    )}
                    {jobTypeLabel && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-muted-foreground">
                        {jobTypeLabel}
                      </span>
                    )}
                    {levelLabel && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-muted-foreground">
                        {levelLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 py-3 border-y border-border text-sm text-muted-foreground">
                {(step1Values.location || step1Values.workMode === 'remote') && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {step1Values.workMode === 'remote' ? 'Remote' : step1Values.location}
                  </span>
                )}
                {workModeLabel && (
                  <span className="flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" />
                    {workModeLabel}
                  </span>
                )}
                {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    {formatSalaryDisplay(step1Values.salaryMin)} – {formatSalaryDisplay(step1Values.salaryMax)} / yr
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Posted today
                </span>
              </div>

              {/* Description */}
              {description ? (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">About the Role</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-5">{description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No description added yet</p>
              )}

              {/* Requirements */}
              {requirements.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {requirements.filter(Boolean).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to have */}
              {niceToHave.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Nice to Have</h4>
                  <ul className="space-y-2">
                    {niceToHave.filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {selectedBenefits.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BENEFITS.filter((b) => selectedBenefits.includes(b.id)).map((b) => (
                      <span key={b.id} className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                        {b.emoji} {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Matching note */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/15 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">AI Matching Active</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Calibr will instantly match your role with{' '}
                    <span className="text-blue-400 font-medium">14,200+ qualified candidates</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Est. Daily Applicants', value: estApplicants, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Clock, label: 'Avg. Time to Fill', value: '28 days', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Sparkles, label: 'AI Match Quality', value: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 flex flex-col items-center gap-2 text-center">
                  <div className={cn('p-2 rounded-lg', stat.bg)}>
                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <div className={cn('text-base font-bold', stat.color)}>{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between pt-2"
      >
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                currentStep === s.number ? 'bg-blue-500 w-6' : currentStep > s.number ? 'bg-emerald-500 w-2' : 'bg-white/20 w-2'
              )}
            />
          ))}
        </div>

        {currentStep < 3 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const s1 = step1Form.getValues()
                const s2 = step2Form.getValues()
                setIsPublishing(true)
                try {
                  const result = await createJob({
                    title: s1.title,
                    department: s1.department,
                    type: s1.jobType as Parameters<typeof createJob>[0]['type'],
                    workMode: s1.workMode as Parameters<typeof createJob>[0]['workMode'],
                    level: s1.level as Parameters<typeof createJob>[0]['level'],
                    location: s1.location,
                    salaryMin: s1.salaryMin,
                    salaryMax: s1.salaryMax,
                    currency: s1.currency,
                    description: s2.description,
                    requirements: requirements.filter(Boolean),
                    niceToHave: niceToHave.filter(Boolean),
                    skills,
                    benefits: selectedBenefits,
                  })
                  if (result.error) throw new Error(result.error)
                  toast.success('Job saved as draft')
                  router.push('/company/jobs')
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to save draft')
                } finally {
                  setIsPublishing(false)
                }
              }}
              disabled={isPublishing}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              disabled={isPublishing}
              onClick={async () => {
                const s1 = step1Form.getValues()
                const s2 = step2Form.getValues()
                setIsPublishing(true)
                try {
                  const result = await createJob({
                    title: s1.title,
                    department: s1.department,
                    type: s1.jobType as Parameters<typeof createJob>[0]['type'],
                    workMode: s1.workMode as Parameters<typeof createJob>[0]['workMode'],
                    level: s1.level as Parameters<typeof createJob>[0]['level'],
                    location: s1.location,
                    salaryMin: s1.salaryMin,
                    salaryMax: s1.salaryMax,
                    currency: s1.currency,
                    description: s2.description,
                    requirements: requirements.filter(Boolean),
                    niceToHave: niceToHave.filter(Boolean),
                    skills,
                    benefits: selectedBenefits,
                  })
                  if (result.error) throw new Error(result.error)
                  toast.success('Job published! AI candidate discovery started in background.')
                  router.push('/company/jobs')
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to publish job')
                } finally {
                  setIsPublishing(false)
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isPublishing ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isPublishing ? 'Publishing…' : 'Publish Job'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
