'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  ChevronDown,
  Kanban,
  Brain,
  BarChart3,
  Shield,
  Users,
  MessageSquare,
  Search,
  TrendingUp,
  Building2,
  UserRound,
} from 'lucide-react'

/* ── Mega-menu data ── */

const featuresMenu = {
  features: [
    {
      icon: Kanban,
      title: 'Pipeline Management',
      desc: "Visualize every candidate's journey",
      href: '#companies',
    },
    {
      icon: Brain,
      title: 'AI Matching',
      desc: '94% accurate candidate scoring',
      href: '#companies',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'Hiring metrics that matter',
      href: '#companies',
    },
    {
      icon: Shield,
      title: 'ATS Compliance',
      desc: 'SOC2 & GDPR ready',
      href: '#companies',
    },
    {
      icon: Users,
      title: 'Talent Pool',
      desc: 'Search 50k+ verified profiles',
      href: '#companies',
    },
    {
      icon: MessageSquare,
      title: 'AI Messaging',
      desc: 'Built-in recruiter inbox',
      href: '#companies',
    },
  ],
}

const simpleNavLinks = [
  { label: 'For Companies', href: '#companies' },
  { label: 'For Talent', href: '#seekers' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#' },
  { label: 'Contact', href: '/contact' },
]

/* ── Animation ── */

const dropdownVariants = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
}

const dropdownTransition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
}

/* ── Mega Feature Item ── */

function MegaFeatureItem({
  icon: Icon,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-tl-bg-elevated transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-tl-gold" />
      </div>
      <div>
        <p className="text-sm font-semibold text-tl-text-primary group-hover:text-tl-gold transition-colors leading-tight">
          {title}
        </p>
        <p className="text-xs text-tl-text-secondary leading-snug mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}

/* ── Sign In dropdown ── */

function SignInDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      variants={dropdownVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={dropdownTransition}
      className="absolute top-full right-0 mt-2 w-72 bg-tl-bg-surface border border-tl-border-gold rounded-2xl shadow-gold p-3 z-50"
      role="menu"
      aria-label="Sign in options"
    >
      <Link
        href="/auth/login?role=company"
        onClick={onClose}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-tl-bg-elevated transition-colors group"
        role="menuitem"
      >
        <div className="w-9 h-9 rounded-lg bg-tl-gold/10 border border-tl-gold/20 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-tl-gold" />
        </div>
        <div>
          <p className="text-sm font-semibold text-tl-text-primary group-hover:text-tl-gold transition-colors leading-tight">
            For Hiring Teams
          </p>
          <p className="text-xs text-tl-text-secondary leading-snug mt-0.5">
            Post jobs, manage pipeline
          </p>
        </div>
      </Link>

      <Link
        href="/auth/login?role=talent"
        onClick={onClose}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-tl-bg-elevated transition-colors group"
        role="menuitem"
      >
        <div className="w-9 h-9 rounded-lg bg-tl-teal/10 border border-tl-teal/20 flex items-center justify-center flex-shrink-0">
          <Search className="w-4 h-4 text-tl-teal" />
        </div>
        <div>
          <p className="text-sm font-semibold text-tl-text-primary group-hover:text-tl-gold transition-colors leading-tight">
            For Job Seekers
          </p>
          <p className="text-xs text-tl-text-secondary leading-snug mt-0.5">
            Find your next role
          </p>
        </div>
      </Link>

      <div className="my-2 border-t border-tl-border-subtle" />

      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs text-tl-text-secondary">New to TalentLoop?</span>
        <Link
          href="/auth/register"
          onClick={onClose}
          className="text-xs font-semibold text-tl-gold hover:underline transition-colors"
          role="menuitem"
        >
          Create free account →
        </Link>
      </div>
    </motion.div>
  )
}

/* ── Mobile menu ── */

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-tl-bg-base flex flex-col"
      aria-modal="true"
      role="dialog"
      aria-label="Mobile navigation"
    >
      {/* Decorative gold gradient top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-gold opacity-50" />

      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="TalentLoop — go to homepage"
          onClick={onClose}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block" aria-hidden="true" />
          <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-6 py-6 flex-1 overflow-y-auto" aria-label="Mobile navigation">
        <Link
          href="#features"
          className="px-4 py-3 rounded-xl text-base text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all"
          onClick={onClose}
        >
          Features
        </Link>
        {simpleNavLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-3 rounded-xl text-base text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-6 pt-6 border-t border-tl-border-subtle flex flex-col gap-3">
          <p className="px-1 text-xs font-semibold text-tl-text-muted uppercase tracking-widest">
            Sign In
          </p>
          <Link
            href="/auth/login?role=company"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-tl-border-default hover:border-tl-border-gold hover:bg-tl-bg-elevated transition-all group"
          >
            <Building2 className="w-4 h-4 text-tl-gold" />
            <span className="text-sm font-medium text-tl-text-secondary group-hover:text-tl-text-primary">
              Sign In as Company
            </span>
          </Link>
          <Link
            href="/auth/login?role=talent"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-tl-border-default hover:border-tl-border-gold hover:bg-tl-bg-elevated transition-all group"
          >
            <Search className="w-4 h-4 text-tl-teal" />
            <span className="text-sm font-medium text-tl-text-secondary group-hover:text-tl-text-primary">
              Sign In as Job Seeker
            </span>
          </Link>
          <Link
            href="/auth/register"
            onClick={onClose}
            className="btn-gold flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold mt-1"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </motion.div>
  )
}

/* ── Navbar ── */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<null | 'features' | 'signin'>(null)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  /* Scroll detection */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (menu: 'features' | 'signin') =>
    setOpenMenu((prev) => (prev === menu ? null : menu))

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-tl-bg-base/95 backdrop-blur-xl border-b border-tl-border-subtle shadow-elevated'
            : 'bg-transparent backdrop-blur-sm'
        )}
        role="banner"
      >
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="TalentLoop — go to homepage"
          >
            <span
              className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0"
              aria-hidden="true"
            />
            <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 relative" aria-label="Main navigation">

            {/* Features mega-dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('features')}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold',
                  openMenu === 'features'
                    ? 'text-tl-text-primary bg-tl-bg-elevated'
                    : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated'
                )}
                aria-expanded={openMenu === 'features'}
                aria-haspopup="true"
              >
                Features
                <motion.span
                  animate={{ rotate: openMenu === 'features' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-flex' }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {openMenu === 'features' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={dropdownTransition}
                    className="absolute top-full left-0 mt-2 w-[520px] bg-tl-bg-surface border border-tl-border-gold rounded-2xl shadow-gold-lg p-5 z-50"
                  >
                    <p className="text-xs font-semibold text-tl-gold uppercase tracking-widest mb-3 px-1">
                      Platform Features
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {featuresMenu.features.map((f) => (
                        <MegaFeatureItem key={f.title} {...f} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-tl-border-subtle flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-tl-teal" />
                        <span className="text-xs text-tl-text-secondary font-medium">
                          200+ companies · $48k avg saved per hire
                        </span>
                      </div>
                      <Link
                        href="/auth/register"
                        className="text-xs font-semibold text-tl-gold hover:underline"
                        onClick={() => setOpenMenu(null)}
                      >
                        Start free trial →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple nav links */}
            {simpleNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sign In dropdown */}
            <div className="relative">
              <button
                onClick={() => toggle('signin')}
                className={cn(
                  'btn-ghost flex items-center gap-1.5 text-sm py-2 px-4 rounded-xl',
                  openMenu === 'signin' && 'border-tl-border-gold text-tl-text-primary'
                )}
                aria-expanded={openMenu === 'signin'}
                aria-haspopup="true"
              >
                <UserRound className="w-3.5 h-3.5" />
                Sign In
                <motion.span
                  animate={{ rotate: openMenu === 'signin' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'inline-flex' }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {openMenu === 'signin' && (
                  <SignInDropdown onClose={() => setOpenMenu(null)} />
                )}
              </AnimatePresence>
            </div>

            {/* Get Started */}
            <Link href="/auth/register" className="btn-gold text-sm py-2 px-5 rounded-xl">
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
