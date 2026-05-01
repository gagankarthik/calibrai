'use client'

import { SidebarCompany } from '@/components/shared/sidebar-company'
import { MobileNavCompany } from '@/components/shared/mobile-nav'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Zap, Settings, LogOut, User, CreditCard, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <SidebarCompany />

      {/* Main content area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
          {/* Left: Mobile nav + Branding */}
          <div className="flex items-center gap-2.5">
            <MobileNavCompany />
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground hidden sm:inline">
              Calibr<span className="gradient-text">AI</span>
            </span>
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-blue-400 font-medium">Enterprise</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search candidates, jobs..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-white/[0.04] border border-white/[0.08]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: Notifications + Avatar */}
          <div className="flex items-center gap-2">
            {/* Search icon mobile */}
            <Button variant="ghost" size="icon" className="md:hidden w-9 h-9">
              <Search className="w-4 h-4 text-muted-foreground" />
            </Button>

            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative w-9 h-9 rounded-xl hover:bg-white/[0.06]">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                3
              </span>
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-white/[0.05] transition-all duration-200 outline-none group">
                  <Avatar className="h-8 w-8 ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=company" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                      SC
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-foreground leading-none">Stripe Corp</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Admin</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=company" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Stripe Corp</p>
                      <p className="text-xs text-muted-foreground font-normal">admin@stripe.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4" />
                  Company Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="w-4 h-4" />
                  Billing & Plan
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-400/10">
                  <LogOut className="w-4 h-4" />
                  Sign out
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
    </div>
  )
}
