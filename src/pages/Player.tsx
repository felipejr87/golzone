import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'
import { gerarRelatorioScout } from '../lib/gerarRelatorioScout'

type PlayerAba = 'stats' | 'historico' | 'premiacoes'

export default function Player() {
  const { id } = useParams()
  const pid = Number(id)
  const player = MOCK_DATA.jogadores.find(j => j.id === pid)
  const [aba, setAba] = useState<PlayerAba>('stats')

  if (!player) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12, padding: 32 }}>
      <span style={{ fontSize: 40 }}>👤</span>
      <p style={{ color: 'var(--t-3)', fontSize: 14, fontFamily: 'var(--font-body)' }}>Jogador não encontrado.</p>
      <Link to="/scout" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>← Voltar ao Scout</Link>
    </div>
  )

  const displayName = player.apelido || player.nome

  // Derivar stats dos matches
  const notasHistory: Array<{ nota: number; melhor_jogo: boolean; matchId: number; jogo: any }> = []
  const golsList: Array<{ minuto: number; tipo: string; matchId: number; jogo: any }> = []

  MOCK_DATA.matches.forEach(m => {
    m.notas.forEach((n: any) => {
      if (n.player?.nome === displayName || n.player?.nome === player.nome) {
        notasHistory.push({ nota: Number(n.nota), melhor_jogo: n.melhor_jogo, matchId: m.id, jogo: m })
      }
    })
    m.gols.forEach((g: any) => {
      if ((g.jogador === displayName || g.jogador === player.nome) && g.tipo !== 'contra') {
        golsList.push({ minuto: g.minuto, tipo: g.tipo, matchId: m.id, jogo: m })
      }
    })
  })

  const totalJogos = notasHistory.length
  const nota_media = totalJogos
    ? notasHistory.reduce((s, n) => s + n.nota, 0) / totalJogos
    : 0
  const nota_media_str = nota_media ? nota_media.toFixed(1) : null
  const melhorCount = notasHistory.filter(n => n.melhor_jogo).length
  const maxNota = totalJogos ? Math.max(...notasHistory.map(n => n.nota)) : 0
  const minNota = totalJogos ? Math.min(...notasHistory.map(n => n.nota)) : 0

  const cor = nota_media >= 8 ? 'var(--green)' : nota_media >= 6 ? 'var(--yellow)' : nota_media > 0 ? 'var(--red)' : 'var(--t-3)'

  const consistencia = totalJogos >= 3 ? Math.max(0, 10 - (maxNota - minNota)) : 5
  const artilharia = Math.min(10, golsList.length * 2)
  const mvpRate = totalJogos ? (melhorCount / totalJogos) * 10 : 0

  const attrs = [
    { label: 'Média geral', val: nota_media },
    { label: 'Consistência', val: consistencia },
    { label: 'Artilharia', val: artilharia },
    { label: 'MVP rate', val: mvpRate },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 80 }}>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(160deg,#0D0204 0%,var(--bg-card) 60%)',
        borderBottom: '0.5px solid var(--b-1)',
        padding: '24px 20px 20px',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--r-xl)',
            background: 'var(--bg-card-2)', border: '2px solid var(--b-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: 'var(--t-2)', flexShrink: 0,
            fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
          }}>
            {displayName.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', lineHeight: 1.2, fontFamily: 'var(--font-body)' }}>
              {displayName}
            </div>
            {player.apelido && (
              <div style={{ fontSize: 13, color: 'var(--t-3)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{player.nome}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {player.posicao && (
                <span style={{
                  padding: '3px 10px', borderRadius: 100,
                  background: 'var(--red-dim)', border: '0.5px solid var(--red-border)',
                  fontSize: 11, fontWeight: 700, color: 'var(--red)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)',
                }}>
                  {player.posicao}
                </span>
              )}
              {melhorCount > 0 && (
                <span style={{
                  padding: '3px 10px', borderRadius: 100,
                  background: 'rgba(245,184,0,0.1)', border: '0.5px solid rgba(245,184,0,0.25)',
                  fontSize: 11, fontWeight: 700, color: 'var(--yellow)', fontFamily: 'var(--font-body)',
                }}>
                  ⭐ {melhorCount}× MVP
                </span>
              )}
            </div>
          </div>

          {nota_media_str && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                border: `3px solid ${cor}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: `${cor}15`,
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: cor, lineHeight: 1 }}>
                  {nota_media_str}
                </div>
                <div style={{ fontSize: 9, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>média</div>
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 20 }}>
          {[
            { label: 'Jogos',    valor: totalJogos,       color: 'var(--t-1)'    },
            { label: 'Gols',     valor: golsList.length,  color: 'var(--green)'  },
            { label: 'MVP',      valor: `${melhorCount}×`, color: 'var(--yellow)' },
            { label: 'Nota máx', valor: maxNota || '—',   color: 'var(--red)'    },
          ].map(k => (
            <div key={k.label} style={{
              background: 'var(--bg-card-2)', borderRadius: 'var(--r-md)',
              padding: '10px 8px', textAlign: 'center', border: '0.5px solid var(--b-1)',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: k.color, lineHeight: 1 }}>
                {String(k.valor)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--t-3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => gerarRelatorioScout({
              nome: player.nome, apelido: player.apelido, posicao: player.posicao,
              nota_media: nota_media_str,
              jogos: totalJogos, gols_total: golsList.length,
              melhor_jogo_count: melhorCount,
              historico_notas: notasHistory.map(n => ({
                nota: n.nota, melhor_jogo: n.melhor_jogo, match_id: n.matchId,
                jogo: { mandante: n.jogo.mandante, visitante: n.jogo.visitante, rodada: n.jogo.rodada, championship: n.jogo.championship },
              })),
              premios: [],
            })}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 16px', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-2)',
              borderRadius: 'var(--r-md)', color: 'var(--t-1)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
            📄 Relatório Scout PDF
          </button>
          <button
            onClick={() => {
              const txt = `${displayName} · Nota média ${nota_media_str || '—'} · ${golsList.length} gols · ${melhorCount}× MVP pela Divino TV`
              if (navigator.share) navigator.share({ title: 'Divino App', text: txt, url: window.location.href })
              else navigator.clipboard.writeText(`${txt}\n${window.location.href}`)
            }}
            style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 16px', background: 'transparent', border: '0.5px solid var(--b-1)',
              borderRadius: 'var(--r-md)', color: 'var(--t-2)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>
            Compartilhar
          </button>
        </div>
      </div>

      {/* Barra de evolução */}
      {notasHistory.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--b-1)', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 11, color: 'var(--t-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
            Evolução das notas
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
            {notasHistory.slice(-12).map((n, i) => {
              const h = Math.max(4, Math.round((n.nota / 10) * 40))
              const c = n.nota >= 8 ? 'var(--green)' : n.nota >= 6 ? 'var(--yellow)' : 'var(--red)'
              return (
                <div key={i} style={{ flex: 1 }}>
                  <div style={{ width: '100%', height: h, background: c, borderRadius: 2, opacity: 0.85 }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>Mín {minNota}</span>
            <span style={{ fontSize: 11, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>Máx {maxNota}</span>
          </div>
        </div>
      )}

      {/* Abas */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--b-1)', padding: '0 20px' }}>
        {([
          ['stats', 'Estatísticas'],
          ['historico', 'Histórico'],
          ['premiacoes', 'Premiações'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setAba(k)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            borderBottom: aba === k ? '2px solid var(--red)' : '2px solid transparent',
            color: aba === k ? 'var(--t-1)' : 'var(--t-2)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-body)',
          }}>{l}</button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '16px 20px' }}>

        {aba === 'stats' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--t-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
              Perfil técnico
            </div>
            {attrs.map(a => {
              const pct = Math.min(100, Math.round((a.val / 10) * 100))
              const c = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--t-3)'
              return (
                <div key={a.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--t-2)', fontFamily: 'var(--font-body)' }}>{a.label}</span>
                    <span style={{ fontSize: 13, color: c, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{a.val.toFixed(1)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-card-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}

            <div style={{ fontSize: 11, color: 'var(--t-3)', margin: '20px 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>
              Dados gerais
            </div>
            {[
              { label: 'Posição',         valor: player.posicao || '—' },
              { label: 'Time atual',       valor: player.time || '—'    },
              { label: 'Jogos avaliados', valor: totalJogos             },
              { label: 'Gols',            valor: golsList.length        },
              { label: 'Vezes MVP',       valor: `${melhorCount}×`      },
              { label: 'Nota máxima',     valor: maxNota || '—'         },
              { label: 'Nota mínima',     valor: minNota || '—'         },
              { label: 'Nota média',      valor: nota_media_str || '—'  },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '11px 0', borderBottom: '0.5px solid var(--b-1)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--t-2)', fontFamily: 'var(--font-body)' }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--t-1)', fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>
                  {String(row.valor)}
                </span>
              </div>
            ))}
          </div>
        )}

        {aba === 'historico' && (
          <div>
            {notasHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--t-3)', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                Nenhum histórico disponível.
              </div>
            ) : (
              notasHistory.map((n, i) => {
                const c = n.nota >= 8 ? 'var(--green)' : n.nota >= 6 ? 'var(--yellow)' : 'var(--red)'
                return (
                  <Link key={i} to={`/m/${n.matchId}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 0', borderBottom: '0.5px solid var(--b-1)',
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', border: `2px solid ${c}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        fontFamily: 'var(--font-display)', fontSize: 18, color: c,
                      }}>
                        {n.nota}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
                          {n.jogo.mandante?.nome} × {n.jogo.visitante?.nome}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t-3)', marginTop: 2, fontFamily: 'var(--font-body)' }}>
                          {n.jogo.championship?.nome} · R{n.jogo.rodada}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                        {n.melhor_jogo && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 100,
                            background: 'rgba(245,184,0,0.1)', border: '0.5px solid rgba(245,184,0,0.25)',
                            fontSize: 10, color: 'var(--yellow)', fontWeight: 700, fontFamily: 'var(--font-body)',
                          }}>⭐ MVP</span>
                        )}
                        <span style={{ fontSize: 11, color: 'var(--t-3)' }}>→</span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {aba === 'premiacoes' && (
          <div>
            {melhorCount > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {notasHistory.filter(n => n.melhor_jogo).map((n, i) => (
                  <Link key={i} to={`/m/${n.matchId}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      background: 'rgba(245,184,0,0.05)', border: '0.5px solid rgba(245,184,0,0.2)',
                      borderRadius: 'var(--r-lg)',
                    }}>
                      <span style={{ fontSize: 24 }}>⭐</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2, fontFamily: 'var(--font-body)' }}>
                          Melhor do Jogo
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--t-1)', fontFamily: 'var(--font-body)' }}>
                          {n.jogo.mandante?.nome} × {n.jogo.visitante?.nome}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>
                          {n.jogo.championship?.nome} · R{n.jogo.rodada}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--yellow)' }}>{n.nota}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>🏅</span>
                <p style={{ color: 'var(--t-3)', fontSize: 13, fontFamily: 'var(--font-body)' }}>Nenhuma premiação ainda.</p>
              </div>
            )}

            {/* CTA */}
            <div style={{
              padding: 16, background: 'var(--bg-card)',
              border: '0.5px dashed var(--b-2)', borderRadius: 'var(--r-lg)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t-1)', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Este é você?</div>
              <div style={{ fontSize: 12, color: 'var(--t-3)', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
                Reivindique seu perfil para adicionar foto e receber notificações
              </div>
              <a
                href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá Divino TV! Quero reivindicar meu perfil no Divino App. Meu nome é ${player.nome}.`)}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                  background: 'rgba(37,211,102,0.1)', border: '0.5px solid rgba(37,211,102,0.25)',
                  borderRadius: 'var(--r-md)', color: '#25D166', fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'var(--font-body)',
                }}>
                💬 Falar com a Divino TV
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
