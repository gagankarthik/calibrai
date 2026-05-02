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
  Plus,
  ChevronRight,
  HelpCircle,
  Shield,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { label: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/company/jobs', icon: Briefcase, badge: '12' },
  { label: 'Talent Pool', href: '/company/candidates', icon: Users },
  { label: 'Pipeline', href: '/company/pipeline', icon: Kanban, badge: '7' },
  { label: 'Analytics', href: '/company/analytics', icon: BarChart3 },
  { label: 'Messages', href: '/company/messages', icon: MessageSquare, badge: '3' },
]

const bottomItems = [
  { label: 'Settings', href: '/company/settings', icon: Settings },
  { label: 'Audit Log', href: '/company/audit', icon: Shield },
  { label: 'Help', href: '#', icon: HelpCircle },
]

export function SidebarCompany() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden md:flex flex-col" aria-label="Company sidebar navigation">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-tl-border-subtle">
        <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-tl-gold" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-tl-text-primary">
            TalentBridge
          </span>
        </div>
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
              className={cn('sidebar-link', active && 'active')}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-tl-gold' : 'text-tl-text-secondary')} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="ghost" className="text-[10px] h-5 px-1.5 bg-tl-gold/10 text-tl-gold border border-tl-gold/20">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-tl-border-subtle space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.label} href={item.href} className="sidebar-link">
            <item.icon className="w-4 h-4 shrink-0 text-tl-text-secondary" />
            <span>{item.label}</span>
          </Link>
        ))}

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl hover:bg-tl-bg-elevated cursor-pointer transition-all">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=company" />
            <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold">SC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-tl-text-primary truncate">Stripe Corp</p>
            <p className="text-[10px] text-tl-text-secondary truncate">Admin</p>
          </div>
          <ChevronRight className="w-3 h-3 text-tl-text-secondary" />
        </div>
      </div>

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-tl-bg-surface/95 backdrop-blur-xl border-r border-tl-border-subtle" />
    </aside>
  )
}
