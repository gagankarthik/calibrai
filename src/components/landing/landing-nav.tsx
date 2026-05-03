'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { cn, userAvatarUrl } from '@/lib/utils'
import { TBLogo } from './landing-logo'

const NAV_ITEMS = [
  { label: 'Product',      href: '/#features' },
  { label: 'How It Works', href: '/#how' },
  { label: ' SearchJobs',         href: '/jobs' },
  { label: 'Pricing',      href: '/pricing' },
  { label: 'Contact',    href: '/contact' },
]

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

function UserMenu({ user, onSignOut }: { user: MeResponse; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const displayName = user.companyName || user.name || user.email || 'Account'
  const avatar = userAvatarUrl(displayName)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
      >
        <img src={avatar} alt={displayName} className="w-7 h-7 rounded-full bg-tl-bg-elevated" />
        <span className="hidden sm:inline text-[12.5px] font-medium text-tl-text-primary max-w-[140px] truncate">
          {displayName}
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-tl-text-secondary transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-tl-border-default bg-tl-bg-base/95 backdrop-blur-xl shadow-xl shadow-black/40 overflow-hidden"
          >
            <div className="px-3.5 py-3 border-b border-tl-border-subtle">
              <p className="text-[13px] font-semibold text-tl-text-primary truncate">{displayName}</p>
              {user.email && <p className="text-[11px] text-tl-text-secondary truncate">{user.email}</p>}
              <p className="text-[10px] uppercase tracking-wider text-tl-gold mt-1">{user.role ?? ''}</p>
            </div>
            <Link
              href={dashboardHref(user.role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-tl-text-primary hover:bg-tl-bg-elevated transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-tl-text-secondary" /> Dashboard
            </Link>
            <button
              onClick={() => { setOpen(false); onSignOut() }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13px] text-tl-rose hover:bg-tl-rose/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const { user, setUser } = useCurrentUser()
  const isAuthed = !!user?.role

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    setUser(null)
    // Hard reload to flush Next's router cache and any auth-derived UI.
    window.location.assign('/')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-3 sm:pt-4 px-3 sm:px-4">
      <nav
        className={cn(
          'mx-auto max-w-6xl h-[56px] flex items-center justify-between rounded-full transition-all duration-300',
          'border backdrop-blur-2xl px-3 sm:px-5',
          scrolled
            ? 'bg-tl-bg-base/70 border-tl-border-default shadow-xl shadow-black/20'
            : 'bg-tl-bg-surface/30 border-white/[0.08] shadow-lg shadow-black/10'
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="transition-transform group-hover:scale-110">
            <TBLogo size={26} />
          </div>
          <span className="text-[14.5px] font-semibold text-tl-text-primary tracking-tight xs:inline">
            TalentBridge
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-3.5 py-1.5 text-[13px] font-medium text-black hover:text-tl-text-primary rounded-full hover:bg-white/[0.06] transition-all"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA / User menu */}
        <div className="hidden md:flex items-center gap-1.5">
          {isAuthed && user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-[13px] font-medium text-black hover:text-tl-text-primary rounded-full hover:bg-white/[0.06] transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register?role=company"
                className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tl-gold text-white text-[13px] font-semibold hover:bg-tl-gold/90 transition-all shadow-lg shadow-tl-gold/30"
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 rounded-full bg-[#f2f2f2] text-tl-text-secondary hover:text-tl-text-primary hover:bg-white transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl border border-tl-border-default bg-tl-bg-base/90 backdrop-blur-2xl px-3 py-3 space-y-1 shadow-xl shadow-black/30"
        >
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary rounded-xl hover:bg-tl-bg-elevated transition-colors"
            >
              {label}
            </Link>
          ))}
          {isAuthed && user ? (
            <>
              <div className="px-3 pt-3 pb-1 flex items-center gap-2.5 border-t border-tl-border-subtle">
                <img
                  src={userAvatarUrl(user.companyName || user.name || user.email || 'user')}
                  alt=""
                  className="w-8 h-8 rounded-full bg-tl-bg-elevated"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-tl-text-primary truncate">
                    {user.companyName || user.name || user.email}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-tl-gold">{user.role ?? ''}</p>
                </div>
              </div>
              <Link
                href={dashboardHref(user.role)}
                onClick={() => setOpen(false)}
                className="block mt-1 px-4 py-3 rounded-xl bg-tl-gold text-white text-sm font-semibold text-center shadow-lg shadow-tl-gold/30"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => { setOpen(false); handleSignOut() }}
                className="w-full mt-1 px-4 py-2.5 rounded-xl text-sm font-medium text-tl-rose hover:bg-tl-rose/10 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary rounded-xl hover:bg-tl-bg-elevated transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register?role=company"
                onClick={() => setOpen(false)}
                className="block mt-1 px-4 py-3 rounded-xl bg-tl-gold text-white text-sm font-semibold text-center shadow-lg shadow-tl-gold/30"
              >
                Get started free
              </Link>
            </>
          )}
        </motion.div>
      )}
    </header>
  )
}
