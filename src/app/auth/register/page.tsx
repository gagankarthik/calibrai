'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Building2,
  User,
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  UserCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'company' | 'talent'

function getPasswordStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

function strengthBarColor(strength: number, bar: number): string {
  if (strength < bar) return 'bg-tl-bg-elevated'
  if (strength === 1) return 'bg-tl-rose'
  if (strength === 2) return 'bg-amber-500'
  if (strength === 3) return 'bg-tl-teal'
  return 'bg-tl-gold'
}

function strengthLabelColor(strength: number): string {
  if (strength === 1) return 'text-tl-rose'
  if (strength === 2) return 'text-amber-500'
  if (strength === 3) return 'text-tl-teal'
  if (strength === 4) return 'text-tl-gold'
  return ''
}

/* ── Step dots ── */

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6" aria-label="Registration progress">
      {([1, 2] as const).map((n) => (
        <span
          key={n}
          className={cn(
            'rounded-full transition-all duration-300',
            current === n
              ? 'w-6 h-2 bg-tl-gold shadow-gold'
              : current > n
              ? 'w-2 h-2 bg-tl-gold/50'
              : 'w-2 h-2 bg-tl-border-default'
          )}
          aria-label={`Step ${n}${current === n ? ' (current)' : ''}`}
        />
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<Role>('company')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    const dest =
      selectedRole === 'company'
        ? `/auth/verify?email=${encodeURIComponent(email)}&role=company`
        : `/auth/verify?email=${encodeURIComponent(email)}&role=talent`
    router.push(dest)
  }

  return (
    <div className="min-h-screen flex bg-tl-bg-base">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-tl-bg-surface">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-tl-gold/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-tl-teal/4 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tl-gold/40 to-transparent" />

        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
          <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="section-eyebrow">Join 200+ companies</span>
            <h2 className="font-display text-4xl font-bold text-tl-text-primary leading-tight">
              Build your dream<br />
              <span className="gradient-text">team today.</span>
            </h2>
            <p className="text-tl-text-secondary text-sm leading-relaxed max-w-xs">
              Free 14-day trial. No credit card required.
            </p>
          </div>

          {/* Value props */}
          <div className="space-y-3">
            {[
              { icon: '✦', text: '94% AI match accuracy — stop wading through noise' },
              { icon: '✦', text: 'Reduce time-to-hire from 52 days to 18 days' },
              { icon: '✦', text: '$48k average saved per successful hire' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-tl-gold text-xs mt-0.5 flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-tl-text-secondary leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Trust logos */}
          <div className="tl-card-elevated p-5">
            <p className="text-xs text-tl-text-secondary mb-3 uppercase tracking-widest font-semibold">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap gap-2">
              {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma'].map((co) => (
                <span
                  key={co}
                  className="px-3 py-1.5 rounded-full bg-tl-bg-base border border-tl-border-default text-xs text-tl-text-secondary font-medium"
                >
                  {co}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-tl-bg-surface lg:bg-[#111318]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
            <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
          </Link>

          {/* Step dots */}
          <StepDots current={step} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h1 className="font-display text-2xl font-bold text-tl-text-primary">
                    Create your account
                  </h1>
                  <p className="text-sm text-tl-text-secondary mt-1">
                    Who are you joining as?
                  </p>
                </div>

                {/* Role cards — large illustrated */}
                <div className="grid grid-cols-1 gap-4">
                  {([
                    {
                      id: 'company' as const,
                      icon: Building2,
                      label: 'I&apos;m a Company',
                      desc: 'Post jobs, manage candidates, and find top talent with AI-powered matching.',
                      badge: 'Most popular',
                    },
                    {
                      id: 'talent' as const,
                      icon: User,
                      label: 'I&apos;m a Job Seeker',
                      desc: 'Find roles that match your skills and salary expectations — automatically.',
                      badge: null,
                    },
                  ]).map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        'relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200',
                        selectedRole === role.id
                          ? 'border-tl-gold bg-tl-gold/5 shadow-gold'
                          : 'border-tl-border-default bg-tl-bg-elevated hover:border-tl-border-gold'
                      )}
                    >
                      {role.badge && (
                        <span className="absolute top-3 right-3 text-xs font-semibold text-tl-gold border border-tl-gold/30 bg-tl-gold/10 px-2 py-0.5 rounded-full">
                          {role.badge}
                        </span>
                      )}
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                          selectedRole === role.id
                            ? 'bg-tl-gold/15 border border-tl-gold/30'
                            : 'bg-tl-bg-base border border-tl-border-default'
                        )}
                      >
                        <role.icon
                          className={cn(
                            'w-5 h-5 transition-colors',
                            selectedRole === role.id ? 'text-tl-gold' : 'text-tl-text-secondary'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-base font-semibold transition-colors',
                            selectedRole === role.id ? 'text-tl-text-primary' : 'text-tl-text-secondary'
                          )}
                          dangerouslySetInnerHTML={{ __html: role.label }}
                        />
                        <p className="text-sm text-tl-text-secondary mt-1 leading-relaxed">
                          {role.desc}
                        </p>
                      </div>
                      {/* Selected indicator */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                          selectedRole === role.id
                            ? 'border-tl-gold bg-tl-gold'
                            : 'border-tl-border-default'
                        )}
                      >
                        {selectedRole === role.id && (
                          <div className="w-2 h-2 rounded-full bg-tl-bg-base" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-gold w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-sm text-tl-text-secondary">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-tl-gold hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>

            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="p-2 rounded-xl border border-tl-border-default text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-border-gold transition-all"
                    aria-label="Back to role selection"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-tl-text-primary">
                      Your details
                    </h1>
                    <p className="text-sm text-tl-text-secondary">
                      {selectedRole === 'company' ? 'Company account' : 'Job seeker account'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-tl-text-primary" htmlFor="fullName">
                      Full name
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Smith"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-tl-text-primary" htmlFor="regEmail">
                      {selectedRole === 'company' ? 'Work email' : 'Email address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                      <input
                        id="regEmail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={selectedRole === 'company' ? 'you@company.com' : 'you@email.com'}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  {/* Password + strength meter */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-tl-text-primary" htmlFor="regPassword">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                      <input
                        id="regPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="input-field pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tl-text-secondary hover:text-tl-text-primary transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* 4-bar strength meter */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((bar) => (
                            <div
                              key={bar}
                              className={cn(
                                'h-1.5 flex-1 rounded-full transition-all duration-300',
                                strengthBarColor(strength, bar)
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-tl-text-secondary">
                          Password strength:{' '}
                          <span className={cn('font-medium', strengthLabelColor(strength))}>
                            {strengthLabels[strength]}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms checkbox */}
                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(!!v)}
                      className="mt-0.5 border-tl-border-default data-[state=checked]:bg-tl-gold data-[state=checked]:border-tl-gold"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-tl-text-secondary leading-relaxed cursor-pointer"
                    >
                      I agree to TalentLoop&apos;s{' '}
                      <Link href="#" className="text-tl-gold hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" className="text-tl-gold hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !agreed}
                    className="btn-gold w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-tl-bg-base/30 border-t-tl-bg-base animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-tl-text-secondary">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-tl-gold hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
