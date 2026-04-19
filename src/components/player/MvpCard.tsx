import { cn } from '@/lib/utils'
import { RatingCircle } from '@/components/ui/RatingCircle'

interface Props {
  nome: string
  apelido?: string
  nota: number
  posicao?: string
  timeNome?: string
  className?: string
}

export function MvpCard({ nome, apelido, nota, posicao, timeNome, className }: Props) {
  const displayName = apelido || nome

  return (
    <div className={cn(
      'rounded-xl p-4 flex items-center gap-4',
      'bg-gradient-to-br from-yellow-400/10 via-yellow-500/5 to-transparent',
      'border border-yellow-400/20',
      className
    )}>
      <div className="w-10 h-10 rounded-full bg-yellow-400/15 border border-yellow-400/25 flex items-center justify-center shrink-0">
        <span className="font-display text-lg text-score-elite leading-none">
          {displayName.slice(0, 2).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-body text-[10px] font-bold uppercase tracking-widest text-score-elite mb-0.5">
          Melhor do jogo · Divino TV
        </div>
        <div className="font-body text-[15px] font-bold text-[--text-primary] truncate">{displayName}</div>
        {(posicao || timeNome) && (
          <div className="font-body text-[11px] text-[--text-muted] mt-0.5">
            {[posicao, timeNome].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      <RatingCircle score={nota} size="md" />
    </div>
  )
}
