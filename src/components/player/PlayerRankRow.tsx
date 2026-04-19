import { cn } from '@/lib/utils'
import { RatingCircle } from '@/components/ui/RatingCircle'

interface Props {
  rank?: number
  nome: string
  apelido?: string
  nota: number
  timeNome?: string
  isMvp?: boolean
  className?: string
}

export function PlayerRankRow({ rank, nome, apelido, nota, timeNome, isMvp, className }: Props) {
  const displayName = apelido || nome

  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg',
      isMvp
        ? 'bg-yellow-400/5 border border-yellow-400/15'
        : 'bg-divino-card border border-white/5',
      className
    )}>
      {rank != null && (
        <span className={cn(
          'font-body text-[12px] font-bold w-6 text-center shrink-0',
          rank === 1 ? 'text-score-elite' : rank === 2 ? 'text-[--text-secondary]' : 'text-[--text-muted]'
        )}>
          {rank}
        </span>
      )}

      <div className="w-8 h-8 rounded-full bg-divino-elevated border border-white/8 flex items-center justify-center shrink-0">
        <span className="font-body text-[11px] font-bold text-[--text-secondary]">
          {displayName.slice(0, 2).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn(
          'font-body text-[13px] font-semibold truncate',
          isMvp ? 'text-score-elite' : 'text-[--text-primary]'
        )}>
          {displayName}
        </div>
        {timeNome && (
          <div className="font-body text-[11px] text-[--text-muted] truncate">{timeNome}</div>
        )}
      </div>

      {isMvp && (
        <span className="font-body text-[9px] font-bold uppercase tracking-wider text-score-elite bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5 shrink-0">
          MVP
        </span>
      )}

      <RatingCircle score={nota} size="sm" />
    </div>
  )
}
