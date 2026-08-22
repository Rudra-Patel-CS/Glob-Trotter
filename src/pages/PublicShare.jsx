import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function PublicShare() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadSharedTrip() {
      // Fetch shared trip
      setTrip({
        id: 't1',
        name: 'Grand European Summer',
        start_date: '2026-09-01',
        end_date: '2026-09-14',
        traveler_name: 'Alex Rivers',
        description: 'Multi-city travel itinerary exploring Paris, Rome, and Barcelona.',
        cover_photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
      })
      setStops([
        { id: 's1', city: SEED_CITIES[0], dates: 'Sept 1 - Sept 5' },
        { id: 's2', city: SEED_CITIES[2], dates: 'Sept 6 - Sept 10' },
        { id: 's3', city: SEED_CITIES[3], dates: 'Sept 11 - Sept 14' }
      ])
    }
    loadSharedTrip()
  }, [token])

  const handleCopyTripToAccount = async () => {
    const newTrip = {
      name: `${trip.name} (Copy)`,
      start_date: trip.start_date,
      end_date: trip.end_date,
      description: trip.description,
      cover_photo_url: trip.cover_photo_url,
      currency: 'USD',
      is_public: false
    }
    const { data } = await supabase.from('trips').insert([newTrip])
    alert('Trip duplicated successfully into your account!')
    navigate('/trips')
  }

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-fade py-6 px-4 sm:px-6">
      {/* Public Share Hero */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30">
        <img src={trip?.cover_photo_url} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/40 to-transparent p-6 sm:p-10 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary-container text-on-primary-container font-bold text-xs px-3 py-1 rounded-full">
              Public Shared Itinerary
            </span>
            <span className="text-xs text-white/90">Created by {trip?.traveler_name}</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl drop-shadow-md">{trip?.name}</h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-2">{trip?.description}</p>
        </div>
      </div>

      {/* Share Actions Bar */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copy Trip CTA */}
        <button
          onClick={handleCopyTripToAccount}
          className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">content_copy</span>
          <span>Copy This Trip to My Account</span>
        </button>

        {/* Share Social Links */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2.5 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-xl text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">link</span>
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=Check out this trip: ${window.location.href}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            title="Share via WhatsApp"
          >
            💬 WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Check out this trip: ${window.location.href}`}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface"
            title="Share on X"
          >
            𝕏 Post
          </a>
        </div>
      </div>

      {/* Read-Only Summary Grid */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-xl text-on-surface">Itinerary Summary</h3>
        <div className="grid grid-cols-1 gap-4">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex items-center gap-4 shadow-xs">
              <span className="w-10 h-10 rounded-xl bg-primary-container text-on-primary font-bold text-lg flex items-center justify-center">
                {idx + 1}
              </span>
              <img src={stop.city.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-base text-on-surface">{stop.city.name}, {stop.city.country}</h4>
                <p className="text-xs text-on-surface-variant">{stop.dates}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
