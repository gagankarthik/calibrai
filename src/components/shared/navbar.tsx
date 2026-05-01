'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { cn } from '@/lib/utils'
import {
  Menu,
  X,
  Zap,
  ChevronDown,
  Kanban,
  Brain,
  BarChart3,
  Shield,
  Users,
  MessageSquare,
  Search,
  Award,
  TrendingUp,
  Bell,
  Building2,
  UserRound,
} from 'lucide-react'

/* ── Mega-menu data ── */

const companiesMenu = {
  features: [
    {
      icon: Kanban,
      bg: 'bg-purple-500/10',
      color: 'text-purple-400',
      title: 'Pipeline Management',
      desc: "Visualize every candidate's journey",
      href: '#companies',
    },
    {
      icon: Brain,
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
      title: 'AI Matching',
      desc: '94% accurate candidate scoring',
      href: '#companies',
    },
    {
      icon: BarChart3,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
      title: 'Analytics',
      desc: 'Hiring metrics that matter',
      href: '#companies',
    },
    {
      icon: Shield,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
      title: 'ATS Compliance',
      desc: 'SOC2 & GDPR ready',
      href: '#companies',
    },
    {
      icon: Users,
      bg: 'bg-cyan-500/10',
      color: 'text-cyan-400',
      title: 'Talent Pool',
      desc: 'Search 50k+ verified profiles',
      href: '#companies',
    },
    {
      icon: MessageSquare,
      bg: 'bg-pink-500/10',
      color: 'text-pink-400',
      title: 'Messaging',
      desc: 'Built-in recruiter inbox',
      href: '#companies',
    },
  ],
  proof: {
    headline: '200+ companies hiring on Calibr',
    pills: ['Stripe', 'Vercel', 'Linear'],
    stat: 'Average ROI: $48k saved per hire',
    cta: 'Start Free Trial',
    href: '/auth/register',
  },
}

const seekersMenu = {
  features: [
    {
      icon: Search,
      bg: 'bg-blue-500/10',
      color: 'text-blue-400',
      title: 'Smart Job Matching',
      desc: 'AI finds roles that fit your DNA',
      href: '#seekers',
    },
    {
      icon: Award,
      bg: 'bg-amber-500/10',
      color: 'text-amber-400',
      title: 'Skills Verification',
      desc: 'Stand out with verified credentials',
      href: '#seekers',
    },
    {
      icon: TrendingUp,
      bg: 'bg-emerald-500/10',
      color: 'text-emerald-400',
      title: 'Salary Intelligence',
      desc: 'Know your market worth',
      href: '#seekers',
    },
    {
      icon: Bell,
      bg: 'bg-purple-500/10',
      color: 'text-purple-400',
      title: 'Job Alerts',
      desc: 'First to know about new roles',
      href: '#seekers',
    },
  ],
  proof: {
    headline: '50,000+ verified candidates',
    stat: 'Average 3.2x more interviews',
    cta: 'Browse Jobs',
    href: '/talent/dashboard',
  },
}

const simpleNavLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#' },
  { label: 'Contact', href: '/contact' },
]

/* ── Animation ── */

const dropdownVariants = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
}

const dropdownTransition = { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }

/* ── Feature item ── */

function FeatureItem({
  icon: Icon,
  bg,
  color,
  title,
  desc,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  bg: string
  color: string
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {title}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{desc}</p>
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
      className="absolute top-full right-0 mt-2 w-72 glass border border-border shadow-2xl rounded-2xl p-3 z-50"
      role="menu"
      aria-label="Sign in options"
    >
      {/* For Hiring Teams */}
      <Link
        href="/auth/login?role=company"
        onClick={onClose}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group"
        role="menuitem"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/10">
          <Building2 className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            For Hiring Teams
          </p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">
            Post jobs, manage pipeline
          </p>
        </div>
      </Link>

      {/* For Job Seekers */}
      <Link
        href="/auth/login?role=talent"
        onClick={onClose}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group"
        role="menuitem"
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-500/10">
          <Search className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            For Job Seekers
          </p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">
            Find your next role
          </p>
        </div>
      </Link>

      {/* Divider */}
      <div className="my-2 border-t border-border" />

      {/* New to Calibr */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs text-muted-foreground">New to Calibr?</span>
        <Link
          href="/auth/register"
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:underline transition-colors"
          role="menuitem"
        >
          Create free account →
        </Link>
      </div>
    </motion.div>
  )
}

/* ── Navbar ── */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<null | 'companies' | 'seekers' | 'signin'>(null)
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

  const toggle = (menu: 'companies' | 'seekers' | 'signin') =>
    setOpenMenu((prev) => (prev === menu ? null : menu))

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all',
        scrolled && 'shadow-lg'
      )}
      role="banner"
      ref={navRef}
    >
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="CalibrAI — go to homepage">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Calibr<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 relative" aria-label="Main navigation">

          {/* For Companies */}
          <div className="relative">
            <button
              onClick={() => toggle('companies')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                openMenu === 'companies'
                  ? 'text-foreground bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
              aria-expanded={openMenu === 'companies'}
              aria-haspopup="true"
            >
              For Companies
              <motion.span
                animate={{ rotate: openMenu === 'companies' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-flex' }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {openMenu === 'companies' && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={dropdownTransition}
                  className="absolute top-full left-0 mt-2 w-[540px] glass border border-border shadow-2xl rounded-2xl p-5 z-50"
                >
                  <div className="flex gap-4">
                    {/* Features grid */}
                    <div className="flex-1 grid grid-cols-2 gap-0.5">
                      {companiesMenu.features.map((f) => (
                        <FeatureItem key={f.title} {...f} />
                      ))}
                    </div>

                    {/* Social proof */}
                    <div className="w-44 flex-shrink-0 bg-primary/5 border border-border rounded-xl p-4 flex flex-col gap-3">
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {companiesMenu.proof.headline}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {companiesMenu.proof.pills.map((pill) => (
                          <span
                            key={pill}
                            className="px-2 py-0.5 rounded-full bg-muted border border-border text-xs text-muted-foreground font-medium"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {companiesMenu.proof.stat}
                      </div>
                      <Button size="sm" className="w-full text-xs h-8 mt-auto" asChild>
                        <Link href={companiesMenu.proof.href}>
                          {companiesMenu.proof.cta} →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* For Job Seekers */}
          <div className="relative">
            <button
              onClick={() => toggle('seekers')}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                openMenu === 'seekers'
                  ? 'text-foreground bg-white/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
              aria-expanded={openMenu === 'seekers'}
              aria-haspopup="true"
            >
              For Job Seekers
              <motion.span
                animate={{ rotate: openMenu === 'seekers' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'inline-flex' }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {openMenu === 'seekers' && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={dropdownTransition}
                  className="absolute top-full left-0 mt-2 w-[480px] glass border border-border shadow-2xl rounded-2xl p-5 z-50"
                >
                  <div className="flex gap-4">
                    {/* Features */}
                    <div className="flex-1 grid grid-cols-1 gap-0.5">
                      {seekersMenu.features.map((f) => (
                        <FeatureItem key={f.title} {...f} />
                      ))}
                    </div>

                    {/* Proof */}
                    <div className="w-44 flex-shrink-0 bg-primary/5 border border-border rounded-xl p-4 flex flex-col gap-3">
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {seekersMenu.proof.headline}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {seekersMenu.proof.stat}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 mt-auto"
                        asChild
                      >
                        <Link href={seekersMenu.proof.href}>
                          {seekersMenu.proof.cta} →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simple nav links: Pricing, Resources, Contact */}
          {simpleNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {/* Sign In with role dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggle('signin')}
              aria-expanded={openMenu === 'signin'}
              aria-haspopup="true"
              className="flex items-center gap-1.5"
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
            </Button>

            <AnimatePresence>
              {openMenu === 'signin' && (
                <SignInDropdown onClose={() => setOpenMenu(null)} />
              )}
            </AnimatePresence>
          </div>

          {/* Get Started Free → /auth/register (register page handles role choice) */}
          <Button size="sm" asChild>
            <Link href="/auth/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Glassmorphism background — stronger blur on scroll */}
      <div
        className={cn(
          'absolute inset-0 -z-10 border-b border-white/[0.05] transition-all duration-300',
          scrolled
            ? 'glass backdrop-blur-xl bg-background/80'
            : 'glass backdrop-blur-sm bg-background/40'
        )}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden glass border-b border-white/[0.05] overflow-hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile navigation">
              <Link
                href="#companies"
                className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                For Companies
              </Link>
              <Link
                href="#seekers"
                className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                For Job Seekers
              </Link>
              {simpleNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile auth section */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <p className="px-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sign In
                </p>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/auth/login?role=company" onClick={() => setMobileOpen(false)}>
                    <Building2 className="w-4 h-4 text-purple-400" />
                    Sign In as Company
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/auth/login?role=talent" onClick={() => setMobileOpen(false)}>
                    <Search className="w-4 h-4 text-blue-400" />
                    Sign In as Job Seeker
                  </Link>
                </Button>
                <Button className="mt-1" asChild>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
