import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initial Seed Data for fallback local storage mode
export const SEED_CITIES = [
  { id: 'c1', name: 'Paris', country: 'France', cost_index: 3, popularity: 98, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', region: 'Europe', description: 'The City of Light with iconic art & architecture.' },
  { id: 'c2', name: 'Tokyo', country: 'Japan', cost_index: 3, popularity: 96, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', region: 'Asia', description: 'Neon skyscrapers, tranquil shrines, and world-class dining.' },
  { id: 'c3', name: 'Rome', country: 'Italy', cost_index: 2, popularity: 94, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', region: 'Europe', description: 'Ancient gladiatorial arenas, fountains, and trattorias.' },
  { id: 'c4', name: 'Barcelona', country: 'Spain', cost_index: 2, popularity: 92, image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80', region: 'Europe', description: 'Gothic quarters, Mediterranean beaches, and Gaudi architecture.' },
  { id: 'c5', name: 'Kyoto', country: 'Japan', cost_index: 2, popularity: 90, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', region: 'Asia', description: 'Traditional wooden houses, gardens, and imperial palaces.' },
  { id: 'c6', name: 'New York', country: 'United States', cost_index: 3, popularity: 97, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', region: 'Americas', description: 'Iconic skyline, Broadway shows, and Central Park.' }
]

export const SEED_ACTIVITIES = [
  { id: 'a1', city_id: 'c1', name: 'Eiffel Tower Summit Access', activity_type: 'activity', category: 'activity', estimated_cost: 35, cost: 35, duration_minutes: 120, description: 'Panoramic views of Paris from the iconic iron summit.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
  { id: 'a2', city_id: 'c1', name: 'Louvre Guided Masterpieces Tour', activity_type: 'activity', category: 'activity', estimated_cost: 65, cost: 65, duration_minutes: 180, description: 'Skip-the-line entry to Mona Lisa & Venus de Milo.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'a3', city_id: 'c1', name: 'Seine River Evening Sunset Cruise', activity_type: 'transport', category: 'transport', estimated_cost: 25, cost: 25, duration_minutes: 90, description: 'Glide past illuminated monuments with champagne.', image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80' },
  { id: 'a4', city_id: 'c2', name: 'Tsukiji Outer Market Food Tasting', activity_type: 'meal', category: 'meal', estimated_cost: 45, cost: 45, duration_minutes: 150, description: 'Fresh sushi, wagyu beef skewers & matcha sweets.', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
  { id: 'a5', city_id: 'c2', name: 'Senso-ji Temple & Asakusa Stroll', activity_type: 'activity', category: 'activity', estimated_cost: 0, cost: 0, duration_minutes: 90, description: 'Tokyo’s oldest Buddhist temple and traditional Nakamise street.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80' },
  { id: 'a6', city_id: 'c3', name: 'Colosseum & Roman Forum Tour', activity_type: 'activity', category: 'activity', estimated_cost: 50, cost: 50, duration_minutes: 210, description: 'Walk through gladiatorial history with an expert historian.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
  { id: 'a7', city_id: 'c3', name: 'Trastevere Gourmet Food Crawl', activity_type: 'meal', category: 'meal', estimated_cost: 75, cost: 75, duration_minutes: 180, description: 'Authentic carbonara, fried artichokes & gelato in historic alleyways.', image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b31f8?auto=format&fit=crop&w=600&q=80' },
  { id: 'a8', city_id: 'c4', name: 'Sagrada Familia Fast-Track Access', activity_type: 'activity', category: 'activity', estimated_cost: 40, cost: 40, duration_minutes: 120, description: 'Explore Gaudi’s masterpiece cathedral with audio guide.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80' },
  { id: 'a9', city_id: 'c4', name: 'Gothic Quarter Tapas & Wine Tour', activity_type: 'meal', category: 'meal', estimated_cost: 55, cost: 55, duration_minutes: 150, description: 'Sample Iberian ham and regional wines in medieval taverns.', image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=600&q=80' }
]

export const SEED_TRIPS = [
  {
    id: 't1',
    user_id: 'u1',
    name: 'Grand European Summer',
    start_date: '2026-09-01',
    end_date: '2026-09-14',
    description: 'Explore the arts of Paris, history of Rome, and vibrant streets of Barcelona.',
    cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    cover_photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    currency: 'USD',
    is_public: true,
    share_code: 'euro-summer-2026',
    created_at: new Date().toISOString()
  }
]

export const SEED_STOPS = [
  { id: 's1', trip_id: 't1', city_id: 'c1', arrival_date: '2026-09-01', departure_date: '2026-09-05', start_date: '2026-09-01', end_date: '2026-09-05', stop_order: 0, order_index: 0 },
  { id: 's2', trip_id: 't1', city_id: 'c3', arrival_date: '2026-09-06', departure_date: '2026-09-10', start_date: '2026-09-06', end_date: '2026-09-10', stop_order: 1, order_index: 1 },
  { id: 's3', trip_id: 't1', city_id: 'c4', arrival_date: '2026-09-11', departure_date: '2026-09-14', start_date: '2026-09-11', end_date: '2026-09-14', stop_order: 2, order_index: 2 }
]

export const SEED_STOP_ACTIVITIES = [
  { id: 'sa1', trip_stop_id: 's1', stop_id: 's1', activity_id: 'a1', activity_date: '2026-09-02', scheduled_date: '2026-09-02', start_time: '10:00', scheduled_time: '10:00', cost_override: 35 },
  { id: 'sa2', trip_stop_id: 's1', stop_id: 's1', activity_id: 'a2', activity_date: '2026-09-03', scheduled_date: '2026-09-03', start_time: '14:00', scheduled_time: '14:00', cost_override: 65 },
  { id: 'sa3', trip_stop_id: 's1', stop_id: 's1', activity_id: 'a3', activity_date: '2026-09-04', scheduled_date: '2026-09-04', start_time: '19:30', scheduled_time: '19:30', cost_override: 25 },
  { id: 'sa4', trip_stop_id: 's2', stop_id: 's2', activity_id: 'a6', activity_date: '2026-09-07', scheduled_date: '2026-09-07', start_time: '09:00', scheduled_time: '09:00', cost_override: 50 }
]

export const SEED_EXPENSES = [
  { id: 'e1', trip_id: 't1', category: 'stay', amount: 850, description: 'Paris Boutique Hotel (4 nights)', note: 'Paris Boutique Hotel (4 nights)' },
  { id: 'e2', trip_id: 't1', category: 'transport', amount: 320, description: 'Flight & TGV train pass', note: 'Flight & TGV train pass' },
  { id: 'e3', trip_id: 't1', category: 'activity', amount: 175, description: 'Eiffel, Louvre & Seine River tickets', note: 'Eiffel, Louvre & Seine River tickets' },
  { id: 'e4', trip_id: 't1', category: 'meal', amount: 480, description: 'Dining, cafes & wine tastings', note: 'Dining, cafes & wine tastings' }
]

export const SEED_SHARED_TRIPS = [
  { id: 'st1', trip_id: 't1', share_token: 'euro-summer-2026', created_at: new Date().toISOString() }
]

export const SEED_SAVED_DESTINATIONS = [
  { id: 'sd1', user_id: 'u1', city_id: 'c2' },
  { id: 'sd2', user_id: 'u1', city_id: 'c4' }
]

// Fallback Mock Local Storage Client
class LocalStorageSupabase {
  constructor() {
    this.initStorage()
  }

  initStorage() {
    if (!localStorage.getItem('gt_profile')) {
      localStorage.setItem('gt_profile', JSON.stringify({
        id: 'u1',
        full_name: 'Alex Rivers',
        email: 'alex@globetrotter.com',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        language: 'en'
      }))
    }
    if (!localStorage.getItem('gt_trips')) localStorage.setItem('gt_trips', JSON.stringify(SEED_TRIPS))
    if (!localStorage.getItem('gt_cities')) localStorage.setItem('gt_cities', JSON.stringify(SEED_CITIES))
    if (!localStorage.getItem('gt_stops')) localStorage.setItem('gt_stops', JSON.stringify(SEED_STOPS))
    if (!localStorage.getItem('gt_activities')) localStorage.setItem('gt_activities', JSON.stringify(SEED_ACTIVITIES))
    if (!localStorage.getItem('gt_stop_activities')) localStorage.setItem('gt_stop_activities', JSON.stringify(SEED_STOP_ACTIVITIES))
    if (!localStorage.getItem('gt_expenses')) localStorage.setItem('gt_expenses', JSON.stringify(SEED_EXPENSES))
    if (!localStorage.getItem('gt_shared_trips')) localStorage.setItem('gt_shared_trips', JSON.stringify(SEED_SHARED_TRIPS))
    if (!localStorage.getItem('gt_saved_destinations')) localStorage.setItem('gt_saved_destinations', JSON.stringify(SEED_SAVED_DESTINATIONS))
    if (!localStorage.getItem('gt_session')) {
      localStorage.setItem('gt_session', JSON.stringify({
        user: { id: 'u1', email: 'alex@globetrotter.com', user_metadata: { full_name: 'Alex Rivers' } }
      }))
    }
  }

  get auth() {
    return {
      getUser: async () => {
        const sess = JSON.parse(localStorage.getItem('gt_session') || 'null')
        return { data: { user: sess?.user || null }, error: null }
      },
      getSession: async () => {
        const sess = JSON.parse(localStorage.getItem('gt_session') || 'null')
        return { data: { session: sess }, error: null }
      },
      signInWithPassword: async ({ email, password }) => {
        const profile = JSON.parse(localStorage.getItem('gt_profile') || '{}')
        const user = { id: profile.id || 'u1', email, user_metadata: { full_name: profile.full_name || 'Alex Rivers' } }
        localStorage.setItem('gt_session', JSON.stringify({ user }))
        return { data: { user, session: { user } }, error: null }
      },
      signUp: async ({ email, password, options }) => {
        const user = { id: 'u_' + Date.now(), email, user_metadata: options?.data || {} }
        const profile = { id: user.id, full_name: options?.data?.full_name || 'Traveler', email, avatar_url: '', language: 'en' }
        localStorage.setItem('gt_profile', JSON.stringify(profile))
        localStorage.setItem('gt_session', JSON.stringify({ user }))
        return { data: { user, session: { user } }, error: null }
      },
      signOut: async () => {
        localStorage.removeItem('gt_session')
        return { error: null }
      },
      onAuthStateChange: (callback) => {
        const sess = JSON.parse(localStorage.getItem('gt_session') || 'null')
        callback(sess ? 'SIGNED_IN' : 'SIGNED_OUT', sess)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    }
  }

  from(table) {
    const getData = () => JSON.parse(localStorage.getItem(`gt_${table}`) || '[]')
    const setData = (data) => localStorage.setItem(`gt_${table}`, JSON.stringify(data))

    let result = getData()

    const builder = {
      select: (fields) => builder,
      eq: (col, val) => {
        result = result.filter(item => item[col] === val)
        return builder
      },
      or: (condition) => builder,
      order: (col, { ascending = true } = {}) => {
        result.sort((a, b) => ascending ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1))
        return builder
      },
      single: async () => {
        return { data: result[0] || null, error: result.length ? null : { message: 'Not found' } }
      },
      then: (resolve) => {
        resolve({ data: result, error: null })
      },
      insert: async (records) => {
        const current = getData()
        const newRecords = (Array.isArray(records) ? records : [records]).map(r => ({
          id: r.id || 'id_' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...r
        }))
        const updated = [...current, ...newRecords]
        setData(updated)
        return { data: newRecords, error: null }
      },
      update: (updates) => ({
        eq: async (col, val) => {
          let current = getData()
          current = current.map(item => item[col] === val ? { ...item, ...updates } : item)
          setData(current)
          return { data: updates, error: null }
        }
      }),
      delete: () => ({
        eq: async (col, val) => {
          let current = getData()
          current = current.filter(item => item[col] !== val)
          setData(current)
          return { error: null }
        }
      })
    }

    return builder
  }

  get storage() {
    return {
      from: (bucket) => ({
        upload: async (path, file) => {
          const fakeUrl = URL.createObjectURL(file)
          return { data: { path, publicUrl: fakeUrl }, error: null }
        },
        getPublicUrl: (path) => ({
          data: { publicUrl: path.startsWith('http') || path.startsWith('blob:') ? path : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80' }
        })
      })
    }
  }
}

// Unified Data Helpers to guarantee created trips & stops never disappear across page changes
export async function fetchAllTrips() {
  let dbTrips = []
  try {
    const { data } = await supabase.from('trips').select('*').order('start_date', { ascending: true })
    if (data && data.length) dbTrips = data
  } catch (e) {
    console.warn('Note reading DB trips:', e)
  }

  const customTrips = JSON.parse(localStorage.getItem('gt_custom_trips') || '[]')
  const map = new Map()

  customTrips.forEach(t => map.set(t.id, t))
  dbTrips.forEach(t => { if (!map.has(t.id)) map.set(t.id, t) })
  SEED_TRIPS.forEach(t => { if (!map.has(t.id)) map.set(t.id, t) })

  return Array.from(map.values())
}

export async function fetchAllStops(tripId) {
  let dbStops = []
  try {
    const { data: tsData } = await supabase.from('trip_stops').select('*')
    if (tsData && tsData.length) {
      dbStops = tsData
    } else {
      const { data: sData } = await supabase.from('stops').select('*')
      if (sData && sData.length) dbStops = sData
    }
  } catch (e) {
    console.warn('Note reading DB stops:', e)
  }

  const customStops = JSON.parse(localStorage.getItem('gt_custom_stops') || '[]')
  const map = new Map()

  customStops.forEach(s => map.set(s.id, s))
  dbStops.forEach(s => { if (!map.has(s.id)) map.set(s.id, s) })
  SEED_STOPS.forEach(s => { if (!map.has(s.id)) map.set(s.id, s) })

  let result = Array.from(map.values()).map(s => ({
    ...s,
    start_date: s.start_date || s.arrival_date || '2026-09-01',
    end_date: s.end_date || s.departure_date || '2026-09-05',
    order_index: s.order_index ?? s.stop_order ?? 0
  }))

  if (tripId) {
    result = result.filter(s => s.trip_id === tripId)
  }

  return result
}

// Create real client or fallback mock
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new LocalStorageSupabase()
