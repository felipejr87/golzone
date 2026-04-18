import { useState } from 'react'
import { MOCK_DATA } from '../lib/mockData'

type Candidato = typeof MOCK_DATA.votacao_divino_league.posicoes[number]['candidatos'][number]

export default function DivinoLeague() {
  const votacao = MOCK_DATA.votacao_divino_league

  // Contagem de votos local (inicializada do mock)
  const [votos, setVotos] = useState<Record<number, number>>(() => {
    const m: Record<number, number> = {}
    votacao.posicoes.forEach(pos => pos.candidatos.forEach(c => { m[c.id] = c.votos }))
    return m
  })

  // Posição em que o usuário já votou (restaurado do localStorage)
  const [meuVoto, setMeuVoto] = useState<Record<string, number>>(() => {
    const v: Record<string, number> = {}
    votacao.posicoes.forEach(pos => {
      const saved = localStorage.getItem(`divino_vote_${pos.posicao}`)
      if (saved) v[pos.posicao] = Number(saved)
    })
    return v
  })

  function votar(posicao: string, candidatoId: number) {
    if (meuVoto[posicao]) return
    setVotos(prev => ({ ...prev, [candidatoId]: (prev[candidatoId] ?? 0) + 1 }))
    setMeuVoto(prev => ({ ...prev, [posicao]: candidatoId }))
    localStorage.setItem(`divino_vote_${posicao}`, String(candidatoId))
  }

  const totalVotos = votacao.posicoes.reduce(
    (sum, pos) => sum + pos.candidatos.reduce((s, c) => s + (votos[c.id] ?? 0), 0), 0
  )
  const votosUsuario = Object.keys(meuVoto).length

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-[#1A1000] via-[#0E0F15] to-[#060608] rounded-2xl p-6 mb-6 border border-[#F5B800]/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,184,0,0.06),transparent_60%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">Divino League 2026</h1>
              <p className="text-gray-400 text-sm mt-0.5">Seleção dos melhores da temporada — escolhida por você!</p>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <div>
              <p className="text-gray-600 text-xs uppercase tracking-wider">Total de votos</p>
              <p className="font-display text-3xl text-[#F5B800]">{totalVotos.toLocaleString('pt-BR')}</p>
            </div>
            <div className="border-l border-white/10 pl-5">
              <p className="text-gray-600 text-xs uppercase tracking-wider">Encerramento</p>
              <p className="text-white font-bold">31/05/2026</p>
            </div>
            <div className="border-l border-white/10 pl-5">
              <p className="text-gray-600 text-xs uppercase tracking-wider">Seus votos</p>
              <p className="text-white font-bold">{votosUsuario}/{votacao.posicoes.length}</p>
            </div>
          </div>

          {votacao.ativa && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold">Votação aberta</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Posições ── */}
      {votacao.posicoes.map(pos => {
        const hasVoted    = !!meuVoto[pos.posicao]
        const totalPos    = pos.candidatos.reduce((s, c) => s + (votos[c.id] ?? 0), 0)
        const sorted      = [...pos.candidatos].sort((a, b) => (votos[b.id] ?? 0) - (votos[a.id] ?? 0))

        return (
          <div key={pos.posicao} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-black text-lg">{pos.posicao}</h2>
              <div className="flex items-center gap-2">
                {hasVoted && <span className="text-xs text-[#00D68F] font-bold">✓ Votado</span>}
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  {pos.vagas} vaga{pos.vagas > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {sorted.map((c, idx) => (
                <CandidatoCard
                  key={c.id}
                  candidato={c}
                  rank={idx}
                  vagas={pos.vagas}
                  votoCount={votos[c.id] ?? 0}
                  totalPos={totalPos}
                  isMyVote={meuVoto[pos.posicao] === c.id}
                  hasVoted={hasVoted}
                  onVotar={() => votar(pos.posicao, c.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      <p className="text-center text-xs text-gray-700 mt-4 pb-4">
        Votos salvos neste dispositivo. Integração com conta Divino TV em breve.
      </p>
    </div>
  )
}

function CandidatoCard({ candidato, rank, vagas, votoCount, totalPos, isMyVote, hasVoted, onVotar }: {
  candidato: Candidato
  rank:      number
  vagas:     number
  votoCount: number
  totalPos:  number
  isMyVote:  boolean
  hasVoted:  boolean
  onVotar:   () => void
}) {
  const pct      = totalPos > 0 ? Math.round(votoCount / totalPos * 100) : 0
  const isLeader = rank < vagas

  return (
    <div className={`bg-[#111811] border rounded-xl p-3 transition ${
      isMyVote
        ? 'border-[#00D68F]/40 bg-[#00D68F]/5'
        : isLeader
        ? 'border-[#F5B800]/20'
        : 'border-white/5'
    }`}>
      <div className="flex items-center gap-3">
        {/* Posição */}
        <span className={`font-display text-xl w-6 text-center flex-shrink-0 ${
          isLeader ? 'text-[#F5B800]' : 'text-gray-700'
        }`}>{rank + 1}</span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">
            {candidato.nome}
            {isMyVote && <span className="ml-2 text-[#00D68F] text-xs">✓</span>}
          </p>
          <p className="text-gray-500 text-xs truncate">{candidato.time} · {candidato.camp}</p>
        </div>

        {/* Votos */}
        <div className="text-right flex-shrink-0 mr-2">
          <p className={`font-display text-lg ${isLeader ? 'text-[#00D68F]' : 'text-gray-400'}`}>
            {votoCount.toLocaleString('pt-BR')}
          </p>
          <p className="text-gray-600 text-xs">{pct}%</p>
        </div>

        {/* Botão */}
        <button
          onClick={onVotar}
          disabled={hasVoted}
          className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition ${
            isMyVote
              ? 'bg-[#00D68F]/20 text-[#00D68F] cursor-default'
              : hasVoted
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : 'bg-[#E8232A] hover:bg-[#B01B21] text-white active:scale-95'
          }`}>
          {isMyVote ? '✓' : hasVoted ? '—' : 'Votar'}
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="mt-2.5 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isMyVote ? 'bg-[#00D68F]' : isLeader ? 'bg-[#F5B800]' : 'bg-white/20'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
