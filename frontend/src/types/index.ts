export interface Trek {
  id: string
  slug: string
  name: string
  region: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme'
  duration: number        // days
  maxAltitude: number     // metres
  distance: number        // km
  price: number           // USD
  rating: number          // 0–5
  reviewCount: number
  image: string
  images: string[]
  highlights: string[]
  description: string
  aiSummary?: string
  startPoint: string
  endPoint: string
  bestSeason: string[]
  groupSize: { min: number; max: number }
  includes: string[]
  excludes: string[]
  itinerary: ItineraryDay[]
  availableDates: string[]  // ISO dates
  coordinates: { lat: number; lng: number }
  elevation: ElevationPoint[]
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  altitude: number
  distance: number
  accommodation: string
}

export interface ElevationPoint {
  day: number
  altitude: number
  location: string
}

export interface Booking {
  id: string
  trekId: string
  trek: Trek
  startDate: string
  groupSize: number
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  bookedAt: string
  paymentStatus: 'paid' | 'partial' | 'unpaid'
  guestName: string
  guestEmail: string
}

export interface FilterState {
  difficulty: string[]
  maxPrice: number
  minDuration: number
  maxDuration: number
  region: string[]
  search: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
