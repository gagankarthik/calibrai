'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  DragEvent,
  ChangeEvent,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTalentProfile, updateTalentProfile, getResumeUploadUrl } from '@/lib/api'
import type { Candidate, Skill, Experience, Education } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  MapPin,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  X as XIcon,
  Check,
  Circle,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
  Shield,
  Save,
  Building2,
  GraduationCap,
  Briefcase,
  Star,
  Zap,
  Languages,
  Upload,
  FileText,
  Phone,
  User,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────
const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const
const JOB_TYPES  = ['full-time', 'part-time', 'contract', 'internship', 'freelance'] as const
const INDUSTRIES = [
  'FinTech', 'Developer Tools', 'SaaS', 'E-commerce', 'HealthTech',
  'EdTech', 'AI/ML', 'Cybersecurity', 'Web3', 'Gaming',
]
const NOTICE_PERIODS = ['Immediately', '2 weeks', '1 month', '2 months', '3 months']
const ACCEPTED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]
const MAX_RESUME_BYTES = 10 * 1024 * 1024 // 10 MB

// ─── Types ────────────────────────────────────────────────────────────────────
type SkillLevel = Skill['level']

const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner:     'bg-tl-bg-elevated text-tl-text-secondary border border-tl-border-default',
  intermediate: 'tl-tag-blue',
  advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  expert:       'tl-tag-teal',
}

// Extended profile type that includes fields not yet in the base Candidate type
type ExtendedCandidate = Candidate & {
  jobTypes?: string[]
  industries?: string[]
  noticePeriod?: string
  resumeUrl?: string
  avatarUrl?: string
  headline?: string
}

interface ExpForm {
  company: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  skills: string
}

interface EduForm {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

const EMPTY_EXP: ExpForm = {
  company: '', title: '', startDate: '', endDate: '', current: false, description: '', skills: '',
}
const EMPTY_EDU: EduForm = {
  institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '',
}

// ─── Section IDs for the checklist sidebar ────────────────────────────────────
type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'preferences' | 'links' | 'resume'

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',    label: 'Personal Info',     icon: <User className="w-3.5 h-3.5" /> },
  { id: 'experience',  label: 'Work Experience',   icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: 'education',   label: 'Education',         icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'skills',      label: 'Skills',            icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'preferences', label: 'Job Preferences',   icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'links',       label: 'Links',             icon: <LinkIcon className="w-3.5 h-3.5" /> },
  { id: 'resume',      label: 'Resume',            icon: <FileText className="w-3.5 h-3.5" /> },
]

// ─── Utility ──────────────────────────────────────────────────────────────────
function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function fmtPeriod(start: string, end?: string, current?: boolean) {
  if (!start) return ''
  const fmt = (d: string) => {
    const [y, m] = d.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const idx = parseInt(m) - 1
    return `${months[idx] ?? m} ${y}`
  }
  return `${fmt(start)} → ${current ? 'Present' : (end ? fmt(end) : '—')}`
}

function resumeFilenameFromKey(key: string) {
  return key.split('/').pop() ?? key
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
        checked ? 'bg-tl-teal' : 'bg-tl-bg-elevated',
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
          checked && 'translate-x-[18px]',
        )}
      />
    </button>
  )
}

// ─── Section wrapper card ─────────────────────────────────────────────────────
function SectionCard({
  id,
  title,
  icon,
  children,
  accentColor = 'gold',
}: {
  id: SectionId
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  accentColor?: 'gold' | 'teal' | 'violet' | 'blue'
}) {
  const accent = {
    gold:   { bg: 'bg-tl-gold/10',   border: 'border-tl-gold/20',   text: 'text-tl-gold' },
    teal:   { bg: 'bg-tl-teal/10',   border: 'border-tl-teal/20',   text: 'text-tl-teal' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
    blue:   { bg: 'bg-tl-blue/10',   border: 'border-tl-blue/20',   text: 'text-tl-blue' },
  }[accentColor]

  return (
    <motion.div
      id={`section-${id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="tl-card p-6 space-y-5"
    >
      <div className={cn('flex items-center gap-2')}>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border', accent.bg, accent.border)}>
          <span className={accent.text}>{icon}</span>
        </div>
        <h2 className="text-base font-display font-semibold text-tl-text-primary">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveBtn({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <button
      type="button"
      disabled={saving}
      onClick={onSave}
      className="btn-gold gap-2 flex items-center disabled:opacity-60"
    >
      {saving
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        : <><Save className="w-4 h-4" /> Save Changes</>
      }
    </button>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-5 space-y-4 animate-pulse">
      <div className="h-40 rounded-2xl bg-tl-bg-elevated" />
      <div className="flex gap-6">
        <div className="hidden lg:block w-64 space-y-4 shrink-0">
          <div className="h-64 rounded-xl bg-tl-bg-elevated" />
        </div>
        <div className="flex-1 space-y-5">
          <div className="h-56 rounded-xl bg-tl-bg-elevated" />
          <div className="h-56 rounded-xl bg-tl-bg-elevated" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile] = useState<ExtendedCandidate | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Personal Info ──────────────────────────────────────────────────────────
  const [name, setName]         = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio]           = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone]       = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [langInput, setLangInput] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingPersonal, setSavingPersonal] = useState(false)

  // ── Work Experience ────────────────────────────────────────────────────────
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [showExpForm, setShowExpForm] = useState(false)
  const [editExpId, setEditExpId]     = useState<string | null>(null)
  const [expForm, setExpForm]         = useState<ExpForm>(EMPTY_EXP)
  const [savingExp, setSavingExp]     = useState(false)

  // ── Education ──────────────────────────────────────────────────────────────
  const [educations, setEducations] = useState<Education[]>([])
  const [showEduForm, setShowEduForm] = useState(false)
  const [editEduId, setEditEduId]     = useState<string | null>(null)
  const [eduForm, setEduForm]         = useState<EduForm>(EMPTY_EDU)
  const [savingEdu, setSavingEdu]     = useState(false)

  // ── Skills ─────────────────────────────────────────────────────────────────
  const [skills, setSkills]             = useState<Skill[]>([])
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate')
  const [savingSkills, setSavingSkills] = useState(false)

  // ── Preferences ────────────────────────────────────────────────────────────
  const [availability, setAvailability] = useState<'open' | 'not-looking'>('open')
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [workPref, setWorkPref]         = useState<string[]>([])
  const [jobTypePref, setJobTypePref]   = useState<string[]>([])
  const [industryPref, setIndustryPref] = useState<string[]>([])
  const [noticePeriod, setNoticePeriod] = useState('')
  const [salaryExpectation, setSalaryExpectation] = useState('')
  const [savingPrefs, setSavingPrefs]   = useState(false)

  // ── Links ──────────────────────────────────────────────────────────────────
  const [github, setGithub]       = useState('')
  const [linkedin, setLinkedin]   = useState('')
  const [portfolio, setPortfolio] = useState('')
  const [savingLinks, setSavingLinks] = useState(false)

  // ── Resume Upload ──────────────────────────────────────────────────────────
  const [resumeUrl, setResumeUrl]           = useState('')
  const [uploadFile, setUploadFile]         = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading]           = useState(false)
  const [dragOver, setDragOver]             = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Avatar Upload ──────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const res = await getTalentProfile()
      if (res.data) {
        const p = res.data as ExtendedCandidate
        setProfile(p)
        setName(p.name ?? '')
        setHeadline(p.headline ?? p.title ?? '')
        setBio(p.bio ?? '')
        setLocation(p.location ?? '')
        setPhone(p.phone ?? '')
        setLanguages(p.languages ?? [])
        setAvatarUrl(p.avatarUrl ?? p.avatar ?? '')
        setExperiences(p.experience ?? [])
        setEducations(p.education ?? [])
        setSkills(p.skills ?? [])
        setAvailability(p.availability === 'not-looking' ? 'not-looking' : 'open')
        setWorkPref(p.workPreference ?? [])
        setJobTypePref(p.jobTypes ?? [])
        setIndustryPref(p.industries ?? [])
        setNoticePeriod(p.noticePeriod ?? '')
        if (p.salaryExpectation) setSalaryExpectation(String(p.salaryExpectation))
        setGithub(p.github ?? '')
        setLinkedin(p.linkedin ?? '')
        setPortfolio(p.portfolio ?? '')
        setResumeUrl(p.resumeUrl ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Checklist completion ───────────────────────────────────────────────────
  const checklistStatus: Record<SectionId, boolean> = {
    personal:    !!(name && headline && location && bio),
    experience:  experiences.length >= 1,
    education:   educations.length >= 1,
    skills:      skills.length >= 3,
    preferences: !!(workPref.length > 0 && salaryExpectation),
    links:       !!(github || linkedin || portfolio),
    resume:      !!resumeUrl,
  }
  const doneCount     = Object.values(checklistStatus).filter(Boolean).length
  const totalSections = SECTIONS.length
  const pctComplete   = Math.round((doneCount / totalSections) * 100)

  // ── Resume upload flow ─────────────────────────────────────────────────────
  const handleFileSelect = useCallback((file: File) => {
    if (!ACCEPTED_RESUME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      toast.error('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT.')
      return
    }
    if (file.size > MAX_RESUME_BYTES) {
      toast.error('File too large. Maximum size is 10 MB.')
      return
    }
    setUploadFile(file)
  }, [])

  const handleResumeDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleResumeFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }, [handleFileSelect])

  async function doResumeUpload() {
    if (!uploadFile) return
    setUploading(true)
    setUploadProgress(0)

    // 1. Get presigned URL
    const urlRes = await getResumeUploadUrl(uploadFile.name, uploadFile.type)
    if (urlRes.error || !urlRes.data) {
      toast.error(urlRes.error ?? 'Failed to get upload URL')
      setUploading(false)
      return
    }
    const { url, key } = urlRes.data

    // 2. PUT to S3 with progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', uploadFile.type)
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
        }
      }
      xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`S3 upload failed: ${xhr.status}`)))
      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(uploadFile)
    }).catch((err: Error) => {
      toast.error(err.message)
      setUploading(false)
      return
    })

    // 3. Save key to profile
    const patchRes = await updateTalentProfile({ resumeUrl: key })
    if (patchRes.error) {
      toast.error(patchRes.error)
    } else {
      setResumeUrl(key)
      setUploadFile(null)
      toast.success(`Resume uploaded — ${uploadFile.name}`)
    }
    setUploading(false)
  }

  // ── Avatar upload flow ─────────────────────────────────────────────────────
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB')
      return
    }
    setUploadingAvatar(true)
    const { getAssetUploadUrl } = await import('@/lib/api')
    const urlRes = await getAssetUploadUrl('talent', profile?.id ?? 'me', file.name, file.type)
    if (urlRes.error || !urlRes.data) {
      toast.error(urlRes.error ?? 'Failed to get upload URL')
      setUploadingAvatar(false)
      return
    }
    const { url, key } = urlRes.data
    try {
      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      const patchRes = await updateTalentProfile({ avatarUrl: key })
      if (patchRes.error) {
        toast.error(patchRes.error)
      } else {
        setAvatarUrl(key)
        toast.success('Profile photo updated')
      }
    } catch {
      toast.error('Upload failed')
    }
    setUploadingAvatar(false)
  }

  // ── Section save handlers ──────────────────────────────────────────────────
  async function savePersonal() {
    setSavingPersonal(true)
    const res = await updateTalentProfile({ headline, bio, location, phone, languages })
    setSavingPersonal(false)
    if (res.error) toast.error(res.error)
    else toast.success('Personal info saved')
  }

  async function saveExperience() {
    setSavingExp(true)
    const res = await updateTalentProfile({ experience: experiences })
    setSavingExp(false)
    if (res.error) toast.error(res.error)
    else toast.success('Work experience saved')
  }

  async function saveEducation() {
    setSavingEdu(true)
    const res = await updateTalentProfile({ education: educations })
    setSavingEdu(false)
    if (res.error) toast.error(res.error)
    else toast.success('Education saved')
  }

  async function saveSkills() {
    setSavingSkills(true)
    const res = await updateTalentProfile({ skills })
    setSavingSkills(false)
    if (res.error) toast.error(res.error)
    else toast.success('Skills saved')
  }

  async function savePreferences() {
    setSavingPrefs(true)
    const res = await updateTalentProfile({
      availability,
      workPreference: workPref as Candidate['workPreference'],
      jobTypes: jobTypePref,
      industries: industryPref,
      noticePeriod,
      salaryExpectation: salaryExpectation ? Number(salaryExpectation) : undefined,
    })
    setSavingPrefs(false)
    if (res.error) toast.error(res.error)
    else toast.success('Job preferences saved')
  }

  async function saveLinks() {
    setSavingLinks(true)
    const res = await updateTalentProfile({ github, linkedin, portfolio })
    setSavingLinks(false)
    if (res.error) toast.error(res.error)
    else toast.success('Links saved')
  }

  async function handleAvailabilityToggle(newVal: 'open' | 'not-looking') {
    setAvailability(newVal)
    setSavingAvailability(true)
    const res = await updateTalentProfile({ availability: newVal })
    setSavingAvailability(false)
    if (res.error) {
      toast.error(res.error)
      setAvailability(newVal === 'open' ? 'not-looking' : 'open')
    } else {
      toast.success(newVal === 'open' ? 'Now visible to recruiters' : 'Hidden from recruiters')
    }
  }

  // ── Inline form helpers ────────────────────────────────────────────────────
  function handleSaveExp() {
    if (!expForm.company || !expForm.title || !expForm.startDate) {
      toast.error('Company, title and start date are required')
      return
    }
    const entry: Experience = {
      id: editExpId ?? `e-${Date.now()}`,
      company: expForm.company,
      title: expForm.title,
      startDate: expForm.startDate,
      endDate: expForm.current ? undefined : expForm.endDate || undefined,
      current: expForm.current,
      description: expForm.description,
      skills: expForm.skills.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (editExpId) {
      setExperiences(p => p.map(e => e.id === editExpId ? entry : e))
    } else {
      setExperiences(p => [entry, ...p])
    }
    setExpForm(EMPTY_EXP)
    setShowExpForm(false)
    setEditExpId(null)
  }

  function handleEditExp(id: string) {
    const exp = experiences.find(e => e.id === id)
    if (!exp) return
    setExpForm({
      company: exp.company,
      title: exp.title,
      startDate: exp.startDate,
      endDate: exp.endDate ?? '',
      current: exp.current,
      description: exp.description,
      skills: exp.skills.join(', '),
    })
    setEditExpId(id)
    setShowExpForm(true)
  }

  function handleSaveEdu() {
    if (!eduForm.institution || !eduForm.degree) {
      toast.error('Institution and degree are required')
      return
    }
    const entry: Education = {
      id: editEduId ?? `edu-${Date.now()}`,
      institution: eduForm.institution,
      degree: eduForm.degree,
      field: eduForm.field,
      startDate: eduForm.startDate,
      endDate: eduForm.endDate,
      gpa: eduForm.gpa ? parseFloat(eduForm.gpa) : undefined,
    }
    if (editEduId) {
      setEducations(p => p.map(e => e.id === editEduId ? entry : e))
    } else {
      setEducations(p => [...p, entry])
    }
    setEduForm(EMPTY_EDU)
    setShowEduForm(false)
    setEditEduId(null)
  }

  function handleEditEdu(id: string) {
    const edu = educations.find(e => e.id === id)
    if (!edu) return
    setEduForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa != null ? String(edu.gpa) : '',
    })
    setEditEduId(id)
    setShowEduForm(true)
  }

  function handleAddSkill() {
    if (!newSkillName.trim()) return
    if (skills.length >= 20) {
      toast.error('Maximum 20 skills allowed')
      return
    }
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error('Skill already added')
      return
    }
    setSkills(p => [...p, { name: newSkillName.trim(), level: newSkillLevel, verified: false }])
    setNewSkillName('')
    setNewSkillLevel('intermediate')
    setShowSkillInput(false)
  }

  function togglePref<T extends string>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  function handleLangKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && langInput.trim()) {
      e.preventDefault()
      if (!languages.includes(langInput.trim())) setLanguages(p => [...p, langInput.trim()])
      setLangInput('')
    }
  }

  function scrollToSection(id: SectionId) {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />

  const isNewUser = !profile?.name

  // ── Avatar display ─────────────────────────────────────────────────────────
  const avatarDisplay = avatarUrl
    ? avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'T')}&backgroundColor=1a2035&textColor=e8c468`

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-5 space-y-4">

      {/* ── NEW USER BANNER ──────────────────────────────────────────────────── */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-4 rounded-xl bg-tl-gold/10 border border-tl-gold/30"
        >
          <Star className="w-5 h-5 text-tl-gold shrink-0" />
          <div>
            <p className="text-sm font-semibold text-tl-text-primary">Let&apos;s set up your profile</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">
              Complete each section below to get discovered by top companies.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── RESUME UPLOAD BANNER ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="tl-card p-5"
        id="section-resume"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-tl-teal" />
          </div>
          <h2 className="text-base font-display font-semibold text-tl-text-primary">Resume</h2>
        </div>

        {/* Existing resume */}
        {resumeUrl && !uploadFile && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <FileText className="w-4 h-4 text-tl-teal shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-tl-text-primary truncate">
                Current resume: <span className="text-tl-teal">{resumeFilenameFromKey(resumeUrl)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost text-xs shrink-0"
            >
              Replace
            </button>
          </div>
        )}

        {/* Drop zone — shown when no file selected yet */}
        {!uploadFile && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleResumeDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all',
              dragOver
                ? 'border-tl-teal bg-tl-teal/5'
                : 'border-tl-border-default hover:border-tl-teal/40 hover:bg-tl-bg-elevated',
            )}
          >
            <Upload className={cn('w-8 h-8 transition-colors', dragOver ? 'text-tl-teal' : 'text-tl-text-secondary')} />
            <div className="text-center">
              <p className="text-sm font-medium text-tl-text-primary">
                Drag & drop your resume, or{' '}
                <span className="text-tl-teal underline-offset-2 hover:underline">browse files</span>
              </p>
              <p className="text-xs text-tl-text-secondary mt-1">
                Supported: PDF, DOC, DOCX, TXT &bull; Max 10 MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              onChange={handleResumeFileChange}
            />
          </div>
        )}

        {/* File selected — ready to upload */}
        {uploadFile && !uploading && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <FileText className="w-5 h-5 text-tl-teal shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-tl-text-primary truncate">{uploadFile.name}</p>
              <p className="text-xs text-tl-text-secondary">{fmtBytes(uploadFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadFile(null)}
              className="text-tl-text-secondary hover:text-tl-rose transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={doResumeUpload}
              className="btn-gold text-sm flex items-center gap-1.5 shrink-0"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
          </div>
        )}

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-tl-text-secondary">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading {uploadFile?.name}…
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
              <div
                className="h-full rounded-full bg-tl-teal transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── CHECKLIST SIDEBAR ─────────────────────────────────────────────── */}
        {/* Mobile: progress bar */}
        <div className="lg:hidden w-full tl-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-tl-text-primary">Profile Completion</p>
            <span className="text-xs font-mono font-bold text-tl-gold">{pctComplete}%</span>
          </div>
          <div className="h-2 rounded-full bg-tl-bg-elevated overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-tl-gold transition-all duration-500"
              style={{ width: `${pctComplete}%` }}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border whitespace-nowrap transition-all',
                  checklistStatus[s.id]
                    ? 'bg-tl-teal/10 border-tl-teal/30 text-tl-teal'
                    : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary',
                )}
              >
                {checklistStatus[s.id]
                  ? <CheckCircle2 className="w-3 h-3" />
                  : <Circle className="w-3 h-3" />
                }
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: sticky sidebar */}
        <div className="hidden lg:block w-64 shrink-0 sticky top-20 space-y-4">
          <div className="tl-card p-5">
            {/* Circular-ish progress */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" strokeWidth="5" className="stroke-tl-bg-elevated" />
                  <circle
                    cx="28" cy="28" r="22" fill="none" strokeWidth="5"
                    className="stroke-tl-gold"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - pctComplete / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono text-tl-gold">
                  {pctComplete}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-tl-text-primary">Profile Strength</p>
                <p className="text-xs text-tl-text-secondary">{doneCount}/{totalSections} sections</p>
              </div>
            </div>

            <div className="space-y-2">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2.5 w-full text-left group py-0.5"
                >
                  {checklistStatus[s.id]
                    ? <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0" />
                    : <Circle className="w-4 h-4 text-tl-text-secondary shrink-0 group-hover:text-tl-gold transition-colors" />
                  }
                  <span className={cn(
                    'text-xs transition-colors',
                    checklistStatus[s.id]
                      ? 'text-tl-text-secondary line-through'
                      : 'text-tl-text-primary group-hover:text-tl-gold',
                  )}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: PROFILE SECTIONS ───────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── SECTION A: PERSONAL INFO ─────────────────────────────────── */}
          <SectionCard id="personal" title="Personal Info" icon={<User className="w-4 h-4" />} accentColor="gold">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group w-20 h-20 shrink-0">
                <img
                  src={avatarDisplay}
                  alt={name || 'Avatar'}
                  className="w-20 h-20 rounded-full ring-2 ring-tl-gold object-cover bg-tl-bg-elevated"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploadingAvatar
                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                    : <Camera className="w-4 h-4 text-white" />
                  }
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-tl-text-primary">{name || 'Your Name'}</p>
                <p className="text-xs text-tl-text-secondary">{headline || 'Professional Headline'}</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs text-tl-gold hover:underline mt-1"
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-tl-text-secondary">Full Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-tl-text-secondary">
                  Professional Headline
                  <span className="ml-1 text-[10px] text-tl-text-secondary font-mono">{headline.length}/120</span>
                </Label>
                <Input
                  value={headline}
                  onChange={e => setHeadline(e.target.value.slice(0, 120))}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-tl-text-secondary">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                  <Input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="pl-9 bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-tl-text-secondary">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="pl-9 bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-tl-text-secondary">
                Bio
                <span className="ml-1 text-[10px] font-mono">{bio.length}/500</span>
              </Label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Tell companies about your background, what you're passionate about, and what you're looking for..."
                className="resize-none bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-tl-text-secondary">Languages</Label>
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default min-h-[2.5rem]">
                {languages.map(lang => (
                  <span key={lang} className="inline-flex items-center gap-1 tl-tag-teal">
                    <Languages className="w-2.5 h-2.5" />
                    {lang}
                    <button
                      type="button"
                      onClick={() => setLanguages(p => p.filter(l => l !== lang))}
                      className="hover:text-tl-rose ml-0.5"
                    >
                      <XIcon className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  value={langInput}
                  onChange={e => setLangInput(e.target.value)}
                  onKeyDown={handleLangKeydown}
                  className="flex-1 min-w-[120px] bg-transparent text-xs text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none"
                  placeholder="Type language, press Enter…"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <SaveBtn saving={savingPersonal} onSave={savePersonal} />
            </div>
          </SectionCard>

          {/* ── SECTION B: WORK EXPERIENCE ────────────────────────────────── */}
          <SectionCard id="experience" title="Work Experience" icon={<Briefcase className="w-4 h-4" />} accentColor="violet">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setShowExpForm(true); setEditExpId(null); setExpForm(EMPTY_EXP) }}
                className="btn-ghost text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <AnimatePresence>
              {showExpForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-tl-bg-elevated border border-tl-border-default rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-tl-text-primary">
                      {editExpId ? 'Edit Experience' : 'Add Experience'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Company *</Label>
                        <Input
                          placeholder="e.g. Stripe"
                          value={expForm.company}
                          onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Job Title *</Label>
                        <Input
                          placeholder="e.g. Senior Engineer"
                          value={expForm.title}
                          onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Start Date *</Label>
                        <Input
                          type="month"
                          value={expForm.startDate}
                          onChange={e => setExpForm(f => ({ ...f, startDate: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">End Date</Label>
                        <Input
                          type="month"
                          value={expForm.endDate}
                          disabled={expForm.current}
                          onChange={e => setExpForm(f => ({ ...f, endDate: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold disabled:opacity-50"
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            id="current-exp"
                            checked={expForm.current}
                            onCheckedChange={v => setExpForm(f => ({ ...f, current: !!v, endDate: '' }))}
                          />
                          <label htmlFor="current-exp" className="text-xs text-tl-text-secondary cursor-pointer">
                            Currently working here
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-tl-text-secondary">Description</Label>
                      <Textarea
                        placeholder="Key responsibilities and achievements…"
                        value={expForm.description}
                        onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="resize-none bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-tl-text-secondary">Skills Used (comma-separated)</Label>
                      <Input
                        placeholder="React, TypeScript, GraphQL"
                        value={expForm.skills}
                        onChange={e => setExpForm(f => ({ ...f, skills: e.target.value }))}
                        className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost text-sm"
                        onClick={() => { setShowExpForm(false); setEditExpId(null); setExpForm(EMPTY_EXP) }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-gold text-sm flex items-center gap-1"
                        onClick={handleSaveExp}
                      >
                        <Save className="w-4 h-4" /> Save Entry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {experiences.length === 0 && !showExpForm && (
                <div className="text-center py-8 text-tl-text-secondary">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No work experience added yet</p>
                  <p className="text-xs mt-1 text-tl-text-secondary">Add at least one role to strengthen your profile</p>
                </div>
              )}
              {experiences.map(exp => (
                <div
                  key={exp.id}
                  className="relative p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/20 transition-all group border-l-4 border-l-violet-500/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-tl-text-primary">{exp.title}</h3>
                        {exp.current && <span className="tl-tag-teal text-[10px]">Current</span>}
                      </div>
                      <p className="text-sm text-tl-gold font-medium">{exp.company}</p>
                      <p className="text-xs text-tl-text-secondary mt-0.5 font-mono">
                        {fmtPeriod(exp.startDate, exp.endDate, exp.current)}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-tl-text-secondary mt-2 leading-relaxed line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.skills.map(s => (
                            <span key={s} className="tl-tag-gold text-[10px]">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-tl-text-secondary hover:text-tl-gold"
                        onClick={() => handleEditExp(exp.id)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-tl-text-secondary hover:text-tl-rose"
                        onClick={() => setExperiences(p => p.filter(e => e.id !== exp.id))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {experiences.length > 0 && (
              <div className="flex justify-end pt-1">
                <SaveBtn saving={savingExp} onSave={saveExperience} />
              </div>
            )}
          </SectionCard>

          {/* ── SECTION C: EDUCATION ──────────────────────────────────────── */}
          <SectionCard id="education" title="Education" icon={<GraduationCap className="w-4 h-4" />} accentColor="teal">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setShowEduForm(true); setEditEduId(null); setEduForm(EMPTY_EDU) }}
                className="btn-ghost text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Education
              </button>
            </div>

            <AnimatePresence>
              {showEduForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-tl-bg-elevated border border-tl-border-default rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-tl-text-primary">
                      {editEduId ? 'Edit Education' : 'Add Education'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs text-tl-text-secondary">Institution *</Label>
                        <Input
                          placeholder="e.g. MIT, Stanford University"
                          value={eduForm.institution}
                          onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Degree *</Label>
                        <Input
                          placeholder="e.g. B.S., M.S., Ph.D."
                          value={eduForm.degree}
                          onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Field of Study</Label>
                        <Input
                          placeholder="e.g. Computer Science"
                          value={eduForm.field}
                          onChange={e => setEduForm(f => ({ ...f, field: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Start Date</Label>
                        <Input
                          type="month"
                          value={eduForm.startDate}
                          onChange={e => setEduForm(f => ({ ...f, startDate: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">End Date</Label>
                        <Input
                          type="month"
                          value={eduForm.endDate}
                          onChange={e => setEduForm(f => ({ ...f, endDate: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">GPA (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          placeholder="e.g. 3.8"
                          value={eduForm.gpa}
                          onChange={e => setEduForm(f => ({ ...f, gpa: e.target.value }))}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn-ghost text-sm"
                        onClick={() => { setShowEduForm(false); setEditEduId(null); setEduForm(EMPTY_EDU) }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-gold text-sm flex items-center gap-1"
                        onClick={handleSaveEdu}
                      >
                        <Save className="w-4 h-4" /> Save Entry
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {educations.length === 0 && !showEduForm && (
                <div className="text-center py-8 text-tl-text-secondary">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No education added yet</p>
                </div>
              )}
              {educations.map(edu => (
                <div
                  key={edu.id}
                  className="relative p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-teal/20 transition-all group border-l-4 border-l-tl-teal/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-tl-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-tl-text-primary">{edu.institution}</h3>
                      <p className="text-sm text-tl-teal font-medium">
                        {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                      </p>
                      <p className="text-xs text-tl-text-secondary mt-0.5 font-mono">
                        {fmtPeriod(edu.startDate, edu.endDate)}
                      </p>
                      {edu.gpa != null && (
                        <p className="text-xs text-tl-text-secondary mt-1">
                          GPA: <span className="text-tl-text-primary font-mono font-medium">{edu.gpa}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-tl-text-secondary hover:text-tl-gold"
                        onClick={() => handleEditEdu(edu.id)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-tl-text-secondary hover:text-tl-rose"
                        onClick={() => setEducations(p => p.filter(e => e.id !== edu.id))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {educations.length > 0 && (
              <div className="flex justify-end pt-1">
                <SaveBtn saving={savingEdu} onSave={saveEducation} />
              </div>
            )}
          </SectionCard>

          {/* ── SECTION D: SKILLS ─────────────────────────────────────────── */}
          <SectionCard id="skills" title="Skills" icon={<Zap className="w-4 h-4" />} accentColor="teal">
            <div className="flex items-center justify-between">
              <p className="text-xs text-tl-text-secondary">
                {skills.length}/20 skills
              </p>
              <button
                type="button"
                onClick={() => setShowSkillInput(v => !v)}
                disabled={skills.length >= 20}
                className="btn-ghost text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            <AnimatePresence>
              {showSkillInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
                    <div className="flex-1 min-w-[150px] space-y-1.5">
                      <Label className="text-xs text-tl-text-secondary">Skill Name</Label>
                      <Input
                        placeholder="e.g. TypeScript"
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                        autoFocus
                        className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                      />
                    </div>
                    <div className="w-[170px] space-y-1.5">
                      <Label className="text-xs text-tl-text-secondary">Level</Label>
                      <Select value={newSkillLevel} onValueChange={v => setNewSkillLevel(v as SkillLevel)}>
                        <SelectTrigger className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-gold text-sm flex items-center gap-1"
                        onClick={handleAddSkill}
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                      <button
                        type="button"
                        className="btn-ghost text-sm"
                        onClick={() => setShowSkillInput(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {skills.length === 0 && !showSkillInput && (
              <div className="text-center py-6 text-tl-text-secondary">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No skills added yet</p>
                <p className="text-xs mt-1">Add at least 3 skills to complete this section</p>
              </div>
            )}

            {/* Verified skills */}
            {skills.filter(s => s.verified).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-tl-teal" />
                  <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider">
                    Verified
                  </p>
                  <span className="tl-tag-teal text-[10px]">{skills.filter(s => s.verified).length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => s.verified).map(skill => (
                    <div
                      key={skill.name}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tl-teal/10 border border-tl-teal/30 text-sm text-tl-teal font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {skill.name}
                      <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', LEVEL_COLORS[skill.level])}>
                        {skill.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSkills(p => p.filter(s => s.name !== skill.name))}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-tl-rose"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self-reported skills */}
            {skills.filter(s => !s.verified).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-tl-gold" />
                  <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider">
                    Self-reported
                  </p>
                  <span className="tl-tag-gold text-[10px]">{skills.filter(s => !s.verified).length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.filter(s => !s.verified).map(skill => (
                    <div
                      key={skill.name}
                      className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-sm text-tl-text-secondary"
                    >
                      {skill.name}
                      <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', LEVEL_COLORS[skill.level])}>
                        {skill.level}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSkills(p => p.filter(s => s.name !== skill.name))}
                        className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-tl-rose"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="flex justify-end pt-1">
                <SaveBtn saving={savingSkills} onSave={saveSkills} />
              </div>
            )}
          </SectionCard>

          {/* ── SECTION E: JOB PREFERENCES ────────────────────────────────── */}
          <SectionCard id="preferences" title="Job Preferences" icon={<Star className="w-4 h-4" />} accentColor="gold">
            {/* Open to work — auto-saves immediately */}
            <div className={cn(
              'flex items-center justify-between p-4 rounded-xl border transition-all',
              availability === 'open'
                ? 'bg-tl-teal/5 border-tl-teal/30'
                : 'bg-tl-bg-elevated border-tl-border-default'
            )}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-tl-text-primary">
                    {availability === 'open' ? 'Open to Opportunities' : 'Not Looking'}
                  </p>
                  {savingAvailability && (
                    <span className="text-[10px] text-tl-text-secondary animate-pulse">Saving…</span>
                  )}
                </div>
                <p className={cn('text-xs mt-0.5', availability === 'open' ? 'text-tl-teal' : 'text-tl-text-secondary')}>
                  {availability === 'open' ? '✓ Visible to recruiters' : 'Hidden from recruiter searches'}
                </p>
              </div>
              <ToggleSwitch
                checked={availability === 'open'}
                onChange={v => handleAvailabilityToggle(v ? 'open' : 'not-looking')}
              />
            </div>

            {/* Work mode */}
            <div className="space-y-2">
              <Label className="text-xs text-tl-text-secondary">Work Mode</Label>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => togglePref(workPref, setWorkPref, m)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
                      workPref.includes(m)
                        ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
                        : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20',
                    )}
                  >
                    {workPref.includes(m) && <Check className="w-3.5 h-3.5" />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Job type */}
            <div className="space-y-2">
              <Label className="text-xs text-tl-text-secondary">Job Type</Label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => togglePref(jobTypePref, setJobTypePref, t)}
                    className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
                      jobTypePref.includes(t)
                        ? 'bg-tl-teal/15 border-tl-teal/40 text-tl-teal'
                        : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-teal/20',
                    )}
                  >
                    {jobTypePref.includes(t) && <Check className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-1.5">
              <Label className="text-xs text-tl-text-secondary">Salary Expectation (USD / year)</Label>
              <div className="relative w-48">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                <Input
                  type="number"
                  value={salaryExpectation}
                  onChange={e => setSalaryExpectation(e.target.value)}
                  placeholder="e.g. 150000"
                  className="pl-9 bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold font-mono"
                />
              </div>
            </div>

            {/* Notice period */}
            <div className="space-y-1.5">
              <Label className="text-xs text-tl-text-secondary">Notice Period</Label>
              <Select value={noticePeriod || ''} onValueChange={setNoticePeriod}>
                <SelectTrigger className="w-48 bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_PERIODS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Industries */}
            <div className="space-y-2">
              <Label className="text-xs text-tl-text-secondary">Preferred Industries</Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => togglePref(industryPref, setIndustryPref, ind)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      industryPref.includes(ind)
                        ? 'bg-tl-blue/15 border-tl-blue/40 text-tl-blue'
                        : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-blue/20',
                    )}
                  >
                    {industryPref.includes(ind) && <Check className="w-3 h-3" />}
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <SaveBtn saving={savingPrefs} onSave={savePreferences} />
            </div>
          </SectionCard>

          {/* ── SECTION F: LINKS ──────────────────────────────────────────── */}
          <SectionCard id="links" title="Links" icon={<LinkIcon className="w-4 h-4" />} accentColor="blue">
            <div className="space-y-3">
              {[
                {
                  icon: Github,
                  label: 'GitHub',
                  value: github,
                  setter: setGithub,
                  placeholder: 'https://github.com/username',
                },
                {
                  icon: Linkedin,
                  label: 'LinkedIn',
                  value: linkedin,
                  setter: setLinkedin,
                  placeholder: 'https://linkedin.com/in/username',
                },
                {
                  icon: Globe,
                  label: 'Portfolio / Website',
                  value: portfolio,
                  setter: setPortfolio,
                  placeholder: 'https://yoursite.com',
                },
              ].map(({ icon: Icon, label, value, setter, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-xs text-tl-text-secondary">{label}</Label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                    <Input
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder={placeholder}
                      className="pl-9 bg-tl-bg-surface border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-1">
              <SaveBtn saving={savingLinks} onSave={saveLinks} />
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}
