import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'
import { ShareButton } from '../components/ShareButton'
import { gerarRelatorioScout } from '../lib/gerarRelatorioScout'

export default function Player() {
  const { id } = useParams()
  const pid    = Number(id)
  const player = MOCK_DATA.jogadores.find(j => j.id === pid)

  if (!player) return (
    <div className="p-8 text-gray-500 text-center">
      <div className="text-4xl mb-3">👤</div>
      <p>Jogador não encontrado.</p>
      <Link to="/scout" className="text-[#E8232A] text-sm mt-3 inline-block hover:underline">← Voltar ao Scout</Link>
    </div>
  )

  const playerLabel = player.apelido || player.nome

  type NotaItem = { nota: number; melhor_jogo: boolean; matchId: number; rodada: number; mandante: string; visitante: string; campeonato: string }
  type GolItem  = { minuto: number; tipo: string; matchId: number; rodada: number; mandante: string; visitante: string }

  const notasOrd: NotaItem[] = []
  const golsList: GolItem[]  = []

  MOCK_DATA.matches.forEach(m => {
    m.notas.forEach(n => {
      if (n.player.nome === playerLabel || n.player.nome === player.nome) {
        notasOrd.push({
          nota: n.nota, melhor_jogo: n.melhor_jogo,
          matchId: m.id, rodada: m.rodada,
          mandante: m.mandante?.nome ?? '—',
          visitante: m.visitante?.nome ?? '—',
          campeonato: m.championship?.nome ?? '',
        })
      }
    })
    m.gols.forEach(g => {
      if (g.jogador === playerLabel || g.jogador === player.nome) {
        golsList.push({
          minuto: g.minuto, tipo: g.tipo,
          matchId: m.id, rodada: m.rodada,
          mandante: m.mandante?.nome ?? '—',
          visitante: m.visitante?.nome ?? '—',
        })
      }
    })
  })
  notasOrd.sort((a, b) => b.nota - a.nota)

  const notaMedia   = notasOrd.length
    ? (notasOrd.reduce((s, n) => s + n.nota, 0) / notasOrd.length).toFixed(1)
    : null
  const melhorCount = notasOrd.filter(n => n.melhor_jogo).length
  const cor         = notaMedia
    ? (Number(notaMedia) >= 8 ? '#00D68F' : Number(notaMedia) >= 6 ? '#F5B800' : '#E8232A')
    : '#8B8FA8'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
      <Link to="/scout" className="text-gray-500 text-sm hover:text-white transition mb-6 inline-block">
        ← Scout
      </Link>

      {/* Perfil */}
      <div className="bg-gradient-to-br from-[#1A0506] to-[#0E0F15] rounded-2xl p-6 border border-white/5 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl flex-shrink-0">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-3xl text-white">{playerLabel}</div>
            {player.apelido && <div className="text-gray-500 text-sm">{player.nome}</div>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {player.posicao && (
                <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full capitalize">
                  {player.posicao}
                </span>
              )}
              <span className="text-gray-500 text-xs">{player.time}</span>
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

        <div className="grid grid-cols-3 gap-3 mt-6">
          <StatBox value={notasOrd.length} label="Avaliações" />
          <StatBox value={golsList.length} label="Gols" />
          <StatBox value={melhorCount} label="Melhor do Jogo" gold={melhorCount > 0} />
        </div>

        <div className="flex gap-3 mt-5 flex-wrap">
          <ShareButton
            titulo={`${playerLabel} — Scout Divino TV`}
            texto={`${playerLabel} — Nota média ${notaMedia || '—'} | ${golsList.length} gols | ${melhorCount}x Melhor do Jogo pela Divino TV. Veja o perfil completo:`}
          />
          <button
            onClick={() => gerarRelatorioScout({
              nome: player.nome,
              apelido: player.apelido,
              posicao: player.posicao,
              nota_media: notaMedia,
              jogos: notasOrd.length,
              gols_total: golsList.length,
              melhor_jogo_count: melhorCount,
              historico_notas: notasOrd.map(n => ({
                nota: n.nota,
                melhor_jogo: n.melhor_jogo,
                match_id: n.matchId,
                jogo: {
                  mandante: { nome: n.mandante },
                  visitante: { nome: n.visitante },
                  rodada: n.rodada,
                  championship: { nome: n.campeonato },
                },
              })),
              premios: [],
            })}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-full transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Baixar relatório scout (PDF)
          </button>
        </div>
      </div>

      {/* Histórico de notas */}
      {notasOrd.length > 0 && (
        <div className="bg-[#0E0F15] rounded-2xl overflow-hidden border border-white/5">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-gray-400">Histórico de Avaliações</h3>
          </div>
          {notasOrd.map((n, i) => {
            const nc   = Number(n.nota)
            const ncor = nc >= 8 ? '#00D68F' : nc >= 6 ? '#F5B800' : '#E8232A'
            return (
              <Link key={i} to={`/m/${n.matchId}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition">
                {n.melhor_jogo && <span className="text-yellow-400 flex-shrink-0">⭐</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">
                    {n.mandante} vs {n.visitante}
                  </div>
                  <div className="text-xs text-gray-600">
                    {n.campeonato} · Rodada {n.rodada}
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

      {/* Gols */}
      {golsList.length > 0 && (
        <div className="bg-[#0E0F15] rounded-2xl overflow-hidden border border-white/5 mt-4">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-gray-400">Gols</h3>
          </div>
          {golsList.map((g, i) => (
            <Link key={i} to={`/m/${g.matchId}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition">
              <span className="text-[#00D68F] font-bold text-sm w-10">{g.minuto}'</span>
              <span className="text-lg">⚽</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{g.mandante} vs {g.visitante}</div>
                <div className="text-xs text-gray-600">Rodada {g.rodada}</div>
              </div>
              {g.tipo !== 'normal' && (
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                  {g.tipo === 'penalti' ? 'Pênalti' : 'Contra'}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Reivindicar perfil */}
      <div className="mt-8 p-4 bg-[#0E0F15] rounded-2xl border border-dashed border-white/10 text-center">
        <div className="text-2xl mb-2">👤</div>
        <div className="font-bold text-white text-sm mb-1">Este é você?</div>
        <div className="text-xs text-gray-500 mb-4">
          Reivindique seu perfil para adicionar foto, informações e receber notificações quando for avaliado.
        </div>
        <a href={`https://wa.me/5511999999999?text=${encodeURIComponent(`Olá Divino TV! Quero reivindicar meu perfil no Divino App. Meu nome é ${player.nome}.`)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-medium rounded-full transition">
          <span>💬</span>
          Falar com a Divino TV no WhatsApp
        </a>
      </div>
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
