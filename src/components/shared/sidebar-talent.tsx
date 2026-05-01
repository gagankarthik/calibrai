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
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'

const navItems = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/talent/jobs', icon: Search, badge: '42' },
  { label: 'Applications', href: '/talent/applications', icon: FileText, badge: '5' },
  { label: 'My Profile', href: '/talent/profile', icon: User },
  { label: 'Skills & Certs', href: '/talent/skills', icon: Award },
]

const bottomItems = [
  { label: 'Notifications', href: '#', icon: Bell, badge: '3' },
  { label: 'Settings', href: '#', icon: Settings },
  { label: 'Help', href: '#', icon: HelpCircle },
]

export function SidebarTalent() {
  const pathname = usePathname()
  const profileStrength = 82

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden md:flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-foreground">
            Calibr<span className="gradient-text">AI</span>
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[10px] text-muted-foreground">Premium</span>
          </div>
        </div>
      </div>

      {/* Profile Strength */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Profile Strength</span>
          <span className="text-xs font-semibold text-blue-400">{profileStrength}%</span>
        </div>
        <Progress value={profileStrength} />
        <p className="text-[10px] text-muted-foreground mt-1.5">Add certifications to reach 100%</p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          My Space
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn('sidebar-link', active && 'active')}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="ghost" className="text-[10px] h-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.label} href={item.href} className="sidebar-link">
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="ghost" className="text-[10px] h-5 px-1.5">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">Alex Chen</p>
            <p className="text-[10px] text-muted-foreground truncate">Sr. Frontend Engineer</p>
          </div>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      {/* Glass background */}
      <div className="absolute inset-0 -z-10 bg-card/80 backdrop-blur-xl border-r border-border" />
    </aside>
  )
}
