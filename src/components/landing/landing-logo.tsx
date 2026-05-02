'use client'

/**
 * Shared TalentBridge logo. Use everywhere a brand mark is needed.
 */
export function TBLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="tb-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="hsl(var(--tb-indigo))" />
          <stop offset="1" stopColor="hsl(var(--tb-emerald))" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#tb-logo-grad)" />
      <path d="M9 11 L16 7 L23 11 L23 19 L16 23 L9 19 Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <circle cx="16" cy="15" r="2.5" fill="white" />
    </svg>
  )
}
