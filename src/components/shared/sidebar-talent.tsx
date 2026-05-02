'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Award,
  Bell,
  Settings,
  Zap,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/talent/jobs', icon: Search, badge: '42' },
  { label: 'Applications', href: '/talent/applications', icon: FileText, badge: '5' },
  { label: 'My Profile', href: '/talent/profile', icon: User },
  { label: 'Skills & Certs', href: '/talent/skills', icon: Award },
]

const bottomItems = [
  { label: 'Notifications', href: '#', icon: Bell, badge: '3' },
  { label: 'Settings', href: '/talent/settings', icon: Settings },
  { label: 'Help', href: '#', icon: HelpCircle },
]

export function SidebarTalent() {
  const pathname = usePathname()
  const profileStrength = 82

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden md:flex flex-col" aria-label="Talent sidebar navigation">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-tl-border-subtle">
        <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-tl-gold" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-tl-text-primary">
            TalentBridge
          </span>
        </div>
      </div>

      {/* Profile Strength */}
      <div className="px-4 py-4 border-b border-tl-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-tl-text-secondary">Profile Strength</span>
          <span className="text-xs font-semibold font-mono text-tl-gold">{profileStrength}%</span>
        </div>
        <div className="h-1.5 bg-tl-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-gold transition-all duration-500"
            style={{ width: `${profileStrength}%` }}
          />
        </div>
        <p className="text-[10px] text-tl-text-secondary mt-1.5">Add certifications to reach 100%</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-tl-text-secondary uppercase tracking-wider px-3 mb-2">
          My Space
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

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-tl-border-subtle space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.label} href={item.href} className="sidebar-link">
            <item.icon className="w-4 h-4 shrink-0 text-tl-text-secondary" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="ghost" className="text-[10px] h-5 px-1.5 bg-tl-gold/10 text-tl-gold border border-tl-gold/20">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl hover:bg-tl-bg-elevated cursor-pointer transition-all">
          <Avatar className="h-8 w-8 ring-1 ring-tl-gold/30">
            <AvatarFallback className="bg-tl-gold/10 text-tl-gold text-xs font-bold font-mono">AC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-tl-text-primary truncate">Alex Chen</p>
            <p className="text-[10px] text-tl-text-secondary truncate">Sr. Frontend Engineer</p>
          </div>
          <ChevronRight className="w-3 h-3 text-tl-text-secondary" />
        </div>
      </div>

      {/* Glass background */}
      <div className="absolute inset-0 -z-10 bg-tl-bg-surface/95 backdrop-blur-xl border-r border-tl-border-subtle" />
    </aside>
  )
}
