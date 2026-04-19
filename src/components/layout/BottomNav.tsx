import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to:'/',          icon: HomeIcon,   label:'Home'      },
  { to:'/scout',     icon: ScoutIcon,  label:'Scout'     },
  { to:'/destaques', icon: TrophyIcon, label:'Destaques' },
]

export function BottomNav() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/admin')) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
      background: 'rgba(7,8,12,0.95)', backdropFilter:'blur(16px)',
      borderTop: '0.5px solid var(--b-1)',
      paddingBottom: 'env(safe-area-inset-bottom,0px)',
      display: 'flex',
    }}>
      {TABS.map(t => {
        const active = loc.pathname === t.to
        return (
          <Link key={t.to} to={t.to} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            gap:3, padding:'10px 0 8px', textDecoration:'none',
            color: active ? 'var(--red)' : 'var(--t-3)',
            transition: 'color 0.15s',
          }}>
            <t.icon size={22} />
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              {t.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function HomeIcon({ size=24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
}
function ScoutIcon({ size=24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function TrophyIcon({ size=24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
}
