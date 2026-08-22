import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function GlobalSearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [trips, setTrips] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    async function loadTrips() {
      const { data } = await supabase.from('trips').select('*')
      if (data) setTrips(data)
    }
    loadTrips()
  }, [])

  const filteredTrips = trips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
  const filteredCities = SEED_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.country.toLowerCase().includes(query.toLowerCase()))
  const filteredActivities = SEED_ACTIVITIES.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-on-background/60 backdrop-blur-sm animate-fade">
      <div className="bg-surface rounded-2xl shadow-2xl border border-outline-variant/40 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3 bg-surface-container-lowest">
          <span className="material-symbols-outlined text-primary text-2xl">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips, cities, countries, or activities..."
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/60 font-medium text-base outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search Results Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Trips Section */}
          {filteredTrips.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">My Trips</h4>
              <div className="space-y-1.5">
                {filteredTrips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => { navigate(`/trips/${trip.id}`); onClose(); }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={trip.cover_photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-sm text-on-surface">{trip.name}</div>
                        <div className="text-xs text-on-surface-variant">{trip.start_date} → {trip.end_date}</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cities Section */}
          {filteredCities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Destinations</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredCities.slice(0, 4).map(city => (
                  <div
                    key={city.id}
                    onClick={() => { navigate(`/discover?city=${encodeURIComponent(city.name)}`); onClose(); }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer border border-outline-variant/20"
                  >
                    <img src={city.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-semibold text-sm text-on-surface">{city.name}</div>
                      <div className="text-xs text-on-surface-variant">{city.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Section */}
          {filteredActivities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Activities</h4>
              <div className="space-y-1.5">
                {filteredActivities.slice(0, 4).map(act => (
                  <div
                    key={act.id}
                    onClick={() => { navigate(`/discover`); onClose(); }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer border border-outline-variant/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs">
                        ${act.cost}
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-on-surface">{act.name}</div>
                        <div className="text-xs text-on-surface-variant capitalize">{act.category} • {act.duration_minutes} mins</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-primary">add_circle</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && filteredTrips.length === 0 && filteredCities.length === 0 && filteredActivities.length === 0 && (
            <div className="py-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
              <p className="text-sm font-medium">No results found for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
