'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { pricingPlans } from '@/lib/data'
import {
  ArrowRight, CheckCircle2, Play, Lock, Briefcase,
  Users, Clock, UserCheck, Check, TrendingDown,
  DollarSign, Brain, BarChart2, Zap, ChevronRight,
} from 'lucide-react'

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}

function useCounter(target: number, inView: boolean) {
  const [count, setCount] = useState(0)
  const animated = useRef(false)
  useEffect(() => {
    if (inView && !animated.current) {
      animated.current = true
      const duration = 1800
      const step = target / (duration / 16)
      let cur = 0
      const t = setInterval(() => {
        cur += step
        if (cur >= target) { setCount(target); clearInterval(t) }
        else setCount(Math.floor(cur))
      }, 16)
    }
  }, [inView, target])
  return count
}

// ─── HERO BACKGROUND ──────────────────────────────────────────────────────────

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.12), transparent 70%)' }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(270 70% 60% / 0.09), transparent 70%)' }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(160 84% 39% / 0.07), transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Animated dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="hsl(var(--foreground))" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Pixel sparkles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${10 + (i * 5.2) % 80}%`,
            top: `${15 + (i * 7.3) % 70}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -24, -48],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: i * 0.4,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── DASHBOARD MOCKUP ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(355 78% 65%)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(38 92% 55%)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(160 84% 39%)' }} />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-1.5 max-w-xs mx-auto">
            <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
            app.calibr.io/company/dashboard
          </div>
        </div>
      </div>
      <div className="p-4 bg-background">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Active Jobs', value: '12', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Applicants', value: '1,847', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'Time to Hire', value: '18d', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Hired / Mo', value: '7', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-3 rounded-xl">
              <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-3 h-3 ${s.color}`} />
              </div>
              <div className="text-base font-bold text-foreground leading-none mb-1">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-foreground">Top AI-Matched Candidates</span>
            <span className="text-[10px] text-primary cursor-pointer">View all →</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Alex Chen', role: 'Frontend Engineer', score: 96, skills: ['React', 'TypeScript'], salary: '$210K', init: 'AC', grad: 'from-blue-500 to-indigo-600' },
              { name: 'Sofia Reyes', role: 'Product Designer', score: 93, skills: ['Figma', 'Systems'], salary: '$185K', init: 'SR', grad: 'from-purple-500 to-pink-600' },
              { name: 'Marcus Johnson', role: 'Staff Engineer', score: 88, skills: ['Go', 'K8s'], salary: '$270K', init: 'MJ', grad: 'from-cyan-500 to-blue-600' },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>{c.init}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-none mb-0.5">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground">{c.role}</p>
                </div>
                <div className="hidden sm:flex gap-1">
                  {c.skills.map((sk) => (
                    <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">{sk}</span>
                  ))}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">{c.salary}</span>
                <div className="w-8 h-8 relative shrink-0">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                    <circle cx="16" cy="16" r="12" fill="none" stroke="hsl(160 84% 39%)"
                      strokeWidth="2.5" strokeDasharray={`${(c.score / 100) * 75.4} 75.4`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">{c.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ANIMATED HIRING FUNNEL ───────────────────────────────────────────────────

function HiringFunnel() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const stages = [
    { label: 'Applications Received', traditional: 1000, calibr: 1000, color: 'bg-blue-500', pct: 100 },
    { label: 'Reviewed by Recruiter', traditional: 180, calibr: 1000, color: 'bg-indigo-500', pct: 85 },
    { label: 'Qualified Candidates', traditional: 45, calibr: 940, color: 'bg-purple-500', pct: 70 },
    { label: 'Interviews Scheduled', traditional: 20, calibr: 880, color: 'bg-violet-500', pct: 55 },
    { label: 'Offers Extended', traditional: 5, calibr: 820, color: 'bg-emerald-500', pct: 40 },
    { label: 'Hires Made', traditional: 2, calibr: 780, color: 'bg-green-500', pct: 28 },
  ]

  const lostTraditional = [0, 820, 955, 980, 995, 998]
  const lostCalibr = [0, 0, 60, 120, 180, 220]

  return (
    <div ref={ref} className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-foreground text-lg">Hiring Funnel Analysis</h3>
          <p className="text-sm text-muted-foreground">Traditional ATS vs Calibr — out of 1,000 applicants</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-400/60" /> <span className="text-muted-foreground">Traditional</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500" /> <span className="text-muted-foreground">Calibr</span></div>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, i) => (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-foreground">{stage.label}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-red-500 font-semibold">{lostTraditional[i] > 0 ? `-${lostTraditional[i]}` : `${stage.traditional}`}</span>
                <span className="text-emerald-500 font-semibold">{lostCalibr[i] > 0 ? `-${lostCalibr[i]}` : `${stage.calibr}`}</span>
              </div>
            </div>
            <div className="relative h-7 rounded-lg bg-muted overflow-hidden">
              {/* Traditional bar */}
              <motion.div
                className="absolute left-0 top-0 h-1/2 rounded-t-sm bg-red-400/60"
                initial={{ width: 0 }}
                animate={inView ? { width: `${(stage.traditional / 1000) * 100}%` } : { width: 0 }}
                transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
              />
              {/* Calibr bar */}
              <motion.div
                className={`absolute left-0 bottom-0 h-1/2 rounded-b-sm ${stage.color}`}
                initial={{ width: 0 }}
                animate={inView ? { width: `${(stage.calibr / 1000) * 100}%` } : { width: 0 }}
                transition={{ duration: 1, delay: i * 0.15 + 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary callout */}
      <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-border">
        {[
          { label: 'Candidates lost by ATS', value: '998/1000', color: 'text-red-500' },
          { label: 'Candidates surfaced by Calibr', value: '780/1000', color: 'text-emerald-500' },
          { label: 'Efficiency gain', value: '40×', color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <motion.div
              className={`text-xl font-bold ${s.color}`}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.2 }}
            >
              {s.value}
            </motion.div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ANIMATED METRICS ─────────────────────────────────────────────────────────

function MetricsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const daysCount = useCounter(26, inView)
  const costCount = useCounter(38000, inView)
  const diversityCount = useCounter(40, inView)
  const accuracyCount = useCounter(94, inView)

  const bars = [
    { label: 'Jan', traditional: 52, calibr: 20 },
    { label: 'Feb', traditional: 48, calibr: 19 },
    { label: 'Mar', traditional: 55, calibr: 21 },
    { label: 'Apr', traditional: 44, calibr: 17 },
    { label: 'May', traditional: 51, calibr: 18 },
    { label: 'Jun', traditional: 46, calibr: 16 },
  ]

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-8">
      {/* KPI block */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Days saved per hire', value: daysCount, suffix: 'd', desc: 'Average: 44 days → 18 days', color: 'text-blue-500', icon: Clock },
          { label: 'Annual savings', value: costCount, prefix: '$', suffix: '', desc: 'vs. traditional recruiting cost', color: 'text-emerald-500', icon: DollarSign },
          { label: 'More diverse hires', value: diversityCount, suffix: '%', desc: 'skills-based vs keyword ATS', color: 'text-purple-500', icon: Users },
          { label: 'AI match accuracy', value: accuracyCount, suffix: '%', desc: 'vs final hiring decisions', color: 'text-amber-500', icon: Brain },
        ].map((m) => (
          <div key={m.label} className="glass-card p-5 rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
              <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
            </div>
            <div className={`text-3xl font-bold ${m.color} mb-1`}>
              {m.prefix ?? ''}{m.value.toLocaleString()}{m.suffix}
            </div>
            <div className="text-sm font-semibold text-foreground leading-tight mb-1">{m.label}</div>
            <div className="text-xs text-muted-foreground">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Time-to-hire bar chart */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-foreground">Time to Hire Comparison</h4>
            <p className="text-xs text-muted-foreground">Days — Traditional ATS vs Calibr</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400/60 inline-block" /> Traditional</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Calibr</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-36">
          {bars.map((b, i) => (
            <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-28">
                <motion.div
                  className="flex-1 rounded-t-md bg-red-400/60"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(b.traditional / 60) * 100}%` } : { height: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                />
                <motion.div
                  className="flex-1 rounded-t-md bg-blue-500"
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(b.calibr / 60) * 100}%` } : { height: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.08, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-muted-foreground">
            Companies on Calibr hire <strong className="text-emerald-600 dark:text-emerald-400">59% faster</strong> than the industry average
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── KANBAN MOCKUP ────────────────────────────────────────────────────────────

function KanbanMockup() {
  const columns = [
    { label: 'Applied', color: 'bg-blue-500', cards: [{ name: 'Jordan Park', score: 89, role: 'Designer' }, { name: 'Tia Lee', score: 77, role: 'PM' }] },
    { label: 'Screen', color: 'bg-violet-500', cards: [{ name: 'Priya Sharma', score: 91, role: 'Engineer' }] },
    { label: 'Interview', color: 'bg-amber-500', cards: [{ name: 'Alex Chen', score: 96, role: 'Engineer' }] },
    { label: 'Offer', color: 'bg-emerald-500', cards: [{ name: 'Marcus J.', score: 88, role: 'Staff Eng.' }] },
  ]
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Active Pipeline — 8 Open Roles</span>
        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">On track ↗</span>
      </div>
      <div className="p-3 grid grid-cols-4 gap-2 min-h-[180px]">
        {columns.map((col) => (
          <div key={col.label} className="space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{col.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{col.cards.length}</span>
            </div>
            {col.cards.map((card) => (
              <div key={card.name} className="bg-background rounded-lg p-2 border border-border shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">{card.name[0]}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-foreground leading-none">{card.name}</p>
                    <p className="text-[9px] text-muted-foreground">{card.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${card.score}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-semibold">{card.score}%</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STATUS TRACKER MOCKUP ────────────────────────────────────────────────────

function StatusTrackerMockup() {
  const stages = [
    { label: 'Applied', date: 'Apr 19', done: true },
    { label: 'Reviewed', date: 'Apr 21', done: true },
    { label: 'Phone Screen', date: 'Apr 24', done: true },
    { label: 'Technical', date: 'Apr 28', done: true },
    { label: 'Final Round', date: 'May 2', done: false, active: true },
    { label: 'Decision', date: 'May 6', done: false },
  ]
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Product Engineer · Vercel</p>
          <p className="text-xs text-muted-foreground">Applied 2 weeks ago</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">In Progress</span>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${stage.done ? 'bg-emerald-500' : stage.active ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-muted border border-border'}`}>
                  {stage.done ? <Check className="w-3.5 h-3.5 text-white" /> : stage.active ? <span className="w-2 h-2 rounded-full bg-white" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                </div>
                {i < stages.length - 1 && <div className={`w-px h-6 mt-0.5 ${stage.done ? 'bg-emerald-500/40' : 'bg-border'}`} />}
              </div>
              <div className="pb-3 pt-1">
                <p className={`text-sm font-medium leading-none mb-0.5 ${stage.done || stage.active ? 'text-foreground' : 'text-muted-foreground'}`}>{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.date}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">⚡ Next update guaranteed by May 3rd — or we follow up on your behalf.</p>
        </div>
      </div>
    </div>
  )
}

// ─── WHAT COMPANIES MISS SECTION ─────────────────────────────────────────────

function WhatYouAreMissing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const gaps = [
    { icon: Brain, title: '91% of your applicants are never reviewed', detail: 'Your ATS filters out qualified candidates before a recruiter sees them. You\'re evaluating keywords, not humans.', lostValue: '$247K', lostLabel: 'revenue opportunity lost per role from slow hiring' },
    { icon: Clock, title: '26 extra days in your hiring process', detail: 'Every day a role sits empty costs you productivity. 44-day average × $180K salary = $19,700 in lost output per role.', lostValue: '44 days', lostLabel: 'average days to hire without Calibr' },
    { icon: DollarSign, title: 'Candidates know your comp is below market', detail: 'Without salary intel baked into your job posts, top candidates self-reject before applying. You\'re losing the ones you can\'t afford to lose.', lostValue: '62%', lostLabel: 'of offers get rejected due to comp misalignment' },
    { icon: BarChart2, title: 'No visibility into why great hires leave early', detail: 'You\'re hiring fast but retaining slow. Career path misalignment at the offer stage leads to 6-month turnover.', lostValue: '6 months', lostLabel: 'median tenure for mismatched hires' },
  ]

  return (
    <div ref={ref} className="grid sm:grid-cols-2 gap-4">
      {gaps.map((g, i) => (
        <motion.div
          key={g.title}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.12, duration: 0.5 }}
          className="glass-card p-6 rounded-2xl border-l-4 border-l-red-400/60 hover:border-l-primary transition-all duration-300 group"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <g.icon className="w-4.5 h-4.5 text-red-500 group-hover:text-primary transition-colors" />
            </div>
            <h4 className="text-sm font-bold text-foreground leading-snug">{g.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{g.detail}</p>
          <div className="flex items-baseline gap-2 pt-3 border-t border-border">
            <span className="text-lg font-bold text-red-500">{g.lostValue}</span>
            <span className="text-xs text-muted-foreground">{g.lostLabel}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const logoCompanies = ['Stripe', 'Notion', 'Vercel', 'Linear', 'Figma', 'Airtable', 'Loom', 'Retool']

export default function HomePage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="bg-background overflow-x-hidden">
      <Navbar />

      <main id="main-content" tabIndex={-1}>
      {/* ═══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[95vh] flex items-center pt-20 pb-16 overflow-hidden" aria-label="Hero">
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6"
              >
                <Zap className="w-3 h-3" />
                AI Hiring Platform · Trusted by 14,200+ companies
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.06] tracking-tight text-foreground mb-6"
              >
                The recruiting platform your team will{' '}
                <span className="gradient-text">actually use.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed mb-8"
              >
                Calibr unifies your ATS, CRM, assessments, and analytics into one intelligent platform. Built for agencies, in-house teams, and staffing firms.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <Button size="lg" asChild className="h-12 px-7 text-base bg-foreground text-background hover:bg-foreground/90 border-0">
                  <Link href="/register">Start Free — No Card <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-6 text-base gap-2.5">
                  <Link href="/contact">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full border border-border shrink-0">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </span>
                    Watch 2-min demo
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {[
                  { value: '18 days', label: 'avg time-to-hire' },
                  { value: '94%', label: 'match accuracy' },
                  { value: '$38K', label: 'avg savings / year' },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center gap-2 text-sm">
                    {i > 0 && <span className="hidden sm:block w-px h-4 bg-border" />}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <strong className="text-foreground font-semibold">{s.value}</strong>
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Animated dashboard */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Glow behind */}
              <div className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, hsl(217 91% 60% / 0.15), transparent 70%)', filter: 'blur(30px)' }} />
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ LOGO BAR ════════════════════════════════════════════════════════════ */}
      <section className="border-y border-border py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] mb-5">
            Trusted by recruiting teams at
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8 md:gap-14">
            {logoCompanies.map((name) => (
              <span key={name} className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-200">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU'RE MISSING ═════════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-500 text-xs font-semibold mb-5">
            The Problem
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            Here's what your hiring process
            <br />
            <span className="gradient-text">is costing you right now.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every day you use a traditional ATS, you're losing qualified candidates, wasting recruiter time, and leaving revenue on the table.
          </p>
        </Reveal>
        <WhatYouAreMissing />
      </section>

      {/* ═══ HIRING FUNNEL + METRICS ══════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
              The Data
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              See the numbers that move
              <span className="gradient-text"> the needle.</span>
            </h2>
          </Reveal>

          <Reveal className="mb-8">
            <HiringFunnel />
          </Reveal>
          <Reveal>
            <MetricsSection />
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURE 1 — AI Matching ═════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Matched Candidates</span>
                <div className="flex items-center gap-1.5">
                  <motion.span className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  <span className="text-xs text-muted-foreground">94% accuracy</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: 'Alex Chen', role: 'Frontend Engineer', score: 96, skills: ['React', 'TypeScript', 'Next.js'], salary: '$210K', avail: 'Open now', grad: 'from-blue-500 to-indigo-600', init: 'AC' },
                  { name: 'Priya Sharma', role: 'Product Manager', score: 91, skills: ['Strategy', 'SQL', 'A/B'], salary: '$175K', avail: '4 weeks', grad: 'from-violet-500 to-purple-600', init: 'PS' },
                  { name: 'Marcus Johnson', role: 'Staff Engineer', score: 88, skills: ['Go', 'K8s', 'Systems'], salary: '$270K', avail: 'Open now', grad: 'from-cyan-500 to-blue-600', init: 'MJ' },
                  { name: 'Sofia Reyes', role: 'Product Designer', score: 85, skills: ['Figma', 'Systems', 'Research'], salary: '$190K', avail: 'Passive', grad: 'from-pink-500 to-rose-600', init: 'SR' },
                ].map((c, i) => (
                  <motion.div key={c.name} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>{c.init}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-none mb-0.5">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                    </div>
                    <div className="hidden md:flex gap-1.5">
                      {c.skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{sk}</span>
                      ))}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{c.salary}</div>
                      <div className="text-[10px] text-muted-foreground">{c.avail}</div>
                    </div>
                    <div className="w-10 text-right shrink-0">
                      <span className={`text-sm font-bold ${c.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500'}`}>{c.score}</span>
                      <div className="text-[9px] text-muted-foreground">match</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:pl-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">AI Matching Engine</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-5">
              Stop reading 250 resumes<br />to find 5 good ones.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Every applicant is scored the moment they apply — ranked by verified skills, role fit, salary alignment, and growth trajectory. Your recruiters open Calibr and see the best candidates, in order. No noise, no gut-feel guessing.
            </p>
            <ul className="space-y-4">
              {[
                { stat: '40× faster', desc: 'candidate screening vs. manual review' },
                { stat: '94% accuracy', desc: 'on AI match scores vs. final hiring decisions' },
                { stat: 'Top 10%', desc: 'of applicants surface automatically — the rest are still accessible' },
              ].map((item) => (
                <li key={item.stat} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground"><strong className="font-semibold">{item.stat}</strong>{' '}<span className="text-muted-foreground">{item.desc}</span></span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURE 2 — Pipeline ════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal className="lg:pr-4">
              <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Pipeline Management</div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-5">
                From applied to offer<br />in 18 days.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                The average company takes 44 days to hire. Calibr keeps every stakeholder aligned — hiring managers, recruiters, and executives all see the same view. Decisions happen in the platform, not in Slack and email threads.
              </p>
              <ul className="space-y-4">
                {[
                  { stat: '65% less', desc: 'time on coordination and admin across hiring teams' },
                  { stat: 'Automated', desc: 'interview scheduling, reminders, and follow-ups' },
                  { stat: 'Scorecard-driven', desc: 'team alignment — no more conflicting interviewer feedback' },
                ].map((item) => (
                  <li key={item.stat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground"><strong className="font-semibold">{item.stat}</strong>{' '}<span className="text-muted-foreground">{item.desc}</span></span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.12}>
              <KanbanMockup />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE 3 — Zero Ghosting ═══════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <StatusTrackerMockup />
          </Reveal>
          <Reveal delay={0.12} className="lg:pl-4">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Candidate Experience</div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-5">
              Zero ghosting —<br />or we refund.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              96% of job applicants report being ghosted. Calibr contractually requires companies to update candidates within 5 business days at every stage. Candidates always know where they stand — which means your employer brand stays intact.
            </p>
            <ul className="space-y-4">
              {[
                { stat: '89%', desc: 'candidate satisfaction rate on Calibr applications' },
                { stat: 'Contractual', desc: 'update SLA — companies face restrictions if they ghost' },
                { stat: '3×', desc: 'higher offer acceptance from candidates who feel respected' },
              ].map((item) => (
                <li key={item.stat} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground"><strong className="font-semibold">{item.stat}</strong>{' '}<span className="text-muted-foreground">{item.desc}</span></span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ═══ PRICING ═════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-muted/20 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground mb-6">Start free. Scale as you hire.</p>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              {(['Monthly', 'Annual'] as const).map((tab) => (
                <button key={tab} onClick={() => setIsAnnual(tab === 'Annual')}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${(tab === 'Annual') === isAnnual ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab}{tab === 'Annual' && <span className="ml-1.5 text-[10px] text-emerald-500 font-bold">SAVE 20%</span>}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
              const savings = plan.monthlyPrice - plan.annualPrice
              return (
                <Reveal key={plan.id} delay={i * 0.1}
                  className={`glass-card p-7 flex flex-col relative ${plan.highlighted ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-bold text-foreground text-lg mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <AnimatePresence mode="wait">
                        <motion.span key={price} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }} className="text-4xl font-bold text-foreground">
                          ${price.toLocaleString()}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="text-xs text-emerald-500 font-semibold">Save ${savings}/mo billed annually</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild
                    className={plan.highlighted ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0' : ''}
                    variant={plan.highlighted ? 'default' : 'outline'}>
                    <Link href={plan.id === 'enterprise' ? '/contact' : '/register'}>
                      {plan.id === 'enterprise' ? 'Talk to Sales' : 'Start Free Trial'}
                    </Link>
                  </Button>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="text-center mt-6">
            <Link href="/pricing" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Compare all features <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{ backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, hsl(217 91% 60% / 0.08), transparent 70%)', filter: 'blur(40px)' }}
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Ready to close roles
              <br />
              <span className="gradient-text">faster than ever?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join 14,200+ companies. Free 14-day trial. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 text-base bg-foreground text-background hover:bg-foreground/90 border-0">
                <Link href="/register">Start Free — No Card <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  )
}
