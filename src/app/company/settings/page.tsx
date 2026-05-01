'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  Bell,
  CreditCard,
  Plug,
  Upload,
  Check,
  Copy,
  RefreshCw,
  Trash2,
  Send,
  X,
  Download,
  ExternalLink,
  Key,
  Globe,
  Webhook,
  ChevronRight,
  AlertTriangle,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-blue-600' : 'bg-white/10'
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
    <div className="mb-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <label className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Plug },
] as const

type TabId = typeof TABS[number]['id']

// ─── Tab: Company Profile ─────────────────────────────────────────────────────
function TabProfile() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: 'Stripe Corp',
    industry: 'fintech',
    size: '1001+',
    website: 'https://stripe.com',
    description: 'Stripe is a technology company that builds economic infrastructure for the internet.',
    location: 'San Francisco, CA',
  })

  const handleSave = () => {
    setSaved(true)
    toast.success('Company profile saved successfully')
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Company Profile" description="Update your public company information." />

      {/* Logo upload */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shrink-0">
          S
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Company Logo</p>
          <p className="text-xs text-muted-foreground mb-3">JPG, PNG or SVG. Max 2MB.</p>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-3.5 h-3.5" />
            Upload Logo
          </Button>
        </div>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-5">
        <FieldRow label="Company name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-white/[0.03] border-white/[0.08]"
          />
        </FieldRow>

        <FieldRow label="Industry">
          <select
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="fintech">FinTech</option>
            <option value="saas">SaaS / Software</option>
            <option value="healthcare">Healthcare</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="ai">AI / Machine Learning</option>
            <option value="crypto">Crypto / Web3</option>
            <option value="other">Other</option>
          </select>
        </FieldRow>

        <FieldRow label="Company size">
          <select
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="1-10">1 – 10</option>
            <option value="11-50">11 – 50</option>
            <option value="51-200">51 – 200</option>
            <option value="201-1000">201 – 1,000</option>
            <option value="1001+">1,000+</option>
          </select>
        </FieldRow>

        <FieldRow label="Website">
          <Input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="bg-white/[0.03] border-white/[0.08]"
            placeholder="https://example.com"
          />
        </FieldRow>

        <FieldRow label="Location">
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="bg-white/[0.03] border-white/[0.08]"
            placeholder="City, Country"
          />
        </FieldRow>

        <FieldRow label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none placeholder:text-muted-foreground"
            placeholder="Describe your company..."
          />
        </FieldRow>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          className={cn(
            'gap-2 min-w-[140px] transition-all duration-300',
            saved
              ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0'
          )}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: Team ─────────────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  { name: 'Sarah Kim', role: 'Admin', email: 'sarah@stripe.com', active: '2h ago', avatar: 'sarah' },
  { name: 'James Park', role: 'Recruiter', email: 'james@stripe.com', active: '1d ago', avatar: 'james' },
  { name: 'Maria Lopez', role: 'Hiring Manager', email: 'maria@stripe.com', active: '3h ago', avatar: 'maria' },
  { name: 'Tom Chen', role: 'Recruiter', email: 'tom@stripe.com', active: '5m ago', avatar: 'tom' },
]

function TabTeam() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('recruiter')
  const [members, setMembers] = useState(TEAM_MEMBERS)

  const handleRemove = (email: string) => {
    setMembers((m) => m.filter((t) => t.email !== email))
    toast.success('Team member removed')
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    toast.success(`Invite sent to ${inviteEmail}`)
    setInviteEmail('')
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Team Members" description="Manage who has access to your Calibr workspace." />

      {/* Members table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Member</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3 hidden sm:table-cell">Role</th>
              <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3 hidden md:table-cell">Last Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.email} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                  {member.active}
                </td>
                <td className="px-4 py-3 text-right">
                  {member.role !== 'Admin' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => handleRemove(member.email)}
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

      <Separator className="bg-border" />

      {/* Invite form */}
      <div>
        <SectionHeader title="Invite Team Member" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 bg-white/[0.03] border-white/[0.08]"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-44"
          >
            <option value="recruiter">Recruiter</option>
            <option value="hiring-manager">Hiring Manager</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button
            onClick={handleInvite}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send Invite
          </Button>
        </div>
      </div>

      {/* Pending invites */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Pending Invites</p>
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">david@stripe.com</p>
              <p className="text-xs text-muted-foreground">Recruiter · Sent 2 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="text-xs h-7 px-3" onClick={() => toast.success('Invite resent')}>
              Resend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-3 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
              onClick={() => toast.success('Invite cancelled')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────
const NOTIF_ITEMS = [
  { id: 'new_app', label: 'New application received', desc: 'When a candidate applies to any of your open roles', defaultOn: true },
  { id: 'ai_match', label: 'AI high-match alert', desc: '90%+ match found for one of your open roles', defaultOn: true },
  { id: 'message', label: 'Candidate sends message', desc: 'When a candidate replies to your outreach', defaultOn: true },
  { id: 'digest', label: 'Weekly digest', desc: 'Summary of hiring activity every Monday', defaultOn: false },
  { id: 'offer', label: 'Offer accepted / rejected', desc: 'Instant notification when candidates respond to offers', defaultOn: true },
]

function TabNotifications() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map((n) => [n.id, n.defaultOn]))
  )

  const toggle = (id: string) => {
    setStates((s) => {
      const next = { ...s, [id]: !s[id] }
      toast.success(`Notification ${next[id] ? 'enabled' : 'disabled'}`)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Notification Preferences" description="Choose what updates you want to receive." />
      <div className="space-y-3">
        {NOTIF_ITEMS.map((item) => (
          <div key={item.id} className="glass-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={states[item.id]} onChange={() => toggle(item.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Billing ─────────────────────────────────────────────────────────────
const INVOICES = [
  { id: 'INV-2024-04', amount: '$2,499.00', date: 'Apr 15, 2026', status: 'Paid' },
  { id: 'INV-2024-03', amount: '$2,499.00', date: 'Mar 15, 2026', status: 'Paid' },
  { id: 'INV-2024-02', amount: '$2,499.00', date: 'Feb 15, 2026', status: 'Paid' },
]

function TabBilling() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Billing & Subscription" />

      {/* Current plan */}
      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-foreground">Growth Plan</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">$2,499<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground mt-1">Next billing date: May 15, 2026</p>
          </div>
          <Button variant="outline" size="sm">Manage Plan</Button>
        </div>
      </div>

      {/* Enterprise promo */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500">
        <div className="rounded-2xl bg-card p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">Upgrade to Enterprise</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unlimited seats, dedicated support, custom SLAs, and advanced analytics.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            onClick={() => toast.success('Our sales team will contact you shortly!')}
          >
            Contact Sales
          </Button>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Payment method */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Payment Method</p>
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-white/10 border border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-bold text-blue-400">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Visa ending 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/27</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info('Payment method update coming soon')}>
            Update
          </Button>
        </div>
      </div>

      {/* Invoices */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">Invoice History</p>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Invoice</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Amount</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{inv.amount}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{inv.date}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.info('Downloading invoice...')}>
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel */}
      <Separator className="bg-border" />
      <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <div>
          <p className="text-sm font-medium text-foreground">Cancel subscription</p>
          <p className="text-xs text-muted-foreground mt-0.5">Your account will remain active until the billing period ends.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-400/10 hover:text-red-400 shrink-0"
          onClick={() => toast.error('Plan cancellation initiated. You will receive a confirmation email.')}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Cancel Plan
        </Button>
      </div>
    </div>
  )
}

// ─── Tab: Integrations ─────────────────────────────────────────────────────────
const ATS_TOOLS = [
  { name: 'Greenhouse', desc: 'ATS & recruiting software', connected: true, logo: '🌿' },
  { name: 'Lever', desc: 'Modern talent acquisition', connected: false, logo: '⚡' },
  { name: 'Workday', desc: 'Enterprise only', connected: false, enterprise: true, logo: '🔷' },
  { name: 'BambooHR', desc: 'HR software platform', connected: false, logo: '🎋' },
]

function TabIntegrations() {
  const [apiKey] = useState('tb_live_••••••••••••••••••••••••••••••••4a9f')
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.your-app.com/calibr')
  const [webhookEvents, setWebhookEvents] = useState({
    application: true,
    match: true,
    offer: false,
    message: true,
  })

  const toggleEvent = (key: keyof typeof webhookEvents) => {
    setWebhookEvents((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Integrations" description="Connect Calibr to your existing recruiting stack." />

      {/* ATS cards */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">ATS Integrations</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {ATS_TOOLS.map((tool) => (
            <div key={tool.name} className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xl shrink-0">
                {tool.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
              {tool.connected ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs shrink-0">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : tool.enterprise ? (
                <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                  Enterprise
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs h-7"
                  onClick={() => toast.info(`Connecting to ${tool.name}...`)}
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* API Key */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">API Access</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-3">Your secret API key. Never share it publicly.</p>
          <div className="flex gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/[0.06] text-xs text-muted-foreground font-mono truncate">
              {apiKey}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => { navigator.clipboard.writeText('tb_live_real_key'); toast.success('API key copied') }}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => toast.success('API key regenerated. Update your integrations.')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Webhooks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Webhook className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Webhook Settings</p>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-app.com/webhook"
              className="flex-1 bg-white/[0.03] border-white/[0.08] font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => toast.success('Webhook test sent!')}
            >
              Test
            </Button>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Trigger on events:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(webhookEvents) as Array<keyof typeof webhookEvents>).map((key) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={webhookEvents[key]}
                    onChange={() => toggleEvent(key)}
                    className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm text-muted-foreground capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
            onClick={() => toast.success('Webhook settings saved')}
          >
            Save Webhook
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CompanySettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  const tabContent: Record<TabId, React.ReactNode> = {
    profile: <TabProfile />,
    team: <TabTeam />,
    notifications: <TabNotifications />,
    billing: <TabBilling />,
    integrations: <TabIntegrations />,
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="section-eyebrow mb-2">Workspace</p>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your company account, team, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <nav className="lg:w-52 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 text-left w-full',
                  activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
