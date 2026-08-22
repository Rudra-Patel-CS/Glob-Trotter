import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function TripCalendar() {
  const { id } = useParams()

  const [trip, setTrip] = useState(null)
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid' | 'timeline'
  const [selectedDay, setSelectedDay] = useState(2)
  const [showSidePanel, setShowSidePanel] = useState(false)

  // Open-Meteo Weather forecast state (Paris lat: 48.8566, lng: 2.3522)
  const [weatherData, setWeatherData] = useState(null)

  const [dayActivities, setDayActivities] = useState([
    { id: '1', title: 'Eiffel Tower Outdoor Observation Summit', time: '10:00 AM', category: 'activity', outdoor: true, cost: 35 },
    { id: '2', title: 'Louvre Museum Indoor Masterpieces Tour', time: '02:00 PM', category: 'activity', outdoor: false, cost: 65 },
    { id: '3', title: 'Seine River Open-Deck Dinner Cruise', time: '07:30 PM', category: 'meal', outdoor: true, cost: 85 }
  ])

  useEffect(() => {
    async function loadTripAndWeather() {
      const { data } = await supabase.from('trips').select('*').eq('id', id).single()
      setTrip(data || { id, name: 'Grand European Summer', start_date: '2026-09-01', end_date: '2026-09-14' })

      // Fetch Open-Meteo weather forecast for Paris coordinates (lat: 48.85, lng: 2.35)
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&daily=temperature_2m_max,precipitation_sum&timezone=auto')
        const json = await res.json()
        setWeatherData(json.daily)
      } catch (err) {
        console.warn('Open-Meteo weather fetch fallback:', err)
      }
    }
    loadTripAndWeather()
  }, [id])

  const handleDeleteActivity = (actId) => {
    setDayActivities(dayActivities.filter(a => a.id !== actId))
  }

  // Helper weather getter per day
  const getDayWeather = (dayNum) => {
    if (!weatherData?.temperature_2m_max) {
      // Mock realistic weather values
      const isRainy = dayNum === 3 || dayNum === 7
      return { temp: 22 + (dayNum % 4), isRainy, icon: isRainy ? '🌧️' : '☀️' }
    }
    const idx = (dayNum - 1) % weatherData.temperature_2m_max.length
    const temp = Math.round(weatherData.temperature_2m_max[idx] || 24)
    const rain = (weatherData.precipitation_sum?.[idx] || 0) > 0.5 || (dayNum === 3)
    return { temp, isRainy: rain, icon: rain ? '🌧️' : '☀️' }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to={`/trips/${id}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Itinerary</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight mt-1">
            Calendar & Weather Schedule
          </h1>
          <p className="font-sans text-sm text-on-surface-variant">
            Day-by-day itinerary schedule with Open-Meteo weather alerts
          </p>
        </div>

        {/* Layout Toggle */}
        <div className="flex bg-surface-container rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setLayoutMode('grid')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">calendar_view_month</span>
            <span>Calendar Grid</span>
          </button>
          <button
            onClick={() => setLayoutMode('timeline')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              layoutMode === 'timeline' ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-base">timeline</span>
            <span>Vertical Timeline</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar / Timeline Main Area */}
        <div className={`${showSidePanel ? 'lg:col-span-2' : 'lg:col-span-3'} bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs transition-all`}>
          {layoutMode === 'grid' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="font-display font-bold text-base text-on-surface">September 2026</h3>
                <span className="text-xs text-on-surface-variant font-medium">Click any date to inspect day schedule & weather</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-on-surface-variant mb-1">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNum = idx + 1
                  const isSelected = selectedDay === dayNum
                  const weather = getDayWeather(dayNum)
                  const hasActivities = dayNum % 2 === 0 || dayNum === 3

                  return (
                    <div
                      key={dayNum}
                      onClick={() => { setSelectedDay(dayNum); setShowSidePanel(true); }}
                      className={`min-h-[95px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-primary-container/10 border-primary ring-2 ring-primary/30 shadow-sm'
                          : 'bg-surface hover:bg-surface-container-low border-outline-variant/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className={isSelected ? 'text-primary' : 'text-on-surface'}>{dayNum}</span>
                        <span className="text-[10px] text-on-surface-variant font-medium" title="Open-Meteo Forecast">
                          {weather.icon} {weather.temp}°C
                        </span>
                      </div>

                      {hasActivities && (
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
                            <span className="text-[10px] text-on-surface-variant font-medium truncate">2 Activities</span>
                          </div>
                          {weather.isRainy && (
                            <div className="bg-tertiary-container/30 text-on-tertiary-container text-[9px] font-bold px-1 py-0.5 rounded truncate">
                              ☔ Rain expected
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Vertical Timeline Mode */
            <div className="space-y-6">
              <h3 className="font-display font-bold text-base text-on-surface border-b border-outline-variant/20 pb-3">
                Vertical Trip Timeline
              </h3>
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
                {[1, 2, 3, 4, 5].map((d) => {
                  const w = getDayWeather(d)
                  return (
                    <div key={d} className="relative group">
                      <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-primary border-4 border-surface shadow-sm" />
                      <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-on-surface">Day {d} — Sept {d}, 2026</h4>
                          <span className="text-xs font-semibold text-primary">{w.icon} {w.temp}°C • Paris Stop</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">2 Activities planned • Total cost: $100</p>
                        {w.isRainy && (
                          <div className="p-2 bg-tertiary-container/30 text-on-tertiary-container text-xs font-semibold rounded-lg flex items-center gap-1.5">
                            <span>☔</span>
                            <span>Rain expected — consider moving outdoor activities to indoor museum tours.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel for Day Schedule */}
        {showSidePanel && (
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6 animate-fade">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-coral tracking-wider">Day Schedule</span>
                <h3 className="font-display font-bold text-lg text-on-surface">Sept {selectedDay}, 2026</h3>
              </div>
              <button onClick={() => setShowSidePanel(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Weather Hint Banner */}
            {getDayWeather(selectedDay).isRainy && (
              <div className="p-3 bg-tertiary-container/30 text-on-tertiary-container text-xs rounded-xl border border-tertiary-container/50 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>☔ Rain Expected Today ({getDayWeather(selectedDay).temp}°C)</span>
                </div>
                <p className="text-[11px] leading-tight">
                  For outdoor activities like walking tours, consider bringing an umbrella or swapping to indoor museum visits.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {dayActivities.map((act) => (
                <div key={act.id} className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{act.time}</span>
                    <button onClick={() => handleDeleteActivity(act.id)} className="text-error hover:bg-error-container/30 p-1 rounded">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                  <h4 className="font-bold text-xs text-on-surface">{act.title}</h4>
                  <div className="text-[10px] text-on-surface-variant flex justify-between pt-1">
                    <span className="capitalize">{act.category} {act.outdoor ? '• Outdoor 🌳' : ''}</span>
                    <span className="font-semibold text-on-surface">${act.cost}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert(`Added new activity slot for Sept ${selectedDay}!`)}
              className="w-full bg-coral hover:bg-coral-hover text-white font-semibold text-xs py-2 rounded-lg transition-colors"
            >
              + Quick Add Slot
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
