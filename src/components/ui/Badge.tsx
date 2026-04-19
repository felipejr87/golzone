import { cn } from '@/lib/utils'

type BadgeVariant = 'live' | 'scheduled' | 'ended' | 'mvp' | 'top'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  live:      'bg-green-500/15 text-live border border-green-500/30 animate-live-pulse',
  scheduled: 'bg-blue-500/10  text-scheduled border border-blue-500/20',
  ended:     'bg-slate-500/15 text-ended border border-slate-500/20',
  mvp:       'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black shadow-score',
  top:       'bg-yellow-400/10 text-score-elite border border-yellow-400/25',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
      'font-body text-label font-bold uppercase tracking-wider',
      variants[variant],
      className
    )}>
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-live animate-dot-pulse shrink-0" />
      )}
      {children}
    </span>
  )
}
