import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../../lib/data'

type Fase = 'pre' | 'primeiro' | 'intervalo' | 'segundo' | 'encerrado'
type View = 'narrar' | 'elenco' | 'pontuacao' | 'escalacao'

const APELIDOS: Record<string, string[]> = {
  goleiro:  ['Mão de Aço (reflexos sobrenaturais)','O Intocável (ninguém passou)','Gato Elétrico (se jogou em tudo)','Borracha Humana (se esticou em tudo)'],
  zagueiro: ['Anita (não deixou passar ninguém)','Muralha da China (intransponível)','Rocha Viva (inabalável)','Blindagem Total (cobriu tudo)'],
  lateral:  ['Foguete pela Lateral (velocidade impressionante)','Linha de Trem (foi e voltou o jogo inteiro)','Corredor Infinito (incansável)','Bicuda (cruzamento na medida)'],
  volante:  ['Aspirador de Pó (roubou tudo no meio)','Segurança VIP (não deixou entrar)','Central de Distribuição (simples e eficiente)','Blindagem no Meio (parou tudo)'],
  meia:     ['GPS do Campo (sempre no lugar certo)','Maestro (ditou o ritmo)','Fio Condutor (ligou tudo)','Vitamina C (presente quando precisou)'],
  atacante: ['Foguete (ninguém parou)','Ninja (sumiu e apareceu na hora certa)','Coração Maior que o Campo (deu tudo)','Soldado de Ouro (correu pelo time inteiro)'],
}

function apelido(pos: string) {
  const l = APELIDOS[pos] || APELIDOS.atacante
  return l[Math.floor(Math.random() * l.length)]
}

interface JogStats {
  gols: number; assistencias: number; defesas: number
  amarelo: boolean; vermelho: boolean; nota: number; melhorJogo: boolean
}

const DEFAULT_STATS: JogStats = { gols:0, assistencias:0, defesas:0, amarelo:false, vermelho:false, nota:7, melhorJogo:false }

function pontos(s: JogStats): number {
  return (s.gols*8) + (s.assistencias*5) + (s.defesas*3) +
    Math.round((s.nota-5)*2) + (s.amarelo ? -2 : 0) + (s.vermelho ? -5 : 0)
}

export default function AdminNarracao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const jogo = db.jogos.buscar(Number(id))

  const [fase, setFase] = useState<Fase>('pre')
  const [minuto, setMinuto] = useState(0)
  const [acrescimo, setAcrescimo] = useState(0)
  const [gm, setGm] = useState(0)
  const [gv, setGv] = useState(0)
  const [eventos, setEventos] = useState<{m:number; txt:string; tipo:string}[]>([])
  const [stats, setStats] = useState<Record<number, JogStats>>({})
  const [abaElenco, setAbaElenco] = useState<'mandante'|'visitante'>('mandante')
  const [jogadorSheet, setJogadorSheet] = useState<any>(null)
  const [sheetEdit, setSheetEdit] = useState<JogStats>(DEFAULT_STATS)
  const [view, setView] = useState<View>('narrar')
  const [escalacao, setEscalacao] = useState('')
  const [gerando, setGerando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const emJogo = fase === 'primeiro' || fase === 'segundo'

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (emJogo) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [emJogo])

  useEffect(() => {
    if (emJogo) {
      timer.current = setInterval(() => setMinuto(m => m + 1), 60000)
    } else {
      if (timer.current) clearInterval(timer.current)
    }
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [emJogo])

  if (!jogo) return <div style={{ padding:32, color:'var(--t-3)' }}>Jogo não encontrado.</div>

  const mandJogs = db.mockJogadoresPorTime(jogo.mandante_id) || []
  const visitJogs = db.mockJogadoresPorTime(jogo.visitante_id) || []
  const todosJogs = [...mandJogs, ...visitJogs]

  function getStat(pid: number): JogStats { return stats[pid] || { ...DEFAULT_STATS } }
  function setStat(pid: number, patch: Partial<JogStats>) {
    setStats(s => ({ ...s, [pid]: { ...getStat(pid), ...patch } }))
  }

  function addEvento(tipo: string, txt: string) {
    setEventos(ev => [{ m: minuto, txt, tipo }, ...ev].slice(0, 50))
  }

  function abrirSheet(jog: any) {
    setJogadorSheet(jog)
    setSheetEdit({ ...getStat(jog.id) })
  }

  function salvarSheet() {
    if (!jogadorSheet) return
    setStat(jogadorSheet.id, sheetEdit)
    setJogadorSheet(null)
  }

  async function gerarEscalacao() {
    setGerando(true)
    setView('escalacao')
    await new Promise(r => setTimeout(r, 800))
    const usados: number[] = []
    function pegar(pos: string): string {
      const c = todosJogs.find(j => !usados.includes(j.id) && j.posicao === pos)
               || todosJogs.find(j => !usados.includes(j.id))
      if (!c) return `Jogador, o ${apelido(pos)}`
      usados.push(c.id)
      const s = getStat(c.id)
      return `${c.apelido || c.nome} (nota ${s.nota}), o ${apelido(pos)}`
    }
    const artEntry = Object.entries(stats)
      .filter(([, s]) => s.gols > 0)
      .sort(([, a], [, b]) => b.gols - a.gols)[0]
    const artJog = artEntry ? todosJogs.find(j => j.id === Number(artEntry[0])) : null
    const melhorJog = todosJogs.find(j => getStat(j.id).melhorJogo)
      || [...todosJogs].sort((a, b) => getStat(b.id).nota - getStat(a.id).nota)[0]

    setEscalacao(`🎙️ E AÍ GALERA, VEM AÍ A ESCALAÇÃO DIVINOTV!

⬛ NA META:
🧤 ${pegar('goleiro')}

🛡️ NA ZAGA:
📌 ${pegar('zagueiro')}
📌 ${pegar('zagueiro')}
📌 ${pegar('lateral')} (dir.)
📌 ${pegar('lateral')} (esq.)

⚙️ NO MEIO:
⚡ ${pegar('volante')}
⚡ ${pegar('volante')}
⚡ ${pegar('meia')}

🔥 NO ATAQUE:
💥 ${pegar('meia')}
💥 ${pegar('atacante')}
💥 ${pegar('atacante')}

━━━━━━━━━━━━━━━━━━
🏆 Placar: ${jogo!.mandante?.nome} ${gm} × ${gv} ${jogo!.visitante?.nome}
${artJog ? `⚽ Artilheiro: ${artJog.apelido || artJog.nome} (${getStat(artJog.id).gols} gol${getStat(artJog.id).gols > 1 ? 's' : ''})` : ''}
${melhorJog ? `⭐ Melhor em campo: ${melhorJog.apelido || melhorJog.nome}` : ''}

Isso foi Divino App! Futebol de verdade! 🎙️⚽`.trim())
    setGerando(false)
  }

  const FASES_BTN: Record<Fase, { label: string; cor: string; txtCor: string; next: () => void }> = {
    pre:       { label:'▶ Iniciar partida',  cor:'var(--green)',  txtCor:'#000', next: () => { setFase('primeiro'); setMinuto(1); addEvento('inicio','🟢 Partida iniciada!') }},
    primeiro:  { label:'⏸ Intervalo',        cor:'var(--yellow)', txtCor:'#000', next: () => { setFase('intervalo'); if (timer.current) clearInterval(timer.current); addEvento('intervalo','⏸ Intervalo') }},
    intervalo: { label:'▶ 2º Tempo',          cor:'var(--green)',  txtCor:'#000', next: () => { setFase('segundo'); setMinuto(46); addEvento('inicio','▶ Segundo tempo iniciado') }},
    segundo:   { label:'🏁 Encerrar',         cor:'var(--red)',    txtCor:'#fff', next: () => { setFase('encerrado'); if (timer.current) clearInterval(timer.current); addEvento('fim','🏁 Jogo encerrado') }},
    encerrado: { label:'🎙️ Gerar Escalação',  cor:'var(--t-2)',    txtCor:'#000', next: gerarEscalacao },
  }

  const btn = FASES_BTN[fase]

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column' }}>

      {/* ─── HEADER ─── */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(7,8,12,0.97)', backdropFilter:'blur(16px)',
        borderBottom:'0.5px solid var(--b-1)',
      }}>
        {/* Linha 1 */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 6px' }}>
          {!emJogo ? (
            <button onClick={() => navigate(`/admin/jogo/${id}`)}
              style={{ background:'none', border:'none', color:'var(--t-2)', fontSize:13, cursor:'pointer', padding:'4px 0' }}>
              ← Voltar
            </button>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span className="live-dot"/>
              <span style={{ fontSize:11, color:'var(--red)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                Narração ativa
              </span>
            </div>
          )}
          <span style={{ fontSize:13, color:'var(--t-2)', fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>
            {String(minuto).padStart(2,'0')}'
            {acrescimo > 0 && <span style={{ color:'var(--yellow)' }}> +{acrescimo}</span>}
          </span>
        </div>

        {/* Linha 2: placar */}
        <div style={{ padding:'2px 16px 8px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ flex:1, fontSize:11, fontWeight:600, color:'var(--t-1)', textAlign:'right', lineHeight:1.2 }}>
            {jogo.mandante?.nome}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            <Ctrl onClick={() => setGm(g => Math.max(0, g-1))} symbol="−" dim />
            <button onClick={() => { setGm(g => g+1); addEvento('gol',`⚽ GOL! ${jogo.mandante?.nome}`) }}
              style={{ width:30, height:30, background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-sm)', color:'var(--red)', fontSize:18, cursor:'pointer', fontWeight:700 }}>+</button>
            <span className="display" style={{ fontSize:36, color:'var(--t-1)', minWidth:22, textAlign:'center' }}>{gm}</span>
            <span style={{ color:'var(--t-3)', fontSize:20, fontFamily:'var(--font-display)' }}>:</span>
            <span className="display" style={{ fontSize:36, color:'var(--t-1)', minWidth:22, textAlign:'center' }}>{gv}</span>
            <button onClick={() => { setGv(g => g+1); addEvento('gol',`⚽ GOL! ${jogo.visitante?.nome}`) }}
              style={{ width:30, height:30, background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-sm)', color:'var(--red)', fontSize:18, cursor:'pointer', fontWeight:700 }}>+</button>
            <Ctrl onClick={() => setGv(g => Math.max(0, g-1))} symbol="−" dim />
          </div>
          <span style={{ flex:1, fontSize:11, fontWeight:600, color:'var(--t-1)', textAlign:'left', lineHeight:1.2 }}>
            {jogo.visitante?.nome}
          </span>
        </div>

        {/* Linha 3: acréscimo + fase */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px 10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:11, color:'var(--t-3)' }}>Acrés.</span>
            <Ctrl onClick={() => setAcrescimo(a => Math.max(0, a-1))} symbol="−" small />
            <span style={{ width:20, textAlign:'center', fontSize:13, color:'var(--yellow)', fontWeight:700 }}>{acrescimo}'</span>
            <Ctrl onClick={() => { setAcrescimo(a => a+1); addEvento('acrescimo',`+${acrescimo+1}' de acréscimo`) }} symbol="+" small />
          </div>
          <div style={{ flex:1 }}/>
          <button onClick={btn.next} style={{
            background: btn.cor, color: btn.txtCor,
            border:'none', borderRadius:'var(--r-md)', padding:'8px 16px',
            fontSize:12, fontWeight:700, cursor:'pointer',
          }}>
            {btn.label}
          </button>
        </div>

        {/* Nav tabs */}
        <div style={{ display:'flex', borderTop:'0.5px solid var(--b-1)' }}>
          {([['narrar','Narrar'],['elenco','Elencos'],['pontuacao','Pontuação'],['escalacao','Escalação']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex:1, padding:'10px 0', background:'none', border:'none',
              borderBottom: view===v ? '2px solid var(--red)' : '2px solid transparent',
              color: view===v ? 'var(--t-1)' : 'var(--t-3)',
              fontSize:11, fontWeight:600, cursor:'pointer', letterSpacing:'0.03em',
              textTransform:'uppercase', transition:'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ─── VIEWS ─── */}
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>

        {view === 'narrar' && (
          <div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {[
                { label:'🟨 Amarelo', onClick: () => addEvento('amarelo','🟨 Cartão amarelo') },
                { label:'🟥 Vermelho', onClick: () => addEvento('vermelho','🟥 Cartão vermelho') },
                { label:'↕ Substituição', onClick: () => addEvento('sub','↕ Substituição') },
                { label:'💬 Nota', onClick: () => addEvento('info','💬 Nota do narrador') },
              ].map(a => (
                <button key={a.label} onClick={a.onClick} style={{
                  background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)',
                  borderRadius:'var(--r-sm)', padding:'7px 12px',
                  color:'var(--t-2)', fontSize:12, fontWeight:600, cursor:'pointer',
                }}>
                  {a.label}
                </button>
              ))}
            </div>
            {eventos.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t-3)', fontSize:13 }}>
                {fase === 'pre' ? 'Inicie a partida para registrar eventos.' : 'Nenhum evento ainda.'}
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {eventos.map((e, i) => {
                  const cor = e.tipo==='gol' ? 'var(--green)' : e.tipo==='amarelo' ? 'var(--yellow)' : e.tipo==='vermelho' ? 'var(--red)' : 'var(--t-3)'
                  return (
                    <div key={i} style={{
                      display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px',
                      background:'var(--bg-card)', borderRadius:'var(--r-md)', border:'0.5px solid var(--b-1)',
                    }}>
                      <span style={{ fontSize:11, color:cor, fontWeight:700, minWidth:24 }}>{String(e.m).padStart(2,'0')}'</span>
                      <span style={{ fontSize:13, color:'var(--t-1)', flex:1 }}>{e.txt}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {view === 'elenco' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {(['mandante','visitante'] as const).map(lado => (
                <button key={lado} onClick={() => setAbaElenco(lado)} style={{
                  flex:1, padding:'9px',
                  background: abaElenco===lado ? 'var(--bg-card-2)' : 'transparent',
                  border:`0.5px solid ${abaElenco===lado ? 'var(--b-2)' : 'var(--b-1)'}`,
                  borderRadius:'var(--r-md)', color: abaElenco===lado ? 'var(--t-1)' : 'var(--t-3)',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                }}>
                  {lado === 'mandante' ? jogo.mandante?.nome : jogo.visitante?.nome}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {(abaElenco === 'mandante' ? mandJogs : visitJogs).map((jog: any) => {
                const s = getStat(jog.id)
                const notaCor = s.nota>=8 ? 'var(--green)' : s.nota>=6 ? 'var(--yellow)' : 'var(--red)'
                return (
                  <button key={jog.id} onClick={() => abrirSheet(jog)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                    background:'var(--bg-card)', border:'0.5px solid var(--b-1)',
                    borderRadius:'var(--r-md)', cursor:'pointer', textAlign:'left', width:'100%',
                  }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--t-2)', flexShrink:0 }}>
                      {(jog.apelido||jog.nome).slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {jog.apelido||jog.nome}
                      </div>
                      <div style={{ fontSize:11, color:'var(--t-3)', textTransform:'capitalize' }}>
                        {jog.posicao}
                        {s.gols > 0 && ` · ⚽${s.gols}`}
                        {s.assistencias > 0 && ` · 🅰${s.assistencias}`}
                        {s.amarelo && ' · 🟨'}{s.vermelho && ' · 🟥'}
                      </div>
                    </div>
                    <div className="rating-circle" style={{ width:36, height:36, flexShrink:0, borderColor:notaCor, color:notaCor, fontSize:13 }}>
                      {s.nota}
                    </div>
                  </button>
                )
              })}
              {(abaElenco === 'mandante' ? mandJogs : visitJogs).length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t-3)', fontSize:13 }}>Nenhum jogador cadastrado.</div>
              )}
            </div>
          </div>
        )}

        {view === 'pontuacao' && (
          <div>
            <p style={{ fontSize:12, color:'var(--t-3)', marginBottom:16, textAlign:'center' }}>
              Gol=8 · Assist=5 · Defesa=3 · Nota±2/pt · Amarelo−2 · Vermelho−5
            </p>
            {[...todosJogs].sort((a, b) => pontos(getStat(b.id)) - pontos(getStat(a.id))).map((jog, i) => {
              const s = getStat(jog.id)
              const pts = pontos(s)
              const nomeTime = mandJogs.some((m: any) => m.id === jog.id) ? jogo.mandante?.nome : jogo.visitante?.nome
              return (
                <div key={jog.id} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                  background:'var(--bg-card)', border:'0.5px solid var(--b-1)',
                  borderRadius:'var(--r-md)', marginBottom:6,
                }}>
                  <span className="display" style={{ fontSize:22, color: i<3 ? 'var(--yellow)' : 'var(--t-3)', width:24, textAlign:'center' }}>{i+1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{jog.apelido||jog.nome}</div>
                    <div style={{ fontSize:11, color:'var(--t-3)' }}>{nomeTime}{s.gols>0&&` · ⚽${s.gols}`}{s.melhorJogo&&' · ⭐'}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div className="display" style={{ fontSize:24, color: pts>0 ? 'var(--green)' : pts<0 ? 'var(--red)' : 'var(--t-3)' }}>
                      {pts>0?`+${pts}`:pts}
                    </div>
                    <div style={{ fontSize:10, color:'var(--t-3)' }}>pts</div>
                  </div>
                </div>
              )
            })}
            {todosJogs.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t-3)', fontSize:13 }}>Nenhum jogador no elenco.</div>}
          </div>
        )}

        {view === 'escalacao' && (
          <div>
            {gerando ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--t-3)' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🎙️</div>
                <div style={{ fontSize:14 }}>Gerando escalação DivinoTV...</div>
              </div>
            ) : escalacao ? (
              <div>
                <pre style={{
                  whiteSpace:'pre-wrap', fontFamily:'var(--font-body)', fontSize:14,
                  color:'var(--t-1)', lineHeight:1.7, background:'var(--bg-card)',
                  border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:16, marginBottom:16,
                }}>{escalacao}</pre>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { navigator.clipboard.writeText(escalacao); setCopiado(true); setTimeout(()=>setCopiado(false),2000) }}
                    className="btn btn-primary btn-sm" style={{ flex:1 }}>
                    {copiado ? '✓ Copiado!' : 'Copiar texto'}
                  </button>
                  <button onClick={gerarEscalacao} className="btn btn-ghost btn-sm" style={{ flex:1 }}>Gerar novamente</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--t-3)' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🎙️</div>
                <div style={{ fontSize:14, marginBottom:20 }}>
                  {fase === 'encerrado' ? 'Clique para gerar a escalação DivinoTV.' : 'A escalação é gerada após encerrar a partida.'}
                </div>
                {fase === 'encerrado' && <button onClick={gerarEscalacao} className="btn btn-primary btn-sm">Gerar escalação</button>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── JOGADOR SHEET ─── */}
      {jogadorSheet && (
        <div onClick={() => setJogadorSheet(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div onClick={e => e.stopPropagation()} className="animate-slide-up"
            style={{ background:'var(--bg-sheet)', borderRadius:'var(--r-xl) var(--r-xl) 0 0', padding:20, width:'100%', maxWidth:480, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--t-2)' }}>
                {(jogadorSheet.apelido||jogadorSheet.nome).slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--t-1)' }}>{jogadorSheet.apelido||jogadorSheet.nome}</div>
                <div style={{ fontSize:12, color:'var(--t-3)', textTransform:'capitalize' }}>{jogadorSheet.posicao}</div>
              </div>
            </div>

            {([['Gols','gols'],['Assistências','assistencias'],['Defesas','defesas']] as const).map(([label, key]) => (
              <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid var(--b-1)' }}>
                <span style={{ fontSize:14, color:'var(--t-2)' }}>{label}</span>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button onClick={() => setSheetEdit(e => ({ ...e, [key]: Math.max(0, e[key]-1) }))}
                    style={{ width:32, height:32, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', color:'var(--t-1)', fontSize:18, cursor:'pointer' }}>−</button>
                  <span style={{ width:20, textAlign:'center', fontSize:16, fontWeight:700, color:'var(--t-1)' }}>{sheetEdit[key]}</span>
                  <button onClick={() => setSheetEdit(e => ({ ...e, [key]: e[key]+1 }))}
                    style={{ width:32, height:32, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', color:'var(--t-1)', fontSize:18, cursor:'pointer' }}>+</button>
                </div>
              </div>
            ))}

            <div style={{ display:'flex', gap:8, padding:'12px 0', borderBottom:'0.5px solid var(--b-1)' }}>
              {[
                { key:'amarelo' as const, label:'🟨 Amarelo', active: sheetEdit.amarelo, cor:'rgba(245,184,0,0.15)', bord:'rgba(245,184,0,0.4)', txt:'var(--yellow)' },
                { key:'vermelho' as const, label:'🟥 Vermelho', active: sheetEdit.vermelho, cor:'rgba(232,35,42,0.15)', bord:'var(--red-border)', txt:'var(--red)' },
                { key:'melhorJogo' as const, label:'⭐ Melhor', active: sheetEdit.melhorJogo, cor:'rgba(245,184,0,0.15)', bord:'rgba(245,184,0,0.4)', txt:'var(--yellow)' },
              ].map(({ key, label, active, cor, bord, txt }) => (
                <button key={key} onClick={() => setSheetEdit(e => ({ ...e, [key]: !e[key] }))}
                  style={{ flex:1, padding:'9px', background: active ? cor : 'var(--bg-card-2)', border:`0.5px solid ${active?bord:'var(--b-1)'}`, borderRadius:'var(--r-sm)', color: active ? txt : 'var(--t-3)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding:'12px 0', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:14, color:'var(--t-2)' }}>Nota</span>
                <span className="display" style={{ fontSize:28, color: sheetEdit.nota>=8 ? 'var(--green)' : sheetEdit.nota>=6 ? 'var(--yellow)' : 'var(--red)' }}>
                  {sheetEdit.nota}
                </span>
              </div>
              <input type="range" min={1} max={10} step={0.5} value={sheetEdit.nota}
                onChange={e => setSheetEdit(ed => ({ ...ed, nota: Number(e.target.value) }))}
                style={{ width:'100%', accentColor:'var(--red)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--t-3)', marginTop:2 }}>
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setJogadorSheet(null)} className="btn btn-ghost btn-sm" style={{ flex:1 }}>Cancelar</button>
              <button onClick={salvarSheet} className="btn btn-primary btn-sm" style={{ flex:1 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Ctrl({ onClick, symbol, dim, small }: { onClick: () => void; symbol: string; dim?: boolean; small?: boolean }) {
  const size = small ? 22 : 28
  return (
    <button onClick={onClick} style={{
      width:size, height:size, background:'var(--bg-card-2)',
      border:'0.5px solid var(--b-1)', borderRadius:4,
      color: dim ? 'var(--t-3)' : 'var(--t-2)', fontSize: small ? 13 : 16, cursor:'pointer',
    }}>{symbol}</button>
  )
}
