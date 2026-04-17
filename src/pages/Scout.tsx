import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MOCK_DATA } from '../lib/mockData'

type JogadorStat = {
  id: number
  nome: string
  apelido: string
  posicao: string
  foto_url: string | null
  nota_media: string
  jogos: number
  gols_total: number
  melhor_jogo_count: number
}

export default function Scout() {
  const [jogadores, setJogadores] = useState<JogadorStat[]>([])
  const [loading, setLoading]     = useState(true)
  const [posicao, setPosicao]     = useState('')
  const [minNota, setMinNota]     = useState(0)

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await supabase.from('players').select(`
          id, nome, apelido, posicao, foto_url,
          notas:match_ratings(nota, melhor_jogo),
          gols:match_goals(id)
        `)

        if (data && data.length > 0) {
          const stats: JogadorStat[] = (data as any[])
            .map(p => ({
              id:   p.id,
              nome: p.nome ?? '',
              apelido: p.apelido ?? '',
              posicao: p.posicao ?? '',
              foto_url: p.foto_url ?? null,
              nota_media: p.notas?.length
                ? (p.notas.reduce((s: number, n: any) => s + Number(n.nota), 0) / p.notas.length).toFixed(1)
                : '0.0',
              jogos:             p.notas?.length ?? 0,
              gols_total:        p.gols?.length  ?? 0,
              melhor_jogo_count: p.notas?.filter((n: any) => n.melhor_jogo).length ?? 0,
            }))
            .filter(p => Number(p.nota_media) > 0)
            .sort((a, b) => Number(b.nota_media) - Number(a.nota_media))

          setJogadores(stats)
        } else {
          setJogadores(mockStats())
        }
      } catch {
        setJogadores(mockStats())
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const filtered = jogadores.filter(j =>
    (!posicao || j.posicao === posicao) && Number(j.nota_media) >= minNota
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔍</span>
          <h1 className="font-display text-4xl text-gradient">SCOUT</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Avaliações técnicas da narração Divino TV · Dados exclusivos para descoberta de talentos
        </p>
        <div className="mt-3 inline-flex items-center gap-2 bg-[#E8232A]/10 border border-[#E8232A]/20 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-[#E8232A] rounded-full inline-block" />
          <span className="text-xs text-[#E8232A] font-bold">Dados exclusivos Divino TV</span>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <select value={posicao} onChange={e => setPosicao(e.target.value)}
          className="bg-[#0E0F15] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none">
          <option value="">Todas as posições</option>
          {['goleiro','zagueiro','lateral','volante','meia','atacante'].map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select value={minNota} onChange={e => setMinNota(Number(e.target.value))}
          className="bg-[#0E0F15] border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none">
          <option value={0}>Qualquer nota</option>
          <option value={7}>Nota ≥ 7.0</option>
          <option value={8}>Nota ≥ 8.0</option>
          <option value={9}>Nota ≥ 9.0</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-[#0E0F15] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-10">
              Nenhum jogador encontrado com esses filtros.
            </p>
          )}
          {filtered.map((j, idx) => (
            <ScoutCard key={j.id} jogador={j} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function ScoutCard({ jogador, rank }: { jogador: JogadorStat; rank: number }) {
  const nota = Number(jogador.nota_media)
  const cor  = nota >= 8 ? '#00D68F' : nota >= 6 ? '#F5B800' : '#8B8FA8'
  const bg   = nota >= 8 ? 'from-[#003D24]' : nota >= 6 ? 'from-[#2A2000]' : 'from-[#0E0F15]'

  return (
    <Link to={`/p/${jogador.id}`}
      className={`flex items-center gap-4 p-4 bg-gradient-to-r ${bg} to-[#0E0F15] rounded-2xl border border-white/5 hover:border-[#E8232A]/30 transition-all`}>
      <div className={`w-8 text-center font-display text-xl ${rank <= 3 ? 'text-[#F5B800]' : 'text-gray-700'}`}>
        {rank}
      </div>
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {jogador.foto_url
          ? <img src={jogador.foto_url} className="w-full h-full object-cover" />
          : <span className="text-2xl">👤</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white truncate">{jogador.apelido || jogador.nome}</div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {jogador.posicao && (
            <span className="text-xs text-gray-500 capitalize">{jogador.posicao}</span>
          )}
          <span className="text-gray-700">·</span>
          <span className="text-xs text-gray-500">{jogador.jogos} avaliações</span>
          {jogador.melhor_jogo_count > 0 && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-yellow-500">⭐ {jogador.melhor_jogo_count}×</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {jogador.gols_total > 0 && (
          <div className="text-center">
            <div className="font-bold text-white text-sm">{jogador.gols_total}</div>
            <div className="text-xs text-gray-600">gols</div>
          </div>
        )}
        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm"
          style={{ borderColor: cor, color: cor }}>
          {jogador.nota_media}
        </div>
      </div>
    </Link>
  )
}

function mockStats(): JogadorStat[] {
  return MOCK_DATA.jogadores.map((j, i) => ({
    id:   j.id,
    nome: j.nome,
    apelido: j.apelido,
    posicao: j.posicao,
    foto_url: null,
    nota_media: (9.5 - i * 0.4).toFixed(1),
    jogos:             2,
    gols_total:        i < 2 ? 2 : 0,
    melhor_jogo_count: i === 0 ? 1 : 0,
  }))
}
