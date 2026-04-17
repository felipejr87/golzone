import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

export default function Championship() {
  const { id } = useParams()
  const cid = Number(id)
  const [aba, setAba] = useState<'tabela'|'jogos'>('tabela')

  const camp   = MOCK_DATA.campeonatos.find(c => c.id === cid)
  const tabela = MOCK_DATA.classificacao[cid] || []
  const jogos  = MOCK_DATA.matches.filter(m => m.championship_id === cid)
  const rodadas = [...new Set(jogos.map(j => j.rodada))].sort((a, b) => a - b)

  if (!camp) return <div className="p-8 text-gray-400 text-center">Campeonato não encontrado.</div>

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      <Link to="/" className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← Voltar</Link>
      <h1 className="text-2xl font-black text-white mb-1">{camp.nome}</h1>
      <p className="text-gray-400 text-sm mb-6">{camp.categoria} · Temporada {camp.temporada}</p>

      <div className="flex gap-2 mb-6">
        {(['tabela','jogos'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${aba===a?'bg-green-500 text-black':'bg-white/10 text-gray-300 hover:bg-white/15'}`}>
            {a === 'tabela' ? '📊 Classificação' : '📅 Jogos'}
          </button>
        ))}
      </div>

      {aba === 'tabela' && (
        <div className="bg-[#111811] rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-white/10">
                {['#','Time','PJ','V','E','D','SG','PTS'].map(h => (
                  <th key={h} className={`py-3 px-2 font-semibold ${h==='Time'?'text-left pl-4':'text-center'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabela.map((t, i) => (
                <tr key={t.team_id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className={`py-3 px-2 text-center font-bold ${i<4?'text-green-400':'text-gray-500'}`}>{i+1}</td>
                  <td className="py-3 px-2 pl-4 font-medium text-white">{t.team_nome}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{t.jogos}</td>
                  <td className="py-3 px-2 text-center text-green-400 font-bold">{t.vitorias}</td>
                  <td className="py-3 px-2 text-center text-yellow-400">{t.empates}</td>
                  <td className="py-3 px-2 text-center text-red-400">{t.derrotas}</td>
                  <td className="py-3 px-2 text-center text-gray-300">{Number(t.saldo)>0?'+':''}{t.saldo}</td>
                  <td className="py-3 px-2 text-center font-black text-white text-base">{t.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {aba === 'jogos' && (
        <div>
          {rodadas.map(r => (
            <div key={r} className="mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2 pl-1">Rodada {r}</div>
              {jogos.filter(j => j.rodada === r).map(j => (
                <Link key={j.id} to={`/m/${j.id}`}
                  className="block bg-[#111811] border border-white/10 rounded-xl p-4 mb-2 hover:border-green-400/50 transition">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-white flex-1 truncate">{j.mandante?.nome}</span>
                    <span className="font-black text-white px-3 flex-shrink-0 text-center min-w-[80px]">
                      {j.status==='finalizado'
                        ? `${j.resultado?.gols_mandante} × ${j.resultado?.gols_visitante}`
                        : j.data_hora ? new Date(j.data_hora).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) : 'vs'}
                    </span>
                    <span className="font-bold text-white flex-1 text-right truncate">{j.visitante?.nome}</span>
                  </div>
                  {j.local && <div className="text-xs text-gray-500 mt-1 text-center">📍 {j.local}</div>}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
