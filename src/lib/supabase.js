import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initial Seed Data for fallback local storage mode
export const SEED_CITIES = [
  { id: 'c1', name: 'Paris', country: 'France', cost_index: 3, popularity: 98, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 48.8566, lng: 2.3522 },
  { id: 'c2', name: 'Tokyo', country: 'Japan', cost_index: 3, popularity: 96, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', region: 'Asia', lat: 35.6762, lng: 139.6503 },
  { id: 'c3', name: 'Rome', country: 'Italy', cost_index: 2, popularity: 94, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 41.9028, lng: 12.4964 },
  { id: 'c4', name: 'Barcelona', country: 'Spain', cost_index: 2, popularity: 92, image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 41.3851, lng: 2.1734 },
  { id: 'c5', name: 'Kyoto', country: 'Japan', cost_index: 2, popularity: 90, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80', region: 'Asia', lat: 35.0116, lng: 135.7681 },
  { id: 'c6', name: 'New York', country: 'United States', cost_index: 3, popularity: 97, image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', region: 'Americas', lat: 40.7128, lng: -74.0060 },
  { id: 'c7', name: 'Bali', country: 'Indonesia', cost_index: 1, popularity: 89, image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', region: 'Asia', lat: -8.4095, lng: 115.1889 },
  { id: 'c8', name: 'London', country: 'United Kingdom', cost_index: 3, popularity: 95, image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 51.5074, lng: -0.1278 },
  { id: 'c9', name: 'Sydney', country: 'Australia', cost_index: 3, popularity: 88, image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', region: 'Oceania', lat: -33.8688, lng: 151.2093 },
  { id: 'c10', name: 'Cairo', country: 'Egypt', cost_index: 1, popularity: 86, image_url: 'https://images.unsplash.com/photo-1572252821143-035a0049f7e5?auto=format&fit=crop&w=800&q=80', region: 'Africa', lat: 30.0444, lng: 31.2357 },
  { id: 'c11', name: 'Dubrovnik', country: 'Croatia', cost_index: 2, popularity: 87, image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 42.6507, lng: 18.0944 },
  { id: 'c12', name: 'Cape Town', country: 'South Africa', cost_index: 2, popularity: 85, image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80', region: 'Africa', lat: -33.9249, lng: 18.4241 },
  { id: 'c13', name: 'Rio de Janeiro', country: 'Brazil', cost_index: 2, popularity: 84, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', region: 'Americas', lat: -22.9068, lng: -43.1729 },
  { id: 'c14', name: 'Istanbul', country: 'Turkey', cost_index: 1, popularity: 91, image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 41.0082, lng: 28.9784 },
  { id: 'c15', name: 'Reykjavik', country: 'Iceland', cost_index: 3, popularity: 83, image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', region: 'Europe', lat: 64.1466, lng: -21.9426 }
]

export const SEED_ACTIVITIES = [
  { id: 'a1', city_id: 'c1', name: 'Eiffel Tower Summit Access', category: 'activity', cost: 35, duration_minutes: 120, description: 'Panoramic views of Paris from the iconic iron summit.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80' },
  { id: 'a2', city_id: 'c1', name: 'Louvre Guided Masterpieces Tour', category: 'activity', cost: 65, duration_minutes: 180, description: 'Skip-the-line entry to Mona Lisa & Venus de Milo.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },
  { id: 'a3', city_id: 'c1', name: 'Seine River Evening Sunset Cruise', category: 'transport', cost: 25, duration_minutes: 90, description: 'Glide past illuminated monuments with champagne.', image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80' },
  { id: 'a4', city_id: 'c2', name: 'Tsukiji Outer Market Food Tasting', category: 'meal', cost: 45, duration_minutes: 150, description: 'Fresh sushi, wagyu beef skewers & matcha sweets.', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
  { id: 'a5', city_id: 'c2', name: 'Senso-ji Temple & Asakusa Stroll', category: 'activity', cost: 0, duration_minutes: 90, description: 'Tokyo’s oldest Buddhist temple and traditional Nakamise street.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80' },
  { id: 'a6', city_id: 'c3', name: 'Colosseum & Roman Forum Tour', category: 'activity', cost: 50, duration_minutes: 210, description: 'Walk through gladiatorial history with an expert historian.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
  { id: 'a7', city_id: 'c3', name: 'Trastevere Gourmet Food Crawl', category: 'meal', cost: 75, duration_minutes: 180, description: 'Authentic carbonara, fried artichokes & gelato in historic alleyways.', image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b31f8?auto=format&fit=crop&w=600&q=80' },
  { id: 'a8', city_id: 'c4', name: 'Sagrada Familia Fast-Track Access', category: 'activity', cost: 40, duration_minutes: 120, description: 'Explore Gaudi’s masterpiece cathedral with audio guide.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80' },
  { id: 'a9', city_id: 'c4', name: 'Gothic Quarter Tapas & Wine Tour', category: 'meal', cost: 55, duration_minutes: 150, description: 'Sample Iberian ham and regional wines in medieval taverns.', image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=600&q=80' },
  { id: 'a10', city_id: 'c5', name: 'Fushimi Inari Taisha Thousand Gates Hike', category: 'activity', cost: 0, duration_minutes: 120, description: 'Walk through iconic vermilion torii gates up Mount Inari.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80' },
  { id: 'a11', city_id: 'c6', name: 'Central Park Bicycle Exploration', category: 'transport', cost: 20, duration_minutes: 120, description: 'Rent a bicycle to tour Bethesda Terrace and Strawberry Fields.', image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80' },
  { id: 'a12', city_id: 'c7', name: 'Ubud Rice Terrace & Waterfall Trek', category: 'activity', cost: 30, duration_minutes: 240, description: 'Tegalalang rice fields hike followed by Tegenungan waterfall dip.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
  { id: 'a13', city_id: 'c8', name: 'Tower of London & Crown Jewels', category: 'activity', cost: 38, duration_minutes: 150, description: 'Historic fortress, Beefeater tour, and royal treasure vault.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
  { id: 'a14', city_id: 'c9', name: 'Sydney Harbour Kayak Expedition', category: 'transport', cost: 60, duration_minutes: 120, description: 'Paddle right past the Sydney Opera House and Harbour Bridge.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80' },
  { id: 'a15', city_id: 'c10', name: 'Giza Pyramids & Sphinx Sunset Quad Tour', category: 'activity', cost: 50, duration_minutes: 180, description: 'Ride across desert dunes as the sun sets over ancient pyramids.', image_url: 'https://images.unsplash.com/photo-1572252821143-035a0049f7e5?auto=format&fit=crop&w=600&q=80' }
]

export const SEED_TRIPS = [
  {
    id: 't1',
    user_id: 'u1',
    name: 'Grand European Summer',
    start_date: '2026-09-01',
    end_date: '2026-09-14',
    description: 'Explore the arts of Paris, history of Rome, and vibrant streets of Barcelona.',
    cover_photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    currency: 'USD',
    is_public: true,
    created_at: new Date().toISOString()
  },
  {
    id: 't2',
    user_id: 'u1',
    name: 'Japan Cultural Odyssey',
    start_date: '2026-10-10',
    end_date: '2026-10-22',
    description: 'From neon-lit Tokyo skyscrapers to tranquil Kyoto shrines.',
    cover_photo_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    currency: 'USD',
    is_public: false,
    created_at: new Date().toISOString()
  }
]

export const SEED_STOPS = [
  { id: 's1', trip_id: 't1', city_id: 'c1', start_date: '2026-09-01', end_date: '2026-09-05', order_index: 0 },
  { id: 's2', trip_id: 't1', city_id: 'c3', start_date: '2026-09-06', end_date: '2026-09-10', order_index: 1 },
  { id: 's3', trip_id: 't1', city_id: 'c4', start_date: '2026-09-11', end_date: '2026-09-14', order_index: 2 },
  { id: 's4', trip_id: 't2', city_id: 'c2', start_date: '2026-10-10', end_date: '2026-10-15', order_index: 0 },
  { id: 's5', trip_id: 't2', city_id: 'c5', start_date: '2026-10-16', end_date: '2026-10-22', order_index: 1 }
]

export const SEED_STOP_ACTIVITIES = [
  { id: 'sa1', stop_id: 's1', activity_id: 'a1', scheduled_date: '2026-09-02', scheduled_time: '10:00', cost_override: 35 },
  { id: 'sa2', stop_id: 's1', activity_id: 'a2', scheduled_date: '2026-09-03', scheduled_time: '14:00', cost_override: 65 },
  { id: 'sa3', stop_id: 's1', activity_id: 'a3', scheduled_date: '2026-09-04', scheduled_time: '19:30', cost_override: 25 },
  { id: 'sa4', stop_id: 's2', activity_id: 'a6', scheduled_date: '2026-09-07', scheduled_time: '09:00', cost_override: 50 },
  { id: 'sa5', stop_id: 's2', activity_id: 'a7', scheduled_date: '2026-09-08', scheduled_time: '18:00', cost_override: 75 },
  { id: 'sa6', stop_id: 's3', activity_id: 'a8', scheduled_date: '2026-09-12', scheduled_time: '11:00', cost_override: 40 },
  { id: 'sa7', stop_id: 's4', activity_id: 'a4', scheduled_date: '2026-10-11', scheduled_time: '08:30', cost_override: 45 }
]

export const SEED_EXPENSES = [
  { id: 'e1', trip_id: 't1', category: 'stay', amount: 850, note: 'Paris Boutique Hotel (4 nights)' },
  { id: 'e2', trip_id: 't1', category: 'transport', amount: 320, note: 'Flight & TGV train pass' },
  { id: 'e3', trip_id: 't1', category: 'activity', amount: 175, note: 'Eiffel, Louvre & Seine River tickets' },
  { id: 'e4', trip_id: 't1', category: 'meal', amount: 480, note: 'Dining, cafes & wine tastings' },
  { id: 'e5', trip_id: 't1', category: 'other', amount: 95, note: 'Museum passes & souvenirs' },
  { id: 'e6', trip_id: 't2', category: 'stay', amount: 920, note: 'Tokyo Shinjuku Hotel & Kyoto Ryokan' },
  { id: 'e7', trip_id: 't2', category: 'transport', amount: 410, note: 'JR Rail Pass (7 Days)' },
  { id: 'e8', trip_id: 't2', category: 'meal', amount: 350, note: 'Ramen, Tsukiji tasting & tea ceremony' }
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

// Create real client or fallback mock
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new LocalStorageSupabase()
