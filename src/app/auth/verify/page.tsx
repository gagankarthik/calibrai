'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const RESEND_DELAY = 60

/* ── Animated Gold Checkmark SVG ── */

function GoldCheckmark() {
  return (
    <div className="relative mx-auto w-24 h-24">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-tl-gold/20 blur-xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1.3 }}
        transition={{ duration: 1, delay: 0.4 }}
      />
      {/* Circle background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-tl-gold/10 border border-tl-gold/30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'backOut' }}
      />
      {/* SVG draw animation */}
      <svg
        viewBox="0 0 96 96"
        fill="none"
        className="relative z-10 w-full h-full"
        aria-hidden="true"
      >
        <motion.circle
          cx="48"
          cy="48"
          r="42"
          stroke="#C9A84C"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.path
          d="M30 48l12 12 24-24"
          stroke="#C9A84C"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.85 }}
        />
      </svg>
    </div>
  )
}

/* ── 3-step progress ── */

function ProgressSteps({ done }: { done: boolean }) {
  const steps = [
    { label: 'Account created', state: 'done' as const },
    { label: 'Verify email', state: 'active' as const },
    { label: 'Set up profile', state: 'upcoming' as const },
  ]

  return (
    <div className="flex items-start justify-center gap-0" aria-label="Registration progress">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                step.state === 'done'
                  ? 'bg-tl-gold border-tl-gold text-tl-bg-base'
                  : step.state === 'active'
                  ? 'bg-tl-gold/10 border-tl-gold text-tl-gold'
                  : 'bg-tl-bg-elevated border-tl-border-default text-tl-text-secondary'
              )}
            >
              {step.state === 'done' ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span
              className={cn(
                'text-xs whitespace-nowrap font-medium',
                step.state === 'active'
                  ? 'text-tl-gold'
                  : step.state === 'done'
                  ? 'text-tl-text-secondary'
                  : 'text-tl-text-muted'
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'w-16 h-0.5 mx-1 mt-4 rounded-full',
                step.state === 'done' ? 'bg-tl-gold/50' : 'bg-tl-border-default'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── OTP Input ── */

function OtpInput() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...otp]
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? ''
    }
    setOtp(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2.5 justify-center" role="group" aria-label="One-time password input">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${i + 1}`}
          className={cn(
            'w-11 h-14 rounded-xl border text-center text-xl font-mono font-bold transition-all duration-200 bg-tl-bg-elevated text-tl-text-primary outline-none',
            digit
              ? 'border-tl-gold shadow-gold text-tl-gold'
              : 'border-tl-border-default focus:border-tl-gold focus:shadow-gold'
          )}
        />
      ))}
    </div>
  )
}

/* ── Main verify content ── */

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

  const onboardingPath = role === 'company' ? '/onboarding/company' : '/onboarding/talent'

  return (
    <div className="min-h-screen bg-tl-bg-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-tl-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-tl-teal/4 rounded-full blur-3xl pointer-events-none" />
      {/* Horizontal gold line accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tl-gold/30 to-transparent" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 relative z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
        <span className="font-display font-bold text-xl gradient-text">TalentBridge</span>
      </Link>

      {/* Progress steps above card */}
      <div className="mb-8 relative z-10">
        <ProgressSteps done={false} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="tl-card w-full max-w-md mx-auto relative z-10"
      >
        <div className="p-10 text-center space-y-7">
          {/* Animated gold checkmark */}
          <GoldCheckmark />

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-tl-text-primary">
              Check your inbox
            </h1>
            <p className="text-tl-text-secondary text-sm leading-relaxed">
              We sent a 6-digit code to{' '}
              <span className="text-tl-text-primary font-medium">{email}</span>
            </p>
            <p className="text-xs text-tl-text-muted">
              This code expires in 10 minutes.
            </p>
          </div>

          {/* OTP boxes */}
          <OtpInput />

          {/* Resend */}
          <div>
            {resent ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-sm text-tl-teal font-medium"
              >
                <Check className="w-4 h-4" />
                Sent! Check your inbox.
              </motion.p>
            ) : (
              <p className="text-sm text-tl-text-secondary">
                Didn&apos;t receive it?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className={cn(
                    'font-medium transition-colors',
                    canResend
                      ? 'text-tl-gold hover:underline cursor-pointer'
                      : 'text-tl-text-muted cursor-not-allowed'
                  )}
                >
                  Resend code{!canResend && ` (${countdown}s)`}
                </button>
              </p>
            )}
          </div>

          {/* Continue CTA */}
          <button
            type="button"
            onClick={() => router.push(onboardingPath)}
            className="btn-gold w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold"
          >
            Continue to Onboarding →
          </button>

          <p className="text-xs text-tl-text-secondary">
            Wrong email?{' '}
            <Link href="/auth/register" className="text-tl-gold hover:underline">
              Go back
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Page (with Suspense for useSearchParams) ── */

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-tl-bg-base flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-tl-gold/30 border-t-tl-gold animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
