import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  const features = [
    {
      icon: 'map',
      title: 'Multi-City Route Planner',
      description: 'Drag, reorder, and structure multi-destination itineraries effortlessly with automated distance calculations.'
    },
    {
      icon: 'auto_awesome',
      title: 'AI-Powered Itineraries',
      description: 'Generate complete personalized travel plans instantly with Gemini AI based on your travel personality and budget.'
    },
    {
      icon: 'account_balance_wallet',
      title: 'Real-Time Budget Engine',
      description: 'Track expenses per category, prevent budget overruns, and get AI-driven cost-saving suggestions.'
    },
    {
      icon: 'share',
      title: 'Seamless Sharing',
      description: 'Publish your journeys with one click, generate shareable links, and let fellow travelers clone your trips.'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined font-bold text-2xl">compass_calibration</span>
          </div>
          <div>
            <span className="font-display font-bold text-xl text-primary leading-none tracking-tight block">GlobeTrotter</span>
            <span className="text-[10px] text-on-surface-variant font-medium">Smart Travel Planner</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all flex items-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 font-semibold text-xs text-on-surface hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] transition-all"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section (Reusing Login.jsx full-bleed aesthetic) */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-20 px-6 overflow-hidden bg-on-background text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
            alt="GlobeTrotter travel hero background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/60 to-on-background/40" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 animate-rise text-white py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-on-primary-container">
            <span className="material-symbols-outlined text-base text-coral">sparkles</span>
            <span>Next-Gen AI Travel Companion</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight leading-tight drop-shadow-md">
            Plan Personalized Multi-City Journeys in Seconds
          </h1>

          <p className="font-sans text-base sm:text-lg text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Organize complex multi-stop itineraries, curate activities, manage live budgets, and leverage AI to build unforgettable travel adventures.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto bg-coral hover:bg-coral-hover text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-[0_10px_30px_rgba(251,113,133,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? 'Explore Your Trips' : 'Start Planning Free'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link
              to="/share/euro-summer-2026"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm rounded-xl transition-all"
            >
              View Sample Public Itinerary
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid Section */}
      <section className="py-20 px-6 max-w-[1280px] mx-auto space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-display font-bold text-3xl text-on-surface tracking-tight">
            Everything You Need for Seamless Exploration
          </h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Built for spontaneous travelers and meticulous planners alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs hover:shadow-[0_10px_30px_rgba(15,118,110,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">{f.icon}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-lg text-on-surface">{f.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-lowest px-6 py-8 text-center text-xs text-on-surface-variant">
        <div className="flex items-center justify-center gap-2 mb-2 font-display font-bold text-primary text-sm">
          <span className="material-symbols-outlined">compass_calibration</span>
          <span>GlobeTrotter</span>
        </div>
        <p>© 2026 GlobeTrotter Travel Planner. All rights reserved.</p>
      </footer>
    </div>
  )
}
