import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Trips', path: '/trips', icon: 'explore' },
    { name: 'Discover', path: '/discover', icon: 'map' },
    { name: 'Profile', path: '/profile', icon: 'person' }
  ]

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 md:hidden pb-safe shadow-[0_-4px_20px_rgba(15,118,110,0.06)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                active ? 'text-coral font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${active ? 'is-filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
