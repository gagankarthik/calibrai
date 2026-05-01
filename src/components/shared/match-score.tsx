import { cn, getMatchBg } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface MatchScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function MatchScore({ score, size = 'md', showLabel = true, className }: MatchScoreProps) {
  const colorClass = getMatchBg(score)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-full border font-semibold', colorClass, sizeClasses[size], className)}>
      <Sparkles className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      <span>{score}%</span>
      {showLabel && size !== 'sm' && <span className="font-normal opacity-80">match</span>}
    </div>
  )
}

interface MatchRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export function MatchRing({ score, size = 60, strokeWidth = 4 }: MatchRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const color = score >= 90 ? '#10B981' : score >= 75 ? '#3B82F6' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{score}%</span>
      </div>
    </div>
  )
}
