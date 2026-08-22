import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase, SEED_CITIES } from '../lib/supabase'

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth()

  const [activeTab, setActiveTab] = useState('saved') // 'saved' | 'account' | 'preferences'
  const [fullName, setFullName] = useState(profile?.full_name || 'Alex Rivers')
  const [language, setLanguage] = useState(profile?.language || 'en')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')

  // Saved Destinations
  const [savedCities, setSavedCities] = useState([])

  // Account tab state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Preferences state
  const [currency, setCurrency] = useState('USD')
  const [emailSummaries, setEmailSummaries] = useState(true)
  const [tripReminders, setTripReminders] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)

  useEffect(() => {
    async function loadSaved() {
      const { data } = await supabase.from('saved_destinations').select('*')
      if (data && data.length) {
        const cityIds = data.map(d => d.city_id)
        setSavedCities(SEED_CITIES.filter(c => cityIds.includes(c.id)))
      } else {
        setSavedCities([SEED_CITIES[1], SEED_CITIES[3]])
      }
    }
    loadSaved()
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      updateProfile({ avatar_url: url })
      toast.success('Avatar updated!')
    }
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateProfile({ full_name: fullName, language })
    toast.success('Profile updated successfully!')
  }

  const handleRemoveSavedCity = async (cityId) => {
    setSavedCities(savedCities.filter(c => c.id !== cityId))
    await supabase.from('saved_destinations').delete().eq('city_id', cityId)
    toast.success('Destination removed')
  }

  const handleDeleteAccount = async () => {
    await signOut()
    toast.success('Account deleted successfully.')
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-fade">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">Account & Profile</h1>
        <p className="font-sans text-sm text-on-surface-variant mt-1">
          Manage your personal details, saved destinations & preferences
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-md">
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-coral text-white rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="font-display font-bold text-2xl text-on-surface">{fullName}</h2>
          <p className="text-xs text-on-surface-variant font-medium">{profile?.email || user?.email || 'alex@globetrotter.com'}</p>
          <span className="inline-block mt-2 text-[11px] font-bold text-primary bg-primary-container/20 px-3 py-0.5 rounded-full">
            GlobeTrotter Explorer
          </span>
        </div>

        <button
          onClick={signOut}
          className="px-4 py-2 bg-surface hover:bg-surface-container border border-outline-variant/40 rounded-xl text-xs font-semibold text-error flex items-center gap-1.5 transition-colors self-center sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
        <div className="flex bg-surface-container rounded-xl p-1 max-w-md">
          {['saved', 'account', 'preferences'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant'
              }`}
            >
              {tab === 'saved' ? 'Saved Places' : tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Saved Destinations */}
        {activeTab === 'saved' && (
          <div className="space-y-4 animate-fade">
            <h3 className="font-display font-bold text-lg text-on-surface">Saved Destinations ({savedCities.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedCities.map(city => (
                <div key={city.id} className="p-3 bg-surface rounded-xl border border-outline-variant/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={city.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-xs text-on-surface">{city.name}</div>
                      <div className="text-[10px] text-on-surface-variant">{city.country}</div>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveSavedCity(city.id)} className="p-1.5 text-coral hover:bg-coral/10 rounded-full">
                    <span className="material-symbols-outlined text-lg is-filled">favorite</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Account Settings */}
        {activeTab === 'account' && (
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-md animate-fade">
            <h3 className="font-display font-bold text-lg text-on-surface">Account Settings</h3>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 space-y-3">
              <h4 className="text-xs font-bold text-on-surface">Change Password</h4>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-coral hover:bg-coral-hover text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-xs font-semibold text-error hover:underline ml-auto"
              >
                Delete Account
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 max-w-md animate-fade">
            <h3 className="font-display font-bold text-lg text-on-surface">Travel Preferences</h3>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Default Display Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-surface border border-outline-variant/60 rounded-lg text-on-surface"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-on-surface">Notification Settings</h4>
              <label className="flex items-center justify-between cursor-pointer p-2 bg-surface rounded-lg">
                <span className="text-xs font-semibold text-on-surface">Email Summaries</span>
                <input type="checkbox" checked={emailSummaries} onChange={(e) => setEmailSummaries(e.target.checked)} className="w-4 h-4 text-primary" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 bg-surface rounded-lg">
                <span className="text-xs font-semibold text-on-surface">Trip Reminders</span>
                <input type="checkbox" checked={tripReminders} onChange={(e) => setTripReminders(e.target.checked)} className="w-4 h-4 text-primary" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-2 bg-surface rounded-lg">
                <span className="text-xs font-semibold text-on-surface">Budget Overrun Alerts</span>
                <input type="checkbox" checked={budgetAlerts} onChange={(e) => setBudgetAlerts(e.target.checked)} className="w-4 h-4 text-primary" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/60 backdrop-blur-xs animate-fade">
          <div className="bg-surface p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 border border-outline-variant/30 animate-rise">
            <h3 className="font-display font-bold text-lg text-error">Confirm Delete Account</h3>
            <p className="text-xs text-on-surface-variant">
              Are you sure you want to delete your GlobeTrotter account? All your trip itineraries, activities, and budget records will be permanently removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="px-4 py-2 bg-error text-white font-bold text-xs rounded-lg hover:bg-red-800">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
