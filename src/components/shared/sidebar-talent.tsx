'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Zap,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tb-sidebar-collapsed'

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/talent/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/talent/jobs', icon: Search },
  { label: 'Applications', href: '/talent/applications', icon: FileText },
  { label: 'My Profile', href: '/talent/profile', icon: User },
]

// ── Hook: useSidebarCollapsed ─────────────────────────────────────────────────

export function useSidebarCollapsed(): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      setCollapsed(stored === 'true')
    }

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setCollapsed(e.newValue === 'true')
      }
    }

    function onCustom(e: Event) {
      setCollapsed((e as CustomEvent<boolean>).detail)
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('tb-sidebar-toggle', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('tb-sidebar-toggle', onCustom)
    }
  }, [])

  return collapsed
}

// ── Sub-component: NavLink ────────────────────────────────────────────────────

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        'sidebar-link relative',
        active && 'active',
        collapsed && 'justify-center px-0 w-10 h-10 mx-auto'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <item.icon
        className={cn(
          'w-4 h-4 shrink-0',
          active ? 'text-tl-gold' : 'text-tl-text-secondary'
        )}
        aria-hidden="true"
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="bg-tl-bg-elevated border-tl-border-default text-tl-text-primary text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Sub-component: UpgradeCard ────────────────────────────────────────────────

function UpgradeCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip delayDuration={120}>
        <TooltipTrigger asChild>
          <button className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 hover:opacity-90 transition-opacity shadow-md">
            <Zap className="w-4 h-4 text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-tl-bg-elevated border-tl-border-default text-tl-text-primary text-xs">
          Upgrade to Pro
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="mx-3 rounded-xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-px shadow-md">
      <div className="rounded-[11px] bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 px-3.5 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white">Upgrade to Pro</span>
        </div>
        <p className="text-[10px] text-white/80 leading-snug mb-2.5">
          Unlock AI matching, unlimited applies
        </p>
        <button className="w-full text-[11px] font-semibold text-amber-600 bg-white rounded-lg py-1.5 hover:bg-white/90 transition-colors">
          Get Pro Access
        </button>
      </div>
    </div>
  )
}

// ── Main Component: SidebarTalent ─────────────────────────────────────────────

export function SidebarTalent() {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setCollapsed(stored === 'true')
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      window.dispatchEvent(new CustomEvent('tb-sidebar-toggle', { detail: next }))
      return next
    })
  }, [])

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Talent sidebar navigation"
      >
        {/* Glass background */}
        <div className="absolute inset-0 -z-10 bg-tl-bg-surface/95 backdrop-blur-xl border-r border-tl-border-subtle" />

        {/* Logo */}
        <div
          className={cn(
            'flex items-center border-b border-tl-border-subtle shrink-0',
            collapsed ? 'h-14 justify-center px-0' : 'h-14 gap-2.5 px-4'
          )}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-tl-gold" />
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-tl-gold" />
              </div>
              <span className="font-display text-sm font-bold text-tl-text-primary flex-1">
                TalentBridge
              </span>
            </>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {!collapsed && (
            <div className="text-[10px] font-semibold text-tl-text-secondary uppercase tracking-wider px-3 mb-2">
              My Space
            </div>
          )}
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <NavLink key={item.href} item={item} active={active} collapsed={collapsed} />
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className={cn('pb-3 border-t border-tl-border-subtle space-y-1.5 pt-3 shrink-0', collapsed ? 'px-3' : 'px-3')}>
          {/* Collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium text-tl-text-secondary hover:bg-tl-bg-elevated hover:text-tl-text-primary transition-all',
              collapsed && 'justify-center px-0 w-10 h-8 mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>

          {/* Upgrade Pro card */}
          <UpgradeCard collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  )
}

export default SidebarTalent
