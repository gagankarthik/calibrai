'use client'

import { SidebarCompany } from '@/components/shared/sidebar-company'
import { MobileNavCompany } from '@/components/shared/mobile-nav'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Zap, Settings, LogOut, User, CreditCard, ChevronDown } from 'lucide-react'

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-tl-bg-base flex overflow-hidden">
      <SidebarCompany />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-tl-border-subtle bg-tl-bg-surface/80 backdrop-blur-xl">
          {/* Left */}
          

          {/* Center: Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
              <input
                type="text"
                placeholder="Search candidates, jobs..."
                className="w-full pl-9 pr-12 py-2 rounded-xl bg-tl-bg-elevated border border-tl-border-subtle text-sm text-tl-text-primary placeholder:text-tl-text-secondary focus:outline-none focus:ring-2 focus:ring-tl-gold/30 focus:border-tl-gold/40 transition-all duration-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-tl-text-secondary bg-tl-bg-surface border border-tl-border-subtle">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-tl-text-secondary hover:bg-tl-bg-elevated transition-all">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-tl-text-secondary hover:bg-tl-bg-elevated transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-tl-gold flex items-center justify-center text-[9px] font-bold text-tl-text-inverse">
                3
              </span>
            </button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-tl-bg-elevated transition-all duration-200 outline-none group">
                  <Avatar className="h-8 w-8 ring-1 ring-tl-gold/30">
                    <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold font-mono">SC</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-tl-text-primary leading-none">Stripe Corp</p>
                    <p className="text-[10px] text-tl-text-secondary mt-0.5">Admin</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-tl-text-secondary hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-tl-bg-elevated border-tl-border-default">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9 ring-1 ring-tl-gold/30">
                      <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold">SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-tl-text-primary">Stripe Corp</p>
                      <p className="text-xs text-tl-text-secondary font-normal">admin@stripe.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay">
                  <User className="w-4 h-4" />
                  Company Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay">
                  <CreditCard className="w-4 h-4" />
                  Billing & Plan
                </DropdownMenuItem>
                <DropdownMenuItem className="text-tl-text-secondary focus:text-tl-text-primary focus:bg-tl-bg-overlay">
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-tl-border-subtle" />
                <DropdownMenuItem className="text-tl-rose focus:text-tl-rose focus:bg-tl-rose/10">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
