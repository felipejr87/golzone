import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/admin',             icon: HomeIcon,      label: 'Home'      },
  { to: '/admin/jogos',       icon: BallIcon,      label: 'Jogos'     },
  { to: '/admin/campeonatos', icon: CupIcon,       label: 'Camps.'    },
  { to: '/admin/times',       icon: ShirtIcon,     label: 'Times'     },
  { to: '/admin/jogadores',   icon: PersonIcon,    label: 'Jogadores' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
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

  const activeTab = TABS.find(t => isAtivo(t.to))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 90,
        background: 'rgba(6,6,8,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid var(--b-1)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', height: 52, gap: 12, flexShrink: 0,
      }}>
        <img src="/divinotv.jpg" alt="Divino TV" style={{ height: 26, width: 'auto', objectFit: 'contain', borderRadius: 4 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin
        </span>
        {activeTab && (
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-1)', marginLeft: 4 }}>
            · {activeTab.label}
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={() => { localStorage.removeItem('divino_admin'); navigate('/admin/login') }}
            style={{ background: 'none', border: 'none', color: 'var(--t-3)', fontSize: 12, cursor: 'pointer', padding: '4px 0' }}>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: '16px', paddingBottom: 80, overflowY: 'auto' }}>
        {children}
      </main>

      {/* Bottom tabs */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        background: 'rgba(6,6,8,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '0.5px solid var(--b-1)',
        display: 'flex', height: 58,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {TABS.map(t => {
          const active = isAtivo(t.to)
          return (
            <Link key={t.to} to={t.to} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, textDecoration: 'none',
              color: active ? 'var(--red)' : 'var(--t-3)',
              transition: 'color 0.15s',
            }}>
              <t.icon size={20} active={active} />
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {t.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}
function BallIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function CupIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
function ShirtIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}
function PersonIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  )
}
