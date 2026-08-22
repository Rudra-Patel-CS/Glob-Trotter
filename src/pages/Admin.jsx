import { useState, useEffect } from 'react'
import { supabase, SEED_TRIPS } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-hot-toast'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gt_admin_auth') === 'true'
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const adminPasscode = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

  useEffect(() => {
    if (!isAuthenticated) return
    async function loadAdminData() {
      const { data } = await supabase.from('trips').select('*')
      const localTrips = JSON.parse(localStorage.getItem('gt_trips') || '[]')
      const combined = [...(data || []), ...localTrips]
      
      // Deduplicate by ID
      const uniqueMap = new Map()
      combined.forEach(t => uniqueMap.set(t.id, t))
      const allTrips = Array.from(uniqueMap.values())

      setTrips(allTrips.length ? allTrips : SEED_TRIPS)
      setLoading(false)
    }
    loadAdminData()
  }, [isAuthenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === adminPasscode) {
      setIsAuthenticated(true)
      sessionStorage.setItem('gt_admin_auth', 'true')
      setAuthError('')
      toast.success('Admin authentication successful!')
    } else {
      setAuthError('Invalid admin password. Please try again.')
      toast.error('Invalid admin password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('gt_admin_auth')
    setPasswordInput('')
    toast.success('Logged out of Admin Portal')
  }

  // Password Lock Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-lg space-y-6 animate-fade">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-on-surface">Admin Access Portal</h2>
          <p className="text-xs text-on-surface-variant">Enter the administrator password to view system analytics</p>
        </div>

        {authError && (
          <div className="p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-base text-error">error</span>
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">Admin Password</label>
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full px-4 py-2.5 text-xs bg-surface border border-outline-variant/60 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-coral hover:bg-coral-hover text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">lock_open</span>
            <span>Authenticate Admin</span>
          </button>
        </form>
      </div>
    )
  }

  const topCitiesData = [
    { city: 'Paris', bookings: 42 },
    { city: 'Tokyo', bookings: 38 },
    { city: 'Rome', bookings: 29 },
    { city: 'Barcelona', bookings: 25 },
    { city: 'Kyoto', bookings: 21 }
  ]

  const categoryPieData = [
    { name: 'Activity', value: 45, color: '#0f766e' },
    { name: 'Meal', value: 30, color: '#fe7488' },
    { name: 'Transport', value: 15, color: '#bfab56' },
    { name: 'Stay', value: 10, color: '#6e5e0d' }
  ]

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-coral/10 text-coral font-bold text-[11px] rounded-full uppercase tracking-wider mb-1">
            Authenticated Admin Portal
          </div>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Admin & System Analytics</h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Platform performance indicators, destination trends & recent activity
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-xl text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-base">lock</span>
          <span>Lock Admin</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant font-semibold">Total Users</div>
            <div className="font-display font-bold text-2xl text-on-surface">1,248</div>
            <div className="text-[10px] text-primary font-bold">↑ 12% this month</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant font-semibold">Total Trips Created</div>
            <div className="font-display font-bold text-2xl text-on-surface">{trips.length + 3880}</div>
            <div className="text-[10px] text-coral font-bold">↑ 18% this month</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant font-semibold">Active Trips This Week</div>
            <div className="font-display font-bold text-2xl text-on-surface">184</div>
            <div className="text-[10px] text-on-surface-variant">Ongoing itineraries</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <div className="text-xs text-on-surface-variant font-semibold">Avg Trip Spend</div>
            <div className="font-display font-bold text-2xl text-on-surface">$1,420</div>
            <div className="text-[10px] text-on-surface-variant">USD per user trip</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities Bar Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-on-surface">Top Booked Destinations</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCitiesData}>
                <XAxis dataKey="city" stroke="#6e7977" fontSize={11} />
                <YAxis stroke="#6e7977" fontSize={11} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Categories Pie Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-on-surface">Activity Category Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-base text-on-surface">Recent System Trips ({trips.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-bold">
                <th className="py-3 px-4">Trip Name</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Visibility</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 font-bold">{t.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant">Alex Rivers</td>
                  <td className="py-3 px-4 text-on-surface-variant">{t.start_date} → {t.end_date}</td>
                  <td className="py-3 px-4 font-semibold">{t.currency || 'USD'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.is_public ? 'bg-primary-container/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                      {t.is_public ? 'Public' : 'Private'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
