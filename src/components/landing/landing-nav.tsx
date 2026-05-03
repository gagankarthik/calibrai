'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  Briefcase,
  DollarSign,
  Mail,
  Compass,
  User as UserIcon,
  Building2,
  GraduationCap,
} from 'lucide-react'
import { cn, userAvatarUrl } from '@/lib/utils'
import { TBLogo } from './landing-logo'

// ── Nav config ────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Product',     href: '/#features', icon: Sparkles },
  { label: 'How It Works', href: '/#how',     icon: Compass },
  { label: 'Browse Jobs', href: '/jobs',      icon: Briefcase },
  { label: 'Pricing',     href: '/pricing',   icon: DollarSign },
  { label: 'Contact',     href: '/contact',   icon: Mail },
]

const EASE = [0.16, 1, 0.3, 1] as const

// ── Auth user fetch ──────────────────────────────────────────────────────────

interface MeResponse {
  id: string | null
  email: string | null
  name: string | null
  role: 'company' | 'talent' | null
  companyName: string | null
}

function useCurrentUser() {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (r) => (r.ok ? ((await r.json()) as MeResponse) : null))
      .then((data) => { if (!cancelled) setUser(data) })
      .catch(() => { if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { user, loading, setUser }
}

function dashboardHref(role: 'company' | 'talent' | null): string {
  if (role === 'company') return '/company/dashboard'
  if (role === 'talent') return '/talent/dashboard'
  return '/'
}

function profileHref(role: 'company' | 'talent' | null): string {
  if (role === 'company') return '/company/settings'
  if (role === 'talent') return '/talent/profile'
  return '/'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  if (href.includes('#')) return false // hash links never count as active
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

// ── User dropdown ────────────────────────────────────────────────────────────

function UserMenu({
  user,
  onSignOut,
}: {
  user: MeResponse
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  // ESC closes
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const displayName = user.companyName || user.name || user.email || 'Account'
  const avatar = userAvatarUrl(displayName)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-tl-bg-elevated/80 hover:bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/30 transition-all duration-200"
      >
        <img
          src={avatar}
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 rounded-full ring-1 ring-tl-gold/30"
          loading="lazy"
          decoding="async"
        />
        <span className="hidden sm:inline text-[12.5px] font-semibold text-tl-text-primary max-w-[140px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-tl-text-secondary transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-tl-border-default bg-tl-bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-tl-border-subtle bg-gradient-to-br from-tl-gold/10 via-transparent to-transparent">
              <img
                src={avatar}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full ring-1 ring-tl-gold/40 shrink-0"
                loading="lazy"
                decoding="async"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-tl-text-primary truncate">{displayName}</p>
                {user.email && (
                  <p className="text-[11px] text-tl-text-secondary truncate">{user.email}</p>
                )}
                {user.role && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider font-bold text-tl-gold bg-tl-gold/10 border border-tl-gold/20 rounded-full px-1.5 py-0.5">
                    {user.role === 'company' ? <Building2 className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                    {user.role}
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="py-1">
              <Link
                href={dashboardHref(user.role)}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-text-primary hover:bg-tl-bg-elevated hover:text-tl-gold transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-tl-text-secondary" />
                Dashboard
              </Link>
              <Link
                href={profileHref(user.role)}
                onClick={() => setOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-text-primary hover:bg-tl-bg-elevated hover:text-tl-gold transition-colors"
              >
                <UserIcon className="w-4 h-4 text-tl-text-secondary" />
                {user.role === 'company' ? 'Company Profile' : 'My Profile'}
              </Link>
            </div>

            <div className="border-t border-tl-border-subtle py-1">
              <button
                onClick={() => { setOpen(false); onSignOut() }}
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-rose hover:bg-tl-rose/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main nav ─────────────────────────────────────────────────────────────────

export function LandingNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useCurrentUser()
  const isAuthed = !!user?.role

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer when route changes
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!drawerOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [drawerOpen])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    window.location.assign('/')
  }

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-tl-gold focus:text-tl-bg-base focus:font-semibold"
      >
        Skip to content
      </a>

      <header className="fixed top-0 inset-x-0 z-50 pt-3 sm:pt-4 px-3 sm:px-4">
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className={cn(
            'mx-auto max-w-6xl h-14 flex items-center justify-between gap-3 rounded-full transition-[background-color,border-color,box-shadow] duration-300 px-3 sm:px-5',
            'border backdrop-blur-2xl',
            scrolled
              ? 'bg-tl-bg-surface/95 border-tl-border-default shadow-xl shadow-tl-indigo/10'
              : 'bg-tl-bg-surface/80 border-tl-border-subtle shadow-md shadow-tl-indigo/5',
          )}
        >
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group min-w-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <TBLogo size={26} />
            </motion.div>
            <span className="text-[14.5px] font-semibold text-tl-text-primary tracking-tight truncate">
              TalentBridge
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 mx-auto">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200',
                    active
                      ? 'text-tl-gold'
                      : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated/60',
                  )}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-tl-gold/10 border border-tl-gold/20"
                      transition={{ duration: 0.25, ease: EASE }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop CTA / user menu */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {isAuthed && user ? (
              <UserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-[13px] font-medium text-tl-text-secondary hover:text-tl-text-primary rounded-full hover:bg-tl-bg-elevated transition-all duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register?role=company"
                  className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tl-gold text-tl-bg-base text-[13px] font-semibold hover:bg-tl-gold/90 transition-all shadow-lg shadow-tl-gold/30 hover:shadow-tl-gold/40"
                >
                  Get started
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            className="md:hidden h-9 w-9 flex items-center justify-center rounded-full border border-tl-border-subtle bg-tl-bg-elevated/70 text-tl-text-primary hover:bg-tl-bg-elevated hover:border-tl-gold/30 transition-all"
          >
            <AnimatePresence mode="wait" initial={false}>
              {drawerOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  <X className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18, ease: EASE }}
                >
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.nav>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="md:hidden fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
                aria-hidden
              />
              <motion.div
                key="drawer"
                id="mobile-drawer"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl border border-tl-border-default bg-tl-bg-surface/95 backdrop-blur-2xl p-2.5 shadow-2xl shadow-black/40 overflow-hidden"
              >
                {/* Auth header (when signed in) */}
                {isAuthed && user && (
                  <div className="mb-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-tl-gold/10 via-transparent to-transparent border border-tl-border-subtle">
                    <img
                      src={userAvatarUrl(user.companyName || user.name || user.email || 'user')}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full ring-1 ring-tl-gold/40 shrink-0"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-tl-text-primary truncate">
                        {user.companyName || user.name || user.email}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-tl-gold font-bold">
                        {user.role}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav items */}
                <nav className="flex flex-col gap-0.5">
                  {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const active = isActive(pathname, href)
                    return (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors',
                          active
                            ? 'bg-tl-gold/10 text-tl-gold border border-tl-gold/20'
                            : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated border border-transparent',
                        )}
                      >
                        <Icon className={cn('w-4 h-4', active ? 'text-tl-gold' : 'text-tl-text-secondary')} />
                        {label}
                      </Link>
                    )
                  })}
                </nav>

                {/* CTAs */}
                <div className="mt-2 pt-2 border-t border-tl-border-subtle space-y-1.5">
                  {isAuthed && user ? (
                    <>
                      <Link
                        href={dashboardHref(user.role)}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold shadow-lg shadow-tl-gold/30"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                      </Link>
                      <button
                        onClick={() => { setDrawerOpen(false); handleSignOut() }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-tl-rose hover:bg-tl-rose/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-tl-border-default text-tl-text-primary hover:border-tl-gold/30 hover:bg-tl-bg-elevated transition-all text-sm font-medium"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/register?role=company"
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold shadow-lg shadow-tl-gold/30"
                      >
                        Get started free
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
