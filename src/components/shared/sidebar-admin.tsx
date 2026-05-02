'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  UserRound,
  BarChart3,
  Shield,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/admin/companies', icon: Building2 },
  { label: 'Talents', href: '/admin/talents', icon: Users },
  { label: 'Jobs Board', href: '/admin/jobs', icon: Briefcase },
  { label: 'CRM Jobs', href: '/admin/crm/jobs', icon: Briefcase },
  { label: 'CRM Candidates', href: '/admin/crm/candidates', icon: UserRound },
  { label: 'SaaS Metrics', href: '/admin/saas-metrics', icon: BarChart3 },
]

function handleLogout() {
  document.cookie = 'tb-admin-verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  window.location.href = '/admin'
}

export function SidebarAdmin() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 z-40 hidden md:flex flex-col"
      aria-label="Admin sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--tl-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-tl-rose/10 border border-tl-rose/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-tl-rose" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-tl-text-primary">
            TalentBridge
          </span>
          <span className="block text-[10px] text-tl-text-secondary font-medium tracking-wider uppercase">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Zap badge */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-tl-rose/5 border border-tl-rose/20">
          <span className="w-1.5 h-1.5 rounded-full bg-tl-rose animate-pulse" />
          <span className="text-[11px] font-semibold text-tl-rose">Owner Access</span>
          <Zap className="w-3 h-3 text-tl-rose ml-auto" />
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        <div className="text-[10px] font-semibold text-tl-text-secondary uppercase tracking-wider px-3 mb-2">
          Admin
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn('sidebar-link', active && 'active')}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-tl-gold' : 'text-tl-text-secondary',
                )}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-tl-gold" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[var(--tl-border-subtle)] space-y-1">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-tl-rose hover:text-tl-rose hover:bg-tl-rose/5"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-tl-rose/10 border border-tl-rose/30 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-tl-rose" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-tl-text-primary truncate">Owner</p>
            <p className="text-[10px] text-tl-text-secondary truncate">oceanbluesolutions</p>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[var(--tl-bg-surface)]/95 backdrop-blur-xl border-r border-[var(--tl-border-subtle)]" />
    </aside>
  )
}
