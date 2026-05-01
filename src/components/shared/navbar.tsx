'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X, ChevronDown, Zap, Building2, User } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'

const navLinks = [
  {
    label: 'For Companies',
    href: '#companies',
    children: [
      { label: 'AI Candidate Matching', href: '#' },
      { label: 'Pipeline Management', href: '#' },
      { label: 'Analytics & Insights', href: '#' },
      { label: 'ATS Integrations', href: '#' },
    ],
  },
  {
    label: 'For Job Seekers',
    href: '#seekers',
    children: [
      { label: 'Smart Job Matching', href: '#' },
      { label: 'Skills Verification', href: '#' },
      { label: 'Salary Intelligence', href: '#' },
      { label: 'Career Path Graph', href: '#' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Calibr<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200">
                    {link.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  {link.children.map((child) => (
                    <DropdownMenuItem key={child.label} asChild>
                      <Link href={child.href}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sign In
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/company/dashboard" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  As Company
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/talent/dashboard" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  As Job Seeker
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Glassmorphism background */}
      <div className="absolute inset-0 -z-10 glass border-b border-white/[0.05]" />

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-white/[0.05] px-6 pb-6">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href || '#'}
                className="px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" asChild>
                <Link href="/company/dashboard">Sign In as Company</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
