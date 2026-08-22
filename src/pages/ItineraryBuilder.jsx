import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function ItineraryBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [selectedStopId, setSelectedStopId] = useState(null)
  const [stopActivities, setStopActivities] = useState([])
  const [activitiesList, setActivitiesList] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals / Drawers state
  const [showAddStopModal, setShowAddStopModal] = useState(false)
  const [showAddActivityDrawer, setShowAddActivityDrawer] = useState(false)
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all')

  useEffect(() => {
    async function loadBuilderData() {
      setLoading(true)
      try {
        // Load trip
        const { data: tripData } = await supabase.from('trips').select('*').eq('id', id).single()
        if (tripData) setTrip(tripData)
        else {
          setTrip({ id, name: 'Grand European Summer', currency: 'USD', start_date: '2026-09-01', end_date: '2026-09-14' })
        }

        // Load stops
        const { data: stopData } = await supabase.from('stops').select('*').eq('trip_id', id).order('order_index', { ascending: true })
        if (stopData && stopData.length) {
          setStops(stopData)
          setSelectedStopId(stopData[0].id)
        } else {
          // Default stops
          const defaultStops = [
            { id: 's1', trip_id: id, city_id: 'c1', start_date: '2026-09-01', end_date: '2026-09-05', order_index: 0 },
            { id: 's2', trip_id: id, city_id: 'c3', start_date: '2026-09-06', end_date: '2026-09-10', order_index: 1 }
          ]
          setStops(defaultStops)
          setSelectedStopId('s1')
        }

        // Load cities
        const { data: cityData } = await supabase.from('cities').select('*')
        setCities(cityData && cityData.length ? cityData : SEED_CITIES)

        // Load activities
        const { data: actData } = await supabase.from('activities').select('*')
        setActivitiesList(actData && actData.length ? actData : SEED_ACTIVITIES)

        // Load stop activities
        const { data: saData } = await supabase.from('stop_activities').select('*')
        setStopActivities(saData || [])
      } catch (err) {
        console.error('Error loading builder:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBuilderData()
  }, [id])

  // Get active stop details
  const activeStop = stops.find(s => s.id === selectedStopId)
  const activeCity = activeStop ? cities.find(c => c.id === activeStop.city_id) : null

  // Stop activities for active stop
  const currentStopActivities = stopActivities.filter(sa => sa.stop_id === selectedStopId)

  // Calculate total running cost
  const totalCost = stopActivities.reduce((sum, sa) => {
    const act = activitiesList.find(a => a.id === sa.activity_id)
    return sum + Number(sa.cost_override !== undefined ? sa.cost_override : (act?.cost || 0))
  }, 0)

  // Add stop
  const handleAddStopToTrip = async (city) => {
    const newStop = {
      id: 's_' + Date.now(),
      trip_id: id,
      city_id: city.id,
      start_date: trip?.start_date || '2026-09-01',
      end_date: trip?.end_date || '2026-09-05',
      order_index: stops.length
    }
    await supabase.from('stops').insert([newStop])
    setStops([...stops, newStop])
    setSelectedStopId(newStop.id)
    setShowAddStopModal(false)
    toast.success(`Stop ${city.name} added!`)
  }

  // Add activity to current stop
  const handleAddActivityToStop = async (activity) => {
    if (!selectedStopId) return
    const newSA = {
      id: 'sa_' + Date.now(),
      stop_id: selectedStopId,
      activity_id: activity.id,
      scheduled_date: activeStop?.start_date || '2026-09-02',
      scheduled_time: '10:00',
      cost_override: activity.cost
    }
    await supabase.from('stop_activities').insert([newSA])
    setStopActivities([...stopActivities, newSA])
    toast.success(`Activity "${activity.name}" added!`)
  }

  // Remove activity from stop
  const handleRemoveActivityFromStop = async (saId) => {
    await supabase.from('stop_activities').delete().eq('id', saId)
    setStopActivities(stopActivities.filter(sa => sa.id !== saId))
    toast.success('Activity removed')
  }

  // Move stop order
  const handleMoveStop = (idx, direction) => {
    const newStops = [...stops]
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= newStops.length) return
    const temp = newStops[idx]
    newStops[idx] = newStops[targetIdx]
    newStops[targetIdx] = temp
    newStops.forEach((s, i) => s.order_index = i)
    setStops(newStops)
  }

  const filteredActivitiesDrawer = activitiesList.filter(a => {
    if (activityCategoryFilter === 'all') return true
    return a.category === activityCategoryFilter
  })

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 animate-fade">
      {/* Top Bar with Total Cost Counter */}
      <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to={`/trips/${id}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Itinerary View</span>
            </Link>
          </div>
          <h1 className="font-display font-bold text-2xl text-on-surface mt-1">
            Itinerary Builder: {trip?.name || 'My Trip'}
          </h1>
          <p className="text-xs text-on-surface-variant">Drag stops to reorder & customize activities per city</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary-container/10 border border-primary-container/30 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block tracking-wider">Running Total</span>
            <span className="font-display font-bold text-xl text-primary">${totalCost} USD</span>
          </div>

          <Link
            to={`/trips/${id}`}
            className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>View Final Plan</span>
          </Link>
        </div>
      </div>

      {/* Main Builder Grid: Left Stops | Right Activity Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Draggable List of Stops */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_city</span>
              <span>City Stops ({stops.length})</span>
            </h3>
            <button
              onClick={() => setShowAddStopModal(true)}
              className="text-xs font-bold text-coral hover:text-coral-hover flex items-center gap-1 bg-coral/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {stops.map((stop, idx) => {
              const city = cities.find(c => c.id === stop.city_id)
              const isSelected = stop.id === selectedStopId
              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary-container/10 border-primary shadow-sm font-semibold'
                      : 'bg-surface hover:bg-surface-container-low border-outline-variant/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-outline cursor-grab">drag_indicator</span>
                    <img src={city?.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-sm text-on-surface">{city?.name || 'City'}</div>
                      <div className="text-[11px] text-on-surface-variant">{stop.start_date} → {stop.end_date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveStop(idx, -1); }}
                      disabled={idx === 0}
                      className="p-1 text-on-surface-variant hover:bg-surface-container rounded disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveStop(idx, 1); }}
                      disabled={idx === stops.length - 1}
                      className="p-1 text-on-surface-variant hover:bg-surface-container rounded disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Activity Checklist for Selected Stop */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div>
              <div className="text-xs uppercase font-bold text-coral tracking-wider">Active Stop Checklist</div>
              <h2 className="font-display font-bold text-2xl text-on-surface">
                {activeCity ? `${activeCity.name}, ${activeCity.country}` : 'Select a Stop'}
              </h2>
            </div>

            <button
              onClick={() => setShowAddActivityDrawer(true)}
              className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Activity to Stop</span>
            </button>
          </div>

          {/* Checklist of activities */}
          {currentStopActivities.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant bg-surface rounded-xl border border-dashed border-outline-variant/40 p-6">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">attractions</span>
              <p className="text-sm font-semibold">No activities added for {activeCity?.name || 'this stop'} yet.</p>
              <p className="text-xs text-on-surface-variant/80 mt-1">Click "Add Activity to Stop" to choose tours, meals & sights.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentStopActivities.map((sa) => {
                const act = activitiesList.find(a => a.id === sa.activity_id)
                return (
                  <div
                    key={sa.id}
                    className="p-4 bg-surface rounded-xl border border-outline-variant/30 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={act?.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{act?.name || 'Activity'}</h4>
                        <p className="text-xs text-on-surface-variant">{act?.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant/80 mt-1">
                          <span className="capitalize font-semibold text-primary">🏷️ {act?.category || 'Activity'}</span>
                          <span>⏱️ {act?.duration_minutes || 120} mins</span>
                          <span className="font-bold text-on-surface">💵 ${sa.cost_override || act?.cost || 0}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveActivityFromStop(sa.id)}
                      className="p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors"
                      title="Remove activity"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Stop Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl max-w-lg w-full space-y-4 border border-outline-variant/30 animate-rise">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-display font-bold text-lg text-on-surface">Add Destination City</h3>
              <button onClick={() => setShowAddStopModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {cities.map((city) => (
                <div
                  key={city.id}
                  onClick={() => handleAddStopToTrip(city)}
                  className="flex items-center gap-3 p-2.5 bg-surface-container-lowest hover:bg-primary-container/10 border border-outline-variant/30 rounded-xl cursor-pointer transition-all"
                >
                  <img src={city.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-xs text-on-surface">{city.name}</div>
                    <div className="text-[10px] text-on-surface-variant">{city.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Filterable Drawer */}
      {showAddActivityDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-on-background/50 backdrop-blur-xs animate-fade">
          <div className="bg-surface w-full max-w-md h-full shadow-2xl border-l border-outline-variant/30 p-6 flex flex-col space-y-4 animate-rise">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-on-surface">Add Activity</h3>
                <p className="text-xs text-on-surface-variant">Filter by category & select to add</p>
              </div>
              <button onClick={() => setShowAddActivityDrawer(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'activity', 'meal', 'transport'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActivityCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-all whitespace-nowrap ${
                    activityCategoryFilter === cat
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredActivitiesDrawer.map(act => (
                <div key={act.id} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-between gap-3">
                  <img src={act.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="font-bold text-xs text-on-surface">{act.name}</div>
                    <div className="text-[10px] text-on-surface-variant">${act.cost} • {act.duration_minutes}m</div>
                  </div>
                  <button
                    onClick={() => { handleAddActivityToStop(act); setShowAddActivityDrawer(false); }}
                    className="bg-coral text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-coral-hover transition-colors"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
