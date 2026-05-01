'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Building2,
  Briefcase,
  Users,
  Mail,
  Plus,
  X,
  Rocket,
  ArrowRight,
} from 'lucide-react'

interface FormData {
  // Step 1
  companyName: string
  industry: string
  companySize: string
  websiteUrl: string
  // Step 2
  jobTitle: string
  department: string
  workMode: 'remote' | 'hybrid' | 'onsite' | ''
  experienceLevel: string
  salaryMin: string
  salaryMax: string
  // Step 3
  teamEmails: string[]
  teamRoles: Record<string, string>
  notifyNewApplications: boolean
  notifyStageChanges: boolean
  notifyWeeklyDigest: boolean
}

const initialFormData: FormData = {
  companyName: '',
  industry: '',
  companySize: '',
  websiteUrl: '',
  jobTitle: '',
  department: '',
  workMode: '',
  experienceLevel: '',
  salaryMin: '',
  salaryMax: '',
  teamEmails: [],
  teamRoles: {},
  notifyNewApplications: true,
  notifyStageChanges: true,
  notifyWeeklyDigest: false,
}

const steps = [
  { number: 1, label: 'Company Details', icon: Building2 },
  { number: 2, label: 'Your First Job', icon: Briefcase },
  { number: 3, label: 'Team Setup', icon: Users },
  { number: 4, label: 'Launch', icon: Rocket },
]

export default function CompanyOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [emailInput, setEmailInput] = useState('')

  const updateForm = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const goNext = () => {
    setDirection(1)
    setCurrentStep((s) => Math.min(s + 1, 4))
  }

  const goBack = () => {
    setDirection(-1)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const addEmail = () => {
    const email = emailInput.trim()
    if (email && !formData.teamEmails.includes(email)) {
      const newEmails = [...formData.teamEmails, email]
      updateForm('teamEmails', newEmails)
      updateForm('teamRoles', { ...formData.teamRoles, [email]: 'Recruiter' })
      setEmailInput('')
    }
  }

  const removeEmail = (email: string) => {
    const newEmails = formData.teamEmails.filter((e) => e !== email)
    const newRoles = { ...formData.teamRoles }
    delete newRoles[email]
    updateForm('teamEmails', newEmails)
    updateForm('teamRoles', newRoles)
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Calibr</span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number
            const isActive = currentStep === step.number
            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                      isCompleted
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : isActive
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-white/5 border-white/10 text-white/30'
                    )}
                    animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:block',
                      isActive ? 'text-blue-400' : isCompleted ? 'text-white/60' : 'text-white/20'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-16 sm:w-24 mx-1 sm:mx-2 mb-5">
                    <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{
                          width: currentStep > step.number ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 overflow-hidden relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {currentStep === 1 && (
                <Step1
                  formData={formData}
                  updateForm={updateForm}
                  onNext={goNext}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  formData={formData}
                  updateForm={updateForm}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStep === 3 && (
                <Step3
                  formData={formData}
                  updateForm={updateForm}
                  emailInput={emailInput}
                  setEmailInput={setEmailInput}
                  onAddEmail={addEmail}
                  onRemoveEmail={removeEmail}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStep === 4 && (
                <Step4
                  formData={formData}
                  onDashboard={() => router.push('/company/dashboard')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────── Step 1 ─────────────────────────── */

function Step1({
  formData,
  updateForm,
  onNext,
}: {
  formData: FormData
  updateForm: (field: keyof FormData, value: unknown) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Company Details</h2>
        </div>
        <p className="text-white/50 text-sm ml-11">Tell us about your organization.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Company Name</Label>
          <Input
            placeholder="Acme Corp"
            value={formData.companyName}
            onChange={(e) => updateForm('companyName', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(v) => updateForm('industry', v)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Media', 'Other'].map(
                  (i) => (
                    <SelectItem key={i} value={i} className="text-white/80 focus:bg-white/10 focus:text-white">
                      {i}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Company Size</Label>
            <Select
              value={formData.companySize}
              onValueChange={(v) => updateForm('companySize', v)}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                {['1-10', '11-50', '51-200', '201-1000', '1000+'].map((s) => (
                  <SelectItem key={s} value={s} className="text-white/80 focus:bg-white/10 focus:text-white">
                    {s} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Website URL</Label>
          <Input
            placeholder="https://acme.com"
            value={formData.websiteUrl}
            onChange={(e) => updateForm('websiteUrl', e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          disabled={!formData.companyName || !formData.industry || !formData.companySize}
          className="btn-primary gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────── Step 2 ─────────────────────────── */

function Step2({
  formData,
  updateForm,
  onNext,
  onBack,
}: {
  formData: FormData
  updateForm: (field: keyof FormData, value: unknown) => void
  onNext: () => void
  onBack: () => void
}) {
  const workModes: { value: 'remote' | 'hybrid' | 'onsite'; label: string }[] = [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Your First Job</h2>
        </div>
        <p className="text-white/50 text-sm ml-11">Define the role you're hiring for.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Job Title</Label>
            <Input
              placeholder="Senior Engineer"
              value={formData.jobTitle}
              onChange={(e) => updateForm('jobTitle', e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Department</Label>
            <Input
              placeholder="Engineering"
              value={formData.department}
              onChange={(e) => updateForm('department', e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Work Mode Segmented Control */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Work Mode</Label>
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
            {workModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => updateForm('workMode', mode.value)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  formData.workMode === mode.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Experience Level</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(v) => updateForm('experienceLevel', v)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-white/10">
              {['Entry', 'Mid', 'Senior', 'Lead', 'Executive'].map((l) => (
                <SelectItem key={l} value={l} className="text-white/80 focus:bg-white/10 focus:text-white">
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Range */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Salary Range (Annual)</Label>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
              <Input
                type="number"
                placeholder="80,000"
                value={formData.salaryMin}
                onChange={(e) => updateForm('salaryMin', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 pl-7"
              />
            </div>
            <span className="text-white/30 text-sm">to</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
              <Input
                type="number"
                placeholder="120,000"
                value={formData.salaryMax}
                onChange={(e) => updateForm('salaryMax', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 pl-7"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.jobTitle || !formData.workMode}
          className="btn-primary gap-2"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────── Step 3 ─────────────────────────── */

function Step3({
  formData,
  updateForm,
  emailInput,
  setEmailInput,
  onAddEmail,
  onRemoveEmail,
  onNext,
  onBack,
}: {
  formData: FormData
  updateForm: (field: keyof FormData, value: unknown) => void
  emailInput: string
  setEmailInput: (v: string) => void
  onAddEmail: () => void
  onRemoveEmail: (email: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const roleOptions = ['Admin', 'Recruiter', 'Hiring Manager', 'Viewer']

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Team Setup</h2>
        </div>
        <p className="text-white/50 text-sm ml-11">Invite colleagues and set permissions.</p>
      </div>

      {/* Invite members */}
      <div className="space-y-3">
        <Label className="text-white/70 text-sm">Invite Team Members</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAddEmail()}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 pl-9"
            />
          </div>
          <Button
            onClick={onAddEmail}
            variant="outline"
            className="border-white/10 text-white/70 hover:bg-white/10 hover:text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Email chips */}
        {formData.teamEmails.length > 0 && (
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            <AnimatePresence>
              {formData.teamEmails.map((email) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {email[0].toUpperCase()}
                  </div>
                  <span className="text-white/70 text-sm flex-1 truncate">{email}</span>
                  <Select
                    value={formData.teamRoles[email] || 'Recruiter'}
                    onValueChange={(v) =>
                      updateForm('teamRoles', { ...formData.teamRoles, [email]: v })
                    }
                  >
                    <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/60 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {roleOptions.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs text-white/80 focus:bg-white/10 focus:text-white">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => onRemoveEmail(email)}
                    className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {formData.teamEmails.length === 0 && (
          <div className="flex items-center justify-center py-6 border border-dashed border-white/10 rounded-xl text-white/30 text-sm gap-2">
            <Users className="w-4 h-4" />
            No team members added yet
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <Label className="text-white/70 text-sm">Notification Preferences</Label>
        <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/8">
          {[
            {
              field: 'notifyNewApplications' as const,
              label: 'New applications',
              desc: 'Get notified when candidates apply',
            },
            {
              field: 'notifyStageChanges' as const,
              label: 'Stage changes',
              desc: 'When a candidate moves through the pipeline',
            },
            {
              field: 'notifyWeeklyDigest' as const,
              label: 'Weekly digest',
              desc: 'Summary email every Monday morning',
            },
          ].map((item) => (
            <div key={item.field} className="flex items-start gap-3">
              <Checkbox
                id={item.field}
                checked={formData[item.field] as boolean}
                onCheckedChange={(checked) => updateForm(item.field, checked)}
                className="mt-0.5 border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div className="space-y-0.5">
                <Label htmlFor={item.field} className="text-white/80 text-sm cursor-pointer">
                  {item.label}
                </Label>
                <p className="text-white/40 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-white/60 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} className="btn-primary gap-2">
          Continue
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────── Step 4 ─────────────────────────── */

function Step4({
  formData,
  onDashboard,
}: {
  formData: FormData
  onDashboard: () => void
}) {
  const nextSteps = [
    {
      icon: Briefcase,
      title: 'Post your job',
      desc: 'Publish to top job boards instantly',
      href: '/company/jobs/new',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: Users,
      title: 'Browse candidates',
      desc: 'Explore AI-matched talent profiles',
      href: '/company/candidates',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Zap,
      title: 'View dashboard',
      desc: 'See your hiring overview',
      href: '/company/dashboard',
      color: 'from-green-500/20 to-green-600/10 border-green-500/20',
      iconColor: 'text-green-400',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Animated checkmark */}
      <div className="flex flex-col items-center text-center gap-4 pt-2">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              className="overflow-visible"
            >
              <motion.circle
                cx="24"
                cy="24"
                r="22"
                stroke="url(#grad)"
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
                <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
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
            animate={{ opacity: 1, scale: 1.3 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Ready to Launch!</h2>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Your workspace is set up and ready. Here's a summary of what you've configured.
          </p>
        </motion.div>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3"
      >
        <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider">Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <p className="text-white/40 text-xs">Company</p>
            <p className="text-white font-medium text-sm truncate">
              {formData.companyName || '—'}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-white/40 text-xs">Industry</p>
            <p className="text-white font-medium text-sm truncate">
              {formData.industry || '—'}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-white/40 text-xs">First Role</p>
            <p className="text-white font-medium text-sm truncate">
              {formData.jobTitle || '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Next step cards */}
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
                'group p-4 rounded-xl border bg-gradient-to-br flex flex-col gap-2.5 hover:scale-[1.02] transition-transform duration-200',
                item.color
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center',
                  item.iconColor
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight
                className={cn(
                  'w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200',
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
        <Button
          onClick={onDashboard}
          size="lg"
          className="btn-primary gap-2 px-8"
        >
          <Rocket className="w-4 h-4" />
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  )
}
