import { Link, useLocation } from 'react-router-dom'

const ITEMS = [
  { to: '/',          icon: '🏠', label: 'Home'      },
  { to: '/scout',     icon: '🔍', label: 'Scout'     },
  { to: '/destaques', icon: '⭐', label: 'Destaques' },
  { to: '/admin',     icon: '⚙️',  label: 'Admin'    },
]

export function BottomNav() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/admin')) return null

  function isActive(path: string) {
    if (path === '/') return loc.pathname === '/'
    return loc.pathname.startsWith(path)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-md border-t border-white/5 flex">
      {ITEMS.map(item => (
        <Link key={item.to} to={item.to}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-xs font-bold transition ${
            isActive(item.to) ? 'text-[#E8232A]' : 'text-gray-600'
          }`}>
          <span className="text-lg leading-none">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
