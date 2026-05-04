import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db, Tables, GetCommand, PutCommand } from '@/lib/aws/dynamodb'
import {
  getCompanyIdFromRequest,
  openaiJson,
  summarizeCandidate,
  summarizeBriefForAI,
  type SourcerBrief,
  type OutreachDraft,
} from '@/lib/server/sourcer'

export const runtime = 'nodejs'
export const maxDuration = 60

const engageSchema = z.object({
  channel: z.enum(['email', 'linkedin', 'sms']).default('email'),
  tone: z.enum(['warm', 'concise', 'enthusiastic', 'formal']).default('warm'),
  intent: z.enum(['initial', 'nudge', 'role-fit-check']).default('initial'),
  customNote: z.string().max(400).optional(),
  // Mark as sent rather than re-drafting
  markSent: z.boolean().optional(),
})

interface AIDraft {
  subject?: string
  body?: string
}

async function loadCandidate(candidateId: string): Promise<Record<string, unknown> | null> {
  const [c1, c2] = await Promise.all([
    db.send(new GetCommand({ TableName: Tables.Candidates, Key: { id: candidateId } })).catch(() => null),
    db.send(new GetCommand({ TableName: Tables.DiscoveredCandidates, Key: { id: candidateId } })).catch(() => null),
  ])
  return (c1?.Item as Record<string, unknown> | undefined) ??
    (c2?.Item as Record<string, unknown> | undefined) ?? null
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> },
) {
  const companyId = await getCompanyIdFromRequest(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, candidateId } = await params

  let raw: unknown = {}
  try {
    raw = await req.json()
  } catch {
    // empty body is fine — defaults apply
  }
  const parsed = engageSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  const opts = parsed.data

  // Load brief + verify ownership
  const briefRes = await db.send(new GetCommand({ TableName: Tables.SourcerBriefs, Key: { id } }))
  const brief = briefRes.Item as SourcerBrief | undefined
  if (!brief || brief.companyId !== companyId) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 })
  }

  const entryIdx = brief.shortlist.findIndex((e) => e.candidateId === candidateId)
  if (entryIdx === -1) {
    return NextResponse.json({ error: 'Candidate not in shortlist' }, { status: 404 })
  }

  // markSent path — flip status without regenerating
  if (opts.markSent) {
    const existing = brief.shortlist[entryIdx].outreach
    if (!existing) {
      return NextResponse.json({ error: 'No draft to send' }, { status: 400 })
    }
    const sent: OutreachDraft = { ...existing, status: 'sent' }
    const next: SourcerBrief = {
      ...brief,
      shortlist: brief.shortlist.map((e, i) => (i === entryIdx ? { ...e, outreach: sent } : e)),
      updatedAt: new Date().toISOString(),
    }
    await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: next }))
    return NextResponse.json({ brief: next, source: 'mark-sent' })
  }

  // Load candidate record
  const candRaw = await loadCandidate(candidateId)
  if (!candRaw) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
  const candidate = summarizeCandidate(candRaw)

  // Generate personalized outreach with OpenAI
  const channelHint =
    opts.channel === 'linkedin'
      ? 'a LinkedIn InMail'
      : opts.channel === 'sms'
      ? 'a short SMS'
      : 'an outbound email'

  const intentHint =
    opts.intent === 'nudge'
      ? 'This is a polite follow-up — they may have seen an earlier note. Keep it brief and respectful, do not assume context.'
      : opts.intent === 'role-fit-check'
      ? 'This is a check whether the role would be a fit for them given their stage in career. Pose it as a question, not a pitch.'
      : 'This is the first touch. Lead with a specific reason you reached out (cite something concrete from their profile).'

  const toneHint =
    opts.tone === 'concise'
      ? 'Tight and direct. Under 90 words. No filler.'
      : opts.tone === 'enthusiastic'
      ? 'Energetic but human. No exclamation marks stacked. Show genuine interest.'
      : opts.tone === 'formal'
      ? 'Professional and respectful. Avoid contractions.'
      : 'Warm, human, and conversational. Short sentences.'

  const system = `You are an experienced talent sourcer drafting ${channelHint} to a candidate. ${intentHint} ${toneHint}

Rules:
- Reference one specific signal from the candidate's profile (a project, role, or verified skill). Do not invent facts.
- Tie the role to something the candidate likely cares about based on their work.
- No clichés. No "I came across your profile". No "rockstar". No "synergy".
- Email body: 80–150 words. Subject: under 65 chars. Sign off as the hiring team, not a specific name.
- If the channel is "sms", body must be under 320 characters and skip the subject (return empty subject).

Return STRICT JSON: { "subject": string, "body": string }. No prose outside JSON.`

  const userPayload = {
    brief: summarizeBriefForAI(brief),
    candidate,
    channel: opts.channel,
    customNote: opts.customNote ?? null,
  }

  const draft = await openaiJson<AIDraft>({
    system,
    user: JSON.stringify(userPayload),
    temperature: 0.55,
  })

  // Fallback when OpenAI key is missing or response is malformed
  const finalDraft: OutreachDraft = draft?.body
    ? {
        subject: (draft.subject ?? '').slice(0, 120),
        body: draft.body.slice(0, 2400),
        status: 'drafted',
        generatedAt: new Date().toISOString(),
      }
    : buildFallbackDraft(brief, candidate, opts.channel)

  const next: SourcerBrief = {
    ...brief,
    shortlist: brief.shortlist.map((e, i) =>
      i === entryIdx ? { ...e, outreach: finalDraft } : e,
    ),
    updatedAt: new Date().toISOString(),
  }

  await db.send(new PutCommand({ TableName: Tables.SourcerBriefs, Item: next }))

  return NextResponse.json({
    brief: next,
    source: draft?.body ? 'openai' : 'fallback',
  })
}

function buildFallbackDraft(
  brief: SourcerBrief,
  candidate: ReturnType<typeof summarizeCandidate>,
  channel: 'email' | 'linkedin' | 'sms',
): OutreachDraft {
  const headline = candidate.headline || candidate.experience[0]?.title || 'your work'
  const focus = brief.mustHaves[0] ?? brief.title
  const subject = `Re: ${brief.title} — quick question about ${focus}`
  const body =
    channel === 'sms'
      ? `Hi ${candidate.name.split(' ')[0] || 'there'} — saw ${headline}. We're hiring a ${brief.title} where ${focus} matters; open to a 15-min chat?`
      : `Hi ${candidate.name.split(' ')[0] || 'there'},

I came across ${headline} and wanted to reach out about a ${brief.title} role we're building out. The thing that stood out: your work intersects with ${focus}, which is at the core of what this team is solving.

Would you be open to a 15-minute chat next week to see if it's a fit?

— The hiring team`
  return {
    subject: channel === 'sms' ? '' : subject,
    body,
    status: 'drafted',
    generatedAt: new Date().toISOString(),
  }
}
