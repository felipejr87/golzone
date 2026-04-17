import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminTimes() {
  const [times, setTimes] = useState<any[]>([])
  const [camps, setCamps] = useState<any[]>([])
  const [form, setForm] = useState({ nome:'', cidade:'', escudo_url:'' })
  const [editId, setEditId] = useState<number|null>(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orgId, setOrgId] = useState<string>('')
  const [vincular, setVincular] = useState<{timeId:number, campId:string}|null>(null)

  async function load() {
    const { data: org } = await supabase.from('organizations').select('id').eq('slug','divino-tv').single()
    setOrgId(org?.id || '')
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from('teams').select('*').order('nome'),
      supabase.from('championships').select('id,nome').eq('status','ativo'),
    ])
    setTimes(t || []); setCamps(c || [])
  }
  useEffect(() => { load() }, [])

  async function salvar() {
    setLoading(true)
    if (editId) {
      await supabase.from('teams').update(form).eq('id', editId)
    } else {
      await supabase.from('teams').insert({ ...form, org_id: orgId })
    }
    setForm({ nome:'', cidade:'', escudo_url:'' }); setEditId(null); setShow(false)
    await load(); setLoading(false)
  }

  async function excluir(id: number) {
    if (!confirm('Excluir time?')) return
    await supabase.from('teams').delete().eq('id', id); await load()
  }

  async function adicionarAoCampeonato() {
    if (!vincular || !vincular.campId) return
    await supabase.from('championship_teams')
      .upsert({ championship_id: Number(vincular.campId), team_id: vincular.timeId })
    setVincular(null)
    alert('Time adicionado ao campeonato!')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Times</h1>
        <button onClick={() => { setShow(!show); setEditId(null); setForm({ nome:'', cidade:'', escudo_url:'' }) }}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition">
          {show ? '× Cancelar' : '+ Novo'}
        </button>
      </div>

      {show && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} time</h3>
          <input value={form.nome} onChange={e => setForm({...form,nome:e.target.value})}
            placeholder="Nome do time *"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.cidade} onChange={e => setForm({...form,cidade:e.target.value})}
              placeholder="Cidade"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
            <input value={form.escudo_url} onChange={e => setForm({...form,escudo_url:e.target.value})}
              placeholder="URL do escudo"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          </div>
          <button onClick={salvar} disabled={loading || !form.nome}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar time'}
          </button>
        </div>
      )}

      {/* Modal vincular */}
      {vincular && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111811] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-white mb-4">Adicionar ao campeonato</h3>
            <select onChange={e => setVincular({...vincular, campId:e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 outline-none">
              <option value="">Selecionar campeonato...</option>
              {camps.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setVincular(null)} className="flex-1 bg-white/10 text-gray-300 font-bold py-2.5 rounded-xl transition">Cancelar</button>
              <button onClick={adicionarAoCampeonato} className="flex-1 bg-green-500 text-black font-bold py-2.5 rounded-xl transition">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {times.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Nenhum time cadastrado.</p>}
        {times.map(t => (
          <div key={t.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 flex items-center gap-3">
            {t.escudo_url
              ? <img src={t.escudo_url} className="w-10 h-10 rounded-full object-cover" alt=""/>
              : <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-black text-sm">{t.nome[0]}</div>
            }
            <div className="flex-1">
              <p className="font-bold text-white">{t.nome}</p>
              {t.cidade && <p className="text-gray-400 text-sm">{t.cidade}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setVincular({ timeId:t.id, campId:'' })}
                className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg transition">
                + Camp.
              </button>
              <button onClick={() => { setForm({ nome:t.nome, cidade:t.cidade||'', escudo_url:t.escudo_url||'' }); setEditId(t.id); setShow(true) }}
                className="text-xs bg-white/10 hover:bg-white/15 text-gray-300 px-3 py-1.5 rounded-lg transition">✏️</button>
              <button onClick={() => excluir(t.id)}
                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
