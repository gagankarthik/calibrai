import { NextResponse } from 'next/server'
import type { PricingPlan } from '@/lib/types'

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for early-stage startups and small teams',
    monthlyPrice: 499,
    annualPrice: 399,
    features: [
      '5 active job postings',
      '3 team members',
      '100 AI match credits/month',
      'Basic pipeline Kanban',
      'Email support',
      'Standard analytics',
    ],
    limits: { jobs: 5, members: 3, aiCredits: 100 },
    highlighted: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For scaling teams that need powerful AI hiring tools',
    monthlyPrice: 2499,
    annualPrice: 1999,
    features: [
      '20 active job postings',
      '10 team members',
      '500 AI match credits/month',
      'Full pipeline Kanban',
      'Skills assessments',
      'Diversity reports',
      'Advanced analytics + exports',
      'Greenhouse & Lever integration',
      'Priority support',
    ],
    limits: { jobs: 20, members: 10, aiCredits: 500 },
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale with advanced compliance and BI',
    monthlyPrice: 7999,
    annualPrice: 6399,
    features: [
      'Unlimited job postings',
      'Unlimited team members',
      'Unlimited AI match credits',
      'Full pipeline + automation',
      'Advanced skills lab',
      'Real-time bias detection',
      'Custom BI integrations',
      'All ATS integrations + custom API',
      'Predictive retention scoring',
      'Dedicated CSM + SLA',
    ],
    limits: { jobs: -1, members: -1, aiCredits: -1 },
    highlighted: false,
    badge: 'Enterprise',
  },
]

export async function GET() {
  return NextResponse.json(plans)
}
