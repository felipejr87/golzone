import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MOCK_DATA, mockJogadoresPorTime } from '../../lib/mockData'

type Aba = 'transmissao' | 'elenco' | 'escalacao'

const APELIDOS: Record<string, string[]> = {
  goleiro: [
    'Mão de Boneca de Pano (não segurou nada)',
    'Proctologista (operou milagres lá atrás)',
    'Porta Aberta (não tinha chave pra fechar)',
    'Detetive Vegano (não pegou nada)',
    'WiFi Fraco (caiu na hora que precisava)',
  ],
  zagueiro: [
    'IML (só atua no corpo)',
    'Sopa de Gesso (duro como pedra)',
    'Anita (não deixa passar ninguém)',
    'Gessinho (engessado mas presente)',
    'Muralha da China (intransponível hoje)',
  ],
  lateral: [
    'Cão Castrado (não cruzou mais)',
    'Cheque sem Fundo (prometeu e não entregou)',
    'Ricardinho Feliz (foi lá e voltou)',
    'Trem Bala (quando atacou, atacou)',
    'Bicuda (chute na trave e chute na certa)',
  ],
  volante: [
    'Caçamba (só jogou pra trás)',
    'Mertiolate (não machuca mas incomoda)',
    'Aspirador de Pó (roubou tudo no meio)',
    'Tam Gretti (viajou mas chegou)',
    'Segurança de Boate (não deixou entrar)',
  ],
  meia: [
    'Vitamina C (presente mesmo quando ninguém viu)',
    'Soldado de Guerra (lutou até o fim)',
    'GPS (sempre no lugar certo)',
    'Twitter do Presidente (falou, não fez, mas animou)',
    'Camisinha (às vezes necessário)',
  ],
  atacante: [
    'Foguete (quando acelerou, não tinha quem parasse)',
    'Raio Laser (mira que impressionou)',
    'Vitamina C (presente mesmo quando ninguém viu)',
    'Ninja (sumiu e apareceu na hora certa)',
    'Soldado de Guerra (coração maior que o campo)',
  ],
}

function apelidoAleatorio(posicao: string) {
  const lista = APELIDOS[posicao] || APELIDOS['atacante']
  return lista[Math.floor(Math.random() * lista.length)]
}

export default function AdminTransmissao() {
  const { id: paramId } = useParams()
  const aoVivo = MOCK_DATA.matches.filter(m => m.status === 'em_andamento')
  const agendados = MOCK_DATA.matches.filter(m => m.status === 'agendado')
  const todos = [...aoVivo, ...agendados]

  const [jogoId, setJogoId] = useState<number>(
    paramId ? Number(paramId) : (aoVivo[0]?.id || todos[0]?.id || 0)
  )
  const [aba, setAba] = useState<Aba>('transmissao')
  const [placar, setPlacar] = useState({ gm: 0, gv: 0 })
  const [eventos, setEventos] = useState<{ hora: string; txt: string; tipo: string }[]>([])
  const [linkYt, setLinkYt] = useState('')
  const [jogadorSelecionado, setJogadorSelecionado] = useState<any>(null)
  const [notasJogadores, setNotasJogadores] = useState<Record<number, number>>({})
  const [golsJogadores, setGolsJogadores] = useState<Record<number, number>>({})
  const [cartoesJogadores, setCartoesJogadores] = useState<Record<number, string>>({})
  const [escalacaoGerada, setEscalacaoGerada] = useState('')
  const [gerando, setGerando] = useState(false)

  const jogo = todos.find(j => j.id === jogoId)
  const mandanteJogadores = mockJogadoresPorTime(jogo?.mandante_id)
  const visitanteJogadores = mockJogadoresPorTime(jogo?.visitante_id)
  const todosJogadoresJogo = [...mandanteJogadores, ...visitanteJogadores]

  function addEvento(txt: string, tipo = 'info') {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setEventos(prev => [{ hora, txt, tipo }, ...prev].slice(0, 30))
  }

  function atribuirPonto(jogador: any, tipo: 'gol' | 'assistencia' | 'defesa' | 'cartao_a' | 'cartao_v') {
    if (tipo === 'gol') {
      setGolsJogadores(g => ({ ...g, [jogador.id]: (g[jogador.id] || 0) + 1 }))
      const isM = jogador.team_id === jogo?.mandante_id
      setPlacar(p => isM ? { ...p, gm: p.gm + 1 } : { ...p, gv: p.gv + 1 })
      const nomeTime = isM ? jogo?.mandante?.nome : jogo?.visitante?.nome
      addEvento(`⚽ GOL! ${jogador.apelido || jogador.nome} (${nomeTime})`, 'gol')
    } else if (tipo === 'cartao_a') {
      setCartoesJogadores(c => ({ ...c, [jogador.id]: 'cartao_a' }))
      addEvento(`🟨 Amarelo — ${jogador.apelido || jogador.nome}`, 'cartao')
    } else if (tipo === 'cartao_v') {
      setCartoesJogadores(c => ({ ...c, [jogador.id]: 'cartao_v' }))
      addEvento(`🟥 Vermelho — ${jogador.apelido || jogador.nome}`, 'cartao')
    } else if (tipo === 'assistencia') {
      addEvento(`🎯 Assistência — ${jogador.apelido || jogador.nome}`, 'info')
    } else if (tipo === 'defesa') {
      addEvento(`🧤 Defesa — ${jogador.apelido || jogador.nome}`, 'info')
    }
  }

  async function gerarEscalacao() {
    setGerando(true)
    setAba('escalacao')
    await new Promise(r => setTimeout(r, 1200))

    const nomesUsados: string[] = []
    function jogadorParaPosicao(posicao: string): string {
      const j = todosJogadoresJogo.find(x =>
        x.posicao === posicao && !nomesUsados.includes(x.nome)
      ) || todosJogadoresJogo.find(x => !nomesUsados.includes(x.nome))
      if (j) {
        nomesUsados.push(j.nome)
        const nota = notasJogadores[j.id]
        const notaStr = nota ? ` [${nota}]` : ''
        return `${j.apelido || j.nome}${notaStr}, o ${apelidoAleatorio(posicao)}`
      }
      return `Jogador Misterioso, o ${apelidoAleatorio(posicao)}`
    }

    const texto = `🎙️ E AÍ GALERA, VEM AÍ A ESCALAÇÃO DIVINOTV!

⬛ NA META:
🧤 ${jogadorParaPosicao('goleiro')}

🛡️ NA DEFESA:
📌 ${jogadorParaPosicao('zagueiro')}
📌 ${jogadorParaPosicao('zagueiro')}
📌 ${jogadorParaPosicao('lateral')} (pelo direito)
📌 ${jogadorParaPosicao('lateral')} (pelo esquerdo)

⚙️ NO MEIO:
⚡ ${jogadorParaPosicao('volante')}
⚡ ${jogadorParaPosicao('volante')}
⚡ ${jogadorParaPosicao('meia')}

🔥 NO ATAQUE:
💥 ${jogadorParaPosicao('meia')}
💥 ${jogadorParaPosicao('atacante')}
💥 ${jogadorParaPosicao('atacante')}

Resultado: ${jogo?.mandante?.nome} ${placar.gm} × ${placar.gv} ${jogo?.visitante?.nome}

Isso foi Divino App! Até a próxima! 🎙️⚽`.trim()

    setEscalacaoGerada(texto)
    setGerando(false)
  }

  const corEvento: Record<string, string> = {
    gol: 'text-green-400 border-green-500/20 bg-green-500/5',
    cartao: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    info: 'text-gray-400 border-white/5 bg-white/3',
  }

  return (
    <div className="max-w-xl mx-auto">

      {/* Seletor de jogo */}
      <div className="px-4 py-3 border-b border-white/5">
        <select value={jogoId} onChange={e => setJogoId(Number(e.target.value))}
          className="w-full bg-[#0E0F15] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 transition">
          <option value={0}>Selecionar jogo...</option>
          {todos.map(j => (
            <option key={j.id} value={j.id}>
              {j.mandante?.nome} vs {j.visitante?.nome} — R{j.rodada}
            </option>
          ))}
        </select>
      </div>

      {jogo && (
        <>
          {/* Placar destaque */}
          <div className="bg-gradient-to-b from-[#1A0506] to-[#0E0F15] border-b border-red-900/30">
            <div className="text-center py-2">
              <span className="flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full badge-live" />
                <span className="text-red-400 text-xs font-condensed tracking-widest">AO VIVO</span>
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 pb-4 px-4">
              {/* Mandante */}
              <div className="flex-1 text-right">
                <div className="font-bold text-white text-sm leading-tight mb-3">{jogo.mandante?.nome}</div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setPlacar(p => ({ ...p, gm: Math.max(0, p.gm - 1) }))}
                    className="w-10 h-10 bg-white/8 hover:bg-white/15 rounded-xl text-xl font-bold text-gray-400 active:scale-95 transition">−</button>
                  <span className="font-display text-6xl text-white w-14 text-center">{placar.gm}</span>
                  <button onClick={() => { setPlacar(p => ({ ...p, gm: p.gm + 1 })); addEvento(`⚽ GOL! ${jogo.mandante?.nome}`, 'gol') }}
                    className="w-10 h-10 bg-red-500/25 border border-red-500/40 hover:bg-red-500/40 rounded-xl text-xl font-bold text-red-400 active:scale-95 transition">+</button>
                </div>
              </div>

              <span className="font-display text-3xl text-gray-800 mx-2">:</span>

              {/* Visitante */}
              <div className="flex-1 text-left">
                <div className="font-bold text-white text-sm leading-tight mb-3">{jogo.visitante?.nome}</div>
                <div className="flex items-center justify-start gap-2">
                  <button onClick={() => { setPlacar(p => ({ ...p, gv: p.gv + 1 })); addEvento(`⚽ GOL! ${jogo.visitante?.nome}`, 'gol') }}
                    className="w-10 h-10 bg-red-500/25 border border-red-500/40 hover:bg-red-500/40 rounded-xl text-xl font-bold text-red-400 active:scale-95 transition">+</button>
                  <span className="font-display text-6xl text-white w-14 text-center">{placar.gv}</span>
                  <button onClick={() => setPlacar(p => ({ ...p, gv: Math.max(0, p.gv - 1) }))}
                    className="w-10 h-10 bg-white/8 hover:bg-white/15 rounded-xl text-xl font-bold text-gray-400 active:scale-95 transition">−</button>
                </div>
              </div>
            </div>

            {/* Link YouTube */}
            <div className="px-4 pb-3">
              <input value={linkYt} onChange={e => setLinkYt(e.target.value)}
                placeholder="🔴 Cole o link do YouTube aqui"
                className="w-full bg-black/30 border border-red-900/30 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-red-500 placeholder-red-900/60 transition" />
            </div>
          </div>

          {/* Abas */}
          <div className="flex border-b border-white/5 bg-[#0A0A0D]">
            {([
              { key: 'transmissao', icon: '📢', label: 'Narração'  },
              { key: 'elenco',      icon: '👥', label: 'Elenco'    },
              { key: 'escalacao',   icon: '🎙️', label: 'Escalação' },
            ] as const).map(a => (
              <button key={a.key} onClick={() => setAba(a.key)}
                className={`flex-1 py-3 text-xs font-condensed tracking-wider border-b-2 transition flex flex-col items-center gap-0.5 ${
                  aba === a.key ? 'border-red-500 text-white' : 'border-transparent text-gray-600 hover:text-gray-400'
                }`}>
                <span className="text-base leading-none">{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          {/* ABA NARRAÇÃO */}
          {aba === 'transmissao' && (
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: '🟨', label: 'Cartão Amarelo', tipo: 'cartao', cor: 'border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/10' },
                  { icon: '🟥', label: 'Cartão Vermelho', tipo: 'cartao', cor: 'border-red-500/25 text-red-400 hover:bg-red-500/10' },
                  { icon: '⏱️', label: 'Intervalo',      tipo: 'info',   cor: 'border-blue-500/25 text-blue-400 hover:bg-blue-500/10' },
                  { icon: '🔄', label: 'Substituição',   tipo: 'info',   cor: 'border-green-500/25 text-green-400 hover:bg-green-500/10' },
                  { icon: '🏁', label: 'Fim de jogo',    tipo: 'info',   cor: 'border-white/15 text-gray-300 hover:bg-white/8' },
                  { icon: '⚠️', label: 'Paralisação',   tipo: 'info',   cor: 'border-orange-500/25 text-orange-400 hover:bg-orange-500/10' },
                ].map(btn => (
                  <button key={btn.label}
                    onClick={() => addEvento(`${btn.icon} ${btn.label}`, btn.tipo)}
                    className={`py-3 bg-black/20 border rounded-xl text-xs font-medium transition active:scale-95 flex flex-col items-center gap-1.5 ${btn.cor}`}>
                    <span className="text-2xl leading-none">{btn.icon}</span>
                    <span className="leading-tight text-center">{btn.label}</span>
                  </button>
                ))}
              </div>

              <button onClick={gerarEscalacao}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl text-sm mb-4 active:scale-98 transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2">
                <span className="text-xl">🎙️</span>
                Finalizar e gerar Escalação DivinoTV
              </button>

              {eventos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs text-gray-600 uppercase tracking-wider mb-2">Feed do jogo</div>
                  {eventos.map((e, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${corEvento[e.tipo] || corEvento.info}`}>
                      <span className="text-gray-600 flex-shrink-0 font-mono">{e.hora}</span>
                      <span>{e.txt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA ELENCO */}
          {aba === 'elenco' && (
            <div className="px-4 py-4">
              {[
                { time: jogo.mandante, jogadores: mandanteJogadores },
                { time: jogo.visitante, jogadores: visitanteJogadores },
              ].map(({ time, jogadores }) => (
                <div key={time?.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-red-500/15 rounded-full flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0">
                      {time?.nome?.slice(0, 1)}
                    </div>
                    <h3 className="font-bold text-white text-sm">{time?.nome}</h3>
                  </div>

                  {jogadores.length === 0 ? (
                    <p className="text-xs text-gray-600 py-3 pl-2">Nenhum jogador cadastrado neste elenco.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {jogadores.map(j => {
                        const nota = notasJogadores[j.id]
                        const gols = golsJogadores[j.id] || 0
                        const cartao = cartoesJogadores[j.id]
                        const corNota = nota
                          ? nota >= 8 ? 'text-green-400' : nota >= 6 ? 'text-yellow-400' : 'text-red-400'
                          : 'text-gray-700'
                        return (
                          <button key={j.id}
                            onClick={() => setJogadorSelecionado(j)}
                            className="w-full flex items-center gap-3 p-3 bg-[#0E0F15] hover:bg-[#161820] rounded-xl border border-white/5 hover:border-red-500/20 transition text-left active:scale-98">
                            <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-gray-400 flex-shrink-0 font-condensed">
                              {(j.apelido || j.nome).slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white text-sm truncate">{j.apelido || j.nome}</div>
                              <div className="text-xs text-gray-600 capitalize">{j.posicao}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {gols > 0 && <span className="text-xs bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded font-bold">⚽ {gols}</span>}
                              {cartao === 'cartao_a' && <span>🟨</span>}
                              {cartao === 'cartao_v' && <span>🟥</span>}
                              {nota && <span className={`text-sm font-bold ${corNota}`}>{nota}</span>}
                              <span className="text-gray-700 text-xs">›</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ABA ESCALAÇÃO */}
          {aba === 'escalacao' && (
            <div className="px-4 py-4">
              {gerando ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4 animate-pulse">🎙️</div>
                  <div className="font-display text-2xl text-red-400">Gerando Escalação DivinoTV...</div>
                  <div className="text-xs text-gray-600 mt-2">Alê Oliveira está preparando tudo</div>
                </div>
              ) : escalacaoGerada ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🎙️</span>
                    <div>
                      <div className="font-bold text-white text-sm">Escalação DivinoTV</div>
                      <div className="text-xs text-gray-600">por Alê Oliveira</div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(escalacaoGerada)}
                      className="ml-auto text-xs text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                      Copiar
                    </button>
                  </div>
                  <div className="bg-[#0E0F15] rounded-xl border border-white/5 p-4">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                      {escalacaoGerada}
                    </pre>
                  </div>
                  <button onClick={gerarEscalacao}
                    className="w-full mt-4 py-3 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">
                    🎲 Gerar novamente
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎙️</div>
                  <div className="font-bold text-white mb-2">Pronto pra escalação?</div>
                  <div className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                    Avalie os jogadores na aba Elenco antes de gerar para uma escalação mais personalizada
                  </div>
                  <button onClick={gerarEscalacao}
                    className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition">
                    Gerar Escalação DivinoTV
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* OVERLAY do jogador */}
      {jogadorSelecionado && (
        <JogadorOverlay
          jogador={jogadorSelecionado}
          nota={notasJogadores[jogadorSelecionado.id]}
          gols={golsJogadores[jogadorSelecionado.id] || 0}
          cartao={cartoesJogadores[jogadorSelecionado.id]}
          onSetNota={n => setNotasJogadores(prev => ({ ...prev, [jogadorSelecionado.id]: n }))}
          onAcao={tipo => atribuirPonto(jogadorSelecionado, tipo)}
          onFechar={() => setJogadorSelecionado(null)}
        />
      )}
    </div>
  )
}

function JogadorOverlay({ jogador, nota, gols, cartao, onSetNota, onAcao, onFechar }: {
  jogador: any
  nota?: number
  gols: number
  cartao?: string
  onSetNota: (n: number) => void
  onAcao: (tipo: 'gol' | 'assistencia' | 'defesa' | 'cartao_a' | 'cartao_v') => void
  onFechar: () => void
}) {
  const corNota = nota
    ? nota >= 8 ? '#00D68F' : nota >= 6 ? '#F5B800' : '#E8232A'
    : '#3D4055'

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onFechar}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full bg-[#0E0F15] rounded-t-3xl border-t border-white/10 p-5 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-gray-400 flex-shrink-0 font-condensed tracking-wider">
            {(jogador.apelido || jogador.nome).slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-xl truncate">{jogador.apelido || jogador.nome}</div>
            <div className="text-gray-500 text-sm truncate">{jogador.nome}</div>
            <div className="text-xs text-red-400 font-condensed tracking-wider uppercase mt-0.5">{jogador.posicao}</div>
          </div>
          <div className="w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0"
            style={{ borderColor: corNota }}>
            <span className="font-bold text-lg leading-none" style={{ color: corNota }}>{nota ?? '—'}</span>
            <span className="text-gray-700 text-xs leading-none">nota</span>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">{gols}</div>
            <div className="text-xs text-gray-600 mt-0.5">Gols</div>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl">{cartao === 'cartao_a' ? '🟨' : cartao === 'cartao_v' ? '🟥' : '—'}</div>
            <div className="text-xs text-gray-600 mt-0.5">Cartão</div>
          </div>
          <div className="bg-white/3 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-gray-400">—</div>
            <div className="text-xs text-gray-600 mt-0.5">Jogos</div>
          </div>
        </div>

        {/* Nota slider */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Nota DivinoTV</label>
            <span className="font-bold text-sm" style={{ color: corNota }}>
              {nota ?? 'Não avaliado'}
            </span>
          </div>
          <input type="range" min="1" max="10" step="0.5"
            value={nota ?? 5}
            onChange={e => onSetNota(Number(e.target.value))}
            className="w-full accent-red-500" />
          <div className="flex justify-between text-xs text-gray-700 mt-1">
            <span>1 — Ruim</span>
            <span>5 — OK</span>
            <span>10 — Fenômeno</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { tipo: 'gol'         as const, icon: '⚽', label: 'Gol',      cor: 'bg-green-500/15 text-green-400 border-green-500/25' },
            { tipo: 'assistencia' as const, icon: '🎯', label: 'Assist.',  cor: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
            { tipo: 'defesa'      as const, icon: '🧤', label: 'Defesa',   cor: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
            { tipo: 'cartao_a'    as const, icon: '🟨', label: 'Amarelo',  cor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
          ].map(btn => (
            <button key={btn.tipo}
              onClick={() => onAcao(btn.tipo)}
              className={`py-3 border rounded-xl text-xs font-medium active:scale-95 transition flex flex-col items-center gap-1.5 ${btn.cor}`}>
              <span className="text-2xl leading-none">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        <button onClick={onFechar}
          className="w-full py-3 border border-white/8 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition">
          Fechar
        </button>
      </div>
    </div>
  )
}
