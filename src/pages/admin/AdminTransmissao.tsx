import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { MOCK_DATA, mockJogadoresPorTime } from '../../lib/mockData'

// ─── TIPOS ────────────────────────────────────────────────
type Status = 'pre' | 'primeiro' | 'intervalo' | 'segundo' | 'encerrado'
type Aba = 'narrar' | 'elencos' | 'prejogo' | 'pontuacao'

interface Evento {
  minuto: number
  tipo: 'gol'|'amarelo'|'vermelho'|'substituicao'|'intervalo'|'acrescimo'|'inicio'|'fim'|'info'
  texto: string
  teamId?: number
}

interface PontuacaoJogador {
  jogador: any
  gols: number
  assistencias: number
  defesas: number
  amarelo: boolean
  vermelho: boolean
  nota: number | null
  melhorJogo: boolean
}

// ─── CONSTANTES ────────────────────────────────────────────
const APELIDOS_POSITIVOS: Record<string, string[]> = {
  goleiro: [
    'Mão de Aço (não deixou passar)',
    'Muralha Invencível (absoluto sob as traves)',
    'Gato Elétrico (reflexos sobrenaturais)',
    'O Intocável (ninguém passou por ele)',
    'Borracha Humana (se esticou em tudo)',
    'Guarda-Chuva (cobriu tudo hoje)',
  ],
  zagueiro: [
    'Anita (não deixou passar absolutamente ninguém)',
    'Muralha da China (intransponível)',
    'Sopa de Gesso (duro na queda)',
    'Blindagem Total (cobriu tudo)',
    'O Guardião (defendeu o território com garra)',
    'Rocha Viva (inabalável)',
  ],
  lateral: [
    'Bicuda (cruzamento na medida)',
    'Foguete pela Lateral (velocidade impressionante)',
    'Linha de Trem (foi e voltou o jogo inteiro)',
    'Ricardinho Feliz (subiu e voltou com estilo)',
    'Corredor Infinito (incansável)',
  ],
  volante: [
    'Aspirador de Pó (roubou tudo no meio)',
    'Segurança VIP (não deixou entrar)',
    'Mertiolate (tá em tudo e não machuca)',
    'Tam Gretti (viajou muito mas entregou)',
    'Central de Distribuição (jogou simples e bem)',
  ],
  meia: [
    'GPS do Campo (sempre no lugar certo)',
    'Vitamina C (presente mesmo quando ninguém viu)',
    'Soldado de Guerra (lutou cada centímetro)',
    'Fio Condutor (ligou tudo)',
    'Maestro (ditou o ritmo)',
  ],
  atacante: [
    'Foguete (quando acelerou não tinha quem parasse)',
    'Laser (mira que surpreendeu)',
    'Ninja (sumiu e apareceu na hora certa)',
    'Coração Maior que o Campo (deu tudo)',
    'Vitamina C (presente quando o time precisou)',
    'Soldado de Ouro (correu pelo time inteiro)',
  ],
}

function apelidoAleatorio(posicao: string): string {
  const lista = APELIDOS_POSITIVOS[posicao] || APELIDOS_POSITIVOS['atacante']
  return lista[Math.floor(Math.random() * lista.length)]
}

const COR_EVENTO: Record<string, string> = {
  gol:          'bg-green-500/10 border-green-500/20 text-green-300',
  amarelo:      'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
  vermelho:     'bg-red-500/10 border-red-500/20 text-red-300',
  substituicao: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  intervalo:    'bg-white/5 border-white/10 text-gray-400',
  inicio:       'bg-white/5 border-white/10 text-gray-300',
  fim:          'bg-white/5 border-white/10 text-gray-300',
  info:         'bg-white/5 border-white/10 text-gray-500',
  acrescimo:    'bg-white/5 border-white/10 text-gray-400',
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────
export default function AdminTransmissao() {
  const { id: paramId } = useParams()

  const aoVivo    = MOCK_DATA.matches.filter(m => m.status === 'em_andamento')
  const agendados = MOCK_DATA.matches.filter(m => m.status === 'agendado')
  const todos     = [...aoVivo, ...agendados]

  const [jogoId, setJogoId] = useState<number>(
    paramId ? Number(paramId) : (todos[0]?.id || 0)
  )

  const jogo = MOCK_DATA.matches.find(j => j.id === jogoId)
    || todos[0]

  // Estado do jogo
  const [status, setStatus]         = useState<Status>('pre')
  const [minuto, setMinuto]         = useState(0)
  const [acrescimo, setAcrescimo]   = useState(0)
  const [gm, setGm]                 = useState(0)
  const [gv, setGv]                 = useState(0)
  const [linkYt, setLinkYt]         = useState('')
  const [eventos, setEventos]       = useState<Evento[]>([])
  const [aba, setAba]               = useState<Aba>('narrar')
  const [escalacaoGerada, setEscalacaoGerada] = useState('')
  const [gerando, setGerando]       = useState(false)
  const [jogadorOverlay, setJogadorOverlay]   = useState<any>(null)
  const [pontuacoes, setPontuacoes] = useState<Record<number, PontuacaoJogador>>({})

  // Timer de jogo
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (status === 'primeiro' || status === 'segundo') {
      timerRef.current = setInterval(() => setMinuto(m => m + 1), 60000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  // Jogadores por time
  const mandanteJogs  = mockJogadoresPorTime(jogo?.mandante_id)
  const visitanteJogs = mockJogadoresPorTime(jogo?.visitante_id)
  const todosJogs     = [...mandanteJogs, ...visitanteJogs]

  function getPontuacao(jogador: any): PontuacaoJogador {
    return pontuacoes[jogador.id] || {
      jogador, gols: 0, assistencias: 0, defesas: 0,
      amarelo: false, vermelho: false, nota: null, melhorJogo: false,
    }
  }

  function setPontuacaoJogador(jogadorId: number, patch: Partial<PontuacaoJogador>) {
    setPontuacoes(prev => ({
      ...prev,
      [jogadorId]: { ...getPontuacao({ id: jogadorId }), ...patch },
    }))
  }

  function addEvento(tipo: Evento['tipo'], texto: string, teamId?: number) {
    setEventos(prev => [{ minuto, tipo, texto, teamId }, ...prev])
  }

  function iniciarPartida() {
    setStatus('primeiro')
    setMinuto(0)
    addEvento('inicio', '🟢 Partida iniciada!')
  }

  function iniciarSegundoTempo() {
    setStatus('segundo')
    setMinuto(46)
    addEvento('inicio', '⚽ Segundo tempo iniciado!')
  }

  function encerrar() {
    setStatus('encerrado')
    addEvento('fim', `🏁 Jogo encerrado! Placar final: ${gm} × ${gv}`)
    setAba('pontuacao')
  }

  function marcarGol(isM: boolean, nomeTime: string) {
    if (isM) setGm(g => g + 1); else setGv(g => g + 1)
    addEvento('gol', `⚽ GOL! ${nomeTime}`, isM ? jogo?.mandante_id : jogo?.visitante_id)
  }

  async function gerarEscalacao() {
    setGerando(true)
    setAba('pontuacao')
    await new Promise(r => setTimeout(r, 1000))

    const usados: number[] = []
    function pegar(posicao: string): string {
      const lista = todosJogs.filter(j => !usados.includes(j.id))
      const c = lista.find(j => j.posicao === posicao) || lista[0]
      if (!c) return `Jogador, o ${apelidoAleatorio(posicao)}`
      usados.push(c.id)
      const p = pontuacoes[c.id]
      const notaStr = p?.nota ? ` (nota ${p.nota})` : ''
      return `${c.apelido || c.nome}${notaStr}, o ${apelidoAleatorio(posicao)}`
    }

    const artilheiro = Object.values(pontuacoes)
      .filter(p => p.gols > 0)
      .sort((a, b) => b.gols - a.gols)[0]

    const melhor = Object.values(pontuacoes).find(p => p.melhorJogo)
      || Object.values(pontuacoes).sort((a, b) => (b.nota || 0) - (a.nota || 0))[0]

    const txt = `🎙️ E AÍ GALERA, VEM AÍ A ESCALAÇÃO DIVINOTV!
por Alê Oliveira

⬛ NA META:
🧤 ${pegar('goleiro')}

🛡️ NA ZAGA:
📌 ${pegar('zagueiro')}
📌 ${pegar('zagueiro')}

🏃 NAS LATERAIS:
📌 ${pegar('lateral')} (direita)
📌 ${pegar('lateral')} (esquerda)

⚙️ NO MEIO:
⚡ ${pegar('volante')}
⚡ ${pegar('volante')}
⚡ ${pegar('meia')}

🔥 NO ATAQUE:
💥 ${pegar('meia')}
💥 ${pegar('atacante')}
💥 ${pegar('atacante')}

━━━━━━━━━━━━━━━━━━
🏆 Placar final: ${jogo?.mandante?.nome} ${gm} × ${gv} ${jogo?.visitante?.nome}
${artilheiro ? `⚽ Artilheiro: ${artilheiro.jogador.apelido || artilheiro.jogador.nome} (${artilheiro.gols} gol${artilheiro.gols > 1 ? 's' : ''})` : ''}
${melhor ? `⭐ Melhor em campo: ${melhor.jogador.apelido || melhor.jogador.nome}` : ''}

Isso foi Divino App! Futebol de verdade! 🎙️⚽`.trim()

    setEscalacaoGerada(txt)
    setGerando(false)
  }

  const STATUS_LABEL: Record<Status, { txt: string; cor: string }> = {
    pre:       { txt: 'Pré-jogo',  cor: 'text-gray-500' },
    primeiro:  { txt: '1º Tempo',  cor: 'text-green-400' },
    intervalo: { txt: 'Intervalo', cor: 'text-yellow-400' },
    segundo:   { txt: '2º Tempo',  cor: 'text-green-400' },
    encerrado: { txt: 'Encerrado', cor: 'text-gray-600' },
  }

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-0">

      {/* SELETOR */}
      <div className="px-3 pt-3 pb-2">
        <select value={jogoId} onChange={e => setJogoId(Number(e.target.value))}
          className="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-red-500 transition">
          {todos.map(j => (
            <option key={j.id} value={j.id}>
              {j.mandante?.nome} vs {j.visitante?.nome} — R{j.rodada} · {j.championship?.nome}
            </option>
          ))}
        </select>
      </div>

      {/* PAINEL DO PLACAR */}
      {jogo && (
        <div className="mx-3 mb-2 rounded-2xl overflow-hidden border border-red-900/30"
          style={{ background: 'linear-gradient(160deg,#1A0305 0%,#0D0D12 60%)' }}>

          {/* Status + minuto */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              {(status === 'primeiro' || status === 'segundo') && (
                <span className="w-2 h-2 bg-red-500 rounded-full badge-live" />
              )}
              <span className={`text-xs font-condensed tracking-widest ${STATUS_LABEL[status].cor}`}>
                {STATUS_LABEL[status].txt}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="font-mono">{String(minuto).padStart(2, '0')}'</span>
              {acrescimo > 0 && (
                <span className="text-yellow-400 font-bold ml-1">+{acrescimo}'</span>
              )}
            </div>
          </div>

          {/* Placar */}
          <div className="flex items-center justify-center gap-3 px-3 py-2">
            {/* Mandante */}
            <div className="flex-1">
              <div className="text-white font-bold text-sm text-center leading-tight mb-2">
                {jogo.mandante?.nome}
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => setGm(g => Math.max(0, g - 1))}
                  className="w-8 h-8 bg-white/8 hover:bg-white/15 rounded-lg text-gray-400 text-lg font-bold active:scale-90 transition">−</button>
                <span className="font-display text-5xl text-white w-12 text-center leading-none">{gm}</span>
                <button onClick={() => marcarGol(true, jogo.mandante?.nome || '')}
                  className="w-8 h-8 bg-red-500/25 border border-red-500/40 hover:bg-red-500/40 rounded-lg text-red-400 text-lg font-bold active:scale-90 transition">+</button>
              </div>
            </div>

            <span className="font-display text-2xl text-gray-800 pb-1">:</span>

            {/* Visitante */}
            <div className="flex-1">
              <div className="text-white font-bold text-sm text-center leading-tight mb-2">
                {jogo.visitante?.nome}
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <button onClick={() => marcarGol(false, jogo.visitante?.nome || '')}
                  className="w-8 h-8 bg-red-500/25 border border-red-500/40 hover:bg-red-500/40 rounded-lg text-red-400 text-lg font-bold active:scale-90 transition">+</button>
                <span className="font-display text-5xl text-white w-12 text-center leading-none">{gv}</span>
                <button onClick={() => setGv(g => Math.max(0, g - 1))}
                  className="w-8 h-8 bg-white/8 hover:bg-white/15 rounded-lg text-gray-400 text-lg font-bold active:scale-90 transition">−</button>
              </div>
            </div>
          </div>

          {/* Acréscimos + controles */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/5">
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-gray-600">+</span>
              <button onClick={() => setAcrescimo(a => Math.max(0, a - 1))}
                className="w-6 h-6 bg-white/5 rounded text-gray-500 text-xs active:scale-90 transition">−</button>
              <span className="text-yellow-400 font-mono text-sm w-5 text-center">{acrescimo}'</span>
              <button onClick={() => { const n = acrescimo + 1; setAcrescimo(n); addEvento('acrescimo', `+${n}' de acréscimo`) }}
                className="w-6 h-6 bg-white/5 rounded text-gray-500 text-xs active:scale-90 transition">+</button>
            </div>

            <div className="flex-1 flex gap-1.5 justify-end">
              {status === 'pre' && (
                <button onClick={iniciarPartida}
                  className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-xl active:scale-95 transition">
                  ▶ Iniciar
                </button>
              )}
              {status === 'primeiro' && (
                <button onClick={() => { setStatus('intervalo'); addEvento('intervalo', '⏸ Intervalo') }}
                  className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-xl active:scale-95 transition">
                  ⏸ Intervalo
                </button>
              )}
              {status === 'intervalo' && (
                <button onClick={iniciarSegundoTempo}
                  className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-xl active:scale-95 transition">
                  ▶ 2º Tempo
                </button>
              )}
              {status === 'segundo' && (
                <button onClick={encerrar}
                  className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl active:scale-95 transition">
                  🏁 Encerrar
                </button>
              )}
              {status === 'encerrado' && (
                <button onClick={gerarEscalacao}
                  className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-xl active:scale-95 transition">
                  🎙️ Escalação
                </button>
              )}
            </div>
          </div>

          {/* Link YouTube */}
          <div className="px-3 pb-3">
            <input value={linkYt} onChange={e => setLinkYt(e.target.value)}
              placeholder="🔴  Link YouTube da transmissão"
              className="w-full bg-black/30 border border-red-900/25 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-red-500 placeholder-red-900/60 transition" />
          </div>
        </div>
      )}

      {/* ABAS */}
      <div className="flex overflow-x-auto border-b border-white/5 bg-[#0A0A0D] px-1 flex-shrink-0"
        style={{ scrollbarWidth: 'none' }}>
        {([
          { key: 'narrar',    icon: '📢', label: 'Narrar'    },
          { key: 'elencos',   icon: '👥', label: 'Elencos'   },
          { key: 'prejogo',   icon: '📋', label: 'Pré-Jogo'  },
          { key: 'pontuacao', icon: '⭐', label: 'Pontuação' },
        ] as const).map(a => (
          <button key={a.key} onClick={() => setAba(a.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-condensed tracking-wider border-b-2 transition whitespace-nowrap ${
              aba === a.key
                ? 'border-red-500 text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}>
            <span>{a.icon}</span><span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto">

        {/* ABA NARRAR */}
        {aba === 'narrar' && (
          <div className="px-3 py-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🟨', label: 'Cartão Amarelo', tipo: 'amarelo'      as const, cor: 'border-yellow-500/25 text-yellow-300 hover:bg-yellow-500/10' },
                { icon: '🟥', label: 'Cartão Vermelho', tipo: 'vermelho'     as const, cor: 'border-red-500/25 text-red-300 hover:bg-red-500/10' },
                { icon: '⏱️', label: 'Intervalo',       tipo: 'intervalo'    as const, cor: 'border-blue-500/25 text-blue-300 hover:bg-blue-500/10' },
                { icon: '🔄', label: 'Substituição',    tipo: 'substituicao' as const, cor: 'border-green-500/25 text-green-300 hover:bg-green-500/10' },
                { icon: '🏁', label: 'Fim de jogo',     tipo: 'fim'          as const, cor: 'border-white/15 text-gray-300 hover:bg-white/8' },
                { icon: '⚠️', label: 'Paralisação',    tipo: 'info'         as const, cor: 'border-orange-500/25 text-orange-300 hover:bg-orange-500/10' },
              ].map(btn => (
                <button key={btn.label}
                  onClick={() => addEvento(btn.tipo, `${btn.icon} ${btn.label}`)}
                  className={`py-3 bg-[#0E0F15] border rounded-xl text-xs font-medium transition active:scale-95 flex flex-col items-center gap-1.5 ${btn.cor}`}>
                  <span className="text-2xl leading-none">{btn.icon}</span>
                  <span className="text-center leading-tight">{btn.label}</span>
                </button>
              ))}
            </div>

            <button onClick={gerarEscalacao}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl text-sm active:scale-98 transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2">
              <span className="text-lg">🎙️</span>
              Gerar Escalação DivinoTV
            </button>

            {eventos.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-gray-600 uppercase tracking-wider">Feed do jogo</div>
                {eventos.map((e, i) => (
                  <div key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${COR_EVENTO[e.tipo] || COR_EVENTO.info}`}>
                    <span className="font-mono text-gray-600 flex-shrink-0 w-7">{String(e.minuto).padStart(2, '0')}'</span>
                    <span>{e.texto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA ELENCOS */}
        {aba === 'elencos' && (
          <div className="px-3 py-3">
            {[
              { time: jogo?.mandante,  jogadores: mandanteJogs },
              { time: jogo?.visitante, jogadores: visitanteJogs },
            ].map(({ time, jogadores }) => time && (
              <div key={time.id} className="mb-5">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center text-xs font-bold text-red-400">
                    {time.nome?.slice(0, 1)}
                  </div>
                  <h3 className="font-bold text-white text-sm">{time.nome}</h3>
                  <span className="text-xs text-gray-600 ml-auto">{jogadores.length} jogadores</span>
                </div>

                {jogadores.length === 0 ? (
                  <p className="text-xs text-gray-600 px-1 py-2">Nenhum jogador cadastrado.</p>
                ) : (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 gap-1 px-3 pb-1">
                      <span className="col-span-1 text-xs text-gray-700">#</span>
                      <span className="col-span-5 text-xs text-gray-700">Jogador</span>
                      <span className="col-span-2 text-xs text-gray-700 text-center">⚽</span>
                      <span className="col-span-2 text-xs text-gray-700 text-center">🟨</span>
                      <span className="col-span-2 text-xs text-gray-700 text-center">Nota</span>
                    </div>
                    {jogadores.map((j: any, idx: number) => {
                      const p = getPontuacao(j)
                      const corNota = p.nota
                        ? p.nota >= 8 ? 'text-green-400' : p.nota >= 6 ? 'text-yellow-400' : 'text-red-400'
                        : 'text-gray-700'
                      return (
                        <button key={j.id}
                          onClick={() => setJogadorOverlay(j)}
                          className="w-full grid grid-cols-12 gap-1 items-center px-3 py-2.5 bg-[#0E0F15] hover:bg-[#161820] rounded-xl border border-white/5 hover:border-red-500/20 transition active:scale-98 text-left">
                          <span className="col-span-1 text-xs text-gray-600">{idx + 1}</span>
                          <div className="col-span-5 min-w-0">
                            <div className="font-medium text-white text-sm truncate">{j.apelido || j.nome}</div>
                            <div className="text-xs text-gray-600 capitalize">{j.posicao}</div>
                          </div>
                          <span className="col-span-2 text-center text-sm">{p.gols > 0 ? `⚽${p.gols}` : ''}</span>
                          <span className="col-span-2 text-center text-sm">
                            {p.amarelo ? '🟨' : ''}{p.vermelho ? '🟥' : ''}
                          </span>
                          <span className={`col-span-2 text-center font-bold text-sm ${corNota}`}>
                            {p.nota ?? '—'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA PRÉ-JOGO */}
        {aba === 'prejogo' && (
          <div className="px-3 py-3 space-y-4">
            <div className="bg-[#0E0F15] rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-3">Informações</div>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Campeonato', val: jogo?.championship?.nome },
                  { label: 'Rodada',     val: jogo?.rodada },
                  { label: 'Local',      val: (jogo as any)?.local || '—' },
                  { label: 'Data',       val: jogo?.data_hora
                    ? new Date(jogo.data_hora).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
                    : '—'
                  },
                ].map(r => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="text-white font-medium">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0E0F15] rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-3">Confrontos diretos (histórico)</div>
              {[
                { data:'12/03/2026', m:2, v:1, camp:'Copa Divino TV' },
                { data:'28/01/2026', m:0, v:0, camp:'Liga ABC'       },
                { data:'15/10/2025', m:3, v:2, camp:'Copa Divino TV' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-600 w-20 flex-shrink-0">{c.data}</span>
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <span className="text-white font-bold text-sm">{c.m}</span>
                    <span className="text-gray-700 text-xs">×</span>
                    <span className="text-white font-bold text-sm">{c.v}</span>
                  </div>
                  <span className="text-xs text-gray-600 text-right flex-shrink-0">{c.camp}</span>
                </div>
              ))}
              <div className="mt-3 grid grid-cols-3 gap-2 pt-2">
                {[
                  { label:'Vitórias', val: 2, cor:'text-green-400' },
                  { label:'Empates',  val: 1, cor:'text-yellow-400' },
                  { label:'Derrotas', val: 0, cor:'text-red-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className={`font-bold text-xl ${s.cor}`}>{s.val}</div>
                    <div className="text-xs text-gray-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0E0F15] rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-3">Escalação prevista</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-white mb-2">{jogo?.mandante?.nome}</div>
                  {mandanteJogs.slice(0, 6).map((j: any, i: number) => (
                    <div key={j.id} className="flex items-center gap-1.5 py-1">
                      <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                      <span className="text-white text-xs">{j.apelido || j.nome}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-white mb-2">{jogo?.visitante?.nome}</div>
                  {visitanteJogs.slice(0, 6).map((j: any, i: number) => (
                    <div key={j.id} className="flex items-center gap-1.5 py-1">
                      <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                      <span className="text-white text-xs">{j.apelido || j.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0E0F15] rounded-2xl p-4 border border-white/5">
              <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Notas do narrador</div>
              <textarea
                placeholder="Anotações sobre o jogo, contexto, curiosidades..."
                rows={4}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-red-500 transition resize-none placeholder-gray-700" />
            </div>
          </div>
        )}

        {/* ABA PONTUAÇÃO */}
        {aba === 'pontuacao' && (
          <div className="px-3 py-3">
            {/* Escalação gerada */}
            {escalacaoGerada && (
              <div className="mb-4 bg-[#0E0F15] rounded-2xl border border-red-900/30 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎙️</span>
                    <div>
                      <div className="font-bold text-white text-sm">Escalação DivinoTV</div>
                      <div className="text-xs text-gray-600">por Alê Oliveira</div>
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(escalacaoGerada)}
                    className="text-xs text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                    Copiar
                  </button>
                </div>
                <div className="px-4 py-3">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {escalacaoGerada}
                  </pre>
                </div>
                <div className="px-4 pb-3">
                  <button onClick={gerarEscalacao}
                    className="w-full py-2.5 border border-white/8 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition">
                    🎲 Gerar novamente
                  </button>
                </div>
              </div>
            )}

            {!escalacaoGerada && !gerando && (
              <button onClick={gerarEscalacao}
                className="w-full py-4 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-xl text-sm active:scale-98 transition flex items-center justify-center gap-2">
                <span>🎙️</span> Gerar Escalação DivinoTV
              </button>
            )}

            {gerando && (
              <div className="text-center py-8 mb-4">
                <div className="text-4xl mb-3 animate-pulse">🎙️</div>
                <div className="text-sm text-red-400 font-bold">Gerando escalação...</div>
              </div>
            )}

            {/* Legenda */}
            <div className="flex gap-3 mb-3 px-1 flex-wrap text-xs text-gray-600">
              <span>⚽ Gol = 8pts</span>
              <span>🎯 Assist = 5pts</span>
              <span>🧤 Defesa = 3pts</span>
              <span>🟨 Amarelo = −2</span>
              <span>🟥 Vermelho = −5</span>
            </div>

            {/* Ranking */}
            <div className="text-xs text-gray-600 uppercase tracking-wider mb-2 px-1">Pontuação dos Jogadores</div>
            <div className="space-y-1.5">
              {todosJogs
                .map((j: any) => {
                  const p = getPontuacao(j)
                  const pts =
                    (p.gols * 8) + (p.assistencias * 5) + (p.defesas * 3) +
                    (p.nota ? Math.round((p.nota - 5) * 2) : 0) +
                    (p.amarelo ? -2 : 0) + (p.vermelho ? -5 : 0)
                  return { j, p, pts }
                })
                .sort((a, b) => b.pts - a.pts)
                .map(({ j, p, pts }, idx) => (
                  <button key={j.id}
                    onClick={() => setJogadorOverlay(j)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#0E0F15] hover:bg-[#161820] rounded-xl border border-white/5 hover:border-red-500/15 transition active:scale-98 text-left">
                    <span className={`w-5 text-center font-bold text-sm flex-shrink-0 ${idx < 3 ? 'text-yellow-400' : 'text-gray-700'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{j.apelido || j.nome}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.gols > 0 && <span className="text-xs text-green-400">⚽{p.gols}</span>}
                        {p.assistencias > 0 && <span className="text-xs text-blue-400">🎯{p.assistencias}</span>}
                        {p.defesas > 0 && <span className="text-xs text-purple-400">🧤{p.defesas}</span>}
                        {p.amarelo && <span className="text-xs">🟨</span>}
                        {p.vermelho && <span className="text-xs">🟥</span>}
                        {p.melhorJogo && <span className="text-xs text-yellow-400">⭐</span>}
                      </div>
                    </div>
                    {p.nota && (
                      <span className={`text-xs font-bold flex-shrink-0 ${p.nota >= 8 ? 'text-green-400' : p.nota >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {p.nota}
                      </span>
                    )}
                    <div className={`flex-shrink-0 w-12 text-center font-bold rounded-lg py-1 text-sm ${pts >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {pts > 0 ? '+' : ''}{pts}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY DO JOGADOR */}
      {jogadorOverlay && (
        <JogadorOverlay
          jogador={jogadorOverlay}
          pontuacao={getPontuacao(jogadorOverlay)}
          onSave={patch => {
            setPontuacaoJogador(jogadorOverlay.id, patch)
            if (patch.gols !== undefined) {
              const delta = (patch.gols || 0) - getPontuacao(jogadorOverlay).gols
              if (delta > 0) addEvento('gol', `⚽ Gol de ${jogadorOverlay.apelido || jogadorOverlay.nome}`)
            }
          }}
          onFechar={() => setJogadorOverlay(null)}
        />
      )}
    </div>
  )
}

// ─── OVERLAY DO JOGADOR ────────────────────────────────────
function JogadorOverlay({ jogador, pontuacao, onSave, onFechar }: {
  jogador: any
  pontuacao: PontuacaoJogador
  onSave: (p: Partial<PontuacaoJogador>) => void
  onFechar: () => void
}) {
  const [local, setLocal] = useState<PontuacaoJogador>({ ...pontuacao })

  const corNota = local.nota
    ? local.nota >= 8 ? '#00D68F' : local.nota >= 6 ? '#F5B800' : '#E8232A'
    : '#3D4055'

  const pts =
    (local.gols * 8) + (local.assistencias * 5) + (local.defesas * 3) +
    (local.nota ? Math.round((local.nota - 5) * 2) : 0) +
    (local.amarelo ? -2 : 0) + (local.vermelho ? -5 : 0)

  function salvar() {
    onSave(local)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative w-full max-h-[90vh] overflow-y-auto bg-[#0D0D14] rounded-t-3xl border-t border-white/10"
        onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 bg-[#0D0D14] pt-4 pb-2 px-5 z-10">
          <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-1" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-bold text-gray-400 font-condensed tracking-wider flex-shrink-0">
              {(jogador.apelido || jogador.nome)?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-lg truncate">{jogador.apelido || jogador.nome}</div>
              <div className="text-gray-500 text-xs">{jogador.nome}</div>
              <div className="text-red-400 text-xs font-condensed uppercase tracking-wide">{jogador.posicao}</div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className={`text-2xl font-bold ${pts >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pts > 0 ? '+' : ''}{pts}
              </div>
              <div className="text-xs text-gray-600">pts</div>
            </div>
          </div>

          {/* Ações com contador */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {([
              { label: 'Gol',     icon: '⚽', campo: 'gols'        as const, bg: 'bg-green-500/10  border-green-500/20',  txt: 'text-green-400'  },
              { label: 'Assist.', icon: '🎯', campo: 'assistencias' as const, bg: 'bg-blue-500/10   border-blue-500/20',   txt: 'text-blue-400'   },
              { label: 'Defesa',  icon: '🧤', campo: 'defesas'      as const, bg: 'bg-purple-500/10 border-purple-500/20', txt: 'text-purple-400' },
            ] as const).map(btn => (
              <div key={btn.campo}
                className={`flex flex-col items-center gap-1 p-2.5 border rounded-xl ${btn.bg}`}>
                <span className="text-xl">{btn.icon}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setLocal(l => ({ ...l, [btn.campo]: Math.max(0, l[btn.campo] - 1) }))}
                    className="w-5 h-5 bg-white/10 rounded text-xs active:scale-90">−</button>
                  <span className={`font-bold text-sm w-4 text-center ${btn.txt}`}>{local[btn.campo]}</span>
                  <button onClick={() => setLocal(l => ({ ...l, [btn.campo]: l[btn.campo] + 1 }))}
                    className="w-5 h-5 bg-white/10 rounded text-xs active:scale-90">+</button>
                </div>
                <span className="text-xs text-gray-600">{btn.label}</span>
              </div>
            ))}

            {/* Melhor do jogo */}
            <button onClick={() => setLocal(l => ({ ...l, melhorJogo: !l.melhorJogo }))}
              className={`flex flex-col items-center gap-1 p-2.5 border rounded-xl transition ${local.melhorJogo ? 'bg-yellow-500/15 border-yellow-500/30' : 'bg-white/3 border-white/10'}`}>
              <span className="text-xl">⭐</span>
              <span className={`text-xs font-bold ${local.melhorJogo ? 'text-yellow-400' : 'text-gray-600'}`}>
                {local.melhorJogo ? 'Melhor!' : 'Melhor'}
              </span>
              <span className="text-xs text-gray-600">do jogo</span>
            </button>
          </div>

          {/* Cartões */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setLocal(l => ({ ...l, amarelo: !l.amarelo }))}
              className={`flex-1 py-2.5 border rounded-xl text-sm font-bold transition ${local.amarelo ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-white/3 border-white/8 text-gray-500'}`}>
              🟨 Amarelo
            </button>
            <button onClick={() => setLocal(l => ({ ...l, vermelho: !l.vermelho }))}
              className={`flex-1 py-2.5 border rounded-xl text-sm font-bold transition ${local.vermelho ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/3 border-white/8 text-gray-500'}`}>
              🟥 Vermelho
            </button>
          </div>

          {/* Nota */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Nota DivinoTV</span>
              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
                style={{ borderColor: corNota, color: corNota }}>
                {local.nota ?? '—'}
              </div>
            </div>
            <input type="range" min="1" max="10" step="0.5"
              value={local.nota ?? 5}
              onChange={e => setLocal(l => ({ ...l, nota: Number(e.target.value) }))}
              className="w-full accent-red-500" />
            <div className="flex justify-between text-xs text-gray-700 mt-1">
              <span>1 — Ruim</span><span>5 — OK</span><span>10 — Fenômeno</span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button onClick={onFechar}
              className="flex-1 py-3 border border-white/8 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition">
              Cancelar
            </button>
            <button onClick={salvar}
              className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-sm active:scale-98 transition">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
