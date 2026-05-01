'use client'

import { useState, useMemo } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MatchRing } from '@/components/shared/match-score'
import { candidates } from '@/lib/data'
import { cn, formatSalary, truncate } from '@/lib/utils'
import { Candidate } from '@/lib/types'
import {
  Search, SlidersHorizontal, Grid3X3, List, Bookmark,
  CheckCircle2, MapPin, DollarSign, Zap, ChevronLeft,
  ChevronRight, X, Filter,
} from 'lucide-react'

const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead / Staff', 'Executive']
const WORK_PREFS = ['Remote', 'Hybrid', 'Onsite']
const AVAILABILITY_OPTIONS = ['Available now', 'Open to opportunities', 'Casually looking', 'Not looking']

function AvailabilityDot({ availability }: { availability: string }) {
  const isNow = availability.toLowerCase().includes('now') || availability.toLowerCase().includes('looking now')
  const isOpen = availability.toLowerCase().includes('open') || availability.toLowerCase().includes('4 weeks')
  const color = isNow ? 'bg-emerald-400' : isOpen ? 'bg-blue-400' : 'bg-amber-400'
  return <span className={cn('inline-block w-2 h-2 rounded-full flex-shrink-0', color)} />
}

function SkillBadge({ name, verified }: { name: string; verified: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
      verified
        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        : 'bg-white/[0.05] border-white/[0.1] text-muted-foreground'
    )}>
      {verified && <CheckCircle2 className="w-3 h-3" />}
      {name}
    </span>
  )
}

function CandidateGridCard({ candidate }: { candidate: Candidate }) {
  const [saved, setSaved] = useState(false)
  const topSkills = candidate.skills.slice(0, 3)

  return (
    <div className="glass-card p-5 hover:border-white/[0.18] hover:shadow-xl transition-all duration-300 group flex flex-col">
      {/* Avatar + actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-white/[0.08] group-hover:ring-white/[0.18] transition-all">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback className="bg-secondary text-foreground font-semibold">{candidate.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-background" />
        </div>
        <div className="flex items-center gap-2">
          {candidate.verified && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
          {candidate.premium && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Premium
            </span>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="mb-3">
        <h3 className="font-semibold text-foreground text-base">{candidate.name}</h3>
        <p className="text-sm text-muted-foreground">{candidate.title}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-1">
          <MapPin className="w-3 h-3" /> {candidate.location}
        </p>
      </div>

      {/* Match ring */}
      <div className="flex items-center justify-center my-3">
        <div className="relative">
          <MatchRing score={candidate.matchScore} size={72} strokeWidth={5} />
          <p className="text-[10px] text-muted-foreground text-center mt-1">AI Match</p>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {topSkills.map(skill => (
          <SkillBadge key={skill.name} name={skill.name} verified={skill.verified} />
        ))}
      </div>

      {/* Salary + Availability */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 mt-auto pt-3 border-t border-white/[0.06]">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {formatSalary(candidate.salaryExpectation, candidate.salaryExpectation)}
        </span>
        <span className="flex items-center gap-1.5">
          <AvailabilityDot availability={candidate.availability} />
          {truncate(candidate.availability, 20)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 btn-primary text-sm py-2 px-3 text-center">
          View Profile
        </button>
        <button
          onClick={() => setSaved(p => !p)}
          className={cn(
            'p-2 rounded-xl border transition-all duration-200',
            saved
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
              : 'bg-white/[0.05] border-white/[0.1] text-muted-foreground hover:text-foreground hover:border-white/[0.2]'
          )}
        >
          <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
        </button>
      </div>
    </div>
  )
}

function CandidateListRow({ candidate }: { candidate: Candidate }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="glass-card px-5 py-4 hover:border-white/[0.15] transition-all duration-200 flex items-center gap-4">
      <Avatar className="w-11 h-11 flex-shrink-0">
        <AvatarImage src={candidate.avatar} alt={candidate.name} />
        <AvatarFallback className="bg-secondary text-sm font-semibold">{candidate.name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-foreground">{candidate.name}</p>
          {candidate.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground">{candidate.title} · {candidate.location}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap max-w-[200px]">
        {candidate.skills.slice(0, 2).map(s => (
          <SkillBadge key={s.name} name={s.name} verified={s.verified} />
        ))}
      </div>
      <div className="flex-shrink-0 flex items-center gap-3">
        <MatchRing score={candidate.matchScore} size={44} strokeWidth={4} />
        <span className="text-xs text-muted-foreground w-20 text-right">{truncate(candidate.availability, 18)}</span>
        <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
          View
        </button>
        <button
          onClick={() => setSaved(p => !p)}
          className={cn('p-1.5 rounded-lg transition-all', saved ? 'text-blue-400' : 'text-muted-foreground hover:text-foreground')}
        >
          <Bookmark className={cn('w-4 h-4', saved && 'fill-current')} />
        </button>
      </div>
    </div>
  )
}

export default function CandidatesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [selectedExp, setSelectedExp] = useState<string[]>([])
  const [selectedWork, setSelectedWork] = useState<string[]>([])
  const [salaryRange, setSalaryRange] = useState(300)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [availability, setAvailability] = useState('')
  const [sortBy, setSortBy] = useState('match')
  const [page, setPage] = useState(1)
  const [skillInput, setSkillInput] = useState('')
  const [filterSkills, setFilterSkills] = useState<string[]>([])

  const activeFilterCount = selectedExp.length + selectedWork.length +
    filterSkills.length + (verifiedOnly ? 1 : 0) + (premiumOnly ? 1 : 0) + (availability ? 1 : 0)

  const filtered = useMemo(() => {
    let list = [...candidates]
    if (search) list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
    )
    if (verifiedOnly) list = list.filter(c => c.verified)
    if (premiumOnly) list = list.filter(c => c.premium)
    if (filterSkills.length) list = list.filter(c =>
      filterSkills.every(fs => c.skills.some(s => s.name.toLowerCase().includes(fs.toLowerCase())))
    )
    if (sortBy === 'match') list.sort((a, b) => b.matchScore - a.matchScore)
    else if (sortBy === 'salary') list.sort((a, b) => a.salaryExpectation - b.salaryExpectation)
    return list
  }, [search, verifiedOnly, premiumOnly, filterSkills, sortBy])

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      setFilterSkills(prev => Array.from(new Set([...prev, skillInput.trim()])))
      setSkillInput('')
    }
  }

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* Filter sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white rounded-full px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Experience */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Experience</p>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map(lvl => (
                <label key={lvl} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedExp.includes(lvl)}
                    onChange={() => setSelectedExp(prev =>
                      prev.includes(lvl) ? prev.filter(x => x !== lvl) : [...prev, lvl]
                    )}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{lvl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work preference */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Work Preference</p>
            <div className="space-y-2">
              {WORK_PREFS.map(pref => (
                <label key={pref} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedWork.includes(pref)}
                    onChange={() => setSelectedWork(prev =>
                      prev.includes(pref) ? prev.filter(x => x !== pref) : [...prev, pref]
                    )}
                    className="w-4 h-4 rounded accent-blue-500"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{pref}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary range */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Max Salary: <span className="text-foreground">${salaryRange}K</span>
            </p>
            <input
              type="range" min={50} max={500} step={10}
              value={salaryRange}
              onChange={e => setSalaryRange(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>$50K</span><span>$500K</span>
            </div>
          </div>

          {/* Skills filter */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</p>
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder="Type & press Enter…"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {filterSkills.map(s => (
                <span key={s} className="inline-flex items-center gap-1 text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  {s}
                  <button onClick={() => setFilterSkills(prev => prev.filter(x => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Availability</p>
            <select
              value={availability}
              onChange={e => setAvailability(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Any</option>
              {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-muted-foreground">Verified Only</span>
              <button
                onClick={() => setVerifiedOnly(p => !p)}
                className={cn('w-10 h-5.5 h-[22px] rounded-full transition-all duration-200 relative',
                  verifiedOnly ? 'bg-blue-500' : 'bg-white/[0.1]'
                )}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                  verifiedOnly && 'translate-x-[18px]'
                )} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-muted-foreground">Premium Only</span>
              <button
                onClick={() => setPremiumOnly(p => !p)}
                className={cn('w-10 h-[22px] rounded-full transition-all duration-200 relative',
                  premiumOnly ? 'bg-amber-500' : 'bg-white/[0.1]'
                )}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                  premiumOnly && 'translate-x-[18px]'
                )} />
              </button>
            </label>
          </div>
        </div>

        {/* Filter actions */}
        <div className="p-4 border-t border-white/[0.06] flex gap-2">
          <button
            onClick={() => { setSelectedExp([]); setSelectedWork([]); setVerifiedOnly(false); setPremiumOnly(false); setAvailability(''); setFilterSkills([]) }}
            className="flex-1 text-xs py-2 rounded-lg border border-white/[0.1] text-muted-foreground hover:text-foreground transition-all"
          >
            Clear All
          </button>
          <button className="flex-1 text-xs py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-all">
            Apply
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Talent Pool</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Browse <span className="text-blue-400 font-semibold">87,000+</span> verified candidates
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-[11px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                )}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates…"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Sort + view toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Sorted by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-foreground font-medium border-0 focus:outline-none cursor-pointer"
              >
                <option value="match">Match Score</option>
                <option value="salary">Salary (Low-High)</option>
                <option value="recent">Recently Active</option>
              </select>
              <span className="text-muted-foreground/40 mx-2">·</span>
              <span>{filtered.length} results</span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setView('grid')}
                className={cn('p-1.5 rounded-lg transition-all', view === 'grid' ? 'bg-white/[0.1] text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn('p-1.5 rounded-lg transition-all', view === 'list' ? 'bg-white/[0.1] text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Candidate grid/list */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(c => <CandidateGridCard key={c.id} candidate={c} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map(c => <CandidateListRow key={c.id} candidate={c} />)}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium text-foreground">No candidates found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 border-t border-white/[0.06] px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(filtered.length, 12)} of <span className="text-foreground font-medium">87,412</span> candidates
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-white/[0.1] text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3, 4, 5].map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', page === p
                  ? 'bg-blue-500 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-white/[0.1] text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
