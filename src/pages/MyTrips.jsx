import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, SEED_CITIES } from '../lib/supabase'
import { CardSkeleton } from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function MyTrips() {
  const [trips, setTrips] = useState([])
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'upcoming' | 'past'
  const [sortBy, setSortBy] = useState('date') // 'date' | 'name'
  const [tripToDelete, setTripToDelete] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    async function loadTripsData() {
      setLoading(true)
      try {
        const { data: tripData } = await supabase.from('trips').select('*').order('start_date', { ascending: true })
        if (tripData) setTrips(tripData)

        const { data: stopData } = await supabase.from('stops').select('*')
        if (stopData) setStops(stopData)
      } catch (err) {
        console.error('Error loading trips:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTripsData()
  }, [])

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return
    await supabase.from('trips').delete().eq('id', tripToDelete.id)
    setTrips(trips.filter(t => t.id !== tripToDelete.id))
    setTripToDelete(null)
  }

  // Helper to determine status
  const getTripStatus = (startDateStr, endDateStr) => {
    const today = new Date().toISOString().split('T')[0]
    if (endDateStr < today) return { label: 'Past', color: 'bg-surface-gray text-on-surface-variant' }
    if (startDateStr <= today && endDateStr >= today) return { label: 'Active Now', color: 'bg-coral text-white' }
    return { label: 'Upcoming', color: 'bg-primary-container text-on-primary-container' }
  }

  // Filter & sort logic
  let filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) || (trip.description && trip.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const status = getTripStatus(trip.start_date, trip.end_date).label
    if (activeTab === 'upcoming') return matchesSearch && (status === 'Upcoming' || status === 'Active Now')
    if (activeTab === 'past') return matchesSearch && status === 'Past'
    return matchesSearch
  })

  if (sortBy === 'name') {
    filteredTrips.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    filteredTrips.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">My Trips</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-1">
            Manage your personal travel itineraries, stops & budgets
          </p>
        </div>

        <Link
          to="/trips/new"
          className="bg-coral hover:bg-coral-hover text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter, Search & Controls Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex bg-surface-container rounded-xl p-1 w-full md:w-auto overflow-x-auto">
          {['all', 'upcoming', 'past'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-5 py-2 text-xs font-semibold rounded-lg capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-base">search</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-surface border border-outline-variant/50 rounded-lg focus:outline-none focus:border-primary font-medium text-on-surface"
            >
              <option value="date">Start Date</option>
              <option value="name">Trip Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching trips found" : "No trips in this view"}
          description="Create a new trip to start planning your multi-city adventures."
          icon="explore_off"
          actionText="Create New Trip"
          actionLink="/trips/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const status = getTripStatus(trip.start_date, trip.end_date)
            const tripStops = stops.filter(s => s.trip_id === trip.id)
            const stopCityNames = tripStops.map(s => {
              const city = SEED_CITIES.find(c => c.id === s.city_id)
              return city ? city.name : null
            }).filter(Boolean)

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 cursor-pointer flex flex-col group relative"
              >
                {/* Photo & Status Badge */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`font-semibold text-[11px] px-3 py-1 rounded-full shadow-md backdrop-blur-md ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Actions overlay on hover */}
                  <div className="absolute inset-0 bg-on-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip.id}/builder`); }}
                      className="bg-white text-primary p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Edit Itinerary Builder"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTripToDelete(trip); }}
                      className="bg-white text-error p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                      title="Delete Trip"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1 font-medium">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span>{trip.start_date} → {trip.end_date}</span>
                    </p>

                    {trip.description && (
                      <p className="text-xs text-on-surface-variant/80 mt-2 line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Stop City Chips */}
                  {stopCityNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {stopCityNames.map((cityName, idx) => (
                        <span
                          key={idx}
                          className="bg-surface-container text-on-surface-variant font-medium text-[11px] px-2.5 py-0.5 rounded-full border border-outline-variant/20"
                        >
                          📍 {cityName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">
                      Currency: <strong className="text-on-surface">{trip.currency || 'USD'}</strong>
                    </span>
                    <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>View Itinerary</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 border border-outline-variant/30 animate-rise">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="font-display font-bold text-lg text-on-surface">Delete Trip?</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to delete <strong className="text-on-surface">"{tripToDelete.name}"</strong>? This will permanently remove all associated stops and activities.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteTrip}
                className="px-4 py-2 bg-error hover:bg-red-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
              >
                Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
