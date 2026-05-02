import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { CookieConsent } from '@/components/shared/cookie-consent'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://talentbridge.io'),
  title: {
    default: 'TalentBridge — AI-Powered Talent Acquisition Platform',
    template: '%s | TalentBridge',
  },
  description:
    'Close roles 3× faster with AI matching, zero ghosting, and real salary intelligence. Where exceptional companies meet world-class talent.',
  keywords: ['recruiting', 'talent acquisition', 'AI matching', 'job search', 'hiring platform', 'ATS'],
  authors: [{ name: 'TalentBridge' }],
  creator: 'TalentBridge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'TalentBridge — AI-Powered Talent Acquisition',
    description: 'Where exceptional companies meet world-class candidates.',
    siteName: 'TalentBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentBridge',
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
      <body className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable} font-sans antialiased`}>
        {/* Skip to main content — WCAG 2.1 SC 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-medium focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          theme="light"
          richColors
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#111827',
            },
          }}
        />
        <CookieConsent />
      </body>
    </html>
  )
}
