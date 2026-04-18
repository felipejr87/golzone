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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Jogos</h1>
      </div>

      <div className="mb-4">
        <select value={filtro} onChange={e => setFiltro(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none w-full">
          <option value={0}>Todos os campeonatos</option>
          {MOCK_DATA.campeonatos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {jogos.map(j => (
          <div key={j.id} className="bg-[#111811] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{j.championship?.nome} · Rodada {j.rodada}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                j.status === 'finalizado'   ? 'bg-green-500/20 text-green-400' :
                j.status === 'em_andamento' ? 'bg-red-500/20 text-red-400' :
                'bg-white/10 text-gray-400'
              }`}>{j.status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white flex-1 truncate">{j.mandante?.nome}</span>
              <span className="font-black text-white px-3 flex-shrink-0 text-center min-w-[80px]">
                {j.status === 'finalizado'
                  ? `${j.resultado?.gols_mandante} × ${j.resultado?.gols_visitante}`
                  : j.data_hora
                    ? new Date(j.data_hora).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
                    : 'vs'
                }
              </span>
              <span className="font-bold text-white flex-1 text-right truncate">{j.visitante?.nome}</span>
            </div>
            {j.local && <p className="text-xs text-gray-500 mt-1 text-center">📍 {j.local}</p>}
            <div className="flex gap-2 mt-3 flex-wrap">
              <Link to={`/m/${j.id}`} target="_blank"
                className="text-xs bg-white/10 hover:bg-white/15 text-gray-300 font-bold px-3 py-1.5 rounded-lg transition">
                👁️ Ver jogo
              </Link>
              <Link to={`/admin/jogos/${j.id}/sumula`}
                className="text-xs bg-white/8 hover:bg-white/15 text-gray-400 font-bold px-3 py-1.5 rounded-lg transition">
                📋 Súmula
              </Link>
              <Link to={`/admin/transmissao/${j.id}`}
                className="flex items-center gap-1 text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-medium hover:bg-red-500/25 transition">
                <span>🎙️</span> Narrar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
