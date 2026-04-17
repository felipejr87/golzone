import { useParams, Link } from 'react-router-dom'
import { MOCK_DATA } from '../lib/mockData'

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
