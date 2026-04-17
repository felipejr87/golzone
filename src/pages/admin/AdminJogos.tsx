import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminJogos() {
  const [jogos, setJogos] = useState<any[]>([])
  const [camps, setCamps] = useState<any[]>([])
  const [times, setTimes] = useState<any[]>([])
  const [form, setForm] = useState({ championship_id:'', rodada:'1', data_hora:'', local:'', mandante_id:'', visitante_id:'', status:'agendado', link_video:'' })
  const [editId, setEditId] = useState<number|null>(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filtro, setFiltro] = useState('')

  async function carregar() {
    const [{ data: j }, { data: c }, { data: t }] = await Promise.all([
      supabase.from('matches').select(`
        id, rodada, status, data_hora, local,
        mandante:teams!mandante_id(nome),
        visitante:teams!visitante_id(nome),
        championship:championships(nome),
        resultado:match_results(gols_mandante,gols_visitante)
      `).order('id', { ascending: false }),
      supabase.from('championships').select('id,nome').order('nome'),
      supabase.from('teams').select('id,nome').order('nome'),
    ])
    setJogos(j||[]); setCamps(c||[]); setTimes(t||[])
  }
  useEffect(() => { carregar() }, [])

  async function salvar() {
    setLoading(true)
    const dados = {
      championship_id: Number(form.championship_id),
      mandante_id: Number(form.mandante_id),
      visitante_id: Number(form.visitante_id),
      rodada: Number(form.rodada),
      data_hora: form.data_hora || null,
      local: form.local || null,
      status: form.status,
      link_video: form.link_video || null,
    }
    if (editId) await supabase.from('matches').update(dados).eq('id', editId)
    else await supabase.from('matches').insert(dados)
    setShow(false); setEditId(null)
    setForm({ championship_id:'', rodada:'1', data_hora:'', local:'', mandante_id:'', visitante_id:'', status:'agendado', link_video:'' })
    await carregar(); setLoading(false)
  }

  async function registrarPlacar(id: number) {
    const gm = prompt('Gols mandante:')
    if (gm === null) return
    const gv = prompt('Gols visitante:')
    if (gv === null) return
    await supabase.from('match_results').upsert({ match_id: id, gols_mandante: Number(gm), gols_visitante: Number(gv) }, { onConflict: 'match_id' })
    await supabase.from('matches').update({ status: 'finalizado' }).eq('id', id)
    await carregar()
  }

  async function excluir(id: number) {
    if (!confirm('Excluir jogo?')) return
    await supabase.from('matches').delete().eq('id', id); await carregar()
  }

  const filtrados = filtro ? jogos.filter(j => String(j.championship_id) === filtro || (j.championship as any)?.nome?.toLowerCase().includes(filtro.toLowerCase())) : jogos

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Jogos</h1>
        <button onClick={() => { setShow(!show); setEditId(null) }}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition">
          {show ? '× Cancelar' : '+ Novo'}
        </button>
      </div>

      {show && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} jogo</h3>
          <select value={form.championship_id} onChange={e => setForm({...form, championship_id:e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
            <option value="">Campeonato *</option>
            {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.mandante_id} onChange={e => setForm({...form, mandante_id:e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
              <option value="">Mandante *</option>
              {times.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <select value={form.visitante_id} onChange={e => setForm({...form, visitante_id:e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
              <option value="">Visitante *</option>
              {times.filter(t => String(t.id) !== form.mandante_id).map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min="1" value={form.rodada} onChange={e => setForm({...form, rodada:e.target.value})}
              placeholder="Rodada" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
            <input type="datetime-local" value={form.data_hora} onChange={e => setForm({...form, data_hora:e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
          </div>
          <input value={form.local} onChange={e => setForm({...form, local:e.target.value})}
            placeholder="Local do jogo"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em andamento</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <input value={form.link_video} onChange={e => setForm({...form, link_video:e.target.value})}
              placeholder="Link YouTube (opcional)"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
          </div>
          <button onClick={salvar} disabled={loading || !form.championship_id || !form.mandante_id || !form.visitante_id}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar jogo'}
          </button>
        </div>
      )}

      <div className="mb-4">
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none w-full">
          <option value="">Todos os campeonatos</option>
          {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Nenhum jogo encontrado.</p>}
        {filtrados.map(j => (
          <div key={j.id} className="bg-[#111811] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{(j.championship as any)?.nome} · Rodada {j.rodada}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                j.status==='finalizado'?'bg-green-500/20 text-green-400':
                j.status==='em_andamento'?'bg-red-500/20 text-red-400':'bg-white/10 text-gray-400'
              }`}>{j.status}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white flex-1 truncate">{(j.mandante as any)?.nome}</span>
              <span className="font-black text-white px-3 flex-shrink-0">
                {j.status==='finalizado'
                  ? `${(j.resultado as any)?.gols_mandante ?? 0} × ${(j.resultado as any)?.gols_visitante ?? 0}`
                  : 'vs'
                }
              </span>
              <span className="font-bold text-white flex-1 text-right truncate">{(j.visitante as any)?.nome}</span>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {j.status !== 'finalizado' && (
                <button onClick={() => registrarPlacar(j.id)}
                  className="text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 font-bold px-3 py-1.5 rounded-lg transition">
                  ⚽ Registrar placar
                </button>
              )}
              <Link to={`/admin/jogos/${j.id}/sumula`}
                className="text-xs bg-white/10 hover:bg-white/15 text-gray-300 font-bold px-3 py-1.5 rounded-lg transition">
                📋 Súmula
              </Link>
              <button onClick={() => excluir(j.id)}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-lg transition ml-auto">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
