import { Link, useLocation } from 'react-router-dom'
import { db } from '../../lib/data'

export function Header() {
  const loc = useLocation()
  const isAdmin = loc.pathname.startsWith('/admin')
  const isNarracao = loc.pathname.startsWith('/admin/narracao')
  const liveCount = db.jogos.aoVivo().length

  if (isNarracao) return null

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,8,12,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '0.5px solid var(--b-1)',
      height: 52,
    }}>
      <div style={{
        maxWidth: 640, margin: '0 auto', height: '100%',
        padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link to={isAdmin ? '/admin' : '/'} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <img src="/divinotv.jpg" alt="Divino TV" style={{ height:30, width:'auto', objectFit:'contain' }} />
        </Link>

        {!isAdmin && (
          <nav style={{ display:'flex', gap:4, marginLeft:8 }}>
            {([['/', 'Home'], ['/scout', 'Scout'], ['/destaques', 'Destaques']] as const).map(([to, label]) => (
              <Link key={to} to={to} style={{
                padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 500,
                color: loc.pathname === to ? 'var(--t-1)' : 'var(--t-2)',
                background: loc.pathname === to ? 'var(--bg-card-2)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              }}>{label}</Link>
            ))}
          </nav>
        )}

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {liveCount > 0 && !isAdmin && (
            <Link to="/" className="badge badge-live" style={{ textDecoration:'none' }}>
              <span className="live-dot" />
              AO VIVO
            </Link>
          )}
          {!isAdmin && (
            <Link to="/admin" style={{ fontSize:12, color:'var(--t-3)', textDecoration:'none', padding:'4px 8px' }}>
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
