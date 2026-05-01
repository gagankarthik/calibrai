'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-red-500/8 blur-[100px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-orange-500/8 blur-[80px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        className="relative z-10 text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
        >
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </motion.div>

        {/* Eyebrow */}
        <div className="section-eyebrow mb-4 inline-flex border-red-500/20 text-red-400">
          Unexpected Error
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Something went wrong
        </h1>

        {/* Friendly message */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Our team has been notified. This usually fixes itself — try again in a moment.
        </p>

        {/* Error message code block */}
        {error?.message && (
          <div className="mb-8 text-left rounded-xl bg-red-500/5 border border-red-500/20 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-500/10 bg-red-500/5">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground ml-1">error.message</span>
            </div>
            <pre className="px-4 py-3 text-xs text-red-300 font-mono overflow-x-auto whitespace-pre-wrap break-words">
              {error.message}
            </pre>
            {error.digest && (
              <div className="px-4 py-2 border-t border-red-500/10">
                <span className="text-[10px] font-mono text-muted-foreground">
                  digest: {error.digest}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            size="lg"
            className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
