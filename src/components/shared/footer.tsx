'use client'

import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'For Companies', href: '/#companies' },
    { label: 'For Job Seekers', href: '/#seekers' },
    { label: 'AI Matching Engine', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/contact' },
    { label: 'Partners', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Integrations', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Support', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'GDPR', href: '/privacy#your-rights' },
    { label: 'Security', href: '#' },
  ],
}

const socialLinks = [
  { Icon: Twitter, label: 'Follow TalentBridge on Twitter', href: '#' },
  { Icon: Linkedin, label: 'Connect with TalentBridge on LinkedIn', href: '#' },
  { Icon: Github, label: 'TalentBridge on GitHub', href: '#' },
  { Icon: Mail, label: 'Email TalentBridge support', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-tl-border-subtle mt-20 bg-tl-bg-base" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="TalentBridge — go to homepage">
              <div
                className="w-8 h-8 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center"
                aria-hidden="true"
              >
                <Zap className="w-4 h-4 text-tl-gold" aria-hidden="true" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">
                TalentBridge
              </span>
            </Link>
            <p className="text-sm text-tl-text-secondary leading-relaxed mb-6 max-w-xs">
              The AI-powered talent platform that closes roles 3× faster with zero ghosting and real salary intelligence.
            </p>
            <div className="flex items-center gap-3" role="list" aria-label="Social media links">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  role="listitem"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-tl-bg-elevated border border-tl-border-subtle flex items-center justify-center text-tl-text-secondary hover:text-tl-gold hover:border-tl-gold/30 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tl-bg-base"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h2 className="text-xs font-semibold text-tl-text-primary uppercase tracking-wider mb-4">{category}</h2>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-tl-text-secondary hover:text-tl-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold focus-visible:rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {category === 'Legal' && (
                  <li>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
                      className="text-sm text-tl-text-secondary hover:text-tl-gold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tl-gold focus-visible:rounded cursor-pointer bg-transparent border-0 p-0 font-inherit text-left"
                    >
                      Cookie Settings
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-tl-border-subtle">
          <p className="text-sm text-tl-text-secondary">
            © {new Date().getFullYear()} TalentBridge, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2" aria-live="polite" aria-label="System status">
              <div className="w-2 h-2 rounded-full bg-tl-teal animate-pulse" aria-hidden="true" />
              <span className="text-xs text-tl-text-secondary">All systems operational</span>
            </div>
            <span className="text-tl-border-subtle text-xs">·</span>
            <span className="text-xs font-mono text-tl-text-secondary">v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
