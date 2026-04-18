import { useState } from 'react'
import { MOCK_DATA } from '../../lib/mockData'

export default function AdminTransmissao() {
  const aoVivo = MOCK_DATA.matches.filter(m => m.status === 'em_andamento')
  const agendados = MOCK_DATA.matches.filter(m => m.status === 'agendado')
  const [jogoId, setJogoId] = useState<number | null>(aoVivo[0]?.id || null)
  const [placar, setPlacar] = useState({ gm: 0, gv: 0 })
  const [eventos, setEventos] = useState<string[]>([])
  const [linkYt, setLinkYt] = useState('')

  const todos = [...aoVivo, ...agendados]
  const jogo = todos.find(j => j.id === jogoId)

  function addEvento(txt: string) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
    setEventos(prev => [`${hora} — ${txt}`, ...prev].slice(0, 20))
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-3 h-3 bg-red-500 rounded-full badge-live"/>
        <h1 className="text-xl font-bold text-white">Painel de Transmissão</h1>
      </div>

      {/* Selecionar jogo */}
      <select value={jogoId||''} onChange={e => setJogoId(Number(e.target.value))}
        className="w-full bg-[#0E0F15] border border-white/10 rounded-xl px-4 py-3 text-white mb-6 outline-none">
        <option value="">Selecionar jogo...</option>
        {todos.map(j => (
          <option key={j.id} value={j.id}>
            {j.mandante?.nome} vs {j.visitante?.nome} — Rodada {j.rodada}
          </option>
        ))}
      </select>

      {jogo && (
        <>
          {/* Placar ao vivo */}
          <div className="bg-gradient-to-b from-[#1A0506] to-[#0E0F15] rounded-2xl p-5 mb-4 border border-red-500/20 text-center">
            <div className="text-xs text-red-400 font-condensed tracking-wider mb-3">AO VIVO</div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{jogo.mandante?.nome}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button onClick={() => setPlacar(p => ({...p,gm:Math.max(0,p.gm-1)}))} className="w-9 h-9 bg-white/5 rounded-lg text-lg font-bold">−</button>
                  <span className="font-display text-5xl text-white">{placar.gm}</span>
                  <button onClick={() => { setPlacar(p => ({...p,gm:p.gm+1})); addEvento(`GOL! ${jogo.mandante?.nome}`) }}
                    className="w-9 h-9 bg-red-500/30 border border-red-500/40 rounded-lg text-lg font-bold text-red-400">+</button>
                </div>
              </div>
              <span className="font-display text-3xl text-gray-700">:</span>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{jogo.visitante?.nome}</div>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button onClick={() => setPlacar(p => ({...p,gv:Math.max(0,p.gv-1)}))} className="w-9 h-9 bg-white/5 rounded-lg text-lg font-bold">−</button>
                  <span className="font-display text-5xl text-white">{placar.gv}</span>
                  <button onClick={() => { setPlacar(p => ({...p,gv:p.gv+1})); addEvento(`GOL! ${jogo.visitante?.nome}`) }}
                    className="w-9 h-9 bg-red-500/30 border border-red-500/40 rounded-lg text-lg font-bold text-red-400">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Botões rápidos de evento */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: '🟨', label: 'Cartão',       cor:'border-yellow-500/30 text-yellow-400' },
              { icon: '🟥', label: 'Vermelho',      cor:'border-red-500/30 text-red-400' },
              { icon: '⏱️', label: 'Intervalo',    cor:'border-blue-500/30 text-blue-400' },
              { icon: '🔄', label: 'Substituição',  cor:'border-green-500/30 text-green-400' },
              { icon: '🏁', label: 'Fim de jogo',   cor:'border-white/20 text-gray-400' },
              { icon: '⚠️', label: 'Paralisação',  cor:'border-orange-500/30 text-orange-400' },
            ].map(btn => (
              <button key={btn.label} onClick={() => addEvento(btn.label)}
                className={`py-3 bg-white/3 border rounded-xl text-xs font-medium transition hover:bg-white/8 active:scale-95 ${btn.cor}`}>
                <div className="text-xl mb-1">{btn.icon}</div>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Link YouTube */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Link YouTube da transmissão</label>
            <input value={linkYt} onChange={e => setLinkYt(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 transition" />
          </div>

          {/* Feed de eventos */}
          {eventos.length > 0 && (
            <div className="bg-[#0E0F15] rounded-xl p-4 border border-white/5">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-3">Feed do jogo</div>
              {eventos.map((e, i) => (
                <div key={i} className="text-sm text-gray-300 py-1.5 border-b border-white/5 last:border-0">{e}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
