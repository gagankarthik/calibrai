'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Zap, Building2, User, ArrowRight, CheckCircle2, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'company' | 'talent'

const companyBenefits = [
  'Post unlimited jobs in minutes',
  'AI ranks candidates by fit, not keywords',
  'Full pipeline with team collaboration',
  'Salary intelligence & market data',
]

const talentBenefits = [
  'Get matched to jobs that actually fit',
  'Always know where you stand',
  'Verified skills = higher match scores',
  'Real salary data, no surprises',
]

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>('company')
  const benefits = mode === 'company' ? companyBenefits : talentBenefits

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="hero-glow bg-blue-500" style={{ top: '-10%', left: '-5%' }} />
      <div className="hero-glow bg-purple-500" style={{ bottom: '-10%', right: '-5%' }} />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Form */}
        <div className="glass-card p-8 space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-foreground">
              Calibr<span className="gradient-text">AI</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-sm text-muted-foreground">Free 14-day trial. No credit card required.</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-border">
            {([
              { id: 'company', label: 'I\'m Hiring', icon: Building2 },
              { id: 'talent', label: 'I\'m Job Seeking', icon: User },
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

          <div className="space-y-4">
            {mode === 'company' && (
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Acme Corp" className="h-11" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="Jane" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Smith" className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Work Email</Label>
              <Input type="email" placeholder="jane@company.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="Min. 8 characters" className="h-11" />
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox id="terms" className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to Calibr's{' '}
                <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <Button asChild className="w-full h-11" size="lg">
              <Link href={mode === 'company' ? '/company/dashboard' : '/talent/dashboard'}>
                Create Account — Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Right: Benefits */}
        <div className="space-y-6 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              {mode === 'company' ? 'For Companies' : 'For Job Seekers'}
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {mode === 'company'
                ? 'Hire faster. Hire smarter.'
                : 'Find your dream role, finally.'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'company'
                ? 'Join 14,200+ companies that found their best hires on Calibr.'
                : 'Join 87,000+ professionals who landed their perfect role.'}
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['alex', 'sarah', 'marcus', 'sofia', 'jordan'].map((seed) => (
                  <div
                    key={seed}
                    className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {seed[0].toUpperCase()}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 text-xs">★★★★★</div>
                <p className="text-xs text-muted-foreground">4.9/5 from 6,200+ reviews</p>
              </div>
            </div>
            <blockquote className="text-xs text-muted-foreground italic">
              "I had 3 interview requests within 48 hours of completing my profile."
              <br />
              <span className="text-foreground not-italic font-medium">— Marcus J., Staff Engineer at Vercel</span>
            </blockquote>
          </div>

          {/* Logos */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">Trusted by teams at</p>
            <div className="flex items-center gap-4 flex-wrap">
              {['Stripe', 'Vercel', 'Notion', 'Linear', 'Figma'].map((name) => (
                <span key={name} className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
