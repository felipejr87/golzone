import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MOCK_DATA } from '../lib/mockData'

type AwardItem = {
  id: number
  tipo: string
  referencia: string
  player_nome?: string
  time_nome?: string
  championship_nome?: string
  player?: { id?: number; nome: string; apelido?: string; foto_url?: string | null }
  team?:   { nome: string; escudo_url?: string | null }
}

const TIPOS = [
  { key: 'melhor_jogo', label: 'Melhor do Jogo', icon: '⭐', cor: '#F5B800' },
  { key: 'melhor_mes',  label: 'Melhor do Mês',  icon: '🏆', cor: '#E8232A' },
  { key: 'melhor_ano',  label: 'Melhor do Ano',  icon: '👑', cor: '#F5B800' },
  { key: 'artilheiro',  label: 'Artilheiro',     icon: '⚽', cor: '#00D68F' },
  { key: 'fair_play',   label: 'Fair Play',      icon: '🤝', cor: '#4B9FFF' },
]

export default function Destaques() {
  const [awards, setAwards]   = useState<AwardItem[]>([])
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'ano'>('mes')

  useEffect(() => {
    supabase.from('awards').select(`
      id, tipo, referencia,
      player:players(id,nome,apelido,foto_url),
      team:teams(nome,escudo_url)
    `).order('criado_em', { ascending: false }).limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAwards(data as unknown as AwardItem[])
        } else {
          setAwards(MOCK_DATA.premiacoes.map(p => ({
            id:                p.id,
            tipo:              p.tipo,
            referencia:        p.referencia,
            player_nome:       p.player_nome,
            time_nome:         p.time_nome,
            championship_nome: p.championship_nome,
          })))
        }
      })
  }, [])


  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl text-gradient mb-2">DESTAQUES</h1>
        <p className="text-gray-500 text-sm">Premiações e reconhecimentos da Divino TV</p>
      </div>

      <div className="flex gap-2 justify-center mb-8">
        {(['semana', 'mes', 'ano'] as const).map(p => (
          <button key={p} onClick={() => setPeriodo(p)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              periodo === p ? 'bg-[#E8232A] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            {p === 'semana' ? 'Semana' : p === 'mes' ? 'Mês' : 'Ano'}
          </button>
        ))}
      </div>

      {TIPOS.map(tipo => {
        const lista = awards.filter(a => a.tipo === tipo.key)
        if (!lista.length) return null
        return (
          <section key={tipo.key} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{tipo.icon}</span>
              <h2 className="font-display text-2xl" style={{ color: tipo.cor }}>{tipo.label}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lista.slice(0, 4).map(a => (
                <AwardCard key={a.id} award={a} cor={tipo.cor} />
              ))}
            </div>
          </section>
        )
      })}

      {awards.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-16">Nenhuma premiação registrada ainda.</p>
      )}
    </div>
  )
}

function AwardCard({ award, cor }: { award: AwardItem; cor: string }) {
  const playerNome = award.player?.apelido || award.player?.nome || award.player_nome || '—'
  const timeNome   = award.team?.nome || award.time_nome || ''
  const href = award.player?.id ? `/p/${award.player.id}` : '#'

  return (
    <Link to={href}
      className="flex items-center gap-4 p-4 bg-[#0E0F15] rounded-2xl card-hover">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center text-2xl">
        {award.player?.foto_url
          ? <img src={award.player.foto_url} className="w-full h-full object-cover" />
          : '👤'
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white truncate">{playerNome}</div>
        {timeNome && <div className="text-xs text-gray-500 mt-0.5">{timeNome}</div>}
        <div className="text-xs mt-1" style={{ color: cor }}>{award.referencia}</div>
      </div>
    </Link>
  )
}
