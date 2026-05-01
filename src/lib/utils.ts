import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`
  return `${fmt(min)} – ${fmt(max)}`
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getMatchColor(score: number): string {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 75) return 'text-blue-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

export function getMatchBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
  if (score >= 75) return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
  return 'bg-red-500/10 border-red-500/30 text-red-400'
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}
