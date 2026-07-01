import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Trek, Booking, FilterState, ChatMessage } from '@/types'

interface TrekStore {
  // Treks
  treks: Trek[]
  selectedTrek: Trek | null
  setTreks: (treks: Trek[]) => void
  setSelectedTrek: (trek: Trek | null) => void

  // Filters
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void

  // Bookings
  bookings: Booking[]
  addBooking: (booking: Booking) => void
  cancelBooking: (id: string) => void

  // AI Chat
  chatMessages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  clearChat: () => void
  isChatOpen: boolean
  toggleChat: () => void

  // UI
  isLoading: boolean
  setLoading: (v: boolean) => void
}

const defaultFilters: FilterState = {
  difficulty: [],
  maxPrice: 5000,
  minDuration: 1,
  maxDuration: 30,
  region: [],
  search: '',
}

export const useStore = create<TrekStore>()(
  persist(
    (set) => ({
      treks: [],
      selectedTrek: null,
      setTreks: (treks) => set({ treks }),
      setSelectedTrek: (trek) => set({ selectedTrek: trek }),

      filters: defaultFilters,
      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () => set({ filters: defaultFilters }),

      bookings: [],
      addBooking: (booking) =>
        set((s) => {
          const updated = [...s.bookings, booking]
          localStorage.setItem('my_bookings', JSON.stringify(updated))
          return { bookings: updated }
        }),
      cancelBooking: (id) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as const } : b,
          ),
        })),

      chatMessages: [],
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChat: () => set({ chatMessages: [] }),
      isChatOpen: false,
      toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),

      isLoading: false,
      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'explorehimalaya-store',
      partialize: (s) => ({ bookings: s.bookings, chatMessages: s.chatMessages }),
    },
  ),
)
