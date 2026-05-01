'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const TEAM_SIZES = ['1-10', '11-50', '51-200', '200-1000', '1000+'];
const ROLES = [
  'HR Director',
  'Talent Acquisition',
  'CHRO',
  'CEO/Founder',
  'Other',
];

interface FormState {
  fullName: string;
  workEmail: string;
  companyName: string;
  teamSize: string;
  role: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  fullName: '',
  workEmail: '',
  companyName: '',
  teamSize: '',
  role: '',
  message: '',
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 1400));
    toast.success("Message sent! We'll be in touch within 24 hours.");
    setForm(EMPTY_FORM);
    setIsSubmitting(false);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--background)] pt-24 pb-0">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 px-6">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[520px] w-[520px] rounded-full bg-[var(--accent-primary)] opacity-[0.07] blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.p
              className="section-eyebrow mb-4"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Enterprise Sales
            </motion.p>
            <motion.h1
              className="section-title mb-6"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Talk to our{' '}
              <span className="gradient-text">sales&nbsp;team</span>
            </motion.h1>
            <motion.p
              className="section-subtitle mx-auto max-w-xl"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Get dedicated enterprise onboarding, custom pricing, and a
              solution tailored to your hiring goals — backed by a team that
              moves at your pace.
            </motion.p>
          </div>
        </section>

        {/* ── Two-column layout ────────────────────────────────── */}
        <section className="px-6 pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px]">
            {/* Left — Contact form */}
            <motion.div
              className="glass-card rounded-2xl p-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <h2 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
                Send us a message
              </h2>
              <p className="mb-8 text-sm text-[var(--text-muted)]">
                Fill out the form and we'll get back to you within one business
                day.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1 */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Work email
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      required
                      value={form.workEmail}
                      onChange={handleChange}
                      placeholder="jane@company.com"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                    Company name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Acme Corporation"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                  />
                </div>

                {/* Row 3 */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Team size
                    </label>
                    <select
                      name="teamSize"
                      required
                      value={form.teamSize}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                    >
                      <option value="" disabled>
                        Select range
                      </option>
                      {TEAM_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s} employees
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Your role
                    </label>
                    <select
                      name="role"
                      required
                      value={form.role}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your hiring goals, current challenges, or anything you'd like us to know..."
                    className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
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
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  Get in touch
                </h3>

                {/* Sales email */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10">
                    <Mail className="h-4 w-4 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                      Sales
                    </p>
                    <a
                      href="mailto:sales@calibr.io"
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      sales@calibr.io
                    </a>
                  </div>
                </div>

                {/* Support email */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10">
                    <MessageSquare className="h-4 w-4 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                      Support
                    </p>
                    <a
                      href="mailto:support@calibr.io"
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      support@calibr.io
                    </a>
                  </div>
                </div>

                {/* Schedule demo */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10">
                    <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                      Demo
                    </p>
                    <a
                      href="#"
                      className="text-sm font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      Schedule a 30-min demo →
                    </a>
                  </div>
                </div>

                <div className="my-1 border-t border-[var(--border)]" />

                {/* Office hours */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                    <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                      Office hours
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Mon–Fri, 9 AM – 6 PM PT
                    </p>
                  </div>
                </div>

                {/* Response time */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                      Response promise
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      We reply to every inquiry within{' '}
                      <span className="font-semibold text-emerald-400">
                        24 hours
                      </span>
                      , guaranteed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                  Why teams choose Calibr
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: Users, text: '500+ enterprise customers' },
                    { icon: Building2, text: 'Dedicated account manager' },
                    { icon: CheckCircle, text: 'SOC 2 Type II certified' },
                    { icon: Clock, text: 'Avg. 3-day onboarding' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        {text}
                      </span>
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
              {/* Enterprise Sales */}
              <div className="glass-card rounded-2xl p-7 flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10">
                  <Building2 className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-[var(--text-primary)]">
                    Enterprise Sales
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    Work with a dedicated account manager and get custom pricing
                    built around your team's exact headcount and workflow.
                  </p>
                </div>
                <ul className="mt-auto space-y-1.5">
                  {[
                    'Dedicated account manager',
                    'Custom pricing & contracts',
                    'SSO & advanced security',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Partnerships */}
              <div className="glass-card rounded-2xl p-7 flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
                  <HeartHandshake className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-[var(--text-primary)]">
                    Partnerships
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    Become an integration partner and connect your ATS, HRIS, or
                    workflow tool to Calibr's AI hiring engine.
                  </p>
                </div>
                <ul className="mt-auto space-y-1.5">
                  {[
                    'Integration & API access',
                    'Co-marketing opportunities',
                    'Revenue share program',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Press & Media */}
              <div className="glass-card rounded-2xl p-7 flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <Newspaper className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-[var(--text-primary)]">
                    Press & Media
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    Journalists and analysts — our comms team has press kits,
                    executive interviews, and data on the future of AI hiring.
                  </p>
                </div>
                <ul className="mt-auto space-y-1.5">
                  {[
                    'Press kit & brand assets',
                    'Executive interviews',
                    'Research & data reports',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Social proof strip ───────────────────────────────── */}
        <motion.section
          className="border-t border-[var(--border)] bg-[var(--surface-1)] py-12 px-6"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <div className="mx-auto max-w-6xl">
            <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-[var(--text-muted)]">
              Join 500+ companies already hiring smarter
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {[
                'Stripe',
                'Notion',
                'Linear',
                'Vercel',
                'Figma',
                'Retool',
                'Loom',
                'Intercom',
              ].map((company) => (
                <span
                  key={company}
                  className="text-lg font-bold tracking-tight text-[var(--text-muted)] opacity-40 hover:opacity-70 transition-opacity select-none"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}
