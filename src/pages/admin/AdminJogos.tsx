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
        <Link to="/admin/narracao"
          className="bg-[#E8232A] hover:bg-[#B01B21] text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2">
          🎙️ Narrar
        </Link>
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
              {j.status !== 'finalizado' && (
                <Link to="/admin/narracao"
                  className="text-xs bg-[#E8232A]/15 hover:bg-[#E8232A]/25 text-[#E8232A] font-bold px-3 py-1.5 rounded-lg transition">
                  🎙️ Narrar este jogo
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
