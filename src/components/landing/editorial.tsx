'use client'

/**
 * Editorial primitives — oversized serif italics, hand-drawn underline,
 * mouse-tracking spotlight, ticker counter, grain overlay.
 *
 * Used across /, /product, /how-it-works, /customers to give the platform
 * an editorial / magazine feel rather than a stock SaaS look.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Italic serif emphasis ───────────────────────────────────────────────────

export function Em({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <em
      className={cn(
        'not-italic',
        '[font-family:"Fraunces","Instrument_Serif",Georgia,serif]',
        'italic font-light tracking-[-0.01em]',
        // Use Fraunces' optical-size + SOFT axes for display warmth.
        '[font-variation-settings:"opsz"_144,"SOFT"_50,"WONK"_1]',
        className,
      )}
    >
      {children}
    </em>
  )
}

// ─── Display heading wrapper (Fraunces variable, oversized) ─────────────────

export function Display({
  children,
  className,
  as: Tag = 'span',
}: {
  children: React.ReactNode
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'blockquote'
}) {
  return (
    <Tag
      className={cn(
        '[font-family:"Fraunces",Georgia,serif]',
        // Default to a refined display setting; callers override sizes.
        '[font-variation-settings:"opsz"_144,"SOFT"_30,"WONK"_0]',
        'font-light tracking-[-0.04em]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

// ─── Tabular monospace numerals (financial-report feel) ──────────────────────

export function MonoNum({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        '[font-family:"JetBrains_Mono",ui-monospace,monospace]',
        'tabular-nums tracking-tight',
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── Dotted leader line (menu / financial schedule style) ────────────────────

export function DottedLeader({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex-1 self-end mb-1 mx-2 border-b border-dotted border-tl-text-tertiary/40',
        className,
      )}
    />
  )
}

// ─── Hand-drawn underline (SVG path) ─────────────────────────────────────────

export function ScribbleUnderline({
  className,
  color = '#C9A84C',
  delay = 0.15,
}: {
  className?: string
  color?: string
  delay?: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      className={cn('absolute left-0 right-0 -bottom-1 w-full h-3 pointer-events-none', className)}
    >
      <motion.path
        d="M2 11 C 40 6, 80 13, 110 8 S 180 5, 198 9"
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.85 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

// ─── Hand-drawn circle (oversized swoop) ─────────────────────────────────────

export function ScribbleCircle({
  className,
  color = '#4F46E5',
  delay = 0.2,
}: {
  className?: string
  color?: string
  delay?: number
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 90"
      preserveAspectRatio="none"
      className={cn('absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] pointer-events-none', className)}
    >
      <motion.path
        d="M210 22 C 180 4, 80 0, 30 18 S -8 70, 40 84 S 200 78, 212 50 S 218 30, 200 16"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.7 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

// ─── Animated ticker (counts to a target on scroll-into-view) ────────────────

export function Ticker({
  to,
  duration = 1.4,
  prefix = '',
  suffix = '',
  className,
  decimals = 0,
}: {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => {
    const num = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
    return `${prefix}${num}${suffix}`
  })
  useEffect(() => {
    if (inView) mv.set(to)
  }, [inView, to, mv])
  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
    </span>
  )
}

// ─── Grain overlay (very subtle SVG noise) ───────────────────────────────────

export function Grain({ opacity = 0.04 }: { opacity?: number }) {
  // Inline SVG turbulence — masks-pattern keeps it cheap.
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none mix-blend-multiply"
      style={{
        opacity,
        backgroundImage:
          'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
        backgroundSize: '160px 160px',
      }}
    />
  )
}

// ─── Spotlight that follows the cursor ───────────────────────────────────────

export function MouseSpotlight({
  size = 360,
  color = 'rgba(79,70,229,0.16)',
  className,
  children,
}: {
  size?: number
  color?: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  function handle(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handle}
      onMouseLeave={() => setPos(null)}
      className={cn('relative', className)}
    >
      {pos && (
        <div
          aria-hidden
          className="absolute pointer-events-none rounded-full transition-opacity"
          style={{
            left: pos.x - size / 2,
            top: pos.y - size / 2,
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  )
}

// ─── Hard-offset shadow card (editorial, not blurry) ─────────────────────────

export function StackCard({
  children,
  offset = 6,
  shadowColor = 'rgba(17,24,39,0.12)',
  className,
}: {
  children: React.ReactNode
  offset?: number
  shadowColor?: string
  className?: string
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl"
        style={{
          transform: `translate(${offset}px, ${offset}px)`,
          background: shadowColor,
        }}
      />
      <div className={cn('relative rounded-2xl', className)}>{children}</div>
    </div>
  )
}

// ─── Marquee strip (horizontal scroll loop) ──────────────────────────────────

export function Marquee({
  items,
  reverse = false,
  speed = 36,
  className,
  itemClassName,
  pauseOnHover = false,
  separator = '·',
}: {
  items: React.ReactNode[]
  reverse?: boolean
  speed?: number
  className?: string
  itemClassName?: string
  pauseOnHover?: boolean
  separator?: string
}) {
  const track = [...items, ...items]
  return (
    <div
      className={cn('relative w-full overflow-hidden', pauseOnHover && 'group', className)}
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)',
      }}
    >
      <motion.div
        className={cn('flex items-center gap-8 whitespace-nowrap will-change-transform', pauseOnHover && 'group-hover:[animation-play-state:paused]')}
        animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {track.map((item, i) => (
          <span key={i} className={cn('shrink-0 inline-flex items-center gap-8', itemClassName)}>
            {item}
            <span className="text-tl-text-tertiary/40 text-2xl">{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
