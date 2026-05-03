'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { SidebarTalent, useSidebarCollapsed } from '@/components/shared/sidebar-talent'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Bell,
  Search,
  Home,
  ChevronRight,
  Zap,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Command,
  Menu,
  HelpCircle,
  BookOpen,
  MessageCircle,
  PlayCircle,
  LayoutDashboard,
  FileText,
} from 'lucide-react'
import { cn, userAvatarUrl } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// ── Page names ────────────────────────────────────────────────────────────────

const PAGE_NAMES: Record<string, string> = {
  '/talent/dashboard': 'Dashboard',
  '/talent/jobs': 'Browse Jobs',
  '/talent/applications': 'Applications',
  '/talent/profile': 'My Profile',
  '/talent/notifications': 'Notifications',
  '/talent/messages': 'Messages',
  '/talent/settings': 'Settings',
}

// ── Drawer nav items (mirrors sidebar) ───────────────────────────────────────

const drawerNavItems = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/talent/jobs', icon: Search },
  { label: 'Applications', href: '/talent/applications', icon: FileText },
  { label: 'My Profile', href: '/talent/profile', icon: User },
  { label: 'Settings', href: '/talent/settings', icon: Settings },
]

// ── Notification item type ────────────────────────────────────────────────────

interface NotifItem {
  id: string
  title: string
  body: string
  createdAt: string
  readAt?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// ── CommandPalette ────────────────────────────────────────────────────────────

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  const suggestions = [
    { label: 'Go to Dashboard', href: '/talent/dashboard', shortcut: 'D' },
    { label: 'Browse Jobs', href: '/talent/jobs', shortcut: 'J' },
    { label: 'My Applications', href: '/talent/applications', shortcut: 'A' },
    { label: 'My Profile', href: '/talent/profile', shortcut: 'P' },
    { label: 'Settings', href: '/talent/settings', shortcut: 'S' },
  ].filter((s) => !query || s.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 tl-card-elevated overflow-hidden shadow-elevated">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-tl-border-subtle">
          <Command className="w-4 h-4 text-tl-gold shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] bg-tl-bg-surface border border-tl-border-subtle text-tl-text-secondary">ESC</kbd>
          <button onClick={onClose} className="text-tl-text-secondary hover:text-tl-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-2">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-tl-bg-overlay transition-colors group"
              >
                <span className="text-sm text-tl-text-secondary group-hover:text-tl-text-primary transition-colors">{item.label}</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-tl-bg-surface border border-tl-border-subtle text-tl-text-secondary font-mono">{item.shortcut}</kbd>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-tl-text-secondary">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-tl-border-subtle flex items-center gap-4 text-[10px] text-tl-text-secondary">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-tl-bg-surface border border-tl-border-subtle font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-tl-bg-surface border border-tl-border-subtle font-mono">↵</kbd>
            select
          </span>
        </div>
      </div>
    </div>
  )
}

// ── NotificationsPanel ────────────────────────────────────────────────────────

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [items, setItems] = useState<NotifItem[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/talent/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(d => { setItems(d.notifications ?? []); setFetching(false) })
      .catch(() => setFetching(false))
  }, [])

  const unreadCount = items.filter((n) => !n.readAt).length

  async function markAllRead() {
    await fetch('/api/talent/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    setItems(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
  }

  return (
    <div className="w-80 rounded-2xl border border-tl-border-default bg-tl-bg-surface shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tl-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-tl-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-tl-gold text-white leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-medium text-tl-gold hover:opacity-80 transition-opacity"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-tl-border-subtle max-h-72 overflow-y-auto">
        {fetching ? (
          <div className="px-4 py-6 space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-tl-bg-elevated animate-pulse mt-1 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-32 rounded bg-tl-bg-elevated animate-pulse" />
                  <div className="h-2 w-44 rounded bg-tl-bg-elevated animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-6 h-6 mx-auto mb-2 text-tl-text-secondary/30" />
            <p className="text-xs text-tl-text-secondary">No notifications yet</p>
          </div>
        ) : (
          items.slice(0, 5).map((n) => {
            const isUnread = !n.readAt
            return (
              <div
                key={n.id}
                className={cn(
                  'flex gap-3 px-4 py-3 transition-colors hover:bg-tl-bg-elevated cursor-pointer',
                  isUnread && 'bg-tl-bg-overlay'
                )}
              >
                <div className="mt-1.5 shrink-0">
                  <span className={cn('block w-2 h-2 rounded-full', isUnread ? 'bg-tl-gold' : 'bg-tl-border-default')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium leading-snug', isUnread ? 'text-tl-text-primary' : 'text-tl-text-secondary')}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-tl-text-secondary leading-snug mt-0.5 truncate">{n.body}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-tl-border-subtle text-center">
        <button
          onClick={() => { onClose(); router.push('/talent/notifications') }}
          className="text-xs text-tl-gold font-medium hover:opacity-80 transition-opacity"
        >
          View all notifications →
        </button>
      </div>
    </div>
  )
}

// ── HelpDialog ────────────────────────────────────────────────────────────────

const HELP_CARDS = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Explore guides, API references, and tutorials.',
    href: '#',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Chat with our team — typically responds in minutes.',
    href: '#',
  },
  {
    icon: PlayCircle,
    title: 'Video Tutorials',
    description: 'Watch step-by-step walkthroughs for key features.',
    href: '#',
  },
]

function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-tl-bg-surface border-tl-border-default p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-tl-border-subtle">
          <DialogTitle className="text-base font-semibold text-tl-text-primary flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-tl-gold" />
            Help &amp; Support
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          {HELP_CARDS.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="flex items-start gap-3.5 p-3.5 rounded-xl border border-tl-border-default hover:border-tl-gold/30 hover:bg-tl-bg-elevated transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center shrink-0">
                <card.icon className="w-4 h-4 text-tl-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-tl-text-primary group-hover:text-tl-gold transition-colors">
                  {card.title}
                </p>
                <p className="text-xs text-tl-text-secondary mt-0.5 leading-snug">{card.description}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <DialogClose asChild>
            <button className="text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary border border-tl-border-default hover:border-tl-border-strong px-4 py-2 rounded-xl transition-all">
              Close
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── MobileDrawer ──────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            key="mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden bg-tl-bg-surface/95 backdrop-blur-xl border-r border-tl-border-subtle shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Talent navigation"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-tl-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-tl-gold" />
                </div>
                <span className="font-display text-sm font-bold text-tl-text-primary">TalentBridge</span>
              </div>
              <button
                className="w-8 h-8 rounded-xl flex items-center justify-center text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all"
                onClick={onClose}
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-semibold text-tl-text-secondary uppercase tracking-wider">
                My Space
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
              {drawerNavItems.map((item, i) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      href={item.href}
                      className={cn('sidebar-link', active && 'active')}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon
                        className={cn('w-4 h-4 shrink-0', active ? 'text-tl-gold' : 'text-tl-text-secondary')}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ── TalentLayout ──────────────────────────────────────────────────────────────

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const sidebarCollapsed = useSidebarCollapsed()

  const [commandOpen, setCommandOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const [user, setUser] = useState<{ name: string; email: string; initials: string } | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const [unreadCount, setUnreadCount] = useState(0)
  const pageName = PAGE_NAMES[pathname] ?? 'Page'

  useEffect(() => {
    fetch('/api/talent/notifications')
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(d => setUnreadCount((d.notifications ?? []).filter((n: NotifItem) => !n.readAt).length))
      .catch(() => {})
  }, [])

  // Fetch real user
  useEffect(() => {
    let cancelled = false
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) throw new Error('not ok')
        const data = await res.json()
        if (!cancelled) {
          const name: string = data.name ?? data.username ?? 'You'
          setUser({ name, email: data.email ?? '', initials: getInitials(name) })
        }
      } catch {
        if (!cancelled) {
          setUser({ name: 'You', email: '', initials: 'Y' })
        }
      } finally {
        if (!cancelled) setUserLoading(false)
      }
    }
    fetchUser()
    return () => { cancelled = true }
  }, [])

  async function handleSignOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch {
      // proceed regardless
    }
    // Hard reload — clears Next's router cache so back-button can't restore protected pages.
    window.location.replace('/auth/login')
  }

  // ⌘K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="h-screen bg-tl-bg-base flex overflow-hidden">
      {/* Desktop sidebar */}
      <SidebarTalent />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main area — shifts with sidebar */}
      <div
        className={cn(
          'flex-1 min-h-0 flex flex-col transition-[padding] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* ── Top Header Bar ── */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 border-b border-tl-border-subtle bg-tl-bg-surface/80 backdrop-blur-xl shrink-0">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              <Link
                href="/talent/dashboard"
                className="flex items-center gap-1 text-tl-text-secondary hover:text-tl-text-primary transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-tl-text-secondary/50" />
              <span className="font-medium text-tl-text-primary">{pageName}</span>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search / Command palette trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/30 transition-all duration-200 text-sm text-tl-text-secondary"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-tl-bg-surface border border-tl-border-subtle font-mono">⌘K</kbd>
            </button>
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl text-tl-text-secondary hover:bg-tl-bg-elevated transition-all"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative h-9 w-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-tl-gold flex items-center justify-center text-[9px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setNotifOpen(false)}
                    />
                    <motion.div
                      key="notif-panel"
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-11 z-40"
                    >
                      <NotificationsPanel onClose={() => setNotifOpen(false)} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Help */}
            <button
              onClick={() => setHelpOpen(true)}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all"
              aria-label="Help & Support"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-tl-bg-elevated transition-all duration-200 outline-none group">
                  {userLoading ? (
                    <>
                      <div className="h-8 w-8 rounded-full bg-tl-bg-elevated animate-pulse" />
                      <div className="hidden sm:block space-y-1.5">
                        <div className="h-2.5 w-20 rounded bg-tl-bg-elevated animate-pulse" />
                        <div className="h-2 w-14 rounded bg-tl-bg-elevated animate-pulse" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8 ring-1 ring-tl-gold/30">
                        <AvatarImage src={userAvatarUrl(user?.name ?? '')} />
                        <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold">
                          {user?.initials ?? 'Y'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-xs font-semibold text-tl-text-primary leading-none">{user?.name ?? 'You'}</p>
                        <p className="text-[10px] text-tl-text-secondary mt-0.5 truncate max-w-[100px]">{user?.email}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-tl-text-secondary hidden sm:block" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-tl-bg-elevated border-tl-border-default">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9 ring-1 ring-tl-gold/30">
                      <AvatarImage src={userAvatarUrl(user?.name ?? '')} />
                      <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-sm font-bold">
                        {user?.initials ?? 'Y'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-tl-text-primary">{user?.name ?? 'You'}</p>
                      <p className="text-xs text-tl-text-secondary font-normal truncate max-w-[140px]">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem asChild>
                  <Link href="/talent/profile" className="cursor-pointer text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay">
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/settings" className="cursor-pointer text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-tl-rose focus:text-tl-rose focus:bg-tl-rose/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Scrollable main content ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ── Overlays ── */}
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
