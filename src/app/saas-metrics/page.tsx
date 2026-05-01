'use client'

import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Clock,
  Target,
  BarChart2,
} from 'lucide-react'

// ─── Mock data ────────────────────────────────────────────────────────────────

const planData = [
  { name: 'Starter', customers: 18, mrr: 18 * 299, fill: '#6366f1' },
  { name: 'Growth', customers: 21, mrr: 21 * 799, fill: '#8b5cf6' },
  { name: 'Enterprise', customers: 8, mrr: 8 * 2499, fill: '#06b6d4' },
]

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4']

const mrrGrowth = [
  { month: 'Oct', mrr: 94000 },
  { month: 'Nov', mrr: 108000 },
  { month: 'Dec', mrr: 119000 },
  { month: 'Jan', mrr: 131000 },
  { month: 'Feb', mrr: 145000 },
  { month: 'Mar', mrr: 158000 },
  { month: 'Apr', mrr: 172000 },
  { month: 'May', mrr: 186400 },
]

const keyRatios = [
  { label: 'LTV', value: '$23,856', sub: 'Lifetime value per customer' },
  { label: 'Churn Rate', value: '1.8%/mo', sub: 'Monthly revenue churn' },
  { label: 'Payback Period', value: '8.2 mo', sub: 'CAC recovery time' },
  { label: 'NPS Score', value: '72', sub: 'Net Promoter Score' },
]

const kpiCards = [
  {
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    label: 'MRR',
    value: '$186,400',
    trend: '+12% MoM',
    trendColor: 'text-emerald-400',
    sub: 'Target: $166,667 for $2M ARR',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    label: 'ARR',
    value: '$2,236,800',
    trend: 'Target: $2M ✓',
    trendColor: 'text-emerald-400',
    sub: 'Exceeds $2M target',
  },
  {
    icon: Users,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    label: 'Active Companies',
    value: '47',
    trend: '+8 this month',
    trendColor: 'text-purple-400',
    sub: 'Paid customers',
  },
  {
    icon: Award,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    label: 'Net Revenue Retention',
    value: '118%',
    trend: 'Best-in-class >110%',
    trendColor: 'text-emerald-400',
    sub: 'Expansion > churn',
  },
  {
    icon: Target,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    label: 'CAC',
    value: '$2,840',
    trend: 'LTV:CAC ratio 8.4x',
    trendColor: 'text-emerald-400',
    sub: 'Customer acquisition cost',
  },
  {
    icon: BarChart2,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    label: 'Hires Facilitated',
    value: '1,247',
    trend: '+189 this month',
    trendColor: 'text-blue-400',
    sub: 'Total placements to date',
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function MrrTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1117]/90 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-emerald-400">${(payload[0].value / 1000).toFixed(1)}K</p>
    </div>
  )
}

function PlanTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { customers: number } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1117]/90 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="font-semibold text-foreground mb-0.5">{d.name}</p>
      <p className="text-muted-foreground">{d.payload.customers} customers</p>
      <p className="text-cyan-400 font-bold">${d.value.toLocaleString()} MRR</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SaasMetricsPage() {
  const totalMrr = planData.reduce((s, p) => s + p.mrr, 0)

  return (
    <div className="min-h-screen bg-[#080a0f] text-foreground">
      {/* Simple header bar */}
      <header className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-3">
          <span className="font-bold text-sm tracking-tight text-white">Calibr Internal</span>
          <span className="text-white/20 text-lg">—</span>
          <span className="text-sm text-muted-foreground">SaaS Metrics</span>
          <span className="ml-auto text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            Leadership only
          </span>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-10 space-y-10">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="section-eyebrow">Internal Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">SaaS Metrics</h1>
          <p className="text-sm text-muted-foreground">For Calibr leadership only</p>
        </motion.div>

        {/* KPI grid — 2 / sm:3 / lg:6 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {kpiCards.map((card) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="stat-card group flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                  <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight leading-none">{card.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{card.label}</div>
              </div>
              <div className="mt-auto space-y-0.5">
                <div className={`text-[11px] font-semibold ${card.trendColor}`}>{card.trend}</div>
                <div className="text-[10px] text-muted-foreground/70">{card.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts row — 3 columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* 1. Plan Breakdown (Pie + Bar) */}
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <BarChart2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Plan Breakdown</h2>
                <p className="text-[11px] text-muted-foreground">Revenue by tier</p>
              </div>
            </div>

            {/* Pie chart */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="mrr"
                    nameKey="name"
                  >
                    {planData.map((entry, i) => (
                      <Cell key={entry.name} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PlanTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend rows */}
            <div className="space-y-2">
              {planData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="text-muted-foreground/50">({p.customers})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">${p.mrr.toLocaleString()}</span>
                    <span className="text-muted-foreground/50 text-[10px]">{((p.mrr / totalMrr) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={planData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<PlanTooltip />} />
                <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                  {planData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 2. MRR Growth */}
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">MRR Growth</h2>
                <p className="text-[11px] text-muted-foreground">8-month trajectory</p>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">$186.4K</div>
                <div className="text-[11px] text-muted-foreground">Current MRR</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-emerald-400">+98%</div>
                <div className="text-[11px] text-muted-foreground">8-month growth</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={mrrGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}K`} />
                <Tooltip content={<MrrTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#mrrGrad)"
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Target line indicator */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/[0.06]">
              <span className="text-muted-foreground">$2M ARR target</span>
              <span className="text-emerald-400 font-semibold">$166.7K/mo — Exceeded ✓</span>
            </div>
          </motion.div>

          {/* 3. Key Ratios */}
          <motion.div variants={itemVariants} className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10">
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Key Ratios</h2>
                <p className="text-[11px] text-muted-foreground">Unit economics health</p>
              </div>
            </div>

            <div className="space-y-3">
              {keyRatios.map((r) => (
                <div
                  key={r.label}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">{r.sub}</div>
                  </div>
                  <div className="text-xl font-bold text-foreground shrink-0">{r.value}</div>
                </div>
              ))}
            </div>

            {/* NPS benchmark */}
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">NPS benchmark (SaaS median: 41)</span>
                <span className="text-cyan-400 font-semibold">72 — Excellent</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  style={{ width: `${(72 / 100) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
