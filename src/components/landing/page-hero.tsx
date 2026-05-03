'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  eyebrow: string
  title: React.ReactNode
  subtitle: string
  className?: string
  rightSlot?: React.ReactNode
}

const EASE = [0.16, 1, 0.3, 1] as const

export function PageHero({ eyebrow, title, subtitle, className, rightSlot }: PageHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4])

  return (
    <section ref={ref} className={cn('relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden', className)}>
      {/* Layered gradient mesh */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(at 20% 18%, rgba(79,70,229,0.18) 0px, transparent 55%),' +
              'radial-gradient(at 80% 24%, rgba(5,150,105,0.14) 0px, transparent 55%),' +
              'radial-gradient(at 50% 100%, rgba(2,132,199,0.10) 0px, transparent 60%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(79,70,229,0.18) 1.1px, transparent 1.6px)',
            backgroundSize: '32px 32px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 30%, black 25%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 30%, black 25%, transparent 80%)',
          }}
        />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-[1.5fr_1fr] gap-10 items-center"
      >
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tl-indigo/10 border border-tl-indigo/25 text-[11px] font-semibold uppercase tracking-[0.18em] text-tl-indigo mb-5"
          >
            {eyebrow}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="text-4xl sm:text-6xl font-semibold tracking-tight text-tl-text-primary leading-[1.05]"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-5 text-lg text-tl-text-secondary leading-relaxed max-w-xl"
          >
            {subtitle}
          </motion.p>
        </div>
        {rightSlot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="hidden lg:block"
          >
            {rightSlot}
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}
