'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarCompany } from '@/components/shared/sidebar-company'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Settings, LogOut, User, CreditCard, ChevronDown, Menu } from 'lucide-react'
import Link from 'next/link'

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  companyName: string | null
}

function getInitials(name: string | null, fallback = '??'): string {
  if (!name) return fallback
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && !data.error) setUser(data) })
      .catch(() => {})
  }, [])

  function handleSignOut() {
    document.cookie = 'tb-company-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax'
    router.push('/auth/login')
  }

  const displayName = user?.companyName ?? user?.name ?? 'Your Company'
  const displayEmail = user?.email ?? ''
  const initials = getInitials((user?.companyName ?? user?.name) ?? null)

  return (
    <div className="h-screen bg-tl-bg-base flex overflow-hidden">
      <SidebarCompany
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:pl-64 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-6 py-3 border-b border-tl-border-subtle bg-tl-bg-surface/80 backdrop-blur-xl shrink-0">
          {/* Left: hamburger (mobile) + search (desktop) */}
          <div className="flex items-center gap-2 flex-1">
            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-tl-text-secondary hover:bg-tl-bg-elevated transition-all"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                <input
                  type="text"
                  placeholder="Search candidates, jobs…"
                  className="w-full pl-9 pr-12 py-2 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none focus:ring-2 focus:ring-tl-gold/30 focus:border-tl-gold/40 transition-all duration-200"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-tl-text-secondary bg-tl-bg-surface border border-tl-border-subtle">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile search icon */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-tl-text-secondary hover:bg-tl-bg-elevated transition-all">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-2.5 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-tl-bg-elevated transition-all duration-200 outline-none">
                  <Avatar className="h-8 w-8 ring-1 ring-tl-gold/30">
                    <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold font-mono">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-tl-text-primary leading-none truncate max-w-[120px]">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-tl-text-secondary mt-0.5">{user?.role ?? 'Company'}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-tl-text-secondary hidden sm:block" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-tl-bg-elevated border-tl-border-default">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9 ring-1 ring-tl-gold/30">
                      <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-tl-text-primary truncate">{displayName}</p>
                      <p className="text-xs text-tl-text-secondary font-normal truncate">{displayEmail}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem asChild className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay cursor-pointer">
                  <Link href="/company/settings"><User className="w-4 h-4" />Company Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay cursor-pointer">
                  <Link href="/company/settings?tab=billing"><CreditCard className="w-4 h-4" />Billing &amp; Plan</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay cursor-pointer">
                  <Link href="/company/settings"><Settings className="w-4 h-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-tl-rose focus:text-tl-rose focus:bg-tl-rose/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
