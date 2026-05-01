'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { pricingPlans } from '@/lib/data'
import {
  CheckCircle2,
  ArrowRight,
  Building2,
  Search,
  Clock,
  BarChart3,
  Bell,
  Target,
  Sparkles,
  Star,
} from 'lucide-react'

// ─── useCounter ───────────────────────────────────────────────────────────────

function useCounter(target: number, active: boolean): number {
  const [count, setCount] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (active && !ref.current) {
      ref.current = true
      const steps = 60
      const duration = 1800
      const inc = target / steps
      let cur = 0
      const t = setInterval(() => {
        cur += inc
        if (cur >= target) {
          setCount(target)
          clearInterval(t)
        } else {
          setCount(Math.floor(cur))
        }
      }, duration / steps)
      return () => clearInterval(t)
    }
  }, [active, target])
  return count
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const inView = useInView(heroRef, { once: true })

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] flex items-center pt-24 pb-20 overflow-hidden"
    >
      {/* Background orbs — NO mesh lines, NO dot grids */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--primary) / 0.10), transparent 70%)',
          }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(270 70% 60% / 0.08), transparent 70%)',
          }}
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center">
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="section-eyebrow mb-8 inline-block"
        >
          The hiring platform that ends the black hole
        </motion.span>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.88] text-foreground mb-6"
        >
          Hire people,
          <br />
          <span className="gradient-text">not résumés.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          Calibr&apos;s AI surfaces your top 12 candidates from 847 applicants
          — and tells every rejected candidate exactly why. Companies hire
          faster. Candidates get real feedback. Everyone wins.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.36 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
        >
          <Button size="lg" asChild className="h-14 px-8 text-base font-semibold gap-2">
            <Link href="/auth/register?role=company">
              <Building2 className="w-4 h-4" />
              I&apos;m hiring talent
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-14 px-8 text-base font-semibold gap-2"
          >
            <Link href="/auth/register?role=talent">
              <Search className="w-4 h-4" />
              I&apos;m looking for work
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="text-sm text-muted-foreground mt-5"
        >
          No credit card required · 2-minute setup · Used by 200+ teams
        </motion.p>

        {/* Floating proof cards */}
        <div className="relative mt-16 mx-auto" style={{ height: 340 }}>
          {/* Card 1 — left */}
          <motion.div
            className="glass-card p-4 text-left absolute left-0 top-8 w-64 -rotate-3"
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                  ER
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-none">
                    Emma applied for Senior Eng
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    97% match ✓ Interview scheduled
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* SVG hero illustration — center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card mx-auto overflow-hidden"
            style={{
              width: '100%',
              maxWidth: 680,
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 0,
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-1.5 px-4 py-3 border-b border-border"
              style={{ background: 'hsl(var(--muted) / 0.5)' }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
              <div className="flex-1 flex justify-center">
                <span
                  className="text-[10px] text-muted-foreground px-3 py-0.5 rounded border border-border"
                  style={{ background: 'hsl(var(--card))' }}
                >
                  app.calibr.io
                </span>
              </div>
            </div>
            <div className="p-4" style={{ background: 'hsl(var(--card) / 0.6)' }}>
              <HeroSVG />
            </div>
          </motion.div>

          {/* Card 2 — right */}
          <motion.div
            className="glass-card p-4 text-left absolute right-0 top-12 w-56 rotate-2"
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-xs font-bold text-foreground">14 days to hire</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Industry avg: 40 days
              </p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-emerald-400 text-xs font-black">65% faster</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 3 — bottom */}
          <motion.div
            className="glass-card p-4 text-left absolute bottom-0 left-1/2 -translate-x-1/2 w-60 -rotate-1"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <p className="text-xs font-bold text-foreground">
                6 offers in first week
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Senior Engineer · $185k
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── HeroSVG ─────────────────────────────────────────────────────────────────

function HeroSVG() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })

  const jobs = [
    { label: 'Senior Eng', company: 'Stripe', y: 55, color: 'hsl(217 91% 60%)' },
    { label: 'Product Lead', company: 'Notion', y: 145, color: 'hsl(270 70% 60%)' },
    { label: 'Design Eng', company: 'Vercel', y: 235, color: 'hsl(188 78% 41%)' },
  ]
  const candidates = [
    { init: 'ER', x: 100, y: 55, color: 'hsl(217 91% 60%)', match: '97%' },
    { init: 'MJ', x: 100, y: 108, color: 'hsl(270 70% 60%)', match: '89%' },
    { init: 'SK', x: 100, y: 160, color: 'hsl(160 84% 39%)', match: '84%' },
    { init: 'AL', x: 100, y: 213, color: 'hsl(38 92% 50%)', match: null },
    { init: 'PR', x: 100, y: 265, color: 'hsl(0 84% 60%)', match: null },
  ]

  return (
    <svg
      ref={ref}
      viewBox="0 0 700 300"
      className="w-full"
      style={{ height: 220 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="hero-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Candidate circles */}
      {candidates.map((c, i) => (
        <motion.g
          key={c.init}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
        >
          <circle cx={c.x} cy={c.y} r={18} fill={c.color + '22'} stroke={c.color} strokeWidth="1.5" />
          <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize="9" fontWeight="800" fill={c.color}>
            {c.init}
          </text>
          {c.match && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <rect x={c.x + 12} y={c.y - 22} width={28} height={13} rx={6} fill={c.color} />
              <text x={c.x + 26} y={c.y - 13} textAnchor="middle" fontSize="7" fontWeight="700" fill="white">
                {c.match}
              </text>
            </motion.g>
          )}
        </motion.g>
      ))}

      {/* Center AI node */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{ transformOrigin: '350px 150px' }}
      >
        <motion.circle
          cx={350} cy={150} r={48}
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          fill="none"
          opacity={0.3}
          animate={{ r: [48, 58, 48], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle
          cx={350} cy={150} r={40}
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          filter="url(#soft-glow)"
        />
        <text x={350} y={146} textAnchor="middle" fontSize="16">🧠</text>
        <text x={350} y={162} textAnchor="middle" fontSize="7" fontWeight="700" fill="hsl(var(--primary))">
          Calibr AI
        </text>
      </motion.g>

      {/* Connection paths candidates → AI */}
      {candidates.slice(0, 3).map((c, i) => {
        const d = `M ${c.x + 18},${c.y} Q ${220},${c.y} ${310},${150}`
        return (
          <g key={`path-in-${c.init}`}>
            <motion.path
              d={d}
              stroke={c.color}
              strokeWidth="3"
              fill="none"
              opacity={0.18}
              strokeDasharray="5 6"
              animate={{ strokeDashoffset: [80, 0] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d={d}
              stroke={c.color}
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="5 6"
              animate={{ strokeDashoffset: [80, 0] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: 'linear' }}
            />
          </g>
        )
      })}

      {/* Connection paths AI → jobs */}
      {jobs.map((job, i) => {
        const d = `M ${390},${150} Q ${480},${150} ${540},${job.y}`
        return (
          <g key={`path-out-${job.label}`}>
            <motion.path
              d={d}
              stroke={job.color}
              strokeWidth="3"
              fill="none"
              opacity={0.18}
              strokeDasharray="5 6"
              animate={{ strokeDashoffset: [80, 0] }}
              transition={{ duration: 2 + i * 0.35, repeat: Infinity, ease: 'linear', delay: 0.5 }}
            />
            <motion.path
              d={d}
              stroke={job.color}
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="5 6"
              animate={{ strokeDashoffset: [80, 0] }}
              transition={{ duration: 2 + i * 0.35, repeat: Infinity, ease: 'linear', delay: 0.5 }}
            />
          </g>
        )
      })}

      {/* Job cards */}
      {jobs.map((job, i) => (
        <motion.g
          key={job.label}
          initial={{ opacity: 0, x: 20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
        >
          <rect x={540} y={job.y - 22} width={140} height={44} rx={8}
            fill="hsl(var(--card))" stroke={job.color} strokeWidth="1.2" />
          <text x={556} y={job.y - 4} fontSize="9" fontWeight="700" fill={job.color}>
            {job.label}
          </text>
          <text x={556} y={job.y + 11} fontSize="8" fill="hsl(var(--muted-foreground))">
            {job.company}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

// ─── LogoTicker ───────────────────────────────────────────────────────────────

const row1 = ['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Airtable', 'Loom', 'Retool']
const row2 = ['Supabase', 'Clerk', 'Resend', 'Railway', 'Planetscale', 'Trigger.dev', 'Cal.com', 'Neon']

function LogoTicker() {
  const doubled1 = [...row1, ...row1]
  const doubled2 = [...row2, ...row2]

  return (
    <section className="py-16 border-y border-border overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.15)' }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes marquee-reverse { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
      <p className="text-center text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.2em] mb-8">
        Trusted by engineering-led teams worldwide
      </p>
      <div className="space-y-3">
        <div className="overflow-hidden">
          <div className="flex gap-3 w-max" style={{ animation: 'marquee 32s linear infinite' }}>
            {doubled1.map((name, i) => (
              <div
                key={`r1-${name}-${i}`}
                className="border border-border rounded-full px-5 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-3 w-max" style={{ animation: 'marquee-reverse 36s linear infinite' }}>
            {doubled2.map((name, i) => (
              <div
                key={`r2-${name}-${i}`}
                className="border border-border rounded-full px-5 py-2 text-sm font-medium text-muted-foreground whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SplitPromise ─────────────────────────────────────────────────────────────

function SplitPromise() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-black tracking-[-0.03em] text-foreground mb-4"
        >
          Built for both sides of hiring
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Most platforms serve recruiters or job seekers. We built Calibr for
          both — because great hiring is a two-way conversation.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* For Companies */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-10 hover:border-blue-500/40 transition-all duration-300"
          style={{ borderColor: 'hsl(217 91% 60% / 0.2)' }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5 inline-block"
            style={{ color: 'hsl(217 91% 60%)' }}
          >
            For Companies
          </span>
          <h3 className="text-3xl font-black text-foreground mb-4 leading-tight">
            Find signal<br />in the noise
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Stop manually reviewing 847 résumés. Calibr&apos;s AI ranks,
            explains, and surfaces your top 12 candidates. Your recruiter
            focuses on conversations, not spreadsheets.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              'AI ranks every applicant with explainable scores',
              'Kanban pipeline from applied → hired',
              'Automatic candidate communication — no ghosting',
              'Analytics: where your hires come from',
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'hsl(217 91% 60%)' }} />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild className="gap-2">
            <Link href="/auth/register?role=company">
              Start hiring smarter <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* For Job Seekers */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-10 hover:border-purple-500/40 transition-all duration-300"
          style={{ borderColor: 'hsl(270 70% 60% / 0.2)' }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5 inline-block"
            style={{ color: 'hsl(270 70% 60%)' }}
          >
            For Job Seekers
          </span>
          <h3 className="text-3xl font-black text-foreground mb-4 leading-tight">
            No more<br />black holes
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Apply once, get matched to roles that fit your actual experience.
            See where you stand in every application. Never get ghosted without
            an explanation again.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              'AI matches you to roles by skills, culture fit, salary',
              'Real-time status on every application',
              'Recruiter sends rejection reason, not silence',
              'Salary transparency before you even apply',
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'hsl(270 70% 60%)' }} />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/auth/register?role=talent">
              Start getting noticed <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// ─── BentoStats ───────────────────────────────────────────────────────────────

function BentoStats() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const countA = useCounter(847, inView)
  const countB = useCounter(94, inView)

  return (
    <section
      ref={ref}
      className="py-28 border-y border-border"
      style={{ background: 'hsl(var(--muted) / 0.15)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-black tracking-[-0.03em] text-foreground mb-4"
          >
            The math speaks for itself
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Real outcomes from real teams using Calibr in production
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Card A */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0, duration: 0.55 }}
            className="md:col-span-3 glass-card p-8 flex flex-col hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <div className="text-7xl font-black gradient-text leading-none mb-2">
              {countA === 847 ? '847→12' : countA}
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              applicants surfaced by AI, ready to interview
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Traditional ATS requires reviewing all 847. Calibr reviews them
              all and hands you the 12 that matter.
            </p>
            <div className="mt-auto space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Traditional: 847 to review</span>
                  <span className="font-semibold text-red-400">100%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-400"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '100%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Calibr: 12 to review</span>
                  <span className="font-semibold text-emerald-400">1.4%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '1.4%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card B */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="md:col-span-3 glass-card p-8 flex flex-col hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <div className="text-7xl font-black text-emerald-400 leading-none mb-2">
              {countB}%
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              match accuracy rate
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Our AI&apos;s candidate recommendations result in interviews 94%
              of the time — vs 23% industry average.
            </p>
            <div className="mt-auto space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Calibr</span>
                  <span className="font-semibold text-emerald-400">94%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-400"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '94%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Industry average</span>
                  <span className="font-semibold text-muted-foreground">23%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-muted-foreground/40"
                    initial={{ width: 0 }}
                    animate={inView ? { width: '23%' } : { width: 0 }}
                    transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card C */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="md:col-span-2 glass-card p-6 flex flex-col hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <Clock className="w-7 h-7 text-amber-400 mb-4" />
            <div className="text-5xl font-black text-amber-400 leading-none mb-2">
              11 days
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              avg. time to hire
            </p>
            <p className="text-xs text-muted-foreground">vs. 40 day industry avg</p>
          </motion.div>

          {/* Card D */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="md:col-span-2 glass-card p-6 flex flex-col hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <BarChart3 className="w-7 h-7 text-primary mb-4" />
            <div className="text-5xl font-black text-foreground leading-none mb-2">
              $48k
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">
              saved per hire
            </p>
            <p className="text-xs text-muted-foreground">
              In recruiter time, bad hire risk, and opportunity cost
            </p>
          </motion.div>

          {/* Card E */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="md:col-span-2 glass-card p-6 flex flex-col hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <Bell className="w-7 h-7 mb-4" style={{ color: 'hsl(270 70% 60%)' }} />
            <div className="text-4xl font-black gradient-text leading-none mb-2">
              0 ghosted
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Every rejected candidate receives an AI-written explanation
            </p>
            <span
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: 'hsl(270 70% 60%)' }}
            >
              First platform to guarantee candidate communication
            </span>
          </motion.div>

          {/* Card F */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.55 }}
            className="md:col-span-6 glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:scale-[1.01] hover:border-primary/30 transition-all duration-300 cursor-default"
          >
            <p className="text-sm italic text-muted-foreground">
              &ldquo;The average ATS costs $32,000/year and was last updated in 2018.&rdquo;
            </p>
            <span className="text-2xl text-muted-foreground/30 hidden sm:block">→</span>
            <p className="text-sm font-semibold gradient-text">
              Calibr starts at $499/month and gets smarter every day.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

function HowItWorks() {
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const ref3 = useRef<HTMLDivElement>(null)
  const inView1 = useInView(ref1, { once: true, margin: '-80px' })
  const inView2 = useInView(ref2, { once: true, margin: '-80px' })
  const inView3 = useInView(ref3, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <h2 className="text-4xl lg:text-5xl font-black tracking-[-0.03em] text-foreground mb-4">
          How Calibr works — end to end
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From job post to hired, in less time than your competitor takes to
          screen the first applicant
        </p>
      </div>

      {/* Step 1 */}
      <div
        ref={ref1}
        className="grid lg:grid-cols-2 gap-16 items-center mb-28"
      >
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-8xl font-black text-primary/10 leading-none mb-4 select-none">
            01
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Post your role in 3 minutes
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Describe the role in plain English. Our AI structures it, adds
            salary data, and predicts your ideal candidate profile. No more
            keyword-stuffing job descriptions.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">AI-assisted JD writing</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Salary benchmarks auto-filled</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Goes live on 20+ job boards</span>
          </p>
        </motion.div>

        {/* Job form mock */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-6"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
            New Job Posting
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Role Title
              </label>
              <div
                className="h-9 rounded-lg border border-border px-3 flex items-center text-sm text-foreground"
                style={{ background: 'hsl(var(--muted) / 0.4)' }}
              >
                Senior Frontend Engineer
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Description (plain English)
              </label>
              <div
                className="h-20 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
                style={{ background: 'hsl(var(--muted) / 0.4)' }}
              >
                We&apos;re looking for a senior engineer to help us rebuild our
                checkout flow...
              </div>
            </div>
            <div
              className="rounded-lg border border-primary/30 px-4 py-3 flex items-center gap-3"
              style={{ background: 'hsl(var(--primary) / 0.06)' }}
            >
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">AI analyzing your description…</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Structuring requirements · Fetching salary data · Predicting ideal profile
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Step 2 — reversed */}
      <div
        ref={ref2}
        className="grid lg:grid-cols-2 gap-16 items-center mb-28"
      >
        {/* Matching visual — left */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView2 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-6 order-2 lg:order-1"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
            AI Matching · Senior Engineer · 847 applicants
          </p>
          <div className="space-y-3">
            {[
              { init: 'ER', name: 'Emma Rodriguez', title: 'Sr. Frontend Eng', score: 97, color: 'hsl(217 91% 60%)' },
              { init: 'MJ', name: 'Marcus Chen', title: 'Full Stack Eng', score: 89, color: 'hsl(188 78% 41%)' },
              { init: 'SK', name: 'Priya Sharma', title: 'Frontend Dev', score: 84, color: 'hsl(270 70% 60%)' },
            ].map((c, i) => (
              <motion.div
                key={c.name}
                className="flex items-center gap-3 p-3 rounded-xl border border-border"
                style={{ background: 'hsl(var(--background) / 0.5)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={inView2 ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: c.color }}
                >
                  {c.init}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-2">{c.title}</p>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={inView2 ? { width: `${c.score}%` } : { width: 0 }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <span className="text-sm font-black shrink-0" style={{ color: c.color }}>
                  {c.score}%
                </span>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">835 other candidates</span> assessed and queued — you only see the top 12
            </p>
          </div>
        </motion.div>

        {/* Copy — right */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView2 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 lg:order-2"
        >
          <div className="text-8xl font-black text-primary/10 leading-none mb-4 select-none">
            02
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-4">
            AI matches and ranks
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every application is scored on 47 dimensions: skills, experience,
            culture signals, growth trajectory, salary alignment. Your top
            candidates rise to the surface.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Zero keyword matching</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Explainable AI scores</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Ranked by fit, not recency</span>
          </p>
        </motion.div>
      </div>

      {/* Step 3 */}
      <div
        ref={ref3}
        className="grid lg:grid-cols-2 gap-16 items-center"
      >
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView3 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-8xl font-black text-primary/10 leading-none mb-4 select-none">
            03
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Interview, offer, hire
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Schedule interviews in one click. Move candidates through your
            pipeline. Make offers. Every rejected candidate receives a
            human-sounding, AI-generated explanation.
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Integrated calendar</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Mobile-friendly pipeline</span>
            {' '}·{' '}
            <span className="font-semibold text-foreground">Automatic candidate updates</span>
          </p>
        </motion.div>

        {/* Mini kanban */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView3 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card p-6"
        >
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
            Live Pipeline · Senior Engineer
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Interview',
                color: 'hsl(38 92% 50%)',
                cards: [
                  { init: 'ER', name: 'Emma R.', color: 'hsl(217 91% 60%)' },
                  { init: 'MJ', name: 'Marcus C.', color: 'hsl(188 78% 41%)' },
                ],
              },
              {
                label: 'Offer',
                color: 'hsl(160 84% 39%)',
                cards: [{ init: 'SK', name: 'Priya S.', color: 'hsl(270 70% 60%)' }],
              },
              {
                label: 'Hired',
                color: 'hsl(217 91% 60%)',
                cards: [{ init: 'AL', name: 'Alex L.', color: 'hsl(38 92% 50%)' }],
              },
            ].map((col, ci) => (
              <div
                key={col.label}
                className="rounded-xl border border-border p-3"
                style={{ background: 'hsl(var(--background) / 0.4)' }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                  <span className="text-[10px] font-semibold text-muted-foreground">{col.label}</span>
                </div>
                <div className="space-y-2">
                  {col.cards.map((card, ci2) => (
                    <motion.div
                      key={card.name}
                      className="flex items-center gap-1.5 p-2 rounded-lg border border-border/60"
                      style={{ background: 'hsl(var(--card) / 0.8)' }}
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 3 + ci2 * 0.7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: ci * 0.4 + ci2 * 0.3,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                        style={{ background: card.color }}
                      >
                        {card.init}
                      </div>
                      <p className="text-[9px] font-semibold text-foreground truncate">{card.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── FeatureDeepDives ─────────────────────────────────────────────────────────

function FeatureDeepDives() {
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const ref3 = useRef<HTMLDivElement>(null)
  const inView1 = useInView(ref1, { once: true, margin: '-80px' })
  const inView2 = useInView(ref2, { once: true, margin: '-80px' })
  const inView3 = useInView(ref3, { once: true, margin: '-80px' })

  return (
    <section
      className="py-28 border-y border-border"
      style={{ background: 'hsl(var(--muted) / 0.15)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Feature 1 — AI Matching */}
        <div ref={ref1} className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-eyebrow mb-5 inline-block">
              Intelligent Screening
            </span>
            <h2 className="text-4xl font-black tracking-[-0.02em] leading-[1.1] text-foreground mb-5">
              Your next great hire is already in your inbox. You just can&apos;t see them.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Calibr reads between the lines of every application. It
              understands career trajectory, skill depth, and cultural signals
              that keyword filters miss. Then it explains WHY it ranked each
              candidate.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card p-6"
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
              Top Matches · Senior Engineer
            </p>
            <div className="space-y-4">
              {[
                {
                  init: 'ER',
                  name: 'Emma Rodriguez',
                  title: 'Sr. Frontend Eng',
                  score: 97,
                  color: 'hsl(217 91% 60%)',
                  tags: ['React', 'TypeScript', 'Performance'],
                },
                {
                  init: 'MC',
                  name: 'Marcus Chen',
                  title: 'Full Stack Eng',
                  score: 89,
                  color: 'hsl(188 78% 41%)',
                  tags: ['Node.js', 'React', 'AWS'],
                },
                {
                  init: 'PS',
                  name: 'Priya Sharma',
                  title: 'Frontend Dev',
                  score: 84,
                  color: 'hsl(270 70% 60%)',
                  tags: ['Vue', 'TypeScript', 'CSS'],
                },
              ].map((c, i) => (
                <div key={c.name}>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: c.color }}
                    >
                      {c.init}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-none mb-0.5">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{c.title}</p>
                    </div>
                    <span className="text-sm font-black shrink-0" style={{ color: c.color }}>
                      {c.score}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={{ width: 0 }}
                      animate={inView1 ? { width: `${c.score}%` } : { width: 0 }}
                      transition={{ delay: 0.4 + i * 0.15, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature 2 — No Ghosting */}
        <div ref={ref2} className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          {/* Visual — left */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card p-5 order-2 lg:order-1"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground">Application Update</p>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  color: 'hsl(160 84% 39%)',
                  borderColor: 'hsl(160 84% 39% / 0.3)',
                  background: 'hsl(160 84% 39% / 0.08)',
                }}
              >
                Not a template
              </span>
            </div>
            <div
              className="rounded-xl border border-border p-4"
              style={{ background: 'hsl(var(--background) / 0.6)' }}
            >
              <p className="text-xs font-bold text-foreground mb-2">
                Update on your Senior Engineer application at Notion
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Hi Marcus, thanks for your application. After careful review,
                we found your Node.js experience (3 years) is below our minimum
                (5 years) for this role. We&apos;d recommend roles at the Mid
                level where your skills are a great fit.
              </p>
              <p className="text-xs text-muted-foreground italic">
                — Calibr AI for the Notion Team
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                Marcus received this within 24 hours of rejection
              </p>
            </div>
          </motion.div>

          {/* Copy — right */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2"
          >
            <span className="section-eyebrow mb-5 inline-block">
              Candidate Dignity
            </span>
            <h2 className="text-4xl font-black tracking-[-0.02em] leading-[1.1] text-foreground mb-5">
              We built the platform that treats job seekers like human beings.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              When a company rejects you, Calibr automatically sends them your
              AI-written feedback. Not &ldquo;we&apos;ve decided to move forward with
              other candidates.&rdquo; Real, specific, actionable feedback.
            </p>
          </motion.div>
        </div>

        {/* Feature 3 — Pipeline Intelligence */}
        <div ref={ref3} className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView3 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-eyebrow mb-5 inline-block">
              Real-Time Visibility
            </span>
            <h2 className="text-4xl font-black tracking-[-0.02em] leading-[1.1] text-foreground mb-5">
              Recruiters see the full picture. Candidates see where they stand.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your hiring pipeline is a living dashboard. Every stage move
              triggers the right communication. No more candidates wondering
              what happened. No more recruiters losing track.
            </p>
          </motion.div>

          {/* 5-column kanban */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView3 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card p-6"
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
              Live Pipeline
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                {
                  label: 'New',
                  color: 'hsl(217 91% 60%)',
                  cards: [
                    { init: 'AL', color: 'hsl(38 92% 50%)' },
                    { init: 'PR', color: 'hsl(0 84% 60%)' },
                  ],
                },
                {
                  label: 'Screen',
                  color: 'hsl(270 70% 60%)',
                  cards: [
                    { init: 'SK', color: 'hsl(270 70% 60%)' },
                    { init: 'CW', color: 'hsl(188 78% 41%)' },
                  ],
                },
                {
                  label: 'Phone',
                  color: 'hsl(188 78% 41%)',
                  cards: [{ init: 'MJ', color: 'hsl(217 91% 60%)' }],
                },
                {
                  label: 'Interview',
                  color: 'hsl(38 92% 50%)',
                  cards: [{ init: 'ER', color: 'hsl(160 84% 39%)' }],
                },
                {
                  label: 'Offer',
                  color: 'hsl(160 84% 39%)',
                  cards: [{ init: 'AC', color: 'hsl(217 91% 60%)' }],
                },
              ].map((col, ci) => (
                <div
                  key={col.label}
                  className="rounded-lg border border-border p-2"
                  style={{ background: 'hsl(var(--background) / 0.4)' }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                    <span className="text-[8px] font-semibold text-muted-foreground truncate">{col.label}</span>
                  </div>
                  <div className="space-y-1.5">
                    {col.cards.map((card, ci2) => (
                      <motion.div
                        key={`${col.label}-${card.init}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white mx-auto"
                        style={{ background: card.color }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                          duration: 3.5 + ci2 * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: ci * 0.3 + ci2 * 0.4,
                        }}
                      >
                        {card.init}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="py-28 max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-black tracking-[-0.03em] text-foreground mb-4"
        >
          Loved by hiring teams AND job seekers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto"
        >
          We&apos;re the only platform with 5-star reviews from both sides of
          the table
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
        {/* Card 1 — Company */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0, duration: 0.55 }}
          className="glass-card p-8 flex flex-col"
        >
          <div className="flex items-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-base text-muted-foreground italic leading-relaxed flex-1">
            &ldquo;We went from taking 6 weeks to fill senior roles to 18 days.
            The AI scoring is eerily accurate — it keeps surfacing people
            we&apos;d have missed.&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
              alt="Sarah Chen"
              className="w-9 h-9 rounded-full bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none mb-0.5">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">VP Engineering · Stripe · 400 employees</p>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{
                color: 'hsl(217 91% 60%)',
                borderColor: 'hsl(217 91% 60% / 0.3)',
                background: 'hsl(217 91% 60% / 0.08)',
              }}
            >
              COMPANY
            </span>
          </div>
        </motion.div>

        {/* Card 2 — Job Seeker */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12, duration: 0.55 }}
          className="glass-card p-8 flex flex-col"
          style={{ borderColor: 'hsl(270 70% 60% / 0.2)' }}
        >
          <div className="flex items-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-base text-muted-foreground italic leading-relaxed flex-1">
            &ldquo;I applied to 50 companies through traditional platforms. Heard
            back from 3. Applied to 8 through Calibr. Got 6 interviews. The
            difference is insane.&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=marcus"
              alt="Marcus Johnson"
              className="w-9 h-9 rounded-full bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none mb-0.5">Marcus Johnson</p>
              <p className="text-xs text-muted-foreground">Senior Engineer</p>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{
                color: 'hsl(270 70% 60%)',
                borderColor: 'hsl(270 70% 60% / 0.3)',
                background: 'hsl(270 70% 60% / 0.08)',
              }}
            >
              JOB SEEKER
            </span>
          </div>
        </motion.div>

        {/* Card 3 — Company */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.24, duration: 0.55 }}
          className="glass-card p-8 flex flex-col"
        >
          <div className="flex items-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-base text-muted-foreground italic leading-relaxed flex-1">
            &ldquo;The candidate communication feature alone is worth it. We used
            to spend 4 hours/week writing rejection emails. Now it&apos;s
            automatic and candidates actually thank us.&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=david"
              alt="David Park"
              className="w-9 h-9 rounded-full bg-muted shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-none mb-0.5">David Park</p>
              <p className="text-xs text-muted-foreground">Head of Talent · Notion · 250 employees</p>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0"
              style={{
                color: 'hsl(217 91% 60%)',
                borderColor: 'hsl(217 91% 60% / 0.3)',
                background: 'hsl(217 91% 60% / 0.08)',
              }}
            >
              COMPANY
            </span>
          </div>
        </motion.div>
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {['4.9/5 on G2', '4.8/5 on Capterra', 'SOC2 Type II Certified', '#1 ATS on Product Hunt'].map(
          (badge) => (
            <span
              key={badge}
              className="border border-border rounded-full px-5 py-2 text-sm font-medium text-muted-foreground"
            >
              {badge}
            </span>
          )
        )}
      </div>
    </section>
  )
}

// ─── PricingSection ───────────────────────────────────────────────────────────

function PricingSection({
  isAnnual,
  setIsAnnual,
}: {
  isAnnual: boolean
  setIsAnnual: (v: boolean) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-28 border-y border-border"
      style={{ background: 'hsl(var(--muted) / 0.15)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl lg:text-5xl font-black tracking-[-0.03em] text-foreground mb-4">
            Start free. Scale as you grow.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Every plan includes unlimited candidates, real-time pipeline, and AI
            matching. No seat fees for your hiring managers.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
            {(['Monthly', 'Annual'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setIsAnnual(tab === 'Annual')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  (tab === 'Annual') === isAnnual
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {tab === 'Annual' && (
                  <span className="ml-1.5 text-[10px] text-emerald-500 font-bold">
                    SAVE 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className={`glass-card p-8 flex flex-col relative ${
                plan.highlighted
                  ? 'ring-2 ring-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                  : ''
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 section-eyebrow text-xs px-3 py-1 rounded-full bg-card border border-border whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>

              <div className="text-5xl font-black text-foreground leading-none mb-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.22 }}
                    className="inline-block"
                  >
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-lg font-normal text-muted-foreground">/mo</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
                asChild
              >
                <Link
                  href={
                    plan.id === 'enterprise' ? '/contact' : '/auth/register?role=company'
                  }
                >
                  {plan.id === 'enterprise' ? 'Talk to Sales' : 'Start Free Trial'}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/contact"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Not sure? Talk to our team <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── FinalCTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="py-32 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, hsl(222 47% 5%), hsl(270 30% 8%))',
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[360px] rounded-full"
          style={{
            background:
              'radial-gradient(ellipse, hsl(217 91% 60% / 0.18), transparent 70%)',
            filter: 'blur(48px)',
          }}
          animate={{ scale: [1, 1.14, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, hsl(270 70% 60% / 0.10), transparent 70%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Target className="w-10 h-10 text-white/30 mx-auto mb-6" />
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-[-0.04em] leading-[0.92] mb-7">
            Ready to end the
            <br />
            <span className="gradient-text">hiring black hole?</span>
          </h2>
          <p className="text-xl text-white/60 mb-11 leading-relaxed">
            Join 200+ companies who&apos;ve transformed their hiring — and the
            50,000 job seekers who&apos;ve found their next role — on Calibr.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              size="lg"
              asChild
              className="h-14 px-9 text-base font-semibold gap-2 border-0"
              style={{ background: 'white', color: 'black' }}
            >
              <Link href="/auth/register?role=company">
                Start hiring smarter <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-14 px-9 text-base text-white/80 hover:text-white hover:bg-white/10 gap-2"
            >
              <Link href="/auth/register?role=talent">
                <Search className="w-4 h-4" />
                Find your next role
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/35">
            No credit card · 14-day free trial · Cancel anytime · SOC2 compliant
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="bg-background overflow-x-hidden">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <LogoTicker />
        <SplitPromise />
        <BentoStats />
        <HowItWorks />
        <FeatureDeepDives />
        <Testimonials />
        <PricingSection isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
