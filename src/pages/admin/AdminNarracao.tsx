import { useState } from 'react'
import { MOCK_DATA, ESCALACOES } from '../../lib/mockData'
import type { EscalacaoJogador } from '../../lib/mockData'

type Match = typeof MOCK_DATA.matches[number]

function getTeamNome(id: number) {
  return MOCK_DATA.times.find(t => t.id === id)?.nome ?? '—'
}

function getTeamStats(teamId: number, campId: number) {
  const nome = getTeamNome(teamId)
  const partidas = MOCK_DATA.matches.filter(m =>
    m.championship_id === campId &&
    (m.mandante_id === teamId || m.visitante_id === teamId) &&
    m.status === 'finalizado'
  )

  let wins = 0, draws = 0, losses = 0, gf = 0, gc = 0
  partidas.forEach(m => {
    if (!m.resultado) return
    const isHome = m.mandante_id === teamId
    const tf = isHome ? m.resultado.gols_mandante : m.resultado.gols_visitante
    const ta = isHome ? m.resultado.gols_visitante : m.resultado.gols_mandante
    gf += tf; gc += ta
    if (tf > ta) wins++; else if (tf === ta) draws++; else losses++
  })

  // Artilheiros do time no campeonato
  const artilheiros: Record<string, number> = {}
  partidas.forEach(m => m.gols.forEach(g => {
    if (g.team.nome === nome) artilheiros[g.jogador] = (artilheiros[g.jogador] || 0) + 1
  }))
  const topArtilheiros = Object.entries(artilheiros)
    .sort(([, a], [, b]) => b - a).slice(0, 5)

  // Cartões do time
  const cartoesMap: Record<string, { amarelo: number; vermelho: number }> = {}
  partidas.forEach(m => m.cartoes.forEach(c => {
    if (c.team.nome === nome) {
      if (!cartoesMap[c.jogador]) cartoesMap[c.jogador] = { amarelo: 0, vermelho: 0 }
      if (c.tipo === 'amarelo') cartoesMap[c.jogador].amarelo++
      else if (c.tipo === 'vermelho') cartoesMap[c.jogador].vermelho++
      else { cartoesMap[c.jogador].amarelo++; cartoesMap[c.jogador].vermelho++ }
    }
  }))
  const cartoes = Object.entries(cartoesMap)

  // Últimos resultados (forma)
  const ultimos = partidas.slice(-5).reverse().map(m => {
    if (!m.resultado) return null
    const isHome = m.mandante_id === teamId
    const tf = isHome ? m.resultado.gols_mandante : m.resultado.gols_visitante
    const ta = isHome ? m.resultado.gols_visitante : m.resultado.gols_mandante
    const oponente = isHome ? m.visitante?.nome : m.mandante?.nome
    return { result: tf > ta ? 'V' : tf === ta ? 'E' : 'D', tf, ta, oponente, matchId: m.id }
  }).filter(Boolean)

  return { wins, draws, losses, gf, gc, topArtilheiros, cartoes, ultimos, partidas }
}

function getH2H(id1: number, id2: number) {
  return MOCK_DATA.matches.filter(m =>
    m.status === 'finalizado' &&
    ((m.mandante_id === id1 && m.visitante_id === id2) ||
     (m.mandante_id === id2 && m.visitante_id === id1))
  )
}

export default function AdminNarracao() {
  const [matchSel, setMatchSel] = useState<Match | null>(null)
  const [aba, setAba] = useState<'escalacao' | 'stats' | 'h2h'>('escalacao')

  const proximos = MOCK_DATA.matches.filter(m => m.status === 'agendado' || m.status === 'em_andamento')

  if (!matchSel) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">🎙️ Iniciar Narração</h1>
          <p className="text-gray-500 text-sm mt-1">Selecione o jogo para acessar o painel do narrador</p>
        </div>

        {proximos.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-10">Nenhum jogo agendado no momento.</p>
        )}

        <div className="space-y-3">
          {proximos.map(m => (
            <button key={m.id} onClick={() => setMatchSel(m)}
              className="w-full bg-[#111811] border border-white/10 hover:border-[#E8232A]/60 rounded-2xl p-5 text-left transition group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">{m.championship?.nome} · Rodada {m.rodada}</span>
                {m.status === 'em_andamento'
                  ? <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">🔴 AO VIVO</span>
                  : <span className="text-xs text-gray-500">
                      {m.data_hora ? new Date(m.data_hora).toLocaleString('pt-BR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : 'A definir'}
                    </span>
                }
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-2">⚽</div>
                  <p className="font-bold text-white text-sm">{m.mandante?.nome}</p>
                  <p className="text-xs text-gray-500">Mandante</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="font-display text-3xl text-gray-500">VS</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-2">⚽</div>
                  <p className="font-bold text-white text-sm">{m.visitante?.nome}</p>
                  <p className="text-xs text-gray-500">Visitante</p>
                </div>
              </div>
              {m.local && <p className="text-xs text-gray-500 text-center mt-3">📍 {m.local}</p>}
              <div className="mt-4 flex justify-center">
                <span className="bg-[#E8232A] group-hover:bg-[#B01B21] text-white text-sm font-bold px-6 py-2 rounded-full transition">
                  🎙️ Narrar este jogo
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Painel do Narrador ──────────────────────────────────────────────────
  const mId = matchSel.mandante_id
  const vId = matchSel.visitante_id
  const mStats = getTeamStats(mId, matchSel.championship_id)
  const vStats = getTeamStats(vId, matchSel.championship_id)
  const h2h    = getH2H(mId, vId)
  const mEsc   = ESCALACOES[mId] ?? []
  const vEsc   = ESCALACOES[vId] ?? []

  const tabs = [
    { key: 'escalacao', label: '📋 Escalação' },
    { key: 'stats',     label: '📊 Estatísticas' },
    { key: 'h2h',       label: '⚡ H2H' },
  ] as const

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <button onClick={() => setMatchSel(null)}
          className="text-gray-500 text-sm hover:text-white transition mb-3 flex items-center gap-1">
          ← Trocar jogo
        </button>
        <div className="bg-gradient-to-r from-[#1A0506] to-[#0E0F15] rounded-2xl p-5 border border-white/5">
          <p className="text-xs text-gray-500 text-center mb-3">{matchSel.championship?.nome} · Rodada {matchSel.rodada}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-2">⚽</div>
              <p className="font-bold text-white">{matchSel.mandante?.nome}</p>
              <p className="text-xs text-green-400 mt-0.5">{mStats.wins}V {mStats.draws}E {mStats.losses}D</p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="font-display text-4xl text-gray-600">VS</div>
              {matchSel.data_hora && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(matchSel.data_hora).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                </p>
              )}
              {matchSel.local && <p className="text-xs text-gray-600 mt-0.5">📍 {matchSel.local}</p>}
            </div>
            <div className="flex-1 text-center">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-2">⚽</div>
              <p className="font-bold text-white">{matchSel.visitante?.nome}</p>
              <p className="text-xs text-green-400 mt-0.5">{vStats.wins}V {vStats.draws}E {vStats.losses}D</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-5">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setAba(t.key)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition ${
              aba === t.key ? 'border-[#E8232A] text-white' : 'border-transparent text-gray-600 hover:text-gray-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ABA ESCALAÇÃO ── */}
      {aba === 'escalacao' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EscalacaoPanel nome={matchSel.mandante?.nome ?? '—'} jogadores={mEsc} isHome />
          <EscalacaoPanel nome={matchSel.visitante?.nome ?? '—'} jogadores={vEsc} />
        </div>
      )}

      {/* ── ABA STATS ── */}
      {aba === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatsPanel nome={matchSel.mandante?.nome ?? '—'} stats={mStats} />
          <StatsPanel nome={matchSel.visitante?.nome ?? '—'} stats={vStats} />
        </div>
      )}

      {/* ── ABA H2H ── */}
      {aba === 'h2h' && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Confrontos Diretos ({h2h.length} jogo{h2h.length !== 1 ? 's' : ''})
          </h3>
          {h2h.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-10 bg-[#111811] rounded-2xl">
              Sem confrontos diretos anteriores.
            </p>
          )}
          {h2h.map(m => {
            const mWon = (m.resultado?.gols_mandante ?? 0) > (m.resultado?.gols_visitante ?? 0)
            const vWon = (m.resultado?.gols_visitante ?? 0) > (m.resultado?.gols_mandante ?? 0)
            return (
              <div key={m.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 mb-2">
                <p className="text-xs text-gray-500 mb-2">{m.championship?.nome} · Rodada {m.rodada}</p>
                <div className="flex items-center gap-3">
                  <span className={`font-bold flex-1 truncate ${mWon ? 'text-green-400' : 'text-white'}`}>
                    {m.mandante?.nome}
                  </span>
                  <span className="font-display text-2xl text-white flex-shrink-0">
                    {m.resultado?.gols_mandante} × {m.resultado?.gols_visitante}
                  </span>
                  <span className={`font-bold flex-1 text-right truncate ${vWon ? 'text-green-400' : 'text-white'}`}>
                    {m.visitante?.nome}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Resumo H2H */}
          {h2h.length > 0 && (() => {
            let w1 = 0, w2 = 0, d = 0
            h2h.forEach(m => {
              if (!m.resultado) return
              const gm = m.resultado.gols_mandante, gv = m.resultado.gols_visitante
              if (gm > gv) w1++; else if (gv > gm) w2++; else d++
            })
            return (
              <div className="mt-4 bg-[#111811] border border-white/10 rounded-xl p-4 grid grid-cols-3 text-center">
                <div>
                  <p className="font-display text-3xl text-green-400">{w1}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{matchSel.mandante?.nome}</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-gray-400">{d}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Empates</p>
                </div>
                <div>
                  <p className="font-display text-3xl text-blue-400">{w2}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{matchSel.visitante?.nome}</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function EscalacaoPanel({ nome, jogadores, isHome }: {
  nome: string
  jogadores: EscalacaoJogador[]
  isHome?: boolean
}) {
  const titulares  = jogadores.filter((j: EscalacaoJogador) => j.titular)
  const reservas   = jogadores.filter((j: EscalacaoJogador) => !j.titular)
  const corBorda   = isHome ? 'border-[#E8232A]/30' : 'border-[#4B9FFF]/30'
  const corTitulo  = isHome ? 'text-[#E8232A]' : 'text-[#4B9FFF]'

  return (
    <div className={`bg-[#111811] border ${corBorda} rounded-2xl overflow-hidden`}>
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className={`font-bold text-sm ${corTitulo}`}>{nome}</h3>
        <span className="text-xs text-gray-500">{isHome ? 'Mandante' : 'Visitante'}</span>
      </div>

      <div className="p-3">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-1">Titulares</p>
        <div className="space-y-1 mb-4">
          {[...titulares].sort((a: EscalacaoJogador, b: EscalacaoJogador) => a.numero - b.numero).map((j: EscalacaoJogador) => (
            <div key={j.numero} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition">
              <span className="w-7 text-center font-display text-lg text-[#F5B800] flex-shrink-0">{j.numero}</span>
              <span className="font-bold text-white text-sm flex-1">{j.nome}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">{j.posicao}</span>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-1">Reservas</p>
        <div className="space-y-1">
          {reservas.map((j: EscalacaoJogador) => (
            <div key={j.numero} className="flex items-center gap-3 px-2 py-1.5 rounded-lg opacity-60">
              <span className="w-7 text-center font-display text-base text-gray-600 flex-shrink-0">{j.numero}</span>
              <span className="text-white text-sm flex-1">{j.nome}</span>
              <span className="text-xs text-gray-600 flex-shrink-0">{j.posicao}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type TeamStats = ReturnType<typeof getTeamStats>

function StatsPanel({ nome, stats }: { nome: string; stats: TeamStats }) {
  const aprv = stats.wins + stats.draws + stats.losses > 0
    ? Math.round((stats.wins * 3) / ((stats.wins + stats.draws + stats.losses) * 3) * 100)
    : 0

  return (
    <div className="bg-[#111811] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="font-bold text-white text-sm">{nome}</h3>
      </div>
      <div className="p-4 space-y-4">

        {/* Aproveitamento */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aproveitamento no campeonato</p>
          <div className="grid grid-cols-5 gap-1 text-center mb-2">
            {[
              { val: stats.wins,   label: 'V', cor: 'text-green-400 bg-green-500/10' },
              { val: stats.draws,  label: 'E', cor: 'text-yellow-400 bg-yellow-500/10' },
              { val: stats.losses, label: 'D', cor: 'text-red-400 bg-red-500/10' },
              { val: stats.gf,     label: 'GP', cor: 'text-white bg-white/5' },
              { val: stats.gc,     label: 'GC', cor: 'text-gray-400 bg-white/5' },
            ].map(({ val, label, cor }) => (
              <div key={label} className={`rounded-xl py-2 ${cor}`}>
                <div className="font-display text-xl">{val}</div>
                <div className="text-xs">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${aprv}%` }} />
            </div>
            <span className="text-xs text-green-400 font-bold flex-shrink-0">{aprv}%</span>
          </div>
        </div>

        {/* Artilheiros */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">⚽ Artilheiros</p>
          {stats.topArtilheiros.length === 0
            ? <p className="text-gray-600 text-xs">Sem gols registrados</p>
            : stats.topArtilheiros.map(([nome, gols]) => (
              <div key={nome} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white text-sm flex-1">{nome}</span>
                <span className="flex items-center gap-1 text-[#00D68F] font-bold">
                  <span className="font-display text-lg">{gols}</span>
                  <span className="text-xs">gol{gols !== 1 ? 's' : ''}</span>
                </span>
              </div>
            ))
          }
        </div>

        {/* Cartões */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🟨 Cartões</p>
          {stats.cartoes.length === 0
            ? <p className="text-gray-600 text-xs">Sem cartões registrados</p>
            : stats.cartoes.map(([nome, c]) => (
              <div key={nome} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white text-sm flex-1">{nome}</span>
                <div className="flex items-center gap-1.5">
                  {c.amarelo > 0 && (
                    <span className="flex items-center gap-0.5 bg-yellow-400/15 px-1.5 py-0.5 rounded text-yellow-400 text-xs font-bold">
                      🟨{c.amarelo}
                    </span>
                  )}
                  {c.vermelho > 0 && (
                    <span className="flex items-center gap-0.5 bg-red-400/15 px-1.5 py-0.5 rounded text-red-400 text-xs font-bold">
                      🟥{c.vermelho}
                    </span>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        {/* Últimos resultados */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📅 Últimos resultados</p>
          {stats.ultimos.length === 0
            ? <p className="text-gray-600 text-xs">Sem jogos anteriores</p>
            : <div className="space-y-1.5">
                {stats.ultimos.map((r, i) => r && (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      r.result === 'V' ? 'bg-green-500/20 text-green-400' :
                      r.result === 'E' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>{r.result}</span>
                    <span className="text-gray-400 text-xs flex-1 truncate">{r.oponente}</span>
                    <span className="text-white text-xs font-bold flex-shrink-0">{r.tf}×{r.ta}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
