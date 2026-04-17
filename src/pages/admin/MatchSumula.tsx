import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type GoalRow = { player_id: string; team_id: string; jogador: string; minuto: string; tipo: string }
type CardRow = { player_id: string; team_id: string; jogador: string; minuto: string; tipo: string }
type RatingRow = { player_id: number; team_id: number; nome: string; nota: number; melhor_jogo: boolean }

export function MatchSumula() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [match, setMatch] = useState<any>(null)
  const [elenco, setElenco] = useState<any[]>([]) // todos jogadores dos dois times
  const [isPro, setIsPro] = useState(false)
  const [tab, setTab] = useState<'gols'|'cartoes'|'notas'|'relatorio'>('gols')
  const [gols, setGols] = useState<GoalRow[]>([])
  const [cartoes, setCartoes] = useState<CardRow[]>([])
  const [notas, setNotas] = useState<RatingRow[]>([])
  const [relatorio, setRelatorio] = useState({ arbitro:'', publico:'', observacoes:'' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: m } = await supabase
        .from('matches')
        .select('*, championship:championships(org_id), mandante:teams!mandante_id(id,nome), visitante:teams!visitante_id(id,nome), gols:match_goals(*), cartoes:match_cards(*), notas:match_ratings(*), sumula:match_reports(*)')
        .eq('id', id).single()
      setMatch(m)

      // Verificar plano
      if (m?.championship?.org_id) {
        const { data: org } = await supabase.from('organizations').select('plano').eq('id', m.championship.org_id).single()
        setIsPro(org?.plano === 'pro')
      }

      // Elenco: jogadores dos dois times
      const { data: tp1 } = await supabase.from('team_players').select('*, player:players(id,nome,apelido)').eq('team_id', m?.mandante_id)
      const { data: tp2 } = await supabase.from('team_players').select('*, player:players(id,nome,apelido)').eq('team_id', m?.visitante_id)
      const all = [
        ...(tp1||[]).map((tp: any) => ({ ...tp.player, team_id: m?.mandante_id, team_nome: m?.mandante?.nome })),
        ...(tp2||[]).map((tp: any) => ({ ...tp.player, team_id: m?.visitante_id, team_nome: m?.visitante?.nome })),
      ]
      setElenco(all)

      // Carregar dados existentes
      if (m?.gols?.length) setGols(m.gols.map((g: any) => ({ player_id: String(g.player_id||''), team_id: String(g.team_id), jogador: g.jogador, minuto: String(g.minuto||''), tipo: g.tipo })))
      if (m?.cartoes?.length) setCartoes(m.cartoes.map((c: any) => ({ player_id: String(c.player_id||''), team_id: String(c.team_id), jogador: c.jogador, minuto: String(c.minuto||''), tipo: c.tipo })))
      if (m?.notas?.length) setNotas(m.notas.map((n: any) => ({ player_id: n.player_id, team_id: n.team_id, nome: '', nota: Number(n.nota), melhor_jogo: n.melhor_jogo })))
      else if (all.length) setNotas(all.map(p => ({ player_id: p.id, team_id: p.team_id, nome: p.apelido||p.nome, nota: 7, melhor_jogo: false })))
      if (m?.sumula) setRelatorio({ arbitro: m.sumula.arbitro||'', publico: String(m.sumula.publico||''), observacoes: m.sumula.observacoes||'' })
    }
    load()
  }, [id])

  function addGol() { setGols(g => [...g, { player_id:'', team_id: String(match?.mandante_id||''), jogador:'', minuto:'', tipo:'normal' }]) }
  function addCartao() { setCartoes(c => [...c, { player_id:'', team_id: String(match?.mandante_id||''), jogador:'', minuto:'', tipo:'amarelo' }]) }
  function setMelhorJogo(idx: number) { setNotas(ns => ns.map((n,i) => ({ ...n, melhor_jogo: i===idx }))) }

  function preencherNomeGol(idx: number, playerId: string, teamId: string) {
    const p = elenco.find(e => String(e.id)===playerId)
    setGols(gs => gs.map((g,i) => i===idx ? { ...g, player_id:playerId, team_id:teamId, jogador: p?.apelido||p?.nome||g.jogador } : g))
  }
  function preencherNomeCartao(idx: number, playerId: string, teamId: string) {
    const p = elenco.find(e => String(e.id)===playerId)
    setCartoes(cs => cs.map((c,i) => i===idx ? { ...c, player_id:playerId, team_id:teamId, jogador: p?.apelido||p?.nome||c.jogador } : c))
  }

  async function salvar() {
    setLoading(true)
    const mid = Number(id)
    // Deletar antigos e inserir novos
    await supabase.from('match_goals').delete().eq('match_id', mid)
    if (gols.length) await supabase.from('match_goals').insert(gols.filter(g=>g.jogador).map(g => ({
      match_id: mid, team_id: Number(g.team_id), player_id: g.player_id ? Number(g.player_id) : null,
      jogador: g.jogador, minuto: g.minuto ? Number(g.minuto) : null, tipo: g.tipo
    })))

    await supabase.from('match_cards').delete().eq('match_id', mid)
    if (cartoes.length) await supabase.from('match_cards').insert(cartoes.filter(c=>c.jogador).map(c => ({
      match_id: mid, team_id: Number(c.team_id), player_id: c.player_id ? Number(c.player_id) : null,
      jogador: c.jogador, minuto: c.minuto ? Number(c.minuto) : null, tipo: c.tipo
    })))

    if (isPro && notas.length) {
      await supabase.from('match_ratings').upsert(notas.map(n => ({
        match_id: mid, player_id: n.player_id, team_id: n.team_id, nota: n.nota, melhor_jogo: n.melhor_jogo
      })), { onConflict: 'match_id,player_id' })
      // Melhor do jogo → award automático
      const melhor = notas.find(n => n.melhor_jogo)
      if (melhor) {
        await supabase.from('awards').upsert({
          championship_id: match.championship_id, player_id: melhor.player_id, team_id: melhor.team_id,
          tipo: 'melhor_jogo', match_id: mid, referencia: `Rodada ${match.rodada}`
        }, { onConflict: 'championship_id,player_id,tipo,match_id' })
      }
    }

    await supabase.from('match_reports').upsert({
      match_id: mid, arbitro: relatorio.arbitro||null, publico: relatorio.publico ? Number(relatorio.publico) : null, observacoes: relatorio.observacoes||null
    }, { onConflict: 'match_id' })

    setLoading(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!match) return <div className="flex justify-center pt-20"><div className="text-gz-primary animate-spin text-3xl">⚽</div></div>

  const times = [
    { id: String(match.mandante_id), nome: match.mandante?.nome },
    { id: String(match.visitante_id), nome: match.visitante?.nome },
  ]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold">Súmula</h1>
        <button onClick={() => nav('/admin/jogos')} className="gz-btn gz-btn-secondary gz-btn-sm">← Voltar</button>
      </div>
      <p className="text-gz-text2 mb-5 text-sm">{match.mandante?.nome} × {match.visitante?.nome} · Rodada {match.rodada}</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gz-card rounded-xl p-1 mb-5 overflow-x-auto">
        {([['gols','⚽ Gols'],['cartoes','🟨 Cartões'],['notas','📊 Notas'],['relatorio','📋 Relatório']] as const).map(([t,l]) => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-all ${tab===t ? 'bg-gz-primary text-black' : 'text-gz-text2 hover:text-white'} ${t==='notas'&&!isPro ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={t==='notas' && !isPro}>
            {l} {t==='notas'&&!isPro ? '🔒' : ''}
          </button>
        ))}
      </div>

      {/* Gols */}
      {tab==='gols' && (
        <div className="space-y-3">
          {gols.map((g,i) => (
            <div key={i} className="gz-card p-3 flex gap-2 flex-wrap items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="gz-label">Time</label>
                <select className="gz-input" value={g.team_id} onChange={e => setGols(gs => gs.map((x,j)=>j===i?{...x,team_id:e.target.value}:x))}>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="gz-label">Jogador</label>
                <select className="gz-input" value={g.player_id}
                  onChange={e => preencherNomeGol(i, e.target.value, g.team_id)}>
                  <option value="">Digitar nome...</option>
                  {elenco.filter(p => String(p.team_id)===g.team_id).map(p => <option key={p.id} value={p.id}>{p.apelido||p.nome}</option>)}
                </select>
              </div>
              {!g.player_id && (
                <div className="flex-1 min-w-[140px]">
                  <label className="gz-label">Nome</label>
                  <input className="gz-input" value={g.jogador} onChange={e => setGols(gs => gs.map((x,j)=>j===i?{...x,jogador:e.target.value}:x))} placeholder="Nome do jogador"/>
                </div>
              )}
              <div className="w-20">
                <label className="gz-label">Minuto</label>
                <input className="gz-input" type="number" value={g.minuto} onChange={e => setGols(gs => gs.map((x,j)=>j===i?{...x,minuto:e.target.value}:x))} placeholder="45"/>
              </div>
              <div className="w-28">
                <label className="gz-label">Tipo</label>
                <select className="gz-input" value={g.tipo} onChange={e => setGols(gs => gs.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))}>
                  <option value="normal">Normal</option>
                  <option value="penalti">Pênalti</option>
                  <option value="contra">Contra</option>
                </select>
              </div>
              <button onClick={() => setGols(gs => gs.filter((_,j)=>j!==i))} className="gz-btn gz-btn-danger gz-btn-sm mb-0.5">✕</button>
            </div>
          ))}
          <button onClick={addGol} className="gz-btn gz-btn-secondary gz-btn-sm w-full">+ Adicionar gol</button>
        </div>
      )}

      {/* Cartões */}
      {tab==='cartoes' && (
        <div className="space-y-3">
          {cartoes.map((c,i) => (
            <div key={i} className="gz-card p-3 flex gap-2 flex-wrap items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="gz-label">Time</label>
                <select className="gz-input" value={c.team_id} onChange={e => setCartoes(cs => cs.map((x,j)=>j===i?{...x,team_id:e.target.value}:x))}>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="gz-label">Jogador</label>
                <select className="gz-input" value={c.player_id}
                  onChange={e => preencherNomeCartao(i, e.target.value, c.team_id)}>
                  <option value="">Digitar nome...</option>
                  {elenco.filter(p => String(p.team_id)===c.team_id).map(p => <option key={p.id} value={p.id}>{p.apelido||p.nome}</option>)}
                </select>
              </div>
              {!c.player_id && (
                <div className="flex-1 min-w-[140px]">
                  <label className="gz-label">Nome</label>
                  <input className="gz-input" value={c.jogador} onChange={e => setCartoes(cs => cs.map((x,j)=>j===i?{...x,jogador:e.target.value}:x))} placeholder="Nome do jogador"/>
                </div>
              )}
              <div className="w-20">
                <label className="gz-label">Minuto</label>
                <input className="gz-input" type="number" value={c.minuto} onChange={e => setCartoes(cs => cs.map((x,j)=>j===i?{...x,minuto:e.target.value}:x))}/>
              </div>
              <div className="w-36">
                <label className="gz-label">Tipo</label>
                <select className="gz-input" value={c.tipo} onChange={e => setCartoes(cs => cs.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))}>
                  <option value="amarelo">🟨 Amarelo</option>
                  <option value="vermelho">🟥 Vermelho</option>
                  <option value="amarelo_vermelho">🟨🟥 Amarelo+Vermelho</option>
                </select>
              </div>
              <button onClick={() => setCartoes(cs => cs.filter((_,j)=>j!==i))} className="gz-btn gz-btn-danger gz-btn-sm mb-0.5">✕</button>
            </div>
          ))}
          <button onClick={addCartao} className="gz-btn gz-btn-secondary gz-btn-sm w-full">+ Adicionar cartão</button>
        </div>
      )}

      {/* Notas — só Pro */}
      {tab==='notas' && isPro && (
        <div className="space-y-2">
          <p className="text-gz-text2 text-xs mb-3">Defina a nota (0–10) de cada jogador e marque o Melhor do Jogo.</p>
          {notas.map((n,i) => {
            const p = elenco.find(e => e.id===n.player_id)
            return (
              <div key={i} className="gz-card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{p?.apelido||p?.nome}</p>
                  <p className="text-gz-text2 text-xs">{p?.team_nome}</p>
                </div>
                <input type="range" min="0" max="10" step="0.5" value={n.nota}
                  onChange={e => setNotas(ns => ns.map((x,j)=>j===i?{...x,nota:Number(e.target.value)}:x))}
                  className="w-24 accent-gz-primary"/>
                <span className="font-extrabold text-gz-primary w-8 text-center">{n.nota}</span>
                <button onClick={() => setMelhorJogo(i)}
                  className={`gz-btn gz-btn-sm ${n.melhor_jogo ? 'gz-btn-gold' : 'gz-btn-secondary'}`}>
                  {n.melhor_jogo ? '⭐ Melhor' : '☆'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Relatório */}
      {tab==='relatorio' && (
        <div className="gz-card p-5 space-y-4">
          <div><label className="gz-label">Árbitro</label><input className="gz-input" value={relatorio.arbitro} onChange={e=>setRelatorio(r=>({...r,arbitro:e.target.value}))} placeholder="Nome do árbitro"/></div>
          <div><label className="gz-label">Público</label><input className="gz-input" type="number" value={relatorio.publico} onChange={e=>setRelatorio(r=>({...r,publico:e.target.value}))} placeholder="Ex: 500"/></div>
          <div><label className="gz-label">Observações</label><textarea className="gz-input resize-none" rows={3} value={relatorio.observacoes} onChange={e=>setRelatorio(r=>({...r,observacoes:e.target.value}))}/></div>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={salvar} disabled={loading} className={`gz-btn gz-btn-primary flex-1 ${saved?'bg-green-400':''}`}>
          {saved ? '✅ Salvo!' : loading ? 'Salvando...' : 'Salvar súmula'}
        </button>
      </div>
    </div>
  )
}
