import axios from 'axios'
import { MOCK_TREKS } from './mockData'
import type { Trek, Booking, FilterState } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.explorehimalaya.com/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Intercept for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Mock helpers (replace with real API calls) ────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const trekApi = {
  async getAll(filters?: Partial<FilterState>): Promise<Trek[]> {
    await delay(600)
    // Simulate filtering
    let results = [...MOCK_TREKS]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(
        (t) => t.name.toLowerCase().includes(q) || t.region.toLowerCase().includes(q),
      )
    }
    if (filters?.difficulty?.length) {
      results = results.filter((t) => filters.difficulty!.includes(t.difficulty))
    }
    if (filters?.region?.length) {
      results = results.filter((t) => filters.region!.includes(t.region))
    }
    if (filters?.maxPrice) {
      results = results.filter((t) => t.price <= filters.maxPrice!)
    }
    return results
  },

  async getBySlug(slug: string): Promise<Trek> {
    await delay(400)
    const trek = MOCK_TREKS.find((t) => t.slug === slug)
    if (!trek) throw new Error('Trek not found')
    return trek
  },

  async getAiSummary(trekId: string): Promise<string> {
    await delay(1200)
    const trek = MOCK_TREKS.find((t) => t.id === trekId)
    return trek?.aiSummary || 'AI summary loading...'
  },
}

export const bookingApi = {
  async create(data: {
    trekId: string
    startDate: string
    groupSize: number
    guestName: string
    guestEmail: string
  }): Promise<Booking> {
    await delay(800)
    const trek = MOCK_TREKS.find((t) => t.id === data.trekId)!
    return {
      id: `BK-${Date.now()}`,
      trekId: data.trekId,
      trek,
      startDate: data.startDate,
      groupSize: data.groupSize,
      totalPrice: trek.price * data.groupSize,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      paymentStatus: 'unpaid',
      guestName: data.guestName,
      guestEmail: data.guestEmail,
    }
  },

  async getMyBookings(): Promise<Booking[]> {
    await delay(500)
    // Return mock bookings stored in localStorage
    const stored = localStorage.getItem('my_bookings')
    return stored ? JSON.parse(stored) : []
  },

  async cancel(bookingId: string): Promise<void> {
    await delay(400)
    const stored = localStorage.getItem('my_bookings')
    if (stored) {
      const bookings: Booking[] = JSON.parse(stored)
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b,
      )
      localStorage.setItem('my_bookings', JSON.stringify(updated))
    }
  },
}

export const aiApi = {
  async chat(message: string, context?: string): Promise<string> {
    await delay(1000 + Math.random() * 500)
    // Mock AI responses
    const responses: Record<string, string> = {
      default: 'I\'m your ExploreHimalaya AI guide! I can help you choose the perfect trek based on your fitness level, interests, and timeline. What kind of adventure are you looking for?',
      everest: 'The Everest Base Camp trek is our most iconic route. At 5,364m, it\'s challenging but achievable for fit hikers with proper acclimatization. Best months are October–November and March–May.',
      easy: 'For beginners, I\'d recommend the Langtang Valley trek (10 days, 4,984m max) or the Ghorepani Poon Hill circuit (5 days, 3,210m). Both offer stunning views without extreme altitude.',
      budget: 'The Langtang Valley trek offers the best value — starting at $890 all-inclusive. Annapurna Circuit at $1,650 is also excellent value given its 18-day length.',
    }

    const lower = message.toLowerCase()
    if (lower.includes('everest') || lower.includes('ebc')) return responses.everest
    if (lower.includes('easy') || lower.includes('beginner') || lower.includes('first')) return responses.easy
    if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) return responses.budget
    return responses.default
  },
}

export default api
