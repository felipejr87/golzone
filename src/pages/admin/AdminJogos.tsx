import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_DATA } from '../../lib/mockData'

export default function AdminJogos() {
  const [filtro, setFiltro] = useState(0)

  const jogos = filtro
    ? MOCK_DATA.matches.filter(m => m.championship_id === filtro)
    : MOCK_DATA.matches

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t-1)', margin: 0 }}>Jogos</h1>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select value={filtro} onChange={e => setFiltro(Number(e.target.value))}
          style={{
            width: '100%', background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)',
            borderRadius: 'var(--r-lg)', padding: '10px 14px',
            color: 'var(--t-1)', fontSize: 14, outline: 'none',
            fontFamily: 'var(--font-body)',
          }}>
          <option value={0}>Todos os campeonatos</option>
          {MOCK_DATA.campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jogos.map(j => {
          const isDone = j.status === 'finalizado'
          const isLive = j.status === 'em_andamento'
          return (
            <div key={j.id} style={{
              background: 'var(--bg-card)', border: `0.5px solid ${isLive ? 'var(--red-border)' : 'var(--b-1)'}`,
              borderRadius: 'var(--r-lg)', padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>
                  {j.championship?.nome} · Rodada {j.rodada}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                  fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: isDone ? 'rgba(74,80,104,0.2)' : isLive ? 'var(--red-dim)' : 'rgba(75,159,255,0.1)',
                  color: isDone ? 'var(--t-3)' : isLive ? 'var(--red)' : '#60A5FA',
                }}>
                  {isDone ? 'Encerrado' : isLive ? '● Ao vivo' : 'Agendado'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: 'var(--t-1)', flex: 1, fontSize: 14, fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {j.mandante?.nome}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--t-1)', flexShrink: 0, textAlign: 'center', minWidth: 80, fontFamily: 'var(--font-display)', fontSize: 20 }}>
                  {isDone || isLive
                    ? `${j.resultado?.gols_mandante ?? 0} : ${j.resultado?.gols_visitante ?? 0}`
                    : j.data_hora
                      ? new Date(j.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                      : 'vs'
                  }
                </span>
                <span style={{ fontWeight: 700, color: 'var(--t-1)', flex: 1, fontSize: 14, fontFamily: 'var(--font-body)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {j.visitante?.nome}
                </span>
              </div>

              {j.local && (
                <p style={{ fontSize: 11, color: 'var(--t-3)', marginBottom: 10, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                  📍 {j.local}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/m/${j.id}`} target="_blank" style={{
                  fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)',
                  color: 'var(--t-2)', textDecoration: 'none', fontFamily: 'var(--font-body)',
                }}>
                  👁️ Ver jogo
                </Link>
                <Link to={`/admin/jogos/${j.id}/sumula`} style={{
                  fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-card-2)', border: '0.5px solid var(--b-1)',
                  color: 'var(--t-2)', textDecoration: 'none', fontFamily: 'var(--font-body)',
                }}>
                  📋 Súmula
                </Link>
                {!isDone ? (
                  <Link to={`/admin/narracao/${j.id}`} style={{
                    fontSize: 12, fontWeight: 700, padding: '7px 12px', borderRadius: 'var(--r-sm)',
                    background: 'var(--red-dim)', border: '0.5px solid var(--red-border)',
                    color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {isLive ? '🔴 Continuar narração' : '🎙️ Narrar jogo'}
                  </Link>
                ) : (
                  <Link to={`/m/${j.id}`} style={{
                    fontSize: 12, color: 'var(--t-3)', textDecoration: 'none',
                    padding: '7px 12px', fontFamily: 'var(--font-body)',
                  }}>
                    Ver resultado →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
