import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Player() {
  const { id } = useParams()
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('players').select(`
      id, nome, apelido, posicao, foto_url, numero,
      notas:match_ratings(
        nota, melhor_jogo,
        match:matches(id, rodada, status,
          mandante:teams!mandante_id(nome),
          visitante:teams!visitante_id(nome),
          championship:championships(nome))
      ),
      gols:match_goals(id, minuto, tipo,
        match:matches(id, rodada,
          mandante:teams!mandante_id(nome),
          visitante:teams!visitante_id(nome)))
    `).eq('id', id).single()
      .then(({ data }) => {
        setPlayer(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-600">
      <span className="animate-spin text-3xl mr-3">⚽</span>
      <span className="text-sm">Carregando perfil...</span>
    </div>
  )

  if (!player) return (
    <div className="p-8 text-gray-500 text-center">
      <div className="text-4xl mb-3">👤</div>
      <p>Jogador não encontrado.</p>
      <Link to="/scout" className="text-[#E8232A] text-sm mt-3 inline-block hover:underline">← Voltar ao Scout</Link>
    </div>
  )

  const notasOrd = [...(player.notas || [])].sort((a: any, b: any) => b.nota - a.nota)
  const notaMedia = notasOrd.length
    ? (notasOrd.reduce((s: number, n: any) => s + Number(n.nota), 0) / notasOrd.length).toFixed(1)
    : null
  const melhorCount = notasOrd.filter((n: any) => n.melhor_jogo).length
  const cor = notaMedia ? (Number(notaMedia) >= 8 ? '#00D68F' : Number(notaMedia) >= 6 ? '#F5B800' : '#E8232A') : '#8B8FA8'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
      <Link to="/scout" className="text-gray-500 text-sm hover:text-white transition mb-6 inline-block">
        ← Scout
      </Link>

      {/* Perfil */}
      <div className="bg-gradient-to-br from-[#1A0506] to-[#0E0F15] rounded-2xl p-6 border border-white/5 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden">
            {player.foto_url
              ? <img src={player.foto_url} className="w-full h-full object-cover" />
              : '👤'
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-3xl text-white">{player.apelido || player.nome}</div>
            {player.apelido && <div className="text-gray-500 text-sm">{player.nome}</div>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {player.posicao && (
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full capitalize">
                  {player.posicao}
                </span>
              )}
              {player.numero && (
                <span className="text-gray-500 text-xs">#{player.numero}</span>
              )}
            </div>
          </div>
          {notaMedia && (
            <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center"
              style={{ borderColor: cor, color: cor }}>
              <span className="font-display text-2xl leading-none">{notaMedia}</span>
              <span className="text-xs" style={{ color: '#8B8FA8' }}>média</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <StatBox value={notasOrd.length} label="Avaliações" />
          <StatBox value={player.gols?.length ?? 0} label="Gols" />
          <StatBox value={melhorCount} label="Melhor do Jogo" gold={melhorCount > 0} />
        </div>
      </div>

      {/* Histórico de notas */}
      {notasOrd.length > 0 && (
        <div className="bg-[#0E0F15] rounded-2xl overflow-hidden border border-white/5">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-gray-400">Histórico de Avaliações</h3>
          </div>
          {notasOrd.map((n: any, i: number) => {
            const nc = Number(n.nota)
            const ncor = nc >= 8 ? '#00D68F' : nc >= 6 ? '#F5B800' : '#E8232A'
            const m = n.match
            return (
              <Link key={i} to={m?.id ? `/m/${m.id}` : '#'}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                {n.melhor_jogo && <span className="text-yellow-400 flex-shrink-0">⭐</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {m?.mandante?.nome ?? '—'} vs {m?.visitante?.nome ?? '—'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {m?.championship?.nome} · Rodada {m?.rodada}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ borderColor: ncor, color: ncor }}>
                  {n.nota}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatBox({ value, label, gold }: { value: number; label: string; gold?: boolean }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <div className={`font-display text-3xl ${gold ? 'text-[#F5B800]' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-0.5">{label}</div>
    </div>
  )
}
