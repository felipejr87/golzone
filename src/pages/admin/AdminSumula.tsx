import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { MOCK_DATA } from '../../lib/mockData'

type Aba = 'placar' | 'gols' | 'cartoes' | 'notas' | 'relatorio'

export default function AdminSumula() {
  const { id } = useParams()
  const match = MOCK_DATA.matches.find(m => m.id === Number(id))
  const [aba, setAba] = useState<Aba>('placar')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState<Aba | null>(null)

  const [placar, setPlacar] = useState({
    gm: match?.resultado?.gols_mandante ?? 0,
    gv: match?.resultado?.gols_visitante ?? 0,
  })
  const [gols, setGols] = useState<any[]>(match?.gols || [])
  const [cartoes, setCartoes] = useState<any[]>(match?.cartoes || [])
  const [notas, setNotas] = useState<any[]>(match?.notas || [])
  const [relatorio, setRelatorio] = useState(
    match?.sumula || { arbitro: '', publico: '', observacoes: '' }
  )

  if (!match) return <div className="p-8 text-gray-500 text-center">Jogo não encontrado.</div>

  async function salvar(tipo: Aba) {
    setSalvando(true)
    await new Promise(r => setTimeout(r, 600))
    setSalvando(false)
    setSalvo(tipo)
    setTimeout(() => setSalvo(null), 2000)
  }

  const times = [match.mandante, match.visitante].filter(Boolean)

  const abas: { key: Aba; icon: string; label: string }[] = [
    { key: 'placar',    icon: '🏆', label: 'Placar'  },
    { key: 'gols',      icon: '⚽', label: 'Gols'    },
    { key: 'cartoes',   icon: '🟨', label: 'Cartões' },
    { key: 'notas',     icon: '⭐', label: 'Notas'   },
    { key: 'relatorio', icon: '📝', label: 'Info'    },
  ]

  return (
    <div className="max-w-2xl mx-auto pb-32">

      {/* Cabeçalho */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="text-xs text-gray-600 mb-1">{match.championship?.nome} · Rodada {match.rodada}</div>
        <h1 className="font-bold text-white text-lg">
          {match.mandante?.nome} <span className="text-gray-600">vs</span> {match.visitante?.nome}
        </h1>
      </div>

      {/* Abas */}
      <div className="flex overflow-x-auto border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
        {abas.map(a => (
          <button key={a.key} onClick={() => setAba(a.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              aba === a.key
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}>
            <span>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <div className="px-4 pt-5">

        {/* PLACAR */}
        {aba === 'placar' && (
          <div>
            <p className="text-xs text-gray-600 mb-5 text-center">Ajuste o placar com os botões + e −</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="text-sm font-bold text-white text-center max-w-24 leading-tight">{match.mandante?.nome}</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPlacar(p => ({ ...p, gm: Math.max(0, p.gm - 1) }))}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-xl font-bold text-white transition active:scale-95">−</button>
                  <span className="font-display text-6xl text-white w-12 text-center">{placar.gm}</span>
                  <button onClick={() => setPlacar(p => ({ ...p, gm: p.gm + 1 }))}
                    className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xl font-bold text-red-400 transition active:scale-95">+</button>
                </div>
              </div>

              <span className="font-display text-4xl text-gray-700 mb-1">:</span>

              <div className="flex flex-col items-center gap-3">
                <div className="text-sm font-bold text-white text-center max-w-24 leading-tight">{match.visitante?.nome}</div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPlacar(p => ({ ...p, gv: Math.max(0, p.gv - 1) }))}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-xl font-bold text-white transition active:scale-95">−</button>
                  <span className="font-display text-6xl text-white w-12 text-center">{placar.gv}</span>
                  <button onClick={() => setPlacar(p => ({ ...p, gv: p.gv + 1 }))}
                    className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xl font-bold text-red-400 transition active:scale-95">+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GOLS */}
        {aba === 'gols' && (
          <div>
            {gols.map((g, i) => (
              <div key={i} className="flex gap-2 mb-3 items-start">
                <input value={g.jogador} onChange={e => setGols(gols.map((x,j) => j===i?{...x,jogador:e.target.value}:x))}
                  placeholder="Nome do jogador"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-500 transition" />
                <select value={g.team?.id || g.team_id} onChange={e => setGols(gols.map((x,j) => j===i?{...x,team_id:Number(e.target.value)}:x))}
                  className="bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-sm outline-none">
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome?.slice(0,10)}</option>)}
                </select>
                <input type="number" value={g.minuto||''} onChange={e => setGols(gols.map((x,j) => j===i?{...x,minuto:Number(e.target.value)}:x))}
                  placeholder="Min" className="w-14 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-sm text-center outline-none" />
                <select value={g.tipo||'normal'} onChange={e => setGols(gols.map((x,j) => j===i?{...x,tipo:e.target.value}:x))}
                  className="bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-sm outline-none">
                  <option value="normal">⚽</option>
                  <option value="penalti">P</option>
                  <option value="contra">CG</option>
                </select>
                <button onClick={() => setGols(gols.filter((_,j) => j!==i))}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition text-lg">×</button>
              </div>
            ))}
            <button onClick={() => setGols([...gols, { jogador:'', team_id: times[0]?.id||1, minuto:'', tipo:'normal' }])}
              className="w-full py-3 border border-dashed border-white/15 rounded-xl text-green-400 text-sm font-medium hover:border-green-500/30 hover:bg-green-500/5 transition">
              + Adicionar gol
            </button>
          </div>
        )}

        {/* CARTÕES */}
        {aba === 'cartoes' && (
          <div>
            {cartoes.map((c, i) => (
              <div key={i} className="flex gap-2 mb-3 items-center">
                <input value={c.jogador} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,jogador:e.target.value}:x))}
                  placeholder="Nome do jogador"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-red-500 transition" />
                <select value={c.team?.id || c.team_id} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,team_id:Number(e.target.value)}:x))}
                  className="bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-sm outline-none">
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome?.slice(0,10)}</option>)}
                </select>
                <input type="number" value={c.minuto||''} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,minuto:Number(e.target.value)}:x))}
                  placeholder="Min" className="w-14 bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-white text-sm text-center outline-none" />
                <select value={c.tipo} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,tipo:e.target.value}:x))}
                  className="bg-white/5 border border-white/10 rounded-xl px-2 py-3 text-sm outline-none">
                  <option value="amarelo">🟨</option>
                  <option value="vermelho">🟥</option>
                  <option value="amarelo_vermelho">🟨🟥</option>
                </select>
                <button onClick={() => setCartoes(cartoes.filter((_,j) => j!==i))}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition text-lg">×</button>
              </div>
            ))}
            <button onClick={() => setCartoes([...cartoes, { jogador:'', team_id: times[0]?.id||1, minuto:'', tipo:'amarelo' }])}
              className="w-full py-3 border border-dashed border-white/15 rounded-xl text-yellow-400 text-sm font-medium hover:border-yellow-500/30 hover:bg-yellow-500/5 transition">
              + Adicionar cartão
            </button>
          </div>
        )}

        {/* NOTAS */}
        {aba === 'notas' && (
          <div>
            <p className="text-xs text-gray-600 mb-4 text-center">
              Notas de 0 a 10 · Marque ⭐ o melhor do jogo
            </p>
            {notas.map((n, i) => {
              const notaNum = Number(n.nota) || 0
              const cor = notaNum >= 8 ? '#00D68F' : notaNum >= 6 ? '#F5B800' : notaNum > 0 ? '#E8232A' : '#3D4055'
              return (
                <div key={i} className={`mb-3 p-3 rounded-xl border transition ${n.melhor_jogo?'border-yellow-500/30 bg-yellow-500/5':'border-white/5 bg-white/3'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <input value={n.player_nome||n.player?.nome||''} onChange={e => setNotas(notas.map((x,j) => j===i?{...x,player_nome:e.target.value}:x))}
                      placeholder="Nome do jogador" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-red-500 transition" />
                    <select value={n.team_id} onChange={e => setNotas(notas.map((x,j) => j===i?{...x,team_id:Number(e.target.value)}:x))}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-sm outline-none">
                      {times.map(t => <option key={t.id} value={t.id}>{t.nome?.slice(0,10)}</option>)}
                    </select>
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ borderColor: cor, color: cor }}>{notaNum > 0 ? notaNum : '—'}</div>
                    <button onClick={() => setNotas(notas.filter((_,j) => j!==i))}
                      className="text-red-500 text-lg p-1">×</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="10" step="0.5" value={n.nota||0}
                      onChange={e => setNotas(notas.map((x,j) => j===i?{...x,nota:Number(e.target.value)}:x))}
                      className="flex-1 accent-red-500" />
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-yellow-400 flex-shrink-0">
                      <input type="checkbox" checked={!!n.melhor_jogo}
                        onChange={e => setNotas(notas.map((x,j) => ({...x, melhor_jogo: j===i ? e.target.checked : false})))}
                        className="accent-yellow-400" />
                      ⭐ Melhor
                    </label>
                  </div>
                </div>
              )
            })}
            <button onClick={() => setNotas([...notas, { player_nome:'', team_id: times[0]?.id||1, nota:0, melhor_jogo:false }])}
              className="w-full py-3 border border-dashed border-white/15 rounded-xl text-yellow-400 text-sm font-medium hover:border-yellow-500/30 hover:bg-yellow-500/5 transition">
              + Adicionar jogador
            </button>
          </div>
        )}

        {/* RELATÓRIO */}
        {aba === 'relatorio' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Árbitro</label>
              <input value={relatorio.arbitro} onChange={e => setRelatorio({...relatorio, arbitro: e.target.value})}
                placeholder="Nome do árbitro"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Público presente</label>
              <input type="number" value={relatorio.publico} onChange={e => setRelatorio({...relatorio, publico: e.target.value})}
                placeholder="Número de pessoas"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Observações da narração</label>
              <textarea value={relatorio.observacoes} onChange={e => setRelatorio({...relatorio, observacoes: e.target.value})}
                placeholder="Como foi o jogo? Destaques, polêmicas, contexto..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition resize-none" />
            </div>
          </div>
        )}
      </div>

      {/* Botão salvar fixo no bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#060608]/95 backdrop-blur-sm border-t border-white/5">
        <button onClick={() => salvar(aba)} disabled={salvando}
          className={`w-full py-4 rounded-xl text-sm font-bold transition ${
            salvo === aba
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-[#E8232A] text-white hover:bg-[#B01B21]'
          } disabled:opacity-60`}>
          {salvando ? 'Salvando...' : salvo === aba ? '✓ Salvo!' : `Salvar ${abas.find(a=>a.key===aba)?.label}`}
        </button>
      </div>
    </div>
  )
}
