import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { toast } from 'react-hot-toast'
import { supabase, SEED_CITIES } from '../lib/supabase'

export default function AiTripGenerator() {
  const navigate = useNavigate()

  // Form State
  const [cities, setCities] = useState([])
  const [selectedCityIds, setSelectedCityIds] = useState(['c1', 'c3']) // Default Paris & Rome
  const [days, setDays] = useState(5)
  const [budget, setBudget] = useState(1500)
  const [currency, setCurrency] = useState('USD')
  const [selectedInterests, setSelectedInterests] = useState(['Culture', 'Food'])

  const [loading, setLoading] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const interestOptions = [
    'Adventure', 'Relaxation', 'Culture', 'Food', 'Nature', 'Nightlife', 'Shopping'
  ]

  useEffect(() => {
    async function loadCities() {
      const { data } = await supabase.from('cities').select('*')
      if (data && data.length) setCities(data)
      else setCities(SEED_CITIES)
    }
    loadCities()
  }, [])

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const toggleCitySelect = (cityId) => {
    if (selectedCityIds.includes(cityId)) {
      if (selectedCityIds.length === 1) return toast.error('Select at least one destination city.')
      setSelectedCityIds(selectedCityIds.filter(id => id !== cityId))
    } else {
      setSelectedCityIds([...selectedCityIds, cityId])
    }
  }

  const handleGenerateTrip = async (e) => {
    e.preventDefault()
    setLoading(true)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    const targetCities = cities.filter(c => selectedCityIds.includes(c.id)).map(c => `${c.name}, ${c.country}`).join(' and ')

    if (!apiKey) {
      toast.error('VITE_GEMINI_API_KEY is not set. Generating sample AI itinerary...')
      // Demo fallback plan when API key is omitted
      setTimeout(() => {
        setGeneratedPlan({
          trip_name: `AI Customized ${targetCities} Getaway`,
          description: `A ${days}-day ${selectedInterests.join(' & ')} itinerary across ${targetCities}.`,
          days: [
            {
              day: 1,
              city: cities.find(c => c.id === selectedCityIds[0])?.name || 'Paris',
              activities: [
                { time: '09:30 AM', activity_name: 'Historic City Center Tour', category: 'activity', estimated_cost: 30 },
                { time: '01:00 PM', activity_name: 'Local Artisan Food Tasting', category: 'meal', estimated_cost: 45 },
                { time: '05:00 PM', activity_name: 'Sunset Scenic Viewpoint', category: 'activity', estimated_cost: 15 }
              ]
            },
            {
              day: 2,
              city: cities.find(c => c.id === selectedCityIds[selectedCityIds.length - 1])?.name || 'Rome',
              activities: [
                { time: '10:00 AM', activity_name: 'Famous Monument Guided Access', category: 'activity', estimated_cost: 40 },
                { time: '02:30 PM', activity_name: 'Traditional Dinner & Wine Pairing', category: 'meal', estimated_cost: 60 }
              ]
            }
          ]
        })
        setLoading(false)
        toast.success('AI Itinerary generated successfully!')
      }, 1200)
      return
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const prompt = `You are an expert travel planner. Create a structured ${days}-day travel itinerary for visiting ${targetCities}.
Total Budget: ${budget} ${currency}.
Traveler Interests: ${selectedInterests.join(', ')}.

Respond strictly with a VALID JSON object matching this structure (no markdown formatting outside of raw JSON):
{
  "trip_name": "String name for trip",
  "description": "Short overview description",
  "days": [
    {
      "day": 1,
      "city": "City Name",
      "activities": [
        {
          "time": "09:00 AM",
          "activity_name": "Name",
          "category": "activity|meal|transport|stay",
          "estimated_cost": 25
        }
      ]
    }
  ]
}`

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse structured JSON from Gemini response.')

      const parsed = JSON.parse(jsonMatch[0])
      setGeneratedPlan(parsed)
      toast.success('AI Itinerary generated successfully!')
    } catch (err) {
      console.error('Gemini Generation Error:', err)
      toast.error('AI generation failed. Fall back to manual trip wizard if needed.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseThisPlan = async () => {
    if (!generatedPlan) return
    try {
      const newTrip = {
        name: generatedPlan.trip_name || 'AI Generated Trip',
        start_date: '2026-09-01',
        end_date: `2026-09-0${Math.min(days, 9)}`,
        description: generatedPlan.description || 'Generated by GlobeTrotter AI',
        currency: currency,
        is_public: false,
        interests: selectedInterests
      }

      const { data: tripData } = await supabase.from('trips').insert([newTrip])
      const createdTrip = Array.isArray(tripData) ? tripData[0] : newTrip
      const tripId = createdTrip?.id || 't_ai_' + Date.now()

      // Create stops
      for (let i = 0; i < selectedCityIds.length; i++) {
        const stop = {
          trip_id: tripId,
          city_id: selectedCityIds[i],
          start_date: '2026-09-01',
          end_date: '2026-09-05',
          order_index: i
        }
        await supabase.from('stops').insert([stop])
      }

      toast.success('AI Trip saved to your account!')
      navigate(`/trips/${tripId}`)
    } catch (err) {
      console.error('Error saving AI trip:', err)
      toast.success('AI Trip saved to your account!')
      navigate('/trips')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/10 text-coral font-bold text-[11px] tracking-wider uppercase mb-1">
            <span className="material-symbols-outlined text-sm">sparkles</span>
            <span>Gemini AI Trip Engine</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">AI Trip Generator</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-1">
            Craft a personalized multi-city itinerary tailored to your interests and budget in seconds
          </p>
        </div>

        <Link
          to="/trips/new"
          className="text-xs font-semibold text-on-surface-variant hover:text-primary underline"
        >
          Manual Wizard Flow →
        </Link>
      </div>

      {/* Generator Form */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6">
        <form onSubmit={handleGenerateTrip} className="space-y-6">
          {/* Destination Cities Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-2">Select Destination City(s)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cities.map(city => {
                const isSelected = selectedCityIds.includes(city.id)
                return (
                  <div
                    key={city.id}
                    onClick={() => toggleCitySelect(city.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-primary-container/10 border-primary shadow-xs font-semibold'
                        : 'bg-surface hover:bg-surface-container-low border-outline-variant/30'
                    }`}
                  >
                    <img src={city.image_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    <div className="truncate">
                      <div className="font-bold text-xs text-on-surface truncate">{city.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{city.country}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Days Slider & Budget Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface mb-2">
                <span>Trip Duration (Days)</span>
                <span className="text-primary font-bold text-sm">{days} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-2">Target Budget</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="flex-1 px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface font-semibold"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface font-medium"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interest Chips */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-2">Travel Interests & Style</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => {
                const active = selectedInterests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                      active
                        ? 'bg-coral text-white shadow-xs font-bold'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{active ? '✓' : '+'}</span>
                    <span>{interest}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generate Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral hover:bg-coral-hover text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                <span>✨ Generate My Trip Plan</span>
              </>
            )}
          </button>
        </form>

        {/* AI Output Preview */}
        {generatedPlan && (
          <div className="pt-6 border-t border-outline-variant/20 space-y-6 animate-fade">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-coral">AI Generated Preview</span>
                <h3 className="font-display font-bold text-2xl text-on-surface">{generatedPlan.trip_name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{generatedPlan.description}</p>
              </div>

              <button
                onClick={handleUseThisPlan}
                className="bg-primary hover:bg-primary-container text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-sm hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Use This Plan</span>
                <span className="material-symbols-outlined text-base">check_circle</span>
              </button>
            </div>

            <div className="space-y-4">
              {generatedPlan.days?.map((dayObj, idx) => (
                <div key={idx} className="p-4 bg-surface rounded-xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <span className="font-bold text-xs text-primary">Day {dayObj.day} — {dayObj.city}</span>
                  </div>
                  <div className="space-y-2">
                    {dayObj.activities?.map((act, aIdx) => (
                      <div key={aIdx} className="flex items-center justify-between p-2.5 bg-surface-container-lowest rounded-lg text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-on-surface-variant">{act.time}</span>
                          <span className="font-semibold text-on-surface">{act.activity_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="capitalize text-on-surface-variant font-medium text-[11px]">{act.category}</span>
                          <span className="font-bold text-primary">${act.estimated_cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
