'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'company' | 'talent'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role>('company')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push(selectedRole === 'company' ? '/company/dashboard' : '/talent/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-tl-bg-base">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-tl-bg-surface">
        {/* Decorative gold radial glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-tl-gold/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-tl-teal/4 blur-3xl pointer-events-none" />
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tl-gold/40 to-transparent" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
          <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
        </Link>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="section-eyebrow">AI-Powered Hiring Platform</span>
            <h2 className="font-display text-4xl font-bold text-tl-text-primary leading-tight">
              Your next great<br />
              <span className="gradient-text">hire starts here.</span>
            </h2>
            <p className="text-tl-text-secondary text-sm leading-relaxed max-w-xs">
              200+ companies · 50k+ profiles · 94% match accuracy
            </p>
          </div>

          {/* Testimonial card */}
          <div className="tl-card-elevated p-6 border-l-2 border-tl-gold">
            <blockquote className="text-base font-light text-tl-text-primary leading-relaxed mb-4">
              &ldquo;TalentLoop cut our time-to-hire from 52 days to{' '}
              <span className="font-semibold text-tl-gold">18 days</span>. The AI
              matching is uncanny.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tl-gold to-tl-gold-light flex items-center justify-center text-xs font-bold text-tl-bg-base shadow-gold">
                SM
              </div>
              <div>
                <p className="text-sm font-semibold text-tl-text-primary">Sarah Mitchell</p>
                <p className="text-xs text-tl-text-secondary">VP of Engineering, Airtable</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Faster Hiring', value: '65%' },
              { label: 'Offer Accept Rate', value: '89%' },
              { label: 'Match Accuracy', value: '94%' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-tl-border-default bg-tl-bg-elevated p-4 text-center"
              >
                <div className="font-mono text-2xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs text-tl-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Floating metric pills */}
          <div className="relative h-20 pointer-events-none select-none">
            <div
              className="absolute left-0 top-0 px-3 py-2 rounded-xl border border-tl-border-default bg-tl-bg-elevated/80 backdrop-blur-sm text-xs text-tl-text-secondary shadow-card"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <span className="text-tl-teal font-semibold">↑ 32%</span> pipeline velocity
            </div>
            <div
              className="absolute right-0 top-2 px-3 py-2 rounded-xl border border-tl-border-default bg-tl-bg-elevated/80 backdrop-blur-sm text-xs text-tl-text-secondary shadow-card"
              style={{ transform: 'rotate(1.5deg)' }}
            >
              <span className="text-tl-gold font-mono font-semibold">94</span> match score
            </div>
            <div
              className="absolute left-1/4 bottom-0 px-3 py-2 rounded-xl border border-tl-border-default bg-tl-bg-elevated/80 backdrop-blur-sm text-xs text-tl-text-secondary shadow-card"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <TrendingUp className="inline w-3 h-3 text-tl-teal mr-1" />
              <span className="text-tl-text-primary font-semibold">12</span> new candidates today
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-tl-bg-surface lg:bg-[#111318]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-7"
        >
          {/* Mobile-only logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tl-gold shadow-gold block flex-shrink-0" aria-hidden="true" />
            <span className="font-display font-bold text-xl gradient-text">TalentLoop</span>
          </Link>

          <div>
            <h1 className="font-display text-2xl font-bold text-tl-text-primary">Welcome back</h1>
            <p className="text-tl-text-secondary text-sm mt-1">Sign in to your account to continue</p>
          </div>

          {/* Role selector */}
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
                desc: 'Find your next role',
              },
            ]).map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  'flex-1 flex flex-col items-start gap-1 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                  selectedRole === role.id
                    ? 'border-tl-gold bg-tl-gold/5 shadow-gold'
                    : 'border-tl-border-default bg-tl-bg-elevated hover:border-tl-border-gold'
                )}
              >
                <role.icon
                  className={cn(
                    'w-4 h-4 mb-0.5 transition-colors',
                    selectedRole === role.id ? 'text-tl-gold' : 'text-tl-text-secondary'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    selectedRole === role.id ? 'text-tl-text-primary' : 'text-tl-text-secondary'
                  )}
                >
                  {role.label}
                </span>
                <span className="text-xs text-tl-text-secondary">{role.desc}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tl-text-primary" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'company' ? 'you@company.com' : 'you@email.com'}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-tl-text-primary" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs text-tl-gold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tl-text-secondary" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-gold w-full flex items-center justify-center gap-2 h-11 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-tl-bg-base/30 border-t-tl-bg-base animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-tl-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-tl-gold hover:underline font-medium"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
