import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',          icon: '⚽', label: 'Home'      },
  { to: '/scout',     icon: '🔍', label: 'Scout'     },
  { to: '/destaques', icon: '⭐', label: 'Destaques' },
]

export function BottomNav() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0D]/95 backdrop-blur-sm border-t border-white/5 md:hidden pb-safe">
      <div className="flex">
        {tabs.map(t => {
          const active = loc.pathname === t.to
          return (
            <Link key={t.to} to={t.to}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition ${active ? 'text-red-400' : 'text-gray-600'}`}>
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-[10px] font-condensed tracking-wider">{t.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
