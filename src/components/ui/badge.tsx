import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/15 text-primary border-primary/30',
        secondary: 'bg-secondary text-secondary-foreground border-border',
        destructive: 'bg-destructive/15 text-destructive border-destructive/30',
        outline: 'bg-transparent border-border text-foreground',
        success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        ghost: 'bg-white/5 text-muted-foreground border-white/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
