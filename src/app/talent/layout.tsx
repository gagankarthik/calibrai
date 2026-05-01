'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarTalent } from '@/components/shared/sidebar-talent'
import { MobileNavTalent } from '@/components/shared/mobile-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  const suggestions = [
    { label: 'Go to Dashboard', href: '/talent/dashboard', icon: '🏠' },
    { label: 'Browse Jobs', href: '/talent/jobs', icon: '🔍' },
    { label: 'My Applications', href: '/talent/applications', icon: '📋' },
    { label: 'My Profile', href: '/talent/profile', icon: '👤' },
    { label: 'Skills & Certs', href: '/talent/skills', icon: '🏆' },
  ].filter((s) => !query || s.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 glass-card overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Command className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] border border-white/[0.1] text-muted-foreground">
            ESC
          </kbd>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
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
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-foreground">{item.label}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1]">↵</kbd>
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
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <SidebarTalent />

      {/* Main content area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/60 backdrop-blur-xl">
          {/* Mobile nav + Breadcrumb */}
          <div className="flex items-center gap-2">
            <MobileNavTalent />
            <nav className="flex items-center gap-1.5 text-sm">
              <Link
                href="/talent/dashboard"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="font-medium text-foreground">{pageName}</span>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search / Command Palette button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-200 text-sm text-muted-foreground"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>

            {/* Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl hover:bg-white/[0.06]"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white leading-none">
                3
              </span>
            </Button>

            {/* Upgrade button */}
            <Button
              variant="gradient"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 h-8"
            >
              <Zap className="w-3 h-3" />
              Upgrade to Premium
            </Button>

            {/* User avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.05] transition-all duration-200 outline-none group">
                  <Avatar className="h-8 w-8 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground leading-none">Alex Chen</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Sr. Frontend Engineer</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Alex Chen</p>
                      <p className="text-xs text-muted-foreground font-normal">alex.chen@email.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/talent/profile" className="cursor-pointer">
                    <User className="w-4 h-4" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/talent/settings" className="cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
    </div>
  )
}
