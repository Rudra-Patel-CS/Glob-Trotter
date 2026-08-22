import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [activeTab, setActiveTab] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-outline-variant' }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-error' }
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-tertiary-container' }
    if (score >= 3) return { score: 3, label: 'Strong', color: 'bg-primary-container' }
    return { score: 0, label: '', color: 'bg-outline-variant' }
  }

  const pwdStrength = getPasswordStrength(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (activeTab === 'login') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.')
        }
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        if (!fullName || !email || !password) {
          throw new Error('Please fill in all required fields.')
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.')
        }
        if (!termsAccepted) {
          throw new Error('Please accept the Terms & Conditions.')
        }
        await signUp(email, password, fullName)
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-12 px-4 overflow-hidden bg-on-background">
      {/* Background Travel Photo with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
          alt="GlobeTrotter adventure landscape background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/90 via-on-background/60 to-on-background/40" />
      </div>

      {/* Centered Glassmorphism Card Container */}
      <main className="relative z-10 w-full max-w-md animate-rise">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-container text-on-primary mb-3 shadow-lg">
            <span className="material-symbols-outlined text-3xl font-bold">compass_calibration</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight drop-shadow-md">
            GlobeTrotter
          </h1>
          <p className="font-sans text-sm text-surface-container-low/90 mt-1 font-medium">
            Your personalized multi-city travel companion
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-surface/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Tab Switcher */}
          <div className="flex relative bg-surface-container rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg('') }}
              className={`w-1/2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg('') }}
              className={`w-1/2 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-xl flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-base text-error">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-primary-container/20 text-primary text-xs rounded-xl flex items-center gap-2 font-semibold border border-primary-container/30">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivers"
                    className="w-full px-4 py-2.5 pl-10 text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/70 text-lg">person</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@globetrotter.com"
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/70 text-lg">mail</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pl-10 pr-10 text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/70 text-lg">lock</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Password strength meter for signup */}
              {activeTab === 'signup' && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-on-surface-variant">
                    <span>Password Strength</span>
                    <span className="font-bold">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-outline-variant/30'}`} />
                    <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-outline-variant/30'}`} />
                    <div className={`h-full flex-1 transition-colors ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-outline-variant/30'}`} />
                  </div>
                </div>
              )}
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pl-10 text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/50"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/70 text-lg">lock_reset</span>
                </div>
              </div>
            )}

            {/* Login options */}
            {activeTab === 'login' ? (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                  />
                  <span className="text-xs text-on-surface-variant font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setSuccessMsg('Password reset instructions sent to your email!')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant mt-0.5"
                  />
                  <span className="text-xs text-on-surface-variant leading-tight">
                    I agree to GlobeTrotter's <a href="#" onClick={(e) => { e.preventDefault(); setSuccessMsg('Terms & Privacy Policy apply to your account.') }} className="text-primary underline font-semibold">Terms of Service</a> and Privacy Policy.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button (Warm Coral CTA strictly as per specs!) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-coral hover:bg-coral-hover text-white font-semibold text-sm py-3 rounded-lg shadow-sm hover:shadow-[0_10px_30px_rgba(251,113,133,0.35)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In to GlobeTrotter' : 'Create Free Account'}</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
