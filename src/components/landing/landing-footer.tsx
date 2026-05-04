'use client'

import Link from 'next/link'
import { Shield, Lock, CheckCircle2 } from 'lucide-react'
import { TBLogo } from './landing-logo'

const FOOTER_COLS: Record<string, Array<{ label: string; href: string }>> = {
  Product:   [
    { label: 'AI Sourcer',  href: '/docs#ai-sourcer' },
    { label: 'Pricing',     href: '/pricing' },
    { label: 'Pipeline',    href: '/docs#overview' },
    { label: 'Analytics',   href: '/docs#overview' },
  ],
  Company:   [
    { label: 'About',       href: '/contact' },
    { label: 'Contact',     href: '/contact' },
    { label: 'Careers',     href: '/contact' },
    { label: 'Press',       href: '/contact' },
  ],
  Resources: [
    { label: 'Docs',        href: '/docs' },
    { label: 'API',         href: '/docs#api' },
    { label: 'Architecture',href: '/docs#architecture' },
    { label: 'Self-host',   href: '/docs#self-host' },
  ],
  Legal:     [
    { label: 'Privacy',     href: '/privacy' },
    { label: 'Terms',       href: '/terms' },
    { label: 'Cookies',     href: '/privacy' },
    { label: 'GDPR',        href: '/privacy' },
  ],
}

export function LandingFooter() {
  return (
    <footer className="border-t border-tl-border-subtle bg-tl-bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <TBLogo size={26} />
              <span className="text-[14px] font-semibold text-tl-text-primary">TalentBridge</span>
            </Link>
            <p className="text-[13px] text-tl-text-tertiary leading-relaxed max-w-[220px]">
              The AI hiring platform that fills your pipeline faster.
            </p>
          </div>

          {Object.entries(FOOTER_COLS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[11px] font-semibold text-tl-text-primary uppercase tracking-[0.14em] mb-4">
                {group}
              </div>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13px] text-tl-text-tertiary hover:text-tl-text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-tl-border-subtle">
          <p className="text-[12.5px] text-tl-text-tertiary">
            © {new Date().getFullYear()} TalentBridge Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { icon: Shield,       label: 'SOC2 Type II' },
              { icon: Lock,         label: 'GDPR' },
              { icon: CheckCircle2, label: '99.9% Uptime' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[12px] text-tl-text-tertiary">
                <Icon className="w-3.5 h-3.5 text-tl-teal shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
