import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../lib/data'
import { TeamBadge } from '../components/ui/TeamBadge'
import { HeroScore } from '../components/match/HeroScore'
import { MvpCard } from '../components/player/MvpCard'
import { PlayerRankRow } from '../components/player/PlayerRankRow'
import { Badge } from '../components/ui/Badge'

type Aba = 'sumula' | 'notas' | 'cartola' | 'info'

export default function Match() {
  const { id } = useParams()
  const match = db.jogos.buscar(Number(id))
  const [aba, setAba] = useState<Aba>('sumula')

  if (!match) return <NotFound msg="Jogo não encontrado." />

  const isLive = match.status === 'em_andamento'
  const isDone = match.status === 'finalizado'
  const melhor = match.notas?.find((n: any) => n.melhor_jogo)
  const notasOrdenadas = [...(match.notas || [])].sort((a: any, b: any) => b.nota - a.nota)

  const matchGols = match!.gols || []
  const matchNotas = match!.notas || []

  function calcPontos(nota: any): number {
    const playerNome = nota.player?.nome || ''
    const gols = matchGols.filter((g: any) => g.jogador === playerNome && g.tipo !== 'contra').length
    const notaBonus = nota.nota ? Math.round((Number(nota.nota) - 5) * 2) : 0
    const mvp = nota.melhor_jogo ? 5 : 0
    return gols * 8 + notaBonus + mvp
  }

  const rankingCartola = [...matchNotas]
    .map((n: any) => ({ ...n, pts: calcPontos(n) }))
    .sort((a: any, b: any) => b.pts - a.pts)

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
        {([
          ['sumula', 'Súmula'],
          ['notas',  'Notas'],
          ...(isDone ? [['cartola', 'Pontuação']] : []),
          ['info',   'Info'],
        ] as [Aba, string][]).map(([k, l]) => (
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

        {aba === 'cartola' && isDone && (
          <div>
            {/* Legenda */}
            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--sep)',
              borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>⭐</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  Pontuação DivinoTV
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  Gol=8pts · Nota±2/pt · MVP=+5 · Amarelo=−2 · Vermelho=−5
                </div>
              </div>
            </div>

            {/* MVP destaque */}
            {melhor && (
              <div style={{
                background: 'linear-gradient(90deg,rgba(245,184,0,0.08),transparent)',
                border: '0.5px solid rgba(245,184,0,0.25)',
                borderRadius: 'var(--r-lg)', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              }}>
                <span style={{ fontSize: 28 }}>🏆</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: 'var(--yellow)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
                    MVP · Melhor do Jogo
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                    {(melhor.player as any)?.apelido || melhor.player?.nome}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--yellow)', lineHeight: 1 }}>
                    {calcPontos(melhor)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>pts</div>
                </div>
              </div>
            )}

            {/* Ranking */}
            {rankingCartola.length > 0 ? (
              <div>
                {rankingCartola.map((n: any, idx: number) => {
                  const pts: number = n.pts
                  const golsJog = matchGols.filter((g: any) => g.jogador === n.player?.nome && g.tipo !== 'contra').length
                  const ptsCor = pts >= 20 ? 'var(--green)' : pts >= 5 ? 'var(--yellow)' : pts < 0 ? 'var(--red)' : 'var(--text-secondary)'
                  return (
                    <Link key={n.id} to={`/p/${n.player?.id || 0}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 0', borderBottom: '0.5px solid var(--sep)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 18,
                          color: idx === 0 ? 'var(--yellow)' : idx === 1 ? 'var(--text-secondary)' : idx === 2 ? '#CD7F32' : 'var(--text-muted)',
                          width: 24, textAlign: 'center', flexShrink: 0,
                        }}>{idx + 1}</span>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0,
                        }}>
                          {(n.player?.nome || '?').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {(n.player as any)?.apelido || n.player?.nome}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                            {golsJog > 0 && <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-body)' }}>⚽ {golsJog}</span>}
                            {n.melhor_jogo && <span style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'var(--font-body)' }}>⭐ MVP</span>}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Nota {n.nota}</span>
                          </div>
                        </div>
                        <div style={{
                          padding: '6px 12px', borderRadius: 'var(--r-md)', flexShrink: 0,
                          background: pts >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(232,35,42,0.08)',
                          border: `0.5px solid ${pts >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(232,35,42,0.2)'}`,
                        }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: ptsCor, lineHeight: 1 }}>
                            {pts > 0 ? '+' : ''}{pts}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>pts</div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyMsg>Pontuação não disponível.</EmptyMsg>
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
