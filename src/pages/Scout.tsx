import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

type JogadorStat = {
  id: number
  nome: string
  apelido: string
  posicao: string
  nota_media: string
  jogos: number
  gols_total: number
  melhor_jogo_count: number
}

const allStats: JogadorStat[] = MOCK_DATA.jogadores.map((j, i) => ({
  id:   j.id,
  nome: j.nome,
  apelido: j.apelido,
  posicao: j.posicao,
  nota_media: (9.5 - i * 0.4).toFixed(1),
  jogos:             2,
  gols_total:        i < 2 ? 2 : 0,
  melhor_jogo_count: i === 0 ? 1 : 0,
}))

export default function Scout() {
  const [posicao, setPosicao] = useState('')
  const [minNota, setMinNota] = useState(0)

  const filtered = allStats.filter(j =>
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
    </div>
  )
}

function ScoutCard({ jogador, rank }: { jogador: JogadorStat; rank: number }) {
  const nota = Number(jogador.nota_media)
  const cor  = nota >= 8 ? 'var(--green)' : nota >= 6 ? 'var(--yellow)' : 'var(--t-2)'
  const medalha = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null

  return (
    <Link to={`/p/${jogador.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        background: 'var(--bg-card)', border: '0.5px solid var(--b-1)',
        borderRadius: 'var(--r-lg)', transition: 'border-color 0.15s',
      }}>
        {/* Posição */}
        <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
          {medalha ? (
            <span style={{ fontSize: 20 }}>{medalha}</span>
          ) : (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--t-3)' }}>{rank}</span>
          )}
        </div>

        {/* Avatar com cor da nota */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `${cor}15`, border: `1.5px solid ${cor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: cor,
        }}>
          {(jogador.apelido || jogador.nome).slice(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
            {jogador.apelido || jogador.nome}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
            {jogador.posicao && (
              <span style={{ fontSize: 11, color: 'var(--t-3)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{jogador.posicao}</span>
            )}
            <span style={{ fontSize: 11, color: 'var(--t-3)', fontFamily: 'var(--font-body)' }}>{jogador.jogos} jogos</span>
            {jogador.gols_total > 0 && (
              <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-body)' }}>⚽ {jogador.gols_total}</span>
            )}
            {jogador.melhor_jogo_count > 0 && (
              <span style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'var(--font-body)' }}>⭐ {jogador.melhor_jogo_count}×</span>
            )}
          </div>
        </div>

        {/* Nota circular */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${cor}`, background: `${cor}10`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: cor }}>{jogador.nota_media}</span>
        </div>
      </div>
    </Link>
  )
}
