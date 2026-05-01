import Link from 'next/link'
import { Zap, Twitter, Linkedin, Github, Mail } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'For Companies', href: '/#companies' },
    { label: 'For Job Seekers', href: '/#seekers' },
    { label: 'AI Matching Engine', href: '/#companies' },
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
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

const socialLinks = [
  { Icon: Twitter, label: 'Follow Calibr on Twitter', href: '#' },
  { Icon: Linkedin, label: 'Connect with Calibr on LinkedIn', href: '#' },
  { Icon: Github, label: 'Calibr on GitHub', href: '#' },
  { Icon: Mail, label: 'Email Calibr support', href: '/contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-border mt-20" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="Calibr — go to homepage">
              <div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                aria-hidden="true"
              >
                <Zap className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Calibr<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              The AI-powered talent platform that bridges the gap between exceptional companies and world-class candidates.
            </p>
            <div className="flex items-center gap-3" role="list" aria-label="Social media links">
              {socialLinks.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  role="listitem"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h2 className="text-sm font-semibold text-foreground mb-4">{category}</h2>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Calibr, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 mt-4 md:mt-0" aria-live="polite" aria-label="System status">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
