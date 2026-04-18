import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

export default function Championship() {
  const { id } = useParams()
  const cid  = Number(id)
  const [aba, setAba] = useState<'tabela'|'jogos'>('tabela')

  const camp   = MOCK_DATA.campeonatos.find(c => c.id === cid)
  const tabela = MOCK_DATA.classificacao[cid] || []
  const jogos  = MOCK_DATA.matches.filter(m => m.championship_id === cid)

  if (!camp) return <div className="p-8 text-gray-400 text-center">Campeonato não encontrado.</div>

  const isKingsLeague = camp.formato === 'kings_league'
  const isFutsal      = camp.modalidade === 'salão'

  // Para Kings League: separar grupos
  const grupos = isKingsLeague
    ? [...new Set(tabela.map(t => t.grupo).filter(Boolean))] as string[]
    : []

  const secoes = isKingsLeague
    ? (['grupo', 'semi', 'final'] as const).map(fase => ({
        key: fase,
        label: fase === 'grupo' ? '⚽ Fase de Grupos' : fase === 'semi' ? '🏆 Semifinais' : '🥇 Final',
        matches: jogos.filter(j => (j as { fase?: string }).fase === fase),
      })).filter(s => s.matches.length > 0)
    : [...new Set(jogos.map(j => j.rodada))].sort((a,b) => a - b).map(r => ({
        key: String(r),
        label: `Rodada ${r}`,
        matches: jogos.filter(j => j.rodada === r),
      }))

  const modalidadeBadge = isFutsal
    ? { icon:'🏟️', label:'Futsal', cor:'text-blue-400 bg-blue-500/15' }
    : isKingsLeague
    ? { icon:'👑', label:'Kings League', cor:'text-[#F5B800] bg-[#F5B800]/15' }
    : { icon:'⚽', label:'Campo', cor:'text-green-400 bg-green-500/15' }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-16">
      <Link to="/" className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← Voltar</Link>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-black text-white">{camp.nome}</h1>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-1 ${modalidadeBadge.cor}`}>
          {modalidadeBadge.icon} {modalidadeBadge.label}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-6">{camp.categoria} · Temporada {camp.temporada}</p>

      {isKingsLeague && (
        <div className="bg-gradient-to-r from-[#1A1000] to-[#0E0F15] border border-[#F5B800]/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div>
            <p className="text-[#F5B800] font-black text-sm">Kings League Divino TV</p>
            <p className="text-gray-500 text-xs mt-0.5">Torneio especial · Formato 7v7 · Semifinais e Final em breve</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['tabela','jogos'] as const).map(a => (
          <button key={a} onClick={() => setAba(a)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
              aba===a ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}>
            {a === 'tabela' ? '📊 Classificação' : '📅 Jogos'}
          </button>
        ))}
      </div>

      {aba === 'tabela' && (
        isKingsLeague && grupos.length > 0
          ? <div className="space-y-5">
              {grupos.map(grupo => {
                const entries = tabela.filter(t => t.grupo === grupo)
                return (
                  <div key={grupo}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-7 h-7 rounded-full bg-[#F5B800]/20 text-[#F5B800] text-xs font-black flex items-center justify-center">
                        {grupo}
                      </span>
                      <span className="text-sm font-bold text-white">Grupo {grupo}</span>
                    </div>
                    <TabelaTable entries={entries} />
                  </div>
                )
              })}
            </div>
          : <TabelaTable entries={tabela} />
      )}

      {aba === 'jogos' && (
        <div>
          {isKingsLeague && (
            <div className="space-y-5">
              {secoes.map(secao => (
                <div key={secao.key}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2 pl-1 mb-1">
                    {secao.label}
                  </p>
                  {secao.key === 'grupo'
                    ? (['A','B'] as const).map(gr => {
                        const gJogos = secao.matches.filter(j => (j as { grupo?: string }).grupo === gr)
                        if (!gJogos.length) return null
                        return (
                          <div key={gr} className="mb-3">
                            <p className="text-xs text-gray-600 px-1 mb-1">Grupo {gr}</p>
                            {gJogos.map(j => <JogoCard key={j.id} j={j} />)}
                          </div>
                        )
                      })
                    : secao.matches.map(j => <JogoCard key={j.id} j={j} />)
                  }
                </div>
              ))}
            </div>
          )}
          {!isKingsLeague && (
            <div>
              {secoes.map(secao => (
                <div key={secao.key} className="mb-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest py-2 pl-1">{secao.label}</div>
                  {secao.matches.map(j => <JogoCard key={j.id} j={j} />)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabelaTable({ entries }: { entries: typeof MOCK_DATA.classificacao[number] }) {
  return (
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
          {entries.map((t, i) => (
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
  )
}

function JogoCard({ j }: { j: typeof MOCK_DATA.matches[number] }) {
  return (
    <Link to={`/m/${j.id}`}
      className="block bg-[#111811] border border-white/10 rounded-xl p-4 mb-2 hover:border-green-400/50 transition">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-white flex-1 truncate">{j.mandante?.nome}</span>
        <span className="font-black text-white px-3 flex-shrink-0 text-center min-w-[80px]">
          {j.status === 'finalizado'
            ? `${j.resultado?.gols_mandante} × ${j.resultado?.gols_visitante}`
            : j.data_hora
              ? new Date(j.data_hora).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
              : 'vs'}
        </span>
        <span className="font-bold text-white flex-1 text-right truncate">{j.visitante?.nome}</span>
      </div>
      {j.local && <div className="text-xs text-gray-500 mt-1 text-center">📍 {j.local}</div>}
      {j.status === 'agendado' && j.data_hora && (
        <div className="text-xs text-[#4B9FFF] mt-1 text-center">
          {new Date(j.data_hora).toLocaleString('pt-BR', { weekday:'short', hour:'2-digit', minute:'2-digit' })}
        </div>
      )}
    </Link>
  )
}
