import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, fetchAllTrips, fetchAllStops, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function ItineraryView() {
  const { id } = useParams()

  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [stopActivities, setStopActivities] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadItineraryData() {
      setLoading(true)
      try {
        const allTrips = await fetchAllTrips()
        const foundTrip = allTrips.find(t => t.id === id)
        setTrip(foundTrip || { id, name: 'Grand European Summer', start_date: '2026-09-01', end_date: '2026-09-14', description: 'Explore Paris, Rome & Barcelona', cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', is_public: true })

        const loadedStops = await fetchAllStops(id)
        setStops(loadedStops.length ? loadedStops : [
          { id: 's1', trip_id: id, city_id: 'c1', start_date: '2026-09-01', end_date: '2026-09-05', order_index: 0 },
          { id: 's2', trip_id: id, city_id: 'c3', start_date: '2026-09-06', end_date: '2026-09-10', order_index: 1 }
        ])

        // Load stop activities from trip_activities or stop_activities
        let loadedSA = []
        const { data: taData } = await supabase.from('trip_activities').select('*')
        if (taData && taData.length) {
          loadedSA = taData.map(sa => ({
            ...sa,
            stop_id: sa.trip_stop_id || sa.stop_id,
            scheduled_date: sa.activity_date || sa.scheduled_date || '2026-09-02',
            scheduled_time: sa.start_time || sa.scheduled_time || '10:00'
          }))
        } else {
          const { data: saData } = await supabase.from('stop_activities').select('*')
          if (saData && saData.length) {
            loadedSA = saData.map(sa => ({
              ...sa,
              stop_id: sa.stop_id || sa.trip_stop_id,
              scheduled_date: sa.scheduled_date || sa.activity_date || '2026-09-02',
              scheduled_time: sa.scheduled_time || sa.start_time || '10:00'
            }))
          }
        }
        setStopActivities(loadedSA.length ? loadedSA : [
          { id: 'sa1', stop_id: 's1', activity_id: 'a1', scheduled_date: '2026-09-02', scheduled_time: '10:00', cost_override: 35 },
          { id: 'sa2', stop_id: 's1', activity_id: 'a2', scheduled_date: '2026-09-03', scheduled_time: '14:00', cost_override: 65 },
          { id: 'sa4', stop_id: 's2', activity_id: 'a6', scheduled_date: '2026-09-07', scheduled_time: '09:00', cost_override: 50 }
        ])
      } catch (err) {
        console.error('Error loading itinerary:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItineraryData()
  }, [id])

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade">
      {/* Hero Banner Header */}
      <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30">
        <img
          src={trip?.cover_image || trip?.cover_photo_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'}
          alt={trip?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/50 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-primary-container text-on-primary-container font-semibold text-xs px-3 py-1 rounded-full">
              {trip?.is_public ? '🌐 Public Itinerary' : '🔒 Private Trip'}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white font-semibold text-xs px-3 py-1 rounded-full">
              {trip?.start_date} → {trip?.end_date}
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl drop-shadow-md">{trip?.name}</h1>
          {trip?.description && <p className="text-sm text-white/90 max-w-2xl mt-1 font-medium">{trip.description}</p>}
        </div>
      </div>

      {/* Navigation Quick Actions Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex bg-surface-container rounded-xl p-1 w-full md:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">format_list_bulleted</span>
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'calendar' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">calendar_month</span>
            <span>Calendar View</span>
          </button>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Link
            to={`/trips/${id}/builder`}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-lg text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            <span>Edit Builder</span>
          </Link>
          <Link
            to={`/trips/${id}/budget`}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-lg text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base font-bold text-primary">account_balance_wallet</span>
            <span>Budget</span>
          </Link>
          <Link
            to={`/trips/${id}/calendar`}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-lg text-xs font-semibold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">event</span>
            <span>Full Calendar</span>
          </Link>
          <Link
            to={`/share/euro-summer-2026`}
            className="w-full sm:w-auto px-4 py-2 bg-coral hover:bg-coral-hover text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">share</span>
            <span>Share Link</span>
          </Link>
        </div>
      </div>

      {/* Main Content: Grouped by City & Activities */}
      {viewMode === 'list' ? (
        <div className="space-y-8">
          {stops.map((stop, idx) => {
            const city = SEED_CITIES.find(c => c.id === stop.city_id)
            const currentSA = stopActivities.filter(sa => sa.stop_id === stop.id)

            return (
              <div key={stop.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-sm space-y-6">
                {/* Stop Header */}
                <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-4">
                  <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary font-bold text-lg flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <img src={city?.image_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-display font-bold text-xl text-on-surface">{city?.name}, {city?.country}</h3>
                    <p className="text-xs text-on-surface-variant font-medium">Dates: {stop.start_date} → {stop.end_date}</p>
                  </div>
                </div>

                {/* Day-by-Day Activities */}
                <div className="space-y-4">
                  {currentSA.length === 0 ? (
                    <p className="text-xs text-on-surface-variant italic">No scheduled activities for this stop.</p>
                  ) : (
                    currentSA.map((sa) => {
                      const act = SEED_ACTIVITIES.find(a => a.id === sa.activity_id)
                      return (
                        <div key={sa.id} className="p-4 bg-surface rounded-xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center px-3 py-1.5 bg-primary-container/10 text-primary rounded-lg font-bold text-xs">
                              <div>{sa.scheduled_time || '10:00'}</div>
                              <div className="text-[10px] font-normal text-on-surface-variant">{sa.scheduled_date}</div>
                            </div>
                            <img src={act?.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <h4 className="font-bold text-sm text-on-surface">{act?.name}</h4>
                              <p className="text-xs text-on-surface-variant">{act?.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                            <span className="bg-surface-container font-medium px-2.5 py-1 rounded-full text-on-surface-variant capitalize">
                              {act?.category || 'Activity'}
                            </span>
                            <span className="font-bold text-primary text-sm">${sa.cost_override || act?.cost || 0} USD</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <h3 className="font-display font-bold text-lg text-on-surface">Dynamic Itinerary Calendar</h3>
              <p className="text-xs text-on-surface-variant">Scheduled stops and activities mapped to actual trip dates</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary-container/10 px-3 py-1 rounded-full">
              {trip?.start_date} → {trip?.end_date}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stops.map((stop, idx) => {
              const city = SEED_CITIES.find(c => c.id === stop.city_id)
              const currentSA = stopActivities.filter(sa => sa.stop_id === stop.id)

              return (
                <div key={stop.id} className="p-4 bg-surface rounded-xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">{city?.name}, {city?.country}</h4>
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                      {stop.start_date}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentSA.map(sa => {
                      const act = SEED_ACTIVITIES.find(a => a.id === sa.activity_id)
                      return (
                        <div key={sa.id} className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex items-center justify-between text-xs">
                          <div className="truncate">
                            <span className="font-semibold text-on-surface truncate block">{act?.name}</span>
                            <span className="text-[10px] text-on-surface-variant">{sa.scheduled_date} • {sa.scheduled_time || '10:00'}</span>
                          </div>
                          <span className="font-bold text-primary text-xs shrink-0 ml-2">${sa.cost_override || act?.cost || 0}</span>
                        </div>
                      )
                    })}

                    {currentSA.length === 0 && (
                      <p className="text-xs text-on-surface-variant italic py-2">No activities scheduled yet.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
