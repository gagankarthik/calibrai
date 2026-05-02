'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Users, ArrowLeft, Database } from 'lucide-react'

const NAV = [
  { href: '/crm/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/crm/candidates', label: 'Candidates', icon: Users },
]

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen" style={{ background: 'var(--tl-bg-base)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--tl-border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-14">
            {/* Back */}
            <Link
              href="/company/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: 'var(--tl-text-secondary)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="w-px h-4" style={{ background: 'var(--tl-border-subtle)' }} />

            {/* Brand */}
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Database className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--tl-text-primary)' }}>
                Intelligence CRM
              </span>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  color: '#6366f1',
                  border: '1px solid rgba(99,102,241,0.18)',
                }}
              >
                AI
              </span>
            </div>

            {/* Nav tabs */}
            <nav className="ml-auto flex items-center gap-1">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                    style={
                      active
                        ? {
                            background: 'rgba(99,102,241,0.1)',
                            color: '#6366f1',
                            border: '1px solid rgba(99,102,241,0.2)',
                          }
                        : { color: 'var(--tl-text-secondary)' }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  )
}
