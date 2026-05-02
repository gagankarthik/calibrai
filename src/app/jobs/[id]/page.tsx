'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, Users, Briefcase, ArrowLeft,
  Globe, CheckCircle2, Banknote, ArrowRight, ExternalLink,
  Building2, Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobCompany {
  name?: string
  verified?: boolean
  industry?: string
  size?: string
  website?: string
  description?: string
}

interface JobDetail {
  jobId: string
  title: string
  company?: JobCompany | string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  type?: string
  workMode?: string
  level?: string
  skills?: string[]
  requirements?: string[]
  niceToHave?: string[]
  benefits?: string[]
  description?: string
  postedAt?: string
  applicantCount?: number
  status?: string
  source?: string
  sourceUrl?: string
  featured?: boolean
  department?: string
}

function getCompanyName(job: JobDetail): string {
  if (!job.company) return 'Unknown Company'
  if (typeof job.company === 'string') return job.company
  return job.company?.name ?? 'Unknown Company'
}

function formatSalary(min?: number, max?: number, currency = 'USD'): string {
  if (!min && !max) return ''
  const sym = currency === 'USD' ? '$' : currency
  if (min && max) return `${sym}${Math.round(min / 1000)}K â€“ ${sym}${Math.round(max / 1000)}K / year`
  if (max) return `Up to ${sym}${Math.round(max / 1000)}K / year`
  return `${sym}${Math.round((min ?? 0) / 1000)}K+ / year`
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function isLoggedInAsTalent(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('tb-talent-token=')
}

const WORK_MODE_LABELS: Record<string, string> = {
  remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site',
}
const JOB_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract',
  internship: 'Internship', freelance: 'Freelance',
}
const LEVEL_LABELS: Record<string, string> = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior',
  lead: 'Lead', executive: 'Executive',
}

export default function PublicJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(isLoggedInAsTalent())
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/jobs/${id}`)
        if (res.status === 404) { setNotFound(true); return }
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setJob(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  function handleApply() {
    if (!job) return
    if (loggedIn) {
      if (job.source === 'hiring_cafe' && job.sourceUrl) {
        window.open(job.sourceUrl, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = `/talent/jobs/${job.jobId}`
      }
    } else {
      const next = job.source === 'hiring_cafe' && job.sourceUrl
        ? encodeURIComponent(job.sourceUrl)
        : encodeURIComponent(`/talent/jobs/${job.jobId}`)
      window.location.href = `/auth/login?next=${next}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--tl-bg-base)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tl-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-[var(--tl-bg-base)] flex flex-col items-center justify-center gap-4">
        <Briefcase className="w-12 h-12 text-[var(--tl-text-secondary)] opacity-30" />
        <h1 className="text-xl font-semibold text-[var(--tl-text-primary)]">Job not found</h1>
        <Link href="/jobs" className="btn-ghost flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </div>
    )
  }

  const companyName = getCompanyName(job)
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency)
  const isScraped = job.source === 'hiring_cafe'

  return (
    <div className="min-h-screen bg-[var(--tl-bg-base)]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--tl-bg-surface)]/95 backdrop-blur-xl border-b border-[var(--tl-border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="flex items-center gap-1.5 text-sm text-[var(--tl-text-secondary)] hover:text-[var(--tl-text-primary)] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Jobs</span>
            </Link>
            <span className="hidden sm:block text-[var(--tl-border-default)]">/</span>
            <span className="hidden sm:block text-sm text-[var(--tl-text-secondary)] truncate max-w-48">{job.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn-ghost text-sm hidden sm:block">Sign in</Link>
            <Link href="/auth/register?role=talent" className="btn-gold text-sm">Join as Talent</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Job header card */}
          <div className="tl-card p-6 sm:p-8 mb-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-wrap">
              {/* Company avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center shrink-0 text-xl font-bold text-violet-400">
                {companyName.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-display font-bold text-[var(--tl-text-primary)]">{job.title}</h1>
                  {isScraped && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> via hiring.cafe
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[var(--tl-text-secondary)] mb-3">
                  <span className="font-semibold flex items-center gap-1">
                    {companyName}
                    {typeof job.company === 'object' && job.company?.verified && (
                      <CheckCircle2 className="w-4 h-4 text-tl-teal" />
                    )}
                  </span>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-[var(--tl-text-secondary)] px-3 py-1.5 rounded-full bg-[var(--tl-bg-elevated)] border border-[var(--tl-border-subtle)]">
                      <MapPin className="w-3 h-3 shrink-0" />{job.location}
                    </span>
                  )}
                  {job.workMode && (
                    <span className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium',
                      job.workMode === 'remote'
                        ? 'bg-tl-teal/10 border-tl-teal/20 text-tl-teal'
                        : 'bg-[var(--tl-bg-elevated)] border-[var(--tl-border-subtle)] text-[var(--tl-text-secondary)]'
                    )}>
                      {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
                    </span>
                  )}
                  {job.type && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--tl-bg-elevated)] border border-[var(--tl-border-subtle)] text-[var(--tl-text-secondary)]">
                      {JOB_TYPE_LABELS[job.type] ?? job.type}
                    </span>
                  )}
                  {job.level && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-[var(--tl-bg-elevated)] border border-[var(--tl-border-subtle)] text-[var(--tl-text-secondary)]">
                      {LEVEL_LABELS[job.level] ?? job.level}
                    </span>
                  )}
                  {salary && (
                    <span className="flex items-center gap-1 text-xs text-tl-teal font-semibold px-3 py-1.5 rounded-full bg-tl-teal/8 border border-tl-teal/20">
                      <Banknote className="w-3 h-3 shrink-0" />{salary}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Meta footer */}
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-[var(--tl-border-subtle)] flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs text-[var(--tl-text-secondary)]">
                {job.postedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Posted {timeAgo(job.postedAt)}
                  </span>
                )}
                {job.applicantCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {job.applicantCount} applicants
                  </span>
                )}
                {job.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {job.department}
                  </span>
                )}
              </div>

              {/* Apply CTA */}
              <button
                onClick={handleApply}
                className="btn-gold flex items-center gap-2 px-6"
              >
                {loggedIn ? (
                  isScraped ? (
                    <><ExternalLink className="w-4 h-4" /> Apply on hiring.cafe</>
                  ) : (
                    <><ArrowRight className="w-4 h-4" /> Apply Now</>
                  )
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Sign in to Apply</>
                )}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {job.description && (
                <div className="tl-card p-6">
                  <h2 className="font-display font-semibold text-[var(--tl-text-primary)] mb-4">About this role</h2>
                  <div className="prose prose-sm max-w-none text-[var(--tl-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {job.description.replace(/<[^>]*>/g, '')}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="tl-card p-6">
                  <h2 className="font-display font-semibold text-[var(--tl-text-primary)] mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--tl-text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-tl-teal shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to have */}
              {job.niceToHave && job.niceToHave.length > 0 && (
                <div className="tl-card p-6">
                  <h2 className="font-display font-semibold text-[var(--tl-text-primary)] mb-4">Nice to Have</h2>
                  <ul className="space-y-2">
                    {job.niceToHave.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--tl-text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-tl-gold mt-2 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="tl-card p-6">
                  <h2 className="font-display font-semibold text-[var(--tl-text-primary)] mb-4">Benefits</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-tl-teal/8 border border-tl-teal/20 text-tl-teal">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="tl-card p-5">
                  <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-tl-gold" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-tl-gold/8 border border-tl-gold/15 text-tl-gold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company info */}
              {typeof job.company === 'object' && job.company && (
                <div className="tl-card p-5">
                  <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-tl-gold" /> Company
                  </h3>
                  <div className="space-y-2 text-sm text-[var(--tl-text-secondary)]">
                    <p className="font-medium text-[var(--tl-text-primary)]">{job.company?.name}</p>
                    {job.company?.industry && <p>{job.company?.industry}</p>}
                    {job.company?.size && <p>{job.company?.size} employees</p>}
                    {job.company?.description && (
                      <p className="text-xs leading-relaxed">{job.company?.description.slice(0, 200)}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Apply card */}
              <div className="tl-card-gold p-5">
                <h3 className="font-semibold text-sm text-[var(--tl-text-primary)] mb-2">Ready to apply?</h3>
                {loggedIn ? (
                  <p className="text-xs text-[var(--tl-text-secondary)] mb-4">
                    {isScraped
                      ? "You'll be redirected to hiring.cafe to complete your application."
                      : 'Submit your application directly through TalentBridge.'}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--tl-text-secondary)] mb-4">
                    Create a free account or sign in to apply for this position.
                  </p>
                )}
                <button onClick={handleApply} className="btn-gold w-full flex items-center justify-center gap-2 text-sm">
                  {loggedIn
                    ? isScraped ? <><ExternalLink className="w-4 h-4" /> Apply on hiring.cafe</> : <><ArrowRight className="w-4 h-4" /> Apply Now</>
                    : <><ArrowRight className="w-4 h-4" /> Sign in to Apply</>
                  }
                </button>
                {!loggedIn && (
                  <p className="text-center text-xs text-[var(--tl-text-secondary)] mt-2">
                    New here?{' '}
                    <Link href="/auth/register?role=talent" className="text-tl-gold hover:underline">Create free account</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--tl-border-subtle)] mt-12 py-8 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--tl-text-secondary)]">
          <Link href="/jobs" className="hover:text-[var(--tl-text-primary)] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> All Jobs
          </Link>
          <Link href="/auth/register?role=company" className="hover:text-[var(--tl-text-primary)] transition-colors">Post a Job</Link>
          <Link href="/" className="hover:text-[var(--tl-text-primary)] transition-colors">Home</Link>
        </div>
      </footer>
    </div>
  )
}
