import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Discover() {
  const [searchParams] = useSearchParams()
  const initialCityQuery = searchParams.get('city') || ''

  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeSearchTab, setActiveSearchTab] = useState('cities') // 'cities' | 'activities'
  const [query, setQuery] = useState(initialCityQuery)
  const [regionFilter, setRegionFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [budgetOnly, setBudgetOnly] = useState(false)

  const [savedCityIds, setSavedCityIds] = useState(['c2', 'c4'])
  const [userTrips, setUserTrips] = useState([])
  const [stops, setStops] = useState([])
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null)
  const [showTripPicker, setShowTripPicker] = useState(false)

  // Activity Picker state
  const [selectedActivityForTrip, setSelectedActivityForTrip] = useState(null)
  const [showActivityPicker, setShowActivityPicker] = useState(false)
  const [selectedTripIdForActivity, setSelectedTripIdForActivity] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    async function loadDiscoverData() {
      const { data: tripData } = await supabase.from('trips').select('*')
      setUserTrips(tripData && tripData.length ? tripData : SEED_TRIPS)

      let loadedStops = []
      const { data: tsData } = await supabase.from('trip_stops').select('*')
      if (tsData && tsData.length) {
        loadedStops = tsData.map(s => ({ ...s, start_date: s.arrival_date || s.start_date, end_date: s.departure_date || s.end_date }))
      } else {
        const { data: sData } = await supabase.from('stops').select('*')
        loadedStops = (sData && sData.length) ? sData : SEED_STOPS
      }
      setStops(loadedStops)

      const { data: savedData } = await supabase.from('saved_destinations').select('city_id')
      if (savedData) setSavedCityIds(savedData.map(s => s.city_id))
    }
    loadDiscoverData()
  }, [])

  const toggleSaveCity = async (e, cityId) => {
    e.stopPropagation()
    if (savedCityIds.includes(cityId)) {
      setSavedCityIds(savedCityIds.filter(id => id !== cityId))
      toast.success('City removed from saved destinations')
    } else {
      setSavedCityIds([...savedCityIds, cityId])
      await supabase.from('saved_destinations').insert([{ user_id: user?.id || 'u1', city_id: cityId }])
      toast.success('City saved to your profile!')
    }
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleOpenTripPicker = (e, city) => {
    e.stopPropagation()
    setSelectedCityForTrip(city)
    setShowTripPicker(true)
  }

  const handleAddCityToSelectedTrip = async (tripId) => {
    if (!selectedCityForTrip) return
    const newStop = {
      trip_id: tripId,
      city_id: selectedCityForTrip.id,
      arrival_date: '2026-09-01',
      departure_date: '2026-09-05',
      start_date: '2026-09-01',
      end_date: '2026-09-05',
      stop_order: 99,
      order_index: 99
    }
    await supabase.from('trip_stops').insert([newStop])
    await supabase.from('stops').insert([newStop])
    setShowTripPicker(false)
    toast.success(`Added ${selectedCityForTrip.name} to trip!`)
    navigate(`/trips/${tripId}/builder`)
  }

  const handleOpenActivityPicker = (act) => {
    setSelectedActivityForTrip(act)
    setSelectedTripIdForActivity(userTrips[0]?.id || null)
    setShowActivityPicker(true)
  }

  const handleAddActivityToStop = async (stopId) => {
    if (!selectedActivityForTrip) return
    const targetStop = stops.find(s => s.id === stopId)
    const newSA = {
      trip_stop_id: stopId,
      stop_id: stopId,
      activity_id: selectedActivityForTrip.id,
      activity_date: targetStop?.start_date || targetStop?.arrival_date || '2026-09-02',
      scheduled_date: targetStop?.start_date || targetStop?.arrival_date || '2026-09-02',
      start_time: '10:00',
      scheduled_time: '10:00',
      cost_override: selectedActivityForTrip.estimated_cost || selectedActivityForTrip.cost || 0
    }
    await supabase.from('trip_activities').insert([newSA])
    await supabase.from('stop_activities').insert([newSA])
    setShowActivityPicker(false)
    setToastMsg(`Added "${selectedActivityForTrip.name}" to trip!`)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Filtered cities
  const filteredCities = SEED_CITIES.filter(city => {
    const matchesQuery = city.name.toLowerCase().includes(query.toLowerCase()) || city.country.toLowerCase().includes(query.toLowerCase())
    const matchesRegion = regionFilter === 'all' || city.region === regionFilter
    const matchesBudget = !budgetOnly || city.cost_index <= 2
    return matchesQuery && matchesRegion && matchesBudget
  })

  // Filtered activities
  const filteredActivities = SEED_ACTIVITIES.filter(act => {
    const matchesQuery = act.name.toLowerCase().includes(query.toLowerCase()) || act.description.toLowerCase().includes(query.toLowerCase())
    const matchesCat = categoryFilter === 'all' || act.category === categoryFilter
    return matchesQuery && matchesCat
  })

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade relative">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-primary text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-rise">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Discover Destination & Activities</h1>
        <p className="font-sans text-sm text-on-surface-variant mt-1">
          Explore curated world cities and top-rated travel activities
        </p>
      </div>

      {/* Main Search & Filter Control Bar */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
        {/* Toggle between City Search & Activity Search */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
          <div className="flex bg-surface-container rounded-xl p-1">
            <button
              onClick={() => setActiveSearchTab('cities')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSearchTab === 'cities' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
              }`}
            >
              Explore Cities
            </button>
            <button
              onClick={() => setActiveSearchTab('activities')}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeSearchTab === 'activities' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
              }`}
            >
              Explore Activities
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeSearchTab === 'cities' ? "Search city or country (e.g. Paris, Japan)..." : "Search activities (e.g. Eiffel Tower, Food tour)..."}
            className="w-full pl-10 pr-4 py-3 text-sm bg-surface border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary text-on-surface"
          />
          <span className="material-symbols-outlined absolute left-3 top-3.5 text-on-surface-variant text-xl">search</span>
        </div>

        {/* Filters */}
        {activeSearchTab === 'cities' ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-on-surface-variant mr-2">Region:</span>
            {['all', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania'].map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                  regionFilter === r ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {r}
              </button>
            ))}
            <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
              <input
                type="checkbox"
                checked={budgetOnly}
                onChange={(e) => setBudgetOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-outline-variant"
              />
              <span className="text-xs font-semibold text-on-surface-variant">Budget-Friendly Only</span>
            </label>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-on-surface-variant mr-2">Category:</span>
            {['all', 'activity', 'meal', 'transport'].map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                  categoryFilter === c ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Display */}
      {activeSearchTab === 'cities' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => {
            const isSaved = savedCityIds.includes(city.id)
            return (
              <div
                key={city.id}
                className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 flex flex-col justify-between group relative"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleSaveCity(e, city.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-coral transition-all shadow-md"
                    title={isSaved ? "Remove from Saved" : "Save Destination"}
                  >
                    <span className={`material-symbols-outlined text-lg ${isSaved ? 'is-filled' : ''}`}>favorite</span>
                  </button>
                  <span className="absolute bottom-3 left-3 bg-tertiary-container/90 text-on-tertiary-container font-semibold text-xs px-2.5 py-0.5 rounded-md backdrop-blur-md">
                    {'$'.repeat(city.cost_index || 2)} Cost
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg text-on-surface">{city.name}</h3>
                      <span className="text-xs font-semibold text-on-surface-variant">⭐ {city.popularity}%</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{city.country} • {city.region}</p>
                  </div>

                  <button
                    onClick={(e) => handleOpenTripPicker(e, city)}
                    className="w-full bg-coral hover:bg-coral-hover text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredActivities.map((act) => (
            <div key={act.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-xs flex gap-4">
              <img src={act.image_url} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{act.name}</h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{act.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-primary">${act.cost} USD</span>
                  <button
                    onClick={() => handleOpenActivityPicker(act)}
                    className="bg-coral text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-coral-hover transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Add Activity</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trip Picker Modal for Cities */}
      {showTripPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 border border-outline-variant/30 animate-rise">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-display font-bold text-lg text-on-surface">Add {selectedCityForTrip?.name} to Trip</h3>
              <button onClick={() => setShowTripPicker(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">Select which trip itinerary you'd like to append this city stop to:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => handleAddCityToSelectedTrip(trip.id)}
                  className="p-3 bg-surface-container-lowest hover:bg-primary-container/10 border border-outline-variant/30 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-xs text-on-surface">{trip.name}</div>
                    <div className="text-[10px] text-on-surface-variant">{trip.start_date} → {trip.end_date}</div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-base">add_circle</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Trip & Stop Picker Modal */}
      {showActivityPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4 border border-outline-variant/30 animate-rise">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface">Add Activity to Itinerary</h3>
                <p className="text-xs text-on-surface-variant font-medium">{selectedActivityForTrip?.name}</p>
              </div>
              <button onClick={() => setShowActivityPicker(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Select Trip */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Select Target Trip</label>
              <select
                value={selectedTripIdForActivity || ''}
                onChange={(e) => setSelectedTripIdForActivity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface"
              >
                {userTrips.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Select Stop in Trip */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Select City Stop</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stops.filter(s => s.trip_id === selectedTripIdForActivity).map((stop, idx) => {
                  const city = SEED_CITIES.find(c => c.id === stop.city_id)
                  return (
                    <div
                      key={stop.id}
                      onClick={() => handleAddActivityToStop(stop.id)}
                      className="p-3 bg-surface-container-lowest hover:bg-primary-container/10 border border-outline-variant/30 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-on-surface">{city?.name || 'City Stop'}</div>
                          <div className="text-[10px] text-on-surface-variant">{stop.start_date} → {stop.end_date}</div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-coral text-base">add_circle</span>
                    </div>
                  )
                })}

                {stops.filter(s => s.trip_id === selectedTripIdForActivity).length === 0 && (
                  <p className="text-xs text-on-surface-variant italic p-3 text-center border border-dashed rounded-lg">
                    No stops in this trip yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
