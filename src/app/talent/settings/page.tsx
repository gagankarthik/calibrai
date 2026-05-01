'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  User,
  Shield,
  Bell,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Check,
  Zap,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-tl-teal' : 'bg-tl-bg-elevated'
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
      <h3 className="text-base font-display font-semibold text-tl-text-primary">{title}</h3>
      {description && <p className="text-sm text-tl-text-secondary mt-0.5">{description}</p>}
    </div>
  )
}

// ─── Delete Account Dialog ────────────────────────────────────────────────────
function DeleteDialog({ onClose }: { onClose: () => void }) {
  const [confirmText, setConfirmText] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative tl-card w-full max-w-md p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-tl-rose/10 border border-tl-rose/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-tl-rose" />
          </div>
          <div>
            <h3 className="font-semibold text-tl-text-primary">Delete Account</h3>
            <p className="text-xs text-tl-text-secondary">This action is permanent and cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-tl-text-secondary mb-4">
          All your data, applications, profile and settings will be permanently deleted.
          Type <code className="px-1 py-0.5 rounded bg-tl-rose/10 text-tl-rose font-mono text-xs">DELETE</code> to confirm.
        </p>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="mb-4 bg-tl-bg-elevated border-tl-rose/30 focus:ring-tl-rose/40 font-mono text-tl-text-primary placeholder:text-tl-text-secondary"
        />
        <div className="flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            disabled={confirmText !== 'DELETE'}
            className="px-4 py-2 rounded-xl bg-tl-rose text-white text-sm font-semibold border-0 disabled:opacity-40 hover:bg-tl-rose/90 transition-colors"
            onClick={() => { toast.error('Account deletion initiated'); onClose() }}
          >
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Change Email Dialog ──────────────────────────────────────────────────────
function ChangeEmailDialog({ onClose }: { onClose: () => void }) {
  const [newEmail, setNewEmail] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative tl-card w-full max-w-md p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="font-display font-semibold text-tl-text-primary mb-1">Change Email Address</h3>
        <p className="text-sm text-tl-text-secondary mb-4">A verification link will be sent to your new email.</p>
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@email.com"
          className="mb-4 bg-tl-bg-elevated border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold focus:ring-tl-gold/20"
        />
        <div className="flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-gold"
            onClick={() => { toast.success('Verification email sent'); onClose() }}
          >
            Send Verification
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Tab: Account ─────────────────────────────────────────────────────────────
function TabAccount() {
  const [showDelete, setShowDelete] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })

  const handlePwUpdate = () => {
    if (!pwForm.current || !pwForm.newPw) return toast.error('Please fill in all fields')
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match')
    toast.success('Password updated successfully')
    setPwForm({ current: '', newPw: '', confirm: '' })
  }

  return (
    <div className="space-y-8">
      {showDelete && <DeleteDialog onClose={() => setShowDelete(false)} />}
      {showEmailDialog && <ChangeEmailDialog onClose={() => setShowEmailDialog(false)} />}

      {/* Email */}
      <div>
        <SectionHeader title="Email Address" description="Your sign-in email address." />
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-tl-bg-elevated border border-tl-border-default">
            <Mail className="w-4 h-4 text-tl-text-secondary shrink-0" />
            <span className="text-sm text-tl-text-secondary">alex.chen@email.com</span>
          </div>
          <button className="btn-ghost shrink-0 text-sm" onClick={() => setShowEmailDialog(true)}>
            Change Email
          </button>
        </div>
      </div>

      <Separator className="bg-tl-border-subtle" />

      {/* Password */}
      <div>
        <SectionHeader title="Change Password" description="Use a strong password you don't use elsewhere." />
        <div className="space-y-3">
          {[
            { label: 'Current password', field: 'current', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { label: 'New password', field: 'newPw', show: showNew, toggle: () => setShowNew(!showNew) },
            { label: 'Confirm new password', field: 'confirm', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map(({ label, field, show, toggle }) => (
            <div key={field} className="relative">
              <Input
                type={show ? 'text' : 'password'}
                placeholder={label}
                value={pwForm[field as keyof typeof pwForm]}
                onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                className="pr-10 bg-tl-bg-elevated border-tl-border-default text-tl-text-primary placeholder:text-tl-text-secondary focus:border-tl-gold focus:ring-tl-gold/20"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tl-text-secondary hover:text-tl-text-primary"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ))}
          <button
            onClick={handlePwUpdate}
            className="btn-gold gap-2 flex items-center"
          >
            <Lock className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </div>

      <Separator className="bg-tl-border-subtle" />

      {/* Danger zone */}
      <div>
        <SectionHeader title="Danger Zone" />
        <div className="p-4 rounded-xl border border-tl-rose/20 bg-tl-rose/5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-tl-text-primary">Delete my account</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">Permanently delete your account and all associated data.</p>
          </div>
          <button
            className="shrink-0 px-3 py-1.5 rounded-xl border border-tl-rose/30 text-tl-rose hover:bg-tl-rose/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Privacy ─────────────────────────────────────────────────────────────
function TabPrivacy() {
  const [visibility, setVisibility] = useState('recruiters')
  const [hideEmployer, setHideEmployer] = useState(false)
  const [anonymousBrowse, setAnonymousBrowse] = useState(false)
  const [allowContact, setAllowContact] = useState(true)

  const handleSave = () => toast.success('Privacy settings saved')

  return (
    <div className="space-y-6">
      <SectionHeader title="Privacy Settings" description="Control how your profile and activity appear to others." />

      {/* Profile visibility */}
      <div className="tl-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-tl-text-primary">Profile Visibility</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">Who can see your TalentBridge profile</p>
          </div>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="rounded-xl bg-tl-bg-elevated border border-tl-border-default text-sm text-tl-text-primary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-tl-gold/40"
          >
            <option value="public">Public</option>
            <option value="recruiters">Recruiters Only</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {[
        {
          label: 'Hide from my current employer',
          desc: 'Prevent your current employer from seeing your profile in search results',
          value: hideEmployer,
          onChange: setHideEmployer,
        },
        {
          label: 'Anonymous browsing mode',
          desc: 'Browse company profiles without being tracked or notified',
          value: anonymousBrowse,
          onChange: setAnonymousBrowse,
        },
        {
          label: 'Allow contact from recruiters',
          desc: 'Let recruiters send you messages and job opportunities',
          value: allowContact,
          onChange: setAllowContact,
        },
      ].map((item) => (
        <div key={item.label} className="tl-card p-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-tl-text-primary">{item.label}</p>
            <p className="text-xs text-tl-text-secondary mt-0.5">{item.desc}</p>
          </div>
          <Toggle
            checked={item.value}
            onChange={(v) => { item.onChange(v); toast.success('Privacy setting updated') }}
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="btn-gold gap-2 flex items-center"
      >
        <Check className="w-4 h-4" />
        Save Privacy Settings
      </button>
    </div>
  )
}

// ─── Tab: Notifications ────────────────────────────────────────────────────────
const TALENT_NOTIFS = [
  { id: 'match', label: 'New job match (90%+ score)', desc: 'When AI finds a highly compatible role for you', defaultOn: true },
  { id: 'status', label: 'Application status update', desc: 'When your application moves through stages', defaultOn: true },
  { id: 'message', label: 'Message received', desc: 'When a recruiter sends you a message', defaultOn: true },
  { id: 'viewed', label: 'Profile viewed by recruiter', desc: 'When a recruiter looks at your profile', defaultOn: false },
  { id: 'digest', label: 'Weekly job digest', desc: 'Top matches curated for you every Monday', defaultOn: true },
  { id: 'insights', label: 'Career path insights', desc: 'AI-powered salary and growth recommendations', defaultOn: true },
]

function TabNotifications() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(TALENT_NOTIFS.map((n) => [n.id, n.defaultOn]))
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
      <SectionHeader title="Notification Preferences" description="Stay informed on what matters to your job search." />
      <div className="space-y-3">
        {TALENT_NOTIFS.map((item) => (
          <div key={item.id} className="tl-card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-tl-text-primary">{item.label}</p>
              <p className="text-xs text-tl-text-secondary mt-0.5">{item.desc}</p>
            </div>
            <Toggle checked={states[item.id]} onChange={() => toggle(item.id)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab: Premium ─────────────────────────────────────────────────────────────
const PREMIUM_FEATURES = [
  'Unlimited AI job matches per day',
  'See who viewed your profile',
  'Priority application badge',
  'Real-time salary benchmarking',
  'Career coach AI (unlimited sessions)',
  'Anonymous browsing mode',
  'Direct messaging to hiring managers',
  'Application tracking with analytics',
]

function TabPremium() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Premium Membership" description="Unlock the full power of TalentBridge AI." />

      {/* Current plan */}
      <div className="tl-card p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-tl-text-primary">Current Plan</p>
          <p className="text-xs text-tl-text-secondary mt-0.5">Free — limited matches and features</p>
        </div>
        <Badge variant="outline" className="text-tl-text-secondary border-tl-border-default">Free</Badge>
      </div>

      {/* Upgrade card */}
      <div className="tl-card-gold p-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-tl-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-tl-gold/20 border border-tl-gold/30 flex items-center justify-center">
              <Crown className="w-4 h-4 text-tl-gold" />
            </div>
            <div>
              <span className="text-base font-display font-bold text-tl-text-primary">TalentBridge Premium</span>
              <Badge className="ml-2 tl-tag-gold text-[10px]">
                Most Popular
              </Badge>
            </div>
          </div>

          <p className="text-sm text-tl-text-secondary mb-5">
            Land your dream job faster with AI-powered tools built for ambitious professionals.
          </p>

          {/* Features list */}
          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {PREMIUM_FEATURES.map((feat) => (
              <div key={feat} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-tl-teal/20 border border-tl-teal/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-tl-teal" />
                </div>
                <span className="text-xs text-tl-text-secondary">{feat}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-gold w-full gap-2 flex items-center justify-center h-11 text-base font-semibold"
            onClick={() => toast.success('Redirecting to checkout...')}
          >
            <Zap className="w-4 h-4" />
            Upgrade for $49/month
          </button>
          <p className="text-center text-xs text-tl-text-secondary mt-3">
            Cancel anytime. No lock-in contracts.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'premium', label: 'Premium', icon: Crown },
] as const

type TabId = typeof TABS[number]['id']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TalentSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('account')

  const tabContent: Record<TabId, React.ReactNode> = {
    account: <TabAccount />,
    privacy: <TabPrivacy />,
    notifications: <TabNotifications />,
    premium: <TabPremium />,
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="section-eyebrow mb-2">My Account</p>
        <h1 className="text-2xl font-display font-bold text-tl-text-primary">Settings</h1>
        <p className="text-sm text-tl-text-secondary mt-1">Manage your account, privacy, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="lg:w-48 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'sidebar-link',
                  activeTab === tab.id && 'active'
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
                {tab.id === 'premium' && (
                  <Crown className="w-3 h-3 text-tl-gold ml-auto" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
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
