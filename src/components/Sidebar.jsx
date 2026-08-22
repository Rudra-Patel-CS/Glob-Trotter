import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'My Trips', path: '/trips', icon: 'explore' },
    { name: 'Discover', path: '/discover', icon: 'map' },
    { name: 'Profile', path: '/profile', icon: 'person' },
    { name: 'Admin', path: '/admin', icon: 'admin_panel_settings' }
  ]

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="w-[260px] h-screen hidden md:flex flex-col bg-surface shadow-[0px_4px_20px_rgba(15,118,110,0.06)] border-r border-outline-variant/30 fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-outline-variant/20">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined font-bold text-2xl">compass_calibration</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-primary leading-none tracking-tight">GlobeTrotter</h1>
          <p className="font-sans text-xs text-on-surface-variant mt-0.5">Travel Planner</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 text-sm font-semibold ${
                active
                  ? 'bg-primary-container/10 text-primary border-l-4 border-secondary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${active ? 'is-filled text-primary' : ''}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer info widget */}
      <div className="p-4 mx-3 mb-6 bg-surface-container-low rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2 text-primary font-semibold mb-1">
          <span className="material-symbols-outlined text-sm">flight</span>
          <span>Ready to explore?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-on-surface-variant/80">
          Plan multi-city journeys, organize activities, and track budgets seamlessly.
        </p>
      </div>
    </aside>
  )
}
