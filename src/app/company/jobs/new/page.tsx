'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Wifi,
  Building2,
  MonitorSmartphone,
  FileText,
  Eye,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Tag,
} from 'lucide-react'
import { cn, formatSalary } from '@/lib/utils'

// ── Zod Schema ──────────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  department: z.string().min(1, 'Please select a department'),
  jobType: z.string().min(1, 'Please select a job type'),
  workMode: z.string().min(1, 'Please select a work mode'),
  level: z.string().min(1, 'Please select an experience level'),
  location: z.string().min(2, 'Location is required'),
  currency: z.string().default('USD'),
  salaryMin: z.coerce.number().min(0, 'Minimum salary is required'),
  salaryMax: z.coerce.number().min(0, 'Maximum salary is required'),
})

const step2Schema = z.object({
  description: z.string().min(100, 'Description must be at least 100 characters'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

// ── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Data', 'Marketing', 'Sales', 'Operations']
const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]
const WORK_MODES = [
  { value: 'remote', label: 'Remote', icon: <Wifi className="w-4 h-4" /> },
  { value: 'hybrid', label: 'Hybrid', icon: <MonitorSmartphone className="w-4 h-4" /> },
  { value: 'onsite', label: 'Onsite', icon: <Building2 className="w-4 h-4" /> },
]
const LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Staff' },
  { value: 'executive', label: 'Executive' },
]
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

const STEPS = [
  { number: 1, title: 'Job Details', icon: Briefcase },
  { number: 2, title: 'Role Description', icon: FileText },
  { number: 3, title: 'Review & Publish', icon: Eye },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PostNewJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 form
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

  // Step 2 form
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { description: '' },
  })

  // Dynamic lists
  const [requirements, setRequirements] = useState<string[]>([''])
  const [niceToHave, setNiceToHave] = useState<string[]>([''])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  // Step 1 values (for preview)
  const step1Values = step1Form.watch()
  const description = step2Form.watch('description')

  // Skill input handler
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,+$/, '')
      if (skill && !skills.includes(skill)) {
        setSkills((prev) => [...prev, skill])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill))

  // Dynamic list helpers
  const updateListItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list]
    next[idx] = val
    setList(next)
  }
  const addListItem = (list: string[], setList: (v: string[]) => void) => setList([...list, ''])
  const removeListItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx))

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
  }

  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))

  const handlePublish = () => {
    router.push('/company/jobs')
  }

  // Work mode label for preview
  const workModeLabel = WORK_MODES.find((m) => m.value === step1Values.workMode)?.label ?? ''
  const levelLabel = LEVELS.find((l) => l.value === step1Values.level)?.label ?? ''
  const jobTypeLabel = JOB_TYPES.find((t) => t.value === step1Values.jobType)?.label ?? ''

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
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
        <Button variant="ghost" size="sm" onClick={() => router.push('/company/jobs')} className="gap-1.5">
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Button>
      </motion.div>

      {/* Step Progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="glass-card p-4"
      >
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.number
            const isDone = currentStep > step.number
            return (
              <div key={step.number} className="flex items-center flex-1">
                {/* Step dot */}
                <div className="flex flex-col items-center flex-1">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm',
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : isActive
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-transparent text-white shadow-lg shadow-blue-500/25'
                          : 'bg-white/[0.04] border-white/[0.12] text-muted-foreground'
                      )}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 text-center">
                    <div
                      className={cn(
                        'text-xs font-medium transition-colors',
                        isActive ? 'text-foreground' : isDone ? 'text-emerald-400' : 'text-muted-foreground'
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mb-5 mx-2 rounded-full overflow-hidden bg-white/[0.08]">
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

      {/* Step Content */}
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
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Job Details</h2>
                <p className="text-xs text-muted-foreground">Basic information about the role</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Job Title */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Job Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  {...step1Form.register('title')}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="input-field"
                />
                {step1Form.formState.errors.title && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Department <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={step1Form.watch('department')}
                  onValueChange={(v) => step1Form.setValue('department', v, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.department && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.department.message}</p>
                )}
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Job Type <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={step1Form.watch('jobType')}
                  onValueChange={(v) => step1Form.setValue('jobType', v, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.jobType && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.jobType.message}</p>
                )}
              </div>

              {/* Work Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Work Mode <span className="text-red-400">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_MODES.map((mode) => {
                    const selected = step1Form.watch('workMode') === mode.value
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => step1Form.setValue('workMode', mode.value, { shouldValidate: true })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all duration-200',
                          selected
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                            : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
                        )}
                      >
                        {mode.icon}
                        {mode.label}
                      </button>
                    )
                  })}
                </div>
                {step1Form.formState.errors.workMode && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.workMode.message}</p>
                )}
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Experience Level <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={step1Form.watch('level')}
                  onValueChange={(v) => step1Form.setValue('level', v, { shouldValidate: true })}
                >
                  <SelectTrigger className="bg-white/[0.05] border-white/[0.1]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {step1Form.formState.errors.level && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.level.message}</p>
                )}
              </div>

              {/* Location */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Location <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    {...step1Form.register('location')}
                    placeholder="e.g. San Francisco, CA or Remote"
                    className="input-field pl-9"
                  />
                </div>
                {step1Form.formState.errors.location && (
                  <p className="text-xs text-red-400">{step1Form.formState.errors.location.message}</p>
                )}
              </div>

              {/* Salary Range */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Salary Range <span className="text-red-400">*</span>
                </Label>
                <div className="flex items-center gap-3">
                  {/* Currency */}
                  <Select
                    value={step1Form.watch('currency')}
                    onValueChange={(v) => step1Form.setValue('currency', v)}
                  >
                    <SelectTrigger className="w-24 shrink-0 bg-white/[0.05] border-white/[0.1]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Min */}
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...step1Form.register('salaryMin')}
                      type="number"
                      placeholder="Min (e.g. 120000)"
                      className="input-field pl-9"
                    />
                  </div>

                  <span className="text-muted-foreground text-sm shrink-0">–</span>

                  {/* Max */}
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...step1Form.register('salaryMax')}
                      type="number"
                      placeholder="Max (e.g. 180000)"
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                {(step1Form.formState.errors.salaryMin || step1Form.formState.errors.salaryMax) && (
                  <p className="text-xs text-red-400">Please enter a valid salary range</p>
                )}
                {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
                  <p className="text-xs text-emerald-400">
                    Showing as: {formatSalary(step1Values.salaryMin, step1Values.salaryMax)} / year
                  </p>
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
            className="glass-card p-6 space-y-6"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Role Description</h2>
                <p className="text-xs text-muted-foreground">Help candidates understand the role</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">
                  Job Description <span className="text-red-400">*</span>
                </Label>
                <span className={cn(
                  'text-xs tabular-nums',
                  description.length < 100 ? 'text-muted-foreground' : 'text-emerald-400'
                )}>
                  {description.length} / 100+ chars
                </span>
              </div>
              <Textarea
                {...step2Form.register('description')}
                placeholder="Describe the role, what you'll be working on, team structure, and what makes this opportunity exciting..."
                className="input-field resize-none"
                style={{ minHeight: 200 }}
              />
              {step2Form.formState.errors.description && (
                <p className="text-xs text-red-400">{step2Form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Requirements</Label>
              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-blue-400">{idx + 1}</span>
                    </div>
                    <Input
                      value={req}
                      onChange={(e) => updateListItem(requirements, setRequirements, idx, e.target.value)}
                      placeholder={`Requirement ${idx + 1}...`}
                      className="input-field flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 shrink-0 text-muted-foreground hover:text-red-400"
                      onClick={() => removeListItem(requirements, setRequirements, idx)}
                      disabled={requirements.length === 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addListItem(requirements, setRequirements)}
                className="text-xs text-blue-400 hover:text-blue-300 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Requirement
              </Button>
            </div>

            {/* Nice to Have */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Nice to Have</Label>
              <div className="space-y-2">
                {niceToHave.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-purple-400">+</span>
                    </div>
                    <Input
                      value={item}
                      onChange={(e) => updateListItem(niceToHave, setNiceToHave, idx, e.target.value)}
                      placeholder={`Nice to have ${idx + 1}...`}
                      className="input-field flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 shrink-0 text-muted-foreground hover:text-red-400"
                      onClick={() => removeListItem(niceToHave, setNiceToHave, idx)}
                      disabled={niceToHave.length === 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addListItem(niceToHave, setNiceToHave)}
                className="text-xs text-purple-400 hover:text-purple-300 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Nice to Have
              </Button>
            </div>

            {/* Skills Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Skills</Label>
              <div className="space-y-2">
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Type a skill and press Enter (e.g. React, TypeScript…)"
                    className="input-field pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Press Enter or comma to add a skill tag</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Review & Preview ─────────────────────────────────── */}
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
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live Preview</span>
              </div>
            </div>

            {/* Job Preview Card */}
            <div className="glass-card p-6 space-y-5 border-white/[0.12]">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {step1Values.title || <span className="text-muted-foreground italic">Job Title</span>}
                    </h3>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shrink-0">
                      Active
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {step1Values.department && (
                      <Badge variant="secondary" className="text-xs">
                        {step1Values.department}
                      </Badge>
                    )}
                    {jobTypeLabel && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {jobTypeLabel}
                      </Badge>
                    )}
                    {levelLabel && (
                      <Badge variant="secondary" className="text-xs">
                        {levelLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 py-3 border-y border-border">
                {step1Values.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {step1Values.location}
                  </div>
                )}
                {workModeLabel && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wifi className="w-4 h-4" />
                    {workModeLabel}
                  </div>
                )}
                {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(step1Values.salaryMin, step1Values.salaryMax)} / year
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Posted today
                </div>
              </div>

              {/* Description preview */}
              {description ? (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">About the Role</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {description}
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground italic">
                  No description added yet
                </div>
              )}

              {/* Requirements preview */}
              {requirements.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Requirements</h4>
                  <ul className="space-y-1.5">
                    {requirements.filter(Boolean).map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to Have preview */}
              {niceToHave.filter(Boolean).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Nice to Have</h4>
                  <ul className="space-y-1.5">
                    {niceToHave.filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills preview */}
              {skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2.5">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Matching note */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/15 flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 shrink-0">
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

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Users, label: 'Est. Applicants', value: '200–400', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: Clock, label: 'Avg Time to Fill', value: '28 days', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { icon: Sparkles, label: 'AI Match Quality', value: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 flex flex-col items-center gap-2 text-center">
                  <div className={cn('p-2 rounded-lg', stat.bg)}>
                    <stat.icon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <div className={cn('text-lg font-bold', stat.color)}>{stat.value}</div>
                  <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center justify-between pt-2"
      >
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                currentStep === s.number
                  ? 'bg-blue-500 w-6'
                  : currentStep > s.number
                  ? 'bg-emerald-500'
                  : 'bg-white/20'
              )}
            />
          ))}
        </div>

        {currentStep < 3 ? (
          <Button onClick={goNext} className="gap-2 btn-primary">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-4 h-4" />
            Publish Job
          </Button>
        )}
      </motion.div>
    </div>
  )
}
