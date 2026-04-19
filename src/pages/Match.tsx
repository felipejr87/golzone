import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../lib/data'
import { TeamBadge } from '../components/ui/TeamBadge'
import { HeroScore } from '../components/match/HeroScore'
import { MvpCard } from '../components/player/MvpCard'
import { PlayerRankRow } from '../components/player/PlayerRankRow'
import { Badge } from '../components/ui/Badge'

type Aba = 'sumula' | 'notas' | 'info'

export default function Match() {
  const { id } = useParams()
  const match = db.jogos.buscar(Number(id))
  const [aba, setAba] = useState<Aba>('sumula')

  if (!match) return <NotFound msg="Jogo não encontrado." />

  const isLive = match.status === 'em_andamento'
  const isDone = match.status === 'finalizado'
  const melhor = match.notas?.find((n: any) => n.melhor_jogo)
  const notasOrdenadas = [...(match.notas || [])].sort((a: any, b: any) => b.nota - a.nota)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 80 }}>

      {/* PLACAR HERO */}
      <div style={{
        background: 'linear-gradient(160deg,#130204 0%,var(--bg-card) 60%)',
        borderBottom: '0.5px solid var(--sep)',
        padding: '20px 16px 20px',
      }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Link to={`/c/${match.championship_id}`} className="font-body text-[12px] text-[--text-muted] no-underline">
            ← {match.championship?.nome}{match.rodada ? ` · Rodada ${match.rodada}` : ''}
          </Link>
          {isLive && <Badge variant="live">Ao vivo</Badge>}
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <TeamBadge nome={match.mandante?.nome || ''} size={48} />
            <span className="font-body text-[13px] font-semibold text-[--text-primary] text-center leading-tight">
              {match.mandante?.nome}
            </span>
          </div>

          {isDone || isLive ? (
            <HeroScore
              homeScore={match.resultado?.gols_mandante ?? 0}
              awayScore={match.resultado?.gols_visitante ?? 0}
              isLive={isLive}
              className="shrink-0"
            />
          ) : (
            <div className="text-center px-2">
              <span className="font-body text-[16px] text-[--text-muted] font-medium">vs</span>
              {match.data_hora && (
                <div className="font-body text-[12px] text-[--text-muted] mt-1">
                  {new Date(match.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-1 flex-col items-center gap-2">
            <TeamBadge nome={match.visitante?.nome || ''} size={48} />
            <span className="font-body text-[13px] font-semibold text-[--text-primary] text-center leading-tight">
              {match.visitante?.nome}
            </span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {match.local && <span className="font-body text-[11px] text-[--text-muted]">📍 {match.local}</span>}
          {match.sumula?.arbitro && <span className="font-body text-[11px] text-[--text-muted]">⚖ {match.sumula.arbitro}</span>}
        </div>

        {match.link_video && (
          <div className="mt-4 text-center">
            <a href={match.link_video} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
              ▶ Assistir narração
            </a>
          </div>
        )}
      </div>

      {/* MVP */}
      {melhor && (
        <div className="mx-4 mt-3">
          <MvpCard
            nome={melhor.player?.nome || ''}
            apelido={(melhor.player as any)?.apelido}
            nota={Number(melhor.nota)}
            timeNome={(melhor as any).team?.nome}
          />
        </div>
      )}

      {/* Abas */}
      <div style={{
        display: 'flex', borderBottom: '0.5px solid var(--sep)',
        padding: '0 16px', marginTop: 12,
      }}>
        {([['sumula', 'Súmula'], ['notas', 'Notas'], ['info', 'Info']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setAba(k)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            borderBottom: aba === k ? '2px solid var(--divino-red)' : '2px solid transparent',
            color: aba === k ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-body)',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {aba === 'sumula' && (
          <div>
            {match.gols?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Gols</SectionLabel>
                {match.gols.map((g: any) => (
                  <EventRow key={g.id} minuto={g.minuto} texto={g.jogador} sub={g.team?.nome}
                    badge={g.tipo !== 'normal' ? (g.tipo === 'penalti' ? 'P' : 'CG') : undefined}
                    cor="var(--score-great)" />
                ))}
              </div>
            )}
            {match.cartoes?.length > 0 && (
              <div>
                <SectionLabel>Cartões</SectionLabel>
                {match.cartoes.map((c: any) => (
                  <EventRow key={c.id} minuto={c.minuto} texto={c.jogador} sub={c.team?.nome}
                    badge={c.tipo === 'amarelo' ? '🟨' : c.tipo === 'vermelho' ? '🟥' : '🟨🟥'}
                    cor={c.tipo === 'amarelo' ? 'var(--score-avg)' : 'var(--score-poor)'} />
                ))}
              </div>
            )}
            {!match.gols?.length && !match.cartoes?.length && (
              <EmptyMsg>Súmula ainda não disponível.</EmptyMsg>
            )}
          </div>
        )}

        {aba === 'notas' && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 16 }}>
              Avaliações da narração Divino TV
            </p>
            {notasOrdenadas.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {notasOrdenadas.map((n: any, i: number) => (
                  <PlayerRankRow
                    key={n.id}
                    rank={i + 1}
                    nome={n.player?.nome || ''}
                    apelido={(n.player as any)?.apelido}
                    nota={Number(n.nota)}
                    timeNome={(n as any).team?.nome}
                    isMvp={!!n.melhor_jogo}
                  />
                ))}
              </div>
            ) : (
              <EmptyMsg>Notas ainda não disponíveis.</EmptyMsg>
            )}
          </div>
        )}

        {aba === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              ['Árbitro', match.sumula?.arbitro],
              ['Público', match.sumula?.publico?.toLocaleString('pt-BR')],
              ['Local', match.local],
            ] as const).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)',
                border: '0.5px solid var(--sep)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>{v}</span>
              </div>
            ))}
            {match.sumula?.observacoes && (
              <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 'var(--r-md)', border: '0.5px solid var(--sep)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>Observações</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>{match.sumula.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
      {children}
    </div>
  )
}

function EventRow({ minuto, texto, sub, badge, cor }: { minuto?: number; texto: string; sub?: string; badge?: string; cor?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '0.5px solid var(--sep)',
    }}>
      <span style={{ fontSize: 12, color: cor || 'var(--text-muted)', fontWeight: 700, width: 28, flexShrink: 0, fontFamily: 'var(--font-body)' }}>
        {minuto ? `${minuto}'` : '—'}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{texto}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, fontFamily: 'var(--font-body)' }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize: 13 }}>{badge}</span>}
    </div>
  )
}

function NotFound({ msg }: { msg: string }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{msg}</div>
}
function EmptyMsg({ children }: { children: string }) {
  return <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-body)' }}>{children}</div>
}
