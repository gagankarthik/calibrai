'use client'

import { useState, KeyboardEvent } from 'react'
import { candidates } from '@/lib/data'
import { formatSalary } from '@/lib/utils'
import { MatchRing } from '@/components/shared/match-score'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
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
  Circle,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
  X,
  Check,
  Shield,
  RotateCcw,
  FlaskConical,
  Save,
  ChevronDown,
  ChevronUp,
  Building2,
  GraduationCap,
  Briefcase,
  Star,
  Zap,
  Languages,
} from 'lucide-react'

const alex = candidates[0]

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

const levelColors: Record<SkillLevel, string> = {
  beginner: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  expert: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const levelLabel: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

const improveItems = [
  { id: 1, text: 'Add a portfolio link', done: !!alex.portfolio },
  { id: 2, text: 'Take TypeScript assessment', done: !!alex.assessmentScores['typescript'] },
  { id: 3, text: 'Add a 2025 project to experience', done: false },
]

const workModes = ['remote', 'hybrid', 'onsite'] as const
const jobTypes = ['full-time', 'part-time', 'contract', 'freelance'] as const
const industries = [
  'FinTech', 'Developer Tools', 'SaaS', 'E-commerce', 'HealthTech',
  'EdTech', 'Gaming', 'AI/ML', 'Cybersecurity', 'Web3',
]
const noticePeriods = ['Immediately', '2 weeks', '1 month', '2 months', '3 months']

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

const emptyExp: ExpForm = {
  company: '', title: '', startDate: '', endDate: '',
  current: false, description: '', skills: '',
}

const emptyEdu: EduForm = {
  institution: '', degree: '', field: '',
  startDate: '', endDate: '', gpa: '',
}

function formatPeriod(start: string, end?: string, current?: boolean) {
  const fmt = (d: string) => {
    const [y, m] = d.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${months[parseInt(m) - 1]} ${y}`
  }
  return `${fmt(start)} → ${current ? 'Present' : (end ? fmt(end) : '')}`
}

export default function ProfilePage() {
  // About state
  const [bio, setBio] = useState(alex.bio)
  const [headline, setHeadline] = useState(alex.title)
  const [location, setLocation] = useState(alex.location)
  const [salary, setSalary] = useState(String(alex.salaryExpectation))
  const [languages, setLanguages] = useState<string[]>(alex.languages)
  const [langInput, setLangInput] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  // Experience state
  const [experiences, setExperiences] = useState(alex.experience)
  const [showExpForm, setShowExpForm] = useState(false)
  const [editExpId, setEditExpId] = useState<string | null>(null)
  const [expForm, setExpForm] = useState<ExpForm>(emptyExp)

  // Education state
  const [educations, setEducations] = useState(alex.education)
  const [showEduForm, setShowEduForm] = useState(false)
  const [editEduId, setEditEduId] = useState<string | null>(null)
  const [eduForm, setEduForm] = useState<EduForm>(emptyEdu)

  // Skills state
  const [skills, setSkills] = useState(alex.skills)
  const [showSkillInput, setShowSkillInput] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('intermediate')

  // Preferences state
  const [workPref, setWorkPref] = useState<string[]>(alex.workPreference)
  const [jobTypePref, setJobTypePref] = useState<string[]>(['full-time', 'contract'])
  const [industryPref, setIndustryPref] = useState<string[]>(['FinTech', 'Developer Tools', 'SaaS'])
  const [openRelocation, setOpenRelocation] = useState(false)
  const [noticePeriod, setNoticePeriod] = useState('2 weeks')
  const [savedAbout, setSavedAbout] = useState(false)

  // Checklist state
  const [checklist, setChecklist] = useState(improveItems)

  function handleLangKeydown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && langInput.trim()) {
      e.preventDefault()
      if (!languages.includes(langInput.trim())) {
        setLanguages([...languages, langInput.trim()])
      }
      setLangInput('')
    }
  }

  function removeLang(lang: string) {
    setLanguages(languages.filter(l => l !== lang))
  }

  function toggleWorkPref(mode: string) {
    setWorkPref(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  function toggleJobType(type: string) {
    setJobTypePref(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function toggleIndustry(ind: string) {
    setIndustryPref(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    )
  }

  function handleSaveExp() {
    if (!expForm.company || !expForm.title || !expForm.startDate) return
    const newExp = {
      id: editExpId ?? `e-${Date.now()}`,
      company: expForm.company,
      title: expForm.title,
      startDate: expForm.startDate,
      endDate: expForm.current ? undefined : expForm.endDate,
      current: expForm.current,
      description: expForm.description,
      skills: expForm.skills.split(',').map(s => s.trim()).filter(Boolean),
    }
    if (editExpId) {
      setExperiences(prev => prev.map(e => e.id === editExpId ? newExp : e))
    } else {
      setExperiences(prev => [newExp, ...prev])
    }
    setExpForm(emptyExp)
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

  function handleDeleteExp(id: string) {
    setExperiences(prev => prev.filter(e => e.id !== id))
  }

  function handleSaveEdu() {
    if (!eduForm.institution || !eduForm.degree) return
    const newEdu = {
      id: editEduId ?? `edu-${Date.now()}`,
      institution: eduForm.institution,
      degree: eduForm.degree,
      field: eduForm.field,
      startDate: eduForm.startDate,
      endDate: eduForm.endDate,
      gpa: eduForm.gpa ? parseFloat(eduForm.gpa) : undefined,
    }
    if (editEduId) {
      setEducations(prev => prev.map(e => e.id === editEduId ? newEdu : e))
    } else {
      setEducations(prev => [...prev, newEdu])
    }
    setEduForm(emptyEdu)
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
      gpa: edu.gpa ? String(edu.gpa) : '',
    })
    setEditEduId(id)
    setShowEduForm(true)
  }

  function handleDeleteEdu(id: string) {
    setEducations(prev => prev.filter(e => e.id !== id))
  }

  function handleAddSkill() {
    if (!newSkillName.trim()) return
    setSkills(prev => [...prev, {
      name: newSkillName.trim(),
      level: newSkillLevel,
      verified: false,
    }])
    setNewSkillName('')
    setNewSkillLevel('intermediate')
    setShowSkillInput(false)
  }

  function handleRemoveSkill(name: string) {
    setSkills(prev => prev.filter(s => s.name !== name))
  }

  const profileScore = 82
  const verifiedSkills = skills.filter(s => s.verified)
  const selfSkills = skills.filter(s => !s.verified)

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build your profile to attract the best opportunities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Zap className="w-3 h-3 mr-1 text-amber-400" />
            Premium
          </Badge>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT PANEL — sticky profile card */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
          {/* Profile Card */}
          <div className="glass-card p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative group">
                <Avatar className="h-20 w-20 ring-4 ring-white/10">
                  <AvatarImage src={alex.avatar} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    AC
                  </AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{alex.name}</h2>
                <p className="text-sm text-muted-foreground">{headline}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{location}</span>
                </div>
              </div>

              {/* Match Ring */}
              <div className="flex flex-col items-center gap-1">
                <MatchRing score={profileScore} size={80} strokeWidth={5} />
                <span className="text-xs text-muted-foreground">Profile Score</span>
              </div>
            </div>

            <Separator />

            {/* Status + Availability */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">{alex.availability}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-2">
              {alex.github && (
                <a
                  href={`https://${alex.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-border hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  title="GitHub"
                >
                  <Github className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {alex.linkedin && (
                <a
                  href={`https://${alex.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-border hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
              {alex.portfolio && (
                <a
                  href={`https://${alex.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 border border-border hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  title="Portfolio"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>

            <Separator />

            {/* Visibility toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Profile Visibility</p>
                <p className="text-xs text-muted-foreground">{isPublic ? 'Public — discoverable by companies' : 'Private — only you can see'}</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
              <Button className="w-full" variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Improve Your Profile Checklist */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Improve Your Profile</h3>
            </div>
            <div className="space-y-3">
              {checklist.map(item => (
                <button
                  key={item.id}
                  className="flex items-center gap-3 w-full text-left group"
                  onClick={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                >
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-blue-400 transition-colors" />
                  )}
                  <span className={`text-xs ${item.done ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-blue-400 transition-colors'}`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Completion</span>
                <span className="text-xs font-semibold text-blue-400">
                  {checklist.filter(c => c.done).length}/{checklist.length}
                </span>
              </div>
              <Progress value={(checklist.filter(c => c.done).length / checklist.length) * 100} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — tabbed editor */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            {/* ABOUT TAB */}
            <TabsContent value="about" className="space-y-5">
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">About You</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer at Airbnb"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={5}
                    placeholder="Tell companies about yourself, your expertise, and what you're looking for..."
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="pl-9"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Expected Salary (USD/year)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="salary"
                        value={salary}
                        onChange={e => setSalary(e.target.value)}
                        className="pl-9"
                        placeholder="200000"
                        type="number"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-border min-h-[3rem]">
                    {languages.map(lang => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400"
                      >
                        <Languages className="w-3 h-3" />
                        {lang}
                        <button onClick={() => removeLang(lang)} className="hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={langInput}
                      onChange={e => setLangInput(e.target.value)}
                      onKeyDown={handleLangKeydown}
                      className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Type a language, press Enter..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter or comma to add a language</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Last saved: <span className="text-foreground">Just now</span>
                  </p>
                  <Button
                    onClick={() => { setSavedAbout(true); setTimeout(() => setSavedAbout(false), 2500) }}
                    className="gap-2"
                  >
                    {savedAbout ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* EXPERIENCE TAB */}
            <TabsContent value="experience" className="space-y-4">
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-purple-400" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Work Experience</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowExpForm(true); setEditExpId(null); setExpForm(emptyExp) }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {/* Inline Add/Edit Form */}
                {showExpForm && (
                  <div className="bg-white/[0.03] border border-white/[0.1] rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {editExpId ? 'Edit Experience' : 'Add New Experience'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Company *</Label>
                        <Input
                          placeholder="e.g. Stripe"
                          value={expForm.company}
                          onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Job Title *</Label>
                        <Input
                          placeholder="e.g. Senior Engineer"
                          value={expForm.title}
                          onChange={e => setExpForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Start Date *</Label>
                        <Input
                          type="month"
                          value={expForm.startDate}
                          onChange={e => setExpForm(f => ({ ...f, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={expForm.endDate}
                          onChange={e => setExpForm(f => ({ ...f, endDate: e.target.value }))}
                          disabled={expForm.current}
                        />
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            id="current-exp"
                            checked={expForm.current}
                            onCheckedChange={(checked) => setExpForm(f => ({ ...f, current: !!checked, endDate: '' }))}
                          />
                          <label htmlFor="current-exp" className="text-xs text-muted-foreground cursor-pointer">
                            Currently working here
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements..."
                        value={expForm.description}
                        onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Skills Used (comma-separated)</Label>
                      <Input
                        placeholder="e.g. React, TypeScript, GraphQL"
                        value={expForm.skills}
                        onChange={e => setExpForm(f => ({ ...f, skills: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowExpForm(false); setEditExpId(null); setExpForm(emptyExp) }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveExp}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Experience
                      </Button>
                    </div>
                  </div>
                )}

                {/* Experience List */}
                <div className="space-y-4">
                  {experiences.map(exp => (
                    <div
                      key={exp.id}
                      className="relative p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                              {exp.current && (
                                <Badge className="text-[10px] py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-blue-400 font-medium">{exp.company}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                            </p>
                            {exp.description && (
                              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                            )}
                            {exp.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {exp.skills.map(skill => (
                                  <span
                                    key={skill}
                                    className="px-2 py-0.5 rounded-full bg-white/5 border border-border text-[11px] text-muted-foreground"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditExp(exp.id)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDeleteExp(exp.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {experiences.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No experience added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* EDUCATION TAB */}
            <TabsContent value="education" className="space-y-4">
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Education</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowEduForm(true); setEditEduId(null); setEduForm(emptyEdu) }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {/* Inline Add/Edit Form */}
                {showEduForm && (
                  <div className="bg-white/[0.03] border border-white/[0.1] rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">
                      {editEduId ? 'Edit Education' : 'Add Education'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Institution *</Label>
                        <Input
                          placeholder="e.g. MIT"
                          value={eduForm.institution}
                          onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Degree *</Label>
                        <Input
                          placeholder="e.g. B.S., M.S., MBA"
                          value={eduForm.degree}
                          onChange={e => setEduForm(f => ({ ...f, degree: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Field of Study</Label>
                        <Input
                          placeholder="e.g. Computer Science"
                          value={eduForm.field}
                          onChange={e => setEduForm(f => ({ ...f, field: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={eduForm.startDate}
                          onChange={e => setEduForm(f => ({ ...f, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={eduForm.endDate}
                          onChange={e => setEduForm(f => ({ ...f, endDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>GPA (optional)</Label>
                        <Input
                          placeholder="e.g. 3.8"
                          value={eduForm.gpa}
                          onChange={e => setEduForm(f => ({ ...f, gpa: e.target.value }))}
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowEduForm(false); setEditEduId(null); setEduForm(emptyEdu) }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveEdu}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Education
                      </Button>
                    </div>
                  </div>
                )}

                {/* Education List */}
                <div className="space-y-4">
                  {educations.map(edu => (
                    <div
                      key={edu.id}
                      className="relative p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{edu.institution}</h3>
                            <p className="text-sm text-cyan-400">
                              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatPeriod(edu.startDate, edu.endDate)}
                            </p>
                            {edu.gpa && (
                              <p className="text-xs text-muted-foreground mt-1">GPA: <span className="text-foreground font-medium">{edu.gpa}</span></p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditEdu(edu.id)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDeleteEdu(edu.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* SKILLS TAB */}
            <TabsContent value="skills" className="space-y-4">
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h2 className="text-base font-semibold text-foreground">Skills</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSkillInput(!showSkillInput)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>

                {/* Add Skill inline */}
                {showSkillInput && (
                  <div className="flex flex-wrap gap-2 items-end p-4 rounded-xl bg-white/[0.03] border border-white/[0.1]">
                    <div className="flex-1 min-w-[160px] space-y-1.5">
                      <Label>Skill Name</Label>
                      <Input
                        placeholder="e.g. Rust"
                        value={newSkillName}
                        onChange={e => setNewSkillName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                      />
                    </div>
                    <div className="w-[180px] space-y-1.5">
                      <Label>Level</Label>
                      <Select value={newSkillLevel} onValueChange={(v) => setNewSkillLevel(v as SkillLevel)}>
                        <SelectTrigger>
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
                    <Button size="sm" onClick={handleAddSkill} className="mb-0">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowSkillInput(false)}>
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Verified Skills */}
                {verifiedSkills.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-semibold text-foreground">Verified Skills</h3>
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        {verifiedSkills.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {verifiedSkills.map(skill => (
                        <div
                          key={skill.name}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-200 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${levelColors[skill.level]}`}>
                                {levelLabel[skill.level]}
                              </span>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
                              </div>
                            </div>
                            {skill.score !== undefined && (
                              <div className="flex items-center gap-3">
                                <Progress value={skill.score} className="h-1.5 flex-1" />
                                <span className="text-xs font-bold text-emerald-400 w-12 text-right">{skill.score}/100</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                              <RotateCcw className="w-3 h-3 mr-1.5" />
                              Retake
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                              onClick={() => handleRemoveSkill(skill.name)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Self-Reported Skills */}
                {selfSkills.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-foreground">Self-Reported Skills</h3>
                      <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                        {selfSkills.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {selfSkills.map(skill => (
                        <div
                          key={skill.name}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-200 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{skill.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${levelColors[skill.level]}`}>
                                {levelLabel[skill.level]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">Unverified</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" className="text-xs h-7 px-2.5">
                              <Zap className="w-3 h-3 mr-1.5" />
                              Take Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                              onClick={() => handleRemoveSkill(skill.name)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* PREFERENCES TAB */}
            <TabsContent value="preferences" className="space-y-4">
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Job Preferences</h2>
                </div>

                {/* Work Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Work Mode</Label>
                  <div className="flex flex-wrap gap-2">
                    {workModes.map(mode => (
                      <button
                        key={mode}
                        onClick={() => toggleWorkPref(mode)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                          workPref.includes(mode)
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                            : 'bg-white/5 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Job Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleJobType(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                          jobTypePref.includes(type)
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                            : 'bg-white/5 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industries */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Industry Preferences</Label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map(ind => (
                      <button
                        key={ind}
                        onClick={() => toggleIndustry(ind)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          industryPref.includes(ind)
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                            : 'bg-white/5 border-border text-muted-foreground hover:border-white/20 hover:text-foreground'
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Open to Relocation */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Open to Relocation</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Willing to relocate for the right role</p>
                    </div>
                    <Switch checked={openRelocation} onCheckedChange={setOpenRelocation} />
                  </div>

                  {/* Notice Period */}
                  <div className="space-y-2 p-4 rounded-xl bg-white/[0.03] border border-border">
                    <Label className="text-sm font-medium text-foreground">Notice Period</Label>
                    <Select value={noticePeriod} onValueChange={setNoticePeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {noticePeriods.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
