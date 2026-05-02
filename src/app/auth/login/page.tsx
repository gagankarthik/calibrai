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
import { signInCompany, signInTalent } from '@/lib/api'
import { toast } from 'sonner'

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
    try {
      if (selectedRole === 'company') {
        const result = await signInCompany(email, password)
        if (result.error) throw new Error(result.error)
        if (result.data?.token) {
          localStorage.setItem('tb-token', result.data.token)
          localStorage.setItem('tb-role', 'company')
        }
        router.push('/company/dashboard')
      } else {
        const result = await signInTalent(email, password)
        if (result.error) throw new Error(result.error)
        if (result.data?.token) {
          localStorage.setItem('tb-token', result.data.token)
          localStorage.setItem('tb-role', 'talent')
        }
        router.push('/talent/dashboard')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--tb-bg-base)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TB</span>
          </div>
          <span className="font-display font-bold text-xl text-white">TalentBridge</span>
        </Link>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-semibold tracking-wider uppercase">
              AI-Powered Hiring Platform
            </span>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Your next great<br />
              <span className="text-indigo-200">hire starts here.</span>
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
              200+ companies · 50k+ profiles · 94% match accuracy
            </p>
          </div>

          {/* Testimonial card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <blockquote className="text-base font-light text-white leading-relaxed mb-4">
              &ldquo;TalentBridge cut our time-to-hire from 52 days to{' '}
              <span className="font-semibold text-indigo-200">18 days</span>. The AI
              matching is uncanny.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                SM
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sarah Mitchell</p>
                <p className="text-xs text-indigo-200">VP of Engineering, Airtable</p>
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
                className="rounded-xl bg-white/10 border border-white/20 p-4 text-center backdrop-blur-sm"
              >
                <div className="font-mono text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-indigo-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Floating metric pills */}
          <div className="relative h-20 pointer-events-none select-none">
            <div
              className="absolute left-0 top-0 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white border border-white/20"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <span className="text-emerald-300 font-semibold">↑ 32%</span> pipeline velocity
            </div>
            <div
              className="absolute right-0 top-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white border border-white/20"
              style={{ transform: 'rotate(1.5deg)' }}
            >
              <span className="text-indigo-200 font-mono font-semibold">94</span> match score
            </div>
            <div
              className="absolute left-1/4 bottom-0 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-xs text-white border border-white/20"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <TrendingUp className="inline w-3 h-3 text-emerald-300 mr-1" />
              <span className="font-semibold">12</span> new candidates today
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-7"
        >
          {/* Mobile-only logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TB</span>
            </div>
            <span className="font-display font-bold text-xl text-gray-900">TalentBridge</span>
          </Link>

          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
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
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                    : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50'
                )}
              >
                <role.icon
                  className={cn(
                    'w-4 h-4 mb-0.5 transition-colors',
                    selectedRole === role.id ? 'text-indigo-600' : 'text-gray-400'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    selectedRole === role.id ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {role.label}
                </span>
                <span className="text-xs text-gray-400">{role.desc}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'company' ? 'you@company.com' : 'you@email.com'}
                  className="input-field pl-10 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-12 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
