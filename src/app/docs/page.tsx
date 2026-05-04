'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Sparkles, Brain, Globe, SlidersHorizontal, MessageCircle,
  Code2, Database, Server, Lock, Rocket, BookOpen, ArrowUpRight,
  ChevronRight, Copy, Check,
} from 'lucide-react'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

interface Section {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SECTIONS: Section[] = [
  { id: 'overview',     label: 'Overview',         icon: BookOpen },
  { id: 'ai-sourcer',   label: 'AI Sourcer',       icon: Sparkles },
  { id: 'api',          label: 'API reference',    icon: Code2 },
  { id: 'architecture', label: 'Architecture',     icon: Server },
  { id: 'self-host',    label: 'Self-host setup',  icon: Rocket },
  { id: 'faq',          label: 'FAQ',              icon: BookOpen },
]

export default function DocsPage() {
  const [active, setActive] = useState<string>('overview')
  const observers = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    observers.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    observers.current = observer
    return () => observer.disconnect()
  }, [])

  return (
    <main className="bg-tl-bg-base min-h-screen font-sans antialiased">
      <LandingNav />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-20">
        {/* Header */}
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tl-indigo/10 border border-tl-indigo/20">
              <BookOpen className="w-3 h-3 text-tl-indigo" />
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-tl-indigo">Docs</span>
            </span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.02em] text-tl-text-primary leading-[1.05]">
            Build with TalentBridge.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] sm:text-base text-tl-text-secondary leading-relaxed">
            Everything you need to run the AI Sourcer — the four-phase autonomous agent that does the end-to-end job of a talent sourcer.
            Real OpenAI calls. Real DynamoDB persistence. Cognito-scoped per company.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-10 lg:gap-14">
          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-1">
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-tl-text-tertiary px-3 mb-3">
                On this page
              </p>
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-all ' +
                    (active === s.id
                      ? 'bg-tl-indigo/10 text-tl-indigo font-semibold'
                      : 'text-tl-text-secondary hover:text-tl-text-primary hover:bg-tl-bg-elevated')
                  }
                >
                  <s.icon className={'w-3.5 h-3.5 ' + (active === s.id ? 'text-tl-indigo' : 'text-tl-text-tertiary')} />
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="min-w-0 space-y-20">
            <OverviewSection />
            <AiSourcerSection />
            <ApiSection />
            <ArchitectureSection />
            <SelfHostSection />
            <FaqSection />
          </article>
        </div>
      </div>

      <LandingFooter />
    </main>
  )
}

// ── Section primitives ─────────────────────────────────────────────────────

function H2({ children, id, eyebrow }: { children: React.ReactNode; id: string; eyebrow: string }) {
  return (
    <header className="mb-6">
      <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-tl-indigo mb-2">{eyebrow}</p>
      <h2 id={id} className="scroll-mt-28 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.02em] text-tl-text-primary leading-[1.1]">
        {children}
      </h2>
    </header>
  )
}

function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} className="scroll-mt-28 text-[19px] sm:text-[21px] font-semibold text-tl-text-primary mt-10 mb-3 tracking-tight">
      {children}
    </h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14.5px] leading-relaxed text-tl-text-secondary mb-3">{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-tl-bg-elevated border border-tl-border-default text-[12.5px] font-mono text-tl-text-primary">
      {children}
    </code>
  )
}

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative group rounded-xl border border-tl-border-default bg-tl-bg-elevated overflow-hidden my-4">
      {lang && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-tl-border-default text-[11px]">
          <span className="font-mono text-tl-text-tertiary uppercase tracking-wider">{lang}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(children).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              })
            }}
            className="inline-flex items-center gap-1 text-tl-text-tertiary hover:text-tl-indigo transition-colors"
          >
            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-tl-text-primary">
        {children}
      </pre>
    </div>
  )
}

function Callout({
  variant = 'info', title, children,
}: { variant?: 'info' | 'warn' | 'success'; title: string; children: React.ReactNode }) {
  const styles = {
    info:    { wrap: 'bg-tl-indigo/[0.06] border-tl-indigo/25', accent: 'text-tl-indigo' },
    warn:    { wrap: 'bg-amber-50 border-amber-200',            accent: 'text-amber-700' },
    success: { wrap: 'bg-emerald-50 border-emerald-200',        accent: 'text-emerald-700' },
  }[variant]
  return (
    <aside className={`my-5 rounded-xl border p-4 ${styles.wrap}`}>
      <p className={`text-[12px] font-bold tracking-wider uppercase mb-1 ${styles.accent}`}>{title}</p>
      <div className="text-[13.5px] leading-relaxed text-tl-text-primary">{children}</div>
    </aside>
  )
}

// ── Sections ────────────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <section>
      <H2 id="overview" eyebrow="01 · Overview">
        TalentBridge is two-sided hiring, mediated by an AI employee.
      </H2>
      <P>
        Companies post hiring briefs. Candidates set up profiles. The <strong className="text-tl-text-primary">AI Sourcer</strong> reads
        each brief, hunts candidates across the company's reach, scores them with reasoning, learns from thumbs ↑/↓ feedback, and drafts
        personalized outreach — autonomously, in four phases that compound on each other.
      </P>
      <P>
        This product is the result of a single bet: <em>the next decade of recruiting will be agent-mediated, not search-mediated</em>.
        We don't sell more sourcing chairs. We sell one that doesn't sleep.
      </P>

      <H3>What you'll find here</H3>
      <ul className="space-y-2 text-[14.5px] text-tl-text-secondary">
        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-tl-indigo mt-0.5 shrink-0" />
          The four phases of the AI Sourcer — what each does, what it costs, what it produces.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-tl-indigo mt-0.5 shrink-0" />
          A complete API reference for every Sourcer endpoint, with example requests and responses.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-tl-indigo mt-0.5 shrink-0" />
          Architecture — how Cognito, DynamoDB, OpenAI, and Playwright fit together.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="w-4 h-4 text-tl-indigo mt-0.5 shrink-0" />
          A self-host bootstrap script with all DynamoDB tables and required env vars.
        </li>
      </ul>
    </section>
  )
}

function AiSourcerSection() {
  const phases = [
    {
      n: '01', name: 'Understanding', percent: 5, icon: Brain, accent: '#4F46E5',
      desc: 'Captures structured intent — must-haves, nice-to-haves, location, work mode, experience window, signal sources, the bar for "great". Persisted as a SourcerBrief.',
      route: 'POST /api/company/sourcer/briefs',
    },
    {
      n: '02', name: 'Sourcing', percent: 40, icon: Globe, accent: '#059669',
      desc: 'Reads brief + every prior calibration signal. Pulls Candidates + DiscoveredCandidates, summarizes up to 40 profiles, scores with OpenAI in JSON mode (gpt-4o-mini, temp 0.2). Heuristic fallback if no API key.',
      route: 'POST /api/company/sourcer/briefs/[id]/source',
    },
    {
      n: '03', name: 'Calibration', percent: 40, icon: SlidersHorizontal, accent: '#D97706',
      desc: 'Stores thumbs ↑/↓ per candidate. The next sourcing run automatically folds these signals into the system prompt — liked profiles bias the search, rejected ones penalize.',
      route: 'POST /api/company/sourcer/briefs/[id]/calibrate',
    },
    {
      n: '04', name: 'Engagement', percent: 15, icon: MessageCircle, accent: '#E11D48',
      desc: 'Generates a personalized outreach (channel × tone × intent) citing one specific signal from the candidate. Supports drafted → sent state. Templated fallback when OpenAI unavailable.',
      route: 'POST /api/company/sourcer/briefs/[id]/candidates/[candidateId]/engage',
    },
  ]

  return (
    <section>
      <H2 id="ai-sourcer" eyebrow="02 · AI Sourcer">
        Four phases. One agent. End-to-end sourcing.
      </H2>
      <P>
        The percentages reflect where the AI spends its time, not your money. Most of the work is in <strong className="text-tl-text-primary">Sourcing</strong> and <strong className="text-tl-text-primary">Calibration</strong> —
        because that's where match quality is actually made.
      </P>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {phases.map((p) => (
          <div key={p.n} className="rounded-2xl border border-tl-border-default bg-tl-bg-surface p-5 sm:p-6 relative">
            <div className="absolute top-4 right-5 text-[10px] tracking-[0.22em] uppercase font-bold text-tl-text-tertiary/70">
              {p.n}
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
              style={{ background: p.accent + '1a', borderColor: p.accent + '33' }}
            >
              <p.icon className="w-5 h-5" style={{ color: p.accent }} />
            </div>
            <div className="flex items-baseline justify-between mb-2 gap-3">
              <h3 className="text-[18px] font-semibold text-tl-text-primary tracking-tight">{p.name}</h3>
              <span className="text-[20px] font-bold tabular-nums" style={{ color: p.accent }}>
                {p.percent}%
              </span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-tl-text-secondary mb-3">{p.desc}</p>
            <code className="text-[11px] font-mono text-tl-indigo bg-tl-indigo/10 px-2 py-1 rounded border border-tl-indigo/15 inline-block break-all">
              {p.route}
            </code>
          </div>
        ))}
      </div>

      <H3 id="calibration-loop">The calibration loop</H3>
      <P>This is the part that compounds — every good rating makes the next sourcing run better, and that improvement is per-customer.</P>

      <CodeBlock lang="flow">{`Brief ──► Source 40 ──► Manager rates a few ↑/↓
   ▲                                  │
   │                                  ▼
   └────── Re-source (taste-aware) ◄──┘`}</CodeBlock>

      <P>
        After two or three calibration rounds, the OpenAI system prompt carries a <Code>CALIBRATION HISTORY</Code> block listing the
        candidate IDs and notes the manager rewarded vs. rejected. The model uses that to weight skills, seniority, and headline
        patterns this manager prefers.
      </P>

      <Callout variant="info" title="The moat">
        Calibration is per-customer and accumulates. After 50 ratings, your AI Sourcer has internalized a hiring philosophy nobody else
        has. That data does not transfer to a competitor.
      </Callout>

      <H3 id="phase-1-flow">Brief intake — Understanding flow</H3>
      <CodeBlock lang="flow">{`Hiring manager  ──►  /company/ai-sourcer       (briefs index)
                  │
                  ├──► "New brief"            (modal — Phase 1)
                  │     ├ Title
                  │     ├ Must-haves         (chip input)
                  │     ├ Nice-to-haves      (chip input)
                  │     ├ Location, work mode
                  │     ├ Experience window  (years)
                  │     ├ Signal sources     (GitHub, LinkedIn, etc.)
                  │     └ The bar for "great"  (free text)
                  │
                  └──► POST /api/company/sourcer/briefs
                        └─ persists to talentbridge-sourcer-briefs
                        └─ logs audit event (sourcer.brief.created)
                        └─ redirects to /company/ai-sourcer/[id]`}</CodeBlock>

      <H3 id="phase-2-flow">Sourcing run — what actually happens</H3>
      <CodeBlock lang="flow">{`POST /api/company/sourcer/briefs/[id]/source
  │
  ├─ Verify Cognito JWT, scope to companyId
  │
  ├─ Load brief                                  (Tables.SourcerBriefs)
  │
  ├─ Pull pool                                   (Tables.Candidates +
  │                                               Tables.DiscoveredCandidates)
  │   └─ filter to records with name, take 40
  │
  ├─ Build prompt:
  │   ├─ system  = scoring rubric + CALIBRATION HISTORY (ups/downs)
  │   └─ user    = JSON({ brief, candidates })
  │
  ├─ Call OpenAI (gpt-4o-mini, JSON mode, temp 0.2)
  │   └─ fallback: deterministic skill-overlap scoring
  │
  ├─ Merge results into shortlist
  │   └─ preserve existing calibration + outreach for known IDs
  │
  └─ PUT updated brief (lastSourcedAt = now)
     └─ return { brief, source: 'openai' | 'fallback', scored }`}</CodeBlock>

      <H3 id="phase-4-flow">Engagement draft — what the prompt gets</H3>
      <CodeBlock lang="ts">{`// Channel × Tone × Intent matrix
channel: 'email' | 'linkedin' | 'sms'
tone:    'warm' | 'concise' | 'enthusiastic' | 'formal'
intent:  'initial' | 'nudge' | 'role-fit-check'

// The system prompt enforces:
// • Reference one specific signal from the candidate's profile
// • No clichés ("rockstar", "synergy", "I came across your profile")
// • Email body 80–150 words; subject under 65 chars
// • SMS under 320 chars (no subject)
// • Sign off as the hiring team, not a person`}</CodeBlock>
    </section>
  )
}

function ApiSection() {
  return (
    <section>
      <H2 id="api" eyebrow="03 · API reference">
        Six endpoints run the entire AI Sourcer.
      </H2>
      <P>
        All routes are scoped by Cognito JWT. Pass the token via the <Code>tb-company-token</Code> cookie (set by the login flow) or
        <Code>Authorization: Bearer &lt;token&gt;</Code>. Every brief is owned by exactly one <Code>companyId</Code>.
      </P>

      <H3 id="api-create-brief">Create a brief</H3>
      <CodeBlock lang="bash">{`curl -X POST http://localhost:3000/api/company/sourcer/briefs \\
  -H "Content-Type: application/json" \\
  -H "Cookie: tb-company-token=<jwt>" \\
  -d '{
    "title": "Senior Backend Engineer · Payments",
    "mustHaves": ["Python", "Postgres", "Distributed systems"],
    "niceToHaves": ["ML adjacent", "Open source"],
    "location": "Remote · US",
    "workMode": "remote",
    "experienceMin": 5,
    "experienceMax": 12,
    "signalSources": ["GitHub", "LinkedIn"],
    "bar": "Has shipped distributed Python services that handle 1k+ rps."
  }'`}</CodeBlock>

      <P>Response (201 Created):</P>
      <CodeBlock lang="json">{`{
  "id": "br-3f7e2c91-...",
  "companyId": "cmp-...",
  "title": "Senior Backend Engineer · Payments",
  "mustHaves": ["Python", "Postgres", "Distributed systems"],
  "shortlist": [],
  "status": "active",
  "createdAt": "2026-05-03T20:14:11.842Z"
}`}</CodeBlock>

      <H3 id="api-source">Run sourcing</H3>
      <P>
        Synchronously scores up to 40 candidates against the brief and persists the shortlist. Subsequent calls re-score (and refresh
        reasoning) but preserve calibration and outreach state for known candidates.
      </P>
      <CodeBlock lang="bash">{`curl -X POST http://localhost:3000/api/company/sourcer/briefs/br-3f7e2c91/source \\
  -H "Cookie: tb-company-token=<jwt>"`}</CodeBlock>
      <CodeBlock lang="json">{`{
  "brief": { "id": "br-...", "shortlist": [
    { "candidateId": "c-...", "score": 92, "reason": "Verified Python; shipped distributed services at fintech.", "sourcedAt": "..." },
    { "candidateId": "c-...", "score": 87, "reason": "Strong Postgres background; recent open-source on consensus." },
    ...
  ]},
  "source": "openai",
  "scanned": 412,
  "scored": 40
}`}</CodeBlock>

      <H3 id="api-calibrate">Calibrate (thumbs ↑/↓)</H3>
      <CodeBlock lang="bash">{`curl -X POST http://localhost:3000/api/company/sourcer/briefs/br-3f7e2c91/calibrate \\
  -H "Content-Type: application/json" \\
  -H "Cookie: tb-company-token=<jwt>" \\
  -d '{ "candidateId": "c-abc123", "vote": "up", "note": "Matches the bar exactly." }'`}</CodeBlock>
      <P>The next <Code>/source</Code> run will read this signal automatically and bias accordingly.</P>

      <H3 id="api-engage">Generate outreach</H3>
      <CodeBlock lang="bash">{`curl -X POST http://localhost:3000/api/company/sourcer/briefs/br-3f7e2c91/candidates/c-abc123/engage \\
  -H "Content-Type: application/json" \\
  -H "Cookie: tb-company-token=<jwt>" \\
  -d '{ "channel": "email", "tone": "warm", "intent": "initial" }'`}</CodeBlock>
      <CodeBlock lang="json">{`{
  "brief": { ..., "shortlist": [{
    "candidateId": "c-abc123",
    "outreach": {
      "subject": "Re: Senior Backend — quick question about your consensus paper",
      "body": "Hi Maria,\\n\\nI saw your work on Raft variants in the paxos-lite repo and ...",
      "status": "drafted",
      "generatedAt": "..."
    }
  }]},
  "source": "openai"
}`}</CodeBlock>

      <H3 id="api-mark-sent">Mark as sent</H3>
      <CodeBlock lang="bash">{`curl -X POST http://localhost:3000/api/company/sourcer/briefs/br-3f7e2c91/candidates/c-abc123/engage \\
  -H "Content-Type: application/json" \\
  -H "Cookie: tb-company-token=<jwt>" \\
  -d '{ "markSent": true }'`}</CodeBlock>

      <Callout variant="warn" title="Email send is a hook">
        We persist the draft + status flag, but we don't physically send mail. Wire SES / Resend / Postmark inside
        <Code> src/app/api/company/sourcer/briefs/[id]/candidates/[candidateId]/engage/route.ts</Code> at the spot marked by
        the <Code>markSent</Code> branch.
      </Callout>

      <H3 id="api-list-update">List, update, delete</H3>
      <ul className="space-y-1.5 text-[14px] text-tl-text-secondary">
        <li><Code>GET /api/company/sourcer/briefs</Code> — list briefs for the authenticated company.</li>
        <li><Code>GET /api/company/sourcer/briefs/[id]</Code> — full brief + shortlist.</li>
        <li><Code>PATCH /api/company/sourcer/briefs/[id]</Code> — update any subset of brief fields.</li>
        <li><Code>DELETE /api/company/sourcer/briefs/[id]</Code> — delete the brief (and its shortlist).</li>
        <li><Code>DELETE /api/company/sourcer/briefs/[id]/calibrate?candidateId=...</Code> — clear a calibration signal.</li>
      </ul>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section>
      <H2 id="architecture" eyebrow="04 · Architecture">
        Boring stack, opinionated layout.
      </H2>
      <P>
        Next.js App Router on top of AWS primitives. We chose DynamoDB so a brief, an audit event, and a candidate are all
        single-digit-millisecond reads from the same region. We chose Cognito because we don't want to run a session store.
      </P>

      <CodeBlock lang="ascii">{`┌──────────────┐     ┌─────────────────────────────┐     ┌─────────────────┐
│  Browser     │────▶│  Next.js App Router         │────▶│  AWS Cognito    │
│  (React 18)  │     │  • Server actions / routes  │     │  (JWT, MFA)     │
└──────────────┘     │  • Edge-friendly RSC        │     └─────────────────┘
                     │                             │
                     │      ┌────────────────┐     │     ┌─────────────────┐
                     │      │  AI Sourcer    │─────┼────▶│  OpenAI         │
                     │      │  4-phase agent │     │     │  gpt-4o-mini    │
                     │      └────────────────┘     │     └─────────────────┘
                     │                             │
                     │      ┌────────────────┐     │     ┌─────────────────┐
                     │      │  Playwright    │─────┼────▶│  Open web       │
                     │      │  scraper       │     │     │  (universal)    │
                     │      └────────────────┘     │     └─────────────────┘
                     │                             │
                     └─────────────┬───────────────┘
                                   │
                       ┌───────────┴───────────┐
                       ▼                       ▼
              ┌────────────────┐      ┌────────────────┐
              │  DynamoDB      │      │  S3            │
              │  • Briefs      │      │  • Resumes     │
              │  • Candidates  │      │  • Avatars     │
              │  • Jobs        │      │  • Exports     │
              │  • Audit       │      └────────────────┘
              └────────────────┘`}</CodeBlock>

      <H3>Auth scoping</H3>
      <P>
        Every server route that touches a brief runs the same helper:
      </P>
      <CodeBlock lang="ts">{`// src/lib/server/sourcer.ts
export async function getCompanyIdFromRequest(req: NextRequest): Promise<string | null> {
  const token =
    extractBearerToken(req.headers.get('Authorization')) ??
    req.cookies.get('tb-company-token')?.value
  if (!token) return null
  try {
    const payload = await verifyCognitoToken(token, 'company')
    return ((payload['custom:companyId'] as string) ?? payload.sub) || null
  } catch {
    return null
  }
}`}</CodeBlock>
      <P>
        Brief-level routes load the record by <Code>id</Code> and reject if <Code>brief.companyId !== companyId</Code>. There is no
        public endpoint that returns a brief without an authenticated company match.
      </P>

      <H3>Why Scan + filter, not GSIs</H3>
      <P>
        At the per-company volumes we're targeting in 2026 (tens to low-hundreds of briefs per account), Scan + filter is cheaper
        than maintaining GSI write throughput and easier to operate. We move to GSI <Code>companyId-index</Code> when any single
        customer crosses ~1,000 active briefs — instrumented in Q3.
      </P>

      <H3>Where the calibration prompt lives</H3>
      <CodeBlock lang="ts">{`// src/lib/server/sourcer.ts
export function calibrationDigest(brief: SourcerBrief) {
  const ups: string[] = []
  const downs: string[] = []
  for (const e of brief.shortlist) {
    if (!e.calibration) continue
    const tag = \`\${e.candidateId}\${e.calibration.note ? ' — ' + e.calibration.note.slice(0, 120) : ''}\`
    if (e.calibration.vote === 'up') ups.push(tag)
    else downs.push(tag)
  }
  return { ups, downs }
}`}</CodeBlock>
      <P>
        The Sourcing route reads <Code>calibrationDigest(brief)</Code> and injects ups/downs as a discrete <Code>CALIBRATION HISTORY</Code> block
        in the system message. Keeping it as a digest (not raw history) bounds prompt size at ~16 entries × 120 chars.
      </P>
    </section>
  )
}

function SelfHostSection() {
  return (
    <section>
      <H2 id="self-host" eyebrow="05 · Self-host setup">
        From clone to running Sourcer in ten minutes.
      </H2>

      <H3>1. Clone & install</H3>
      <CodeBlock lang="bash">{`git clone https://github.com/your-org/talentbridge.git
cd talentbridge
npm install
cp .env.local.example .env.local`}</CodeBlock>

      <H3>2. Provision AWS</H3>
      <P>
        You need: a Cognito User Pool per role (company / talent), an S3 bucket, and 12 DynamoDB tables. Run the bootstrap commands
        below from a shell with AWS credentials configured for the target account.
      </P>

      <CodeBlock lang="bash">{`# 12 DynamoDB tables — id (string) PK, on-demand billing
for t in \\
  talentbridge-companies \\
  talentbridge-jobs \\
  talentbridge-candidates \\
  talentbridge-applications \\
  talentbridge-conversations \\
  talentbridge-messages \\
  talentbridge-discovered-candidates \\
  talentbridge-crm-jobs \\
  talentbridge-audit-logs \\
  talentbridge-users \\
  talentbridge-notifications \\
  talentbridge-sourcer-briefs \\
; do
  aws dynamodb create-table \\
    --table-name "$t" \\
    --attribute-definitions AttributeName=id,AttributeType=S \\
    --key-schema AttributeName=id,KeyType=HASH \\
    --billing-mode PAY_PER_REQUEST \\
    --region us-east-1
done

# Wait until they're all ACTIVE
for t in talentbridge-{companies,jobs,candidates,applications,conversations,messages,discovered-candidates,crm-jobs,audit-logs,users,notifications,sourcer-briefs}; do
  aws dynamodb wait table-exists --table-name "$t" --region us-east-1
done

# S3 bucket
aws s3api create-bucket --bucket talentbridge-uploads --region us-east-1

# Cognito user pools (run twice — once per role)
aws cognito-idp create-user-pool --pool-name talentbridge-company --region us-east-1
aws cognito-idp create-user-pool --pool-name talentbridge-talent  --region us-east-1
# (Then create app clients and copy the IDs into .env.local)`}</CodeBlock>

      <Callout variant="warn" title="PowerShell users">
        The for-loop above is bash. On Windows, run it through Git Bash / WSL, or paste the AWS commands one-by-one — see the
        single-table command in the <a href="#" className="text-tl-indigo font-semibold">README</a>.
      </Callout>

      <H3>3. Fill in env vars</H3>
      <P>The minimum to boot the AI Sourcer with real OpenAI scoring:</P>
      <CodeBlock lang="bash">{`# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=<random-32-char-string>

NEXT_OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

COGNITO_COMPANY_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_COMPANY_CLIENT_ID=...
COGNITO_TALENT_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_TALENT_CLIENT_ID=...

S3_BUCKET=talentbridge-uploads`}</CodeBlock>

      <H3>4. Run</H3>
      <CodeBlock lang="bash">{`npm run dev
# → http://localhost:3000

# Create a company account at /auth/register
# Then visit /company/ai-sourcer to create your first brief.`}</CodeBlock>

      <Callout variant="success" title="No OpenAI key? Still works.">
        The Sourcer falls back to a deterministic skill-overlap scorer and a templated outreach generator. Enough to demo the flow,
        not enough to ship to a paying customer — but a clean dev experience.
      </Callout>
    </section>
  )
}

function FaqSection() {
  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: 'Is the AI Sourcer real, or is this a mock?',
      a: (
        <>
          Real. <Code>POST /briefs/[id]/source</Code> hits OpenAI with the brief + calibration history and persists results to
          DynamoDB. <Code>POST .../engage</Code> generates the outreach via the same model. The only mocked surface is physically
          sending email — that's a one-file wire-up to SES / Resend / Postmark.
        </>
      ),
    },
    {
      q: 'How do I plug in my own LLM provider?',
      a: (
        <>
          Replace <Code>openaiJson</Code> in <Code>src/lib/server/sourcer.ts</Code>. The function takes <Code>{`{ system, user, temperature }`}</Code> and
          returns parsed JSON. Anthropic, Bedrock, and Azure OpenAI all fit the same shape.
        </>
      ),
    },
    {
      q: 'How does the AI avoid making things up about a candidate?',
      a: (
        <>
          The system prompt instructs grounding ("Be grounded in the data — do not invent facts") and the user message contains only
          fields we extracted from the candidate record. Outreach drafts are also constrained to one specific signal cited from the
          profile. Hallucination still happens — that's why every draft is a <em>draft</em> and ships behind a Mark-Sent action.
        </>
      ),
    },
    {
      q: 'What about the candidate side — do candidates get reached out to without consent?',
      a: (
        <>
          Q3 2026 ships a global do-not-contact registry that the engage route checks before sending. Today, drafts are local until
          the company explicitly marks them sent. The candidate-side experience (notifications, opt-out, transparency on which
          company surfaced them and why) is on the roadmap.
        </>
      ),
    },
    {
      q: 'Where does the candidate pool come from?',
      a: (
        <>
          Two sources: <Code>Tables.Candidates</Code> (talent who signed up directly) and <Code>Tables.DiscoveredCandidates</Code>
          (populated by the Playwright + OpenAI universal URL parser at <Code>src/lib/playwright</Code>). Continuous open-web
          discovery is a Q3 milestone — currently it's triggered per job creation.
        </>
      ),
    },
    {
      q: 'How is calibration data persisted?',
      a: (
        <>
          As a field on each shortlist entry — <Code>{`{ vote, note, votedAt }`}</Code>. The Sourcing route reads it via
          <Code>calibrationDigest(brief)</Code> and injects ups/downs into the system prompt as a <Code>CALIBRATION HISTORY</Code> block.
          Calibration never leaves the brief, so it's per-role, not global to the company.
        </>
      ),
    },
    {
      q: 'Can I export a brief to my ATS?',
      a: (
        <>
          Greenhouse + Lever sync ships Q4 2026. Until then the shortlist is reachable via{' '}
          <Code>GET /api/company/sourcer/briefs/[id]</Code> and easy to pipe into any ATS that takes JSON.
        </>
      ),
    },
  ]

  return (
    <section>
      <H2 id="faq" eyebrow="06 · FAQ">
        Common questions, real answers.
      </H2>
      <div className="divide-y divide-tl-border-default border-y border-tl-border-default mt-6">
        {items.map((it) => (
          <FaqRow key={it.q} q={it.q} a={it.a} />
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-tl-border-default bg-tl-bg-surface p-6 text-center">
        <h3 className="text-[18px] font-semibold text-tl-text-primary">Something missing?</h3>
        <p className="text-[14px] text-tl-text-secondary mt-1">
          We'd rather know what you couldn't find than guess. Tell us — we'll add it here.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-tl-indigo hover:bg-tl-indigo/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(79,70,229,0.25)] transition-colors"
        >
          Contact us <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  )
}

function FaqRow({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 text-left hover:opacity-80 transition-opacity"
      >
        <span className="text-[15px] sm:text-[16px] font-medium text-tl-text-primary">{q}</span>
        <ChevronRight
          className={'w-4 h-4 shrink-0 text-tl-text-tertiary transition-transform ' + (open ? 'rotate-90 text-tl-indigo' : '')}
        />
      </button>
      {open && (
        <div className="pb-5 text-[14px] leading-relaxed text-tl-text-secondary">
          {a}
        </div>
      )}
    </div>
  )
}
