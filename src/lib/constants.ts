import type { ApplicationStatus, PipelineStage, WorkMode, JobType, ExperienceLevel } from './types'

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: 'New',
  screening: 'Screening',
  phone_screen: 'Phone Screen',
  technical: 'Technical',
  onsite: 'On-site',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

export const STAGE_COLORS: Record<PipelineStage, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  screening: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  phone_screen: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  technical: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  onsite: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  offer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  interview: 'Interview',
  technical: 'Technical',
  offer: 'Offer Extended',
  hired: 'Hired',
  rejected: 'Not Selected',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive',
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'new',
  'screening',
  'phone_screen',
  'technical',
  'onsite',
  'offer',
  'hired',
]

export const NAV_LINKS = {
  company: [
    { label: 'Dashboard', href: '/company/dashboard' },
    { label: 'Jobs', href: '/company/jobs' },
    { label: 'Candidates', href: '/company/candidates' },
    { label: 'Pipeline', href: '/company/pipeline' },
    { label: 'Analytics', href: '/company/analytics' },
    { label: 'Messages', href: '/company/messages' },
    { label: 'Settings', href: '/company/settings' },
  ],
  talent: [
    { label: 'Dashboard', href: '/talent/dashboard' },
    { label: 'Find Jobs', href: '/talent/jobs' },
    { label: 'Applications', href: '/talent/applications' },
    { label: 'Profile', href: '/talent/profile' },
    { label: 'Skills', href: '/talent/skills' },
    { label: 'Settings', href: '/talent/settings' },
  ],
  marketing: [
    { label: 'For Companies', href: '/company/jobs/new' },
    { label: 'For Job Seekers', href: '/talent/jobs' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ],
}

export const PLANS = {
  starter: { id: 'starter', name: 'Starter', price: 499 },
  growth: { id: 'growth', name: 'Growth', price: 2499 },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 7999 },
}

export const ARR_TARGET = 2_000_000
export const ENTERPRISE_PRICE_MONTHLY = 7999
export const GROWTH_PRICE_MONTHLY = 2499
export const STARTER_PRICE_MONTHLY = 499

export const SUPPORT_EMAIL = 'support@calibr.io'
export const SALES_EMAIL = 'sales@calibr.io'
export const PRIVACY_EMAIL = 'privacy@calibr.io'

export const COMPANY_NAME = 'Calibr'
export const COMPANY_TAGLINE = 'AI-Powered Talent Acquisition'
export const COMPANY_DESCRIPTION =
  'Bridge the gap between exceptional companies and world-class candidates.'
