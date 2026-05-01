'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Zap,
  Building2,
  User,
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  UserCircle,
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
const strengthColors = [
  '',
  'bg-red-500',
  'bg-amber-500',
  'bg-yellow-400',
  'bg-emerald-500',
]

export default function RegisterPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<Role>('company')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Calibr<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="glass-card p-8 space-y-7">
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
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Free 14-day trial. No credit card required.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">I am a…</p>
                  <div className="flex gap-3">
                    {([
                      {
                        id: 'company' as const,
                        icon: Building2,
                        label: "I'm a Company",
                        desc: 'Post jobs & manage hiring',
                      },
                      {
                        id: 'talent' as const,
                        icon: User,
                        label: "I'm a Job Seeker",
                        desc: 'Find my next role',
                      },
                    ]).map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          'flex-1 flex flex-col items-start gap-1 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                          selectedRole === role.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:border-primary/40'
                        )}
                      >
                        <role.icon
                          className={cn(
                            'w-4 h-4 mb-0.5 transition-colors',
                            selectedRole === role.id
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            selectedRole === role.id
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {role.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{role.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full h-11"
                  size="lg"
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline font-medium"
                  >
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedRole === 'company' ? 'Company account' : 'Job seeker account'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="fullName">
                      Full name
                    </label>
                    <div className="relative">
                      <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Work email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="regEmail">
                      Work email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="regEmail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password + strength */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="regPassword">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        id="regPassword"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                    </div>

                    {/* Strength bars */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-1 flex-1 rounded-full transition-all duration-300',
                                strength >= i
                                  ? strengthColors[strength]
                                  : 'bg-muted'
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Password strength:{' '}
                          <span
                            className={cn(
                              'font-medium',
                              strength === 1 && 'text-red-500',
                              strength === 2 && 'text-amber-500',
                              strength === 3 && 'text-yellow-400',
                              strength === 4 && 'text-emerald-500'
                            )}
                          >
                            {strengthLabels[strength]}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(!!v)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      I agree to Calibr&apos;s{' '}
                      <Link href="#" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11"
                    size="lg"
                    disabled={isLoading || !agreed}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account — Free <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline font-medium"
                  >
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
