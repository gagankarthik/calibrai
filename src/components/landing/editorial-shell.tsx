'use client'

/**
 * Editorial chrome: a thin masthead bar that fades in after the hero and a
 * fixed right-rail chapter index that highlights the section currently in
 * view. Both pieces only render on the landing page so they don't fight
 * with the navbar on sub-pages.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Running header (newspaper masthead bar) ─────────────────────────────────

interface RunningHeaderProps {
  edition?: string
  date?: string
  issue?: string
  visibleAfter?: number // px scrolled before it appears
}

export function RunningHeader({
  edition = 'TalentBridge',
  date = '2026',
  issue = 'Issue 04 · The AI Hiring Edition',
  visibleAfter = 600,
}: RunningHeaderProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > visibleAfter)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [visibleAfter])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="masthead"
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="hidden md:flex fixed top-[78px] inset-x-0 z-30 px-6 lg:px-12 pointer-events-none"
        >
          <div className="mx-auto max-w-6xl w-full pointer-events-auto">
            <div className="flex items-center gap-3 text-[10px] tracking-[0.22em] uppercase font-semibold text-tl-text-tertiary/80 px-4 py-2 rounded-full bg-tl-bg-surface/85 backdrop-blur-md border border-tl-border-subtle shadow-sm">
              <span>{edition}</span>
              <span className="h-px flex-1 bg-tl-text-tertiary/20" />
              <span className="hidden lg:inline">{issue}</span>
              <span className="hidden lg:inline h-px flex-1 bg-tl-text-tertiary/20" />
              <span>{date}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Chapter index (right-rail, scroll-tracking) ────────────────────────────

interface Chapter {
  id: string
  title: string
  number: string
}

interface ChapterIndexProps {
  chapters: Chapter[]
}

export function ChapterIndex({ chapters }: ChapterIndexProps) {
  const [active, setActive] = useState<string>(chapters[0]?.id ?? '')
  const [visible, setVisible] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        // Show the index after we've scrolled past the hero.
        setVisible(window.scrollY > 700)

        // Active chapter = closest-to-top section whose top is <= 30% viewport.
        const threshold = window.innerHeight * 0.3
        let current = chapters[0]?.id ?? ''
        for (const c of chapters) {
          const el = document.getElementById(c.id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          if (rect.top - threshold <= 0) current = c.id
        }
        setActive(current)
        ticking.current = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [chapters])

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="chapter-index"
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          aria-label="Chapters"
          className="hidden xl:flex fixed top-1/2 -translate-y-1/2 right-6 z-30 flex-col gap-1.5 max-w-[14rem]"
        >
          <p className="text-[9px] tracking-[0.22em] uppercase font-bold text-tl-text-tertiary mb-2 pl-3">
            In this issue
          </p>
          {chapters.map((c) => {
            const isActive = c.id === active
            return (
              <a
                key={c.id}
                href={`#${c.id}`}
                className={cn(
                  'group relative flex items-baseline gap-3 pl-3 pr-2 py-1.5 rounded-md transition-colors',
                  isActive
                    ? 'text-tl-text-primary'
                    : 'text-tl-text-tertiary hover:text-tl-text-secondary',
                )}
              >
                {/* Active indicator bar */}
                <motion.span
                  aria-hidden
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-full',
                    isActive ? 'bg-tl-gold' : 'bg-tl-text-tertiary/20',
                  )}
                  initial={false}
                  animate={{
                    height: isActive ? 18 : 8,
                  }}
                  transition={{ duration: 0.25, ease: EASE }}
                />
                <span className="text-[10px] font-bold tabular-nums tracking-wider">
                  {c.number}
                </span>
                <span className="text-[12px] font-medium leading-tight tracking-tight">
                  {c.title}
                </span>
              </a>
            )
          })}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
