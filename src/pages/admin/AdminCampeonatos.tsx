import { MOCK_DATA } from '../../lib/mockData'

export default function AdminCampeonatos() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Campeonatos</h1>
        <span className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">Modo demonstração</span>
      </div>

      <div className="space-y-2">
        {MOCK_DATA.campeonatos.map(c => (
          <div key={c.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-black text-sm">
              🏆
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{c.nome}</p>
              <p className="text-gray-400 text-sm">{c.categoria} · Temporada {c.temporada}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                {c.status}
              </span>
              <span className="text-xs text-gray-500">
                {MOCK_DATA.matches.filter(m => m.championship_id === c.id).length} jogos
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
