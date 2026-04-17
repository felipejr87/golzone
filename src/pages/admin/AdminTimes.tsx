import { Link } from 'react-router-dom'
import { MOCK_DATA } from '../../lib/mockData'

export default function AdminTimes() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Times</h1>
        <span className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">Modo demonstração</span>
      </div>

      <div className="space-y-2">
        {MOCK_DATA.times.map(t => {
          const jogos     = MOCK_DATA.matches.filter(m => m.mandante_id === t.id || m.visitante_id === t.id)
          const vitorias  = jogos.filter(m => {
            if (!m.resultado) return false
            const isHome = m.mandante_id === t.id
            const gf = isHome ? m.resultado.gols_mandante : m.resultado.gols_visitante
            const gc = isHome ? m.resultado.gols_visitante : m.resultado.gols_mandante
            return gf > gc
          }).length
          const camps = [...new Set(jogos.map(m => m.championship?.nome))].filter(Boolean)

          return (
            <div key={t.id} className="bg-[#111811] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-black text-sm">
                  {t.nome[0]}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{t.nome}</p>
                  <p className="text-gray-400 text-sm">{t.cidade}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-bold">{jogos.length} jogos · {vitorias} V</p>
                  <p className="text-gray-500 text-xs">{camps.join(', ')}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {MOCK_DATA.jogadores.filter(j => j.time === t.nome).map(j => (
                  <Link key={j.id} to={`/p/${j.id}`}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-2 py-1 rounded-lg transition">
                    #{j.apelido}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
