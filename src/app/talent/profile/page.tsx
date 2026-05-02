'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTalentProfile, updateTalentProfile } from '@/lib/api'
import type { Candidate } from '@/lib/types'
import { cn } from '@/lib/utils'
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
  Download,
  Share2,
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
  Eye,
  Bookmark,
} from 'lucide-react'

// ─── Tab definition ───────────────────────────────────────────────────────────
const TABS = ['About', 'Experience', 'Education', 'Skills', 'Preferences'] as const
type Tab = typeof TABS[number]

// ─── Types ────────────────────────────────────────────────────────────────────
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner:     'bg-tl-bg-elevated text-tl-text-secondary border border-tl-border-default',
  intermediate: 'tl-tag-blue',
  advanced:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  expert:       'tl-tag-teal',
}

const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const
const JOB_TYPES  = ['full-time', 'part-time', 'contract', 'internship', 'freelance'] as const
const INDUSTRIES = ['FinTech', 'Developer Tools', 'SaaS', 'E-commerce', 'HealthTech', 'EdTech', 'AI/ML', 'Cybersecurity', 'Web3', 'Gaming']
const NOTICE_PERIODS = ['Immediately', '2 weeks', '1 month', '2 months', '3 months']

interface ExpForm {
  company: string; title: string; startDate: string; endDate: string; current: boolean; description: string; skills: string
}
interface EduForm {
  institution: string; degree: string; field: string; startDate: string; endDate: string; gpa: string
}

const EMPTY_EXP: ExpForm = { company: '', title: '', startDate: '', endDate: '', current: false, description: '', skills: '' }
const EMPTY_EDU: EduForm = { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }

function fmtPeriod(start: string, end?: string, current?: boolean) {
  const fmt = (d: string) => {
    const [y, m] = d.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(m) - 1]} ${y}`
  }
  return `${fmt(start)} → ${current ? 'Present' : (end ? fmt(end) : '')}`
}

// ─── Checklist ───────────────────────────────────────────────────────────────
const INITIAL_CHECKLIST = [
  { id: 1, text: 'Basic Info',                 done: true },
  { id: 2, text: 'Work Experience (3 roles)',  done: true },
  { id: 3, text: 'Education',                  done: true },
  { id: 4, text: 'Skills (12)',                done: true },
  { id: 5, text: 'Certifications',             done: false },
  { id: 6, text: 'Portfolio',                  done: false },
  { id: 7, text: 'References',                 done: true },
]

// ─── Toggle Switch component ──────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0',
        checked ? 'bg-tl-teal' : 'bg-tl-bg-elevated'
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
          checked && 'translate-x-[18px]'
        )}
      />
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [activeTab, setActiveTab]   = useState<Tab>('About')
  const [isAvailable, setIsAvailable] = useState(true)
  const [profile, setProfile]       = useState<Candidate | null>(null)
  const [loading, setLoading]       = useState(true)

  // About
  const [headline, setHeadline]   = useState('Senior Frontend Engineer')
  const [bio, setBio]             = useState('')
  const [location, setLocation]   = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [langInput, setLangInput] = useState('')
  const [savedAbout, setSavedAbout] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [salaryMin, setSalaryMin] = useState('145000')
  const [salaryMax, setSalaryMax] = useState('165000')

  // Experience
  const [experiences, setExperiences] = useState<Candidate['experience']>([])
  const [showExpForm, setShowExpForm] = useState(false)
  const [editExpId, setEditExpId]     = useState<string | null>(null)
  const [expForm, setExpForm]         = useState<ExpForm>(EMPTY_EXP)

  // Education
  const [educations, setEducations] = useState<Candidate['education']>([])
  const [showEduForm, setShowEduForm] = useState(false)
  const [editEduId, setEditEduId]     = useState<string | null>(null)
  const [eduForm, setEduForm]         = useState<EduForm>(EMPTY_EDU)

  // Skills
  const [skills, setSkills]               = useState<Candidate['skills']>([])
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [newSkillName, setNewSkillName]   = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate')

  // Preferences
  const [workPref, setWorkPref]           = useState<string[]>([])
  const [jobTypePref, setJobTypePref]     = useState<string[]>(['full-time', 'contract'])
  const [industryPref, setIndustryPref]   = useState<string[]>(['FinTech', 'Developer Tools', 'SaaS'])
  const [openRelocation, setOpenRelocation] = useState(false)
  const [noticePeriod, setNoticePeriod]   = useState('2 weeks')

  // Social
  const [github, setGithub]       = useState('')
  const [linkedin, setLinkedin]   = useState('')
  const [portfolio, setPortfolio] = useState('')

  // Checklist
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST)

  // Load profile from API
  useEffect(() => {
    async function load() {
      const res = await getTalentProfile()
      if (res.data) {
        const p = res.data
        setProfile(p)
        setBio(p.bio ?? '')
        setLocation(p.location ?? '')
        setLanguages(p.languages ?? [])
        setExperiences(p.experience ?? [])
        setEducations(p.education ?? [])
        setSkills(p.skills ?? [])
        setWorkPref(p.workPreference ?? [])
        setGithub(p.github ?? '')
        setLinkedin(p.linkedin ?? '')
        setPortfolio(p.portfolio ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const profileScore  = 82
  const doneCount     = checklist.filter(c => c.done).length
  const verifiedSkills = skills.filter(s => s.verified)
  const selfSkills     = skills.filter(s => !s.verified)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-tl-teal border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleLangKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && langInput.trim()) {
      e.preventDefault()
      if (!languages.includes(langInput.trim())) setLanguages([...languages, langInput.trim()])
      setLangInput('')
    }
  }

  function handleSaveExp() {
    if (!expForm.company || !expForm.title || !expForm.startDate) return
    const entry = {
      id: editExpId ?? `e-${Date.now()}`,
      company: expForm.company, title: expForm.title,
      startDate: expForm.startDate, endDate: expForm.current ? undefined : expForm.endDate,
      current: expForm.current, description: expForm.description,
      skills: expForm.skills.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (editExpId) setExperiences(p => p.map(e => e.id === editExpId ? entry : e))
    else           setExperiences(p => [entry, ...p])
    setExpForm(EMPTY_EXP); setShowExpForm(false); setEditExpId(null)
  }

  function handleEditExp(id: string) {
    const exp = experiences.find(e => e.id === id); if (!exp) return
    setExpForm({ company: exp.company, title: exp.title, startDate: exp.startDate, endDate: exp.endDate ?? '', current: exp.current, description: exp.description, skills: exp.skills.join(', ') })
    setEditExpId(id); setShowExpForm(true)
  }

  function handleSaveEdu() {
    if (!eduForm.institution || !eduForm.degree) return
    const entry = {
      id: editEduId ?? `edu-${Date.now()}`,
      institution: eduForm.institution, degree: eduForm.degree, field: eduForm.field,
      startDate: eduForm.startDate, endDate: eduForm.endDate,
      gpa: eduForm.gpa ? parseFloat(eduForm.gpa) : undefined,
    }
    if (editEduId) setEducations(p => p.map(e => e.id === editEduId ? entry : e))
    else           setEducations(p => [...p, entry])
    setEduForm(EMPTY_EDU); setShowEduForm(false); setEditEduId(null)
  }

  function handleEditEdu(id: string) {
    const edu = educations.find(e => e.id === id); if (!edu) return
    setEduForm({ institution: edu.institution, degree: edu.degree, field: edu.field, startDate: edu.startDate, endDate: edu.endDate, gpa: edu.gpa ? String(edu.gpa) : '' })
    setEditEduId(id); setShowEduForm(true)
  }

  function handleAddSkill() {
    if (!newSkillName.trim()) return
    setSkills(p => [...p, { name: newSkillName.trim(), level: newSkillLevel, verified: false }])
    setNewSkillName(''); setNewSkillLevel('intermediate'); setShowSkillInput(false)
  }

  function togglePref<T extends string>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const tabVariants = {
    hidden: { opacity: 0, y: 8 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit:   { opacity: 0, y: -8, transition: { duration: 0.2 } },
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── PROFILE HERO BANNER ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="tl-card-elevated relative overflow-hidden mb-8"
      >
        {/* Gold gradient overlay at top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-tl-gold/60 via-tl-gold to-tl-gold/60" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-tl-gold/5 via-transparent to-tl-teal/5 pointer-events-none" />
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-tl-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-tl-teal/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar with gold ring */}
          <div className="relative group w-24 h-24 shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=b6e3f4`}
              alt="Alex"
              className="w-24 h-24 rounded-full ring-2 ring-tl-gold object-cover"
            />
            <button className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-tl-text-primary">{profile?.name ?? 'Your Profile'}</h1>
            <p className="text-tl-text-secondary mt-0.5">{headline}</p>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-tl-text-secondary">
              <MapPin className="w-3.5 h-3.5" />{location}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-tl-text-secondary">Profile Strength {profileScore}%</span>
                <div className="w-24 h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden">
                  <div className="h-full rounded-full bg-tl-gold" style={{ width: `${profileScore}%` }} />
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
                <Eye className="w-3.5 h-3.5" /> 47 views this week
              </span>
              <span className="flex items-center gap-1.5 text-xs text-tl-text-secondary">
                <Bookmark className="w-3.5 h-3.5" /> 12 companies saved you
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="btn-ghost gap-2 flex items-center text-sm">
                <Download className="w-3.5 h-3.5" /> Download Resume
              </button>
              <button className="btn-ghost gap-2 flex items-center text-sm">
                <Share2 className="w-3.5 h-3.5" /> Share Profile
              </button>
              <button className="btn-ghost gap-2 flex items-center text-sm text-tl-text-secondary hover:text-tl-text-primary">
                <Eye className="w-3.5 h-3.5" /> Preview as Recruiter
              </button>
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('text-xs font-medium', isAvailable ? 'text-tl-teal' : 'text-tl-text-secondary')}>
              {isAvailable ? 'Available' : 'Not Looking'}
            </span>
            <ToggleSwitch checked={isAvailable} onChange={setIsAvailable} />
          </div>
        </div>
      </motion.div>

      {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">

          {/* Availability */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="tl-card p-5"
          >
            <h3 className="text-sm font-semibold text-tl-text-primary mb-4">Availability</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-tl-text-primary">
                  {isAvailable ? 'Open to Opportunities' : 'Not Looking'}
                </p>
                <p className="text-xs text-tl-text-secondary mt-0.5">
                  {isAvailable ? 'Visible to recruiters' : 'Hidden from recruiters'}
                </p>
              </div>
              <ToggleSwitch checked={isAvailable} onChange={setIsAvailable} />
            </div>
            <div>
              <p className="text-xs text-tl-text-secondary mb-2 font-medium">Preferred Work Modes</p>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map(m => {
                  const active = workPref.includes(m)
                  return (
                    <button
                      key={m}
                      onClick={() => togglePref(workPref, setWorkPref, m)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize',
                        active
                          ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
                          : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20'
                      )}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-tl-text-secondary mb-1 font-medium">Start Date</p>
              <Select defaultValue="immediately">
                <SelectTrigger className="h-8 text-xs bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="2-weeks">2 weeks notice</SelectItem>
                  <SelectItem value="1-month">1 month notice</SelectItem>
                  <SelectItem value="3-months">3 months notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Profile Checklist */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.14 }}
            className="tl-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-tl-text-primary">Profile Checklist</h3>
              <span className="text-sm font-mono font-bold text-tl-gold">{doneCount}/7 complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-tl-bg-elevated overflow-hidden mb-4">
              <div className="h-full rounded-full bg-tl-gold" style={{ width: `${(doneCount / 7) * 100}%` }} />
            </div>
            <div className="space-y-2.5">
              {checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => setChecklist(p => p.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                  className="flex items-center gap-3 w-full text-left group"
                >
                  {item.done
                    ? <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0" />
                    : <Circle className="w-4 h-4 text-tl-text-secondary shrink-0 group-hover:text-tl-gold transition-colors" />
                  }
                  <span className={cn(
                    'text-xs',
                    item.done ? 'line-through text-tl-text-secondary' : 'text-tl-text-primary group-hover:text-tl-gold transition-colors'
                  )}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
            <button className="btn-ghost w-full mt-4 text-xs h-7 flex items-center justify-center">
              Add Missing Items
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="tl-card p-5"
          >
            <h3 className="text-sm font-semibold text-tl-text-primary mb-3">Social Links</h3>
            <div className="space-y-2.5">
              {[
                { icon: Github,   label: 'GitHub',    value: github,    setter: setGithub,    placeholder: 'github.com/username' },
                { icon: Linkedin, label: 'LinkedIn',  value: linkedin,  setter: setLinkedin,  placeholder: 'linkedin.com/in/...' },
                { icon: Globe,    label: 'Portfolio', value: portfolio, setter: setPortfolio, placeholder: 'yoursite.com' },
              ].map(({ icon: Icon, label, value, setter, placeholder }) => (
                <div key={label} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                  <Input
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    className="pl-9 h-8 text-xs bg-tl-bg-surface border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold focus:ring-tl-gold/20"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Salary Expectations */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="tl-card p-5"
          >
            <h3 className="text-sm font-semibold text-tl-text-primary mb-3">Salary Expectations</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                <Input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  className="pl-8 h-8 text-xs bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold font-mono"
                  placeholder="Min"
                />
              </div>
              <span className="text-tl-text-secondary text-xs">–</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tl-text-secondary" />
                <Input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  className="pl-8 h-8 text-xs bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold font-mono"
                  placeholder="Max"
                />
              </div>
            </div>
            <p className="text-[10px] text-tl-text-secondary mt-2">USD per year</p>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN: TABS ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {/* Tab nav */}
          <div className="flex gap-1 border-b border-tl-border-subtle mb-6 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-tl-gold text-tl-gold'
                    : 'border-transparent text-tl-text-secondary hover:text-tl-text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">

            {/* ── ABOUT ──────────────────────────────────────────────────────── */}
            {activeTab === 'About' && (
              <motion.div key="about" variants={tabVariants} initial="hidden" animate="show" exit="exit" className="space-y-5">
                <div className="tl-card p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-tl-gold" />
                    </div>
                    <h2 className="text-base font-display font-semibold text-tl-text-primary">About You</h2>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Professional Headline</Label>
                    <Input
                      id="headline"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold focus:ring-tl-gold/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Summary</Label>
                    <Textarea
                      id="summary"
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={5}
                      className="resize-none bg-tl-bg-surface border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold focus:ring-tl-gold/20"
                      placeholder="Tell companies about yourself..."
                    />
                    <p className="text-xs text-tl-text-secondary text-right font-mono">{bio.length}/500</p>
                  </div>

                  {/* Personal Info */}
                  <div className="tl-card p-5 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-tl-text-secondary text-xs">Email</Label>
                      <Input id="email" value={profile?.email ?? ''} readOnly className="opacity-70 bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-tl-text-secondary text-xs">Phone</Label>
                      <Input id="phone" value={profile?.phone ?? ''} readOnly className="opacity-70 bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-tl-text-secondary text-xs">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                        <Input
                          id="city"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          className="pl-9 bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold focus:ring-tl-gold/20"
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-tl-text-secondary text-xs">Languages</Label>
                      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default min-h-[2.5rem]">
                        {languages.map(lang => (
                          <span key={lang} className="inline-flex items-center gap-1 tl-tag-teal">
                            <Languages className="w-2.5 h-2.5" />{lang}
                            <button onClick={() => setLanguages(languages.filter(l => l !== lang))} className="hover:text-tl-rose ml-0.5">
                              <XIcon className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                        <input
                          value={langInput}
                          onChange={e => setLangInput(e.target.value)}
                          onKeyDown={handleLangKeydown}
                          className="flex-1 min-w-[100px] bg-transparent text-xs text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none"
                          placeholder="Add language, press Enter..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 flex-col items-end gap-2">
                    {saveError && <p className="text-xs text-tl-rose">{saveError}</p>}
                    <button
                      onClick={async () => {
                        setSaveError(null)
                        const res = await updateTalentProfile({ bio, location, languages, github, linkedin, portfolio })
                        if (res.error) {
                          setSaveError(res.error)
                        } else {
                          setSavedAbout(true)
                          setTimeout(() => setSavedAbout(false), 2500)
                        }
                      }}
                      className="btn-gold gap-2 flex items-center"
                    >
                      {savedAbout
                        ? <><Check className="w-4 h-4" /> Saved!</>
                        : <><Save className="w-4 h-4" /> Save Changes</>
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EXPERIENCE ─────────────────────────────────────────────────── */}
            {activeTab === 'Experience' && (
              <motion.div key="experience" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                <div className="tl-card p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-violet-400" />
                      </div>
                      <h2 className="text-base font-display font-semibold text-tl-text-primary">Work Experience</h2>
                    </div>
                    <button className="btn-ghost text-sm flex items-center gap-1" onClick={() => { setShowExpForm(true); setEditExpId(null); setExpForm(EMPTY_EXP) }}>
                      <Plus className="w-4 h-4 mr-1" /> Add Experience
                    </button>
                  </div>

                  {showExpForm && (
                    <div className="bg-tl-bg-elevated border border-tl-border-default rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-tl-text-primary">{editExpId ? 'Edit Experience' : 'Add Experience'}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Company *</Label><Input placeholder="e.g. Stripe" value={expForm.company} onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Job Title *</Label><Input placeholder="e.g. Senior Engineer" value={expForm.title} onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Start Date *</Label><Input type="month" value={expForm.startDate} onChange={e => setExpForm(f => ({ ...f, startDate: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-tl-text-secondary">End Date</Label>
                          <Input type="month" value={expForm.endDate} onChange={e => setExpForm(f => ({ ...f, endDate: e.target.value }))} disabled={expForm.current} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold disabled:opacity-50" />
                          <div className="flex items-center gap-2 mt-1">
                            <Checkbox id="current-exp" checked={expForm.current} onCheckedChange={v => setExpForm(f => ({ ...f, current: !!v, endDate: '' }))} />
                            <label htmlFor="current-exp" className="text-xs text-tl-text-secondary cursor-pointer">Currently working here</label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Description</Label><Textarea placeholder="Responsibilities and achievements..." value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} rows={3} className="resize-none bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                      <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Skills Used</Label><Input placeholder="React, TypeScript, GraphQL" value={expForm.skills} onChange={e => setExpForm(f => ({ ...f, skills: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost text-sm" onClick={() => { setShowExpForm(false); setEditExpId(null); setExpForm(EMPTY_EXP) }}>Cancel</button>
                        <button className="btn-gold text-sm flex items-center gap-1" onClick={handleSaveExp}><Save className="w-4 h-4 mr-1" /> Save</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="relative p-5 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/20 transition-all duration-200 group border-l-4 border-l-tl-gold/40">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-tl-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h3 className="text-sm font-semibold text-tl-text-primary">{exp.title}</h3>
                              {exp.current && <span className="tl-tag-teal text-[10px]">Current</span>}
                            </div>
                            <p className="text-sm text-tl-gold font-medium">{exp.company}</p>
                            <p className="text-xs text-tl-text-secondary mt-0.5 font-mono">{fmtPeriod(exp.startDate, exp.endDate, exp.current)}</p>
                            {exp.description && <p className="text-xs text-tl-text-secondary mt-2 leading-relaxed">{exp.description}</p>}
                            {exp.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {exp.skills.map(s => (
                                  <span key={s} className="tl-tag-gold text-[10px]">{s}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-tl-text-secondary hover:text-tl-gold" onClick={() => handleEditExp(exp.id)}><Edit3 className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-tl-text-secondary hover:text-tl-rose" onClick={() => setExperiences(p => p.filter(e => e.id !== exp.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {experiences.length === 0 && !showExpForm && (
                      <div className="text-center py-8 text-tl-text-secondary">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No experience added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EDUCATION ──────────────────────────────────────────────────── */}
            {activeTab === 'Education' && (
              <motion.div key="education" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                <div className="tl-card p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-tl-teal" />
                      </div>
                      <h2 className="text-base font-display font-semibold text-tl-text-primary">Education</h2>
                    </div>
                    <button className="btn-ghost text-sm flex items-center gap-1" onClick={() => { setShowEduForm(true); setEditEduId(null); setEduForm(EMPTY_EDU) }}>
                      <Plus className="w-4 h-4 mr-1" /> Add Education
                    </button>
                  </div>

                  {showEduForm && (
                    <div className="bg-tl-bg-elevated border border-tl-border-default rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-tl-text-primary">{editEduId ? 'Edit Education' : 'Add Education'}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs text-tl-text-secondary">Institution *</Label><Input placeholder="e.g. MIT" value={eduForm.institution} onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Degree *</Label><Input placeholder="e.g. B.S., M.S." value={eduForm.degree} onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Field of Study</Label><Input placeholder="e.g. Computer Science" value={eduForm.field} onChange={e => setEduForm(f => ({ ...f, field: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">Start Date</Label><Input type="month" value={eduForm.startDate} onChange={e => setEduForm(f => ({ ...f, startDate: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">End Date</Label><Input type="month" value={eduForm.endDate} onChange={e => setEduForm(f => ({ ...f, endDate: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold" /></div>
                        <div className="space-y-1.5"><Label className="text-xs text-tl-text-secondary">GPA (optional)</Label><Input placeholder="e.g. 3.8" type="number" step="0.01" min="0" max="4" value={eduForm.gpa} onChange={e => setEduForm(f => ({ ...f, gpa: e.target.value }))} className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold font-mono" /></div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button className="btn-ghost text-sm" onClick={() => { setShowEduForm(false); setEditEduId(null); setEduForm(EMPTY_EDU) }}>Cancel</button>
                        <button className="btn-gold text-sm flex items-center gap-1" onClick={handleSaveEdu}><Save className="w-4 h-4 mr-1" /> Save</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {educations.map(edu => (
                      <div key={edu.id} className="relative p-5 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/20 transition-all duration-200 group border-l-4 border-l-tl-teal/40">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-tl-teal" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-tl-text-primary">{edu.institution}</h3>
                            <p className="text-sm text-tl-teal">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                            <p className="text-xs text-tl-text-secondary mt-0.5 font-mono">{fmtPeriod(edu.startDate, edu.endDate)}</p>
                            {edu.gpa && <p className="text-xs text-tl-text-secondary mt-1">GPA: <span className="text-tl-text-primary font-mono font-medium">{edu.gpa}</span></p>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-tl-text-secondary hover:text-tl-gold" onClick={() => handleEditEdu(edu.id)}><Edit3 className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-tl-text-secondary hover:text-tl-rose" onClick={() => setEducations(p => p.filter(e => e.id !== edu.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SKILLS ─────────────────────────────────────────────────────── */}
            {activeTab === 'Skills' && (
              <motion.div key="skills" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                <div className="tl-card p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-tl-teal" />
                      </div>
                      <h2 className="text-base font-display font-semibold text-tl-text-primary">Skills</h2>
                    </div>
                    <button className="btn-gold text-sm flex items-center gap-1" onClick={() => setShowSkillInput(!showSkillInput)}>
                      <Plus className="w-4 h-4 mr-1" /> Add Skill
                    </button>
                  </div>

                  {showSkillInput && (
                    <div className="flex flex-wrap gap-3 items-end p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
                      <div className="flex-1 min-w-[160px] space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Skill Name</Label>
                        <Input
                          placeholder="e.g. Rust"
                          value={newSkillName}
                          onChange={e => setNewSkillName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                          className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary focus:border-tl-gold"
                        />
                      </div>
                      <div className="w-[180px] space-y-1.5">
                        <Label className="text-xs text-tl-text-secondary">Level</Label>
                        <Select value={newSkillLevel} onValueChange={v => setNewSkillLevel(v as SkillLevel)}>
                          <SelectTrigger className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button className="btn-gold text-sm flex items-center gap-1" onClick={handleAddSkill}><Plus className="w-4 h-4 mr-1" /> Add</button>
                      <button className="btn-ghost text-sm" onClick={() => setShowSkillInput(false)}>Cancel</button>
                    </div>
                  )}

                  {/* Verified Skills */}
                  {verifiedSkills.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-tl-teal" />
                        <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider">AI-Verified Skills</p>
                        <span className="tl-tag-teal text-[10px]">
                          {verifiedSkills.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {verifiedSkills.map(skill => (
                          <div key={skill.name} className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tl-teal/10 border border-tl-teal/30 text-sm text-tl-teal font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {skill.name}
                            <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', LEVEL_COLORS[skill.level as SkillLevel])}>{skill.level}</span>
                            <button onClick={() => setSkills(p => p.filter(s => s.name !== skill.name))} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-tl-rose">
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Self-reported Skills */}
                  {selfSkills.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-tl-gold" />
                        <p className="text-xs font-semibold text-tl-text-secondary uppercase tracking-wider">Self-reported Skills</p>
                        <span className="tl-tag-gold text-[10px]">
                          {selfSkills.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selfSkills.map(skill => (
                          <div key={skill.name} className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tl-bg-elevated border border-tl-border-default text-sm text-tl-text-secondary">
                            {skill.name}
                            <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] border', LEVEL_COLORS[skill.level as SkillLevel])}>{skill.level}</span>
                            <button onClick={() => setSkills(p => p.filter(s => s.name !== skill.name))} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-tl-rose">
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-tl-border-subtle">
                    <button className="text-sm text-tl-gold hover:underline">Browse Skill Tests →</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PREFERENCES ────────────────────────────────────────────────── */}
            {activeTab === 'Preferences' && (
              <motion.div key="preferences" variants={tabVariants} initial="hidden" animate="show" exit="exit">
                <div className="tl-card p-6 space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-tl-gold" />
                    </div>
                    <h2 className="text-base font-display font-semibold text-tl-text-primary">Job Preferences</h2>
                  </div>

                  {/* Work Mode */}
                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Work Mode</Label>
                    <div className="flex flex-wrap gap-2">
                      {WORK_MODES.map(m => (
                        <button
                          key={m}
                          onClick={() => togglePref(workPref, setWorkPref, m)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
                            workPref.includes(m)
                              ? 'bg-tl-gold/15 border-tl-gold/40 text-tl-gold'
                              : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-gold/20'
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Job Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {JOB_TYPES.map(t => (
                        <button
                          key={t}
                          onClick={() => togglePref(jobTypePref, setJobTypePref, t)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
                            jobTypePref.includes(t)
                              ? 'bg-tl-teal/15 border-tl-teal/40 text-tl-teal'
                              : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-teal/20'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Industries */}
                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Industry Preferences</Label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map(ind => (
                        <button
                          key={ind}
                          onClick={() => togglePref(industryPref, setIndustryPref, ind)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            industryPref.includes(ind)
                              ? 'bg-tl-blue/15 border-tl-blue/40 text-tl-blue'
                              : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary hover:border-tl-blue/20'
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Open to Relocation + Notice Period */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-tl-text-secondary text-xs">Notice Period</Label>
                      <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                        <SelectTrigger className="bg-tl-bg-surface border-tl-border-default text-tl-text-primary"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {NOTICE_PERIODS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
                      <div>
                        <p className="text-sm font-medium text-tl-text-primary">Open to Relocation</p>
                        <p className="text-xs text-tl-text-secondary">Willing to relocate for the right role</p>
                      </div>
                      <Switch checked={openRelocation} onCheckedChange={setOpenRelocation} />
                    </div>
                  </div>

                  {/* Looking For */}
                  <div className="space-y-2">
                    <Label className="text-tl-text-secondary text-xs">Looking for</Label>
                    <Select defaultValue="ic">
                      <SelectTrigger className="w-64 bg-tl-bg-surface border-tl-border-default text-tl-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ic">IC Role</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button className="btn-gold gap-2 flex items-center"><Save className="w-4 h-4" /> Save Preferences</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
