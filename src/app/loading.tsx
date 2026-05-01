import { Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5">
      {/* Logo mark */}
      <div className="relative">
        {/* Spinner ring */}
        <div className="w-16 h-16 rounded-full border-2 border-white/[0.08] border-t-blue-500 animate-spin" />
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
      </div>

      {/* Brand name */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold text-foreground">
          Calibr<span className="gradient-text">AI</span>
        </span>
        <span className="text-xs text-muted-foreground animate-pulse">Loading...</span>
      </div>
    </div>
  )
}
