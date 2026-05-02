'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, User, Eye, EyeOff, ArrowRight,
  Mail, Lock, TrendingUp, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signInCompany, signInTalent } from '@/lib/api'
import { toast } from 'sonner'

type Role = 'company' | 'talent'

// ─── Left branding panel ──────────────────────────────────────────────────────

function LeftPanel({ role }: { role: Role }) {
  return (
    <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1a1035 100%)' }}>
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_60%)]" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-indigo-300" />
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">TalentBridge</span>
      </Link>

      {/* Main copy */}
      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
            AI-Powered Hiring
          </span>
          <h2 className="text-[34px] font-bold text-white leading-[1.15] tracking-tight">
            {role === 'company'
              ? <>Your next great<br /><span className="text-indigo-300">hire starts here.</span></>
              : <>Your dream role<br /><span className="text-indigo-300">is waiting.</span></>}
          </h2>
          <p className="text-indigo-200/70 text-sm leading-relaxed max-w-xs">
            {role === 'company'
              ? '200+ companies · 50k+ profiles · 94% match accuracy'
              : '10k+ open roles · AI-matched to your skills · instant apply'}
          </p>
        </div>

        {/* Testimonial */}
        <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]">
          <blockquote className="text-[14px] text-white/80 leading-relaxed mb-4">
            &ldquo;TalentBridge cut our time-to-hire from 52 days to{' '}
            <span className="font-semibold text-indigo-300">18 days</span>. The AI matching is uncanny.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-200">
              SM
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">Sarah Mitchell</p>
              <p className="text-xs text-indigo-300/70">VP of Engineering, Airtable</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Faster Hiring', value: '65%' },
            { label: 'Accept Rate',   value: '89%' },
            { label: 'AI Accuracy',   value: '94%' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white/[0.05] border border-white/[0.07] p-3.5 text-center">
              <div className="text-[22px] font-bold text-white font-mono">{s.value}</div>
              <div className="text-[11px] text-indigo-300/70 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Floating pills */}
        <div className="relative h-16 pointer-events-none select-none">
          <div className="absolute left-0 top-0 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-white/80"
            style={{ transform: 'rotate(-1.5deg)' }}>
            <span className="text-emerald-400 font-semibold">↑ 32%</span> pipeline velocity
          </div>
          <div className="absolute right-0 top-1 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs text-white/80"
            style={{ transform: 'rotate(1.2deg)' }}>
            <TrendingUp className="inline w-3 h-3 text-indigo-400 mr-1" />
            <span className="font-mono font-semibold text-indigo-200">94</span> match score
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Role toggle ──────────────────────────────────────────────────────────────

function RoleSelector({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const roles: { id: Role; icon: typeof Building2; label: string; desc: string }[] = [
    { id: 'company', icon: Building2, label: "I'm a Company",    desc: 'Post jobs & manage hiring' },
    { id: 'talent',  icon: User,      label: "I'm a Job Seeker", desc: 'Find your next role'       },
  ]
  return (
    <div className="flex gap-2.5">
      {roles.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onChange(r.id)}
          className={cn(
            'flex-1 flex flex-col items-start gap-1 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
            value === r.id
              ? 'border-indigo-500/60 bg-indigo-500/[0.08] shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
              : 'border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]',
          )}
        >
          <r.icon className={cn('w-4 h-4 mb-0.5 transition-colors', value === r.id ? 'text-indigo-400' : 'text-slate-500')} />
          <span className={cn('text-[13px] font-semibold', value === r.id ? 'text-white' : 'text-slate-400')}>
            {r.label}
          </span>
          <span className="text-[11px] text-slate-500">{r.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [role, setRole] = useState<Role>(() =>
    (searchParams.get('role') as Role | null) === 'talent' ? 'talent' : 'company',
  )
  const [email, setEmail]               = useState(() => searchParams.get('email') ?? '')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [showForgot, setShowForgot]     = useState(false)
  const [forgotEmail, setForgotEmail]   = useState('')
  const [forgotSent, setForgotSent]     = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // Sync role from query param
  useEffect(() => {
    const qr = searchParams.get('role') as Role | null
    if (qr === 'company' || qr === 'talent') setRole(qr)
  }, [searchParams])

  // Show success banner when arriving from email verification
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Email verified! Please sign in to continue.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = role === 'company'
        ? await signInCompany(email, password)
        : await signInTalent(email, password)
      if (result.error) throw new Error(result.error)
      const redirect = searchParams.get('redirect')
      router.push(redirect ?? (role === 'company' ? '/company/dashboard' : '/talent/dashboard'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, role }),
      })
      setForgotSent(true)
    } catch {
      toast.error('Failed to send reset email. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-tl-bg-base">
      <LeftPanel role={role} />

      {/* Right panel */}
      <div className="w-full lg:w-[54%] flex items-center justify-center p-6 lg:p-12 bg-tl-bg-base">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="w-full max-w-[420px] space-y-7"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="text-white font-bold text-[15px]">TalentBridge</span>
          </Link>

          <AnimatePresence mode="wait">
            {!showForgot ? (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">
                <div>
                  <h1 className="text-[26px] font-bold text-white tracking-tight">Welcome back</h1>
                  <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
                </div>

                <RoleSelector value={role} onChange={setRole} />

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-300" htmlFor="email">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="email" type="email" required autoComplete="email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder={role === 'company' ? 'you@company.com' : 'you@email.com'}
                        className="w-full bg-tl-bg-elevated border border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-medium text-slate-300" htmlFor="password">Password</label>
                      <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true) }}
                        className="text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-tl-bg-elevated border border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                  >
                    {isLoading
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</>
                      : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="text-center text-[13px] text-slate-500">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Sign up free
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-7">
                <div>
                  <button type="button" onClick={() => { setShowForgot(false); setForgotSent(false) }}
                    className="text-[13px] text-slate-500 hover:text-slate-300 mb-4 flex items-center gap-1 transition-colors">
                    ← Back to sign in
                  </button>
                  <h1 className="text-[26px] font-bold text-white tracking-tight">Reset password</h1>
                  <p className="text-slate-400 text-sm mt-1">Enter your email and we'll send a reset code.</p>
                </div>

                {forgotSent ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-center space-y-2">
                    <p className="text-emerald-400 font-semibold text-sm">Check your inbox</p>
                    <p className="text-slate-400 text-xs">If an account exists for {forgotEmail}, a reset code has been sent.</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-300" htmlFor="forgot-email">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input id="forgot-email" type="email" required
                          value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full bg-tl-bg-elevated border border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                      {forgotLoading
                        ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending…</>
                        : 'Send reset code'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-tl-bg-base flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
