'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LogoMarqueeProps {
  logos?: string[]
  speed?: number // seconds for one full scroll
  reverse?: boolean
  className?: string
  eyebrow?: string
}

const DEFAULT_LOGOS = [
  'Acme Corp',
  'Nexus Labs',
  'Veritas AI',
  'Archon',
  'Dropfleet',
  'Meridian',
  'Calypso',
  'Northwind',
  'Helio',
  'Strata',
  'Bayline',
  'Orbital',
]

export function LogoMarquee({
  logos = DEFAULT_LOGOS,
  speed = 28,
  reverse = false,
  className,
  eyebrow = 'Trusted by talent teams at',
}: LogoMarqueeProps) {
  // Duplicate the list so the loop is seamless.
  const track = [...logos, ...logos]

  return (
    <section className={cn('relative py-12 sm:py-14 overflow-hidden', className)}>
      {eyebrow && (
        <p className="text-center text-[11.5px] font-semibold text-tl-text-tertiary uppercase tracking-[0.18em] mb-7">
          {eyebrow}
        </p>
      )}

      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 8%, black 92%, transparent 100%)',
        }}
      >
        <motion.div
          className="flex gap-12 sm:gap-16 whitespace-nowrap will-change-transform"
          animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
          transition={{
            duration: speed,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {track.map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="text-[15px] sm:text-[16px] font-semibold text-tl-text-tertiary/80 hover:text-tl-text-secondary transition-colors select-none cursor-default shrink-0"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
