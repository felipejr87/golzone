import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminStore, type Jogador } from '../../lib/adminStore'

/* ── Tipos ─────────────────────────────────────────────── */
type Fase  = 'pre' | 'primeiro' | 'intervalo' | 'segundo' | 'encerrado'
type View  = 'narrar' | 'elenco' | 'pontuacao' | 'encerrar'
type EvTipo = 'gol' | 'assist' | 'defesa' | 'jogada' | 'amarelo' | 'vermelho' | 'falta' | 'passeerrado' | 'vacilo' | 'inicio' | 'intervalo' | 'fim' | 'sub' | 'acrescimo'

interface Stats {
  gols: number; assists: number; defesas: number; jogadas: number
  amarelo: boolean; vermelho: boolean; faltas: number; passosErrados: number; vacilos: number
  nota: number; melhorJogo: boolean
}

const DEFAULT: Stats = { gols:0, assists:0, defesas:0, jogadas:0, amarelo:false, vermelho:false, faltas:0, passosErrados:0, vacilos:0, nota:7, melhorJogo:false }

function pontos(s: Stats) {
  return (s.gols*8) + (s.assists*5) + (s.defesas*3) + (s.jogadas*4) +
    Math.round((s.nota-5)*2) + (s.amarelo?-2:0) + (s.vermelho?-5:0) + (s.faltas*-1) + (s.vacilos*-3)
}

/* ── Frases moleques por posição ───────────────────────── */
const FRASES: Record<string, { apelidos: string[]; elite: string[]; otimo: string[]; bom: string[]; neutro: string[]; abaixo: string[] }> = {
  goleiro: {
    apelidos: ['Muralha', 'Gato', 'Borracha Humana'],
    elite:   ['Hoje a Muralha virou Fortaleza blindada! Zero bala entrou! 🔒🔥','O Gato hoje foi o FELINO SUPREMO! Defesas absurdas! Os atacantes choraram no banheiro! 😭⚽','A Borracha Humana se esticou em tudo! Tentaram 10, 20 vezes... NADA!'],
    otimo:   ['A Muralha foi de cimento armado! Só deixou o que não tinha jeito mesmo!','O Gato apareceu quando o bicho apertou! Reflexo fino!','A Borracha não deixou passar o essencial! Serviço de primeira!'],
    bom:     ['A Muralha cumpriu a missão! Não foi lindo mas foi eficiente, e no fim é o que conta!','O Gato deu um ou dois sustos mas segurou o resultado! Honrou o posto!','A Borracha esticou onde precisou! Tranquilo campeão!'],
    neutro:  ['A Muralha ficou de pé! Com uns rebocos precisando de ajuste, mas em pé, que é o que importa!','O Gato today teve dias melhores... mas foi lá quando pedido! O dono da casa agradece!','A Borracha oscilou um pouco mas não desmoronou! Próxima semana renovada!'],
    abaixo:  ['Hoje a Muralha tava com textura de papel higiênico! Mas papel se recicla e amanhã volta mais resistente! 💪','O Gato hoje estava com sono de inverno... gatinho, na próxima acorda cedo e faz a festa! 😅','A Borracha hoje ficou mais dura que tijolo! Relaxa que amanhã ela se estica de novo!'],
  },
  zagueiro: {
    apelidos: ['Rocha Viva', 'Parede', 'Blindagem'],
    elite:   ['A Rocha Viva hoje foi um ASTEROIDE! Ninguém chegou nem perto! 🪨🔥','A Parede hoje foi... a Grande Muralha da China! Intransponível, inabalável!','A Blindagem foi total! Nem raio-X furava essa proteção!'],
    otimo:   ['A Rocha foi bem firme! Umas trincas mas a estrutura se manteve com honra!','A Parede foi sólida! Quase não deixou nada passar, crédito máximo!','A Blindagem funcionou bem! Uns furosinhos mas nada que prejudicasse a missão!'],
    bom:     ['A Rocha cumpriu o trabalho! Segurou o essencial e o time agradece!','A Parede foi bem! Não foi perfeita mas foi confiável, e isso tem valor!','A Blindagem defendeu o que importava! Honesto e eficiente!'],
    neutro:  ['A Rocha hoje oscilou um pouco... mas pedra é pedra, na próxima tá mais firme!','A Parede esteve lá! Mas umas goteiras aqui e ali... nada de reforma emergencial!','A Blindagem teve uns curtos... mas o sistema não caiu!'],
    abaixo:  ['Hoje a Rocha Viva tava meio areinha molhada! Mas areia com cimento vira concreto, né? Próxima! 💪','A Parede hoje tava de papelão... mas papelão é reciclável e a gente reconstrói! 🔧','A Blindagem abriu umas brechas hoje... na oficina se conserta tudo!'],
  },
  lateral: {
    apelidos: ['Foguete pela Lateral', 'Corredor Infinito', 'Linha de Trem'],
    elite:   ['O Foguete foi à lua e voltou umas 15 vezes! Incansável! Ninguém chegou perto! 🚀🔥','O Corredor Infinito comprovou que tem bateria de lítio! 90 minutos + prorrogação sem travar!','A Linha de Trem hoje não teve desvio! Ida e volta na velocidade máxima!'],
    otimo:   ['O Foguete foi nas idas e vindas! Cruzamentos certeiros! Deixou o marcador tonto!','O Corredor não parou! Serviu bem e fechou a defesa quando precisou!','A Linha de Trem cumpriu a rota direitinho! Confiança total!'],
    bom:     ['O Foguete foi lá! Uns tropeços mas chegou no destino com o trabalho feito!','O Corredor teve dias mais animados mas hoje cumpriu a missão!','A Linha de Trem cumpriu a rota! Sem grandes atrasos!'],
    neutro:  ['O Foguete ficou na órbita baixa hoje! Mas o combustível tá sendo abastecido pra próxima! 🛸','O Corredor teve uns buracos na pista... mas a estrada vai ser asfaltada!','A Linha de Trem teve uns desvios hoje... mas a ferrovia segue de pé!'],
    abaixo:  ['Hoje o Foguete ficou no hangar! Descansou pra próxima missão espacial! 🛸','O Corredor Infinito hoje tinha limite! Mas limite é só ponto de partida! 💪','A Linha de Trem hoje pegou o desvio errado... mas o GPS recalcula e na próxima acerta!'],
  },
  volante: {
    apelidos: ['Aspirador de Pó', 'Segurança VIP', 'Blindagem no Meio'],
    elite:   ['O Aspirador de Pó hoje aspirou até o sonho do adversário! Zero escapou! 🌪️🔥','O Segurança VIP foi... segurança de cofre-forte! Nada passou sem credencial!','A Blindagem no Meio foi inviolável! Um muro humano no centro do campo!'],
    otimo:   ['O Aspirador foi excelente! Roubou bastante e distribuiu com inteligência!','O Segurança VIP fez um trabalho impecável! Poucos chegaram perto!','A Blindagem no Meio segurou com autoridade! Respeito!'],
    bom:     ['O Aspirador limpou o essencial! Nem tudo, mas o que importava pra vitória!','O Segurança VIP estava de plantão! Cumpriu o serviço!','A Blindagem no Meio segurou as pontas! Serviço honesto!'],
    neutro:  ['O Aspirador hoje tava com o saco cheio de verdade! Mas esvaziamos e voltamos! 😅','O Segurança VIP deixou umas pessoas entrarem sem convite... mas o festejo foi controlado!','A Blindagem teve uns curtos hoje... mas o sistema não caiu!'],
    abaixo:  ['Hoje o Aspirador tava com a mangueira furada! Mas eletrônico bom se conserta! 🔌','O Segurança VIP abriu a catraca pro adversário hoje... Na próxima verifica o crachá com mais cuidado! 😅','A Blindagem no Meio foi mais cortina hoje... Mas cortina bonita a gente guarda pra próxima!'],
  },
  meia: {
    apelidos: ['Maestro', 'GPS do Campo', 'Fio Condutor'],
    elite:   ['O Maestro regeu uma SINFONIA perfeita! Cada passe foi uma nota certeira! 🎵🔥','O GPS do Campo foi impecável! Sempre no lugar certo, na hora exata!','O Fio Condutor ligou tudo! A corrente passou limpa do início ao fim!'],
    otimo:   ['O Maestro ditou bem o ritmo! A orquestra respondeu com harmonia!','O GPS teve um bom sinal! Poucas falhas de rotas!','O Fio Condutor ligou bem os setores! A energia fluiu!'],
    bom:     ['O Maestro conduziu bem! Umas notas desafinadas mas a música tocou bonita!','O GPS funcionou! Uns travamentos aqui e ali mas chegou no destino!','O Fio Condutor fez a ligação! Não foi 220V mas fez a lâmpada acender!'],
    neutro:  ['O Maestro perdeu o compasso algumas vezes... mas a banda tocou até o fim!','O GPS hoje travou umas vezes... recalculando a rota pra próxima partida!','O Fio Condutor teve umas resistências hoje... mas a corrente não cortou!'],
    abaixo:  ['Hoje o Maestro perdeu a batuta! Mas maestro bom vai lá, pega a batuta e volta! 🎼','O GPS ficou sem sinal hoje... mas amanhã o satélite tá alinhado! 📡','O Fio Condutor hoje deu um curto... mas o eletricista já tá a caminho! ⚡'],
  },
  atacante: {
    apelidos: ['Foguete', 'Ninja', 'Artilheiro'],
    elite:   ['O Foguete não tem freio nem GPS pra voltar! Foi pra cima e DESTRUIU a defesa adversária! 🚀🔥','O Ninja sumiu no início mas quando apareceu... JÁ ERA! O gol saiu do nada!','O Artilheiro chegou, viu e conquistou! Não desperdiçou nenhuma chance!'],
    otimo:   ['O Foguete foi bem! Subiu alto e quando a chance apareceu, não perdoou!','O Ninja apareceu na hora certa! Serviço feito com categoria!','O Artilheiro cumpriu a missão! Esse é o homem pra hora H!'],
    bom:     ['O Foguete deu uma resposta! Não foi explosão mas fez barulho e o time sentiu!','O Ninja apareceu quando precisou! Ajudou a equipe no coletivo!','O Artilheiro mostrou presença! Não foi o dia mais artilheiro mas foi lá!'],
    neutro:  ['O Foguete hoje ficou carregando as balas mas não atirou... Próxima ele derruba o gol!','O Ninja hoje ficou mais no sigilo do que devia... Na próxima aparece na hora H!','O Artilheiro hoje guardou as energias... Poupando pra marcar hat-trick na próxima! 🎯'],
    abaixo:  ['O Foguete hoje ficou na base! Mas combustível tá sendo abastecido pra explodir na próxima! 💥','O Ninja hoje ficou mais no escuro do que devia... Mas ninja bom volta da sombra mais forte! 🥷','O Artilheiro hoje carregou o arco sem flecha... Na próxima o estoque tá cheio! 🏹'],
  },
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function apelido(pos: string): string {
  const f = FRASES[pos] || FRASES.atacante
  return pick(f.apelidos)
}

function fraseMoleque(jog: Jogador, s: Stats): { apelido: string; frase: string; tier: string } {
  const f    = FRASES[jog.posicao] || FRASES.atacante
  const ap   = pick(f.apelidos)
  const pts  = pontos(s)
  const gols = s.gols
  let tier: string
  let frase: string
  if (pts >= 18 || gols >= 3)    { tier = 'elite';  frase = pick(f.elite)  }
  else if (pts >= 10 || gols >= 2){ tier = 'otimo';  frase = pick(f.otimo)  }
  else if (pts >= 5)               { tier = 'bom';    frase = pick(f.bom)    }
  else if (pts >= 0)               { tier = 'neutro'; frase = pick(f.neutro) }
  else                             { tier = 'abaixo'; frase = pick(f.abaixo) }
  return { apelido: ap, frase, tier }
}

/* ── Componente principal ──────────────────────────────── */
export default function AdminNarracao() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const jogo      = adminStore.jogos.buscar(Number(id))
  const mandTimes = jogo ? adminStore.times.buscar(jogo.mandante_id)  : null
  const visitTime = jogo ? adminStore.times.buscar(jogo.visitante_id) : null

  const [mandJogs, setMandJogs]   = useState<Jogador[]>([])
  const [visitJogs, setVisitJogs] = useState<Jogador[]>([])

  useEffect(() => {
    if (!jogo) return
    setMandJogs(adminStore.jogadores.porTime(jogo.mandante_id))
    setVisitJogs(adminStore.jogadores.porTime(jogo.visitante_id))
  }, [jogo])

  const [fase, setFase]     = useState<Fase>('pre')
  const [minuto, setMinuto] = useState(0)
  const [acresc, setAcresc] = useState(0)
  const [gm, setGm]         = useState(0)
  const [gv, setGv]         = useState(0)
  const [eventos, setEventos] = useState<{m:number; txt:string; tipo:EvTipo}[]>([])
  const [stats, setStats]     = useState<Record<number, Stats>>({})
  const [abaElenco, setAbaElenco] = useState<'mand'|'visit'>('mand')
  const [view, setView]       = useState<View>('narrar')
  const [jogSheet, setJogSheet]   = useState<Jogador | null>(null)
  const [sheetEdit, setSheetEdit] = useState<Stats>(DEFAULT)
  const [copiado, setCopiado]     = useState(false)
  const [resolucao, setResolucao] = useState<{ jog: Jogador; apelido: string; frase: string; tier: string; pts: number }[]>([])
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const emJogo = fase === 'primeiro' || fase === 'segundo'
  const todos  = [...mandJogs, ...visitJogs]

  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => { if (emJogo) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', fn)
    return () => window.removeEventListener('beforeunload', fn)
  }, [emJogo])

  useEffect(() => {
    if (emJogo) timer.current = setInterval(() => setMinuto(m => m + 1), 60000)
    else if (timer.current) clearInterval(timer.current)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [emJogo])

  if (!jogo) return <div style={{ padding:32, color:'var(--t-3)' }}>Jogo não encontrado.</div>

  function getStat(pid: number): Stats { return stats[pid] || { ...DEFAULT } }
  function setStat(pid: number, patch: Partial<Stats>) { setStats(s => ({ ...s, [pid]: { ...getStat(pid), ...patch } })) }
  function addEv(tipo: EvTipo, txt: string) { setEventos(ev => [{ m: minuto, txt, tipo }, ...ev].slice(0, 80)) }

  function abrirSheet(j: Jogador) { setJogSheet(j); setSheetEdit({ ...getStat(j.id) }) }
  function salvarSheet() { if (!jogSheet) return; setStat(jogSheet.id, sheetEdit); setJogSheet(null) }

  function iniciar() { setFase('primeiro'); setMinuto(1); addEv('inicio','🟢 Bola rolando! A partida começou!') }

  function gerarResolucao() {
    const res = todos.map(j => {
      const s   = getStat(j.id)
      const { apelido: ap, frase, tier } = fraseMoleque(j, s)
      return { jog: j, apelido: ap, frase, tier, pts: pontos(s) }
    }).sort((a, b) => b.pts - a.pts)
    setResolucao(res)
    setView('encerrar')
  }

  function gerarTextoEscalacao(): string {
    const linhas = resolucao.map((r, i) =>
      `${i+1}. ${r.jog.apelido || r.jog.nome} (${r.pts > 0 ? '+' : ''}${r.pts} pts) — ${r.frase}`
    ).join('\n')
    const artilheiro = [...todos].sort((a,b) => getStat(b.id).gols - getStat(a.id).gols)[0]
    const gols = artilheiro ? getStat(artilheiro.id).gols : 0
    return `🎙️ DIVINO TV — RESOLUÇÃO DO JOGO

${mandTimes?.nome ?? 'Mandante'} ${gm} × ${gv} ${visitTime?.nome ?? 'Visitante'}

${gols > 0 ? `⚽ Artilheiro: ${artilheiro?.apelido || artilheiro?.nome} (${gols} gol${gols > 1 ? 's' : ''})\n` : ''}
━━━━━━━━━━━━━━━━━
CLASSIFICAÇÃO MOLEQUE

${linhas}

Isso foi Divino TV! Futebol de verdade! 🔥`
  }

  /* ── PRÉ-JOGO LOBBY ─────────────────────────────────── */
  if (fase === 'pre') {
    return (
      <div style={{ background:'var(--bg-base)', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'0.5px solid var(--b-1)', background:'rgba(6,6,8,0.97)' }}>
          <button onClick={() => navigate('/admin/jogos')} style={{ background:'none', border:'none', color:'var(--t-3)', fontSize:22, cursor:'pointer', padding:0, lineHeight:1 }}>←</button>
          <span style={{ fontSize:13, fontWeight:700, color:'var(--t-2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Pré-Jogo</span>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:16 }}>
          {/* Placar */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-xl)', padding:'20px 16px', marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'var(--t-3)', marginBottom:14, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Rodada {jogo.rodada}{jogo.local ? ` · ${jogo.local}` : ''}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--t-1)' }}>{mandTimes?.nome ?? '—'}</div>
                <div style={{ fontSize:11, color:'var(--t-3)', marginTop:4 }}>{mandJogs.length} jogadores</div>
              </div>
              <div style={{ padding:'10px 18px', background:'var(--bg-card-2)', borderRadius:'var(--r-lg)' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:26, color:'var(--t-2)' }}>VS</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--t-1)' }}>{visitTime?.nome ?? '—'}</div>
                <div style={{ fontSize:11, color:'var(--t-3)', marginTop:4 }}>{visitJogs.length} jogadores</div>
              </div>
            </div>
          </div>

          {/* Elencos preview */}
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            {[{ label: mandTimes?.nome ?? 'Mandante', jogs: mandJogs }, { label: visitTime?.nome ?? 'Visitante', jogs: visitJogs }].map(({ label, jogs }) => (
              <div key={label} style={{ flex:1, background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:12, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t-3)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>{label}</div>
                {jogs.length === 0 && <div style={{ fontSize:11, color:'var(--t-3)' }}>Sem elenco</div>}
                {jogs.map(j => (
                  <div key={j.id} style={{ display:'flex', alignItems:'center', gap:6, paddingBottom:6, marginBottom:6, borderBottom:'0.5px solid var(--b-1)' }}>
                    <span style={{ fontSize:10, color:'var(--t-3)', width:40, flexShrink:0, textTransform:'capitalize' }}>{j.posicao.slice(0,3)}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {j.apelido || j.nome}
                    </span>
                  </div>
                ))}
                {jogs.length > 0 && (
                  <div style={{ marginTop:6, fontSize:11, color:'var(--t-3)', fontStyle:'italic' }}>
                    Escalação moleque: {jogs.slice(0,3).map(j => `${j.apelido || j.nome}, ${apelido(j.posicao)}`).join(' · ')}...
                  </div>
                )}
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <div style={{ background:'rgba(245,184,0,0.08)', border:'0.5px solid rgba(245,184,0,0.2)', borderRadius:'var(--r-lg)', padding:'12px 14px', marginBottom:16, fontSize:13, color:'var(--yellow)' }}>
              ⚠️ Nenhum jogador cadastrado para estes times. Cadastre em <strong>Jogadores</strong> antes de narrar.
            </div>
          )}
        </div>

        <div style={{ padding:'16px 16px calc(16px + env(safe-area-inset-bottom,0px))', background:'rgba(6,6,8,0.97)', borderTop:'0.5px solid var(--b-1)' }}>
          <button onClick={iniciar} style={{ width:'100%', padding:18, borderRadius:'var(--r-xl)', background:'var(--green)', color:'#000', border:'none', fontSize:17, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span style={{ fontSize:22 }}>▶</span> Iniciar Partida
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'var(--t-3)', margin:'8px 0 0' }}>
            {todos.length} jogadores no elenco · Você poderá registrar eventos e pontuar em tempo real
          </p>
        </div>
      </div>
    )
  }

  /* ── FASES ───────────────────────────────────────────── */
  type FaseBtnCfg = { label:string; cor:string; txt:string; next:()=>void }
  const FASE_BTN: Record<Exclude<Fase,'pre'>, FaseBtnCfg> = {
    primeiro:  { label:'⏸ Intervalo',        cor:'var(--yellow)', txt:'#000', next:()=>{ setFase('intervalo'); if(timer.current) clearInterval(timer.current); addEv('intervalo','⏸ Intervalo! A galera vai lá tomar uma água!') }},
    intervalo: { label:'▶ 2º Tempo',          cor:'var(--green)',  txt:'#000', next:()=>{ setFase('segundo'); setMinuto(46); addEv('inicio','▶ SEGUNDO TEMPO! Vamos lá galera!') }},
    segundo:   { label:'🏁 Encerrar',         cor:'var(--red)',    txt:'#fff', next:()=>{ setFase('encerrado'); if(timer.current) clearInterval(timer.current); addEv('fim','🏁 APITO FINAL! Acabou!') }},
    encerrado: { label:'🎙️ Classificação',    cor:'var(--t-2)',    txt:'#000', next: gerarResolucao },
  }
  const btn = FASE_BTN[fase as Exclude<Fase,'pre'>]

  /* ── RENDER ATIVO ─────────────────────────────────────── */
  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh', maxWidth:520, margin:'0 auto', display:'flex', flexDirection:'column', paddingBottom:'env(safe-area-inset-bottom,0px)' }}>

      {/* HEADER FIXO */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:'rgba(7,8,12,0.97)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid var(--b-1)' }}>

        {/* Linha 1: status + minuto */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 16px 4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            {emJogo && <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--red)', display:'inline-block' }} />}
            <span style={{ fontSize:11, color: emJogo ? 'var(--red)' : 'var(--t-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {fase==='intervalo' ? 'Intervalo' : fase==='encerrado' ? 'Encerrado' : 'Narração Ao Vivo'}
            </span>
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:14, color:'var(--t-2)' }}>
            {String(minuto).padStart(2,'0')}'{acresc>0 && <span style={{ color:'var(--yellow)' }}> +{acresc}</span>}
          </span>
        </div>

        {/* Linha 2: PLACAR */}
        <div style={{ padding:'0 16px 6px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ flex:1, fontSize:12, fontWeight:700, color:'var(--t-1)', textAlign:'right', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{mandTimes?.nome}</span>
          <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
            <BtnPlacar onClick={() => setGm(g=>Math.max(0,g-1))} s="−" />
            <BtnGol onClick={() => { setGm(g=>g+1); addEv('gol',`⚽ GOOOL! ${mandTimes?.nome}!`) }} />
            <span style={{ fontFamily:'var(--font-display)', fontSize:40, color:'var(--t-1)', minWidth:24, textAlign:'center', lineHeight:1 }}>{gm}</span>
            <span style={{ color:'var(--t-3)', fontSize:22, fontFamily:'var(--font-display)' }}>:</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:40, color:'var(--t-1)', minWidth:24, textAlign:'center', lineHeight:1 }}>{gv}</span>
            <BtnGol onClick={() => { setGv(g=>g+1); addEv('gol',`⚽ GOOOL! ${visitTime?.nome}!`) }} />
            <BtnPlacar onClick={() => setGv(g=>Math.max(0,g-1))} s="−" />
          </div>
          <span style={{ flex:1, fontSize:12, fontWeight:700, color:'var(--t-1)', textAlign:'left', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{visitTime?.nome}</span>
        </div>

        {/* Linha 3: acrés + fase btn */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 16px 8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:11, color:'var(--t-3)' }}>+</span>
            <BtnPlacar onClick={() => setAcresc(a=>Math.max(0,a-1))} s="−" small />
            <span style={{ minWidth:16, textAlign:'center', fontSize:13, color:'var(--yellow)', fontWeight:700 }}>{acresc}'</span>
            <BtnPlacar onClick={() => { setAcresc(a=>a+1); addEv('acrescimo',`⏱ +${acresc+1}' de acréscimo`) }} s="+" small />
          </div>
          <div style={{ flex:1 }} />
          <button onClick={btn.next} style={{ background:btn.cor, color:btn.txt, border:'none', borderRadius:'var(--r-md)', padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {btn.label}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderTop:'0.5px solid var(--b-1)' }}>
          {(['narrar','elenco','pontuacao','encerrar'] as View[]).map(v => {
            const labels: Record<View,string> = { narrar:'Narrar', elenco:'Elencos', pontuacao:'Pontuação', encerrar:'Encerrar' }
            return (
              <button key={v} onClick={() => setView(v)} style={{ flex:1, padding:'10px 0', background:'none', border:'none', borderBottom: view===v ? '2px solid var(--red)' : '2px solid transparent', color: view===v ? 'var(--t-1)' : 'var(--t-3)', fontSize:11, fontWeight:600, cursor:'pointer', textTransform:'uppercase', letterSpacing:'0.03em' }}>
                {labels[v]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── VIEWS ─────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:'auto', padding:16 }}>

        {/* NARRAR */}
        {view === 'narrar' && (
          <div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {[
                { label:'🟨 Amarelo', tipo:'amarelo' as EvTipo, txt:'🟨 Cartão amarelo' },
                { label:'🟥 Vermelho', tipo:'vermelho' as EvTipo, txt:'🟥 Cartão vermelho' },
                { label:'↕ Substituição', tipo:'sub' as EvTipo, txt:'↕ Substituição' },
                { label:'📌 Escanteio', tipo:'inicio' as EvTipo, txt:'📌 Escanteio' },
                { label:'🚫 Falta', tipo:'falta' as EvTipo, txt:'🚫 Falta cometida' },
                { label:'💬 Nota', tipo:'inicio' as EvTipo, txt:'💬 Nota do narrador' },
              ].map(a => (
                <button key={a.label} onClick={() => addEv(a.tipo, a.txt)} style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', padding:'9px 14px', color:'var(--t-2)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {a.label}
                </button>
              ))}
            </div>
            {eventos.length === 0 ? (
              <div style={{ textAlign:'center', padding:'50px 0', color:'var(--t-3)', fontSize:13 }}>Nenhum evento ainda. Registre os lances!</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {eventos.map((e, i) => {
                  const cor = e.tipo==='gol' ? 'var(--green)' : e.tipo==='amarelo' ? 'var(--yellow)' : e.tipo==='vermelho' ? 'var(--red)' : e.tipo==='jogada' ? '#60A5FA' : 'var(--t-3)'
                  return (
                    <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'var(--bg-card)', borderRadius:'var(--r-md)', border:'0.5px solid var(--b-1)', alignItems:'flex-start' }}>
                      <span style={{ fontSize:11, color:cor, fontWeight:700, minWidth:24 }}>{String(e.m).padStart(2,'0')}'</span>
                      <span style={{ fontSize:13, color:'var(--t-1)', flex:1 }}>{e.txt}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ELENCOS */}
        {view === 'elenco' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {(['mand','visit'] as const).map(lado => (
                <button key={lado} onClick={() => setAbaElenco(lado)} style={{ flex:1, padding:'10px', background: abaElenco===lado ? 'var(--bg-card-2)' : 'transparent', border:`0.5px solid ${abaElenco===lado ? 'var(--b-2)' : 'var(--b-1)'}`, borderRadius:'var(--r-md)', color: abaElenco===lado ? 'var(--t-1)' : 'var(--t-3)', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  {lado==='mand' ? mandTimes?.nome : visitTime?.nome}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {(abaElenco==='mand' ? mandJogs : visitJogs).map(j => {
                const s = getStat(j.id)
                const cor = s.nota>=8 ? 'var(--green)' : s.nota>=6 ? 'var(--yellow)' : 'var(--red)'
                return (
                  <button key={j.id} onClick={() => abrirSheet(j)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', cursor:'pointer', textAlign:'left', width:'100%' }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:`${cor}15`, border:`1.5px solid ${cor}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:13, color:cor, flexShrink:0 }}>
                      {(j.apelido||j.nome).slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.apelido||j.nome}</div>
                      <div style={{ fontSize:11, color:'var(--t-3)', marginTop:2, textTransform:'capitalize' }}>
                        {j.posicao}
                        {s.gols>0 && ` · ⚽${s.gols}`}
                        {s.assists>0 && ` · 🅰${s.assists}`}
                        {s.defesas>0 && ` · 🧤${s.defesas}`}
                        {s.amarelo && ' · 🟨'}{s.vermelho && ' · 🟥'}
                        {s.melhorJogo && ' · ⭐'}
                      </div>
                    </div>
                    <div style={{ width:42, height:42, borderRadius:'50%', border:`2px solid ${cor}`, background:`${cor}10`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:15, color:cor, flexShrink:0 }}>
                      {s.nota}
                    </div>
                  </button>
                )
              })}
              {(abaElenco==='mand' ? mandJogs : visitJogs).length === 0 && (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--t-3)', fontSize:13 }}>Nenhum jogador neste time. Cadastre em Jogadores.</div>
              )}
            </div>
          </div>
        )}

        {/* PONTUAÇÃO */}
        {view === 'pontuacao' && (
          <div>
            <p style={{ fontSize:11, color:'var(--t-3)', marginBottom:12, textAlign:'center' }}>Gol=+8 · Assist=+5 · Defesa=+3 · Jogada=+4 · Amarelo=−2 · Vermelho=−5 · Falta=−1 · Vacilo=−3 · Nota±2/pt</p>
            {[...todos].sort((a,b) => pontos(getStat(b.id))-pontos(getStat(a.id))).map((j,i) => {
              const s = getStat(j.id); const pts = pontos(s)
              const isMand = mandJogs.some(m=>m.id===j.id)
              return (
                <div key={j.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:22, color: i<3 ? 'var(--yellow)' : 'var(--t-3)', width:24, textAlign:'center' }}>{i+1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--t-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.apelido||j.nome}</div>
                    <div style={{ fontSize:11, color:'var(--t-3)' }}>{isMand ? mandTimes?.nome : visitTime?.nome}{s.gols>0&&` · ⚽${s.gols}`}{s.melhorJogo&&' · ⭐'}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:26, color: pts>0 ? 'var(--green)' : pts<0 ? 'var(--red)' : 'var(--t-3)' }}>{pts>0?`+${pts}`:pts}</div>
                    <div style={{ fontSize:10, color:'var(--t-3)' }}>pts</div>
                  </div>
                </div>
              )
            })}
            {todos.length===0 && <div style={{ textAlign:'center', padding:'40px 0', color:'var(--t-3)', fontSize:13 }}>Elenco vazio.</div>}
          </div>
        )}

        {/* ENCERRAR */}
        {view === 'encerrar' && (
          <div>
            {resolucao.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0', color:'var(--t-3)' }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🎙️</div>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--t-2)', marginBottom:8 }}>Classificação Moleque</div>
                <div style={{ fontSize:13, color:'var(--t-3)', marginBottom:24 }}>
                  {fase==='encerrado' ? 'Gere as frases finais de cada jogador!' : 'Encerre a partida primeiro para gerar a classificação.'}
                </div>
                {fase==='encerrado' && (
                  <button onClick={gerarResolucao} style={{ padding:'14px 28px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-lg)', color:'var(--red)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    🎙️ Gerar classificação moleque
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div style={{ textAlign:'center', marginBottom:20 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:20, color:'var(--t-1)' }}>{mandTimes?.nome} {gm} × {gv} {visitTime?.nome}</div>
                </div>
                {resolucao.map((r, i) => {
                  const tierCor: Record<string,string> = { elite:'var(--yellow)', otimo:'var(--green)', bom:'#60A5FA', neutro:'var(--t-2)', abaixo:'var(--t-3)' }
                  const cor = tierCor[r.tier] || 'var(--t-2)'
                  return (
                    <div key={r.jog.id} style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'14px 16px', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:20, color: i<3?'var(--yellow)':'var(--t-3)', minWidth:24 }}>{i+1}</span>
                        <div style={{ width:38, height:38, borderRadius:'50%', background:`${cor}15`, border:`1.5px solid ${cor}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:12, color:cor, flexShrink:0 }}>
                          {(r.jog.apelido||r.jog.nome).slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:14, fontWeight:700, color:'var(--t-1)' }}>{r.jog.apelido||r.jog.nome}</div>
                          <div style={{ fontSize:11, color:cor, fontWeight:600 }}>{r.apelido}</div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <div style={{ fontFamily:'var(--font-display)', fontSize:24, color: r.pts>0?'var(--green)':r.pts<0?'var(--red)':'var(--t-3)' }}>{r.pts>0?`+${r.pts}`:r.pts}</div>
                          <div style={{ fontSize:10, color:'var(--t-3)' }}>pts</div>
                        </div>
                      </div>
                      <div style={{ fontSize:13, color:'var(--t-2)', lineHeight:1.5, fontStyle:'italic', paddingLeft:72 }}>{r.frase}</div>
                    </div>
                  )
                })}
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button onClick={() => { navigator.clipboard.writeText(gerarTextoEscalacao()); setCopiado(true); setTimeout(()=>setCopiado(false),2500) }}
                    style={{ flex:1, padding:'14px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    {copiado ? '✓ Copiado!' : '📋 Copiar para WhatsApp'}
                  </button>
                  <button onClick={gerarResolucao}
                    style={{ padding:'14px', background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', color:'var(--t-3)', fontSize:13, cursor:'pointer' }}>
                    🔄
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SHEET JOGADOR (Cartola-style) */}
      {jogSheet && (
        <div onClick={() => setJogSheet(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'var(--bg-sheet)', borderRadius:'var(--r-xl) var(--r-xl) 0 0', padding:'0 0 calc(20px + env(safe-area-inset-bottom,0px))', width:'100%', maxWidth:520, margin:'0 auto', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:40, height:4, background:'var(--b-2)', borderRadius:2, margin:'16px auto 0' }} />

            {/* Header jogador */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px 12px', borderBottom:'0.5px solid var(--b-1)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--bg-card-2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:16, color:'var(--t-2)', flexShrink:0 }}>
                {(jogSheet.apelido||jogSheet.nome).slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--t-1)' }}>{jogSheet.apelido||jogSheet.nome}</div>
                <div style={{ fontSize:12, color:'var(--t-3)', textTransform:'capitalize', marginTop:2 }}>{jogSheet.posicao} · {apelido(jogSheet.posicao)}</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:32, color: sheetEdit.nota>=8?'var(--green)':sheetEdit.nota>=6?'var(--yellow)':'var(--red)', lineHeight:1 }}>{sheetEdit.nota}</div>
                <div style={{ fontSize:10, color:'var(--t-3)' }}>nota</div>
              </div>
            </div>

            <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:16 }}>

              {/* Eventos positivos */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Eventos positivos</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {([['⚽','gols','Gol',8], ['🅰️','assists','Assist',5], ['🧤','defesas','Defesa',3], ['🚀','jogadas','Destaque',4]] as [string,keyof Stats,string,number][]).map(([icon, key, label, val]) => (
                    <div key={key as string} style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'10px 6px', textAlign:'center' }}>
                      <div style={{ fontSize:22, marginBottom:2 }}>{icon}</div>
                      <div style={{ fontSize:10, color:'var(--t-3)', marginBottom:6 }}>{label} <span style={{ color:'var(--green)' }}>+{val}</span></div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <button onClick={() => setSheetEdit(e => ({ ...e, [key]: Math.max(0,(e[key as keyof Stats] as number)-1) }))} style={ctrBtn}>−</button>
                        <span style={{ fontSize:18, fontWeight:700, color:'var(--t-1)', minWidth:16, textAlign:'center' }}>{sheetEdit[key as keyof Stats] as number}</span>
                        <button onClick={() => setSheetEdit(e => ({ ...e, [key]: (e[key as keyof Stats] as number)+1 }))} style={ctrBtn}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eventos negativos */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--t-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Eventos negativos</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {([['🚫','faltas','Falta',1], ['💨','passosErrados','P. Errado',0.5], ['🤦','vacilos','Vacilo',3]] as [string,keyof Stats,string,number][]).map(([icon, key, label, val]) => (
                    <div key={key as string} style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'10px 6px', textAlign:'center' }}>
                      <div style={{ fontSize:22, marginBottom:2 }}>{icon}</div>
                      <div style={{ fontSize:10, color:'var(--t-3)', marginBottom:6 }}>{label} <span style={{ color:'var(--red)' }}>−{val}</span></div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <button onClick={() => setSheetEdit(e => ({ ...e, [key]: Math.max(0,(e[key as keyof Stats] as number)-1) }))} style={ctrBtn}>−</button>
                        <span style={{ fontSize:18, fontWeight:700, color:'var(--t-1)', minWidth:16, textAlign:'center' }}>{sheetEdit[key as keyof Stats] as number}</span>
                        <button onClick={() => setSheetEdit(e => ({ ...e, [key]: (e[key as keyof Stats] as number)+1 }))} style={ctrBtn}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cartões + Melhor */}
              <div style={{ display:'flex', gap:8 }}>
                {([
                  { key:'amarelo' as const,    icon:'🟨', label:'Amarelo',   cor:'rgba(245,184,0,0.15)', bord:'rgba(245,184,0,0.4)', txt:'var(--yellow)' },
                  { key:'vermelho' as const,   icon:'🟥', label:'Vermelho',  cor:'rgba(232,35,42,0.15)', bord:'var(--red-border)',   txt:'var(--red)'    },
                  { key:'melhorJogo' as const, icon:'⭐', label:'Melhor',    cor:'rgba(245,184,0,0.15)', bord:'rgba(245,184,0,0.4)', txt:'var(--yellow)' },
                ]).map(({ key, icon, label, cor, bord, txt }) => {
                  const isOn = sheetEdit[key] as boolean
                  return (
                    <button key={key} onClick={() => setSheetEdit(e => ({ ...e, [key]: !e[key] }))} style={{ flex:1, padding:'14px 6px', background: isOn?cor:'var(--bg-card)', border:`0.5px solid ${isOn?bord:'var(--b-1)'}`, borderRadius:'var(--r-md)', color: isOn?txt:'var(--t-3)', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <span style={{ fontSize:20 }}>{icon}</span>
                      <span style={{ fontSize:11 }}>{label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Nota slider */}
              <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-lg)', padding:'14px 16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontSize:13, color:'var(--t-2)', fontWeight:600 }}>Nota do jogo</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:36, color: sheetEdit.nota>=8?'var(--green)':sheetEdit.nota>=6?'var(--yellow)':'var(--red)', lineHeight:1 }}>{sheetEdit.nota}</span>
                </div>
                <input type="range" min={1} max={10} step={0.5} value={sheetEdit.nota} onChange={e => setSheetEdit(ed => ({ ...ed, nota: Number(e.target.value) }))} style={{ width:'100%', accentColor:'var(--red)' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--t-3)', marginTop:4 }}>
                  <span>1 — Péssimo</span><span>5 — Médio</span><span>10 — Elite</span>
                </div>
              </div>

              {/* Registro de evento rápido */}
              <div style={{ background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', padding:'10px 14px' }}>
                <div style={{ fontSize:12, color:'var(--t-3)', marginBottom:2 }}>Pontuação atual</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:28, color: pontos(sheetEdit)>0?'var(--green)':pontos(sheetEdit)<0?'var(--red)':'var(--t-2)' }}>
                  {pontos(sheetEdit)>0?`+${pontos(sheetEdit)}`:pontos(sheetEdit)} pts
                </div>
              </div>

              {/* Ações */}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => { addEv(sheetEdit.gols > (stats[jogSheet.id]?.gols||0) ? 'gol' : 'assist', `📝 ${jogSheet.apelido||jogSheet.nome} — pontuação atualizada`); salvarSheet() }}
                  style={{ flex:2, padding:'15px', background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  Salvar pontuação
                </button>
                <button onClick={() => setJogSheet(null)} style={{ flex:1, padding:'15px', background:'var(--bg-card)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-md)', color:'var(--t-3)', fontSize:13, cursor:'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Botões auxiliares ─────────────────────────────────── */
function BtnGol({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width:32, height:32, background:'var(--red-dim)', border:'0.5px solid var(--red-border)', borderRadius:'var(--r-sm)', color:'var(--red)', fontSize:20, cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>+</button>
  )
}
function BtnPlacar({ onClick, s, small }: { onClick:()=>void; s:string; small?:boolean }) {
  const sz = small ? 22 : 28
  return (
    <button onClick={onClick} style={{ width:sz, height:sz, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:4, color:'var(--t-3)', fontSize:small?12:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s}</button>
  )
}

const ctrBtn: React.CSSProperties = { width:34, height:34, background:'var(--bg-card-2)', border:'0.5px solid var(--b-1)', borderRadius:'var(--r-sm)', color:'var(--t-1)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }
