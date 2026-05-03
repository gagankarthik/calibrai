/**
 * Decorative section backgrounds for the landing page.
 *
 * Use as the first child of a relatively-positioned section. Each variant
 * is `pointer-events-none` and `aria-hidden` so it does not interfere with
 * content. Designed for the light theme — calm indigo / emerald accents.
 */

import { cn } from '@/lib/utils'

type Variant = 'dots' | 'grid' | 'mesh' | 'aurora' | 'soft'

interface Props {
  variant?: Variant
  className?: string
}

export function SectionPattern({ variant = 'dots', className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        className,
      )}
    >
      {variant === 'dots' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(79,70,229,0.18) 1.2px, transparent 1.6px)',
              backgroundSize: '22px 22px',
              maskImage:
                'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 78%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 78%)',
            }}
          />
        </>
      )}

      {variant === 'grid' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(17,24,39,0.07) 1px, transparent 1px),' +
                'linear-gradient(to bottom, rgba(17,24,39,0.07) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
              maskImage:
                'radial-gradient(ellipse 75% 65% at 50% 30%, black 25%, transparent 82%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 75% 65% at 50% 30%, black 25%, transparent 82%)',
            }}
          />
          <div className="absolute -top-32 right-0 w-[480px] h-[480px] rounded-full bg-tl-indigo/10 blur-[110px]" />
          <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-tl-teal/8 blur-[110px]" />
        </>
      )}

      {variant === 'mesh' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(at 18% 22%, rgba(79,70,229,0.18) 0px, transparent 55%),' +
                'radial-gradient(at 78% 30%, rgba(5,150,105,0.16) 0px, transparent 50%),' +
                'radial-gradient(at 30% 88%, rgba(2,132,199,0.14) 0px, transparent 55%),' +
                'radial-gradient(at 82% 80%, rgba(217,119,6,0.10) 0px, transparent 55%)',
            }}
          />
        </>
      )}

      {variant === 'aurora' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(180deg, rgba(238,242,255,0.85) 0%, rgba(238,242,255,0.45) 35%, rgba(255,255,255,0) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(79,70,229,0.16) 1.1px, transparent 1.6px)',
              backgroundSize: '30px 30px',
              maskImage:
                'linear-gradient(180deg, black 5%, transparent 85%)',
              WebkitMaskImage:
                'linear-gradient(180deg, black 5%, transparent 85%)',
            }}
          />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-[50%] bg-tl-indigo/15 blur-[120px]" />
        </>
      )}

      {variant === 'soft' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(238,242,255,0.85) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
          <div className="absolute -bottom-32 -right-24 w-[500px] h-[500px] rounded-full bg-tl-teal/14 blur-[120px]" />
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-tl-indigo/14 blur-[110px]" />
        </>
      )}
    </div>
  )
}
