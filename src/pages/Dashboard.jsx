import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { CardSkeleton } from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Fetch trips
        const { data: tripData } = await supabase.from('trips').select('*').order('start_date', { ascending: true })
        if (tripData) setTrips(tripData)

        // Fetch cities
        const { data: cityData } = await supabase.from('cities').select('*').order('popularity', { ascending: false })
        if (cityData) setCities(cityData)

        // Fetch expenses
        const { data: expenseData } = await supabase.from('expenses').select('*')
        if (expenseData) setExpenses(expenseData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Calculate days left for upcoming trips
  const getDaysLeft = (startDateStr) => {
    const start = new Date(startDateStr)
    const today = new Date()
    const diffTime = start - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Past trip'
    if (diffDays === 0) return 'Starts today!'
    return `${diffDays} days left`
  }

  // Format budget data for Recharts bar chart
  const budgetChartData = trips.map(t => {
    const tripExpenses = expenses.filter(e => e.trip_id === t.id)
    const totalSpend = tripExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    return {
      name: t.name.length > 14 ? t.name.substring(0, 12) + '...' : t.name,
      fullTitle: t.name,
      amount: totalSpend,
      tripId: t.id
    }
  })

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler'

  return (
    <div className="max-w-[1280px] mx-auto space-y-10 animate-fade">
      {/* Welcome & Primary CTA Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-on-surface tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="font-sans text-base text-on-surface-variant mt-1">
            Ready to craft your next multi-city adventure?
          </p>
        </div>
        <Link
          to="/trips/new"
          className="bg-coral hover:bg-coral-hover text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span>Plan New Trip</span>
        </Link>
      </section>

      {/* Section 1: Your Upcoming Trips (Horizontal Card Row) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-xl text-on-surface">Your Upcoming Trips</h2>
            <p className="text-xs text-on-surface-variant">Active & scheduled multi-city itineraries</p>
          </div>
          <Link to="/trips" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>View all</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips created yet"
            description="Start building your itinerary with custom stops, activities, and budget tracking."
            icon="flight_takeoff"
            actionText="Plan Your First Trip"
            actionLink="/trips/new"
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {trips.map((trip) => {
              const daysLeft = getDaysLeft(trip.start_date)
              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="min-w-[290px] sm:min-w-[340px] bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-0.5 transition-all duration-300 border border-outline-variant/30 cursor-pointer snap-start flex flex-col group"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-primary-container text-on-primary-container font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
                      {daysLeft}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {trip.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1 font-medium">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span>{trip.start_date} → {trip.end_date}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_city</span>
                        <span>Multi-Stop</span>
                      </span>
                      <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>Open Trip</span>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Section 2 & 3: Recommended Destinations + Budget Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Destinations (2 cols) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-xl text-on-surface">Recommended Destinations</h2>
              <p className="text-xs text-on-surface-variant">Top curated cities for your next getaway</p>
            </div>
            <Link to="/discover" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>Explore all</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cities.slice(0, 4).map((city) => (
              <div
                key={city.id}
                onClick={() => navigate(`/discover?city=${encodeURIComponent(city.name)}`)}
                className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xs hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex gap-4 p-3 group"
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                      {city.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant">{city.country}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-tertiary-container/30 text-on-tertiary-container font-semibold text-[11px] px-2 py-0.5 rounded">
                      {'$'.repeat(city.cost_index || 2)} Cost
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs text-secondary">star</span>
                      <span>{city.popularity}% Rating</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Budget Highlights Widget (1 col) */}
        <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <span>Budget Highlights</span>
              </h3>
              {trips[0] && (
                <Link
                  to={`/trips/${trips[0].id}/budget`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Full breakdown
                </Link>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Total spend breakdown per trip</p>
          </div>

          <div className="h-44 w-full pt-2">
            {budgetChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <XAxis dataKey="name" stroke="#6e7977" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6e7977" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, 'Total Spend']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #bdc9c6', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
                No expense data recorded
              </div>
            )}
          </div>

          {trips[0] && (
            <Link
              to={`/trips/${trips[0].id}/budget`}
              className="w-full text-center text-xs font-semibold text-primary bg-primary-container/10 hover:bg-primary-container/20 py-2.5 rounded-lg transition-colors inline-block"
            >
              View Full Budget Analysis →
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
