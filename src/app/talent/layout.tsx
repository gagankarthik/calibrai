'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarTalent } from '@/components/shared/sidebar-talent'
import { MobileNavTalent } from '@/components/shared/mobile-nav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from 'lucide-react'

const PAGE_NAMES: Record<string, string> = {
  '/talent/dashboard': 'Dashboard',
  '/talent/jobs': 'Browse Jobs',
  '/talent/applications': 'Applications',
  '/talent/profile': 'My Profile',
  '/talent/skills': 'Skills & Certs',
  '/talent/messages': 'Messages',
  '/talent/settings': 'Settings',
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  const suggestions = [
    { label: 'Go to Dashboard', href: '/talent/dashboard', shortcut: 'D' },
    { label: 'Browse Jobs', href: '/talent/jobs', shortcut: 'J' },
    { label: 'My Applications', href: '/talent/applications', shortcut: 'A' },
    { label: 'My Profile', href: '/talent/profile', shortcut: 'P' },
    { label: 'Skills & Certs', href: '/talent/skills', shortcut: 'S' },
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

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [commandOpen, setCommandOpen] = useState(false)
  const pageName = PAGE_NAMES[pathname] ?? 'Page'

  return (
    <div className="h-screen bg-tl-bg-base flex overflow-hidden">
      <SidebarTalent />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 border-b border-tl-border-subtle bg-tl-bg-surface/80 backdrop-blur-xl">
          {/* Mobile nav + Breadcrumb */}
          <div className="flex items-center gap-2">
            <MobileNavTalent />
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
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-8 py-1 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle hover:border-tl-gold/30 transition-all duration-200 text-sm text-tl-text-secondary"
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

            {/* Bell */}
            <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-tl-gold flex items-center justify-center text-[9px] font-bold text-tl-text-inverse  text-white leading-none">
                3
              </span>
            </button>

            {/* Upgrade button */}
            <button className="hidden sm:flex items-center gap-1.5 text-xs px-3 h-8 btn-gold rounded-lg">
              <Zap className="w-3 h-3" />
              Upgrade
            </button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-tl-bg-elevated transition-all duration-200 outline-none group">
                  <Avatar className="h-8 w-8 ring-1 ring-tl-gold/30">
                    <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold font-mono">AC</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-tl-text-primary leading-none">Alex Chen</p>
                    <p className="text-[10px] text-tl-text-secondary mt-0.5">Sr. Frontend Eng.</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-tl-text-secondary hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-tl-bg-elevated border-tl-border-default">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9 ring-1 ring-tl-gold/30">
                      <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-sm font-bold">AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-tl-text-primary">Alex Chen</p>
                      <p className="text-xs text-tl-text-secondary font-normal">alex.chen@email.com</p>
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
                <DropdownMenuItem className="text-tl-rose focus:text-tl-rose focus:bg-tl-rose/10">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
    </div>
  )
}
