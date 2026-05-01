'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Zap,
  Building2,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Github,
  Mail,
  Lock,
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
    <div className="min-h-screen flex">
      {/* ── Left panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-indigo-950/80 to-purple-950/90" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Calibr<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">
              AI-Powered Hiring Platform
            </p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Find signal in<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                the noise
              </span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              200+ companies · 50k+ profiles · 94% match accuracy
            </p>
          </div>

          {/* Testimonial */}
          <div className="space-y-4">
            <blockquote className="text-lg font-light text-white/80 leading-relaxed border-l-2 border-blue-500/50 pl-4">
              "Calibr cut our time-to-hire from 52 days to{' '}
              <span className="font-semibold text-white">18 days</span>. The AI
              matching is uncanny."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                SM
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sarah Mitchell</p>
                <p className="text-xs text-white/40">VP of Engineering, Airtable</p>
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
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 text-center"
              >
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Floating mockup cards */}
          <div className="relative h-24 pointer-events-none select-none">
            <div
              className="absolute left-0 top-0 px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60 shadow-xl"
              style={{ transform: 'rotate(-2deg)' }}
            >
              <span className="text-emerald-400 font-semibold">↑ 32%</span> pipeline velocity
            </div>
            <div
              className="absolute right-0 top-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60 shadow-xl"
              style={{ transform: 'rotate(1.5deg)' }}
            >
              <span className="text-blue-400 font-semibold">94</span> match score
            </div>
            <div
              className="absolute left-1/4 bottom-0 px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-xs text-white/60 shadow-xl"
              style={{ transform: 'rotate(-0.5deg)' }}
            >
              <span className="text-purple-400 font-semibold">12</span> new candidates today
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-7"
        >
          {/* Mobile-only logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Calibr<span className="gradient-text">AI</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
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
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-primary/[0.02]'
                )}
              >
                <role.icon
                  className={cn(
                    'w-4 h-4 mb-0.5 transition-colors',
                    selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    selectedRole === role.id ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {role.label}
                </span>
                <span className="text-xs text-muted-foreground">{role.desc}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'company' ? 'you@company.com' : 'you@email.com'
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11" type="button">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11" type="button">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:underline font-medium"
            >
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
