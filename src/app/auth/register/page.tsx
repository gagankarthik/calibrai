'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, User, ArrowRight, ChevronLeft,
  Mail, Lock, UserCircle, Eye, EyeOff, Sparkles, Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { TBLogo } from '@/components/landing/landing-logo'

type Role = 'company' | 'talent'

// ─── Password strength ────────────────────────────────────────────────────────

function getPasswordStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500']
const STRENGTH_TEXT   = ['', 'text-rose-400', 'text-amber-400', 'text-emerald-400', 'text-indigo-400']

// ─── Step dots ────────────────────────────────────────────────────────────────

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {([1, 2] as const).map((n) => (
        <span key={n} className={cn(
          'rounded-full transition-all duration-300',
          current === n  ? 'w-6 h-2 bg-indigo-500'
          : current > n  ? 'w-2 h-2 bg-indigo-500/50'
          :                'w-2 h-2 bg-white/10',
        )} />
      ))}
    </div>
  )
}

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1a1035 100%)' }}>
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      <Link href="/" className="relative z-10 flex items-center gap-2.5">
        <div className="w-8 h-8 flex items-center justify-center">
          <TBLogo />
        </div>
        <span className="text-white font-bold text-[15px] tracking-tight">TalentBridge</span>
      </Link>

      <div className="relative z-10 space-y-8">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
            Join 200+ companies
          </span>
          <h2 className="text-[34px] font-bold text-white leading-[1.15] tracking-tight">
            Build your dream<br />
            <span className="text-indigo-300">team today.</span>
          </h2>
          <p className="text-indigo-200/70 text-sm">Free 14-day trial. No credit card required.</p>
        </div>

        <div className="space-y-3.5">
          {[
            '94% AI match accuracy — stop wading through noise',
            'Reduce time-to-hire from 52 days to 18 days',
            '$48k average saved per successful hire',
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              <p className="text-sm text-indigo-200/70 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-[11px] text-indigo-300/50 uppercase tracking-widest font-semibold mb-3">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap gap-2">
            {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((co) => (
              <span key={co} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-indigo-200/60 font-medium">
                {co}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep]               = useState<1 | 2>(1)
  const [role, setRole]               = useState<Role>('company')
  const [fullName, setFullName]       = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed]           = useState(false)
  const [isLoading, setIsLoading]     = useState(false)

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { toast.error('Please accept the Privacy Policy and Terms of Service.'); return }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role, companyName: role === 'company' ? companyName : undefined }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Registration failed')
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&role=${role}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = "w-full bg-tl-bg-elevated border border-white/[0.08] text-primary placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"

  return (
    <div className="min-h-screen flex bg-tl-bg-base">
      <LeftPanel />

      {/* Right panel */}
      <div className="w-full lg:w-[54%] flex items-center justify-center p-6 lg:p-12 bg-tl-bg-base">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-7 h-7 flex items-center justify-center">
              <TBLogo />
            </div>
            <span className="text-white font-bold text-[15px]">TalentBridge</span>
          </Link>

          <StepDots current={step} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.26 }}
                className="space-y-6">
                <div className="text-center">
                  <h1 className="text-[26px] font-bold text-primary tracking-tight">Create your account</h1>
                  <p className="text-slate-400 text-sm mt-1">Who are you joining as?</p>
                </div>

                <div className="space-y-3">
                  {([
                    { id: 'company' as Role, icon: Building2, label: "I'm a Company",    desc: 'Post jobs, manage candidates, and find top talent with AI-powered matching.'},
                    { id: 'talent'  as Role, icon: User,      label: "I'm a Job Seeker", desc: 'Find roles that match your skills and salary expectations — automatically.' },
                  ]).map((r) => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className={cn(
                        'relative w-full flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200',
                        role === r.id
                          ? 'border-indigo-500/60 bg-indigo-500/[0.07] shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/[0.04]',
                      )}>
                     
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                        role === r.id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-white/[0.04] border border-white/[0.07]',
                      )}>
                        <r.icon className={cn('w-5 h-5', role === r.id ? 'text-indigo-400' : 'text-slate-500')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[14px] font-semibold', role === r.id ? 'text-primary' : 'text-slate-400')}>
                          {r.label}
                        </p>
                        <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                        role === r.id ? 'border-indigo-500 bg-indigo-500' : 'border-white/[0.15]',
                      )}>
                        {role === r.id && <div className="w-2 h-2 rounded-full bg-tl-bg-base" />}
                      </div>
                    </button>
                  ))}
                </div>

                <button type="button" onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.26 }}
                className="space-y-6">

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="p-2 rounded-xl border border-white/[0.08] text-slate-500 hover:text-white hover:border-white/[0.15] transition-all"
                    aria-label="Back">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-[22px] font-bold text-primary tracking-tight">Your details</h1>
                    <p className="text-slate-400 text-[13px]">
                      {role === 'company' ? 'Company account' : 'Job seeker account'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-300" htmlFor="fullName">Full name</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Smith" className={cn(inputCls, 'pl-10')} />
                    </div>
                  </div>

                  {/* Company name — only for company accounts */}
                  {role === 'company' && (
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-slate-300" htmlFor="companyName">Company name</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input id="companyName" type="text" required={role === 'company'} value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Corp" className={cn(inputCls, 'pl-10')} />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-300" htmlFor="regEmail">
                      {role === 'company' ? 'Work email' : 'Email address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input id="regEmail" type="email" required autoComplete="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={role === 'company' ? 'you@company.com' : 'you@email.com'}
                        className={cn(inputCls, 'pl-10')} />
                    </div>
                  </div>

                  {/* Password + strength */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-slate-300" htmlFor="regPassword">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input id="regPassword" type={showPassword ? 'text' : 'password'} required minLength={8}
                        autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters" className={cn(inputCls, 'pl-10 pr-11')} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((bar) => (
                            <div key={bar} className={cn(
                              'h-1.5 flex-1 rounded-full transition-all duration-300',
                              strength >= bar ? STRENGTH_COLORS[strength] : 'bg-white/[0.06]',
                            )} />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Strength: <span className={cn('font-medium', STRENGTH_TEXT[strength])}>{STRENGTH_LABELS[strength]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* GDPR consent */}
                  <div className="flex items-start gap-3 pt-1">
                    <input type="checkbox" id="gdpr-consent" required
                      className="mt-0.5 w-4 h-4 accent-indigo-600 shrink-0 cursor-pointer rounded"
                      checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <label htmlFor="gdpr-consent" className="text-[12px] text-slate-500 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link href="/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
                      {' '}and{' '}
                      <Link href="/terms" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>
                      , and consent to the processing of my personal data.
                    </label>
                  </div>

                  <button type="submit" disabled={isLoading || !agreed}
                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20">
                    {isLoading
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</>
                      : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <p className="text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Sign in</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
