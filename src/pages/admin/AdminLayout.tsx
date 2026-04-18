import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const NAV = [
  { to:'/admin',              label:'📊 Dashboard'   },
  { to:'/admin/narracao',     label:'🎙️ Narração'    },
  { to:'/admin/transmissao',  label:'🔴 Transmissão' },
  { to:'/admin/campeonatos',  label:'🏆 Campeonatos' },
  { to:'/admin/times',        label:'👕 Times'        },
  { to:'/admin/jogos',        label:'⚽ Jogos'        },
  { to:'/admin/stats',        label:'📊 Estatísticas' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('divino_admin') === '1') setOk(true)
    else navigate('/admin/login')
  }, [])

  if (!ok) return null

  function isAtivo(path: string) {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  function sair() {
    localStorage.removeItem('divino_admin')
    navigate('/admin/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="w-52 bg-[#0A0F0A] border-r border-white/10 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <img src="/divinotv.jpg" alt="" className="w-7 h-7 rounded object-contain"/>
          <span className="text-green-400 font-black text-sm">Admin</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(l => (
            <Link key={l.to} to={l.to}
              className={`block px-3 py-2.5 rounded-lg text-sm transition font-medium ${
                isAtivo(l.to)
                  ? 'bg-green-500/15 text-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>{l.label}</Link>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 space-y-2">
          <Link to="/" target="_blank" className="block text-xs text-gray-500 hover:text-gray-300 transition">↗ Ver site público</Link>
          <button onClick={sair} className="text-red-400 text-xs hover:text-red-300 transition">Sair</button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111811] border-t border-white/10 flex z-50">
        {NAV.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex-1 py-3 text-center text-xs font-bold transition ${
              isAtivo(l.to) ? 'text-green-400' : 'text-gray-500'
            }`}>{l.label.split(' ')[0]}</Link>
        ))}
      </div>

      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">{children}</main>
    </div>
  )
}
