# TalentBridge

> An AI employee that does the end-to-end job of a talent sourcer — so your team focuses on the conversations that close.

[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-232F3E?style=flat-square&logo=amazondynamodb)](https://aws.amazon.com/dynamodb/)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?style=flat-square&logo=openai)](https://platform.openai.com)

TalentBridge is a two-sided hiring platform: **companies → candidates** and **candidates → companies**, mediated by an autonomous **AI Sourcer** that runs four phases on its own — Understanding, Sourcing, Calibration, and Engagement.

Hiring teams write a brief; the AI Sourcer reads it, hunts candidates across the company's talent graph + discovered profiles, scores them with OpenAI, learns from thumbs-up/down feedback, and drafts personalized outreach. The longer it runs, the closer it tracks each manager's taste.

---

## Table of contents

- [The AI Sourcer](#the-ai-sourcer)
- [Architecture](#architecture)
- [Routes](#routes)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [AWS / DynamoDB setup](#aws--dynamodb-setup)
- [Project structure](#project-structure)
- [Roadmap & hiring plan](#roadmap--hiring-plan)
- [Working with Claude Code](#working-with-claude-code)
- [License](#license)

---

## The AI Sourcer

A single autonomous agent runs four phases per hiring brief. Time-allocation is approximate and adapts to each role.

| Phase | % | What it does | API |
|---|---|---|---|
| **Understanding** | 5 | Captures structured intent from the hiring manager — must-haves, nice-to-haves, location, work mode, experience window, signal sources, the bar for "great". Persisted as a `SourcerBrief`. | `POST /api/company/sourcer/briefs` |
| **Sourcing** | 40 | Reads the brief + every prior calibration signal, summarizes the candidate pool (`Candidates` + `DiscoveredCandidates`), scores up to 40 candidates with OpenAI in JSON mode (`gpt-4o-mini`, temperature 0.2), persists a ranked shortlist with per-candidate reasoning. Heuristic fallback if no OpenAI key. | `POST /api/company/sourcer/briefs/[id]/source` |
| **Calibration** | 40 | Stores thumbs ↑ / ↓ per candidate. The next sourcing run automatically folds these signals into the system prompt — liked profiles bias the search, rejected ones penalize. | `POST /api/company/sourcer/briefs/[id]/calibrate` |
| **Engagement** | 15 | Drafts personalized outreach (email / LinkedIn / SMS · warm / concise / enthusiastic / formal · initial / nudge / role-fit-check) with one specific signal cited from the candidate's profile. Templated fallback if OpenAI is unavailable. | `POST /api/company/sourcer/briefs/[id]/candidates/[candidateId]/engage` |

### The calibration loop

This is the part that compounds:

```
Brief ──► Source 40 ──► Manager rates a few ↑/↓
   ▲                                  │
   │                                  ▼
   └────── Re-source (taste-aware) ◄──┘
```

After two or three calibration rounds, the prompt carries a `CALIBRATION HISTORY` block. The AI rewards the patterns the manager already validated and avoids the ones it rejected. Calibration is the moat — every good rating makes the next sourcing run better, and that improvement is per-customer.

### What's real today

- Real OpenAI calls (`src/lib/server/sourcer.ts` → `openaiJson`) using `gpt-4o-mini` JSON mode.
- Real DynamoDB persistence in `talentbridge-sourcer-briefs`.
- Real Cognito JWT auth scoping every brief to its company.
- Heuristic fallbacks (skill-overlap scoring, templated outreach) for development without API keys.
- Audit log entries on brief creation via `logAuditEvent`.

### What is intentionally a hook, not a feature

- **Email send**. We persist a draft and a `status: 'sent'` flag (toggled by a "Mark sent" action). Wiring SES / Resend / Postmark is a one-file change in the engage route.
- **Live web sourcing of new candidates**. Today the AI Sourcer scores from `Candidates` + `DiscoveredCandidates` (the latter populated by the existing Playwright + OpenAI URL scraper at `src/lib/playwright`). Continuous open-web discovery is queued for Q3.

---

## Architecture

```
┌──────────────┐     ┌─────────────────────────────┐     ┌─────────────────┐
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
              └────────────────┘
```

**Stack**

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, RSC), React 18 |
| Language | TypeScript 5 (strict) |
| Auth | AWS Cognito (separate company / talent pools) |
| Database | AWS DynamoDB (one table per entity) |
| File storage | AWS S3 |
| AI | OpenAI `gpt-4o-mini` (JSON mode, temp 0.2 for scoring, 0.55 for outreach) |
| Web scraping | Playwright + OpenAI universal URL parser |
| Styling | Tailwind 3 + CSS variables (`--tb-*` design tokens) |
| Animations | Framer Motion 10 |
| Forms / validation | React Hook Form + Zod |
| Notifications | Sonner |
| Icons | Lucide React |

---

## Routes

### Public

| Route | Purpose |
|---|---|
| `/` | Landing — hero, AI Sourcer showcase, trust strip, CTA |
| `/pricing` | Plans (Starter / Growth / Enterprise) |
| `/contact` | Sales form |
| `/docs` | Product + API documentation |
| `/auth/login` | Sign in (company or talent role from query) |
| `/auth/register` | Sign up — 2-step (role → details) |
| `/auth/verify` | 6-digit OTP verification |

### Company portal (Cognito-gated, `tb-company-token` cookie)

| Route | Purpose |
|---|---|
| `/company/dashboard` | Pipeline KPIs, recent activity |
| `/company/ai-sourcer` | Briefs list + new-brief intake (Phase 1 · Understanding) |
| `/company/ai-sourcer/[id]` | Single brief workspace (Phases 2–4) |
| `/company/jobs` | Job postings |
| `/company/candidates` | Talent pool browser |
| `/company/pipeline` | Drag-and-drop kanban |
| `/company/messages` | Inbox |
| `/company/analytics` | Funnel, sourcing ROI, diversity |
| `/company/settings` | Team, billing, profile |
| `/company/audit` | Audit log |

### Talent portal (Cognito-gated, `tb-talent-token` cookie)

| Route | Purpose |
|---|---|
| `/talent/dashboard` | Top matches, application activity |
| `/talent/jobs` | Browse AI-matched roles |
| `/talent/applications` | Application tracker |
| `/talent/profile` | Profile editor |
| `/talent/skills` | Skills verification lab |

### Internal API (selected)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/company/sourcer/briefs` | GET, POST | List + create briefs |
| `/api/company/sourcer/briefs/[id]` | GET, PATCH, DELETE | Single brief CRUD |
| `/api/company/sourcer/briefs/[id]/source` | POST | Run Sourcing phase (real OpenAI) |
| `/api/company/sourcer/briefs/[id]/calibrate` | POST, DELETE | Thumbs ↑/↓ per candidate |
| `/api/company/sourcer/briefs/[id]/candidates/[candidateId]/engage` | POST | Generate / regenerate / mark-sent outreach |
| `/api/company/jobs` | GET, POST | List + create jobs |
| `/api/company/jobs/[id]/match-candidates` | POST | OpenAI candidate matching for a single job |
| `/api/company/jobs/[id]/discover-candidates` | POST | Trigger Playwright web discovery |
| `/api/company/candidates` | GET | Candidate pool (filterable) |
| `/api/auth/register`, `/login`, `/verify-email`, `/forgot-password` | POST | Auth flow |

Full API reference: **[/docs](http://localhost:3000/docs)**.

---

## Getting started

### Prerequisites

- Node 18.17+
- An AWS account (Cognito + DynamoDB + S3)
- An OpenAI API key (optional — heuristic fallbacks run without one)

### Local dev

```bash
git clone https://github.com/your-org/talentbridge.git
cd talentbridge
npm install
cp .env.local.example .env.local   # then fill in the AWS + OpenAI keys
npm run dev
# → http://localhost:3000
```

### Build

```bash
npm run build
npm start
npm run lint
npx tsc --noEmit                   # type-check only
```

---

## Environment variables

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=<random-32-char-string>     # gates internal cross-route calls

# OpenAI (optional but recommended)
NEXT_OPENAI_API_KEY=sk-...                      # AI Sourcer + match engine
OPENAI_MODEL=gpt-4o-mini                        # override the default

# AWS — region + credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Cognito
COGNITO_COMPANY_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_COMPANY_CLIENT_ID=...
COGNITO_TALENT_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_TALENT_CLIENT_ID=...

# DynamoDB tables (defaults shown — set only to override)
DYNAMODB_COMPANIES_TABLE=talentbridge-companies
DYNAMODB_JOBS_TABLE=talentbridge-jobs
DYNAMODB_CANDIDATES_TABLE=talentbridge-candidates
DYNAMODB_APPLICATIONS_TABLE=talentbridge-applications
DYNAMODB_CONVERSATIONS_TABLE=talentbridge-conversations
DYNAMODB_MESSAGES_TABLE=talentbridge-messages
DYNAMODB_DISCOVERED_TABLE=talentbridge-discovered-candidates
DYNAMODB_CRM_JOBS_TABLE=talentbridge-crm-jobs
DYNAMODB_AUDIT_TABLE=talentbridge-audit-logs
DYNAMODB_USERS_TABLE=talentbridge-users
DYNAMODB_NOTIFICATIONS_TABLE=talentbridge-notifications
DYNAMODB_SOURCER_BRIEFS_TABLE=talentbridge-sourcer-briefs

# S3
S3_BUCKET=talentbridge-uploads

# Email (optional — wiring an SES/Resend/Postmark provider is a one-file change)
RESEND_API_KEY=re_...
EMAIL_FROM=hello@yourdomain.com
```

---

## AWS / DynamoDB setup

The app uses **one DynamoDB table per entity** with `id` as the partition key. No GSIs are required — list endpoints use Scan + filter (consistent with the rest of the codebase). For the AI Sourcer the only new table is:

```powershell
# PowerShell (Windows)
aws dynamodb create-table `
  --table-name talentbridge-sourcer-briefs `
  --attribute-definitions AttributeName=id,AttributeType=S `
  --key-schema AttributeName=id,KeyType=HASH `
  --billing-mode PAY_PER_REQUEST `
  --region us-east-1

aws dynamodb wait table-exists --table-name talentbridge-sourcer-briefs --region us-east-1
```

```bash
# Bash / macOS / Linux
aws dynamodb create-table \
  --table-name talentbridge-sourcer-briefs \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

For all other tables (companies, jobs, candidates, applications, etc.) the same pattern applies — see `src/lib/aws/dynamodb.ts` for the full registry and run an equivalent `create-table` command per name. A complete bootstrap script is at **[/docs#self-host](http://localhost:3000/docs#self-host)**.

---

## Project structure

```
talentbridge/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Landing (hero + AI Sourcer showcase + trust strip)
│   │   ├── docs/                             # Public product + API docs
│   │   ├── auth/{login,register,verify}/     # Cognito-backed auth
│   │   ├── pricing/, contact/                # Marketing
│   │   ├── company/
│   │   │   ├── ai-sourcer/                   # Briefs index + per-brief workspace
│   │   │   ├── dashboard/, jobs/, candidates/, pipeline/
│   │   │   ├── analytics/, messages/, settings/, audit/
│   │   ├── talent/{dashboard,jobs,applications,profile,skills}/
│   │   └── api/
│   │       ├── company/sourcer/briefs/...    # The 6 AI Sourcer endpoints
│   │       ├── company/jobs/, candidates/, applications/, team/, profile/
│   │       ├── auth/{login,register,verify-email,forgot-password}
│   │       └── talent/, admin/, contact, health
│   ├── lib/
│   │   ├── aws/{cognito,dynamodb,s3}.ts      # AWS clients
│   │   ├── server/{sourcer,jobs,applications}.ts  # Server-only helpers
│   │   ├── playwright/                       # Universal URL → candidate parser
│   │   ├── audit.ts, rate-limit.ts, types.ts
│   │   └── api.ts, utils.ts, constants.ts
│   └── components/
│       ├── landing/                          # Hero, nav, footer, editorial primitives
│       ├── shared/{sidebar-company,sidebar-talent,sidebar-admin}.tsx
│       └── ui/                               # Radix-based primitives
├── public/
├── .claude/agents/                           # Reusable Claude Code subagent configs
├── tailwind.config.ts                        # tb-* + tl-* design tokens
└── README.md
```

---

## Roadmap & hiring plan

I'm running this product like it has to win on its own merits — not on logo design. The roadmap is paced against the hires that unlock each phase.

### Q2 2026 — Foundations (now)

- ✅ AI Sourcer four-phase loop (Understanding · Sourcing · Calibration · Engagement)
- ✅ Cognito auth, DynamoDB persistence, OpenAI scoring
- ✅ Public marketing surface + `/docs`
- ☐ Email send wiring (SES first, Resend optional)
- ☐ Per-company GSI on `talentbridge-sourcer-briefs` once volumes exceed 1k briefs/account

**Hires:** 1 staff backend engineer (Dynamo + AWS infra), 1 senior frontend (design system + flows), 1 founding designer (Awwwards-grade marketing + product).

### Q3 2026 — The autonomy lift

- Continuous web sourcing — the Playwright scraper runs daily per active brief, dedupes against the existing pool, and adds to the shortlist without manual prompting.
- Candidate consent + opt-out registry — every reach-out checks a global "do-not-contact" Dynamo table before send.
- Calibration analytics — show the manager which signals their AI has internalized after 10/50/200 ratings.
- Two-sided messaging surface — the candidate side gets a real inbox, not just an applicant tracker.

**Hires:** 1 ML / applied-research engineer (calibration loop quality, eval harness), 1 data engineer (event pipeline → Dynamo Streams → S3 parquet), 1 senior backend (queues + idempotency).

### Q4 2026 — Trust & scale

- SOC 2 Type II audit kicks off (control evidence already collected by audit log).
- ATS sync (Greenhouse + Lever first), so the Sourcer's shortlist becomes ATS candidates without copy-paste.
- Per-company custom embeddings — fine-tune retrieval against each customer's calibration history.
- GDPR data-residency option (eu-west-1 deployment).

**Hires:** 1 security engineer (SOC 2 + pentest cycle), 1 customer-engineer (deployment + integrations), 1 founding GTM hire.

### Q1 2027 — Marketplace dynamics

- Talent side becomes a sourceable surface: candidates opt into being matched, with full transparency on which company asked and why.
- Sourcing-as-a-service: the AI Sourcer can run for embedded/contract recruiters at agencies, with multi-tenant calibration history.
- LATAM + EMEA expansion — paid in local currency, sourced in local language (`gpt-4o` for non-English calibration).

**Hires:** 1 head of marketplace, 1 i18n / localization engineer.

### How I think about hiring (CEO note)

The four phases of the AI Sourcer are also the four phases of building this team. **Understanding** the role precisely (what does this engineer ship in their first 90 days?) — most of the leverage is here. **Sourcing** ruthlessly across the open web. **Calibrating** against signals — every interview either tightens or loosens the loop. **Engaging** with one specific reason per candidate, no templated cold reach.

The product I'm building reflects how I think hiring should be done. We dogfood the AI Sourcer for our own roles.

---

## Working with Claude Code

This repo ships with **subagent configs in `.claude/agents/`** so any team member running Claude Code can deploy a specialist on demand:

| Agent | Use it when |
|---|---|
| `backend-reviewer` | Reviewing a route, schema, or Dynamo write — checks auth scoping, validation, audit logs, error paths. |
| `frontend-reviewer` | Reviewing a component or page — checks tokens (`tl-*`), a11y, focus states, light/dark consistency. |
| `sourcer-quality-auditor` | Auditing the calibration loop — checks that ↑/↓ feedback actually changes downstream prompts and scores. |
| `docs-maintainer` | After shipping a new route or env var — updates README + `/docs` consistently. |

Invoke from inside Claude Code:

```
> Use the backend-reviewer agent on src/app/api/company/sourcer/briefs/[id]/source/route.ts
```

There's also a `CLAUDE.md` at the project root with house rules, naming conventions, and what *not* to refactor.

---

## License

MIT.

---

<div align="center">
  <strong>TalentBridge</strong> — An AI employee that performs the end-to-end role of a talent sourcer.<br/>
  Built with Next.js, DynamoDB, Cognito, and OpenAI.
</div>
