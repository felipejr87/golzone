import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const CATEGORIAS = ['Sub-11','Sub-13','Sub-15','Sub-17','Sub-20','Amador','Veterano']

export default function AdminCampeonatos() {
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState({ nome:'', categoria:'Amador', temporada:2026, status:'ativo' })
  const [editId, setEditId] = useState<number|null>(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orgId, setOrgId] = useState<string>('')

  async function load() {
    const { data: org } = await supabase.from('organizations').select('id').eq('slug','divino-tv').single()
    setOrgId(org?.id || '')
    const { data } = await supabase.from('championships').select('*').order('id',{ascending:false})
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  async function salvar() {
    setLoading(true)
    if (editId) {
      await supabase.from('championships').update(form).eq('id', editId)
    } else {
      await supabase.from('championships').insert({ ...form, org_id: orgId })
    }
    setForm({ nome:'', categoria:'Amador', temporada:2026, status:'ativo' })
    setEditId(null); setShow(false)
    await load(); setLoading(false)
  }

  async function excluir(id: number) {
    if (!confirm('Excluir campeonato? Todos os dados relacionados serão removidos.')) return
    await supabase.from('championships').delete().eq('id', id)
    await load()
  }

  function editar(c: any) {
    setForm({ nome:c.nome, categoria:c.categoria, temporada:c.temporada, status:c.status })
    setEditId(c.id); setShow(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Campeonatos</h1>
        <button onClick={() => { setShow(!show); setEditId(null); setForm({ nome:'', categoria:'Amador', temporada:2026, status:'ativo' }) }}
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition">
          {show ? '× Cancelar' : '+ Novo'}
        </button>
      </div>

      {show && (
        <div className="bg-[#111811] border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="font-bold text-white">{editId ? 'Editar' : 'Novo'} campeonato</h3>
          <input value={form.nome} onChange={e => setForm({...form, nome:e.target.value})}
            placeholder="Nome do campeonato *"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.categoria} onChange={e => setForm({...form, categoria:e.target.value})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition">
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" value={form.temporada} onChange={e => setForm({...form, temporada:Number(e.target.value)})}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition"/>
          </div>
          <select value={form.status} onChange={e => setForm({...form, status:e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-green-400 transition">
            <option value="ativo">Ativo</option>
            <option value="finalizado">Finalizado</option>
            <option value="suspenso">Suspenso</option>
          </select>
          <button onClick={salvar} disabled={loading || !form.nome}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar campeonato'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Nenhum campeonato cadastrado.</p>}
        {items.map(c => (
          <div key={c.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-bold text-white">{c.nome}</p>
              <p className="text-gray-400 text-sm">{c.categoria} · {c.temporada}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.status==='ativo' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
              {c.status}
            </span>
            <div className="flex gap-2">
              <button onClick={() => editar(c)} className="text-xs bg-white/10 hover:bg-white/15 text-gray-300 px-3 py-1.5 rounded-lg transition">✏️</button>
              <button onClick={() => excluir(c.id)} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
