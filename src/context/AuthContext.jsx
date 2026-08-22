import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          await fetchProfile(user.id)
        } else {
          // Default fallback user for instant demo experience if needed
          const defaultProfile = JSON.parse(localStorage.getItem('gt_profile') || 'null')
          if (defaultProfile) {
            setUser({ id: defaultProfile.id, email: defaultProfile.email, user_metadata: { full_name: defaultProfile.full_name } })
            setProfile(defaultProfile)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) {
        setProfile(data)
      } else {
        // Fallback or create default profile
        const newProfile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || 'Traveler',
          email: user?.email || 'user@globetrotter.com',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          language: 'en'
        }
        setProfile(newProfile)
      }
    } catch (err) {
      console.warn('Fetch profile error:', err)
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setUser(data.user)
    await fetchProfile(data.user.id)
    return data
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
    if (data.user) {
      setUser(data.user)
      const newProf = {
        id: data.user.id,
        full_name: fullName,
        email,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        language: 'en'
      }
      setProfile(newProf)
      await supabase.from('profiles').insert([newProf])
    }
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(updates) {
    if (!user) return
    const updated = { ...profile, ...updates }
    setProfile(updated)
    localStorage.setItem('gt_profile', JSON.stringify(updated))
    await supabase.from('profiles').update(updates).eq('id', user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
