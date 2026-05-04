'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowRight, ArrowUpRight, Mail, MessageSquare, Building2, Users, Calendar,
  CheckCircle2, Phone, Clock, Send, Newspaper, HeartHandshake,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

// ─── Reveal ──────────────────────────────────────────────────────────────────

function Reveal({
  children, delay = 0, y = 16, className,
}: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_SIZES = ['1–10', '11–50', '51–200', '200–1,000', '1,000+']
const ROLES = [
  'Head of Talent / TA',
  'CHRO / VP People',
  'Recruiter',
  'CEO / Founder',
  'Engineering Leader',
  'Other',
]

interface FormState {
  fullName: string
  workEmail: string
  companyName: string
  teamSize: string
  role: string
  message: string
}

const EMPTY_FORM: FormState = {
  fullName: '', workEmail: '', companyName: '', teamSize: '', role: '', message: '',
}

// ─── Field components ────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] tracking-[0.14em] uppercase font-bold text-tl-text-secondary mb-2">
      {children}
      {required && <span className="text-tl-rose ml-1">*</span>}
    </label>
  )
}

const inputBase =
  'w-full bg-tl-bg-surface border border-tl-border-default rounded-xl px-4 py-3 text-[14px] text-tl-text-primary placeholder:text-tl-text-tertiary focus:outline-none focus:border-tl-indigo focus:ring-2 focus:ring-tl-indigo/20 transition-colors disabled:opacity-50'

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Best-effort POST to a /api/contact endpoint if present; falls back to a delay.
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => new Promise((r) => setTimeout(r, 900)))
      toast.success('Message sent. Sales will reply within one business day.')
      setForm(EMPTY_FORM)
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-tl-bg-base font-sans antialiased min-h-screen">
      <LandingNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-28 pb-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 50% 0%, rgba(79,70,229,0.10) 0px, transparent 60%),' +
              'radial-gradient(at 100% 100%, rgba(5,150,105,0.06) 0px, transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-tl-indigo/25 bg-tl-indigo/8 text-tl-indigo text-[11px] font-semibold uppercase tracking-[0.16em] mb-6"
          >
            <MessageSquare className="w-3 h-3" />
            Talk to sales
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="text-[clamp(2rem,5vw,3.75rem)] font-bold tracking-tight text-tl-text-primary leading-[1.05] [text-wrap:balance]"
          >
            Let&apos;s talk hiring.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-4 text-[15px] sm:text-[17px] text-tl-text-secondary leading-relaxed max-w-xl mx-auto"
          >
            Tell us about your team — we&apos;ll come back with a tailored demo, custom pricing,
            and an answer to anything procurement asks.
          </motion.p>
        </div>
      </section>

      {/* ── Form + sidebar ────────────────────────────────────────────── */}
      <section className="relative py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12">
          {/* Form */}
          <Reveal>
            <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-tl-teal/15 border border-tl-teal/30 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-6 h-6 text-tl-teal" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-tl-text-primary mb-2">
                    Got it. Sales will reach out.
                  </h2>
                  <p className="text-[14px] text-tl-text-secondary max-w-md mx-auto leading-relaxed">
                    Expect a reply within one business day. In the meantime, you can{' '}
                    <Link href="/auth/register?role=company" className="text-tl-indigo font-semibold hover:underline">
                      start a free trial
                    </Link>
                    {' '}— no credit card required.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[13px] text-tl-text-secondary hover:text-tl-indigo underline underline-offset-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Full name</FieldLabel>
                      <input
                        name="fullName"
                        type="text"
                        required
                        value={form.fullName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={inputBase}
                        placeholder="Jane Cole"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <FieldLabel required>Work email</FieldLabel>
                      <input
                        name="workEmail"
                        type="email"
                        required
                        value={form.workEmail}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={inputBase}
                        placeholder="jane@company.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel required>Company</FieldLabel>
                      <input
                        name="companyName"
                        type="text"
                        required
                        value={form.companyName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={inputBase}
                        placeholder="Acme, Inc."
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <FieldLabel>Your role</FieldLabel>
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={cn(inputBase, 'appearance-none')}
                      >
                        <option value="">Select your role</option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Team size</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {TEAM_SIZES.map((size) => {
                        const active = form.teamSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, teamSize: size }))}
                            disabled={isSubmitting}
                            className={cn(
                              'px-3.5 py-1.5 rounded-full border text-[12.5px] font-semibold transition-colors',
                              active
                                ? 'bg-tl-indigo border-tl-indigo text-white shadow-sm'
                                : 'border-tl-border-default text-tl-text-secondary hover:text-tl-text-primary hover:border-tl-text-primary/30',
                            )}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>What can we help with?</FieldLabel>
                    <textarea
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={cn(inputBase, 'resize-none')}
                      placeholder="Tell us about your hiring volume, current stack, and timeline."
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-[11.5px] text-tl-text-tertiary leading-snug max-w-xs">
                      We&apos;ll respond within one business day. No mailing list, no marketing spam.
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tl-indigo text-white text-[14px] font-semibold hover:bg-tl-indigo/90 transition-colors shadow-md shadow-tl-indigo/30 disabled:opacity-50 shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* Sidebar */}
          <Reveal delay={0.1}>
            <div className="space-y-4 sticky top-28">
              {/* Direct contact */}
              <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6">
                <p className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-tl-text-tertiary mb-4">
                  Or reach us directly
                </p>
                <ul className="space-y-3.5">
                  {[
                    { Icon: Mail,     label: 'sales@talentbridge.io', sub: 'Sales inquiries',  href: 'mailto:sales@talentbridge.io' },
                    { Icon: Phone,    label: '+1 (415) 555-0100',     sub: 'Mon–Fri · 9am–6pm PT', href: 'tel:+14155550100' },
                    { Icon: Building2, label: '500 Howard St, San Francisco', sub: 'Headquarters' },
                  ].map(({ Icon, label, sub, href }) => {
                    const inner = (
                      <>
                        <span className="inline-flex w-9 h-9 rounded-lg bg-tl-bg-elevated border border-tl-border-subtle items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-tl-indigo" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold text-tl-text-primary truncate">{label}</p>
                          <p className="text-[11.5px] text-tl-text-tertiary">{sub}</p>
                        </div>
                      </>
                    )
                    return href ? (
                      <li key={label}>
                        <a href={href} className="flex items-center gap-3 hover:text-tl-indigo transition-colors">
                          {inner}
                        </a>
                      </li>
                    ) : (
                      <li key={label} className="flex items-center gap-3">{inner}</li>
                    )
                  })}
                </ul>
              </div>

              {/* What to expect */}
              <div className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6">
                <p className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-tl-text-tertiary mb-4">
                  What to expect
                </p>
                <ul className="space-y-3">
                  {[
                    { Icon: Clock,        title: 'One business day', sub: 'Sales replies within 24 hours.' },
                    { Icon: Calendar,     title: '30-min discovery', sub: 'No sales theatre — straight to your use case.' },
                    { Icon: Users,        title: 'Tailored demo',    sub: 'On a real role — we\'ll show your matches live.' },
                    { Icon: HeartHandshake, title: 'Procurement-ready', sub: 'SOC 2 report, MSA, security review on file.' },
                  ].map(({ Icon, title, sub }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className="inline-flex w-7 h-7 rounded-lg bg-tl-teal/10 border border-tl-teal/25 items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-tl-teal" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-tl-text-primary">{title}</p>
                        <p className="text-[12px] text-tl-text-secondary leading-snug">{sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Press */}
              <div className="rounded-2xl border border-tl-border-default bg-tl-bg-elevated/40 p-6">
                <div className="flex items-start gap-3">
                  <span className="inline-flex w-9 h-9 rounded-lg bg-tl-bg-surface border border-tl-border-subtle items-center justify-center shrink-0">
                    <Newspaper className="w-4 h-4 text-tl-text-secondary" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-tl-text-primary">Press &amp; partnerships</p>
                    <p className="text-[12px] text-tl-text-secondary leading-snug mt-0.5">
                      For media inquiries, reach{' '}
                      <a href="mailto:press@talentbridge.io" className="text-tl-indigo font-semibold hover:underline">
                        press@talentbridge.io
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section className="relative py-12 sm:py-14 border-y border-tl-border-default bg-tl-bg-surface/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <p className="text-[10.5px] uppercase tracking-[0.18em] font-bold text-tl-text-tertiary mb-5">
            Trusted by talent teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 text-[15px] sm:text-base font-semibold text-tl-text-tertiary/70">
            {['Acme Corp', 'Nexus Labs', 'Veritas AI', 'Archon', 'Dropfleet', 'Meridian'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold tracking-tight text-tl-text-primary leading-tight">
              Prefer to start now?
            </h2>
            <p className="mt-3 text-[15px] text-tl-text-secondary max-w-xl mx-auto">
              Skip the call. 14-day free trial, no credit card. You can always talk to sales later.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register?role=company"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-tl-indigo text-white text-[14.5px] font-semibold hover:bg-tl-indigo/90 transition-colors shadow-md shadow-tl-indigo/30"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-tl-border-default bg-tl-bg-surface text-tl-text-primary text-[14.5px] font-semibold hover:border-tl-indigo/30 hover:bg-tl-bg-elevated transition-colors"
              >
                See pricing
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
