export type UserRole = 'company' | 'talent'

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'technical'
  | 'offer'
  | 'hired'
  | 'rejected'

export interface Company {
  id: string
  name: string
  logo: string
  industry: string
  size: string
  location: string
  website: string
  description: string
  culture: string[]
  benefits: string[]
  rating: number
  reviewCount: number
  verified: boolean
  plan: 'starter' | 'growth' | 'enterprise'
}

export interface Job {
  id: string
  companyId: string
  company: Company
  title: string
  department: string
  type: JobType
  workMode: WorkMode
  level: ExperienceLevel
  location: string
  salaryMin: number
  salaryMax: number
  currency: string
  description: string
  requirements: string[]
  niceToHave: string[]
  skills: string[]
  benefits: string[]
  postedAt: string
  expiresAt: string
  applicantCount: number
  viewCount: number
  status: 'active' | 'paused' | 'closed'
  featured: boolean
}

export interface Candidate {
  id: string
  name: string
  avatar: string
  title: string
  location: string
  email: string
  phone: string
  bio: string
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  matchScore: number
  salaryExpectation: number
  availability: string
  workPreference: WorkMode[]
  languages: string[]
  github?: string
  linkedin?: string
  portfolio?: string
  assessmentScores: Record<string, number>
  verified: boolean
  premium: boolean
}

export interface Skill {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  verified: boolean
  score?: number
}

export interface Experience {
  id: string
  company: string
  companyLogo?: string
  title: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa?: number
}

export interface Application {
  id: string
  jobId: string
  job: Job
  candidateId: string
  candidate?: Candidate
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  matchScore: number
  coverLetter?: string
  notes?: string
  rating?: number
  stage: PipelineStage
}

export type PipelineStage =
  | 'new'
  | 'screening'
  | 'phone_screen'
  | 'technical'
  | 'onsite'
  | 'offer'
  | 'hired'
  | 'rejected'

export interface PipelineColumn {
  id: PipelineStage
  label: string
  color: string
  candidates: Application[]
}

export interface Analytics {
  totalJobs: number
  totalApplicants: number
  hiredThisMonth: number
  avgTimeToHire: number
  offerAcceptRate: number
  qualityOfHire: number
  costPerHire: number
  sourcingChannels: SourceChannel[]
  hiringFunnel: FunnelStage[]
  weeklyApplications: WeeklyData[]
  diversityMetrics: DiversityData
}

export interface SourceChannel {
  name: string
  applicants: number
  hired: number
  percentage: number
}

export interface FunnelStage {
  stage: string
  count: number
  percentage: number
  dropoff: number
}

export interface WeeklyData {
  week: string
  applications: number
  interviews: number
  offers: number
}

export interface DiversityData {
  gender: Record<string, number>
  ethnicity: Record<string, number>
  ageGroup: Record<string, number>
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'system' | 'interview_request'
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar: string
  participantRole: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  jobTitle?: string
  messages: Message[]
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: string[]
  limits: Record<string, string | number>
  highlighted: boolean
  badge?: string
}
