import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase, SEED_CITIES, SEED_ACTIVITIES } from '../lib/supabase'

export default function TravelAssistant() {
  const { id } = useParams()
  const location = useLocation()

  // Only render on trip detail pages (/trips/:id, /trips/:id/builder, /trips/:id/budget)
  const isTripPage = Boolean(id) && (
    location.pathname === `/trips/${id}` ||
    location.pathname === `/trips/${id}/builder` ||
    location.pathname === `/trips/${id}/budget`
  )

  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi! I am your AI Travel Assistant. Ask me anything about your itinerary, local spots, or budget optimization!' }
  ])

  const [tripContext, setTripContext] = useState(null)

  useEffect(() => {
    if (!id || !isTripPage) return
    async function loadTripContext() {
      const { data: tripData } = await supabase.from('trips').select('*').eq('id', id).single()
      const { data: stopsData } = await supabase.from('stops').select('*').eq('trip_id', id)
      setTripContext({
        trip: tripData || { name: 'Grand European Summer', currency: 'USD' },
        stops: stopsData || [{ city_id: 'c1' }, { city_id: 'c3' }]
      })
    }
    loadTripContext()
  }, [id, isTripPage])

  if (!isTripPage) return null

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userText = inputMessage.trim()
    const newMessages = [...messages, { sender: 'user', text: userText }]
    setMessages(newMessages.slice(-10))
    setInputMessage('')
    setLoading(true)

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: `Here is a recommendation for your trip "${tripContext?.trip?.name || 'Itinerary'}": For your current stops, I suggest exploring local food markets in the morning and taking walking tours in the evening!` }
        ].slice(-10))
        setLoading(false)
      }, 1000)
      return
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      const contextPrefix = `You are a helpful travel assistant for the trip "${tripContext?.trip?.name}".
Trip Details: ${tripContext?.trip?.description || 'Multi-city travel plan'}.
User Question: ${userText}`

      const result = await model.generateContent(contextPrefix)
      const responseText = result.response.text()

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: responseText }
      ].slice(-10))
    } catch (err) {
      console.error('Travel Assistant Gemini Error:', err)
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'I am currently having trouble connecting to Gemini AI, but feel free to ask again!' }
      ].slice(-10))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-rise">
      {/* Collapsed Bubble Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-coral hover:bg-coral-hover text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold text-xs"
        >
          <span className="material-symbols-outlined text-2xl">smart_toy</span>
          <span className="hidden sm:inline-block">AI Travel Assistant</span>
        </button>
      )}

      {/* Expanded Chat Panel */}
      {isOpen && (
        <div className="bg-surface w-[340px] sm:w-[380px] h-[480px] rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary-container text-on-primary-container p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-display font-bold text-sm">
              <span className="material-symbols-outlined text-coral">smart_toy</span>
              <span>AI Travel Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-primary-container/80 hover:text-on-primary-container">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-container-lowest">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] text-xs ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-coral text-white rounded-br-none font-medium'
                      : 'bg-surface-container text-on-surface rounded-bl-none border border-outline-variant/20'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-base animate-spin text-primary">progress_activity</span>
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-surface border-t border-outline-variant/30 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your itinerary..."
              className="flex-1 px-3 py-2 text-xs bg-surface-container-lowest border border-outline-variant/60 rounded-xl focus:outline-none focus:border-primary text-on-surface"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 bg-coral hover:bg-coral-hover text-white rounded-xl shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
