import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/admin',             label: 'Dashboard',   icon: '▦'  },
  { to: '/admin/jogos',       label: 'Jogos',        icon: '⚽' },
  { to: '/admin/campeonatos', label: 'Campeonatos',  icon: '🏆' },
  { to: '/admin/times',       label: 'Times',        icon: '👕' },
  { to: '/admin/stats',       label: 'Estatísticas', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('divino_admin') === '1') setOk(true)
    else navigate('/admin/login')
  }, [navigate])

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>

      {/* Sidebar desktop */}
      <aside style={{
        width: 200, flexShrink: 0,
        background: 'var(--bg-card)',
        borderRight: '0.5px solid var(--b-1)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }} className="hidden md:flex">
        <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/divinotv.jpg" alt="Divino TV" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin</span>
        </div>

        <nav style={{ flex: 1, padding: '4px 8px' }}>
          {NAV.map(n => (
            <Link key={n.to} to={n.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 10px', borderRadius: 'var(--r-md)', marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              color: isAtivo(n.to) ? 'var(--t-1)' : 'var(--t-2)',
              background: isAtivo(n.to) ? 'var(--bg-card-2)' : 'transparent',
            }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '0.5px solid var(--b-1)' }}>
          <Link to="/" target="_blank" style={{ display: 'block', fontSize: 12, color: 'var(--t-3)', textDecoration: 'none', padding: '6px 10px', marginBottom: 4 }}>
            ↗ Ver site público
          </Link>
          <button onClick={sair} style={{
            width: '100%', padding: '9px 10px', background: 'transparent',
            border: '0.5px solid var(--b-1)', borderRadius: 'var(--r-md)',
            color: 'var(--t-3)', fontSize: 13, cursor: 'pointer', textAlign: 'left',
          }}>
            Sair
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <div className="md:hidden" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-card)', borderTop: '0.5px solid var(--b-1)',
        display: 'flex',
      }}>
        {NAV.map(n => (
          <Link key={n.to} to={n.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '8px 4px', textDecoration: 'none',
            color: isAtivo(n.to) ? 'var(--red)' : 'var(--t-3)',
            fontSize: 10, fontWeight: 600,
          }}>
            <span style={{ fontSize: 18, marginBottom: 2 }}>{n.icon}</span>
            {n.label.slice(0, 4)}
          </Link>
        ))}
      </div>

      {/* Conteúdo principal */}
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh', padding: '20px 16px', paddingBottom: 80 }}>
        {children}
      </main>
    </div>
  )
}
