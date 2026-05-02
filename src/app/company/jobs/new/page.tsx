'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, companyAvatarUrl } from '@/lib/utils'
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
  Banknote,
  GripVertical,
} from 'lucide-react'

// ─── Schema ───────────────────────────────────────────────────────────────────
// location is conditional — only required when workMode is not remote

const step1Schema = z.object({
  title:     z.string().min(3, 'Job title must be at least 3 characters'),
  department:z.string().min(1, 'Please select a department'),
  jobType:   z.string().min(1, 'Please select a job type'),
  workMode:  z.string().min(1, 'Please select a work mode'),
  level:     z.string().min(1, 'Please select an experience level'),
  location:  z.string().default(''),
  currency:  z.string().default('USD'),
  salaryMin: z.coerce.number().min(1, 'Enter minimum salary'),
  salaryMax: z.coerce.number().min(1, 'Enter maximum salary'),
}).superRefine((data, ctx) => {
  if (data.workMode !== 'remote' && data.location.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 2,
      type: 'string',
      inclusive: true,
      message: 'Location is required for non-remote jobs',
      path: ['location'],
    })
  }
})

const step2Schema = z.object({
  description: z.string().min(100, 'Description must be at least 100 characters'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS  = ['Engineering','Design','Product','Marketing','Sales','Operations','HR','Finance']
const JOB_TYPES    = [
  { value: 'full-time',   label: 'Full-time'  },
  { value: 'part-time',   label: 'Part-time'  },
  { value: 'contract',    label: 'Contract'   },
  { value: 'internship',  label: 'Internship' },
  { value: 'freelance',   label: 'Freelance'  },
]
const WORK_MODES   = [
  { value: 'remote',  label: 'Remote',  icon: Wifi,        desc: 'Work from anywhere'    },
  { value: 'hybrid',  label: 'Hybrid',  icon: MonitorPlay, desc: 'Mix of office & remote' },
  { value: 'onsite',  label: 'On-site', icon: Building2,   desc: 'Office based'           },
]
const LEVELS       = [
  { value: 'entry',     label: 'Entry Level' },
  { value: 'mid',       label: 'Mid Level'   },
  { value: 'senior',    label: 'Senior'      },
  { value: 'lead',      label: 'Lead / Staff'},
  { value: 'executive', label: 'Executive'   },
]
const CURRENCIES   = ['USD','EUR','GBP','CAD','AUD']
const PRESET_BENEFITS = [
  { id: 'remote',   label: 'Remote Work',      emoji: '🌍' },
  { id: 'health',   label: 'Health Insurance', emoji: '🏥' },
  { id: '401k',     label: '401K Match',       emoji: '💰' },
  { id: 'learning', label: 'Learning Budget',  emoji: '📚' },
  { id: 'pto',      label: 'Unlimited PTO',    emoji: '🌴' },
  { id: 'equity',   label: 'Equity',           emoji: '📈' },
]

const STEPS = [
  { number: 1, title: 'Job Details',      icon: Briefcase },
  { number: 2, title: 'Role Description', icon: FileText  },
  { number: 3, title: 'Review & Publish', icon: Eye       },
]

const MIN_LEFT  = 320
const MAX_LEFT  = 720
const INIT_LEFT = 480

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtSalary(val: number, period: 'yearly' | 'hourly'): string {
  if (!val || isNaN(val)) return ''
  if (period === 'hourly') return `$${val}/hr`
  return val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val}`
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

interface PreviewProps {
  step1Values:      Step1Values
  description:      string
  requirements:     string[]
  niceToHave:       string[]
  skills:           string[]
  selectedBenefits: string[]
  salaryPeriod:     'yearly' | 'hourly'
  companyName:      string
  companyLogo:      string | null
}

function LivePreview({
  step1Values, description, requirements, niceToHave,
  skills, selectedBenefits, salaryPeriod, companyName, companyLogo,
}: PreviewProps) {
  const workModeLabel = WORK_MODES.find(m => m.value === step1Values.workMode)?.label ?? ''
  const levelLabel    = LEVELS.find(l => l.value === step1Values.level)?.label ?? ''
  const jobTypeLabel  = JOB_TYPES.find(t => t.value === step1Values.jobType)?.label ?? ''
  const isEmpty       = !step1Values.title && !step1Values.department
  const avatarSrc     = companyLogo ?? (companyName ? companyAvatarUrl(companyName) : null)

  return (
    <div className="p-5 xl:p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-tl-teal animate-pulse" />
        <span className="text-xs font-semibold text-tl-teal uppercase tracking-wider">Live Preview</span>
        <span className="text-xs text-tl-text-secondary ml-auto">Updates as you type</span>
      </div>

      <div className="tl-card overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-tl-border-subtle">
          <div className="flex items-start gap-4">
            {/* Company avatar */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-tl-border-subtle">
              {avatarSrc ? (
                <img src={avatarSrc} alt={companyName || 'Company'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-tl-gold/20 to-tl-teal/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-tl-gold/60" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h2 className="text-base font-bold text-tl-text-primary leading-tight">
                    {step1Values.title || <span className="text-tl-text-secondary/30 italic font-normal">Job title will appear here</span>}
                  </h2>
                  {companyName && (
                    <p className="text-sm text-tl-text-secondary mt-0.5">{companyName}</p>
                  )}
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-tl-teal/10 border border-tl-teal/20 text-tl-teal shrink-0">Active</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {step1Values.department && <span className="tl-tag text-[11px]">{step1Values.department}</span>}
                {jobTypeLabel           && <span className="tl-tag text-[11px]">{jobTypeLabel}</span>}
                {levelLabel             && <span className="tl-tag text-[11px]">{levelLabel}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Meta row */}
        {(step1Values.workMode || step1Values.location || (step1Values.salaryMin > 0 && step1Values.salaryMax > 0)) && (
          <div className="px-5 sm:px-6 py-3 flex flex-wrap gap-3 border-b border-tl-border-subtle bg-tl-bg-base/30">
            {(step1Values.location || step1Values.workMode === 'remote') && (
              <span className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {step1Values.workMode === 'remote' ? 'Remote' : step1Values.location}
              </span>
            )}
            {workModeLabel && (
              <span className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
                <Wifi className="w-3.5 h-3.5 shrink-0" />
                {workModeLabel}
              </span>
            )}
            {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold font-mono text-tl-teal">
                <Banknote className="w-3.5 h-3.5 shrink-0" />
                {fmtSalary(step1Values.salaryMin, salaryPeriod)} – {fmtSalary(step1Values.salaryMax, salaryPeriod)}
                <span className="font-normal text-tl-text-secondary">/ {salaryPeriod === 'hourly' ? 'hr' : 'yr'}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Posted today
            </span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {description ? (
            <div>
              <h3 className="text-sm font-semibold text-tl-text-primary mb-2">About the Role</h3>
              <p className="text-sm text-tl-text-secondary leading-relaxed whitespace-pre-wrap line-clamp-6">{description}</p>
            </div>
          ) : isEmpty ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-tl-bg-elevated border border-tl-border-subtle flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-tl-text-secondary/30" />
              </div>
              <p className="text-sm text-tl-text-secondary/40">Fill in the form to see your live job preview</p>
            </div>
          ) : null}

          {requirements.filter(Boolean).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-tl-text-primary mb-2.5">Requirements</h3>
              <ul className="space-y-2">
                {requirements.filter(Boolean).map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-tl-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {niceToHave.filter(Boolean).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-tl-text-primary mb-2.5">Nice to Have</h3>
              <ul className="space-y-2">
                {niceToHave.filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-tl-text-secondary">
                    <Sparkles className="w-4 h-4 text-tl-gold shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-tl-text-primary mb-2.5">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => <span key={s} className="tl-tag-gold text-[11px]">{s}</span>)}
              </div>
            </div>
          )}

          {selectedBenefits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-tl-text-primary mb-2.5">Benefits</h3>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BENEFITS.filter(b => selectedBenefits.includes(b.id)).map(b => (
                  <span key={b.id} className="tl-tag-teal text-[11px]">{b.emoji} {b.label}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1 border-t border-tl-border-subtle">
            <Users className="w-3.5 h-3.5 text-tl-text-secondary" />
            <span className="text-xs text-tl-text-secondary">0 applicants · Posted today</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex gap-3">
          <button className="btn-gold flex-1 h-10 text-sm" disabled>Apply Now</button>
          <button className="btn-ghost h-10 px-4 text-sm" disabled>Save Job</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostNewJobPage() {
  const router = useRouter()
  const [currentStep,       setCurrentStep]       = useState(1)
  const [isPublishing,      setIsPublishing]       = useState(false)
  const [showMobilePreview, setShowMobilePreview]  = useState(false)
  const [salaryPeriod,      setSalaryPeriod]       = useState<'yearly' | 'hourly'>('yearly')
  const [companyName,       setCompanyName]        = useState('')
  const [companyLogo,       setCompanyLogo]        = useState<string | null>(null)

  // Resizable panel width
  const [leftWidth, setLeftWidth] = useState(INIT_LEFT)
  const dragging    = useRef(false)
  const dragStartX  = useRef(0)
  const dragStartW  = useRef(0)

  // Fetch company profile for avatar
  useEffect(() => {
    fetch('/api/company/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.name)  setCompanyName(data.name)
        if (data?.logo)  setCompanyLogo(data.logo)
      })
      .catch(() => {})
  }, [])

  // Drag-to-resize handlers
  function startDrag(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current  = true
    dragStartX.current = e.clientX
    dragStartW.current = leftWidth
    document.body.style.cursor       = 'col-resize'
    document.body.style.userSelect   = 'none'

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return
      const delta    = ev.clientX - dragStartX.current
      const newWidth = Math.max(MIN_LEFT, Math.min(MAX_LEFT, dragStartW.current + delta))
      setLeftWidth(newWidth)
    }
    function onUp() {
      dragging.current               = false
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  // Forms
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { title: '', department: '', jobType: '', workMode: '', level: '', location: '', currency: 'USD', salaryMin: 0, salaryMax: 0 },
  })
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { description: '' },
  })

  // Dynamic lists
  const [requirements,     setRequirements]    = useState<string[]>([''])
  const [niceToHave,       setNiceToHave]       = useState<string[]>([''])
  const [skills,           setSkills]           = useState<string[]>([])
  const [skillInput,       setSkillInput]       = useState('')
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([])

  const step1Values = step1Form.watch()
  const description = step2Form.watch('description')

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim() && skills.length < 15) {
      e.preventDefault()
      const skill = skillInput.trim().replace(/,$/, '')
      if (skill && !skills.includes(skill)) setSkills(p => [...p, skill])
      setSkillInput('')
    }
  }
  const removeSkill = (s: string) => setSkills(p => p.filter(x => x !== s))

  const updateItem  = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const next = [...list]; next[idx] = val; setList(next)
  }
  const addItem     = (list: string[], setList: (v: string[]) => void) => setList([...list, ''])
  const removeItem  = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx))
  const toggleBenefit = (id: string) =>
    setSelectedBenefits(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  // Navigation
  const goNext = async () => {
    if (currentStep === 1 && !(await step1Form.trigger())) return
    if (currentStep === 2 && !(await step2Form.trigger())) return
    setCurrentStep(s => Math.min(3, s + 1))
  }
  const goBack = () => setCurrentStep(s => Math.max(1, s - 1))

  const estApplicants = ({ entry:'300–500', mid:'200–350', senior:'80–150', lead:'40–80', executive:'20–50' } as Record<string,string>)[step1Values.level] ?? '200–400'

  const handlePublish = async (draft: boolean) => {
    const s1 = step1Form.getValues()
    const s2 = step2Form.getValues()
    setIsPublishing(true)
    try {
      const location = s1.location.trim() || (s1.workMode === 'remote' ? 'Remote' : '')
      const result = await createJob({
        title: s1.title, department: s1.department,
        type: s1.jobType as Parameters<typeof createJob>[0]['type'],
        workMode: s1.workMode as Parameters<typeof createJob>[0]['workMode'],
        level: s1.level as Parameters<typeof createJob>[0]['level'],
        location, salaryMin: s1.salaryMin, salaryMax: s1.salaryMax,
        currency: s1.currency, description: s2.description,
        requirements: requirements.filter(Boolean),
        niceToHave:   niceToHave.filter(Boolean),
        skills, benefits: selectedBenefits,
      })
      if (result.error) throw new Error(result.error)
      toast.success(draft ? 'Job saved as draft' : 'Job published! AI candidate matching started.')
      router.push('/company/jobs')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save job')
    } finally {
      setIsPublishing(false)
    }
  }

  // Shared input class
  const inp = 'w-full bg-tl-bg-surface border border-tl-border-default rounded-xl px-3.5 py-2.5 text-sm text-tl-text-primary placeholder:text-tl-text-secondary/50 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/20 transition-all'

  const previewProps: PreviewProps = {
    step1Values, description, requirements, niceToHave,
    skills, selectedBenefits, salaryPeriod, companyName, companyLogo,
  }

  return (
    <div className="flex" style={{ height: 'calc(100svh - 56px)', overflow: 'hidden' }}>

      {/* ── LEFT: Multi-step form ────────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-y-auto shrink-0 border-r border-tl-border-subtle w-full"
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? leftWidth : undefined }}
      >
        {/* Header + step progress */}
        <div className="px-5 pt-5 pb-4 border-b border-tl-border-subtle bg-tl-bg-surface/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-lg font-bold text-tl-text-primary">Post New Job</h1>
              <p className="text-xs text-tl-text-secondary mt-0.5">
                Step {currentStep} of 3 — {STEPS[currentStep - 1].title}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMobilePreview(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-tl-border-default text-xs text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-gold/30 transition-all">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button onClick={() => router.push('/company/jobs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-tl-border-default text-xs text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-gold/30 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.number
              const isDone   = currentStep > step.number
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      isDone   ? 'bg-tl-teal border-tl-teal text-tl-bg-base' :
                      isActive ? 'bg-tl-gold border-tl-gold text-tl-bg-base shadow-md shadow-tl-gold/20' :
                                 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary'
                    )}>
                      {isDone ? <Check className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium mt-1.5 whitespace-nowrap transition-colors',
                      isActive ? 'text-tl-gold' : isDone ? 'text-tl-teal' : 'text-tl-text-secondary'
                    )}>
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 mb-4 rounded-full overflow-hidden bg-tl-border-subtle">
                      <motion.div
                        className="h-full rounded-full bg-tl-teal"
                        animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Job Details ── */}
            {currentStep === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
                className="p-5 space-y-5"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-tl-border-subtle">
                  <div className="w-8 h-8 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-tl-gold" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-tl-text-primary">Job Details</h2>
                    <p className="text-xs text-tl-text-secondary">Basic information about the role</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Title */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-tl-text-primary">Job Title <span className="text-tl-rose">*</span></label>
                    <input {...step1Form.register('title')} placeholder="e.g. Senior Frontend Engineer" className={inp} />
                    {step1Form.formState.errors.title && <p className="text-xs text-tl-rose">{step1Form.formState.errors.title.message}</p>}
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-tl-text-primary">Department <span className="text-tl-rose">*</span></label>
                    <select value={step1Form.watch('department')}
                      onChange={e => step1Form.setValue('department', e.target.value, { shouldValidate: true })}
                      className={inp}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {step1Form.formState.errors.department && <p className="text-xs text-tl-rose">{step1Form.formState.errors.department.message}</p>}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-tl-text-primary">Job Type <span className="text-tl-rose">*</span></label>
                    <select value={step1Form.watch('jobType')}
                      onChange={e => step1Form.setValue('jobType', e.target.value, { shouldValidate: true })}
                      className={inp}>
                      <option value="">Select type</option>
                      {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {step1Form.formState.errors.jobType && <p className="text-xs text-tl-rose">{step1Form.formState.errors.jobType.message}</p>}
                  </div>

                  {/* Work Mode */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-tl-text-primary">Work Mode <span className="text-tl-rose">*</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {WORK_MODES.map(mode => {
                        const sel = step1Form.watch('workMode') === mode.value
                        return (
                          <button key={mode.value} type="button"
                            onClick={() => step1Form.setValue('workMode', mode.value, { shouldValidate: true })}
                            className={cn(
                              'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-200',
                              sel ? 'bg-tl-gold/10 border-tl-gold/40 text-tl-gold'
                                  : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20 hover:text-tl-text-primary'
                            )}>
                            <mode.icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                            <span className="text-[10px] font-normal opacity-60 hidden sm:block">{mode.desc}</span>
                          </button>
                        )
                      })}
                    </div>
                    {step1Form.formState.errors.workMode && <p className="text-xs text-tl-rose">{step1Form.formState.errors.workMode.message}</p>}
                  </div>

                  {/* Experience Level */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-tl-text-primary">Experience Level <span className="text-tl-rose">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map(lvl => {
                        const sel = step1Form.watch('level') === lvl.value
                        return (
                          <button key={lvl.value} type="button"
                            onClick={() => step1Form.setValue('level', lvl.value, { shouldValidate: true })}
                            className={cn(
                              'px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200',
                              sel ? 'bg-tl-teal/10 border-tl-teal/40 text-tl-teal'
                                  : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-teal/20 hover:text-tl-text-primary'
                            )}>
                            {lvl.label}
                          </button>
                        )
                      })}
                    </div>
                    {step1Form.formState.errors.level && <p className="text-xs text-tl-rose">{step1Form.formState.errors.level.message}</p>}
                  </div>

                  {/* Location (non-remote only) */}
                  {step1Values.workMode !== 'remote' && (
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-tl-text-primary">Location <span className="text-tl-rose">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                        <input {...step1Form.register('location')} placeholder="e.g. San Francisco, CA" className={cn(inp, 'pl-9')} />
                      </div>
                      {step1Form.formState.errors.location && <p className="text-xs text-tl-rose">{step1Form.formState.errors.location.message}</p>}
                    </div>
                  )}

                  {/* Salary */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-tl-text-primary">Salary Range <span className="text-tl-rose">*</span></label>
                      {/* Period toggle */}
                      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-tl-bg-elevated border border-tl-border-default">
                        {(['yearly', 'hourly'] as const).map(p => (
                          <button key={p} type="button" onClick={() => setSalaryPeriod(p)}
                            className={cn(
                              'px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-150',
                              salaryPeriod === p
                                ? 'bg-tl-gold text-tl-bg-base shadow-sm'
                                : 'text-tl-text-secondary hover:text-tl-text-primary'
                            )}>
                            {p === 'yearly' ? '/ yr' : '/ hr'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={step1Form.watch('currency')}
                        onChange={e => step1Form.setValue('currency', e.target.value)}
                        className="w-16 shrink-0 bg-tl-bg-surface border border-tl-border-default rounded-xl px-2 py-2.5 text-xs text-tl-text-primary focus:outline-none focus:border-tl-gold">
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input {...step1Form.register('salaryMin')} type="number"
                        placeholder={salaryPeriod === 'hourly' ? 'Min e.g. 40' : 'Min e.g. 80000'}
                        className={cn(inp, 'flex-1')} />
                      <span className="text-tl-text-secondary text-xs shrink-0">–</span>
                      <input {...step1Form.register('salaryMax')} type="number"
                        placeholder={salaryPeriod === 'hourly' ? 'Max e.g. 80' : 'Max e.g. 150000'}
                        className={cn(inp, 'flex-1')} />
                    </div>
                    {step1Values.salaryMin > 0 && step1Values.salaryMax > 0 && (
                      <p className="text-xs text-tl-teal font-medium">
                        {fmtSalary(step1Values.salaryMin, salaryPeriod)} – {fmtSalary(step1Values.salaryMax, salaryPeriod)} {salaryPeriod === 'hourly' ? 'per hour' : 'per year'}
                      </p>
                    )}
                    {(step1Form.formState.errors.salaryMin || step1Form.formState.errors.salaryMax) && (
                      <p className="text-xs text-tl-rose">Please enter a valid salary range</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Role Description ── */}
            {currentStep === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
                className="p-5 space-y-5"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-tl-border-subtle">
                  <div className="w-8 h-8 rounded-xl bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-tl-teal" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-tl-text-primary">Role Description</h2>
                    <p className="text-xs text-tl-text-secondary">Help candidates understand the opportunity</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-tl-text-primary">Job Description <span className="text-tl-rose">*</span></label>
                    <span className={cn('text-xs font-medium tabular-nums', description.length < 100 ? 'text-tl-text-secondary' : 'text-tl-teal')}>
                      {description.length} chars {description.length < 100 ? `(${100 - description.length} more needed)` : '✓'}
                    </span>
                  </div>
                  <textarea {...step2Form.register('description')}
                    placeholder="Describe the role, the team, and what makes this opportunity exciting…"
                    rows={6}
                    className="w-full bg-tl-bg-surface border border-tl-border-default rounded-xl px-3.5 py-3 text-sm text-tl-text-primary placeholder:text-tl-text-secondary/50 focus:outline-none focus:border-tl-gold focus:ring-1 focus:ring-tl-gold/20 transition-all resize-none"
                  />
                  {step2Form.formState.errors.description && <p className="text-xs text-tl-rose">{step2Form.formState.errors.description.message}</p>}
                </div>

                {/* Requirements */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-tl-text-primary">Requirements</label>
                  <div className="space-y-2">
                    {requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-tl-teal">{idx + 1}</span>
                        </div>
                        <input value={req} onChange={e => updateItem(requirements, setRequirements, idx, e.target.value)}
                          placeholder={`Requirement ${idx + 1}…`} className={cn(inp, 'flex-1')} />
                        <button type="button" onClick={() => removeItem(requirements, setRequirements, idx)} disabled={requirements.length === 1}
                          className="p-1.5 rounded-lg text-tl-text-secondary hover:text-tl-rose disabled:opacity-30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addItem(requirements, setRequirements)}
                    className="flex items-center gap-1.5 text-xs text-tl-teal hover:opacity-80 transition-opacity">
                    <Plus className="w-3.5 h-3.5" /> Add Requirement
                  </button>
                </div>

                {/* Nice to Have */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-tl-text-primary">Nice to Have</label>
                  <div className="space-y-2">
                    {niceToHave.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-tl-gold">+</span>
                        </div>
                        <input value={item} onChange={e => updateItem(niceToHave, setNiceToHave, idx, e.target.value)}
                          placeholder={`Nice to have ${idx + 1}…`} className={cn(inp, 'flex-1')} />
                        <button type="button" onClick={() => removeItem(niceToHave, setNiceToHave, idx)} disabled={niceToHave.length === 1}
                          className="p-1.5 rounded-lg text-tl-text-secondary hover:text-tl-rose disabled:opacity-30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addItem(niceToHave, setNiceToHave)}
                    className="flex items-center gap-1.5 text-xs text-tl-gold hover:opacity-80 transition-opacity">
                    <Plus className="w-3.5 h-3.5" /> Add Nice to Have
                  </button>
                </div>

                {/* Skills */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-tl-text-primary">Required Skills</label>
                    <span className="text-xs text-tl-text-secondary">{skills.length}/15</span>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 tl-tag-teal text-xs">
                          <Tag className="w-2.5 h-2.5" />{s}
                          <button onClick={() => removeSkill(s)} className="hover:text-tl-rose transition-colors"><X className="w-2.5 h-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                      disabled={skills.length >= 15} placeholder="Type a skill and press Enter…"
                      className={cn(inp, 'pl-9')} />
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2.5">
                  <label className="text-xs font-medium text-tl-text-primary">Benefits</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_BENEFITS.map(b => {
                      const on = selectedBenefits.includes(b.id)
                      return (
                        <button key={b.id} type="button" onClick={() => toggleBenefit(b.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs text-left transition-all duration-200',
                            on ? 'bg-tl-teal/10 border-tl-teal/30 text-tl-teal'
                               : 'bg-tl-bg-surface border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20 hover:text-tl-text-primary'
                          )}>
                          <span className="text-base">{b.emoji}</span>
                          <span className="font-medium">{b.label}</span>
                          {on && <Check className="w-3 h-3 ml-auto shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Review & Publish ── */}
            {currentStep === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
                className="p-5 space-y-4"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-tl-border-subtle">
                  <div className="w-8 h-8 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-tl-gold" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-tl-text-primary">Review & Publish</h2>
                    <p className="text-xs text-tl-text-secondary">Preview on the right — publish when ready</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Users,    label: 'Est. Applicants / day', value: estApplicants, color: 'text-tl-blue', bg: 'bg-tl-blue/10 border-tl-blue/20' },
                    { icon: Clock,    label: 'Avg. Time to Fill',     value: '28 days',     color: 'text-tl-gold', bg: 'bg-tl-gold/10 border-tl-gold/20' },
                    { icon: Sparkles, label: 'AI Match Quality',      value: 'High',        color: 'text-tl-teal', bg: 'bg-tl-teal/10 border-tl-teal/20' },
                  ].map(stat => (
                    <div key={stat.label} className="tl-card p-3.5 flex flex-col items-center gap-2 text-center">
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center border', stat.bg)}>
                        <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                      </div>
                      <div className={cn('text-base font-bold font-mono', stat.color)}>{stat.value}</div>
                      <div className="text-[10px] text-tl-text-secondary leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="tl-card p-4">
                  <p className="text-xs font-semibold text-tl-text-primary mb-3">Posting Summary</p>
                  <div className="space-y-0">
                    {[
                      { label: 'Title',       value: step1Values.title,                                                                                                        done: !!step1Values.title },
                      { label: 'Department',  value: step1Values.department,                                                                                                   done: !!step1Values.department },
                      { label: 'Work Mode',   value: WORK_MODES.find(m => m.value === step1Values.workMode)?.label,                                                            done: !!step1Values.workMode },
                      { label: 'Salary',      value: step1Values.salaryMin > 0 ? `${fmtSalary(step1Values.salaryMin, salaryPeriod)} – ${fmtSalary(step1Values.salaryMax, salaryPeriod)}` : null, done: step1Values.salaryMin > 0 },
                      { label: 'Description', value: description ? `${description.length} characters` : null,                                                                  done: description.length >= 100 },
                      { label: 'Requirements',value: requirements.filter(Boolean).length > 0 ? `${requirements.filter(Boolean).length} added` : null,                         done: requirements.filter(Boolean).length > 0 },
                      { label: 'Skills',      value: skills.length > 0 ? `${skills.length} skills` : null,                                                                    done: skills.length > 0 },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between gap-2 py-2 border-b border-tl-border-subtle last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0', item.done ? 'bg-tl-teal' : 'bg-tl-bg-elevated border border-tl-border-default')}>
                            {item.done && <Check className="w-2.5 h-2.5 text-tl-bg-base" />}
                          </div>
                          <span className="text-xs text-tl-text-secondary">{item.label}</span>
                        </div>
                        <span className="text-xs text-tl-text-primary font-medium truncate max-w-[130px]">{item.value ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-tl-gold/[0.05] border border-tl-gold/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-tl-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-tl-text-primary">AI Matching Active</p>
                    <p className="text-xs text-tl-text-secondary mt-0.5">
                      TalentBridge will instantly match your role with{' '}
                      <span className="text-tl-gold font-medium">14,200+ qualified candidates</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sticky nav */}
        <div className="shrink-0 px-5 py-4 border-t border-tl-border-subtle bg-tl-bg-surface/90 backdrop-blur-sm flex items-center justify-between gap-3">
          <button onClick={goBack} disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-tl-border-default text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-border-strong disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map(s => (
              <div key={s.number} className={cn('h-1.5 rounded-full transition-all duration-300',
                currentStep === s.number ? 'bg-tl-gold w-5' :
                currentStep > s.number  ? 'bg-tl-teal w-1.5' : 'bg-tl-border-default w-1.5'
              )} />
            ))}
          </div>

          {currentStep < 3 ? (
            <button onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold hover:bg-tl-gold/90 transition-all shadow-md shadow-tl-gold/20">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => handlePublish(true)} disabled={isPublishing}
                className="px-3.5 py-2.5 rounded-xl border border-tl-border-default text-xs font-medium text-tl-text-secondary hover:text-tl-text-primary disabled:opacity-50 transition-all">
                Save Draft
              </button>
              <button onClick={() => handlePublish(false)} disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tl-teal text-tl-bg-base text-sm font-semibold hover:bg-tl-teal/90 transition-all shadow-lg shadow-tl-teal/20 disabled:opacity-50">
                {isPublishing
                  ? <span className="w-4 h-4 rounded-full border-2 border-tl-bg-base/30 border-t-tl-bg-base animate-spin" />
                  : <Zap className="w-4 h-4" />}
                {isPublishing ? 'Publishing…' : 'Publish Job'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── DRAG HANDLE (desktop only) ───────────────────────────────────────── */}
      <div
        onMouseDown={startDrag}
        className="hidden lg:flex w-5 shrink-0 cursor-col-resize items-center justify-center group select-none relative z-10"
      >
        {/* Line */}
        <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-tl-border-subtle group-hover:bg-tl-gold/30 transition-colors duration-150" />
        {/* Pill handle */}
        <div className="relative z-10 flex flex-col gap-[3px] items-center justify-center w-5 h-10 rounded-full bg-tl-bg-elevated border border-tl-border-default group-hover:border-tl-gold/50 group-hover:bg-tl-bg-surface shadow-sm transition-all duration-150">
          <GripVertical className="w-3 h-3 text-tl-text-secondary/50 group-hover:text-tl-gold/70 transition-colors" />
        </div>
      </div>

      {/* ── RIGHT: Live preview ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col overflow-y-auto bg-tl-bg-base/40">
        <LivePreview {...previewProps} />
      </div>

      {/* ── MOBILE: Preview bottom sheet ─────────────────────────────────────── */}
      <AnimatePresence>
        {showMobilePreview && (
          <>
            <motion.div key="preview-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setShowMobilePreview(false)}
            />
            <motion.div key="preview-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-tl-bg-base rounded-t-2xl border-t border-tl-border-default lg:hidden max-h-[85dvh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-tl-border-default" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-tl-border-subtle shrink-0">
                <span className="font-display font-semibold text-sm text-tl-text-primary">Job Preview</span>
                <button onClick={() => setShowMobilePreview(false)}
                  className="w-8 h-8 rounded-full bg-tl-bg-elevated flex items-center justify-center text-tl-text-secondary hover:text-tl-text-primary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <LivePreview {...previewProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
