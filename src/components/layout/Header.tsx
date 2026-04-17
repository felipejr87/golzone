import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function Header() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')

  return (
    <header className="sticky top-0 z-50 bg-[#060608]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/divinotv.jpg" alt="Divino TV" className="h-8 w-auto object-contain rounded" />
        </Link>

        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition">Home</Link>
            <Link to="/scout" className="text-sm text-gray-400 hover:text-white transition">Scout</Link>
            <Link to="/destaques" className="text-sm text-gray-400 hover:text-white transition">Destaques</Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          <LiveIndicator />
          {!isAdmin && (
            <Link to="/admin" className="text-xs text-gray-600 hover:text-gray-400 transition">Admin</Link>
          )}
        </div>
      </div>
    </header>
  )
}

function LiveIndicator() {
  const [hasLive, setHasLive] = useState(false)

  useEffect(() => {
    supabase.from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'em_andamento')
      .then(({ count }) => setHasLive((count || 0) > 0))
  }, [])

  if (!hasLive) return null

  return (
    <Link to="/"
      className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 px-2.5 py-1 rounded-full badge-live">
      <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" />
      <span className="text-red-400 text-xs font-bold">AO VIVO</span>
    </Link>
  )
}
