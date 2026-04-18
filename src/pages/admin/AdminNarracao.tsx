import { useState, useCallback } from 'react'
import { MOCK_DATA, ESCALACOES } from '../../lib/mockData'
import type { EscalacaoJogador } from '../../lib/mockData'

// ── Tipos ────────────────────────────────────────────────────────────────────

type Match = typeof MOCK_DATA.matches[number]

type Acao = {
  key:   string
  label: string
  icone: string
  pts:   number
  cor:   string
}

type Evento = {
  id:            number
  minuto:        number
  timeId:        number
  timeNome:      string
  jogadorNome:   string
  jogadorNumero: number
  acao:          Acao
}

type JogLive = EscalacaoJogador & { timeId: number; timeNome: string }

// ── Pontuação Cartola FC ─────────────────────────────────────────────────────

const ACOES: Acao[] = [
  { key:'gol',             label:'Gol',           icone:'⚽', pts: 8.0,  cor:'bg-green-600'  },
  { key:'assistencia',     label:'Assistência',    icone:'🎯', pts: 5.0,  cor:'bg-blue-600'   },
  { key:'gol_contra',      label:'Gol Contra',     icone:'↩️', pts:-3.0,  cor:'bg-red-700'    },
  { key:'cartao_amarelo',  label:'Amarelo',         icone:'🟨', pts:-1.0,  cor:'bg-yellow-600' },
  { key:'cartao_vermelho', label:'Vermelho',        icone:'🟥', pts:-3.0,  cor:'bg-red-600'    },
  { key:'carrinho',        label:'Carrinho',        icone:'🦵', pts: 1.5,  cor:'bg-teal-600'   },
  { key:'falta',           label:'Falta',           icone:'🚩', pts:-0.3,  cor:'bg-orange-600' },
  { key:'passe_certo',     label:'Passe+',          icone:'✅', pts: 0.1,  cor:'bg-green-800'  },
  { key:'passe_errado',    label:'Passe−',          icone:'❌', pts:-0.1,  cor:'bg-red-800'    },
  { key:'impedimento',     label:'Impedimento',     icone:'🚧', pts:-0.1,  cor:'bg-gray-600'   },
  { key:'finalizacao',     label:'Finalização',     icone:'💥', pts: 0.5,  cor:'bg-indigo-600' },
  { key:'defesa_dificil',  label:'Defesa Difícil',  icone:'🧤', pts: 1.0,  cor:'bg-cyan-700'   },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTeamStats(teamId: number, campId: number) {
  const nome     = MOCK_DATA.times.find(t => t.id === teamId)?.nome ?? ''
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
  const artilheiros: Record<string, number> = {}
  partidas.forEach(m => m.gols.forEach(g => {
    if (g.team.nome === nome) artilheiros[g.jogador] = (artilheiros[g.jogador] || 0) + 1
  }))
  const topArtilheiros = Object.entries(artilheiros).sort(([,a],[,b]) => b - a).slice(0, 5)
  const cartoesMap: Record<string, {amarelo:number;vermelho:number}> = {}
  partidas.forEach(m => m.cartoes.forEach(c => {
    if (c.team.nome === nome) {
      if (!cartoesMap[c.jogador]) cartoesMap[c.jogador] = { amarelo:0, vermelho:0 }
      if (c.tipo === 'amarelo') cartoesMap[c.jogador].amarelo++
      else if (c.tipo === 'vermelho') cartoesMap[c.jogador].vermelho++
      else { cartoesMap[c.jogador].amarelo++; cartoesMap[c.jogador].vermelho++ }
    }
  }))
  const ultimos = partidas.slice(-5).reverse().map(m => {
    if (!m.resultado) return null
    const isHome = m.mandante_id === teamId
    const tf = isHome ? m.resultado.gols_mandante : m.resultado.gols_visitante
    const ta = isHome ? m.resultado.gols_visitante : m.resultado.gols_mandante
    return { res: tf > ta ? 'V' : tf === ta ? 'E' : 'D', tf, ta, oponente: isHome ? m.visitante?.nome : m.mandante?.nome, matchId: m.id }
  }).filter(Boolean) as { res:string; tf:number; ta:number; oponente?:string; matchId:number }[]
  return { wins, draws, losses, gf, gc, topArtilheiros, cartoesMap, ultimos }
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function AdminNarracao() {
  const [matchSel, setMatchSel] = useState<Match | null>(null)
  const [aba, setAba] = useState<'elencos'|'narrar'|'prejogo'|'h2h'>('narrar')

  const proximos = MOCK_DATA.matches.filter(m => m.status === 'agendado' || m.status === 'em_andamento')

  if (!matchSel) return <MatchSelector matches={proximos} onSelect={m => { setMatchSel(m); setAba('narrar') }} />

  return (
    <PainelNarrador
      match={matchSel}
      aba={aba}
      setAba={setAba}
      onBack={() => setMatchSel(null)}
    />
  )
}

// ── Seleção de jogo ──────────────────────────────────────────────────────────

function MatchSelector({ matches, onSelect }: { matches: Match[]; onSelect: (m: Match) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">🎙️ Iniciar Narração</h1>
        <p className="text-gray-500 text-sm mt-1">Selecione o jogo para abrir o painel do narrador</p>
      </div>

      {matches.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-10">Nenhum jogo agendado.</p>
      )}

      <div className="space-y-3">
        {matches.map(m => (
          <button key={m.id} onClick={() => onSelect(m)}
            className="w-full bg-[#111811] border border-white/10 hover:border-[#E8232A]/60 rounded-2xl p-5 text-left transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{m.championship?.nome} · Rodada {m.rodada}</span>
              {m.status === 'em_andamento'
                ? <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">🔴 AO VIVO</span>
                : <span className="text-xs text-[#4B9FFF]">
                    {m.data_hora ? new Date(m.data_hora).toLocaleString('pt-BR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : 'A definir'}
                  </span>
              }
            </div>
            <div className="flex items-center gap-4 justify-center">
              <TeamBlock nome={m.mandante?.nome} label="Mandante" />
              <div className="font-display text-3xl text-gray-500 flex-shrink-0">VS</div>
              <TeamBlock nome={m.visitante?.nome} label="Visitante" />
            </div>
            {m.local && <p className="text-xs text-gray-500 text-center mt-3">📍 {m.local}</p>}
            <div className="mt-4 flex justify-center">
              <span className="bg-[#E8232A] group-hover:bg-[#B01B21] text-white text-sm font-bold px-6 py-2 rounded-full transition">
                🎙️ Narrar este jogo →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function TeamBlock({ nome, label }: { nome?: string; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl mx-auto mb-2">⚽</div>
      <p className="font-bold text-white text-sm">{nome}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// ── Painel do narrador ───────────────────────────────────────────────────────

function PainelNarrador({
  match, aba, setAba, onBack,
}: {
  match:   Match
  aba:     'elencos'|'narrar'|'prejogo'|'h2h'
  setAba:  (a: 'elencos'|'narrar'|'prejogo'|'h2h') => void
  onBack:  () => void
}) {
  const mId    = match.mandante_id
  const vId    = match.visitante_id
  const mStats = getTeamStats(mId, match.championship_id)
  const vStats = getTeamStats(vId, match.championship_id)
  const mEsc   = (ESCALACOES[mId] ?? []).map(j => ({ ...j, timeId: mId, timeNome: match.mandante?.nome ?? '' }))
  const vEsc   = (ESCALACOES[vId] ?? []).map(j => ({ ...j, timeId: vId, timeNome: match.visitante?.nome ?? '' }))
  const h2h    = MOCK_DATA.matches.filter(m =>
    m.status === 'finalizado' &&
    ((m.mandante_id === mId && m.visitante_id === vId) || (m.mandante_id === vId && m.visitante_id === mId))
  )

  // ── Estado global da narração (elevado para detectar dados ao tentar sair)
  const [eventos,   setEventos]   = useState<Evento[]>([])
  const [placar,    setPlacar]    = useState({ m: 0, v: 0 })
  const [showConfirmBack,  setShowConfirmBack]  = useState(false)
  const [showFinalModal,   setShowFinalModal]   = useState(false)

  function tentarVoltar() {
    if (eventos.length > 0) setShowConfirmBack(true)
    else onBack()
  }

  const tabs = [
    { key:'narrar',  label:'🔴 Narrar'   },
    { key:'elencos', label:'📋 Elencos'  },
    { key:'prejogo', label:'📊 Pré-Jogo' },
    { key:'h2h',     label:'⚡ H2H'     },
  ] as const

  return (
    <div>
      {/* Botão voltar */}
      <button onClick={tentarVoltar} className="text-gray-500 text-sm hover:text-white mb-3 flex items-center gap-1">
        ← Trocar jogo
      </button>

      {/* Alerta de confirmação ao trocar jogo */}
      {showConfirmBack && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A24] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-3xl mb-3 text-center">⚠️</div>
            <h3 className="text-white font-black text-center text-lg mb-2">Sair da narração?</h3>
            <p className="text-gray-400 text-sm text-center mb-5">
              Você tem <span className="text-[#E8232A] font-bold">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</span> registrado{eventos.length !== 1 ? 's' : ''}. Se sair agora, todos os dados serão perdidos.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={onBack}
                className="w-full bg-[#E8232A] hover:bg-[#B01B21] text-white font-bold py-3 rounded-xl transition">
                Sair mesmo assim
              </button>
              <button onClick={() => setShowConfirmBack(false)}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition">
                Continuar narrando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de finalização */}
      {showFinalModal && (
        <FinalizarModal
          match={match}
          placar={placar}
          eventos={eventos}
          onConfirmar={onBack}
          onCancelar={() => setShowFinalModal(false)}
        />
      )}

      {/* Header do jogo */}
      <div className="bg-gradient-to-r from-[#1A0506] to-[#0E0F15] rounded-2xl p-4 border border-white/5 mb-4">
        <p className="text-xs text-gray-500 text-center mb-2">{match.championship?.nome} · Rodada {match.rodada}</p>
        <div className="flex items-center gap-3 justify-center">
          <p className="font-bold text-white flex-1 text-right text-sm">{match.mandante?.nome}</p>
          {eventos.length > 0
            ? <span className="font-display text-3xl text-white flex-shrink-0 px-2">{placar.m} : {placar.v}</span>
            : <span className="font-display text-3xl text-gray-600 flex-shrink-0 px-2">VS</span>
          }
          <p className="font-bold text-white flex-1 text-sm">{match.visitante?.nome}</p>
        </div>
        {match.local && <p className="text-xs text-gray-600 text-center mt-1">📍 {match.local}</p>}
        {/* Botão Finalizar */}
        <div className="mt-3 flex justify-center">
          <button onClick={() => setShowFinalModal(true)}
            className="bg-[#E8232A]/15 hover:bg-[#E8232A]/25 border border-[#E8232A]/30 text-[#E8232A] text-xs font-bold px-5 py-2 rounded-full transition flex items-center gap-2">
            🏁 Finalizar Narração
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setAba(t.key)}
            className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition ${
              aba === t.key ? 'border-[#E8232A] text-white' : 'border-transparent text-gray-600 hover:text-gray-300'
            }`}>{t.label}</button>
        ))}
      </div>

      {aba === 'narrar'  && (
        <NarrarTab
          match={match} mEsc={mEsc} vEsc={vEsc}
          eventos={eventos} setEventos={setEventos}
          placar={placar}   setPlacar={setPlacar}
          onFinalizar={() => setShowFinalModal(true)}
        />
      )}
      {aba === 'elencos' && <ElencosTab mEsc={mEsc} vEsc={vEsc} mNome={match.mandante?.nome??''} vNome={match.visitante?.nome??''} />}
      {aba === 'prejogo' && <PrejogTab mNome={match.mandante?.nome??''} vNome={match.visitante?.nome??''} mStats={mStats} vStats={vStats} />}
      {aba === 'h2h'     && <H2HTab h2h={h2h} mNome={match.mandante?.nome??''} vNome={match.visitante?.nome??''} />}
    </div>
  )
}

// ── Modal Finalizar Narração ─────────────────────────────────────────────────

function FinalizarModal({ match, placar, eventos, onConfirmar, onCancelar }: {
  match:       Match
  placar:      { m: number; v: number }
  eventos:     Evento[]
  onConfirmar: () => void
  onCancelar:  () => void
}) {
  const gols     = eventos.filter(e => e.acao.key === 'gol').length
  const cartoes  = eventos.filter(e => e.acao.key === 'cartao_amarelo' || e.acao.key === 'cartao_vermelho').length
  const passes   = eventos.filter(e => e.acao.key === 'passe_certo' || e.acao.key === 'passe_errado').length

  // top Cartola scorer
  const pts: Record<string, number> = {}
  eventos.forEach(e => {
    const k = `${e.timeId}-${e.jogadorNome}`
    pts[k] = (pts[k] ?? 0) + e.acao.pts
  })
  const topEntry = Object.entries(pts).sort(([,a],[,b]) => b - a)[0]
  const topNome  = topEntry ? topEntry[0].split('-').slice(1).join('-') : null
  const topPts   = topEntry ? topEntry[1] : 0

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E0F15] border border-white/20 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A0506] to-[#0E1520] p-5 text-center border-b border-white/10">
          <div className="text-4xl mb-2">🏁</div>
          <h2 className="text-white font-black text-xl">Finalizar Narração</h2>
          <p className="text-gray-400 text-xs mt-1">{match.championship?.nome} · Rodada {match.rodada}</p>
        </div>

        {/* Placar final */}
        <div className="p-5">
          <div className="bg-[#111811] rounded-2xl p-4 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Placar Final</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-white text-sm font-bold flex-1 text-right truncate">{match.mandante?.nome}</span>
              <span className="font-display text-4xl text-white px-2">{placar.m} : {placar.v}</span>
              <span className="text-white text-sm font-bold flex-1 text-left truncate">{match.visitante?.nome}</span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label:'Eventos', value: eventos.length, icon:'📋' },
              { label:'Gols',    value: gols,           icon:'⚽' },
              { label:'Cartões', value: cartoes,         icon:'🟨' },
            ].map(s => (
              <div key={s.label} className="bg-[#111811] rounded-xl p-3 text-center">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className="font-display text-2xl text-white">{s.value}</div>
                <div className="text-gray-600 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {passes > 0 && (
            <p className="text-xs text-gray-600 text-center mb-3">{passes} passes registrados</p>
          )}

          {/* MVP Cartola */}
          {topNome && (
            <div className="bg-[#111811] border border-[#F5B800]/20 rounded-xl p-3 flex items-center gap-3 mb-4">
              <span className="text-2xl">🏅</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#F5B800] font-bold uppercase tracking-wider">MVP Cartola</p>
                <p className="text-white font-bold truncate">{topNome}</p>
              </div>
              <span className="font-display text-xl font-bold text-[#00D68F]">
                {topPts > 0 ? '+' : ''}{topPts.toFixed(1)}
              </span>
            </div>
          )}

          {eventos.length === 0 && (
            <p className="text-gray-500 text-xs text-center mb-4">Nenhum evento foi registrado nesta narração.</p>
          )}

          <p className="text-gray-500 text-xs text-center mb-5">
            Ao confirmar, a narração será encerrada. Esta ação não pode ser desfeita.
          </p>

          <div className="flex flex-col gap-2">
            <button onClick={onConfirmar}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2">
              ✓ Confirmar e Encerrar
            </button>
            <button onClick={onCancelar}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl transition">
              Continuar narrando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ABA NARRAR (live) ────────────────────────────────────────────────────────

function NarrarTab({ match, mEsc, vEsc, eventos, setEventos, placar, setPlacar, onFinalizar }: {
  match:       Match
  mEsc:        JogLive[]
  vEsc:        JogLive[]
  eventos:     Evento[]
  setEventos:  React.Dispatch<React.SetStateAction<Evento[]>>
  placar:      { m: number; v: number }
  setPlacar:   React.Dispatch<React.SetStateAction<{ m: number; v: number }>>
  onFinalizar: () => void
}) {
  const [minuto,      setMinuto]      = useState(0)
  const [selecionado, setSelecionado] = useState<JogLive | null>(null)
  const [nextId,      setNextId]      = useState(1)

  const todosJogadores = [...mEsc, ...vEsc]

  const pontosJogador = useCallback((j: JogLive) => {
    return eventos
      .filter(e => e.jogadorNome === j.nome && e.timeId === j.timeId)
      .reduce((s, e) => s + e.acao.pts, 0)
  }, [eventos])

  function registrar(acao: Acao) {
    if (!selecionado) return
    const ev: Evento = {
      id: nextId, minuto, timeId: selecionado.timeId,
      timeNome: selecionado.timeNome, jogadorNome: selecionado.nome,
      jogadorNumero: selecionado.numero, acao,
    }
    setEventos(prev => [ev, ...prev])
    setNextId(n => n + 1)
    if (acao.key === 'gol') {
      if (selecionado.timeId === match.mandante_id) setPlacar(p => ({ ...p, m: p.m + 1 }))
      else setPlacar(p => ({ ...p, v: p.v + 1 }))
    }
    if (acao.key === 'gol_contra') {
      if (selecionado.timeId === match.mandante_id) setPlacar(p => ({ ...p, v: p.v + 1 }))
      else setPlacar(p => ({ ...p, m: p.m + 1 }))
    }
    setSelecionado(null)
  }

  function removerEvento(id: number) {
    const ev = eventos.find(e => e.id === id)
    if (ev) {
      if (ev.acao.key === 'gol') {
        if (ev.timeId === match.mandante_id) setPlacar(p => ({ ...p, m: Math.max(0, p.m - 1) }))
        else setPlacar(p => ({ ...p, v: Math.max(0, p.v - 1) }))
      }
      if (ev.acao.key === 'gol_contra') {
        if (ev.timeId === match.mandante_id) setPlacar(p => ({ ...p, v: Math.max(0, p.v - 1) }))
        else setPlacar(p => ({ ...p, m: Math.max(0, p.m - 1) }))
      }
    }
    setEventos(prev => prev.filter(e => e.id !== id))
  }

  const ranking = [...todosJogadores]
    .map(j => ({ ...j, pts: pontosJogador(j) }))
    .filter(j => j.titular)
    .sort((a, b) => b.pts - a.pts)

  return (
    <div className="space-y-4">

      {/* Placar + Timer */}
      <div className="bg-[#0A0F0A] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-xs text-gray-500 flex-1 text-right truncate">{match.mandante?.nome}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display text-4xl text-white">{placar.m}</span>
            <span className="text-gray-600">:</span>
            <span className="font-display text-4xl text-white">{placar.v}</span>
          </div>
          <p className="text-xs text-gray-500 flex-1 truncate">{match.visitante?.nome}</p>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">⏱️</span>
          <span className="font-display text-xl text-white w-10 text-center">{minuto}'</span>
          <button onClick={() => setMinuto(m => m + 1)}
            className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">+1'</button>
          <button onClick={() => setMinuto(m => m + 5)}
            className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">+5'</button>
          <button onClick={() => setMinuto(m => Math.max(0, m - 1))}
            className="bg-white/10 hover:bg-white/15 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg transition">−1'</button>
          <input type="number" value={minuto} onChange={e => setMinuto(Math.max(0, Number(e.target.value)))}
            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs text-center outline-none" />
        </div>
      </div>

      {/* Seleção de jogadores */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 truncate">{match.mandante?.nome}</p>
          <div className="space-y-1">
            {mEsc.filter(j => j.titular).sort((a,b) => a.numero - b.numero).map(j => (
              <JogadorBtn key={j.numero} j={j} pts={pontosJogador(j)}
                selected={selecionado?.nome === j.nome && selecionado?.timeId === j.timeId}
                onClick={() => setSelecionado(s => s?.nome === j.nome && s.timeId === j.timeId ? null : j)}
                cor="border-[#E8232A]/40" />
            ))}
            <p className="text-xs text-gray-600 mt-1 px-1">Reservas</p>
            {mEsc.filter(j => !j.titular).map(j => (
              <JogadorBtn key={j.numero} j={j} pts={pontosJogador(j)} dim
                selected={selecionado?.nome === j.nome && selecionado?.timeId === j.timeId}
                onClick={() => setSelecionado(s => s?.nome === j.nome && s.timeId === j.timeId ? null : j)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 truncate">{match.visitante?.nome}</p>
          <div className="space-y-1">
            {vEsc.filter(j => j.titular).sort((a,b) => a.numero - b.numero).map(j => (
              <JogadorBtn key={j.numero} j={j} pts={pontosJogador(j)}
                selected={selecionado?.nome === j.nome && selecionado?.timeId === j.timeId}
                onClick={() => setSelecionado(s => s?.nome === j.nome && s.timeId === j.timeId ? null : j)}
                cor="border-[#4B9FFF]/40" />
            ))}
            <p className="text-xs text-gray-600 mt-1 px-1">Reservas</p>
            {vEsc.filter(j => !j.titular).map(j => (
              <JogadorBtn key={j.numero} j={j} pts={pontosJogador(j)} dim
                selected={selecionado?.nome === j.nome && selecionado?.timeId === j.timeId}
                onClick={() => setSelecionado(s => s?.nome === j.nome && s.timeId === j.timeId ? null : j)} />
            ))}
          </div>
        </div>
      </div>

      {/* Painel de ações */}
      {selecionado && (
        <div className="bg-[#0E0F15] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white font-bold">{selecionado.nome}</span>
              <span className="text-gray-500 text-sm ml-2">#{selecionado.numero} · {selecionado.posicao}</span>
              <span className="text-xs text-gray-600 ml-2">{selecionado.timeNome}</span>
            </div>
            <button onClick={() => setSelecionado(null)} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {ACOES.map(a => (
              <button key={a.key} onClick={() => registrar(a)}
                className={`${a.cor} hover:opacity-90 rounded-xl py-3 px-2 text-center transition active:scale-95`}>
                <div className="text-xl mb-0.5">{a.icone}</div>
                <div className="text-white text-xs font-bold leading-tight">{a.label}</div>
                <div className={`text-xs mt-0.5 font-mono ${a.pts >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {a.pts > 0 ? '+' : ''}{a.pts}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!selecionado && (
        <p className="text-gray-600 text-xs text-center py-2">
          ↑ Selecione um jogador para registrar um evento
        </p>
      )}

      {/* Botão Finalizar flutuante quando há eventos */}
      {eventos.length > 0 && (
        <button onClick={onFinalizar}
          className="w-full bg-green-700 hover:bg-green-600 text-white font-black py-3.5 rounded-2xl transition flex items-center justify-center gap-2">
          🏁 Finalizar Narração ({eventos.length} evento{eventos.length !== 1 ? 's' : ''})
        </button>
      )}

      {/* Ranking Cartola */}
      {eventos.length > 0 && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl overflow-hidden">
          <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
            🏅 Ranking Cartola ({eventos.length} evento{eventos.length > 1 ? 's' : ''})
          </p>
          {ranking.filter(j => j.pts !== 0).slice(0, 8).map((j, i) => {
            const cor = j.pts >= 7 ? '#00D68F' : j.pts >= 4 ? '#F5B800' : j.pts >= 0 ? '#ffffff' : '#E8232A'
            return (
              <div key={`${j.timeId}-${j.numero}`}
                className="flex items-center gap-3 px-4 py-2 border-b border-white/5 last:border-0">
                <span className={`font-display text-lg w-5 text-center ${i < 3 ? 'text-[#F5B800]' : 'text-gray-600'}`}>{i+1}</span>
                <span className="font-display text-base text-[#F5B800] w-6 text-center">{j.numero}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{j.nome}</p>
                  <p className="text-gray-600 text-xs">{j.timeNome}</p>
                </div>
                <span className="font-display text-xl font-bold" style={{ color: cor }}>
                  {j.pts > 0 ? '+' : ''}{j.pts.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Log de eventos */}
      {eventos.length > 0 && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl overflow-hidden">
          <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
            📋 Eventos registrados
          </p>
          {eventos.map(ev => (
            <div key={ev.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
              <span className="text-[#F5B800] font-display text-sm w-8 flex-shrink-0">{ev.minuto}'</span>
              <span className="text-xl flex-shrink-0">{ev.acao.icone}</span>
              <div className="flex-1 min-w-0">
                <span className="text-white text-sm font-bold">{ev.jogadorNome} </span>
                <span className="text-gray-500 text-xs">#{ev.jogadorNumero} · {ev.timeNome}</span>
              </div>
              <span className={`font-mono text-sm font-bold flex-shrink-0 ${ev.acao.pts >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {ev.acao.pts > 0 ? '+' : ''}{ev.acao.pts}
              </span>
              <button onClick={() => removerEvento(ev.id)}
                className="text-gray-600 hover:text-red-400 transition text-sm flex-shrink-0" title="Desfazer">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function JogadorBtn({ j, pts, selected, onClick, cor, dim }: {
  j: JogLive; pts: number; selected: boolean; onClick: () => void; cor?: string; dim?: boolean
}) {
  const ptsCor = pts > 5 ? 'text-green-400' : pts < 0 ? 'text-red-400' : 'text-gray-500'
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition border ${
        selected
          ? `${cor ?? 'border-white/30'} bg-white/10`
          : 'border-transparent hover:bg-white/5'
      } ${dim ? 'opacity-50' : ''}`}>
      <span className="font-display text-sm text-[#F5B800] w-5 flex-shrink-0">{j.numero}</span>
      <span className="text-white text-xs flex-1 truncate font-medium">{j.nome}</span>
      {pts !== 0 && <span className={`text-xs font-bold flex-shrink-0 ${ptsCor}`}>{pts > 0 ? '+' : ''}{pts.toFixed(1)}</span>}
    </button>
  )
}

// ── ABA ELENCOS ──────────────────────────────────────────────────────────────

function ElencosTab({ mEsc, vEsc, mNome, vNome }: {
  mEsc: JogLive[]; vEsc: JogLive[]; mNome: string; vNome: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ElencoPanel nome={mNome} jogadores={mEsc} isHome />
      <ElencoPanel nome={vNome} jogadores={vEsc} />
    </div>
  )
}

function ElencoPanel({ nome, jogadores, isHome }: { nome:string; jogadores:JogLive[]; isHome?:boolean }) {
  const cor   = isHome ? 'text-[#E8232A]' : 'text-[#4B9FFF]'
  const borda = isHome ? 'border-[#E8232A]/30' : 'border-[#4B9FFF]/30'
  const titulares = jogadores.filter(j => j.titular).sort((a,b) => a.numero - b.numero)
  const reservas  = jogadores.filter(j => !j.titular)
  return (
    <div className={`bg-[#111811] border ${borda} rounded-2xl overflow-hidden`}>
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className={`font-bold text-sm ${cor}`}>{nome}</h3>
        <span className="text-xs text-gray-500">{isHome ? 'Mandante' : 'Visitante'}</span>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-1">Titulares</p>
        <div className="space-y-1 mb-3">
          {titulares.map(j => (
            <div key={j.numero} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition">
              <span className="w-7 text-center font-display text-lg text-[#F5B800] flex-shrink-0">{j.numero}</span>
              <span className="font-bold text-white text-sm flex-1">{j.nome}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">{j.posicao}</span>
            </div>
          ))}
        </div>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 px-1">Reservas</p>
        <div className="space-y-1 opacity-60">
          {reservas.map(j => (
            <div key={j.numero} className="flex items-center gap-3 px-2 py-1.5">
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

// ── ABA PRÉ-JOGO ─────────────────────────────────────────────────────────────

type Stats = ReturnType<typeof getTeamStats>

function PrejogTab({ mNome, vNome, mStats, vStats }: {
  mNome: string; vNome: string; mStats: Stats; vStats: Stats
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsPanel nome={mNome} stats={mStats} />
      <StatsPanel nome={vNome} stats={vStats} />
    </div>
  )
}

function StatsPanel({ nome, stats }: { nome: string; stats: Stats }) {
  const total = stats.wins + stats.draws + stats.losses
  const aprv  = total > 0 ? Math.round((stats.wins * 3) / (total * 3) * 100) : 0
  return (
    <div className="bg-[#111811] border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="font-bold text-white text-sm">{nome}</h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Aproveitamento</p>
          <div className="grid grid-cols-5 gap-1 text-center mb-2">
            {[
              { v:stats.wins,   l:'V', c:'text-green-400 bg-green-500/10'  },
              { v:stats.draws,  l:'E', c:'text-yellow-400 bg-yellow-500/10' },
              { v:stats.losses, l:'D', c:'text-red-400 bg-red-500/10'      },
              { v:stats.gf,     l:'GP',c:'text-white bg-white/5'           },
              { v:stats.gc,     l:'GC',c:'text-gray-400 bg-white/5'        },
            ].map(x => (
              <div key={x.l} className={`rounded-xl py-2 ${x.c}`}>
                <div className="font-display text-xl">{x.v}</div>
                <div className="text-xs">{x.l}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width:`${aprv}%` }} />
            </div>
            <span className="text-xs text-green-400 font-bold">{aprv}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">⚽ Artilheiros</p>
          {stats.topArtilheiros.length === 0
            ? <p className="text-gray-600 text-xs">Sem gols registrados</p>
            : stats.topArtilheiros.map(([n, g]) => (
              <div key={n} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white text-sm flex-1">{n}</span>
                <span className="text-[#00D68F] font-bold"><span className="font-display text-lg">{g}</span> gol{g!==1?'s':''}</span>
              </div>
            ))
          }
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">🟨 Cartões</p>
          {Object.keys(stats.cartoesMap).length === 0
            ? <p className="text-gray-600 text-xs">Sem cartões</p>
            : Object.entries(stats.cartoesMap).map(([n, c]) => (
              <div key={n} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white text-sm flex-1">{n}</span>
                <div className="flex gap-1">
                  {c.amarelo > 0 && <span className="bg-yellow-400/15 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">🟨{c.amarelo}</span>}
                  {c.vermelho > 0 && <span className="bg-red-400/15 text-red-400 text-xs font-bold px-1.5 py-0.5 rounded">🟥{c.vermelho}</span>}
                </div>
              </div>
            ))
          }
        </div>

        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">📅 Últimos resultados</p>
          {stats.ultimos.length === 0
            ? <p className="text-gray-600 text-xs">Sem jogos anteriores</p>
            : <div className="space-y-1.5">
                {stats.ultimos.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      r.res==='V'?'bg-green-500/20 text-green-400':r.res==='E'?'bg-yellow-500/20 text-yellow-400':'bg-red-500/20 text-red-400'
                    }`}>{r.res}</span>
                    <span className="text-gray-400 text-xs flex-1 truncate">{r.oponente}</span>
                    <span className="text-white text-xs font-bold">{r.tf}×{r.ta}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}

// ── ABA H2H ──────────────────────────────────────────────────────────────────

function H2HTab({ h2h, mNome, vNome }: { h2h: Match[]; mNome: string; vNome: string }) {
  let w1 = 0, w2 = 0, d = 0
  h2h.forEach(m => {
    if (!m.resultado) return
    const gm = m.resultado.gols_mandante, gv = m.resultado.gols_visitante
    if (gm > gv) w1++; else if (gv > gm) w2++; else d++
  })
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
        Confrontos Diretos ({h2h.length})
      </h3>
      {h2h.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-10 bg-[#111811] rounded-2xl">
          Sem confrontos diretos anteriores.
        </p>
      )}
      {h2h.map(m => (
        <div key={m.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 mb-2">
          <p className="text-xs text-gray-500 mb-2">{m.championship?.nome} · Rodada {m.rodada}</p>
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex-1 truncate text-sm">{m.mandante?.nome}</span>
            <span className="font-display text-2xl text-white flex-shrink-0">
              {m.resultado?.gols_mandante} × {m.resultado?.gols_visitante}
            </span>
            <span className="font-bold text-white flex-1 text-right truncate text-sm">{m.visitante?.nome}</span>
          </div>
        </div>
      ))}
      {h2h.length > 0 && (
        <div className="mt-4 bg-[#111811] border border-white/10 rounded-xl p-4 grid grid-cols-3 text-center">
          <div><p className="font-display text-3xl text-green-400">{w1}</p><p className="text-xs text-gray-500 mt-0.5 truncate">{mNome}</p></div>
          <div><p className="font-display text-3xl text-gray-400">{d}</p><p className="text-xs text-gray-500 mt-0.5">Empates</p></div>
          <div><p className="font-display text-3xl text-blue-400">{w2}</p><p className="text-xs text-gray-500 mt-0.5 truncate">{vNome}</p></div>
        </div>
      )}
    </div>
  )
}
