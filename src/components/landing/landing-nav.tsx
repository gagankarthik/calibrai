'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TBLogo } from './landing-logo'

const NAV_ITEMS = [
  { label: 'Product',      href: '/#features' },
  { label: 'How It Works', href: '/#how' },
  { label: ' SearchJobs',         href: '/jobs' },
  { label: 'Pricing',      href: '/pricing' },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

        {/* CTA */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link
            href="/auth/login"
            className="px-3 py-1.5 text-[13px] font-medium text-tl-text-secondary hover:text-tl-text-primary rounded-full hover:bg-white/[0.06] transition-all"
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
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden p-2 rounded-full text-tl-text-secondary hover:text-tl-text-primary hover:bg-white/[0.06] transition-colors"
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
          {[...NAV_ITEMS, { label: 'Sign in', href: '/auth/login' }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-tl-text-secondary hover:text-tl-text-primary rounded-xl hover:bg-tl-bg-elevated transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth/register?role=company"
            onClick={() => setOpen(false)}
            className="block mt-1 px-4 py-3 rounded-xl bg-tl-gold text-white text-sm font-semibold text-center shadow-lg shadow-tl-gold/30"
          >
            Get started free
          </Link>
        </motion.div>
      )}
    </header>
  )
}
