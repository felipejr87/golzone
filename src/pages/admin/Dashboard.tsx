import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ campeonatos:0, times:0, jogos:0, finalizados:0 })
  const [camps, setCamps] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('championships').select('*', {count:'exact', head:true}),
      supabase.from('teams').select('*', {count:'exact', head:true}),
      supabase.from('matches').select('*', {count:'exact', head:true}),
      supabase.from('matches').select('*', {count:'exact', head:true}).eq('status','finalizado'),
      supabase.from('championships').select('*').eq('status','ativo').order('id',{ascending:false}),
    ]).then(([c,t,j,f,ac]) => {
      setStats({ campeonatos:c.count||0, times:t.count||0, jogos:j.count||0, finalizados:f.count||0 })
      setCamps(ac.data||[])
    })
  }, [])

  const kpis = [
    { label:'Campeonatos', valor:stats.campeonatos, cor:'text-green-400', icone:'🏆' },
    { label:'Times', valor:stats.times, cor:'text-blue-400', icone:'👕' },
    { label:'Jogos', valor:stats.jogos, cor:'text-yellow-400', icone:'⚽' },
    { label:'Finalizados', valor:stats.finalizados, cor:'text-gray-300', icone:'✅' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#111811] border border-white/10 rounded-xl p-4">
            <div className="text-xl mb-1">{k.icone}</div>
            <div className={`text-3xl font-black ${k.cor}`}>{k.valor}</div>
            <div className="text-gray-400 text-sm mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/admin/campeonatos" className="bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition">+ Campeonato</Link>
        <Link to="/admin/times" className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2 rounded-xl text-sm transition">+ Time</Link>
        <Link to="/admin/jogos" className="bg-white/10 hover:bg-white/15 text-white font-bold px-4 py-2 rounded-xl text-sm transition">+ Jogo</Link>
      </div>

      {camps.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Campeonatos Ativos</h2>
          {camps.map(c => (
            <div key={c.id} className="bg-[#111811] border border-white/10 rounded-xl p-4 mb-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{c.nome}</p>
                <p className="text-gray-400 text-sm">{c.categoria} · {c.temporada}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/c/${c.id}`} target="_blank" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 transition">Ver ↗</Link>
                <Link to="/admin/jogos" className="text-xs text-green-400 px-3 py-1.5 rounded-lg bg-green-500/10 transition">Jogos</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}