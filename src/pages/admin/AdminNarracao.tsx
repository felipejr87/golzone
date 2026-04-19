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

  function iniciarPartida() {
    setFase('primeiro')
    setMinuto(1)
    addEvento('inicio','🟢 Partida iniciada!')
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

  /* ── PRÉ-JOGO LOBBY ── */
  if (fase === 'pre') {
    return (
      <div style={{ background:'var(--bg-base)', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'0.5px solid var(--b-1)', background:'rgba(6,6,8,0.97)' }}>
          <button onClick={() => navigate('/admin/jogos')} style={{ background:'none', border:'none', color:'var(--t-3)', fontSize:22, cursor:'pointer', padding:0, lineHeight:1 }}>←</button>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--t-2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Pré-Jogo</span>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:16 }}>

          {/* Match card */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-xl)', padding:'20px 16px', marginBottom:20 }}>
            <div style={{ fontSize:11, color:'var(--t-3)', textAlign:'center', marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {jogo.championship?.nome} · Rodada {jogo.rodada}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--t-1)', lineHeight:1.3 }}>{jogo.mandante?.nome}</div>
                <div style={{ fontSize:11, color:'var(--t-3)', marginTop:4 }}>Mandante</div>
              </div>
              <div style={{ padding:'10px 18px', background:'var(--bg-card-2)', borderRadius:'var(--r-lg)', textAlign:'center', flexShrink:0 }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--t-1)', letterSpacing:'0.04em' }}>VS</div>
              </div>
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--t-1)', lineHeight:1.3 }}>{jogo.visitante?.nome}</div>
                <div style={{ fontSize:11, color:'var(--t-3)', marginTop:4 }}>Visitante</div>
              </div>
            </div>
            {jogo.local && (
              <div style={{ textAlign:'center', marginTop:12, fontSize:12, color:'var(--t-3)' }}>📍 {jogo.local}</div>
            )}
          </div>

          {/* Elencos */}
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {[
              { time: jogo.mandante?.nome, jogs: mandJogs, label:'Mandante' },
              { time: jogo.visitante?.nome, jogs: visitJogs, label:'Visitante' },
            ].map(({ time, jogs }) => (
              <div key={time} style={{ flex:1, background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>{time}</div>
                {(jogs as any[]).slice(0, 7).map((jog: any) => (
                  <div key={jog.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 0', borderBottom:'0.5px solid var(--b-1)' }}>
                    <span style={{ fontSize:10, color:'var(--t-3)', textTransform:'capitalize', width:44, flexShrink:0 }}>{jog.posicao?.slice(0,3)}</span>
                    <span style={{ fontSize:12, color:'var(--t-1)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{jog.apelido || jog.nome}</span>
                  </div>
                ))}
                {(jogs as any[]).length === 0 && <div style={{ fontSize:11, color:'var(--t-3)' }}>Sem elenco</div>}
                {(jogs as any[]).length > 7 && <div style={{ fontSize:10, color:'var(--t-3)', marginTop:4 }}>+{(jogs as any[]).length - 7} mais</div>}
              </div>
            ))}
          </div>

          {/* Estatísticas resumo */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:14, marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--t-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Elencos</div>
            <div style={{ display:'flex', justifyContent:'space-around' }}>
              {[
                { label:'Jogadores', val: todosJogs.length },
                { label: jogo.mandante?.nome ?? 'Mandante', val: mandJogs.length },
                { label: jogo.visitante?.nome ?? 'Visitante', val: visitJogs.length },
              ].map(({ label, val }) => (
                <div key={label} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--t-1)' }}>{val}</div>
                  <div style={{ fontSize:10, color:'var(--t-3)', marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Big CTA */}
        <div style={{ padding:'16px 16px calc(16px + env(safe-area-inset-bottom,0px))', background:'rgba(6,6,8,0.97)', borderTop:'0.5px solid var(--b-1)' }}>
          <button onClick={iniciarPartida} style={{
            width:'100%', padding:'18px', borderRadius:'var(--r-xl)',
            background:'var(--green)', color:'#000',
            border:'none', fontSize:17, fontWeight:800, cursor:'pointer',
            letterSpacing:'0.03em', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <span style={{ fontSize:22 }}>▶</span> Iniciar Partida
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'var(--t-3)', marginTop:8, margin:'8px 0 0' }}>
            {mandJogs.length + visitJogs.length} jogadores cadastrados · Você poderá registrar eventos durante o jogo
          </p>
        </div>
      </div>
    )
  }

  /* ── FASE ATIVA / ENCERRADO ── */
  const FASES_BTN: Record<Exclude<Fase,'pre'>, { label: string; cor: string; txtCor: string; next: () => void }> = {
    primeiro:  { label:'⏸ Intervalo',       cor:'var(--yellow)', txtCor:'#000', next: () => { setFase('intervalo'); if (timer.current) clearInterval(timer.current); addEvento('intervalo','⏸ Intervalo') }},
    intervalo: { label:'▶ 2º Tempo',         cor:'var(--green)',  txtCor:'#000', next: () => { setFase('segundo'); setMinuto(46); addEvento('inicio','▶ Segundo tempo iniciado') }},
    segundo:   { label:'🏁 Encerrar',        cor:'var(--red)',    txtCor:'#fff', next: () => { setFase('encerrado'); if (timer.current) clearInterval(timer.current); addEvento('fim','🏁 Jogo encerrado') }},
    encerrado: { label:'🎙️ Gerar Escalação', cor:'var(--t-2)',    txtCor:'#000', next: gerarEscalacao },
  }

  const btn = FASES_BTN[fase as Exclude<Fase,'pre'>]

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column' }}>

      {/* ─── HEADER ─── */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(7,8,12,0.97)', backdropFilter:'blur(16px)',
        borderBottom:'0.5px solid var(--b-1)',
      }}>
        {/* Linha 1: status + minuto */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {emJogo && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--red)', display:'inline-block', animation:'pulse 1.5s infinite' }} />}
            <span style={{ fontSize:11, color: emJogo ? 'var(--red)' : 'var(--t-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {fase === 'intervalo' ? 'Intervalo' : fase === 'encerrado' ? 'Encerrado' : 'Narração ativa'}
            </span>
          </div>
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
            <span style={{ fontFamily:'var(--font-display)', fontSize:36, color:'var(--t-1)', minWidth:22, textAlign:'center' }}>{gm}</span>
            <span style={{ color:'var(--t-3)', fontSize:20, fontFamily:'var(--font-display)' }}>:</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:36, color:'var(--t-1)', minWidth:22, textAlign:'center' }}>{gv}</span>
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
          {(['narrar','elenco','pontuacao','escalacao'] as const).map((v) => {
            const labels: Record<View,string> = { narrar:'Narrar', elenco:'Elencos', pontuacao:'Pontuação', escalacao:'Escalação' }
            return (
              <button key={v} onClick={() => setView(v)} style={{
                flex:1, padding:'10px 0', background:'none', border:'none',
                borderBottom: view===v ? '2px solid var(--red)' : '2px solid transparent',
                color: view===v ? 'var(--t-1)' : 'var(--t-3)',
                fontSize:11, fontWeight:600, cursor:'pointer', letterSpacing:'0.03em',
                textTransform:'uppercase', transition:'all 0.15s',
              }}>{labels[v]}</button>
            )
          })}
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
                  borderRadius:'var(--r-sm)', padding:'9px 14px',
                  color:'var(--t-2)', fontSize:13, fontWeight:600, cursor:'pointer',
                }}>
                  {a.label}
                </button>
              ))}
            </div>
            {eventos.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t-3)', fontSize:13 }}>
                Nenhum evento ainda.
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
                  flex:1, padding:'10px',
                  background: abaElenco===lado ? 'var(--bg-card-2)' : 'transparent',
                  border:`0.5px solid ${abaElenco===lado ? 'var(--b-2)' : 'var(--b-1)'}`,
                  borderRadius:'var(--r-md)', color: abaElenco===lado ? 'var(--t-1)' : 'var(--t-3)',
                  fontSize:13, fontWeight:700, cursor:'pointer',
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
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--t-2)', flexShrink:0 }}>
                      {(jog.apelido||jog.nome).slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {jog.apelido||jog.nome}
                      </div>
                      <div style={{ fontSize:11, color:'var(--t-3)', textTransform:'capitalize', marginTop:2 }}>
                        {jog.posicao}
                        {s.gols > 0 && ` · ⚽ ${s.gols}`}
                        {s.assistencias > 0 && ` · 🅰 ${s.assistencias}`}
                        {s.amarelo && ' · 🟨'}{s.vermelho && ' · 🟥'}
                        {s.melhorJogo && ' · ⭐'}
                      </div>
                    </div>
                    <div style={{
                      width:40, height:40, borderRadius:'50%', flexShrink:0,
                      border:`2px solid ${notaCor}`, background:`${notaCor}15`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'var(--font-display)', fontSize:14, color:notaCor,
                    }}>
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
                  <span style={{ fontFamily:'var(--font-display)', fontSize:22, color: i<3 ? 'var(--yellow)' : 'var(--t-3)', width:24, textAlign:'center' }}>{i+1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{jog.apelido||jog.nome}</div>
                    <div style={{ fontSize:11, color:'var(--t-3)' }}>{nomeTime}{s.gols>0&&` · ⚽${s.gols}`}{s.melhorJogo&&' · ⭐'}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:24, color: pts>0 ? 'var(--green)' : pts<0 ? 'var(--red)' : 'var(--t-3)' }}>
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
                    style={{ flex:1, padding:'12px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {copiado ? '✓ Copiado!' : '📋 Copiar texto'}
                  </button>
                  <button onClick={gerarEscalacao}
                    style={{ flex:1, padding:'12px', background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', color:'var(--t-2)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    Gerar novamente
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--t-3)' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>🎙️</div>
                <div style={{ fontSize:14, marginBottom:20 }}>
                  {fase === 'encerrado' ? 'Clique para gerar a escalação DivinoTV.' : 'A escalação é gerada após encerrar a partida.'}
                </div>
                {fase === 'encerrado' && (
                  <button onClick={gerarEscalacao}
                    style={{ padding:'12px 24px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    Gerar escalação
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── JOGADOR SHEET (Cartola-style) ─── */}
      {jogadorSheet && (
        <div onClick={() => setJogadorSheet(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'var(--bg-sheet)', borderRadius:'var(--r-xl) var(--r-xl) 0 0', padding:'20px 20px calc(20px + env(safe-area-inset-bottom,0px))', width:'100%', maxWidth:480, margin:'0 auto' }}>

            {/* Handle */}
            <div style={{ width:40, height:4, background:'var(--b-2)', borderRadius:2, margin:'0 auto 20px' }} />

            {/* Player header */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--t-2)', flexShrink:0 }}>
                {(jogadorSheet.apelido||jogadorSheet.nome).slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--t-1)' }}>{jogadorSheet.apelido||jogadorSheet.nome}</div>
                <div style={{ fontSize:12, color:'var(--t-3)', textTransform:'capitalize', marginTop:2 }}>{jogadorSheet.posicao}</div>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:28, color: sheetEdit.nota>=8 ? 'var(--green)' : sheetEdit.nota>=6 ? 'var(--yellow)' : 'var(--red)' }}>
                  {sheetEdit.nota}
                </div>
                <div style={{ fontSize:10, color:'var(--t-3)' }}>nota</div>
              </div>
            </div>

            {/* Counters: Gols / Assistências / Defesas */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              {([['⚽', 'Gols', 'gols'], ['🅰️', 'Assists', 'assistencias'], ['🧤', 'Defesas', 'defesas']] as const).map(([icon, label, key]) => (
                <div key={key} style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'12px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:10, color:'var(--t-3)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <button onClick={() => setSheetEdit(e => ({ ...e, [key]: Math.max(0, e[key]-1) }))}
                      style={{ width:36, height:36, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', color:'var(--t-1)', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                    <span style={{ fontSize:20, fontWeight:700, color:'var(--t-1)', minWidth:20, textAlign:'center' }}>{sheetEdit[key]}</span>
                    <button onClick={() => setSheetEdit(e => ({ ...e, [key]: e[key]+1 }))}
                      style={{ width:36, height:36, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', color:'var(--t-1)', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Toggles: Amarelo / Vermelho / Melhor */}
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {[
                { key:'amarelo' as const,    label:'🟨 Amarelo', active: sheetEdit.amarelo,   cor:'rgba(245,184,0,0.15)',   bord:'rgba(245,184,0,0.4)',   txt:'var(--yellow)' },
                { key:'vermelho' as const,   label:'🟥 Vermelho', active: sheetEdit.vermelho, cor:'rgba(232,35,42,0.15)',   bord:'var(--red-border)',     txt:'var(--red)'    },
                { key:'melhorJogo' as const, label:'⭐ Melhor',   active: sheetEdit.melhorJogo, cor:'rgba(245,184,0,0.15)', bord:'rgba(245,184,0,0.4)',   txt:'var(--yellow)' },
              ].map(({ key, label, active, cor, bord, txt }) => (
                <button key={key} onClick={() => setSheetEdit(e => ({ ...e, [key]: !e[key] }))}
                  style={{
                    flex:1, padding:'12px 6px',
                    background: active ? cor : 'var(--bg-card)',
                    border:`0.5px solid ${active?bord:'var(--b-1)'}`,
                    borderRadius:'var(--r-md)',
                    color: active ? txt : 'var(--t-3)',
                    fontSize:12, fontWeight:700, cursor:'pointer',
                    transition:'all 0.15s',
                  }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Nota slider */}
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'14px 16px', marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:13, color:'var(--t-2)', fontWeight:600 }}>Nota do jogo</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:32, color: sheetEdit.nota>=8 ? 'var(--green)' : sheetEdit.nota>=6 ? 'var(--yellow)' : 'var(--red)' }}>
                  {sheetEdit.nota}
                </span>
              </div>
              <input type="range" min={1} max={10} step={0.5} value={sheetEdit.nota}
                onChange={e => setSheetEdit(ed => ({ ...ed, nota: Number(e.target.value) }))}
                style={{ width:'100%', accentColor:'var(--red)', height:6 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--t-3)', marginTop:4 }}>
                <span>1 (Ruim)</span><span>5 (Médio)</span><span>10 (Elite)</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setJogadorSheet(null)}
                style={{ flex:1, padding:'14px', background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', color:'var(--t-3)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={salvarSheet}
                style={{ flex:2, padding:'14px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                Salvar pontuação
              </button>
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
