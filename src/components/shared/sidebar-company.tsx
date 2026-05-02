'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  BarChart3,
  MessageSquare,
  Settings,
  Zap,
  HelpCircle,
  Shield,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',   href: '/company/dashboard',  icon: LayoutDashboard },
  { label: 'Jobs',        href: '/company/jobs',        icon: Briefcase },
  { label: 'Talent Pool', href: '/company/candidates',  icon: Users },
  { label: 'Pipeline',    href: '/company/pipeline',    icon: Kanban },
  { label: 'Analytics',   href: '/company/analytics',   icon: BarChart3 },
  { label: 'Messages',    href: '/company/messages',    icon: MessageSquare },
]

const bottomItems = [
  { label: 'Settings',  href: '/company/settings', icon: Settings },
  { label: 'Audit Log', href: '/company/audit',    icon: Shield },
  { label: 'Help',      href: '#',                 icon: HelpCircle },
]

interface SidebarCompanyProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function SidebarCompany({ mobileOpen = false, onMobileClose }: SidebarCompanyProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 z-40 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out; Desktop: always visible
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        )}
        aria-label="Company sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-tl-border-subtle">
          <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-tl-gold" />
          </div>
          <span className="font-display text-sm font-bold text-tl-text-primary">TalentBridge</span>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] font-semibold text-tl-text-secondary uppercase tracking-wider px-3 mb-2">
            Workspace
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onMobileClose}
                className={cn('sidebar-link', active && 'active')}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon
                  className={cn('w-4 h-4 shrink-0', active ? 'text-tl-gold' : 'text-tl-text-secondary')}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-tl-border-subtle space-y-1">
          {bottomItems.map((item) => (
            <Link key={item.label} href={item.href} onClick={onMobileClose} className="sidebar-link">
              <item.icon className="w-4 h-4 shrink-0 text-tl-text-secondary" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-tl-bg-surface/95 backdrop-blur-xl border-r border-tl-border-subtle" />
      </aside>
    </>
  )
}
