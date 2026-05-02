'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  Bell,
  CreditCard,
  Puzzle,
  Code,
  Upload,
  Check,
  Copy,
  RefreshCw,
  Send,
  X,
  Download,
  Key,
  Eye,
  EyeOff,
  Crown,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'profile' | 'team' | 'billing' | 'notifications' | 'integrations' | 'api'

type TeamMember = {
  userId: string
  email: string
  fullName: string
  role: string
  companyId: string
  inviteAcceptedAt: string | null
  createdAt: string
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm text-muted-foreground font-medium">{children}</label>
}

function Input({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
  readOnly,
}: {
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        'w-full rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground',
        readOnly && 'opacity-70 cursor-default',
        className
      )}
    />
  )
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={cn(
        'w-full rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40',
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function UsageMeter({
  label,
  used,
  total,
  color,
}: {
  label: string
  used: number
  total: number
  color: string
}) {
  const pct = Math.round((used / total) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {used} / {total}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ─── Tab: Profile ─────────────────────────────────────────────────────────────

function TabProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    industry: 'other',
    size: '1-10',
    website: '',
    hq: '',
    founded: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/company/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.error) {
          setForm({
            name: data.name ?? '',
            industry: data.industry ?? 'other',
            size: data.size ?? '1-10',
            website: data.website ?? '',
            hq: data.hq ?? data.location ?? '',
            founded: data.founded ?? data.foundedYear ?? '',
            description: data.description ?? '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        title="Company Profile"
        description="Update your public company information visible to candidates."
      />

      {/* Logo upload */}
      <div className="space-y-2">
        <FieldLabel>Company Logo</FieldLabel>
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="border-2 border-dashed border-border rounded-xl w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-lg sm:text-xl font-black">
              C
            </div>
            <Upload className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">Upload your logo</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or SVG. Max 2MB.</p>
            <Button variant="outline" size="sm" className="gap-2 mt-2 text-xs">
              <Upload className="w-3.5 h-3.5" /> Choose File
            </Button>
          </div>
        </div>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <FieldLabel>Company Name</FieldLabel>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Corp"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Industry</FieldLabel>
          <Select
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            options={[
              { value: 'fintech', label: 'FinTech' },
              { value: 'saas', label: 'SaaS / Software' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'ecommerce', label: 'E-Commerce' },
              { value: 'ai', label: 'AI / Machine Learning' },
              { value: 'crypto', label: 'Crypto / Web3' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Company Size</FieldLabel>
          <Select
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            options={[
              { value: '1-10', label: '1 – 10' },
              { value: '11-50', label: '11 – 50' },
              { value: '51-200', label: '51 – 200' },
              { value: '201-1000', label: '201 – 1,000' },
              { value: '1001+', label: '1,000+' },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Website URL</FieldLabel>
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Headquarters</FieldLabel>
          <Input
            value={form.hq}
            onChange={(e) => setForm({ ...form, hq: e.target.value })}
            placeholder="City, Country"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Founded Year</FieldLabel>
          <Input
            value={form.founded}
            onChange={(e) => setForm({ ...form, founded: e.target.value })}
            placeholder="2020"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted-foreground"
          placeholder="Describe your company…"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'gap-2 min-w-[140px] transition-all duration-300',
            saved
              ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
              : 'bg-primary text-primary-foreground'
          )}
        >
          {saving ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
          ) : saved ? (
            <><Check className="w-4 h-4" /> Saved!</>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: Team ─────────────────────────────────────────────────────────────────

function getTeamInitials(member: TeamMember) {
  if (member.fullName?.trim()) {
    return member.fullName.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }
  return member.email[0].toUpperCase()
}

function TabTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('recruiter')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState(false)

  useEffect(() => {
    fetch('/api/company/team')
      .then(r => r.ok ? r.json() : [])
      .then((data: TeamMember[]) => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (userId: string) => {
    setMembers(m => m.filter(t => t.userId !== userId))
    await fetch(`/api/company/team/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError(null)
    setInviteSent(false)
    try {
      const res = await fetch('/api/company/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invite')
        return
      }
      setMembers(m => [...m, data as TeamMember])
      setInviteEmail('')
      setInviteSent(true)
      setTimeout(() => setInviteSent(false), 3000)
    } catch {
      setInviteError('Network error. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        title="Team Members"
        description="Manage who has access to your TalentBridge workspace."
      />

      {/* Members list */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
            Loading team…
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No team members yet. Invite someone below.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-5 py-3">
                    Member
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-4 py-3 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-4 py-3 hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.userId} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {getTeamInitials(member)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {member.fullName?.trim() || member.email}
                          </p>
                          {member.fullName?.trim() && (
                            <p className="text-[10px] text-muted-foreground truncate">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground capitalize">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {member.inviteAcceptedAt ? (
                        <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[11px] text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          Pending invite
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {member.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10"
                          onClick={() => handleRemove(member.userId)}
                          aria-label={`Remove ${member.email}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite form */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-foreground mb-4">Invite Team Member</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            placeholder="colleague@company.com"
            type="email"
            className="flex-1 rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-44"
          >
            <option value="admin">Admin</option>
            <option value="recruiter">Recruiter</option>
            <option value="interviewer">Interviewer</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className={cn(
              'gap-2 shrink-0 transition-all',
              inviteSent && 'bg-emerald-600 hover:bg-emerald-600'
            )}
          >
            {inviting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : inviteSent ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {inviteSent ? 'Sent!' : 'Send Invite'}
          </Button>
        </div>
        {inviteError && (
          <p className="text-xs text-rose-400 mt-2">{inviteError}</p>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Billing ─────────────────────────────────────────────────────────────

const INVOICES = [
  { id: 'INV-2026-04', amount: '$2,499.00', date: 'Apr 15, 2026', status: 'Paid' },
  { id: 'INV-2026-03', amount: '$2,499.00', date: 'Mar 15, 2026', status: 'Paid' },
  { id: 'INV-2026-02', amount: '$2,499.00', date: 'Feb 15, 2026', status: 'Paid' },
  { id: 'INV-2026-01', amount: '$2,499.00', date: 'Jan 15, 2026', status: 'Paid' },
  { id: 'INV-2025-12', amount: '$2,499.00', date: 'Dec 15, 2025', status: 'Paid' },
]

function TabBilling() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader title="Billing & Subscription" />

      {/* Current plan */}
      <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-foreground">Growth Plan</span>
            <span className="inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-3xl font-black text-foreground">
            $2,499<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Next billing date: May 15, 2026</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Unlimited candidates', 'AI matching', 'Analytics', '5 team seats', 'Priority support'].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
              >
                <Check className="w-2.5 h-2.5" /> {f}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
          <Button className="bg-primary text-primary-foreground flex-1 sm:flex-none">Upgrade Plan</Button>
          <button className="text-xs text-muted-foreground hover:text-rose-400 transition-colors text-center flex-1 sm:flex-none">
            Cancel subscription
          </button>
        </div>
      </div>

      {/* Usage meters */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Usage This Period</p>
        <UsageMeter label="Jobs Posted" used={8} total={10} color="bg-blue-400" />
        <UsageMeter label="Team Seats" used={3} total={5} color="bg-purple-400" />
        <UsageMeter label="Candidate Contacts" used={234} total={500} color="bg-emerald-400" />
      </div>

      {/* Enterprise promo */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
        <div className="rounded-2xl bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Upgrade to Enterprise</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unlimited seats, dedicated support, custom SLAs, and advanced analytics.
            </p>
          </div>
          <Button size="sm" className="shrink-0 bg-primary text-primary-foreground w-full sm:w-auto">
            Contact Sales
          </Button>
        </div>
      </div>

      {/* Invoice table */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Invoice History</p>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-5 py-3">Date</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-4 py-3">Amount</th>
                  <th className="text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3.5 font-semibold text-foreground">{inv.amount}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cancel zone */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
        <div>
          <p className="text-sm font-medium text-foreground">Cancel subscription</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your account remains active until the billing period ends.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-rose-500/30 text-rose-400 hover:bg-rose-400/10 hover:text-rose-400 shrink-0 w-full sm:w-auto"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Cancel Plan
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { id: 'new_app', label: 'New Applications', desc: 'When a candidate applies to any of your open roles', defaultOn: true },
  { id: 'interview', label: 'Interview Reminders', desc: 'Reminders before scheduled interviews', defaultOn: true },
  { id: 'offer', label: 'Offer Responses', desc: 'When candidates accept or decline offers', defaultOn: true },
  { id: 'weekly', label: 'Weekly Report', desc: 'Summary of hiring activity every Monday morning', defaultOn: false },
  { id: 'ai', label: 'AI Insights', desc: 'AI-powered recommendations and anomaly alerts', defaultOn: true },
]

function TabNotifications() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map((n) => [n.id, n.defaultOn]))
  )

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notification Preferences"
        description="Choose what updates you want to receive."
      />
      <div className="glass-card divide-y divide-border overflow-hidden">
        {NOTIF_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Toggle
              checked={states[item.id]}
              onChange={(v) => setStates((s) => ({ ...s, [item.id]: v }))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Integrations ─────────────────────────────────────────────────────────

type Integration = {
  name: string
  desc: string
  initial: string
  initBg: string
  connected: boolean
  enterprise?: boolean
}

const INTEGRATIONS: Integration[] = [
  { name: 'Greenhouse', desc: 'ATS & recruiting software', initial: 'G', initBg: 'bg-emerald-500/20 text-emerald-400', connected: true },
  { name: 'Lever', desc: 'Modern talent acquisition', initial: 'L', initBg: 'bg-blue-500/20 text-blue-400', connected: false },
  { name: 'Workday', desc: 'Enterprise HR platform', initial: 'W', initBg: 'bg-indigo-500/20 text-indigo-400', connected: false, enterprise: true },
  { name: 'Slack', desc: 'Team messaging and alerts', initial: 'S', initBg: 'bg-purple-500/20 text-purple-400', connected: false },
  { name: 'Gmail', desc: 'Email integration', initial: 'G', initBg: 'bg-rose-500/20 text-rose-400', connected: true },
  { name: 'Zapier', desc: 'Automate workflows', initial: 'Z', initBg: 'bg-amber-500/20 text-amber-400', connected: false },
  { name: 'Google Calendar', desc: 'Interview scheduling', initial: 'C', initBg: 'bg-cyan-500/20 text-cyan-400', connected: true },
  { name: 'LinkedIn', desc: 'Source candidates directly', initial: 'Li', initBg: 'bg-blue-600/20 text-blue-400', connected: false },
]

function TabIntegrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.name, i.connected]))
  )

  const toggle = (name: string) => setConnected((prev) => ({ ...prev, [name]: !prev[name] }))

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        description="Connect TalentBridge to your existing recruiting stack."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INTEGRATIONS.map((item) => (
          <div key={item.name} className="glass-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0', item.initBg)}>
              {item.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
            </div>
            {item.enterprise ? (
              <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-lg shrink-0">
                Enterprise
              </span>
            ) : connected[item.name] ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-rose-400 hover:bg-rose-400/10 hover:text-rose-400"
                  onClick={() => toggle(item.name)}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="shrink-0 text-xs h-7" onClick={() => toggle(item.name)}>
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: API & Webhooks ───────────────────────────────────────────────────────

function TabApi() {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvents, setWebhookEvents] = useState({
    'application.created': true,
    'application.moved': true,
    'offer.sent': false,
    hired: false,
  })

  const API_KEY = 'tb_live_sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p'

  const handleCopy = () => {
    navigator.clipboard.writeText(API_KEY).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <SectionHeader
        title="API & Webhooks"
        description="Integrate TalentBridge into your own systems and workflows."
      />

      {/* API Key */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Your API Key</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Use this key to authenticate API requests. Never share it publicly.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={API_KEY}
              readOnly
              className="w-full rounded-xl bg-muted border border-border text-xs text-muted-foreground font-mono px-3 py-2.5 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-none" onClick={() => setShowKey((v) => !v)}>
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showKey ? 'Hide' : 'Show'}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1 sm:flex-none" onClick={handleCopy}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-400/10 hover:text-rose-400">
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate Key
        </Button>
      </div>

      {/* Webhooks */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Webhook Settings</p>
        <p className="text-xs text-muted-foreground">
          Receive real-time event notifications to your endpoint.
        </p>
        <div className="space-y-1.5">
          <FieldLabel>Webhook URL</FieldLabel>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhook"
            className="w-full rounded-xl bg-card border border-border text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel>Events to send</FieldLabel>
          <div className="space-y-2">
            {(Object.keys(webhookEvents) as Array<keyof typeof webhookEvents>).map((event) => (
              <label key={event} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookEvents[event]}
                  onChange={(e) => setWebhookEvents((prev) => ({ ...prev, [event]: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground font-mono">{event}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none">Test Webhook</Button>
          <Button size="sm" className="text-xs bg-primary text-primary-foreground flex-1 sm:flex-none">Save Webhook</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'api', label: 'API & Webhooks', icon: Code },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

const TAB_COMPONENTS: Record<TabId, React.ReactNode> = {
  profile: <TabProfile />,
  team: <TabTeam />,
  billing: <TabBilling />,
  notifications: <TabNotifications />,
  integrations: <TabIntegrations />,
  api: <TabApi />,
}

export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company account, team, and preferences.
        </p>
      </div>

      {/* Mobile: horizontal tab pills */}
      <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground bg-muted/40 hover:text-foreground hover:bg-muted/60'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shared layout: desktop sidebar + single content area */}
      <div className="flex gap-8">
        {/* Desktop sidebar nav (hidden on mobile) */}
        <nav className="hidden md:block w-52 shrink-0">
          <div className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left w-full transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content — rendered once, shared for all screen sizes */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {TAB_COMPONENTS[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
