import { useState, useEffect } from 'react'
import { supabase, SEED_TRIPS, SEED_CITIES } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Admin() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAdminData() {
      const { data } = await supabase.from('trips').select('*')
      setTrips(data && data.length ? data : SEED_TRIPS)
      setLoading(false)
    }
    loadAdminData()
  }, [])

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
      <div>
        <div className="inline-block px-3 py-1 bg-coral/10 text-coral font-bold text-[11px] rounded-full uppercase tracking-wider mb-1">
          Role-Gated Management
        </div>
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Admin & System Analytics</h1>
        <p className="font-sans text-sm text-on-surface-variant">
          Platform performance indicators, destination trends & recent activity
        </p>
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
            <div className="font-display font-bold text-2xl text-on-surface">3,890</div>
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
        <h3 className="font-display font-bold text-base text-on-surface">Recent System Trips</h3>
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
