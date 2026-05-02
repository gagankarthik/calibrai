'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, ExternalLink, RefreshCw, MapPin, Github, Linkedin,
  Loader2, X, Zap, Brain,
} from 'lucide-react'

interface CrmCandidate {
  profileId: string
  source: 'github' | 'linkedin' | 'stackoverflow'
  profileUrl: string
  name: string
  avatar?: string
  title?: string
  skills: string[]
  location?: string
  bio?: string
  email?: string
  github?: string
  linkedin?: string
  reposCount?: number
  followers?: number
  discoveredAt: string
}

const SOURCE_BADGE: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  github: { label: 'GitHub', icon: Github, color: '#24292e', bg: 'rgba(36,41,46,0.08)' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: '#0a66c2', bg: 'rgba(10,102,194,0.08)' },
  stackoverflow: { label: 'Stack Overflow', icon: Brain, color: '#f58025', bg: 'rgba(245,128,37,0.08)' },
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#0ea5e9', '#f59e0b',
]

function avatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function CandidateCard({ candidate }: { candidate: CrmCandidate }) {
  const badge = SOURCE_BADGE[candidate.source] ?? SOURCE_BADGE.github
  const BadgeIcon = badge.icon
  const color = avatarColor(candidate.name)

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'var(--tl-bg-surface)',
        border: '1px solid var(--tl-border-subtle)',
        boxShadow: '0 1px 3px rgba(17,24,39,0.05)',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(17,24,39,0.1)', y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: `${color}22`, border: `1.5px solid ${color}44`, color }}
        >
          {initials(candidate.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--tl-text-primary)' }}>
            {candidate.name}
          </p>
          {candidate.title && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--tl-text-secondary)' }}>
              {candidate.title}
            </p>
          )}
        </div>
        {/* Source badge */}
        <span
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
          style={{ background: badge.bg, color: badge.color }}
        >
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      {/* Location + GitHub stats */}
      <div className="flex items-center gap-3 flex-wrap">
        {candidate.location && (
          <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--tl-text-secondary)' }}>
            <MapPin className="w-3 h-3 shrink-0" />
            {candidate.location}
          </p>
        )}
        {candidate.source === 'github' && (candidate.followers != null || candidate.reposCount != null) && (
          <div className="flex items-center gap-2 ml-auto">
            {candidate.followers != null && (
              <span className="text-[10px] font-medium" style={{ color: 'var(--tl-text-tertiary)' }}>
                {candidate.followers} followers
              </span>
            )}
            {candidate.reposCount != null && (
              <span className="text-[10px] font-medium" style={{ color: 'var(--tl-text-tertiary)' }}>
                {candidate.reposCount} repos
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bio */}
      {candidate.bio && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--tl-text-secondary)' }}>
          {candidate.bio}
        </p>
      )}

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 5).map(s => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{
                background: 'var(--tl-bg-elevated)',
                border: '1px solid var(--tl-border-subtle)',
                color: 'var(--tl-text-secondary)',
              }}
            >
              {s}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="text-[10px]" style={{ color: 'var(--tl-text-tertiary)' }}>
              +{candidate.skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-2 pt-1 mt-auto border-t" style={{ borderColor: 'var(--tl-border-subtle)' }}>
        <span className="text-[10px] mr-auto" style={{ color: 'var(--tl-text-tertiary)' }}>
          {candidate.discoveredAt ? new Date(candidate.discoveredAt).toLocaleDateString() : '—'}
        </span>
        {candidate.github && (
          <a
            href={candidate.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(36,41,46,0.07)', color: '#24292e' }}
          >
            <Github className="w-3 h-3" />
            GitHub
          </a>
        )}
        {candidate.linkedin && (
          <a
            href={candidate.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(10,102,194,0.08)', color: '#0a66c2' }}
          >
            <Linkedin className="w-3 h-3" />
            LinkedIn
          </a>
        )}
        {!candidate.github && !candidate.linkedin && candidate.profileUrl && (
          <a
            href={candidate.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
          >
            <ExternalLink className="w-3 h-3" />
            Profile
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function CrmCandidatesPage() {
  const [candidates, setCandidates] = useState<CrmCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [skills, setSkills] = useState('React, TypeScript, Node.js')
  const [location, setLocation] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'github' | 'linkedin'>('all')
  const [showForm, setShowForm] = useState(false)
  const [lastCount, setLastCount] = useState<number | null>(null)

  const fetchCandidates = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      const res = await fetch(`/api/crm/candidates?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCandidates(Array.isArray(data) ? data : [])
      }
    } catch { /* non-fatal */ }
  }, [sourceFilter])

  useEffect(() => {
    fetchCandidates().finally(() => setInitialLoading(false))
  }, [fetchCandidates])

  const handleDiscover = async () => {
    setLoading(true)
    setLastCount(null)
    try {
      const skillArray = skills.split(',').map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/crm/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: skillArray, location: location || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setLastCount(data.discovered ?? 0)
        await fetchCandidates()
        setShowForm(false)
      }
    } catch { /* non-fatal */ } finally {
      setLoading(false)
    }
  }

  const visible = candidates.filter(c => sourceFilter === 'all' || c.source === sourceFilter)

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--tl-text-primary)' }}>
            Candidate Discovery
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--tl-text-secondary)' }}>
            Candidates discovered from GitHub API and LinkedIn via Playwright
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          {lastCount !== null && (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              +{lastCount} candidates found
            </span>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,0.35)' }}
          >
            <Brain className="w-3.5 h-3.5" />
            Discover Candidates
          </button>
        </div>
      </div>

      {/* Discovery form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'var(--tl-bg-surface)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--tl-text-primary)' }}>
                Configure Discovery
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" style={{ color: 'var(--tl-text-tertiary)' }} />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tl-text-secondary)' }}>
                  Skills (comma-separated)
                </label>
                <input
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--tl-bg-elevated)',
                    border: '1px solid var(--tl-border-default)',
                    color: 'var(--tl-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--tl-text-secondary)' }}>
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, Remote, London…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'var(--tl-bg-elevated)',
                    border: '1px solid var(--tl-border-default)',
                    color: 'var(--tl-text-primary)',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDiscover}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {loading ? 'Discovering…' : 'Run Discovery'}
              </button>
              <p className="text-xs" style={{ color: 'var(--tl-text-tertiary)' }}>
                Searches GitHub API + LinkedIn via Playwright (~30s)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'github', 'linkedin'] as const).map(f => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
            style={
              sourceFilter === f
                ? { background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }
                : { color: 'var(--tl-text-secondary)', border: '1px solid transparent' }
            }
          >
            {f === 'all'
              ? `All (${candidates.length})`
              : f === 'github'
              ? `GitHub (${candidates.filter(c => c.source === 'github').length})`
              : `LinkedIn (${candidates.filter(c => c.source === 'linkedin').length})`}
          </button>
        ))}

        <button
          onClick={() => fetchCandidates()}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--tl-text-tertiary)' }}
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {/* Content */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366f1' }} />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(99,102,241,0.08)' }}
          >
            <Users className="w-7 h-7" style={{ color: '#6366f1' }} />
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
            No candidates yet
          </h3>
          <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--tl-text-secondary)' }}>
            Click &ldquo;Discover Candidates&rdquo; to pull profiles from GitHub and LinkedIn.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Brain className="w-4 h-4" />
            Discover Now
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {visible.map((candidate, i) => (
              <motion.div
                key={candidate.profileId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <CandidateCard candidate={candidate} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
