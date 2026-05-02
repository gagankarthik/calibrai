import { Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-tl-bg-base flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-tl-border-subtle border-t-tl-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-tl-gold/10 border border-tl-gold/30 flex items-center justify-center shadow-gold">
            <Zap className="w-4 h-4 text-tl-gold" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-sm font-bold gradient-text">TalentBridge</span>
        <span className="text-xs text-tl-text-secondary animate-pulse">Loading...</span>
      </div>
    </div>
  )
}
