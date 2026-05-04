'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Sparkles,
  Compass,
  Quote,
  GitCompare,
  Briefcase,
  BookOpen,
  DollarSign,
  Mail,
  User as UserIcon,
  Building2,
  GraduationCap,
} from 'lucide-react'
import { cn, userAvatarUrl } from '@/lib/utils'
import { TBLogo } from './landing-logo'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Auth user fetch ─────────────────────────────────────────────────────────

interface MeResponse {
  id: string | null
  email: string | null
  name: string | null
  role: 'company' | 'talent' | null
  companyName: string | null
}

function useCurrentUser() {
  const [user, setUser] = useState<MeResponse | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (r) => (r.ok ? ((await r.json()) as MeResponse) : null))
      .then((data) => { if (!cancelled) setUser(data) })
      .catch(() => { if (!cancelled) setUser(null) })
    return () => { cancelled = true }
  }, [])
  return { user, setUser }
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

function isActive(pathname: string, href: string): boolean {
  if (href.includes('#')) return false
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

// ─── Mega-menu config ────────────────────────────────────────────────────────

interface MegaItem {
  href: string
  label: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
  pattern: 'mesh' | 'dots' | 'lines' | 'orbs'
  accent: string // raw rgb for backgrounds
}

const PLATFORM_ITEMS: MegaItem[] = [
  {
    href: '/product',
    label: 'Product',
    description: 'Verdicts, GitHub-aware matching, universal scrape, end-to-end pipeline.',
    Icon: Sparkles,
    pattern: 'mesh',
    accent: '79,70,229',
  },
  {
    href: '/how-it-works',
    label: 'How It Works',
    description: 'Four steps from posting a role to making the offer.',
    Icon: Compass,
    pattern: 'lines',
    accent: '5,150,105',
  },
  {
    href: '/customers',
    label: 'Customers',
    description: 'Sixty-three teams, twenty-four hundred hires, eighteen days to hire.',
    Icon: Quote,
    pattern: 'orbs',
    accent: '201,168,76',
  },
  {
    href: '/compare',
    label: 'Compare',
    description: 'Where Indeed, Greenhouse, Dice and LinkedIn fall short.',
    Icon: GitCompare,
    pattern: 'dots',
    accent: '225,29,72',
  },
]

// ─── Pattern backgrounds for mega cards ──────────────────────────────────────

function PatternBackground({ kind, accent }: { kind: MegaItem['pattern']; accent: string }) {
  const accentLow = `rgba(${accent}, 0.10)`
  const accentMid = `rgba(${accent}, 0.18)`
  const accentHigh = `rgba(${accent}, 0.30)`

  if (kind === 'mesh') {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(at 20% 25%, ${accentHigh} 0px, transparent 55%),` +
            `radial-gradient(at 80% 75%, ${accentMid} 0px, transparent 55%)`,
        }}
      />
    )
  }
  if (kind === 'dots') {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${accentMid} 1.2px, transparent 1.6px)`,
          backgroundSize: '18px 18px',
        }}
      />
    )
  }
  if (kind === 'lines') {
    return (
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            `repeating-linear-gradient(135deg, ${accentMid} 0 1px, transparent 1px 12px)`,
        }}
      />
    )
  }
  // orbs
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-12 -right-10 w-44 h-44 rounded-full"
        style={{ background: `radial-gradient(circle, ${accentHigh} 0%, transparent 70%)`, filter: 'blur(20px)' }}
      />
      <div
        className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${accentLow} 0%, transparent 70%)`, filter: 'blur(20px)' }}
      />
    </div>
  )
}

// ─── Mega panel ──────────────────────────────────────────────────────────────

function PlatformSheet({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  return (
    <motion.div
      key="sheet"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
      className="absolute top-full left-0 right-0 mt-2.5 z-50 overflow-hidden"
      role="menu"
    >
      <div className="relative rounded-3xl border border-tl-border-default bg-tl-bg-surface/98 backdrop-blur-2xl shadow-[0_24px_80px_rgba(17,24,39,0.16)] overflow-hidden">
        {/* Top header strip */}
        <div className="px-6 sm:px-8 py-4 border-b border-tl-border-subtle flex items-center gap-3">
          <span className="inline-flex w-7 h-7 rounded-lg bg-tl-gold/10 border border-tl-gold/30 items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-tl-gold" />
          </span>
          <p className="text-[10.5px] uppercase tracking-[0.22em] font-bold text-tl-text-tertiary">
            Inside the platform
          </p>
          <span aria-hidden className="h-px flex-1 bg-tl-text-tertiary/15" />
          <p className="text-[12px] text-tl-text-secondary [font-family:'Fraunces',Georgia,serif] italic">
            Four rooms, one key.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5"
        >
          {PLATFORM_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.34, ease: EASE }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  role="menuitem"
                  className={cn(
                    'group relative block rounded-2xl border bg-tl-bg-base overflow-hidden h-full p-5 sm:p-6 flex flex-col min-h-[200px] transition-all',
                    active
                      ? 'border-tl-gold/40 shadow-md'
                      : 'border-tl-border-subtle hover:border-tl-gold/35 hover:-translate-y-0.5',
                  )}
                >
                  <PatternBackground kind={item.pattern} accent={item.accent} />
                  <div className="relative flex items-start justify-between mb-auto">
                    <span
                      className="inline-flex w-10 h-10 rounded-xl items-center justify-center"
                      style={{
                        background: `rgba(${item.accent},0.15)`,
                        border: `1px solid rgba(${item.accent},0.3)`,
                        color: `rgb(${item.accent})`,
                      }}
                    >
                      <item.Icon className="w-4 h-4" />
                    </span>
                    <ArrowUpRight
                      className="w-4 h-4 text-tl-text-tertiary transition-all group-hover:rotate-12 group-hover:text-tl-gold"
                    />
                  </div>
                  <div className="relative mt-10">
                    <p
                      className="text-[19px] tracking-[-0.01em] text-tl-text-primary [font-family:'Fraunces',Georgia,serif] italic font-light"
                      style={{ ['fontVariationSettings' as string]: '"opsz" 144,"SOFT" 50,"WONK" 1' }}
                    >
                      {item.label}
                    </p>
                    <p className="text-[12.5px] text-tl-text-secondary leading-snug mt-1.5">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Footer ribbon */}
        <div className="px-6 sm:px-8 py-3.5 border-t border-tl-border-subtle bg-tl-bg-elevated/40 flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <p className="text-tl-text-tertiary tracking-[0.18em] uppercase font-bold">
            New release
          </p>
          <p className="text-tl-text-secondary">
            Universal URL scraper now extracts up to 100 jobs per request.{' '}
            <Link href="/admin/crm/jobs" onClick={onClose} className="text-tl-gold font-semibold hover:underline">
              Read more →
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── User dropdown (signed-in) ───────────────────────────────────────────────

function UserMenu({ user, onSignOut }: { user: MeResponse; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
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
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-tl-bg-elevated/80 hover:bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/30 transition-all"
      >
        <img src={avatar} alt="" width={28} height={28} className="w-7 h-7 rounded-full ring-1 ring-tl-gold/30" loading="lazy" decoding="async" />
        <span className="hidden sm:inline text-[12.5px] font-semibold text-tl-text-primary max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-tl-text-secondary transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-tl-border-default bg-tl-bg-surface/95 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-tl-border-subtle bg-gradient-to-br from-tl-gold/10 via-transparent to-transparent">
              <img src={avatar} alt="" width={40} height={40} className="w-10 h-10 rounded-full ring-1 ring-tl-gold/40 shrink-0" loading="lazy" decoding="async" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-tl-text-primary truncate">{displayName}</p>
                {user.email && <p className="text-[11px] text-tl-text-secondary truncate">{user.email}</p>}
                {user.role && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider font-bold text-tl-gold bg-tl-gold/10 border border-tl-gold/20 rounded-full px-1.5 py-0.5">
                    {user.role === 'company' ? <Building2 className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                    {user.role}
                  </span>
                )}
              </div>
            </div>
            <div className="py-1">
              <Link href={dashboardHref(user.role)} onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-text-primary hover:bg-tl-bg-elevated hover:text-tl-gold transition-colors">
                <LayoutDashboard className="w-4 h-4 text-tl-text-secondary" /> Dashboard
              </Link>
              <Link href={profileHref(user.role)} onClick={() => setOpen(false)} role="menuitem" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-text-primary hover:bg-tl-bg-elevated hover:text-tl-gold transition-colors">
                <UserIcon className="w-4 h-4 text-tl-text-secondary" /> {user.role === 'company' ? 'Company Profile' : 'My Profile'}
              </Link>
            </div>
            <div className="border-t border-tl-border-subtle py-1">
              <button onClick={() => { setOpen(false); onSignOut() }} role="menuitem" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-tl-rose hover:bg-tl-rose/10 transition-colors">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Direct nav links (Pricing / Browse Jobs / Contact) ──────────────────────

const DIRECT_LINKS = [
  { label: 'Pricing',     href: '/pricing',  icon: DollarSign },
  { label: 'Docs',        href: '/docs',     icon: BookOpen },
  { label: 'Browse Jobs', href: '/jobs',     icon: Briefcase },
  { label: 'Contact',     href: '/contact',  icon: Mail },
]

// ─── Main component ─────────────────────────────────────────────────────────

export function LandingNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, setUser } = useCurrentUser()
  const isAuthed = !!user?.role

  const megaRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  useClickOutside(megaRef, () => setMegaOpen(false))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mega + drawer on route change
  useEffect(() => {
    setMegaOpen(false)
    setDrawerOpen(false)
  }, [pathname])

  // Body scroll lock when drawer or mega-menu open
  useEffect(() => {
    if (!drawerOpen && !megaOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [drawerOpen, megaOpen])

  // ESC closes mega
  useEffect(() => {
    if (!megaOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMegaOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [megaOpen])

  const handleSignOut = async () => {
    try { await fetch('/api/auth/signout', { method: 'POST' }) } catch { /* ignore */ }
    setUser(null)
    window.location.assign('/')
  }

  const platformActive = ['/product', '/how-it-works', '/customers', '/compare'].some(
    (h) => pathname === h || pathname.startsWith(h + '/'),
  )

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-tl-gold focus:text-tl-bg-base focus:font-semibold"
      >
        Skip to content
      </a>

      <header className="fixed top-0 inset-x-0 z-50 pt-3 sm:pt-4 px-3 sm:px-4">
        {/* Backdrop when mega-menu is open — closes on click outside the panel */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              key="mega-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 -z-10 bg-black/35 backdrop-blur-sm"
              onClick={() => setMegaOpen(false)}
              aria-hidden
            />
          )}
        </AnimatePresence>

        <div ref={megaRef} className="relative">
          <motion.nav
            ref={navRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              'relative mx-auto max-w-6xl rounded-[28px] transition-[background-color,border-color,box-shadow,padding] duration-300 px-3 sm:px-5',
              'border backdrop-blur-2xl flex flex-col',
              scrolled
                ? 'bg-tl-bg-surface/95 border-tl-border-default shadow-xl shadow-tl-indigo/10'
                : 'bg-tl-bg-surface/85 border-tl-border-subtle shadow-md shadow-tl-indigo/5',
            )}
          >
            {/* Main row */}
            <div className="h-14 flex items-center justify-between gap-3">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-2 shrink-0 group min-w-0">
                <motion.div whileHover={{ scale: 1.08, rotate: -4 }} transition={{ duration: 0.2, ease: EASE }}>
                  <TBLogo size={26} />
                </motion.div>
                <span className="text-[14.5px] font-semibold text-tl-text-primary tracking-tight truncate">
                  TalentBridge
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-0.5 mx-auto">
                {/* Platform mega trigger */}
                <button
                  onClick={() => setMegaOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={megaOpen}
                  className={cn(
                    'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full inline-flex items-center gap-1 transition-all duration-200',
                    platformActive || megaOpen
                      ? 'text-tl-gold'
                      : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated/60',
                  )}
                >
                  Platform
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', megaOpen && 'rotate-180')} />
                  {(platformActive || megaOpen) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full bg-tl-gold/10 border border-tl-gold/20"
                      transition={{ duration: 0.25, ease: EASE }}
                    />
                  )}
                </button>

                {DIRECT_LINKS.map(({ label, href }) => {
                  const active = isActive(pathname, href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200',
                        active
                          ? 'text-tl-gold'
                          : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated/60',
                      )}
                    >
                      {label}
                      {active && !megaOpen && (
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

              {/* CTA / user */}
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
                      className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tl-gold text-tl-bg-base text-[13px] font-semibold hover:bg-tl-gold/90 transition-all shadow-lg shadow-tl-gold/30"
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
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18, ease: EASE }}>
                      <X className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18, ease: EASE }}>
                      <Menu className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Scroll-extended beta banner — slides down from inside the nav */}
            <AnimatePresence initial={false}>
              {scrolled && pathname === '/' && (
                <motion.div
                  key="beta-banner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="overflow-hidden border-t border-tl-border-subtle/50"
                >
                  <div className="hidden md:flex items-center justify-center gap-2.5 py-2 text-[12px] font-medium text-tl-text-secondary">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-tl-indigo/10 border border-tl-indigo/20 text-[10px] font-bold tracking-wider uppercase text-tl-indigo">
                      <span className="w-1.5 h-1.5 rounded-full bg-tl-indigo animate-pulse" />
                      Beta
                    </span>
                    <span>You&apos;re using TalentBridge Beta — free during early access.</span>
                    <Link
                      href="/auth/register"
                      className="font-semibold text-tl-indigo hover:text-tl-indigo/80 transition-colors"
                    >
                      Join now →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Platform sheet — full nav-width, unfolds below the bar */}
            <AnimatePresence>
              {megaOpen && <PlatformSheet onClose={() => setMegaOpen(false)} />}
            </AnimatePresence>
          </motion.nav>
        </div>

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
                className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl border border-tl-border-default bg-tl-bg-surface/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/40 overflow-hidden"
              >
                {isAuthed && user && (
                  <div className="mb-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-tl-gold/10 via-transparent to-transparent border border-tl-border-subtle">
                    <img src={userAvatarUrl(user.companyName || user.name || user.email || 'user')} alt="" width={40} height={40} className="w-10 h-10 rounded-full ring-1 ring-tl-gold/40 shrink-0" loading="lazy" decoding="async" />
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

                <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.2em] font-bold text-tl-text-tertiary">
                  Inside
                </p>
                <nav className="grid grid-cols-2 gap-1.5 px-1 pb-2">
                  {PLATFORM_ITEMS.map((item) => {
                    const active = isActive(pathname, item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'relative rounded-xl border p-3 transition-colors flex flex-col gap-1.5 overflow-hidden',
                          active ? 'border-tl-gold/40 bg-tl-gold/[0.06]' : 'border-tl-border-subtle hover:border-tl-gold/30',
                        )}
                      >
                        <span
                          className="inline-flex w-7 h-7 rounded-lg items-center justify-center"
                          style={{
                            background: `rgba(${item.accent},0.15)`,
                            border: `1px solid rgba(${item.accent},0.3)`,
                            color: `rgb(${item.accent})`,
                          }}
                        >
                          <item.Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-sm font-medium text-tl-text-primary [font-family:'Fraunces',Georgia,serif] italic font-light">
                          {item.label}
                        </span>
                      </Link>
                    )
                  })}
                </nav>

                <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.2em] font-bold text-tl-text-tertiary border-t border-tl-border-subtle">
                  More
                </p>
                <nav className="flex flex-col gap-0.5 px-1 pb-1">
                  {DIRECT_LINKS.map(({ label, href, icon: Icon }) => {
                    const active = isActive(pathname, href)
                    return (
                      <Link
                        key={href}
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

                <div className="mt-2 pt-2 border-t border-tl-border-subtle space-y-1.5">
                  {isAuthed && user ? (
                    <>
                      <Link href={dashboardHref(user.role)} onClick={() => setDrawerOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold shadow-lg shadow-tl-gold/30">
                        <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                      </Link>
                      <button onClick={() => { setDrawerOpen(false); handleSignOut() }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-tl-rose hover:bg-tl-rose/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-tl-border-default text-tl-text-primary hover:border-tl-gold/30 hover:bg-tl-bg-elevated transition-all text-sm font-medium">
                        Sign in
                      </Link>
                      <Link href="/auth/register?role=company" onClick={() => setDrawerOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-tl-gold text-tl-bg-base text-sm font-semibold shadow-lg shadow-tl-gold/30">
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
