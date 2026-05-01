'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard, Briefcase, DollarSign, LifeBuoy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/navbar'

const quickLinks = [
  { label: 'Company Dashboard', href: '/company/dashboard', icon: LayoutDashboard },
  { label: 'Browse Jobs', href: '/talent/jobs', icon: Briefcase },
  { label: 'Pricing', href: '/pricing', icon: DollarSign },
  { label: 'Contact Support', href: '/contact', icon: LifeBuoy },
]

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Background orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-cyan-500/8 blur-[80px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Giant 404 background text */}
        <div className="absolute select-none pointer-events-none">
          <span className="text-[200px] md:text-[300px] font-black text-foreground opacity-[0.04] leading-none">
            404
          </span>
        </div>

        {/* Foreground content */}
        <motion.div
          className="relative z-10 text-center max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <div className="section-eyebrow mb-6 inline-flex">
            Error 404
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Page{' '}
            <span className="gradient-text">not found</span>
          </h1>

          {/* Subtext */}
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            The page you&apos;re looking for has moved, been removed, or never existed.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
            >
              <Link href="/company/dashboard">Go to Dashboard</Link>
            </Button>
          </div>

          {/* Quick links */}
          <div className="border-t border-border pt-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Quick links
            </p>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl glass-card hover:bg-white/[0.06] transition-all duration-200 group text-left"
                  >
                    <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors shrink-0" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
