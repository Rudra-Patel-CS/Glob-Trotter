import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
import TravelAssistant from './components/TravelAssistant'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyTrips from './pages/MyTrips'
import NewTripWizard from './pages/NewTripWizard'
import AiTripGenerator from './pages/AiTripGenerator'
import ItineraryBuilder from './pages/ItineraryBuilder'
import ItineraryView from './pages/ItineraryView'
import Discover from './pages/Discover'
import TripBudget from './pages/TripBudget'
import TripCalendar from './pages/TripCalendar'
import PublicShare from './pages/PublicShare'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

// Guard for protected routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <span className="text-xs font-semibold text-on-surface-variant">Loading GlobeTrotter...</span>
        </div>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Layout wrapper
function AppLayout() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isLandingPage = location.pathname === '/'
  const isPublicShare = location.pathname.startsWith('/share/')

  if (isLandingPage) {
    return <Landing />
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar />
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      {/* Fixed Left Sidebar on Desktop */}
      {!isPublicShare && <Sidebar />}

      {/* Top Header Bar */}
      <TopBar />

      {/* Main Content Viewport */}
      <main className={`flex-1 ${isPublicShare ? 'w-full' : 'md:ml-[260px]'} pt-20 pb-24 md:pb-8 px-4 sm:px-6 min-h-screen overflow-x-hidden`}>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/trips/new" element={<ProtectedRoute><NewTripWizard /></ProtectedRoute>} />
          <Route path="/trips/ai-generate" element={<ProtectedRoute><AiTripGenerator /></ProtectedRoute>} />
          <Route path="/trips/:id/builder" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
          <Route path="/trips/:id" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/trips/:id/budget" element={<ProtectedRoute><TripBudget /></ProtectedRoute>} />
          <Route path="/trips/:id/calendar" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
          <Route path="/share/:token" element={<PublicShare />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Floating AI Travel Assistant (renders on trip pages) */}
      <TravelAssistant />

      {/* Fixed Bottom Tab Bar on Mobile */}
      {!isPublicShare && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#151c27', color: '#fff', borderRadius: '12px', fontSize: '13px' } }} />
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  )
}
