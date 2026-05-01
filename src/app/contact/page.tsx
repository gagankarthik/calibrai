'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  Calendar,
  Clock,
  Users,
  Building2,
  Send,
  CheckCircle,
  MessageSquare,
  HeartHandshake,
  Newspaper,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const TEAM_SIZES = ['1-10', '11-50', '51-200', '200-1000', '1000+']
const ROLES = ['HR Director', 'Talent Acquisition', 'CHRO', 'CEO/Founder', 'Other']

interface FormState {
  fullName: string
  workEmail: string
  companyName: string
  teamSize: string
  role: string
  message: string
}

const EMPTY_FORM: FormState = {
  fullName: '',
  workEmail: '',
  companyName: '',
  teamSize: '',
  role: '',
  message: '',
}

const inputCls = 'input-field'
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-tl-text-secondary'

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((res) => setTimeout(res, 1400))
    toast.success("Message sent! We'll be in touch within 24 hours.")
    setForm(EMPTY_FORM)
    setIsSubmitting(false)
  }

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-tl-bg-base pt-24 pb-0">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 px-6">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[520px] w-[520px] rounded-full bg-tl-gold opacity-[0.04] blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div
              className="section-eyebrow mx-auto mb-4"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Enterprise Sales
            </motion.div>
            <motion.h1
              className="font-display text-5xl md:text-6xl font-bold mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Talk to our{' '}
              <span className="gradient-text">sales&nbsp;team</span>
            </motion.h1>
            <motion.p
              className="text-lg text-tl-text-secondary mx-auto max-w-xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Get dedicated enterprise onboarding, custom pricing, and a solution tailored to your hiring goals — backed by a team that moves at your pace.
            </motion.p>
          </div>
        </section>

        {/* ── Two-column layout ────────────────────────────────── */}
        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px]">
            {/* Left — Contact form */}
            <motion.div
              className="tl-card p-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <h2 className="mb-1 text-xl font-semibold text-tl-text-primary">Send us a message</h2>
              <p className="mb-8 text-sm text-tl-text-secondary">
                Fill out the form and we'll get back to you within one business day.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input type="text" name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Jane Smith" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Work email</label>
                    <input type="email" name="workEmail" required value={form.workEmail} onChange={handleChange} placeholder="jane@company.com" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Company name</label>
                  <input type="text" name="companyName" required value={form.companyName} onChange={handleChange} placeholder="Acme Corporation" className={inputCls} />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Team size</label>
                    <select name="teamSize" required value={form.teamSize} onChange={handleChange} className={inputCls}>
                      <option value="" disabled>Select range</option>
                      {TEAM_SIZES.map((s) => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Your role</label>
                    <select name="role" required value={form.role} onChange={handleChange} className={inputCls}>
                      <option value="" disabled>Select role</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your hiring goals, current challenges, or anything you'd like us to know..."
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-tl-text-inverse/30 border-t-tl-text-inverse animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send message
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Right — Contact info + social proof */}
            <motion.div
              className="flex flex-col gap-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              {/* Contact methods */}
              <div className="tl-card p-6 space-y-5">
                <h3 className="text-base font-semibold text-tl-text-primary">Get in touch</h3>

                {[
                  { icon: Mail, label: 'Sales', href: 'mailto:sales@talentloop.io', text: 'sales@talentloop.io' },
                  { icon: MessageSquare, label: 'Support', href: 'mailto:support@talentloop.io', text: 'support@talentloop.io' },
                  { icon: Calendar, label: 'Demo', href: '#', text: 'Schedule a 30-min demo →' },
                ].map(({ icon: Icon, label, href, text }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tl-gold/10">
                      <Icon className="h-4 w-4 text-tl-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-tl-text-secondary mb-0.5">{label}</p>
                      <a href={href} className="text-sm font-medium text-tl-text-primary hover:text-tl-gold transition-colors">{text}</a>
                    </div>
                  </div>
                ))}

                <div className="my-1 border-t border-tl-border-subtle" />

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tl-bg-elevated">
                    <Clock className="h-4 w-4 text-tl-text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-tl-text-secondary mb-0.5">Office hours</p>
                    <p className="text-sm text-tl-text-secondary">Mon–Fri, 9 AM – 6 PM PT</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tl-teal/10">
                    <CheckCircle className="h-4 w-4 text-tl-teal" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-tl-text-secondary mb-0.5">Response promise</p>
                    <p className="text-sm text-tl-text-secondary">
                      We reply to every inquiry within{' '}
                      <span className="font-semibold text-tl-teal">24 hours</span>, guaranteed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="tl-card p-6">
                <h3 className="mb-4 text-base font-semibold text-tl-text-primary">Why teams choose TalentLoop</h3>
                <ul className="space-y-3">
                  {[
                    { icon: Users, text: '500+ enterprise customers' },
                    { icon: Building2, text: 'Dedicated account manager' },
                    { icon: CheckCircle, text: 'SOC 2 Type II certified' },
                    { icon: Clock, text: 'Avg. 3-day onboarding' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-tl-gold" />
                      <span className="text-sm text-tl-text-secondary">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Three cards ──────────────────────────────────────── */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              className="grid gap-6 sm:grid-cols-3"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
            >
              {[
                {
                  icon: Building2,
                  iconBg: 'bg-tl-gold/10',
                  iconColor: 'text-tl-gold',
                  title: 'Enterprise Sales',
                  desc: 'Work with a dedicated account manager and get custom pricing built around your team\'s exact headcount and workflow.',
                  items: ['Dedicated account manager', 'Custom pricing & contracts', 'SSO & advanced security'],
                  checkColor: 'text-tl-gold',
                },
                {
                  icon: HeartHandshake,
                  iconBg: 'bg-tl-blue/10',
                  iconColor: 'text-tl-blue',
                  title: 'Partnerships',
                  desc: 'Become an integration partner and connect your ATS, HRIS, or workflow tool to TalentLoop\'s AI hiring engine.',
                  items: ['Integration & API access', 'Co-marketing opportunities', 'Revenue share program'],
                  checkColor: 'text-tl-blue',
                },
                {
                  icon: Newspaper,
                  iconBg: 'bg-tl-teal/10',
                  iconColor: 'text-tl-teal',
                  title: 'Press & Media',
                  desc: 'Journalists and analysts — our comms team has press kits, executive interviews, and data on the future of AI hiring.',
                  items: ['Press kit & brand assets', 'Executive interviews', 'Research & data reports'],
                  checkColor: 'text-tl-teal',
                },
              ].map(({ icon: Icon, iconBg, iconColor, title, desc, items, checkColor }) => (
                <div key={title} className="tl-card p-7 flex flex-col gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-base font-semibold text-tl-text-primary">{title}</h3>
                    <p className="text-sm leading-relaxed text-tl-text-secondary">{desc}</p>
                  </div>
                  <ul className="mt-auto space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-tl-text-secondary">
                        <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${checkColor}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Social proof strip ───────────────────────────────── */}
        <motion.section
          className="border-t border-tl-border-subtle bg-tl-bg-surface py-12 px-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-tl-text-secondary">
              Join 500+ companies already hiring smarter
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {['Stripe', 'Notion', 'Linear', 'Vercel', 'Figma', 'Retool', 'Loom', 'Intercom'].map((company) => (
                <span key={company} className="font-display text-lg font-bold tracking-tight text-tl-text-secondary opacity-40 hover:opacity-70 transition-opacity select-none">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  )
}
