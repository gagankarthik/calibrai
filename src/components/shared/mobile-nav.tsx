'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
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
  Menu,
  X,
  UserCircle,
  GraduationCap,
  FileText,
  FlaskConical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const companyNavItems = [
  { label: 'Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/company/jobs', icon: Briefcase, badge: '12' },
  { label: 'Candidates', href: '/company/candidates', icon: Users },
  { label: 'Pipeline', href: '/company/pipeline', icon: Kanban, badge: '7' },
  { label: 'Analytics', href: '/company/analytics', icon: BarChart3 },
  { label: 'Messages', href: '/company/messages', icon: MessageSquare, badge: '3' },
  { label: 'Settings', href: '/company/settings', icon: Settings },
]

const talentNavItems = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', href: '/talent/jobs', icon: Briefcase },
  { label: 'Applications', href: '/talent/applications', icon: FileText },
  { label: 'Profile', href: '/talent/profile', icon: UserCircle },
  { label: 'Skills', href: '/talent/skills', icon: FlaskConical },
  { label: 'Settings', href: '/talent/settings', icon: Settings },
]

function MobileNav({ items, label }: { items: typeof companyNavItems; label: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Hamburger trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden w-9 h-9 rounded-xl"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Overlay + drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden bg-card/95 backdrop-blur-xl border-r border-border shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={`${label} navigation`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Calibr<span className="gradient-text">AI</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-xl"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Section label */}
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
                {items.map((item, i) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        className={cn('sidebar-link', active && 'active')}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        <item.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <Badge variant="ghost" className="text-[10px] h-5 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileNavCompany() {
  return <MobileNav items={companyNavItems} label="Company Workspace" />
}

export function MobileNavTalent() {
  return <MobileNav items={talentNavItems} label="Talent Dashboard" />
}
