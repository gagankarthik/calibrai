'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import {
  CheckCircle2,
  ArrowRight,
  Brain,
  Zap,
  Shield,
  ChevronRight,
  Star,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { pricingPlans } from '@/lib/data'

// ─── useCounter ───────────────────────────────────────────────────────────────

function useCounter(target: number, active: boolean, duration = 1800): number {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const steps = 60
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
  }, [active, target, duration])
  return count
}

// ─── HeroSection ─────────────────────────────────────────────────────────────

function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const inView = useInView(heroRef, { once: true })

  // Canvas particle field — 50 gold dots floating with subtle drift
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0
    let H = 0

    const PARTICLE_COUNT = 50
    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      r: number
      opacity: number
    }

    // Deterministic pseudo-random seeded by index
    function seed(n: number): number {
      const x = Math.sin(n + 1) * 10000
      return x - Math.floor(x)
    }

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: seed(i * 3) * 1920,
      y: seed(i * 3 + 1) * 1080,
      vx: (seed(i * 3 + 2) - 0.5) * 0.35,
      vy: (seed(i * 3 + 4) - 0.5) * 0.35,
      r: seed(i * 5) * 1.5 + 0.5,
      opacity: seed(i * 7) * 0.25 + 0.15,
    }))

    function resize() {
      if (!canvas) return
      W = canvas.offsetWidth
      H = canvas.offsetHeight
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      // Clamp particle positions after resize
      for (const p of particles) {
        p.x = seed(particles.indexOf(p) * 3) * W
        p.y = seed(particles.indexOf(p) * 3 + 1) * H
      }
    }

    resize()
    window.addEventListener('resize', resize)

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${p.opacity})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden"
      style={{ background: '#0A0B0F' }}
    >
      {/* Canvas particle field — z-index 0, behind everything */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* Radial gold glow at top center */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.13) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="relative w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center"
        style={{ zIndex: 2 }}
      >
        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <span className="section-eyebrow mb-10 inline-flex items-center gap-2">
            <Zap className="w-3 h-3" />
            AI-Powered Hiring Platform
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT }}
          className="font-display text-5xl md:text-7xl leading-[1.05] tracking-[-0.03em] mb-6"
        >
          Where talent meets
          <br />
          <span className="gradient-text">opportunity.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          AI-powered matching that closes roles 3× faster.
          Zero ghosting. Real salary data.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.34 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          <Link
            href="/auth/register?role=company"
            className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold"
          >
            Start Hiring
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/auth/register?role=talent"
            className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold"
          >
            Find Jobs
          </Link>
        </motion.div>

        {/* Trust pill badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {[
            '94% match accuracy',
            '12-day avg. time-to-hire',
            'Zero ghosting policy',
          ].map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.20)',
                color: 'var(--tl-text-secondary)',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--tl-gold)' }} />
              {label}
            </span>
          ))}
        </motion.div>

        {/* HeroSVG — candidate nodes → AI brain → job cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT }}
          className="w-full max-w-3xl mx-auto relative"
        >
          <HeroSVG />

          {/* Floating proof card — bottom right */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 16 }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.9, ease: EASE_OUT }}
            className="tl-card absolute -bottom-4 -right-4 md:right-0 p-4 text-left w-52"
            style={{ zIndex: 10 }}
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: 'rgba(74,159,255,0.2)', color: 'var(--tl-blue)' }}
                >
                  ER
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--tl-text-primary)' }}>
                    Emma — Senior Eng
                  </p>
                  <p className="text-[10px] font-mono" style={{ color: 'var(--tl-teal)' }}>
                    97% match ✓
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--tl-text-secondary)' }}>
                  AI Match Score
                </span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: 'var(--tl-gold)' }}
                >
                  97
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tl-bg-overlay)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '97%',
                    background: 'linear-gradient(90deg, var(--tl-gold), var(--tl-gold-light))',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── HeroSVG ─────────────────────────────────────────────────────────────────

function HeroSVG() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })

  const candidates = [
    { init: 'ER', y: 50,  color: '#4A9FFF', match: '97%' },
    { init: 'MJ', y: 115, color: '#1ECDB3', match: '91%' },
    { init: 'SK', y: 180, color: '#C9A84C', match: '88%' },
    { init: 'AL', y: 245, color: '#FF5C7A', match: null  },
    { init: 'PR', y: 310, color: '#9B9890', match: null  },
  ]

  const jobs = [
    { label: 'Stripe',      role: 'Sr. Engineer',     y: 70,  color: '#4A9FFF' },
    { label: 'Notion',      role: 'Product Lead',     y: 180, color: '#1ECDB3' },
    { label: 'Anthropic',   role: 'ML Engineer',      y: 290, color: '#C9A84C' },
  ]

  // Hexagon points for AI brain
  const hexR = 38
  const hexCX = 300
  const hexCY = 180
  const hexPts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${hexCX + hexR * Math.cos(a)},${hexCY + hexR * Math.sin(a)}`
  }).join(' ')

  return (
    <svg
      ref={ref}
      viewBox="0 0 560 360"
      className="w-full"
      style={{ height: 280 }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="hex-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A1D26" />
          <stop offset="100%" stopColor="#111318" />
        </radialGradient>
      </defs>

      {/* Candidate nodes (left column) */}
      {candidates.map((c, i) => (
        <motion.g
          key={c.init}
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.15 + i * 0.09, duration: 0.45 }}
        >
          <circle cx={68} cy={c.y} r={20} fill={`${c.color}1A`} stroke={c.color} strokeWidth="1.4" />
          <text x={68} y={c.y + 5} textAnchor="middle" fontSize="9" fontWeight="800" fill={c.color}>
            {c.init}
          </text>
          {c.match && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.3 }}
              style={{ transformOrigin: `${68 + 14}px ${c.y - 22}px` }}
            >
              <rect x={84} y={c.y - 30} width={30} height={14} rx={7} fill={c.color} />
              <text x={99} y={c.y - 20} textAnchor="middle" fontSize="7" fontWeight="700" fill="#0A0B0F">
                {c.match}
              </text>
            </motion.g>
          )}
        </motion.g>
      ))}

      {/* Paths — candidates (top 3) → AI hex */}
      {candidates.slice(0, 3).map((c, i) => {
        const d = `M ${88},${c.y} Q ${190},${c.y} ${hexCX - hexR},${hexCY}`
        return (
          <g key={`in-${c.init}`}>
            <motion.path
              d={d}
              stroke={c.color}
              strokeWidth="2.5"
              fill="none"
              opacity={0.12}
              strokeDasharray="6 7"
              animate={{ strokeDashoffset: [90, 0] }}
              transition={{ duration: 2 + i * 0.28, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d={d}
              stroke={c.color}
              strokeWidth="1"
              fill="none"
              strokeDasharray="6 7"
              animate={{ strokeDashoffset: [90, 0] }}
              transition={{ duration: 2 + i * 0.28, repeat: Infinity, ease: 'linear' }}
            />
          </g>
        )
      })}

      {/* AI Brain — hexagon */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.65, delay: 0.38 }}
        style={{ transformOrigin: `${hexCX}px ${hexCY}px` }}
        filter="url(#glow-gold)"
      >
        {/* Outer pulse ring */}
        <motion.polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6
            const r2 = hexR + 10
            return `${hexCX + r2 * Math.cos(a)},${hexCY + r2 * Math.sin(a)}`
          }).join(' ')}
          stroke="#C9A84C"
          strokeWidth="1"
          fill="none"
          opacity={0.15}
          animate={{ opacity: [0.15, 0, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <polygon
          points={hexPts}
          fill="url(#hex-fill)"
          stroke="#C9A84C"
          strokeWidth="1.5"
        />
        <text x={hexCX} y={hexCY - 7} textAnchor="middle" fontSize="15" fill="#C9A84C">
          ◆
        </text>
        <text x={hexCX} y={hexCY + 10} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#C9A84C" letterSpacing="0.08em">
          TalentLoop AI
        </text>
      </motion.g>

      {/* Paths — AI hex → job cards */}
      {jobs.map((job, i) => {
        const d = `M ${hexCX + hexR},${hexCY} Q ${410},${hexCY} ${432},${job.y}`
        return (
          <g key={`out-${job.label}`}>
            <motion.path
              d={d}
              stroke={job.color}
              strokeWidth="2.5"
              fill="none"
              opacity={0.12}
              strokeDasharray="6 7"
              animate={{ strokeDashoffset: [90, 0] }}
              transition={{ duration: 2.2 + i * 0.32, repeat: Infinity, ease: 'linear', delay: 0.4 }}
            />
            <motion.path
              d={d}
              stroke={job.color}
              strokeWidth="1"
              fill="none"
              strokeDasharray="6 7"
              animate={{ strokeDashoffset: [90, 0] }}
              transition={{ duration: 2.2 + i * 0.32, repeat: Infinity, ease: 'linear', delay: 0.4 }}
            />
          </g>
        )
      })}

      {/* Job cards (right column) */}
      {jobs.map((job, i) => (
        <motion.g
          key={job.label}
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
        >
          <rect x={432} y={job.y - 24} width={116} height={48} rx={10}
            fill="#111318" stroke={job.color} strokeWidth="1.2" />
          <text x={448} y={job.y - 5} fontSize="9" fontWeight="700" fill={job.color}>
            {job.role}
          </text>
          <text x={448} y={job.y + 11} fontSize="8" fill="#9B9890">
            {job.label}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

// ─── LogoTicker ───────────────────────────────────────────────────────────────

const COMPANIES_ROW1 = ['Google', 'Stripe', 'Notion', 'Figma', 'Linear', 'Vercel']
const COMPANIES_ROW2 = ['OpenAI', 'Anthropic', 'Ramp', 'Brex', 'Arc', 'Cursor']

function LogoTicker() {
  const doubled1 = [...COMPANIES_ROW1, ...COMPANIES_ROW1]
  const doubled2 = [...COMPANIES_ROW2, ...COMPANIES_ROW2]

  return (
    <section
      className="py-14 overflow-hidden border-y"
      style={{
        borderColor: 'var(--tl-border-subtle)',
        background: 'var(--tl-bg-surface)',
      }}
    >
      <p
        className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] mb-8"
        style={{ color: 'var(--tl-text-tertiary)' }}
      >
        Trusted by teams at
      </p>
      <div className="space-y-3">
        {/* Row 1 — scrolls left */}
        <div className="overflow-hidden">
          <div
            className="flex gap-3 w-max"
            style={{ animation: 'marquee 28s linear infinite' }}
          >
            {doubled1.map((name, i) => (
              <span
                key={`r1-${name}-${i}`}
                className="tl-card px-5 py-2 text-sm font-medium whitespace-nowrap"
                style={{ color: 'var(--tl-text-secondary)', borderRadius: '999px' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        {/* Row 2 — scrolls right */}
        <div className="overflow-hidden">
          <div
            className="flex gap-3 w-max"
            style={{ animation: 'marquee-reverse 34s linear infinite' }}
          >
            {doubled2.map((name, i) => (
              <span
                key={`r2-${name}-${i}`}
                className="tl-card px-5 py-2 text-sm font-medium whitespace-nowrap"
                style={{ color: 'var(--tl-text-secondary)', borderRadius: '999px' }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── DualPromise ──────────────────────────────────────────────────────────────

const COMPANY_BENEFITS = [
  'AI ranks every applicant with explainable scores',
  'Kanban pipeline from applied to hired, in one view',
  'Automatic candidate comms — zero ghosting guaranteed',
  'Real salary benchmarks pre-filled on every posting',
]

const SEEKER_BENEFITS = [
  'AI matches you to roles by skills, culture, and salary',
  'Real-time status on every application you submit',
  'Feedback on every rejection — no more silence',
  'Salary transparency before you apply, not after',
]

function DualPromise() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <section
      ref={ref}
      id="companies"
      className="py-28 max-w-7xl mx-auto px-6"
    >
      {/* Seekers anchor */}
      <div id="seekers" />

      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="section-eyebrow mb-5 inline-block">Built for both sides</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="font-display text-4xl md:text-5xl mb-4"
        >
          One platform. Two promises.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          Great hiring is a two-way conversation. TalentLoop is the only
          platform that actually serves both sides.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* For Hiring Teams */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE_OUT }}
          className="tl-card-elevated p-10 flex flex-col"
          style={{ borderLeft: '3px solid var(--tl-teal)' }}
        >
          <span className="tl-tag-teal tl-tag mb-5 self-start">For Hiring Teams</span>
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--tl-text-primary)' }}>
            Find signal in the noise.
          </h3>
          <p className="mb-8" style={{ color: 'var(--tl-text-secondary)', lineHeight: 1.7 }}>
            Stop manually reviewing hundreds of résumés. Our AI ranks, explains,
            and surfaces only the candidates that matter — then handles all
            the follow-up communication.
          </p>
          <ul className="space-y-3 mb-10 flex-1">
            {COMPANY_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'var(--tl-text-secondary)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--tl-teal)' }} />
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/register?role=company"
            className="btn-gold inline-flex items-center gap-2 self-start px-6 py-3 text-sm font-semibold"
          >
            Start hiring smarter <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* For Job Seekers */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.28, ease: EASE_OUT }}
          className="tl-card-elevated p-10 flex flex-col"
          style={{ borderLeft: '3px solid var(--tl-gold)' }}
        >
          <span className="tl-tag-gold tl-tag mb-5 self-start">For Job Seekers</span>
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--tl-text-primary)' }}>
            No more black holes.
          </h3>
          <p className="mb-8" style={{ color: 'var(--tl-text-secondary)', lineHeight: 1.7 }}>
            Apply once, get matched to roles that fit your actual experience.
            See exactly where you stand in every process. Never get ghosted
            without an explanation again.
          </p>
          <ul className="space-y-3 mb-10 flex-1">
            {SEEKER_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'var(--tl-text-secondary)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--tl-gold)' }} />
                {b}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/register?role=talent"
            className="btn-ghost inline-flex items-center gap-2 self-start px-6 py-3 text-sm font-semibold"
          >
            Find your next role <ChevronRight className="w-4 h-4" />
          </Link>
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
  const countC = useCounter(48, inView)
  const countD = useCounter(11, inView)

  return (
    <section
      ref={ref}
      className="py-28 border-y"
      style={{
        borderColor: 'var(--tl-border-subtle)',
        background: 'var(--tl-bg-surface)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="section-eyebrow mb-5 inline-block"
          >
            By The Numbers
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-4xl md:text-5xl mb-4"
          >
            The math speaks for itself.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-lg"
            style={{ color: 'var(--tl-text-secondary)' }}
          >
            Real outcomes from real teams using TalentLoop in production.
          </motion.p>
        </div>

        {/* 2+3 bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Large card A */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0, duration: 0.55 }}
            className="tl-card md:col-span-3 p-8 flex flex-col cursor-default"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--tl-text-tertiary)' }}>
              Applicants → Interviews
            </p>
            <div
              className="font-mono text-6xl font-bold leading-none mb-3 gradient-text"
            >
              {countA === 847 ? '847→12' : countA}
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
              Candidates AI-shortlisted, ready to interview
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--tl-text-secondary)' }}>
              Traditional ATS: review all 847. TalentLoop: we review them all,
              hand you the 12 that matter.
            </p>
            <div className="mt-auto space-y-3">
              {[
                { label: 'Traditional: 847 to review', pct: '100%', w: '100%', color: 'var(--tl-rose)' },
                { label: 'TalentLoop: 12 to review', pct: '1.4%', w: '1.4%', color: 'var(--tl-teal)' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--tl-text-secondary)' }}>{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color }}>{row.pct}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tl-bg-overlay)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: row.color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: row.w } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Large card B */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="tl-card md:col-span-3 p-8 flex flex-col cursor-default"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--tl-text-tertiary)' }}>
              Match Accuracy
            </p>
            <div className="font-mono text-6xl font-bold leading-none mb-3" style={{ color: 'var(--tl-teal)' }}>
              {countB}%
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
              Candidate recommendations result in interviews
            </p>
            <p className="text-xs mb-6" style={{ color: 'var(--tl-text-secondary)' }}>
              94% vs. 23% industry average. Our AI reads career trajectory,
              skill depth, and cultural signals that keywords miss.
            </p>
            <div className="mt-auto space-y-3">
              {[
                { label: 'TalentLoop', pct: '94%', w: '94%', color: 'var(--tl-teal)' },
                { label: 'Industry average', pct: '23%', w: '23%', color: 'var(--tl-text-tertiary)' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--tl-text-secondary)' }}>{row.label}</span>
                    <span className="font-semibold" style={{ color: row.color }}>{row.pct}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--tl-bg-overlay)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: row.color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: row.w } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Small card C */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="tl-card md:col-span-2 p-7 flex flex-col cursor-default"
          >
            <Clock className="w-6 h-6 mb-4" style={{ color: 'var(--tl-gold)' }} />
            <div className="font-mono text-5xl font-bold leading-none mb-2" style={{ color: 'var(--tl-gold)' }}>
              {countD} <span className="text-2xl">days</span>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
              Avg. time to hire
            </p>
            <p className="text-xs" style={{ color: 'var(--tl-text-secondary)' }}>
              vs. 40-day industry avg.
            </p>
          </motion.div>

          {/* Small card D */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="tl-card md:col-span-2 p-7 flex flex-col cursor-default"
          >
            <BarChart3 className="w-6 h-6 mb-4" style={{ color: 'var(--tl-blue)' }} />
            <div className="font-mono text-5xl font-bold leading-none mb-2" style={{ color: 'var(--tl-blue)' }}>
              ${countC}K
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
              Avg. salary increase
            </p>
            <p className="text-xs" style={{ color: 'var(--tl-text-secondary)' }}>
              For candidates placed through TalentLoop.
            </p>
          </motion.div>

          {/* Small card E */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.55 }}
            className="tl-card md:col-span-2 p-7 flex flex-col cursor-default"
          >
            <Shield className="w-6 h-6 mb-4" style={{ color: 'var(--tl-teal)' }} />
            <div className="font-mono text-5xl font-bold leading-none mb-2 gradient-text">
              0
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--tl-text-primary)' }}>
              Zero candidates ghosted
            </p>
            <p className="text-xs" style={{ color: 'var(--tl-text-secondary)' }}>
              Every rejection includes an AI-written, specific reason.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

type HowStep = {
  num: string
  title: string
  description: string
  tags: string[]
  svg: React.ReactNode
  flip: boolean
}

const HOW_STEPS: HowStep[] = [
  {
    num: '01',
    title: 'Post & Attract',
    description:
      'Describe the role in plain English. AI structures it, adds salary benchmarks, and auto-distributes to 20+ job boards. Your ideal candidate profile is predicted before the first application arrives.',
    tags: ['AI-enhanced JDs', 'Salary auto-fill', '20+ job boards'],
    svg: (
      <svg viewBox="0 0 260 160" className="w-full" style={{ height: 160 }} aria-hidden="true">
        <rect x={12} y={12} width={236} height={136} rx={12} fill="#111318" stroke="rgba(242,240,232,0.08)" strokeWidth="1" />
        <rect x={28} y={28} width={140} height={10} rx={5} fill="#1A1D26" />
        <rect x={28} y={46} width={200} height={7} rx={3.5} fill="#1A1D26" />
        <rect x={28} y={61} width={180} height={7} rx={3.5} fill="#1A1D26" />
        <rect x={28} y={76} width={160} height={7} rx={3.5} fill="#1A1D26" />
        <rect x={28} y={100} width={80} height={8} rx={4} fill="#C9A84C22" stroke="#C9A84C55" strokeWidth="1" />
        <text x={68} y={109} textAnchor="middle" fontSize="7" fill="#C9A84C" fontWeight="700">AI Processing…</text>
        <motion.rect x={28} y={100} width={80} height={8} rx={4}
          fill="transparent"
          stroke="#C9A84C"
          strokeWidth="1"
          strokeDasharray="4 4"
          animate={{ strokeDashoffset: [40, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        <rect x={120} y={100} width={120} height={8} rx={4} fill="#1ECDB322" />
        <text x={180} y={108.5} textAnchor="middle" fontSize="6.5" fill="#1ECDB3" fontWeight="600">✓ Salary: $160K–$220K</text>
        <rect x={28} y={120} width={200} height={1} rx={0.5} fill="rgba(242,240,232,0.04)" />
        <text x={28} y={135} fontSize="7" fill="#5C5A54">Go live on 20+ boards automatically</text>
      </svg>
    ),
    flip: false,
  },
  {
    num: '02',
    title: 'Match & Shortlist',
    description:
      'Every application is scored across 47 dimensions: skills, experience depth, cultural signals, growth trajectory, and salary alignment. Your top 12 surface in seconds — ranked, explained, interview-ready.',
    tags: ['47-dimension scoring', 'Explainable AI', 'Ranked by fit'],
    svg: (
      <svg viewBox="0 0 260 160" className="w-full" style={{ height: 160 }} aria-hidden="true">
        <rect x={12} y={12} width={236} height={136} rx={12} fill="#111318" stroke="rgba(242,240,232,0.08)" strokeWidth="1" />
        {[
          { init: 'ER', score: 97, color: '#4A9FFF', y: 28 },
          { init: 'MJ', score: 91, color: '#1ECDB3', y: 60 },
          { init: 'SK', score: 84, color: '#C9A84C', y: 92 },
        ].map((c) => (
          <g key={c.init}>
            <circle cx={40} cy={c.y + 8} r={10} fill={`${c.color}22`} stroke={c.color} strokeWidth="1.2" />
            <text x={40} y={c.y + 12} textAnchor="middle" fontSize="7" fontWeight="800" fill={c.color}>{c.init}</text>
            <rect x={56} y={c.y + 2} width={`${c.score * 1.5}px`} height={6} rx={3} fill={`${c.color}33`} />
            <motion.rect x={56} y={c.y + 2} width={0} height={6} rx={3} fill={c.color}
              animate={{ width: c.score * 1.5 }}
              transition={{ duration: 1.1, delay: 0.4, ease: 'easeOut' }}
            />
            <text x={205} y={c.y + 10} fontSize="8" fontWeight="700" fill={c.color}>{c.score}%</text>
          </g>
        ))}
        <text x={28} y={140} fontSize="7" fill="#5C5A54">835 others assessed · you see the top 12</text>
      </svg>
    ),
    flip: true,
  },
  {
    num: '03',
    title: 'Hire & Track',
    description:
      'Schedule interviews in one click. Move candidates through your pipeline. Make offers. Every rejected candidate receives an AI-crafted, specific explanation — not silence. Post-hire outcomes tracked automatically.',
    tags: ['1-click scheduling', 'Pipeline automation', 'Outcomes tracker'],
    svg: (
      <svg viewBox="0 0 260 160" className="w-full" style={{ height: 160 }} aria-hidden="true">
        <rect x={12} y={12} width={236} height={136} rx={12} fill="#111318" stroke="rgba(242,240,232,0.08)" strokeWidth="1" />
        {[
          { label: 'Interview', color: '#C9A84C', x: 24,  inits: ['ER', 'MJ'] },
          { label: 'Offer',     color: '#1ECDB3', x: 100, inits: ['SK'] },
          { label: 'Hired',     color: '#4A9FFF', x: 176, inits: ['AL'] },
        ].map((col) => (
          <g key={col.label}>
            <rect x={col.x} y={24} width={64} height={112} rx={8} fill={`${col.color}08`} stroke={`${col.color}30`} strokeWidth="1" />
            <text x={col.x + 32} y={40} textAnchor="middle" fontSize="7" fontWeight="700" fill={col.color}>{col.label}</text>
            {col.inits.map((init, ii) => (
              <g key={init}>
                <rect x={col.x + 8} y={50 + ii * 36} width={48} height={26} rx={6} fill="#1A1D26" stroke="rgba(242,240,232,0.06)" strokeWidth="1" />
                <circle cx={col.x + 22} cy={50 + ii * 36 + 13} r={8} fill={`${col.color}22`} stroke={col.color} strokeWidth="1" />
                <text x={col.x + 22} y={50 + ii * 36 + 17} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={col.color}>{init}</text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    ),
    flip: false,
  },
]

function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <section id="how-it-works" className="py-28 max-w-7xl mx-auto px-6">
      <div ref={headerRef} className="text-center mb-20">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="section-eyebrow mb-5 inline-block"
        >
          How It Works
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="font-display text-4xl md:text-5xl mb-4"
        >
          From first click to signed offer.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          Three steps. No bloat. No black holes.
        </motion.p>
      </div>

      <div className="space-y-28">
        {HOW_STEPS.map((step) => (
          <HowStep key={step.num} step={step} easeOut={EASE_OUT} />
        ))}
      </div>
    </section>
  )
}

function HowStep({
  step,
  easeOut,
}: {
  step: HowStep
  easeOut: [number, number, number, number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-16 items-center ${
        step.flip ? '' : ''
      }`}
    >
      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, x: step.flip ? 36 : -36 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: easeOut }}
        className={step.flip ? 'lg:order-2' : ''}
      >
        <span
          className="font-mono text-7xl font-bold leading-none mb-4 block select-none"
          style={{ color: 'rgba(201,168,76,0.10)' }}
        >
          {step.num}
        </span>
        <h3
          className="text-3xl font-bold mb-4"
          style={{ color: 'var(--tl-text-primary)' }}
        >
          {step.title}
        </h3>
        <p
          className="leading-relaxed mb-6 text-base"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          {step.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {step.tags.map((tag) => (
            <span key={tag} className="tl-tag tl-tag-gold text-xs">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* SVG illustration side */}
      <motion.div
        initial={{ opacity: 0, x: step.flip ? -36 : 36 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
        className={`tl-card p-6 ${step.flip ? 'lg:order-1' : ''}`}
      >
        {step.svg}
      </motion.div>
    </div>
  )
}

// ─── FeatureDeepDives ─────────────────────────────────────────────────────────

type Feature = {
  icon: React.ReactNode
  tag: string
  title: string
  description: string
  mock: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    icon: <Brain className="w-5 h-5" style={{ color: 'var(--tl-gold)' }} />,
    tag: 'AI Match Engine',
    title: 'Your next great hire is already in your inbox.',
    description:
      'TalentLoop reads between the lines of every application — understanding career trajectory, skill depth, and cultural signals that keyword filters miss entirely. Then it explains, in plain language, exactly why it ranked each candidate.',
    mock: (
      <div className="space-y-3 p-4">
        {[
          { init: 'ER', name: 'Emma Rodriguez', title: 'Sr. Frontend', score: 97, color: '#4A9FFF', tags: ['React', 'TypeScript', 'Performance'] },
          { init: 'MC', name: 'Marcus Chen',    title: 'Full Stack',  score: 89, color: '#1ECDB3', tags: ['Node.js', 'React', 'AWS'] },
          { init: 'PS', name: 'Priya Sharma',   title: 'Frontend Dev', score: 84, color: '#C9A84C', tags: ['Vue', 'TypeScript'] },
        ].map((c, i) => (
          <div key={c.name}>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}55` }}
              >
                {c.init}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none mb-0.5" style={{ color: 'var(--tl-text-primary)' }}>
                  {c.name}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tl-text-tertiary)' }}>{c.title}</p>
              </div>
              <span className="font-mono text-sm font-bold shrink-0" style={{ color: c.color }}>
                {c.score}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'var(--tl-bg-overlay)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: c.color }}
                initial={{ width: 0 }}
                animate={{ width: `${c.score}%` }}
                transition={{ delay: 0.3 + i * 0.15, duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex gap-1.5">
              {c.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--tl-bg-overlay)', color: 'var(--tl-text-tertiary)', border: '1px solid var(--tl-border-subtle)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: <Shield className="w-5 h-5" style={{ color: 'var(--tl-teal)' }} />,
    tag: 'Zero-Ghosting Promise',
    title: 'The platform that treats job seekers like human beings.',
    description:
      "When a company rejects a candidate, TalentLoop automatically sends them AI-crafted feedback. Not a template. Real, specific, actionable reasoning — within 24 hours of rejection. It's not just good ethics. Companies that use it see 40% higher offer acceptance.",
    mock: (
      <div className="p-4">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--tl-bg-base)', border: '1px solid var(--tl-border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold" style={{ color: 'var(--tl-text-secondary)' }}>
              Application Update
            </p>
            <span className="tl-tag tl-tag-teal text-[9px]">Sent automatically</span>
          </div>
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--tl-text-primary)' }}>
            Update on your Senior Engineer application at Notion
          </p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--tl-text-secondary)' }}>
            Hi Marcus, thanks for applying. After review, we found your Node.js
            experience (3 years) is below our minimum (5 years) for this role.
            We'd recommend roles at the Mid level where your skills are a
            genuine fit. Your systems architecture background is exceptional.
          </p>
          <p className="text-xs italic" style={{ color: 'var(--tl-text-tertiary)' }}>
            — TalentLoop AI, on behalf of the Notion Team
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--tl-border-subtle)' }}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--tl-teal)' }} />
            <p className="text-[10px]" style={{ color: 'var(--tl-text-tertiary)' }}>
              Marcus received this within 24 hours of rejection
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: <TrendingUp className="w-5 h-5" style={{ color: 'var(--tl-blue)' }} />,
    tag: 'Pipeline Intelligence',
    title: 'Recruiters see the full picture. Every stage, every signal.',
    description:
      "Your hiring pipeline is a living intelligence layer. Every stage move triggers the right candidate communication. Recruiters see bottlenecks before they happen. Hiring managers stay aligned. Candidates always know where they stand.",
    mock: (
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'New',       color: '#4A9FFF', inits: ['AL', 'PR'] },
            { label: 'Screen',    color: '#9B59B6', inits: ['SK', 'CW'] },
            { label: 'Phone',     color: '#1ECDB3', inits: ['MJ']       },
            { label: 'Interview', color: '#C9A84C', inits: ['ER']       },
            { label: 'Offer',     color: '#2ECC71', inits: ['AC']       },
          ].map((col, ci) => (
            <div
              key={col.label}
              className="rounded-lg p-2"
              style={{ background: 'var(--tl-bg-base)', border: '1px solid var(--tl-border-subtle)' }}
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.color }} />
                <span className="text-[7px] font-semibold truncate" style={{ color: 'var(--tl-text-tertiary)' }}>
                  {col.label}
                </span>
              </div>
              <div className="space-y-1.5">
                {col.inits.map((init, ci2) => (
                  <motion.div
                    key={init}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold mx-auto"
                    style={{ background: `${col.color}22`, color: col.color, border: `1px solid ${col.color}44` }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{
                      duration: 3.5 + ci2 * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: ci * 0.3 + ci2 * 0.4,
                    }}
                  >
                    {init}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-3 flex items-center gap-2 text-[10px]"
          style={{ color: 'var(--tl-text-tertiary)' }}
        >
          <Users className="w-3 h-3" />
          847 applicants · 12 active · 3 offers pending
        </div>
      </div>
    ),
  },
]

function FeatureDeepDives() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <section
      className="py-28 border-y"
      style={{
        borderColor: 'var(--tl-border-subtle)',
        background: 'var(--tl-bg-surface)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headerRef} className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
            className="section-eyebrow mb-5 inline-block"
          >
            Platform Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-display text-4xl md:text-5xl mb-4"
          >
            Built different. By design.
          </motion.h2>
        </div>

        <div className="space-y-20">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.tag} feature={feature} idx={idx} easeOut={EASE_OUT} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  idx,
  easeOut,
}: {
  feature: Feature
  idx: number
  easeOut: [number, number, number, number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const flip = idx % 2 === 1

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, x: flip ? 36 : -36 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, ease: easeOut }}
        className={flip ? 'lg:order-2' : ''}
      >
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--tl-bg-elevated)', border: '1px solid var(--tl-border-default)' }}
          >
            {feature.icon}
          </div>
          <span className="section-eyebrow">{feature.tag}</span>
        </div>
        <h2
          className="font-display text-3xl md:text-4xl leading-[1.15] mb-5"
          style={{ color: 'var(--tl-text-primary)' }}
        >
          {feature.title}
        </h2>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          {feature.description}
        </p>
      </motion.div>

      {/* Mock UI */}
      <motion.div
        initial={{ opacity: 0, x: flip ? -36 : 36 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.12, ease: easeOut }}
        className={`tl-card overflow-hidden ${flip ? 'lg:order-1' : ''}`}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--tl-border-subtle)', background: 'var(--tl-bg-elevated)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5C7A55' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C9A84C55' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#1ECDB355' }} />
          <div className="flex-1 flex justify-center">
            <span
              className="text-[9px] px-3 py-0.5 rounded"
              style={{
                background: 'var(--tl-bg-base)',
                color: 'var(--tl-text-tertiary)',
                border: '1px solid var(--tl-border-subtle)',
              }}
            >
              app.talentloop.ai
            </span>
          </div>
        </div>
        {feature.mock}
      </motion.div>
    </div>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote:
      'We went from 6 weeks to 18 days for senior roles. The AI scoring is eerily accurate — it keeps surfacing people we\'d have missed completely.',
    name: 'Sarah Mitchell',
    role: 'Recruiter',
    company: 'Stripe',
    init: 'SM',
    color: '#4A9FFF',
    tag: 'Hiring Team',
    tagClass: 'tl-tag-blue',
  },
  {
    quote:
      'Best hiring tooling I\'ve seen in 12 years of VP-level roles. The pipeline intelligence keeps my entire team aligned without a single Slack thread.',
    name: 'David Park',
    role: 'VP Engineering',
    company: 'Notion',
    init: 'DP',
    color: '#1ECDB3',
    tag: 'Hiring Team',
    tagClass: 'tl-tag-teal',
  },
  {
    quote:
      'I applied to 8 companies through TalentLoop. Got 6 interviews and landed a 40% salary increase. And I actually got feedback on the two I didn\'t get.',
    name: 'Aisha Thompson',
    role: 'Software Engineer',
    company: 'Hired via TalentLoop',
    init: 'AT',
    color: '#C9A84C',
    tag: 'Job Seeker',
    tagClass: 'tl-tag-gold',
  },
]

function Testimonials() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="py-28 max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="section-eyebrow mb-5 inline-block"
        >
          Social Proof
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="font-display text-4xl md:text-5xl mb-4"
        >
          Loved on both sides of the table.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="text-lg"
          style={{ color: 'var(--tl-text-secondary)' }}
        >
          The only platform with 5-star reviews from recruiters and job seekers alike.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.55 }}
            className="tl-card p-8 flex flex-col hover:shadow-gold transition-all duration-300"
            style={{ borderLeft: `2px solid transparent` }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderLeftColor = t.color
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement
              el.style.borderLeftColor = 'transparent'
            }}
          >
            <div className="flex items-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star key={si} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--tl-gold)' }} />
              ))}
            </div>
            <p
              className="text-base italic leading-relaxed flex-1 mb-6"
              style={{ color: 'var(--tl-text-secondary)' }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid var(--tl-border-subtle)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
              >
                {t.init}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none mb-0.5" style={{ color: 'var(--tl-text-primary)' }}>
                  {t.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--tl-text-tertiary)' }}>
                  {t.role} · {t.company}
                </p>
              </div>
              <span className={`tl-tag ${t.tagClass} text-[9px] shrink-0`}>{t.tag}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {['4.9/5 on G2', '4.8/5 on Capterra', 'SOC2 Type II', '#1 ATS on Product Hunt'].map((badge) => (
          <span
            key={badge}
            className="tl-tag tl-tag-gold text-xs"
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  )
}

// ─── PricingSection ───────────────────────────────────────────────────────────

function PricingSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section
      ref={ref}
      className="py-28 border-y"
      style={{
        borderColor: 'var(--tl-border-subtle)',
        background: 'var(--tl-bg-surface)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-eyebrow mb-5 inline-block">Pricing</span>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Start free. Scale as you grow.
          </h2>
          <p
            className="text-lg max-w-xl mx-auto mb-10"
            style={{ color: 'var(--tl-text-secondary)' }}
          >
            Every plan includes unlimited candidates, real-time pipeline, and AI matching.
            No seat fees for hiring managers.
          </p>

          {/* Toggle */}
          <div
            className="inline-flex items-center p-1 rounded-xl"
            style={{
              background: 'var(--tl-bg-elevated)',
              border: '1px solid var(--tl-border-default)',
            }}
          >
            {(['Monthly', 'Annual'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setIsAnnual(tab === 'Annual')}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={
                  (tab === 'Annual') === isAnnual
                    ? {
                        background: 'var(--tl-bg-surface)',
                        color: 'var(--tl-text-primary)',
                        border: '1px solid var(--tl-border-default)',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--tl-text-secondary)',
                        border: '1px solid transparent',
                      }
                }
              >
                {tab}
                {tab === 'Annual' && (
                  <span
                    className="ml-2 text-[10px] font-bold"
                    style={{ color: 'var(--tl-teal)' }}
                  >
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
              className={`relative flex flex-col p-8 ${
                plan.highlighted ? 'tl-card-gold' : 'tl-card'
              } ${plan.highlighted ? 'scale-[1.02]' : ''}`}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 section-eyebrow text-[10px] px-3 py-1 whitespace-nowrap"
                  style={{
                    background: plan.highlighted ? 'var(--tl-gold)' : 'var(--tl-bg-surface)',
                    color: plan.highlighted ? 'var(--tl-text-inverse)' : 'var(--tl-gold)',
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <h3
                className="text-lg font-bold mb-1"
                style={{ color: 'var(--tl-text-primary)' }}
              >
                {plan.name}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--tl-text-secondary)' }}>
                {plan.description}
              </p>

              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isAnnual ? 'annual' : 'monthly'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.22 }}
                  >
                    <span
                      className="font-mono text-5xl font-bold"
                      style={{ color: plan.highlighted ? 'var(--tl-gold)' : 'var(--tl-text-primary)' }}
                    >
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-base ml-1" style={{ color: 'var(--tl-text-secondary)' }}>
                      /mo
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: 'var(--tl-text-secondary)' }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 shrink-0 mt-0.5"
                      style={{ color: plan.highlighted ? 'var(--tl-gold)' : 'var(--tl-teal)' }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === 'enterprise' ? '/contact' : '/auth/register?role=company'}
                className={`w-full text-center py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  plan.highlighted ? 'btn-gold' : 'btn-ghost'
                }`}
              >
                {plan.id === 'enterprise' ? 'Talk to Sales' : 'Start Free Trial'}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'var(--tl-gold)' }}
          >
            Not sure which plan? Talk to our team <ArrowRight className="w-3.5 h-3.5" />
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
  const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <section
      ref={ref}
      className="py-32 relative overflow-hidden"
      style={{ background: '#0A0B0F' }}
    >
      {/* Gold gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 65%)',
        }}
      />
      {/* Animated gold pulse */}
      <motion.div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)',
          filter: 'blur(48px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <span className="section-eyebrow mb-8 inline-block">Get Started Today</span>

          <h2 className="font-display text-5xl md:text-7xl leading-[1.05] mb-7">
            Ready to hire{' '}
            <span className="gradient-text">smarter?</span>
          </h2>

          <p
            className="text-xl leading-relaxed mb-12"
            style={{ color: 'var(--tl-text-secondary)' }}
          >
            Join 200+ companies and 50,000 job seekers who&apos;ve already
            transformed how hiring works — for everyone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/auth/register?role=company"
              className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-base font-semibold shadow-gold"
            >
              Start Hiring Smarter
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?role=talent"
              className="btn-ghost inline-flex items-center gap-2 px-8 py-4 text-base font-semibold"
            >
              Find Your Next Role
            </Link>
          </div>

          <p
            className="text-sm"
            style={{ color: 'var(--tl-text-tertiary)' }}
          >
            No credit card required · 14-day free trial · Cancel anytime · SOC2 compliant
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── HomePage (default export) ────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ background: 'var(--tl-bg-base)', overflowX: 'hidden' }}>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <LogoTicker />
        <DualPromise />
        <BentoStats />
        <HowItWorks />
        <FeatureDeepDives />
        <Testimonials />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
