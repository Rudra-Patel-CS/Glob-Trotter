import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase, SEED_CITIES } from '../lib/supabase'

export default function NewTripWizard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1 | 2 | 3
  const [loading, setLoading] = useState(false)

  // Step 1 Form state
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [startDate, setStartDate] = useState('2026-09-01')
  const [endDate, setEndDate] = useState('2026-09-14')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [isPublic, setIsPublic] = useState(false)
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80')

  // Step 2 Form state (Stops)
  const [availableCities, setAvailableCities] = useState([])
  const [selectedStops, setSelectedStops] = useState([
    { city: SEED_CITIES[0], start_date: '2026-09-01', end_date: '2026-09-05' },
    { city: SEED_CITIES[2], start_date: '2026-09-06', end_date: '2026-09-10' }
  ])

  useEffect(() => {
    async function loadCities() {
      const { data } = await supabase.from('cities').select('*')
      if (data && data.length) setAvailableCities(data)
      else setAvailableCities(SEED_CITIES)
    }
    loadCities()
  }, [])

  const handleAddStop = (city) => {
    if (!city) return
    setSelectedStops([
      ...selectedStops,
      { city, start_date: startDate, end_date: endDate }
    ])
  }

  const handleRemoveStop = (index) => {
    setSelectedStops(selectedStops.filter((_, i) => i !== index))
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setCoverPhotoUrl(localUrl)
  }

  const handleCreateTrip = async () => {
    setLoading(true)
    try {
      // 1. Insert into trips table (aligned with Supabase schema: cover_image, share_code)
      const newTrip = {
        name: name || 'My Next Adventure',
        start_date: startDate || '2026-09-01',
        end_date: endDate || '2026-09-14',
        description: description || '',
        cover_image: coverPhotoUrl,
        is_public: isPublic,
        share_code: 'share_' + Date.now()
      }
      if (user?.id) {
        newTrip.user_id = user.id
      }

      const { data: tripData, error: tripErr } = await supabase.from('trips').insert([newTrip]).select()
      
      let createdTrip = Array.isArray(tripData) && tripData.length ? tripData[0] : null
      if (!createdTrip) {
        // Retry query or fallback ID
        const { data: fetchCreated } = await supabase.from('trips').select('*').eq('name', newTrip.name).order('created_at', { ascending: false }).limit(1)
        createdTrip = fetchCreated && fetchCreated.length ? fetchCreated[0] : { id: 't_' + Date.now(), ...newTrip }
      }
      const tripId = createdTrip.id || ('t_' + Date.now())
      createdTrip.id = tripId
      createdTrip.cover_photo_url = createdTrip.cover_photo_url || coverPhotoUrl
      createdTrip.cover_image = createdTrip.cover_image || coverPhotoUrl

      // Guaranteed Local Cache Persistence so created trip never disappears
      const existingCustomTrips = JSON.parse(localStorage.getItem('gt_custom_trips') || '[]')
      localStorage.setItem('gt_custom_trips', JSON.stringify([createdTrip, ...existingCustomTrips.filter(t => t.id !== tripId)]))

      // 2. Insert stops into trip_stops table
      if (selectedStops.length > 0) {
        const stopsToInsert = selectedStops.map((stop, idx) => ({
          id: 's_' + Date.now() + '_' + idx,
          trip_id: tripId,
          city_id: stop.city.id,
          arrival_date: stop.start_date || startDate,
          departure_date: stop.end_date || endDate,
          start_date: stop.start_date || startDate,
          end_date: stop.end_date || endDate,
          stop_order: idx,
          order_index: idx
        }))

        const existingCustomStops = JSON.parse(localStorage.getItem('gt_custom_stops') || '[]')
        localStorage.setItem('gt_custom_stops', JSON.stringify([...stopsToInsert, ...existingCustomStops]))

        const { error: stopsErr } = await supabase.from('trip_stops').insert(stopsToInsert)
        if (stopsErr) {
          console.warn('trip_stops insert note, trying fallback stops:', stopsErr)
          await supabase.from('stops').insert(stopsToInsert)
        }
      }

      navigate(`/trips/${tripId}/builder`)
    } catch (err) {
      console.error('Error creating trip:', err)
      setNameError('Failed to save trip to database: ' + (err.message || 'Check connection'))
    } finally {
      setLoading(false)
    }
  }

  const coverPresets = [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Plan a New Trip</h1>
        <p className="font-sans text-sm text-on-surface-variant mt-1">
          Follow the 3-step wizard to create your customized multi-city itinerary
        </p>
      </div>

      {/* Stepper Header */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
        {[
          { num: 1, title: 'Trip Info', desc: 'Basic details & dates' },
          { num: 2, title: 'Add Stops', desc: 'Cities & duration' },
          { num: 3, title: 'Review', desc: 'Confirm & build' }
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step === s.num
                    ? 'bg-coral text-white shadow-md'
                    : step > s.num
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface-variant/50'
                }`}
              >
                {step > s.num ? <span className="material-symbols-outlined text-base">check</span> : s.num}
              </div>
              <div className="hidden sm:block">
                <div className={`font-semibold text-xs ${step === s.num ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {s.title}
                </div>
                <div className="text-[10px] text-on-surface-variant/70">{s.desc}</div>
              </div>
            </div>
            {idx < 2 && <div className="flex-1 h-[2px] bg-outline-variant/30 mx-4 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-fade">
            <h3 className="font-display font-bold text-xl text-on-surface border-b border-outline-variant/20 pb-3">
              Step 1: Basic Trip Information
            </h3>

            {nameError && (
              <div className="p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 font-medium">
                <span className="material-symbols-outlined text-base text-error">error</span>
                <span>{nameError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Trip Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(''); }}
                  placeholder="e.g., Grand European Summer Tour"
                  className="w-full px-4 py-2.5 text-sm bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">End Date *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your travel goals, highlights, or group details..."
                  className="w-full px-4 py-2.5 text-sm bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-surface border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary font-medium text-on-surface"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant"
                  />
                  <div>
                    <div className="text-xs font-semibold text-on-surface">Make Trip Public</div>
                    <div className="text-[11px] text-on-surface-variant">Allow sharing with friends via a public link</div>
                  </div>
                </label>
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="block text-xs font-semibold text-on-surface">Cover Photo</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img src={coverPhotoUrl} alt="Cover preview" className="w-full sm:w-48 h-28 rounded-xl object-cover border border-outline-variant/40" />
                  <div className="space-y-2">
                    <p className="text-xs text-on-surface-variant">Choose a photo preset or upload a custom image:</p>
                    <div className="flex gap-2">
                      {coverPresets.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCoverPhotoUrl(preset)}
                          className="w-10 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary"
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-xs font-semibold rounded-lg cursor-pointer transition-colors text-on-surface">
                      <span className="material-symbols-outlined text-base">upload_file</span>
                      <span>Upload Custom Cover</span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 border-t border-outline-variant/20 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!name) return setNameError('Please enter a trip name before continuing.')
                  setStep(2)
                }}
                className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Add Stops</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade">
            <h3 className="font-display font-bold text-xl text-on-surface border-b border-outline-variant/20 pb-3">
              Step 2: Add City Stops
            </h3>

            {/* City Selector */}
            <div className="bg-surface p-4 rounded-xl border border-outline-variant/30 space-y-3">
              <label className="block text-xs font-semibold text-on-surface">Add Destination City to Itinerary</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableCities.slice(0, 8).map(city => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleAddStop(city)}
                    className="flex items-center gap-2 p-2 bg-surface-container-lowest hover:bg-primary-container/10 hover:border-primary border border-outline-variant/30 rounded-lg text-left transition-all"
                  >
                    <img src={city.image_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                    <div className="truncate">
                      <div className="font-semibold text-xs text-on-surface truncate">{city.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{city.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stops List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Selected Stops ({selectedStops.length})
              </h4>
              {selectedStops.map((stop, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <img src={stop.city.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-sm text-on-surface">{stop.city.name}, {stop.city.country}</div>
                      <div className="text-xs text-on-surface-variant">
                        Dates: {stop.start_date} → {stop.end_date}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    className="p-1.5 text-error hover:bg-error-container/30 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-outline-variant/20 gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors text-center"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-2"
              >
                <span>Review Itinerary</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade">
            <h3 className="font-display font-bold text-xl text-on-surface border-b border-outline-variant/20 pb-3">
              Step 3: Review & Confirm
            </h3>

            {/* Trip Preview Banner */}
            <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
              <img src={coverPhotoUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/40 to-transparent p-6 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-wider font-semibold text-on-primary-container">
                  {currency} • {isPublic ? 'Public Shareable' : 'Private Trip'}
                </span>
                <h2 className="font-display font-bold text-2xl drop-shadow">{name || 'My Trip'}</h2>
                <p className="text-xs text-white/90">{startDate} → {endDate}</p>
              </div>
            </div>

            {/* Stops Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Stops Overview</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedStops.map((stop, idx) => (
                  <div key={idx} className="p-3 bg-surface rounded-xl border border-outline-variant/30 flex items-center gap-3">
                    <img src={stop.city.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-xs text-on-surface">{idx + 1}. {stop.city.name}</div>
                      <div className="text-[11px] text-on-surface-variant">{stop.city.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-outline-variant/20 gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors text-center"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateTrip}
                disabled={loading}
                className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-8 py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span>Create Trip & Open Builder</span>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
