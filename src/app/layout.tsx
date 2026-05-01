import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { CookieConsent } from '@/components/shared/cookie-consent'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://calibr.io'),
  title: {
    default: 'Calibr — AI-Powered Talent Acquisition Platform',
    template: '%s | Calibr',
  },
  description:
    'Bridge the gap between exceptional companies and world-class candidates. AI-powered matching, zero ghosting, real salary data.',
  keywords: ['recruiting', 'talent acquisition', 'AI matching', 'job search', 'hiring platform'],
  authors: [{ name: 'Calibr' }],
  creator: 'Calibr',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Calibr — AI-Powered Talent Acquisition',
    description: 'Where exceptional companies meet world-class candidates.',
    siteName: 'Calibr',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calibr',
    description: 'AI-powered talent acquisition that actually works.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}})()` }} />
        {/* Skip to main content — ADA / WCAG 2.1 SC 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-medium focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'hsl(222 47% 9%)',
              border: '1px solid hsl(222 47% 16%)',
              color: 'hsl(213 31% 91%)',
            },
          }}
        />
        <CookieConsent />
      </body>
    </html>
  )
}
