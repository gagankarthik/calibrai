'use client'

/**
 * Dark interactive stage for the hero. Replaces the static video with:
 * - Mouse-tracked spotlight + parallax orbs
 * - Drifting particle field (DOM-only, no canvas)
 * - Subtle dotted grid that shifts with cursor
 * - Conic gradient sweep + grain overlay
 *
 * Designed so the existing white hero copy stays readable on top.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Particle {
  id: number
  left: number
  top: number
  size: number
  delay: number
  duration: number
  drift: number
  opacity: number
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 1 + Math.random() * 2.4,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 14,
    drift: 12 + Math.random() * 36,
    opacity: 0.15 + Math.random() * 0.55,
  }))
}

export function InteractiveHeroBg() {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Two motion values that hold the mouse position normalized to 0..1
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 60, damping: 22, mass: 0.8 })
  const sy = useSpring(my, { stiffness: 60, damping: 22, mass: 0.8 })

  // Translate cursor into orb centers (different sensitivity per orb to give parallax)
  const orb1X = useTransform(sx, (v) => `${20 + v * 22}%`)
  const orb1Y = useTransform(sy, (v) => `${15 + v * 18}%`)
  const orb2X = useTransform(sx, (v) => `${85 - v * 18}%`)
  const orb2Y = useTransform(sy, (v) => `${78 - v * 14}%`)
  const orb3X = useTransform(sx, (v) => `${55 + (v - 0.5) * 30}%`)
  const orb3Y = useTransform(sy, (v) => `${48 + (v - 0.5) * 22}%`)

  // Spotlight that follows the cursor (smaller, sharper than the orbs)
  const spotX = useTransform(sx, (v) => `${v * 100}%`)
  const spotY = useTransform(sy, (v) => `${v * 100}%`)

  // Subtle parallax on the dotted grid (a few pixels of shift)
  const gridX = useTransform(sx, (v) => `${(v - 0.5) * 14}px`)
  const gridY = useTransform(sy, (v) => `${(v - 0.5) * 14}px`)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  // Particle field — only render after mount to avoid SSR mismatch.
  // Cut count on mobile so the page stays light there.
  const particles = useMemo(
    () => (mounted ? makeParticles(isMobile ? 22 : 56) : []),
    [mounted, isMobile],
  )

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="absolute inset-0 z-0 overflow-hidden bg-[#0A0B14]"
    >
      {/* Deep base mesh ── conic + radial gradient layers ─────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'conic-gradient(from 200deg at 30% 40%, rgba(79,70,229,0.22) 0deg, rgba(5,150,105,0.14) 90deg, rgba(2,132,199,0.10) 180deg, rgba(201,168,76,0.10) 270deg, rgba(79,70,229,0.22) 360deg)',
          filter: 'blur(60px)',
          opacity: 0.7,
        }}
      />

      {/* Parallax orb 1 — indigo */}
      <motion.div
        aria-hidden
        style={{ left: orb1X, top: orb1Y }}
        className="absolute w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(79,70,229,0) 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Parallax orb 2 — emerald */}
      <motion.div
        aria-hidden
        style={{ left: orb2X, top: orb2Y }}
        className="absolute w-[460px] h-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(5,150,105,0) 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Parallax orb 3 — amber accent */}
      <motion.div
        aria-hidden
        style={{ left: orb3X, top: orb3Y }}
        className="absolute w-[360px] h-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,168,76,0.40) 0%, rgba(201,168,76,0) 70%)',
            filter: 'blur(40px)',
          }}
        />
      </motion.div>

      {/* Dotted grid — parallax */}
      <motion.div
        aria-hidden
        style={{ x: gridX, y: gridY }}
        className="absolute inset-[-12px] opacity-50"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.20) 1px, transparent 1.6px)',
            backgroundSize: '28px 28px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 85%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 50%, black 35%, transparent 85%)',
          }}
        />
      </motion.div>

      {/* Cursor spotlight (small + sharp on top of the soft orbs) */}
      <motion.div
        aria-hidden
        style={{ left: spotX, top: spotY }}
        className="absolute w-[480px] h-[480px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)',
          }}
        />
      </motion.div>

      {/* Drifting particles (DOM-cheap; CSS keyframes via inline style) */}
      <style jsx>{`
        @keyframes drift-up {
          0% { transform: translate(0, 0); opacity: 0; }
          15% { opacity: var(--p-opacity); }
          50% { transform: translate(var(--p-drift-x), var(--p-drift-y-half)); }
          85% { opacity: var(--p-opacity); }
          100% { transform: translate(0, var(--p-drift-y)); opacity: 0; }
        }
        .particle {
          animation: drift-up var(--p-duration) ease-in-out infinite;
          animation-delay: var(--p-delay);
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className="particle absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            // CSS variables consumed by the keyframes above
            ['--p-duration' as string]: `${p.duration}s`,
            ['--p-delay' as string]: `${p.delay}s`,
            ['--p-opacity' as string]: p.opacity,
            ['--p-drift-x' as string]: `${(Math.random() - 0.5) * p.drift}px`,
            ['--p-drift-y' as string]: `-${p.drift}px`,
            ['--p-drift-y-half' as string]: `-${p.drift / 2}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* Vignette + grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: 0.06,
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          backgroundSize: '160px 160px',
        }}
      />
    </div>
  )
}
