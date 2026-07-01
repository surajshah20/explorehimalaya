import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mountain, Calendar, Users, CheckCircle, Clock, XCircle,
  ArrowRight, Ban, Trophy, Map,
} from 'lucide-react'
import { useStore } from '@/store'
import { bookingApi } from '@/lib/api'
import type { Booking } from '@/types'
import { format, parseISO, differenceInDays } from 'date-fns'

const STATUS_CONFIG = {
  confirmed: {
    icon: CheckCircle,
    color: 'text-alpine-400',
    bg: 'bg-alpine-500/10 border-alpine-500/20',
    label: 'Confirmed',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    label: 'Pending',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    label: 'Cancelled',
  },
  completed: {
    icon: Trophy,
    color: 'text-summit-400',
    bg: 'bg-summit-500/10 border-summit-500/20',
    label: 'Completed',
  },
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
  const cfg = STATUS_CONFIG[booking.status]
  const StatusIcon = cfg.icon
  const daysUntil = differenceInDays(parseISO(booking.startDate), new Date())
  const canCancel = booking.status === 'confirmed' && daysUntil > 30

  return (
    <motion.div
      className="glass-card p-6 group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Trek image */}
        <div className="w-full sm:w-32 h-32 sm:h-auto rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={booking.trek.image}
            alt={booking.trek.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-xs text-white/30 font-mono">{booking.id}</span>
              <h3 className="font-display font-semibold text-lg text-white">{booking.trek.name}</h3>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Calendar className="w-4 h-4 text-summit-400" />
              {format(parseISO(booking.startDate), 'MMM d, yyyy')}
              {daysUntil > 0 && booking.status === 'confirmed' && (
                <span className="text-summit-400 text-xs">({daysUntil}d away)</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Users className="w-4 h-4 text-summit-400" />
              {booking.groupSize} {booking.groupSize === 1 ? 'person' : 'people'}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <Mountain className="w-4 h-4 text-summit-400" />
              {booking.trek.duration} days
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-white/30">Total paid</span>
              <div className="font-display font-bold text-xl text-white">
                ${booking.totalPrice.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canCancel && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400/70
                             border border-red-500/20 hover:border-red-500/40 hover:text-red-400
                             transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
              <Link
                to={`/treks/${booking.trek.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs
                           text-summit-400 border border-summit-500/25 hover:border-summit-500/50
                           hover:bg-summit-500/8 transition-all"
              >
                View Trek
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const TABS = [
  { key: 'all', label: 'All Bookings' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type TabKey = typeof TABS[number]['key']

export default function MyBookings() {
  const { bookings, cancelBooking } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sync with "API"
    bookingApi.getMyBookings().then(() => setLoading(false))
  }, [])

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    cancelBooking(id)
  }

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab)

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    totalSpent: bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  }

  return (
    <div className="min-h-screen bg-void-950 pt-16">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-void-900 to-void-950 border-b border-white/5 py-12 px-4">
        <div className="absolute inset-0 bg-ember-glow opacity-50" />
        <div className="relative max-w-5xl mx-auto">
          <span className="section-eyebrow block mb-2">Adventure History</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-6">
            My <span className="text-ember-gradient">Bookings</span>
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {[
              { label: 'Total treks', value: stats.total },
              { label: 'Confirmed', value: stats.confirmed },
              { label: 'Total spent', value: `$${stats.totalSpent.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 mb-8 w-fit">
          {TABS.map(({ key, label }) => {
            const count = key === 'all'
              ? bookings.length
              : bookings.filter((b) => b.status === key).length
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === key ? 'bg-summit-500/30 text-summit-300' : 'text-white/20'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        ) : (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Map className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="font-display font-semibold text-xl text-white mb-2">
              {activeTab === 'all' ? 'No bookings yet' : `No ${activeTab} bookings`}
            </h3>
            <p className="text-white/40 text-sm mb-8">Your Himalayan adventure awaits</p>
            <Link to="/treks" className="btn-summit inline-flex">
              <Mountain className="w-4 h-4" />
              Browse Treks
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
