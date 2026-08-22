import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GlobalSearchModal from './GlobalSearchModal'
import NotificationsModal from './NotificationsModal'

export default function TopBar() {
  const location = useLocation()
  const { user, profile } = useAuth()
  const isLoginPage = location.pathname === '/login'

  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = 2

  return (
    <>
      <header
        className={`fixed top-0 right-0 w-full ${
          isLoginPage ? 'md:w-full' : 'md:w-[calc(100%-260px)]'
        } z-30 flex items-center justify-between px-4 sm:px-6 bg-surface/80 backdrop-blur-md h-16 border-b border-outline-variant/30 transition-all`}
      >
        {/* Left Side: Mobile Logo Brand Mark */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-lg font-bold">compass_calibration</span>
            </div>
            <span className="font-display font-bold text-lg text-primary tracking-tight">GlobeTrotter</span>
          </Link>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {!isLoginPage && (
            <>
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-full active:scale-95 flex items-center gap-2 text-sm"
                title="Search trips, cities & activities (Ctrl+K)"
              >
                <span className="material-symbols-outlined">search</span>
                <span className="hidden sm:inline-block text-xs font-medium text-on-surface-variant/70 bg-surface-container-high px-2 py-0.5 rounded">
                  Search
                </span>
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-full active:scale-95"
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar */}
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-surface-container transition-colors group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/40 group-hover:border-primary transition-colors">
                  <img
                    src={
                      profile?.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={profile?.full_name || 'User avatar'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden lg:inline-block text-xs font-semibold text-on-surface truncate max-w-[120px]">
                  {profile?.full_name?.split(' ')[0] || 'Alex'}
                </span>
              </Link>
            </>
          )}

          {isLoginPage && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 font-semibold text-xs text-on-primary bg-primary hover:bg-primary-container rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Global Search Modal */}
      {showSearch && <GlobalSearchModal onClose={() => setShowSearch(false)} />}

      {/* Notifications Slide-Over */}
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  )
}
