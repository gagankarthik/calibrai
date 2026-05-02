import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { scrapeHiringCafe } from '@/lib/playwright/job-discovery'

const schema = z.object({
  keywords: z.array(z.string().max(50).trim()).max(10).default([]),
  limit: z.number().int().min(1).max(50).default(30),
})

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 })
  }

  const { keywords, limit } = parsed.data
  const jobs = await scrapeHiringCafe(keywords, limit)
  return NextResponse.json({ jobs, count: jobs.length })
}
