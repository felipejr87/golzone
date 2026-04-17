import { Link } from 'react-router-dom'
import { MOCK_DATA } from '../../lib/mockData'

const stats = {
  campeonatos: MOCK_DATA.campeonatos.length,
  times:       MOCK_DATA.times.length,
  jogos:       MOCK_DATA.matches.length,
  finalizados: MOCK_DATA.matches.filter(m => m.status === 'finalizado').length,
}

const kpis = [
  { label:'Campeonatos', valor: stats.campeonatos, cor:'text-green-400',  icone:'🏆' },
  { label:'Times',       valor: stats.times,       cor:'text-blue-400',   icone:'👕' },
  { label:'Jogos',       valor: stats.jogos,       cor:'text-yellow-400', icone:'⚽' },
  { label:'Finalizados', valor: stats.finalizados, cor:'text-gray-300',   icone:'✅' },
]

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#111811] border border-white/10 rounded-xl p-4">
            <div className="text-xl mb-1">{k.icone}</div>
            <div className={`text-3xl font-black ${k.cor}`}>{k.valor}</div>
            <div className="text-gray-400 text-sm mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/admin/narracao"
          className="bg-[#E8232A] hover:bg-[#B01B21] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2">
          🎙️ Iniciar Narração
        </Link>
        <Link to="/admin/campeonatos" className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2 rounded-xl text-sm transition">+ Campeonato</Link>
        <Link to="/admin/times"       className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2 rounded-xl text-sm transition">+ Time</Link>
        <Link to="/admin/jogos"       className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2 rounded-xl text-sm transition">Ver Jogos</Link>
      </div>

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Campeonatos Ativos</h2>
      {MOCK_DATA.campeonatos.map(c => (
        <div key={c.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 mb-2 flex items-center justify-between">
          <div>
            <p className="font-bold text-white">{c.nome}</p>
            <p className="text-gray-400 text-sm">{c.categoria} · {c.temporada}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/c/${c.id}`} target="_blank" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition">Ver ↗</Link>
            <Link to="/admin/jogos" className="text-xs text-green-400 px-3 py-1.5 rounded-lg bg-green-500/10 transition">Jogos</Link>
          </div>
        </div>
      ))}
    </div>
  )
}
