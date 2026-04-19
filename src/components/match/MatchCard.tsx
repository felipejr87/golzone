import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { TeamBadge } from '../ui/TeamBadge'

interface Props { jogo: any; compact?: boolean }

export function MatchCard({ jogo, compact = false }: Props) {
  const isLive = jogo.status === 'em_andamento'
  const isDone = jogo.status === 'finalizado'
  const isSoon = jogo.status === 'agendado'

  const hora = jogo.data_hora
    ? new Date(jogo.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <Link to={`/m/${jogo.id}`} className="block no-underline">
      <div className={cn(
        'rounded-lg border transition-colors duration-150',
        compact ? 'px-3.5 py-3' : 'px-4 py-3.5',
        isLive && 'border-red-500/25 bg-gradient-to-br from-red-950/20 to-divino-card shadow-live',
        isSoon && 'border-blue-500/20 bg-divino-card',
        isDone && 'border-white/5 bg-divino-card opacity-70',
        !isLive && !isSoon && !isDone && 'border-white/5 bg-divino-card',
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-body text-[11px] text-[--text-muted] font-medium">
            {jogo.championship?.nome}{jogo.rodada ? ` · R${jogo.rodada}` : ''}
          </span>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-500/15 text-live border border-green-500/30 animate-live-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-dot-pulse shrink-0" />
              Ao vivo
            </span>
          )}
          {isSoon && (
            <span className="font-body text-[11px] font-semibold text-scheduled">{hora}</span>
          )}
          {isDone && (
            <span className="font-body text-[10px] text-[--text-muted] uppercase tracking-wider">Encerrado</span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex flex-1 items-center gap-2.5 min-w-0">
            <TeamBadge nome={jogo.mandante?.nome || ''} escudo_url={jogo.mandante?.escudo_url} size={30} />
            <span className="font-body text-[13px] font-semibold text-[--text-primary] leading-tight truncate">
              {jogo.mandante?.nome}
            </span>
          </div>

          {/* Score */}
          <div className="text-center shrink-0 min-w-[52px]">
            {isDone || isLive ? (
              <span className="font-display text-2xl text-[--text-primary] tracking-wide">
                {jogo.resultado?.gols_mandante ?? 0}
                <span className="text-[--text-muted] mx-1">:</span>
                {jogo.resultado?.gols_visitante ?? 0}
              </span>
            ) : (
              <span className="font-body text-[13px] text-[--text-muted] font-medium">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex flex-1 items-center gap-2.5 justify-end min-w-0 flex-row-reverse">
            <TeamBadge nome={jogo.visitante?.nome || ''} escudo_url={jogo.visitante?.escudo_url} size={30} />
            <span className="font-body text-[13px] font-semibold text-[--text-primary] leading-tight truncate text-right">
              {jogo.visitante?.nome}
            </span>
          </div>
        </div>

        {/* Live video link */}
        {jogo.link_video && isLive && (
          <div className="mt-2.5 pt-2.5 border-t border-white/5">
            <a
              href={jogo.link_video}
              target="_blank"
              rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-[12px] text-divino-red font-semibold no-underline"
            >
              <YouTubeIcon size={13} /> Assistir narração ao vivo
            </a>
          </div>
        )}
      </div>
    </Link>
  )
}

function YouTubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  )
}
