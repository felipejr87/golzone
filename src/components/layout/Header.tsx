import { Link, useLocation } from 'react-router-dom'
import { MOCK_DATA } from '../../lib/mockData'

export function Header() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')
  const aoVivo = MOCK_DATA.matches.filter(m => m.status === 'em_andamento')
  const hasLive = aoVivo.length > 0

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/scout', label: 'Scout' },
    { to: '/destaques', label: 'Destaques' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#060608]/95 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/divinotv.jpg" alt="Divino TV" className="h-9 w-auto object-contain" />
        </Link>

        {/* Nav desktop */}
        {!isAdmin && (
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  loc.pathname === l.to
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Badge AO VIVO */}
          {hasLive && !isAdmin && (
            <Link to={`/m/${aoVivo[0].id}`}
              className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-full hover:bg-red-500/25 transition">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full badge-live flex-shrink-0" />
              <span className="text-red-400 text-xs font-condensed tracking-wider">AO VIVO</span>
            </Link>
          )}

          {!isAdmin && (
            <Link to="/admin"
              className="text-xs text-gray-600 hover:text-gray-400 transition px-2 py-1">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
