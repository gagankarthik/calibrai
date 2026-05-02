---
name: TalentBridge Project Overview
description: Full-stack AI talent platform — tech stack, status, and $2MM ARR goal
type: project
---

TalentBridge is an AI-powered talent acquisition platform targeting $2MM ARR (15 Enterprise + 40 Growth + 100 Starter accounts). Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and AWS.

**Why:** Entrepreneur building to sell to enterprises. Speed to MVP matters.

**How to apply:** Prioritize working features over polish. Prefer AWS-native services.

## Current Status (as of 2026-05-01)

### Completed
- Full Next.js 16 app with company and talent portals (all routes)
- **Light theme** — clean indigo/violet palette replacing dark gold theme
- **AWS Cognito** — two user pools (company + talent), JWT verification via `aws-jwt-verify`
- **AWS DynamoDB** — 9 tables: companies, jobs, candidates, applications, conversations, messages, discovered-candidates, audit-logs, users
- **AWS S3** — presigned URL generation for resume and asset uploads
- **25 API routes** replacing all mock data
- **Playwright candidate discovery** — triggers on job publish, scrapes GitHub API + LinkedIn public profiles
- `NEXT_PUBLIC_USE_MOCK=false` — mock data disabled by default
- Build passes TypeScript type check cleanly

### Configuration Required (before going live)
1. Create DynamoDB tables: run `npx tsx scripts/setup-dynamodb.ts`
2. Set real AWS credentials in `.env.local`
3. Configure two Cognito User Pools (company + talent) in AWS Console
4. Create S3 bucket `talentbridge-uploads` with CORS for PUT uploads
5. Optional: add `GITHUB_TOKEN` to increase candidate discovery rate limits

## Tech Stack
- Framework: Next.js 16 (App Router), React 18
- Auth: AWS Cognito (two pools: CompanyPool + TalentPool)
- DB: AWS DynamoDB (PAY_PER_REQUEST billing)
- Storage: AWS S3 (resumes, avatars)
- Candidate Discovery: Playwright (GitHub API + LinkedIn scraping)
- UI: Tailwind CSS light theme, Radix UI, Framer Motion, Recharts
- State: Zustand

## Key Files
- `src/lib/aws/` — DynamoDB, Cognito, S3 clients
- `src/lib/playwright/candidate-discovery.ts` — AI candidate discovery via Playwright
- `src/app/api/` — 25 real API routes (no mocks)
- `scripts/setup-dynamodb.ts` — one-time table creation script
- `.env.local` — local environment config template

## Revenue Model
- Starter: $499/mo | Growth: $2,499/mo | Enterprise: $7,999/mo
- Target: $2MM ARR by Q4 2026
