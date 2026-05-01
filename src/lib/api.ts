/**
 * Calibr API Client
 *
 * All frontend data access goes through this file.
 *
 * Behaviour:
 *   NEXT_PUBLIC_USE_MOCK !== 'false'  → returns mock data from src/lib/data.ts
 *   NEXT_PUBLIC_USE_MOCK === 'false'  → calls real Next.js API routes via fetch()
 *
 * When wiring up the real backend, search for "TODO(real-api)" comments —
 * each one tells you exactly what to replace and with which API route.
 */

import type {
  Company,
  Job,
  Candidate,
  Application,
  ApplicationStatus,
  Conversation,
  Message,
  Analytics,
  PricingPlan,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Shared response type
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

// ---------------------------------------------------------------------------
// Input / filter types
// ---------------------------------------------------------------------------

export interface JobFilters {
  search?: string
  workMode?: string[]
  jobType?: string[]
  level?: string[]
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  companyId?: string
  status?: 'active' | 'paused' | 'closed'
  featured?: boolean
  page?: number
  limit?: number
}

export interface CandidateFilters {
  search?: string
  skills?: string[]
  workPreference?: string[]
  salaryMax?: number
  availability?: string
  verified?: boolean
  experienceYears?: { min?: number; max?: number }
  page?: number
  limit?: number
}

export interface CreateJobInput {
  title: string
  department?: string
  type: Job['type']
  workMode: Job['workMode']
  level: Job['level']
  location: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description: string
  requirements?: string[]
  niceToHave?: string[]
  skills: string[]
  benefits?: string[]
  expiresAt?: string
}

export interface UpdateTalentProfileInput {
  headline?: string
  bio?: string
  location?: string
  phone?: string
  salaryExpectation?: number
  availability?: string
  workPreference?: Candidate['workPreference']
  skills?: Candidate['skills']
  github?: string
  linkedin?: string
  portfolio?: string
  languages?: string[]
}

export interface Subscription {
  id: string
  companyId: string
  plan: Company['plan']
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
  trialEndsAt?: string
  currentPeriodEnd?: string
  stripeSubscriptionId?: string
  aiCreditsUsed: number
  aiCreditsLimit: number
}

export interface AuthCompanyResult {
  token: string
  company: Company
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export interface AuthTalentResult {
  token: string
  talent: Candidate
}

export interface UploadUrlResult {
  url: string
  key: string
}

export interface ResumeUploadResult {
  key: string
  url: string
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!res.ok) {
      // Try to parse the error body; fall back to status text
      let errorMessage = res.statusText
      try {
        const errorBody = (await res.json()) as { error?: string; message?: string }
        errorMessage = errorBody.error ?? errorBody.message ?? errorMessage
      } catch {
        // non-JSON error body — keep statusText
      }
      return { data: null, error: errorMessage, status: res.status }
    }

    // 204 No Content
    if (res.status === 204) {
      return { data: null, error: null, status: 204 }
    }

    const data = (await res.json()) as T
    return { data, error: null, status: res.status }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: message, status: 0 }
  }
}

// ---------------------------------------------------------------------------
// Mock data import (tree-shaken in production when USE_MOCK is false)
// ---------------------------------------------------------------------------

// These are lazy-loaded so the mock bundle is never included when USE_MOCK=false
// and the file is evaluated at build time.
function getMockData() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/lib/data') as typeof import('@/lib/data')
}

// ---------------------------------------------------------------------------
// Auth — Company
// ---------------------------------------------------------------------------

/**
 * Sign in a company/recruiter user via Cognito (CompanyPool).
 *
 * TODO(real-api): POST /api/auth/company/signin
 *   Body: { email, password }
 *   Response: { token, company, user }
 *   Replace the mock below with the real fetch call.
 *   On the server side this should call Cognito InitiateAuth and return
 *   the ID token + the company record from RDS.
 */
export async function signInCompany(
  email: string,
  _password: string,
): Promise<ApiResponse<AuthCompanyResult>> {
  if (!USE_MOCK) {
    return apiFetch<AuthCompanyResult>('/api/auth/company/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password: _password }),
    })
  }

  // Mock: any credentials work, return first company
  const { companies } = getMockData()
  const company = companies[0]
  return {
    data: {
      token: 'mock-token-company',
      company,
      user: { id: 'u1', email, fullName: 'Demo Recruiter', role: 'admin' },
    },
    error: null,
    status: 200,
  }
}

/**
 * Sign in a talent (candidate) user via Cognito (TalentPool).
 *
 * TODO(real-api): POST /api/auth/talent/signin
 *   Body: { email, password }
 *   Response: { token, talent }
 */
export async function signInTalent(
  email: string,
  _password: string,
): Promise<ApiResponse<AuthTalentResult>> {
  if (!USE_MOCK) {
    return apiFetch<AuthTalentResult>('/api/auth/talent/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password: _password }),
    })
  }

  const { candidates } = getMockData()
  return {
    data: { token: 'mock-token-talent', talent: candidates[0] },
    error: null,
    status: 200,
  }
}

/**
 * Sign out the current user (clears session cookie / Cognito token).
 *
 * TODO(real-api): POST /api/auth/signout
 *   Should call Cognito GlobalSignOut and clear the session cookie.
 */
export async function signOut(): Promise<void> {
  if (!USE_MOCK) {
    await apiFetch('/api/auth/signout', { method: 'POST' })
  }
  // Mock: nothing to clear
}

// ---------------------------------------------------------------------------
// Jobs — CRUD
// ---------------------------------------------------------------------------

/**
 * List jobs, optionally filtered.
 *
 * TODO(real-api): GET /api/jobs?search=&workMode=&skills=&page=&limit=
 *   Queries OpenSearch for active jobs, applies filters, returns paginated results.
 *   Company dashboard calls should use GET /api/company/jobs (includes all statuses).
 */
export async function getJobs(
  filters?: JobFilters,
): Promise<ApiResponse<Job[]>> {
  if (!USE_MOCK) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((v) => params.append(key, String(v)))
          } else {
            params.set(key, String(val))
          }
        }
      })
    }
    const qs = params.toString()
    return apiFetch<Job[]>(`/api/jobs${qs ? `?${qs}` : ''}`)
  }

  const { jobs } = getMockData()
  let result = [...jobs]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q)),
    )
  }
  if (filters?.workMode?.length) {
    result = result.filter((j) => filters.workMode!.includes(j.workMode))
  }
  if (filters?.status) {
    result = result.filter((j) => j.status === filters.status)
  }
  if (filters?.salaryMin !== undefined) {
    result = result.filter((j) => j.salaryMax >= filters.salaryMin!)
  }
  if (filters?.salaryMax !== undefined) {
    result = result.filter((j) => j.salaryMin <= filters.salaryMax!)
  }

  return { data: result, error: null, status: 200 }
}

/**
 * Get a single job by ID.
 *
 * TODO(real-api): GET /api/jobs/[id]
 *   Fetches from RDS. Increments view_count asynchronously via SQS.
 */
export async function getJob(id: string): Promise<ApiResponse<Job>> {
  if (!USE_MOCK) {
    return apiFetch<Job>(`/api/jobs/${id}`)
  }

  const { jobs } = getMockData()
  const job = jobs.find((j) => j.id === id)
  if (!job) return { data: null, error: 'Job not found', status: 404 }
  return { data: job, error: null, status: 200 }
}

/**
 * Create a new job posting.
 *
 * TODO(real-api): POST /api/company/jobs
 *   Body: CreateJobInput
 *   Inserts into RDS, queues OpenSearch sync.
 *   Requires company auth token in cookie/header.
 */
export async function createJob(
  data: CreateJobInput,
): Promise<ApiResponse<Job>> {
  if (!USE_MOCK) {
    return apiFetch<Job>('/api/company/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  const { companies } = getMockData()
  const newJob: Job = {
    id: `j-${Date.now()}`,
    companyId: 'c1',
    company: companies[0],
    ...data,
    department: data.department ?? '',
    currency: data.currency ?? 'USD',
    salaryMin: data.salaryMin ?? 0,
    salaryMax: data.salaryMax ?? 0,
    requirements: data.requirements ?? [],
    niceToHave: data.niceToHave ?? [],
    benefits: data.benefits ?? [],
    postedAt: new Date().toISOString(),
    expiresAt: data.expiresAt ?? new Date(Date.now() + 30 * 86400000).toISOString(),
    applicantCount: 0,
    viewCount: 0,
    status: 'active',
    featured: false,
  }
  return { data: newJob, error: null, status: 201 }
}

/**
 * Update an existing job.
 *
 * TODO(real-api): PATCH /api/company/jobs/[id]
 *   Body: Partial<Job>
 *   Validates ownership (company_id matches auth user's company).
 *   Re-syncs to OpenSearch after update.
 */
export async function updateJob(
  id: string,
  updates: Partial<Job>,
): Promise<ApiResponse<Job>> {
  if (!USE_MOCK) {
    return apiFetch<Job>(`/api/company/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  const { jobs } = getMockData()
  const job = jobs.find((j) => j.id === id)
  if (!job) return { data: null, error: 'Job not found', status: 404 }
  const updated = { ...job, ...updates, updatedAt: new Date().toISOString() }
  return { data: updated as Job, error: null, status: 200 }
}

/**
 * Delete (soft-delete) a job.
 *
 * TODO(real-api): DELETE /api/company/jobs/[id]
 *   Sets deleted_at in RDS and removes from OpenSearch index.
 */
export async function deleteJob(id: string): Promise<ApiResponse<void>> {
  if (!USE_MOCK) {
    return apiFetch<void>(`/api/company/jobs/${id}`, { method: 'DELETE' })
  }
  return { data: null, error: null, status: 204 }
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

/**
 * Get applications, optionally filtered by job ID.
 * Company view: all applications for their jobs.
 * Talent view: all applications submitted by the logged-in talent.
 *
 * TODO(real-api): GET /api/applications?jobId=&status=&stage=&page=&limit=
 *   For company: GET /api/company/applications?jobId=
 *   For talent:  GET /api/talent/applications
 *   Joins with jobs and talent_profiles. Returns match_score from DB.
 */
export async function getApplications(
  jobId?: string,
): Promise<ApiResponse<Application[]>> {
  if (!USE_MOCK) {
    const qs = jobId ? `?jobId=${encodeURIComponent(jobId)}` : ''
    return apiFetch<Application[]>(`/api/applications${qs}`)
  }

  const { applications } = getMockData()
  const result = jobId ? applications.filter((a) => a.jobId === jobId) : applications
  return { data: result, error: null, status: 200 }
}

/**
 * Submit an application to a job (talent action).
 *
 * TODO(real-api): POST /api/jobs/[jobId]/apply
 *   Body: { coverLetter? }
 *   Creates application row in RDS.
 *   Enqueues a message to calibr-matching-queue so Lambda computes match_score.
 *   Requires talent auth token.
 */
export async function applyToJob(
  jobId: string,
  coverNote?: string,
): Promise<ApiResponse<Application>> {
  if (!USE_MOCK) {
    return apiFetch<Application>(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverLetter: coverNote }),
    })
  }

  const { applications, jobs, candidates } = getMockData()
  const job = jobs.find((j) => j.id === jobId)
  if (!job) return { data: null, error: 'Job not found', status: 404 }

  const newApplication: Application = {
    id: `app-${Date.now()}`,
    jobId,
    job,
    candidateId: candidates[0].id,
    candidate: candidates[0],
    status: 'applied',
    stage: 'new',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    matchScore: 0, // Will be computed by Lambda
    coverLetter: coverNote,
  }
  return { data: newApplication, error: null, status: 201 }
}

/**
 * Move an application to a new status / pipeline stage (company action).
 *
 * TODO(real-api): PATCH /api/company/applications/[id]/status
 *   Body: { status: ApplicationStatus, notes? }
 *   Updates application row and inserts a pipeline_stage_history record.
 *   Triggers SES email to talent if status is 'offer' or 'hired' or 'rejected'.
 */
export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ApiResponse<Application>> {
  if (!USE_MOCK) {
    return apiFetch<Application>(`/api/company/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  const { applications } = getMockData()
  const app = applications.find((a) => a.id === id)
  if (!app) return { data: null, error: 'Application not found', status: 404 }
  const updated = { ...app, status, updatedAt: new Date().toISOString() }
  return { data: updated, error: null, status: 200 }
}

// ---------------------------------------------------------------------------
// Candidates (company view)
// ---------------------------------------------------------------------------

/**
 * Search and list candidates. Company-only.
 *
 * TODO(real-api): GET /api/company/candidates?skills=&workPreference=&salaryMax=&page=
 *   Queries OpenSearch candidates index.
 *   Returns only open-to-work talent profiles.
 *   Apply plan limits: Starter can see 20/page, Growth 50/page, Enterprise unlimited.
 */
export async function getCandidates(
  filters?: CandidateFilters,
): Promise<ApiResponse<Candidate[]>> {
  if (!USE_MOCK) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((v) => params.append(key, String(v)))
          } else if (typeof val === 'object') {
            params.set(key, JSON.stringify(val))
          } else {
            params.set(key, String(val))
          }
        }
      })
    }
    const qs = params.toString()
    return apiFetch<Candidate[]>(`/api/company/candidates${qs ? `?${qs}` : ''}`)
  }

  const { candidates } = getMockData()
  let result = [...candidates]

  if (filters?.skills?.length) {
    result = result.filter((c) =>
      filters.skills!.some((fs) =>
        c.skills.some((cs) => cs.name.toLowerCase() === fs.toLowerCase()),
      ),
    )
  }
  if (filters?.workPreference?.length) {
    result = result.filter((c) =>
      c.workPreference.some((wp) => filters.workPreference!.includes(wp)),
    )
  }
  if (filters?.salaryMax !== undefined) {
    result = result.filter((c) => c.salaryExpectation <= filters.salaryMax!)
  }
  if (filters?.verified) {
    result = result.filter((c) => c.verified)
  }

  return { data: result, error: null, status: 200 }
}

/**
 * Get a single candidate profile by ID. Company-only.
 *
 * TODO(real-api): GET /api/company/candidates/[id]
 *   Returns full talent_profile joined with experience, education, assessments.
 *   Tracks view in audit_logs.
 *   Returns 403 if company is on Starter plan and candidate is premium.
 */
export async function getCandidate(id: string): Promise<ApiResponse<Candidate>> {
  if (!USE_MOCK) {
    return apiFetch<Candidate>(`/api/company/candidates/${id}`)
  }

  const { candidates } = getMockData()
  const candidate = candidates.find((c) => c.id === id)
  if (!candidate) return { data: null, error: 'Candidate not found', status: 404 }
  return { data: candidate, error: null, status: 200 }
}

// ---------------------------------------------------------------------------
// Talent Profile (self-update)
// ---------------------------------------------------------------------------

/**
 * Get the currently logged-in talent's own profile.
 *
 * TODO(real-api): GET /api/talent/profile
 *   Reads talent_profiles row by cognito_sub from JWT.
 *   Joins experience, education, assessments.
 */
export async function getTalentProfile(): Promise<ApiResponse<Candidate>> {
  if (!USE_MOCK) {
    return apiFetch<Candidate>('/api/talent/profile')
  }

  const { candidates } = getMockData()
  return { data: candidates[0], error: null, status: 200 }
}

/**
 * Update the logged-in talent's profile.
 *
 * TODO(real-api): PATCH /api/talent/profile
 *   Body: UpdateTalentProfileInput
 *   Updates talent_profiles row.
 *   After update, marks search_synced_at = null so OpenSearch re-indexes on next cron run.
 */
export async function updateTalentProfile(
  updates: UpdateTalentProfileInput,
): Promise<ApiResponse<Candidate>> {
  if (!USE_MOCK) {
    return apiFetch<Candidate>('/api/talent/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  const { candidates } = getMockData()
  const updated = { ...candidates[0], ...updates } as Candidate
  return { data: updated, error: null, status: 200 }
}

/**
 * Get a pre-signed S3 URL for uploading a resume.
 *
 * TODO(real-api): POST /api/talent/resume/upload-url
 *   Body: { filename: string, contentType: string }
 *   Server generates pre-signed PUT URL using AWS SDK.
 *   After upload, client should call PATCH /api/talent/profile with { resumeKey }.
 */
export async function getResumeUploadUrl(
  filename: string,
  contentType: string,
): Promise<ApiResponse<UploadUrlResult>> {
  if (!USE_MOCK) {
    return apiFetch<UploadUrlResult>('/api/talent/resume/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    })
  }

  return {
    data: {
      url: `https://mock-s3-upload-url.example.com/${filename}`,
      key: `resumes/mock-talent-id/${Date.now()}-${filename}`,
    },
    error: null,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Billing — Stripe
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session for a subscription.
 *
 * TODO(real-api): POST /api/billing/checkout
 *   Body: { priceId: string }
 *   Server calls stripe.checkout.sessions.create() with success/cancel URLs.
 *   Returns the Stripe-hosted checkout URL.
 *   Client does: window.location.href = data.url
 */
export async function createCheckoutSession(
  priceId: string,
): Promise<ApiResponse<{ url: string }>> {
  if (!USE_MOCK) {
    return apiFetch<{ url: string }>('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    })
  }

  // Mock: return a fake Stripe checkout URL
  return {
    data: { url: `https://checkout.stripe.com/mock?priceId=${priceId}` },
    error: null,
    status: 200,
  }
}

/**
 * Get the company's current subscription details.
 *
 * TODO(real-api): GET /api/billing/subscription
 *   Reads subscriptions table joined with company.
 *   If stripe_subscription_id exists, optionally sync status from Stripe.
 */
export async function getSubscription(): Promise<ApiResponse<Subscription>> {
  if (!USE_MOCK) {
    return apiFetch<Subscription>('/api/billing/subscription')
  }

  return {
    data: {
      id: 'sub-mock-1',
      companyId: 'c1',
      plan: 'growth',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      aiCreditsUsed: 142,
      aiCreditsLimit: 500,
    },
    error: null,
    status: 200,
  }
}

/**
 * Cancel the company's subscription at period end.
 *
 * TODO(real-api): POST /api/billing/subscription/cancel
 *   Calls stripe.subscriptions.update({ cancel_at_period_end: true }).
 *   Updates subscriptions.cancel_at in DB.
 *   Does NOT immediately downgrade — that happens via Stripe webhook on period end.
 */
export async function cancelSubscription(): Promise<ApiResponse<void>> {
  if (!USE_MOCK) {
    return apiFetch<void>('/api/billing/subscription/cancel', { method: 'POST' })
  }

  return { data: null, error: null, status: 200 }
}

/**
 * Create a Stripe Customer Portal session so the company can manage payment methods,
 * view invoices, and change plans directly in Stripe's hosted portal.
 *
 * TODO(real-api): POST /api/billing/portal
 *   Server calls stripe.billingPortal.sessions.create({ customer: stripe_customer_id })
 *   Returns { url } — client redirects to it.
 */
export async function createBillingPortalSession(): Promise<ApiResponse<{ url: string }>> {
  if (!USE_MOCK) {
    return apiFetch<{ url: string }>('/api/billing/portal', { method: 'POST' })
  }

  return {
    data: { url: 'https://billing.stripe.com/mock-portal' },
    error: null,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Messages / Conversations
// ---------------------------------------------------------------------------

/**
 * Get all conversations for the current user (company or talent).
 *
 * TODO(real-api): GET /api/messages/conversations
 *   Queries messages table grouped into conversations.
 *   For company: returns conversations with each candidate they've contacted.
 *   For talent: returns conversations with each company.
 *   Sorted by lastMessageTime DESC.
 */
export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  if (!USE_MOCK) {
    return apiFetch<Conversation[]>('/api/messages/conversations')
  }

  const { conversations } = getMockData()
  return { data: conversations, error: null, status: 200 }
}

/**
 * Get a single conversation with all messages.
 *
 * TODO(real-api): GET /api/messages/conversations/[id]
 *   Fetches all messages in the conversation, marks unread as read.
 *   Validates that the calling user is a participant.
 */
export async function getConversation(id: string): Promise<ApiResponse<Conversation>> {
  if (!USE_MOCK) {
    return apiFetch<Conversation>(`/api/messages/conversations/${id}`)
  }

  const { conversations } = getMockData()
  const conv = conversations.find((c) => c.id === id)
  if (!conv) return { data: null, error: 'Conversation not found', status: 404 }
  return { data: conv, error: null, status: 200 }
}

/**
 * Send a message in an existing conversation.
 *
 * TODO(real-api): POST /api/messages/conversations/[conversationId]/messages
 *   Body: { body: string, type?: 'text' | 'interview_request' }
 *   Inserts into messages table.
 *   Sends SES email notification to the recipient if they have email notifications on.
 *   In production, swap to WebSocket push for real-time delivery.
 */
export async function sendMessage(
  conversationId: string,
  body: string,
): Promise<ApiResponse<Message>> {
  if (!USE_MOCK) {
    return apiFetch<Message>(
      `/api/messages/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ body }),
      },
    )
  }

  const newMessage: Message = {
    id: `m-${Date.now()}`,
    senderId: 'company',
    receiverId: conversationId,
    content: body,
    timestamp: new Date().toISOString(),
    read: false,
    type: 'text',
  }
  return { data: newMessage, error: null, status: 201 }
}

// ---------------------------------------------------------------------------
// Analytics (company dashboard)
// ---------------------------------------------------------------------------

/**
 * Get hiring analytics for the company's dashboard.
 *
 * TODO(real-api): GET /api/company/analytics?period=30d
 *   Aggregates data from applications, pipeline_stage_history, jobs tables.
 *   Cache in Redis with a 1-hour TTL (expensive aggregation query).
 *   Invalidate cache on any application status change.
 */
export async function getAnalytics(): Promise<ApiResponse<Analytics>> {
  if (!USE_MOCK) {
    return apiFetch<Analytics>('/api/company/analytics')
  }

  const { analytics } = getMockData()
  return { data: analytics, error: null, status: 200 }
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/**
 * Get all pricing plans.
 *
 * TODO(real-api): GET /api/pricing
 *   Currently safe to keep as static data — prices rarely change.
 *   When prices change, update STRIPE_PRICE_* env vars and the plans array.
 *   No auth required — this is a public endpoint.
 */
export async function getPricingPlans(): Promise<ApiResponse<PricingPlan[]>> {
  if (!USE_MOCK) {
    return apiFetch<PricingPlan[]>('/api/pricing')
  }

  const { pricingPlans } = getMockData()
  return { data: pricingPlans, error: null, status: 200 }
}

// ---------------------------------------------------------------------------
// File uploads — assets (logos, profile pictures)
// ---------------------------------------------------------------------------

/**
 * Get a pre-signed S3 URL for uploading a company logo or talent avatar.
 *
 * TODO(real-api): POST /api/uploads/asset-url
 *   Body: { entityType: 'company' | 'talent', entityId, filename, contentType }
 *   Server generates a pre-signed PUT URL for S3 bucket: calibr-assets-{env}
 *   After upload, caller should update company.logo_url or talent_profiles.avatar_url
 *   with the resulting CloudFront URL: https://assets.calibr.ai/{key}
 */
export async function getAssetUploadUrl(
  entityType: 'company' | 'talent',
  entityId: string,
  filename: string,
  contentType: string,
): Promise<ApiResponse<UploadUrlResult>> {
  if (!USE_MOCK) {
    return apiFetch<UploadUrlResult>('/api/uploads/asset-url', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, filename, contentType }),
    })
  }

  return {
    data: {
      url: `https://mock-s3.example.com/${entityType}/${entityId}/${filename}`,
      key: `${entityType}/${entityId}/${Date.now()}-${filename}`,
    },
    error: null,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Team management (company admin)
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string
  email: string
  fullName: string
  role: 'owner' | 'admin' | 'recruiter' | 'interviewer' | 'viewer'
  avatarUrl?: string
  lastSignInAt?: string
  inviteAcceptedAt?: string
}

/**
 * Get all team members for the company.
 *
 * TODO(real-api): GET /api/company/team
 *   Reads users table filtered by company_id.
 *   Requires admin or owner role.
 */
export async function getTeamMembers(): Promise<ApiResponse<TeamMember[]>> {
  if (!USE_MOCK) {
    return apiFetch<TeamMember[]>('/api/company/team')
  }

  return {
    data: [
      {
        id: 'u1',
        email: 'admin@calibr.ai',
        fullName: 'Demo Admin',
        role: 'owner',
        lastSignInAt: new Date().toISOString(),
      },
    ],
    error: null,
    status: 200,
  }
}

/**
 * Invite a new team member by email.
 *
 * TODO(real-api): POST /api/company/team/invite
 *   Body: { email, role }
 *   Creates a pending user row in users table.
 *   Sends invitation email via SES using the calibr-company-welcome template.
 *   On click, user completes Cognito sign-up and invite is accepted.
 */
export async function inviteTeamMember(
  email: string,
  role: TeamMember['role'],
): Promise<ApiResponse<TeamMember>> {
  if (!USE_MOCK) {
    return apiFetch<TeamMember>('/api/company/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    })
  }

  return {
    data: {
      id: `u-${Date.now()}`,
      email,
      fullName: '',
      role,
    },
    error: null,
    status: 201,
  }
}

// ---------------------------------------------------------------------------
// Audit log (company admin)
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string
  userId?: string
  userEmail?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  createdAt: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
}

/**
 * Get the company's audit log.
 *
 * TODO(real-api): GET /api/company/audit?page=&limit=&action=
 *   Reads audit_logs table filtered by company_id, ordered by created_at DESC.
 *   Paginate with cursor or offset.
 *   Restrict to owner/admin roles only.
 */
export async function getAuditLog(
  page = 1,
  limit = 50,
): Promise<ApiResponse<AuditLogEntry[]>> {
  if (!USE_MOCK) {
    return apiFetch<AuditLogEntry[]>(
      `/api/company/audit?page=${page}&limit=${limit}`,
    )
  }

  return {
    data: [
      {
        id: 'al1',
        userEmail: 'admin@calibr.ai',
        action: 'application.status_changed',
        resource: 'application',
        resourceId: 'app1',
        ipAddress: '192.168.1.1',
        createdAt: new Date().toISOString(),
        oldValue: { status: 'screening' },
        newValue: { status: 'interview' },
      },
    ],
    error: null,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Health check (for CI/CD smoke tests and uptime monitoring)
// ---------------------------------------------------------------------------

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down'
  version: string
  db: 'ok' | 'error'
  redis: 'ok' | 'error'
  timestamp: string
}

/**
 * Check API health. Used by CloudWatch, GitHub Actions smoke tests, and uptime monitors.
 *
 * TODO(real-api): GET /api/health
 *   Check DB connection: SELECT 1
 *   Check Redis connection: PING
 *   Return 200 if all healthy, 503 if degraded.
 *   This endpoint should NOT require auth.
 */
export async function checkHealth(): Promise<ApiResponse<HealthStatus>> {
  if (!USE_MOCK) {
    return apiFetch<HealthStatus>('/api/health')
  }

  return {
    data: {
      status: 'ok',
      version: '0.1.0',
      db: 'ok',
      redis: 'ok',
      timestamp: new Date().toISOString(),
    },
    error: null,
    status: 200,
  }
}
