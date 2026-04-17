import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

const TIPOS = [
  { key: 'melhor_jogo', label: 'Melhor do Jogo', icon: '⭐', cor: '#F5B800' },
  { key: 'melhor_mes',  label: 'Melhor do Mês',  icon: '🏆', cor: '#E8232A' },
  { key: 'melhor_ano',  label: 'Melhor do Ano',  icon: '👑', cor: '#F5B800' },
  { key: 'artilheiro',  label: 'Artilheiro',     icon: '⚽', cor: '#00D68F' },
  { key: 'fair_play',   label: 'Fair Play',      icon: '🤝', cor: '#4B9FFF' },
]

export default function Destaques() {
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'ano'>('mes')

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
        const lista = MOCK_DATA.premiacoes.filter(a => a.tipo === tipo.key)
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

      {MOCK_DATA.premiacoes.length === 0 && (
        <p className="text-gray-600 text-sm text-center py-16">Nenhuma premiação registrada ainda.</p>
      )}
    </div>
  )
}

type AwardItem = typeof MOCK_DATA.premiacoes[number]

function AwardCard({ award, cor }: { award: AwardItem; cor: string }) {
  return (
    <Link to="#"
      className="flex items-center gap-4 p-4 bg-[#0E0F15] rounded-2xl card-hover">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center text-2xl">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white truncate">{award.player_nome}</div>
        {award.time_nome && <div className="text-xs text-gray-500 mt-0.5">{award.time_nome}</div>}
        <div className="text-xs mt-1" style={{ color: cor }}>{award.referencia}</div>
      </div>
    </Link>
  )
}
