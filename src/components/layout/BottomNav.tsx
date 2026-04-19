import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { to: '/',          icon: HomeIcon,   label: 'Home'      },
  { to: '/scout',     icon: ScoutIcon,  label: 'Scout'     },
  { to: '/destaques', icon: TrophyIcon, label: 'Destaques' },
] as const

export function BottomNav() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] flex"
      style={{
        background: 'rgba(6,6,8,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map(t => {
        const active = loc.pathname === t.to
        return (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1',
              'min-h-[54px] py-2.5 no-underline',
              'transition-colors duration-150',
              active ? 'text-divino-red' : 'text-[--text-muted]'
            )}
          >
            <t.icon size={22} />
            <span className="font-body text-[10px] font-bold uppercase tracking-widest leading-none">
              {t.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z" />
    </svg>
  )
}

function ScoutIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function TrophyIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
