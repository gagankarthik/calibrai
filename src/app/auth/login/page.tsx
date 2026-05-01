'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Zap, Building2, User, Eye, EyeOff, ArrowRight, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'company' | 'talent'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('company')
  const [showPassword, setShowPassword] = useState(false)

  const redirectPath = mode === 'company' ? '/company/dashboard' : '/talent/dashboard'

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-background" />
        <div className="hero-glow bg-blue-500" style={{ top: '10%', left: '-10%' }} />
        <div className="hero-glow bg-purple-500" style={{ bottom: '10%', right: '-10%' }} />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Calibr<span className="gradient-text">AI</span>
          </span>
        </Link>

        {/* Quote */}
        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-light text-foreground/90 leading-relaxed">
            "Calibr cut our time-to-hire from 52 days to{' '}
            <span className="gradient-text font-semibold">18 days</span>. The AI matching
            is uncanny."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              SM
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sarah Mitchell</p>
              <p className="text-xs text-muted-foreground">VP of Engineering, Airtable</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'Faster Hiring', value: '65%' },
              { label: 'Offer Accept Rate', value: '89%' },
              { label: 'Match Accuracy', value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to your Calibr account</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-border">
            {([
              { id: 'company', label: 'Company', icon: Building2 },
              { id: 'talent', label: 'Job Seeker', icon: User },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  mode === tab.id
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder={mode === 'company' ? 'you@company.com' : 'you@email.com'}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button asChild className="w-full h-11" size="lg">
              <Link href={redirectPath}>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-11">
              <Github className="w-4 h-4" />
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
