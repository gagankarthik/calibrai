'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESEND_DELAY = 60

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get('email') ?? 'your@email.com'
  const role = (searchParams.get('role') ?? 'company') as 'company' | 'talent'

  const [countdown, setCountdown] = useState(RESEND_DELAY)
  const [canResend, setCanResend] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleResend = () => {
    if (!canResend) return
    setResent(true)
    setCanResend(false)
    setCountdown(RESEND_DELAY)
    setTimeout(() => setResent(false), 3000)
  }

  const onboardingPath =
    role === 'company' ? '/onboarding/company' : '/onboarding/talent'

  const steps = [
    { label: 'Create Account', done: true },
    { label: 'Verify Email', done: false, active: true },
    { label: 'Set Up Profile', done: false },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-foreground">
          Calibr<span className="gradient-text">AI</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-10 max-w-md w-full mx-auto text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut', delay: 0.1 }}
          className="mx-auto w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <Mail className="w-7 h-7 text-primary" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We sent a verification link to{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            This link expires in 24 hours.
          </p>
        </div>

        {/* Resend */}
        <div className="space-y-2">
          {resent ? (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-emerald-500 font-medium"
            >
              <Check className="w-4 h-4" />
              Sent! Check your inbox.
            </motion.p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive it?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className={cn(
                  'font-medium transition-colors',
                  canResend
                    ? 'text-primary hover:underline cursor-pointer'
                    : 'text-muted-foreground cursor-not-allowed'
                )}
              >
                Resend email{!canResend && ` (${countdown}s)`}
              </button>
            </p>
          )}
        </div>

        {/* Demo continue */}
        <Button
          className="w-full h-11"
          size="lg"
          onClick={() => router.push(onboardingPath)}
        >
          Continue to Onboarding →
        </Button>

        <p className="text-xs text-muted-foreground">
          Wrong email?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Go back
          </Link>
        </p>
      </motion.div>

      {/* Progress steps */}
      <div className="mt-8 flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  s.done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : s.active
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-muted border-border text-muted-foreground'
                )}
              >
                {s.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  s.active ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-[2px] mx-1 mb-5 rounded-full',
                  s.done ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
