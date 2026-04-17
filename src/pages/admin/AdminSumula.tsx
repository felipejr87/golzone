import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type GoalRow = { id?:number; jogador:string; team_id:string; minuto:string; tipo:string }
type CardRow = { id?:number; jogador:string; team_id:string; minuto:string; tipo:string }
type NotaRow = { player_nome:string; team_id:string; nota:string; melhor_jogo:boolean }

export default function AdminSumula() {
  const { id } = useParams()
  const [match, setMatch] = useState<any>(null)
  const [gols, setGols] = useState<GoalRow[]>([])
  const [cartoes, setCartoes] = useState<CardRow[]>([])
  const [notas, setNotas] = useState<NotaRow[]>([])
  const [report, setReport] = useState({ arbitro:'', publico:'', observacoes:'' })
  const [aba, setAba] = useState<'gols'|'cartoes'|'notas'|'relatorio'>('gols')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function carregar() {
    const { data } = await supabase.from('matches').select(`
      *, mandante:teams!mandante_id(id,nome), visitante:teams!visitante_id(id,nome),
      gols:match_goals(*), cartoes:match_cards(*),
      notas:match_ratings(*, player:players(nome)),
      sumula:match_reports(*)
    `).eq('id', id).single()
    if (!data) return
    setMatch(data)
    if (data.gols?.length) setGols(data.gols.map((g: any) => ({ id:g.id, jogador:g.jogador, team_id:String(g.team_id), minuto:String(g.minuto||''), tipo:g.tipo })))
    if (data.cartoes?.length) setCartoes(data.cartoes.map((c: any) => ({ id:c.id, jogador:c.jogador, team_id:String(c.team_id), minuto:String(c.minuto||''), tipo:c.tipo })))
    if (data.notas?.length) setNotas(data.notas.map((n: any) => ({ player_nome:n.player?.nome||'', team_id:String(n.team_id), nota:String(n.nota), melhor_jogo:n.melhor_jogo })))
    if (data.sumula) setReport({ arbitro:data.sumula.arbitro||'', publico:String(data.sumula.publico||''), observacoes:data.sumula.observacoes||'' })
  }
  useEffect(() => { carregar() }, [id])

  async function salvar() {
    setSaving(true)
    const mid = Number(id)

    if (aba === 'gols') {
      await supabase.from('match_goals').delete().eq('match_id', mid)
      const validos = gols.filter(g => g.jogador.trim())
      if (validos.length) await supabase.from('match_goals').insert(validos.map(g => ({
        match_id: mid, team_id: Number(g.team_id), jogador: g.jogador.trim(),
        minuto: g.minuto ? Number(g.minuto) : null, tipo: g.tipo
      })))
    }

    if (aba === 'cartoes') {
      await supabase.from('match_cards').delete().eq('match_id', mid)
      const validos = cartoes.filter(c => c.jogador.trim())
      if (validos.length) await supabase.from('match_cards').insert(validos.map(c => ({
        match_id: mid, team_id: Number(c.team_id), jogador: c.jogador.trim(),
        minuto: c.minuto ? Number(c.minuto) : null, tipo: c.tipo
      })))
    }

    if (aba === 'notas') {
      // Buscar ou criar jogadores por nome, depois salvar notas
      await supabase.from('match_ratings').delete().eq('match_id', mid)
      const { data: org } = await supabase.from('organizations').select('id').eq('slug','divino-tv').single()
      const validos = notas.filter(n => n.player_nome.trim() && n.nota)
      for (const n of validos) {
        // upsert jogador por nome
        let { data: player } = await supabase.from('players').select('id').eq('nome', n.player_nome.trim()).eq('org_id', org?.id).single()
        if (!player) {
          const { data: np } = await supabase.from('players').insert({ nome: n.player_nome.trim(), org_id: org?.id }).select('id').single()
          player = np
        }
        if (player) {
          await supabase.from('match_ratings').upsert({
            match_id: mid, player_id: player.id, team_id: Number(n.team_id),
            nota: Number(n.nota), melhor_jogo: n.melhor_jogo
          }, { onConflict: 'match_id,player_id' })
        }
      }
      // Melhor do jogo → premiação automática
      const melhor = validos.find(n => n.melhor_jogo)
      if (melhor && match) {
        let { data: player } = await supabase.from('players').select('id').eq('nome', melhor.player_nome.trim()).single()
        if (player) {
          await supabase.from('awards').upsert({
            championship_id: match.championship_id, player_id: player.id, team_id: Number(melhor.team_id),
            tipo: 'melhor_jogo', match_id: mid, referencia: `Rodada ${match.rodada}`
          })
        }
      }
    }

    if (aba === 'relatorio') {
      await supabase.from('match_reports').upsert({
        match_id: mid,
        arbitro: report.arbitro || null,
        publico: report.publico ? Number(report.publico) : null,
        observacoes: report.observacoes || null
      }, { onConflict: 'match_id' })
    }

    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    await carregar()
  }

  if (!match) return <div className="flex justify-center pt-24"><span className="animate-spin text-3xl">⚽</span></div>

  const times = [
    { id: String(match.mandante?.id), nome: match.mandante?.nome },
    { id: String(match.visitante?.id), nome: match.visitante?.nome },
  ].filter(t => t.id && t.id !== 'undefined')

  const INPUT_CLASS = "bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-green-400 transition"
  const SEL_CLASS = `${INPUT_CLASS} cursor-pointer`

  const abas: {key: typeof aba, label:string}[] = [
    {key:'gols', label:'⚽ Gols'},
    {key:'cartoes', label:'🟨 Cartões'},
    {key:'notas', label:'⭐ Notas'},
    {key:'relatorio', label:'📝 Relatório'},
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin/jogos" className="text-gray-400 hover:text-white transition text-sm">← Jogos</Link>
      </div>
      <h1 className="text-2xl font-black text-white mb-1">Súmula</h1>
      <p className="text-gray-400 text-sm mb-6">{match.mandante?.nome} × {match.visitante?.nome} · Rodada {match.rodada}</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {abas.map(a => (
          <button key={a.key} onClick={() => setAba(a.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0 transition ${
              aba===a.key ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/15'
            }`}>{a.label}</button>
        ))}
      </div>

      {/* GOLS */}
      {aba === 'gols' && (
        <div>
          <div className="space-y-2 mb-4">
            {gols.map((g,i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap bg-[#111811] border border-white/10 rounded-xl p-3">
                <input value={g.jogador} onChange={e => setGols(gols.map((x,j) => j===i?{...x,jogador:e.target.value}:x))}
                  placeholder="Nome do jogador *" className={`${INPUT_CLASS} flex-1 min-w-32`}/>
                <select value={g.team_id} onChange={e => setGols(gols.map((x,j) => j===i?{...x,team_id:e.target.value}:x))}
                  className={SEL_CLASS}>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <input type="number" value={g.minuto} onChange={e => setGols(gols.map((x,j) => j===i?{...x,minuto:e.target.value}:x))}
                  placeholder="Min" className={`${INPUT_CLASS} w-20`}/>
                <select value={g.tipo} onChange={e => setGols(gols.map((x,j) => j===i?{...x,tipo:e.target.value}:x))}
                  className={SEL_CLASS}>
                  <option value="normal">Normal</option>
                  <option value="penalti">Pênalti</option>
                  <option value="contra">Contra</option>
                </select>
                <button onClick={() => setGols(gols.filter((_,j) => j!==i))} className="text-red-400 hover:text-red-300 text-xl leading-none px-1">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setGols([...gols, { jogador:'', team_id: times[0]?.id||'', minuto:'', tipo:'normal' }])}
            className="text-green-400 text-sm font-bold hover:text-green-300 transition mb-6">+ Adicionar gol</button>
        </div>
      )}

      {/* CARTÕES */}
      {aba === 'cartoes' && (
        <div>
          <div className="space-y-2 mb-4">
            {cartoes.map((c,i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap bg-[#111811] border border-white/10 rounded-xl p-3">
                <input value={c.jogador} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,jogador:e.target.value}:x))}
                  placeholder="Nome do jogador *" className={`${INPUT_CLASS} flex-1 min-w-32`}/>
                <select value={c.team_id} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,team_id:e.target.value}:x))}
                  className={SEL_CLASS}>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <input type="number" value={c.minuto} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,minuto:e.target.value}:x))}
                  placeholder="Min" className={`${INPUT_CLASS} w-20`}/>
                <select value={c.tipo} onChange={e => setCartoes(cartoes.map((x,j) => j===i?{...x,tipo:e.target.value}:x))}
                  className={SEL_CLASS}>
                  <option value="amarelo">🟨 Amarelo</option>
                  <option value="vermelho">🟥 Vermelho</option>
                  <option value="amarelo_vermelho">🟨🟥 A+V</option>
                </select>
                <button onClick={() => setCartoes(cartoes.filter((_,j) => j!==i))} className="text-red-400 hover:text-red-300 text-xl leading-none px-1">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setCartoes([...cartoes, { jogador:'', team_id: times[0]?.id||'', minuto:'', tipo:'amarelo' }])}
            className="text-green-400 text-sm font-bold hover:text-green-300 transition mb-6">+ Adicionar cartão</button>
        </div>
      )}

      {/* NOTAS */}
      {aba === 'notas' && (
        <div>
          <p className="text-gray-400 text-sm mb-4">Digite o nome, time e nota (0–10). Marque ⭐ para o melhor do jogo (apenas 1).</p>
          <div className="space-y-2 mb-4">
            {notas.map((n,i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap bg-[#111811] border border-white/10 rounded-xl p-3">
                <input value={n.player_nome} onChange={e => setNotas(notas.map((x,j) => j===i?{...x,player_nome:e.target.value}:x))}
                  placeholder="Nome do jogador *" className={`${INPUT_CLASS} flex-1 min-w-32`}/>
                <select value={n.team_id} onChange={e => setNotas(notas.map((x,j) => j===i?{...x,team_id:e.target.value}:x))}
                  className={SEL_CLASS}>
                  {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
                <input type="number" min="0" max="10" step="0.5" value={n.nota}
                  onChange={e => setNotas(notas.map((x,j) => j===i?{...x,nota:e.target.value}:x))}
                  placeholder="Nota" className={`${INPUT_CLASS} w-20`}/>
                <label className="flex items-center gap-1 text-yellow-400 cursor-pointer" title="Melhor do jogo">
                  <input type="checkbox" checked={!!n.melhor_jogo}
                    onChange={e => setNotas(notas.map((x,j) => ({...x, melhor_jogo: j===i ? e.target.checked : false})))}
                    className="accent-yellow-400"/>
                  ⭐
                </label>
                <button onClick={() => setNotas(notas.filter((_,j) => j!==i))} className="text-red-400 hover:text-red-300 text-xl leading-none px-1">×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setNotas([...notas, { player_nome:'', team_id: times[0]?.id||'', nota:'', melhor_jogo:false }])}
            className="text-green-400 text-sm font-bold hover:text-green-300 transition mb-6">+ Adicionar jogador</button>
        </div>
      )}

      {/* RELATÓRIO */}
      {aba === 'relatorio' && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl p-5 space-y-3 mb-6">
          <input value={report.arbitro} onChange={e => setReport({...report, arbitro:e.target.value})}
            placeholder="Árbitro" className={`w-full ${INPUT_CLASS}`}/>
          <input type="number" value={report.publico} onChange={e => setReport({...report, publico:e.target.value})}
            placeholder="Público presente" className={`w-full ${INPUT_CLASS}`}/>
          <textarea value={report.observacoes} onChange={e => setReport({...report, observacoes:e.target.value})}
            placeholder="Observações gerais do jogo..." rows={4}
            className={`w-full ${INPUT_CLASS} resize-none`}/>
        </div>
      )}

      <button onClick={salvar} disabled={saving}
        className={`w-full font-bold py-3 rounded-xl transition ${saved ? 'bg-green-400 text-black' : 'bg-green-500 hover:bg-green-400 text-black'} disabled:opacity-50`}>
        {saving ? 'Salvando...' : saved ? '✅ Salvo!' : `Salvar ${aba === 'gols' ? 'gols' : aba === 'cartoes' ? 'cartões' : aba === 'notas' ? 'notas' : 'relatório'}`}
      </button>
    </div>
  )
}
