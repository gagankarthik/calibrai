'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Menu, X, ChevronDown, Brain, BarChart3, Shield,
  Users, MessageSquare, Kanban, TrendingUp,
  Building2, Search, ArrowRight,
} from 'lucide-react'

/* ─── Logo icon ─────────────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="url(#lm-grad)" />
      {/* Neural net nodes */}
      <circle cx="10" cy="10" r="2.2" fill="white" fillOpacity="0.9" />
      <circle cx="24" cy="10" r="2.2" fill="white" fillOpacity="0.9" />
      <circle cx="17" cy="22" r="2.2" fill="white" fillOpacity="0.9" />
      <circle cx="17" cy="14" r="3" fill="white" />
      {/* Connections */}
      <line x1="10" y1="10" x2="17" y2="14" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" />
      <line x1="24" y1="10" x2="17" y2="14" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" />
      <line x1="17" y1="17" x2="17" y2="22" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" />
      <line x1="10" y1="10" x2="24" y2="10" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
      <defs>
        <linearGradient id="lm-grad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ─── Feature dropdown items ────────────────────────────────────────────────── */
const NAV_FEATURES = [
  { icon: Brain,        title: 'AI Matching',     desc: '94% accurate candidate scoring', color: '#818cf8' },
  { icon: Kanban,       title: 'Pipeline',         desc: "Full hiring funnel in one view",   color: '#34d399' },
  { icon: BarChart3,    title: 'Analytics',        desc: 'Hiring metrics that matter',        color: '#60a5fa' },
  { icon: Shield,       title: 'Compliance',       desc: 'SOC2 & GDPR ready',                color: '#f472b6' },
  { icon: Users,        title: 'Talent Pool',      desc: '50k+ verified profiles',           color: '#a78bfa' },
  { icon: MessageSquare,title: 'AI Messaging',     desc: 'Built-in recruiter inbox',         color: '#fb923c' },
]

const NAV_LINKS = [
  { label: 'For Companies', href: '#companies' },
  { label: 'Pricing',       href: '/pricing' },
  { label: 'Contact',       href: '/contact' },
]

/* ─── Sign-in dropdown ──────────────────────────────────────────────────────── */
function SignInDropdown({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const bg = dark ? 'rgba(15,12,40,0.95)' : 'rgba(255,255,255,0.98)'
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.20)'
  const textPrimary = dark ? '#f1f5f9' : '#111827'
  const textSec = dark ? 'rgba(199,210,254,0.65)' : '#6b7280'
  const itemHover = dark ? 'rgba(255,255,255,0.05)' : '#f5f3ff'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full right-0 mt-2 w-72 rounded-2xl p-3 z-50"
      style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      role="menu"
    >
      {[
        { href: '/auth/login?role=company', icon: Building2, label: 'For Hiring Teams', sub: 'Post jobs, manage pipeline', color: '#818cf8' },
        { href: '/auth/login?role=talent',  icon: Search,    label: 'For Job Seekers',  sub: 'Find your next role',      color: '#34d399' },
      ].map(item => (
        <Link key={item.href} href={item.href} onClick={onClose} role="menuitem"
          className="flex items-start gap-3 p-3 rounded-xl transition-colors group"
          style={{ ['--hover-bg' as string]: itemHover }}
          onMouseEnter={e => (e.currentTarget.style.background = itemHover)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
            <item.icon className="w-4 h-4" style={{ color: item.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: textPrimary }}>{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: textSec }}>{item.sub}</p>
          </div>
        </Link>
      ))}
      <div className="my-1.5 mx-1" style={{ height: 1, background: border }} />
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="text-xs" style={{ color: textSec }}>New to TalentBridge?</span>
        <Link href="/auth/register" onClick={onClose} className="text-xs font-semibold hover:underline" style={{ color: '#818cf8' }}>
          Create free account →
        </Link>
      </div>
    </motion.div>
  )
}

/* ─── Features dropdown ─────────────────────────────────────────────────────── */
function FeaturesDropdown({ onClose, dark }: { onClose: () => void; dark: boolean }) {
  const bg = dark ? 'rgba(15,12,40,0.95)' : 'rgba(255,255,255,0.98)'
  const border = dark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.20)'
  const textPrimary = dark ? '#f1f5f9' : '#111827'
  const textSec = dark ? 'rgba(199,210,254,0.65)' : '#6b7280'
  const itemHover = dark ? 'rgba(255,255,255,0.05)' : '#f5f3ff'
  const labelColor = dark ? '#a5b4fc' : '#6366f1'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full left-0 mt-2 w-[540px] rounded-2xl p-5 z-50"
      style={{ background: bg, border: `1px solid ${border}`, backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: labelColor }}>Platform Features</p>
      <div className="grid grid-cols-2 gap-0.5">
        {NAV_FEATURES.map(f => (
          <Link key={f.title} href="#companies" onClick={onClose}
            className="flex items-start gap-3 p-2.5 rounded-xl transition-colors"
            onMouseEnter={e => (e.currentTarget.style.background = itemHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
              <f.icon className="w-3.5 h-3.5" style={{ color: f.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: textPrimary }}>{f.title}</p>
              <p className="text-xs mt-0.5 leading-snug" style={{ color: textSec }}>{f.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-4 flex items-center justify-between px-1" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
          <span className="text-xs font-medium" style={{ color: textSec }}>200+ companies · $48k avg saved per hire</span>
        </div>
        <Link href="/auth/register" onClick={onClose} className="text-xs font-semibold hover:underline" style={{ color: labelColor }}>
          Start free trial →
        </Link>
      </div>
    </motion.div>
  )
}

/* ─── Mobile menu ────────────────────────────────────────────────────────────── */
function MobileMenu({ onClose }: { onClose: () => void }) {
  const [featOpen, setFeatOpen] = useState(false)

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1e1b4b 60%, #2e1065 100%)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
      aria-modal="true" role="dialog" aria-label="Mobile navigation"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display font-bold text-lg text-white">TalentBridge</span>
        </Link>
        <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          aria-label="Close menu">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {/* Features accordion */}
        <button
          onClick={() => setFeatOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'rgba(199,210,254,0.8)', background: featOpen ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
          Features
          <motion.span animate={{ rotate: featOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex' }}>
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>
        <AnimatePresence>
          {featOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
              <div className="grid grid-cols-2 gap-1.5 p-2 mx-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {NAV_FEATURES.map(f => (
                  <Link key={f.title} href="#companies" onClick={onClose} className="flex items-center gap-2 p-2.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <f.icon className="w-3.5 h-3.5 shrink-0" style={{ color: f.color }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(199,210,254,0.75)' }}>{f.title}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {NAV_LINKS.map(link => (
          <Link key={link.label} href={link.href} onClick={onClose}
            className="flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'rgba(199,210,254,0.8)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* CTA section */}
      <div className="px-4 py-5 space-y-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="px-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(165,180,252,0.5)' }}>Get Started</p>
        <Link href="/auth/login?role=company" onClick={onClose}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(199,210,254,0.85)' }}>
          <Building2 className="w-4 h-4" style={{ color: '#818cf8' }} />
          Sign in as Company
        </Link>
        <Link href="/auth/login?role=talent" onClick={onClose}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(199,210,254,0.85)' }}>
          <Search className="w-4 h-4" style={{ color: '#34d399' }} />
          Sign in as Job Seeker
        </Link>
        <Link href="/auth/register" onClick={onClose}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.45)' }}>
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}

/* ─── Backdrop ────────────────────────────────────────────────────────────────── */
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClick} aria-hidden />
  )
}

/* ─── Navbar ─────────────────────────────────────────────────────────────────── */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<null | 'features' | 'signin'>(null)
  const [scrolled, setScrolled] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setAtTop(y < 10)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const toggle = (menu: 'features' | 'signin') =>
    setOpenMenu(prev => prev === menu ? null : menu)

  // The hero background is always dark — we stay dark always for consistency
  const isDark = true
  const textColor = 'rgba(226,232,240,0.90)'
  const textActive = '#ffffff'
  const hoverBg = 'rgba(255,255,255,0.07)'

  return (
    <>
      <header
        ref={navRef}
        className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500')}
        style={{
          background: atTop
            ? 'transparent'
            : 'rgba(10,8,30,0.80)',
          backdropFilter: atTop ? 'none' : 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: atTop ? 'none' : 'blur(20px) saturate(180%)',
          borderBottom: atTop ? '1px solid transparent' : '1px solid rgba(255,255,255,0.07)',
          boxShadow: atTop ? 'none' : '0 8px 32px rgba(0,0,0,0.4)',
        }}
        role="banner"
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 mx-auto max-w-7xl">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="TalentBridge — homepage">
            <LogoMark />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[18px] text-white tracking-tight">TalentBridge</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: '#a5b4fc' }}>
                AI
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {/* Features dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('features')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-all duration-150"
                style={{
                  color: openMenu === 'features' ? textActive : textColor,
                  background: openMenu === 'features' ? hoverBg : 'transparent',
                }}
                onMouseEnter={e => { if (openMenu !== 'features') (e.currentTarget.style.background = hoverBg) }}
                onMouseLeave={e => { if (openMenu !== 'features') (e.currentTarget.style.background = 'transparent') }}
                aria-expanded={openMenu === 'features'}
              >
                Features
                <motion.span animate={{ rotate: openMenu === 'features' ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex' }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openMenu === 'features' && <FeaturesDropdown onClose={() => setOpenMenu(null)} dark={isDark} />}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href}
                className="px-3.5 py-2 rounded-xl text-sm transition-all duration-150"
                style={{ color: textColor }}
                onMouseEnter={e => { e.currentTarget.style.color = textActive; e.currentTarget.style.background = hoverBg }}
                onMouseLeave={e => { e.currentTarget.style.color = textColor; e.currentTarget.style.background = 'transparent' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Sign In */}
            <div className="relative">
              <button
                onClick={() => toggle('signin')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  color: openMenu === 'signin' ? textActive : textColor,
                  background: openMenu === 'signin' ? hoverBg : 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onMouseEnter={e => { (e.currentTarget.style.background = hoverBg); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)') }}
                onMouseLeave={e => { if (openMenu !== 'signin') { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)') } }}
                aria-expanded={openMenu === 'signin'}
              >
                Sign In
                <motion.span animate={{ rotate: openMenu === 'signin' ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'inline-flex' }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {openMenu === 'signin' && <SignInDropdown onClose={() => setOpenMenu(null)} dark={isDark} />}
              </AnimatePresence>
            </div>

            {/* Get Started */}
            <Link href="/auth/register"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 2px 12px rgba(99,102,241,0.45)' }}>
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', color: 'white' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <Backdrop onClick={() => setMobileOpen(false)} />
            <MobileMenu onClose={() => setMobileOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
