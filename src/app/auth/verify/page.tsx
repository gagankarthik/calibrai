'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Mail, ArrowRight, Sparkles, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TBLogo } from '@/components/landing/landing-logo'

const RESEND_DELAY = 60

// ─── Progress steps ───────────────────────────────────────────────────────────

function ProgressSteps({ verified }: { verified: boolean }) {
  const steps = [
    { label: 'Account created', done: true,    active: false },
    { label: 'Verify email',    done: verified, active: !verified },
    { label: 'Set up profile',  done: false,    active: false },
  ]
  return (
    <div className="flex items-start justify-center gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start">
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300',
              step.done   ? 'bg-indigo-600 border-indigo-600 text-white'
              : step.active ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
              :               'bg-white/[0.04] border-white/[0.1] text-slate-600',
            )}>
              {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={cn(
              'text-[11px] whitespace-nowrap font-medium',
              step.active ? 'text-indigo-400' : step.done ? 'text-slate-400' : 'text-slate-600',
            )}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('w-16 h-0.5 mx-1 mt-4 rounded-full', step.done ? 'bg-indigo-600/50' : 'bg-white/[0.07]')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  value: string[]
  onChange: (v: string[]) => void
  disabled?: boolean
  error?: boolean
}

function OtpInput({ value: otp, onChange: setOtp, disabled, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handle = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = Array(6).fill('')
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? ''
    setOtp(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2.5 justify-center" role="group" aria-label="Verification code">
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text" inputMode="numeric" maxLength={1}
          value={digit} disabled={disabled}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          aria-label={`Code digit ${i + 1}`}
          className={cn(
            'w-11 h-14 rounded-xl border text-center text-xl font-mono font-bold transition-all duration-200',
            'bg-tl-bg-elevated text-primary outline-none disabled:opacity-40 disabled:cursor-not-allowed',
            error       ? 'border-rose-500/60 text-rose-400 animate-[shake_0.3s_ease]'
            : digit     ? 'border-indigo-500/60 text-indigo-300 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
            :             'border-white/[0.08] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15',
          )}
        />
      ))}
    </div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get('email') ?? 'your@email.com'
  const role  = (searchParams.get('role') ?? 'company') as 'company' | 'talent'

  const [otp, setOtp]           = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [verified, setVerified]   = useState(false)
  const [otpError, setOtpError]   = useState(false)
  const [countdown, setCountdown] = useState(RESEND_DELAY)
  const [canResend, setCanResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Enter all 6 digits.'); return }
    setIsLoading(true)
    setOtpError(false)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, role }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setOtpError(true)
        setOtp(Array(6).fill(''))
        throw new Error(data.error ?? 'Verification failed')
      }
      setVerified(true)
      toast.success('Email verified!')
      setTimeout(() => {
        // Redirect to login — verification doesn't create a session.
        // Pass email so the field pre-fills, and redirect so they land in the right place.
        const dest = role === 'company' ? '/onboarding/company' : '/talent/dashboard'
        router.push(
          `/auth/login?role=${role}&email=${encodeURIComponent(email)}&verified=1&redirect=${encodeURIComponent(dest)}`
        )
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResendLoading(true)
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, resend: true }),
      })
      toast.success('New code sent! Check your inbox.')
      setCanResend(false)
      setCountdown(RESEND_DELAY)
      setOtp(Array(6).fill(''))
      setOtpError(false)
    } catch {
      toast.error('Failed to resend code.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tl-bg-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 relative z-10">
        <div className="w-8 h-8 flex items-center justify-center">
          <TBLogo />
        </div>
        <span className="text-primary font-bold text-[15px] tracking-tight">TalentBridge</span>
      </Link>

      {/* Progress steps */}
      <div className="mb-8 relative z-10">
        <ProgressSteps verified={verified} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="w-full max-w-md relative z-10 bg-[#13151c] border border-white/[0.06] rounded-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!verified ? (
            <motion.div key="unverified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8 sm:p-10 space-y-7">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl scale-150" />
                  <div className="relative w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-indigo-400" />
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div className="text-center space-y-2">
                <h1 className="text-[24px] font-bold text-white tracking-tight">Check your inbox</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We sent a 6-digit verification code to{' '}
                  <span className="text-white font-medium">{email}</span>
                </p>
                <p className="text-xs text-slate-600">This code expires in 10 minutes.</p>
              </div>

              {/* OTP */}
              <form onSubmit={handleVerify} className="space-y-6">
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(false) }} disabled={isLoading} error={otpError} />

                <button type="submit" disabled={isLoading || otp.join('').length < 6}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                  {isLoading
                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Verifying…</>
                    : <>Verify Email <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              {/* Resend */}
              <div className="text-center">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={resendLoading}
                    className="inline-flex items-center gap-1.5 text-[13px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend code
                  </button>
                ) : (
                  <p className="text-[13px] text-slate-600">
                    Resend code in{' '}
                    <span className="text-slate-400 font-mono font-medium">{countdown}s</span>
                  </p>
                )}
              </div>

              <p className="text-center text-[12px] text-slate-600">
                Wrong email?{' '}
                <Link href="/auth/register" className="text-indigo-400 hover:underline">Go back</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="verified" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="p-8 sm:p-10 text-center space-y-5">
              {/* Animated checkmark */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </motion.div>
              </div>
              <div className="space-y-2">
                <h2 className="text-[22px] font-bold text-white">Email verified!</h2>
                <p className="text-slate-400 text-sm">Redirecting you to onboarding…</p>
              </div>
              <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tl-bg-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
