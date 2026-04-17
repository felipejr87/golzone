import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

export default function Match() {
  const { id } = useParams()
  const [aba, setAba] = useState<'narracao' | 'notas' | 'sumula'>('narracao')

  const match = MOCK_DATA.matches.find(m => m.id === Number(id))

  if (!match) return (
    <div className="p-8 text-gray-500 text-center">
      <div className="text-4xl mb-3">⚽</div>
      <p>Jogo não encontrado.</p>
      <Link to="/" className="text-[#E8232A] text-sm mt-3 inline-block hover:underline">← Voltar ao início</Link>
    </div>
  )

  const melhor  = match.notas?.find(n => n.melhor_jogo)
  const notasOrd = [...(match.notas || [])].sort((a, b) => b.nota - a.nota)
  const gols     = match.gols || []
  const cartoes  = match.cartoes || []

  const tabs: { key: typeof aba; label: string }[] = [
    { key: 'narracao', label: '📢 Narração' },
    { key: 'notas',    label: '⭐ Notas'    },
    { key: 'sumula',   label: '📋 Súmula'   },
  ]

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── PLACAR HERO ── */}
      <div className="bg-gradient-to-b from-[#1A0506] to-[#0E0F15] px-4 py-8 border-b border-white/5">
        <div className="text-center mb-6">
          <Link to={`/c/${match.championship_id}`}
            className="text-xs text-gray-500 uppercase tracking-widest hover:text-gray-300 transition">
            ← {match.championship?.nome} · Rodada {match.rodada}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4">
          <MatchTeam team={match.mandante} />
          <div className="text-center px-2 flex-shrink-0">
            {(match.status === 'finalizado' || match.status === 'em_andamento') ? (
              <div className="font-display text-6xl md:text-7xl text-white">
                {match.resultado?.gols_mandante ?? 0}
                <span className="text-gray-700 mx-2">:</span>
                {match.resultado?.gols_visitante ?? 0}
              </div>
            ) : (
              <div>
                <div className="font-display text-4xl text-gray-500">VS</div>
                {match.data_hora && (
                  <div className="text-sm text-gray-500 mt-2">
                    {new Date(match.data_hora).toLocaleString('pt-BR', {
                      dateStyle: 'short', timeStyle: 'short',
                    })}
                  </div>
                )}
              </div>
            )}
            <div className="mt-3 flex justify-center">
              <StatusBadge status={match.status} />
            </div>
          </div>
          <MatchTeam team={match.visitante} />
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600 flex-wrap">
          {match.local && <span>📍 {match.local}</span>}
          {match.sumula?.arbitro && <span>⚖️ {match.sumula.arbitro}</span>}
          {match.sumula?.publico && <span>👥 {Number(match.sumula.publico).toLocaleString('pt-BR')}</span>}
        </div>

        {match.link_video && (
          <div className="flex justify-center mt-5">
            <a href={match.link_video} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#E8232A] text-white font-bold rounded-full hover:bg-[#B01B21] transition glow-red">
              <YtIcon />
              Assistir narração completa
            </a>
          </div>
        )}
      </div>

      {/* ── MELHOR DO JOGO ── */}
      {melhor && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-[#2A2000] to-[#1A1600] border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-3xl">🏆</span>
          <div className="flex-1">
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Melhor do Jogo</div>
            <div className="font-bold text-white text-lg">{melhor.player?.nome}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-4xl text-yellow-400">{melhor.nota}</div>
            <div className="text-xs text-yellow-600">/ 10</div>
          </div>
        </div>
      )}

      {/* ── ABAS ── */}
      <div className="flex border-b border-white/5 px-4 mt-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setAba(t.key)}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition ${
              aba === t.key
                ? 'border-[#E8232A] text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-5">

        {/* ── ABA NARRAÇÃO ── */}
        {aba === 'narracao' && (
          <div className="space-y-5">
            {gols.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Gols</h3>
                <div className="space-y-2">
                  {gols.map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 bg-[#0E0F15] rounded-xl">
                      <span className="text-[#00D68F] font-bold text-sm w-10 flex-shrink-0">
                        {g.minuto ? `${g.minuto}'` : '—'}
                      </span>
                      <span className="text-lg">⚽</span>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{g.jogador}</div>
                        <div className="text-gray-600 text-xs">{g.team?.nome}</div>
                      </div>
                      {g.tipo && g.tipo !== 'normal' && (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full capitalize">
                          {g.tipo === 'penalti' ? 'Pênalti' : 'Contra'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cartoes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cartões</h3>
                <div className="space-y-2">
                  {cartoes.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-[#0E0F15] rounded-xl">
                      <span className="text-sm w-10 flex-shrink-0 text-gray-600">
                        {c.minuto ? `${c.minuto}'` : '—'}
                      </span>
                      <span className="text-lg">
                        {c.tipo === 'amarelo' ? '🟨' : c.tipo === 'vermelho' ? '🟥' : '🟨🟥'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{c.jogador}</div>
                        <div className="text-gray-600 text-xs">{c.team?.nome}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gols.length === 0 && cartoes.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-10">Narração não disponível ainda.</p>
            )}
          </div>
        )}

        {/* ── ABA NOTAS ── */}
        {aba === 'notas' && (
          <div>
            <p className="text-xs text-gray-600 mb-5 text-center">
              Avaliações da narração Divino TV · Dados para análise de scout
            </p>
            {notasOrd.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-10">Notas ainda não disponíveis.</p>
            )}
            <div className="space-y-2">
              {notasOrd.map((n, i) => (
                <PlayerRatingRow key={i} nota={n} />
              ))}
            </div>
          </div>
        )}

        {/* ── ABA SÚMULA ── */}
        {aba === 'sumula' && (
          <div className="space-y-3 text-sm text-gray-500">
            {match.sumula?.arbitro && (
              <div className="flex gap-2 p-3 bg-[#0E0F15] rounded-xl">
                <span>⚖️</span>
                <span>Árbitro: <span className="text-white font-medium">{match.sumula.arbitro}</span></span>
              </div>
            )}
            {match.sumula?.publico && (
              <div className="flex gap-2 p-3 bg-[#0E0F15] rounded-xl">
                <span>👥</span>
                <span>Público: <span className="text-white font-medium">
                  {Number(match.sumula.publico).toLocaleString('pt-BR')}
                </span></span>
              </div>
            )}
            {match.sumula?.observacoes && (
              <div className="bg-[#0E0F15] rounded-xl p-4 text-gray-300 leading-relaxed mt-2">
                {match.sumula.observacoes}
              </div>
            )}
            {!match.sumula && (
              <p className="text-gray-600 text-center py-10">Relatório não disponível.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MatchTeam({ team }: { team: { id: number; nome: string } | null }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl">
        ⚽
      </div>
      <span className="font-bold text-white text-center text-sm md:text-base leading-tight max-w-[120px]">
        {team?.nome ?? '—'}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    finalizado:   { label: '✅ Finalizado',  cls: 'bg-white/10 text-gray-400' },
    em_andamento: { label: '🔴 AO VIVO',     cls: 'bg-[#00D68F]/20 text-[#00D68F] badge-live' },
    agendado:     { label: '📅 Agendado',    cls: 'bg-[#4B9FFF]/20 text-[#4B9FFF]' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-white/10 text-gray-400' }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
  )
}

function PlayerRatingRow({ nota }: { nota: { nota: number; melhor_jogo: boolean; player: { nome: string } } }) {
  const n   = Number(nota.nota)
  const cor = n >= 8 ? '#00D68F' : n >= 6 ? '#F5B800' : '#E8232A'
  return (
    <div className={`flex items-center gap-3 p-3 bg-[#0E0F15] rounded-xl ${nota.melhor_jogo ? 'border border-yellow-500/30' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-white text-sm truncate">{nota.player?.nome}</div>
        {nota.melhor_jogo && <div className="text-xs text-yellow-400">⭐ Melhor do jogo</div>}
      </div>
      <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0"
        style={{ borderColor: cor, color: cor }}>
        {nota.nota}
      </div>
    </div>
  )
}

function YtIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  )
}
