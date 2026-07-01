import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mountain, Clock, Star, Users, ArrowLeft, CheckCircle, XCircle,
  Zap, Calendar, MapPin, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react'
import ElevationViewer from '@/components/3d/ElevationViewer'
import { trekApi, bookingApi } from '@/lib/api'
import { useStore } from '@/store'
import type { Trek } from '@/types'
import { format, parseISO } from 'date-fns'

const DIFF_COLORS: Record<string, string> = {
  Easy: 'text-alpine-400',
  Moderate: 'text-summit-400',
  Challenging: 'text-ember-400',
  Extreme: 'text-red-400',
}

// Booking Panel
function BookingPanel({ trek }: { trek: Trek }) {
  const navigate = useNavigate()
  const { addBooking } = useStore()
  const [selectedDate, setSelectedDate] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const total = trek.price * groupSize

  async function handleBook() {
    if (!selectedDate || !name || !email) return
    setLoading(true)
    try {
      const booking = await bookingApi.create({
        trekId: trek.id,
        startDate: selectedDate,
        groupSize,
        guestName: name,
        guestEmail: email,
      })
      addBooking(booking)
      setSuccess(true)
      setTimeout(() => navigate('/bookings'), 1800)
    } catch {
      alert('Booking failed — please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        className="glass-card p-8 flex flex-col items-center text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="w-14 h-14 rounded-full bg-alpine-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-7 h-7 text-alpine-400" />
        </div>
        <h3 className="font-display font-semibold text-xl text-white mb-2">Trek Booked!</h3>
        <p className="text-white/50 text-sm">Taking you to your dashboard…</p>
      </motion.div>
    )
  }

  return (
    <div className="glass-card p-6 space-y-5 sticky top-24">
      {/* Price */}
      <div>
        <span className="text-xs text-white/40">Starting from</span>
        <div className="flex items-end gap-1">
          <span className="font-display font-bold text-3xl text-white">${trek.price.toLocaleString()}</span>
          <span className="text-white/40 text-sm mb-0.5">/ person</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm text-white font-medium">{trek.rating}</span>
          <span className="text-xs text-white/40">({trek.reviewCount.toLocaleString()} reviews)</span>
        </div>
      </div>

      <div className="h-px bg-white/8" />

      {/* Date picker */}
      <div>
        <label className="section-eyebrow block mb-2.5">Departure Date</label>
        <div className="space-y-2">
          {trek.availableDates.slice(0, 5).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                selectedDate === d
                  ? 'border-summit-500/60 bg-summit-500/10 text-summit-300'
                  : 'border-white/8 text-white/60 hover:border-white/20 hover:text-white/80'
              }`}
            >
              <span>{format(parseISO(d), 'MMMM d, yyyy')}</span>
              <Calendar className="w-4 h-4 opacity-40" />
            </button>
          ))}
        </div>
      </div>

      {/* Group size */}
      <div>
        <label className="section-eyebrow block mb-2.5">Group Size</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGroupSize((v) => Math.max(trek.groupSize.min, v - 1))}
            className="w-9 h-9 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20
                       flex items-center justify-center transition-colors text-lg"
          >
            −
          </button>
          <span className="flex-1 text-center font-display font-semibold text-xl text-white">{groupSize}</span>
          <button
            onClick={() => setGroupSize((v) => Math.min(trek.groupSize.max, v + 1))}
            className="w-9 h-9 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20
                       flex items-center justify-center transition-colors text-lg"
          >
            +
          </button>
        </div>
        <p className="text-xs text-white/30 text-center mt-1.5">
          Max {trek.groupSize.max} people
        </p>
      </div>

      {/* Guest info */}
      <div className="space-y-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="input-dark"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="input-dark"
        />
      </div>

      <div className="h-px bg-white/8" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Total ({groupSize} {groupSize === 1 ? 'person' : 'people'})</span>
        <span className="font-display font-bold text-xl text-white">${total.toLocaleString()}</span>
      </div>

      <button
        onClick={handleBook}
        disabled={!selectedDate || !name || !email || loading}
        className="btn-summit w-full justify-center py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" />
            </svg>
            Booking...
          </span>
        ) : (
          <>
            <Mountain className="w-4.5 h-4.5" />
            Book This Trek
          </>
        )}
      </button>

      <p className="text-xs text-white/25 text-center">Free cancellation up to 30 days before departure</p>
    </div>
  )
}

// AI Summary widget
function AiSummary({ trekId, initial }: { trekId: string; initial?: string }) {
  const [summary, setSummary] = useState(initial || '')
  const [loading, setLoading] = useState(!initial)

  useEffect(() => {
    if (initial) return
    trekApi.getAiSummary(trekId).then((s) => {
      setSummary(s)
      setLoading(false)
    })
  }, [trekId, initial])

  return (
    <div className="glass-card p-5 border-summit-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-summit-400" />
        <span className="text-sm font-medium text-summit-300">AI Trek Analysis</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[100, 90, 75].map((w, i) => (
            <div key={i} className="h-3 rounded-full shimmer" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/60 leading-relaxed">{summary}</p>
      )}
    </div>
  )
}

// Itinerary accordion
function ItineraryItem({ day }: { day: { day: number; title: string; description: string; altitude: number; distance: number; accommodation: string } }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-summit-500/15 border border-summit-500/25 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-summit-400">{String(day.day).padStart(2, '0')}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm text-white">{day.title}</h4>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-white/30">{day.altitude.toLocaleString()}m altitude</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/30">{day.distance}km</span>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3">
              {day.description}
              <div className="mt-2 flex items-center gap-1.5 text-white/30 text-xs">
                <span>Accommodation:</span>
                <span className="text-white/50">{day.accommodation}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TrekDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [trek, setTrek] = useState<Trek | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    trekApi.getBySlug(slug).then((t) => {
      setTrek(t)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-summit-500/30 border-t-summit-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading trek details…</p>
        </div>
      </div>
    )
  }

  if (!trek) {
    return (
      <div className="min-h-screen bg-void-950 pt-24 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">🏔️</div>
          <h2 className="font-display text-2xl text-white mb-2">Trek not found</h2>
          <button onClick={() => navigate('/treks')} className="btn-summit mt-4">Browse All Treks</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void-950 pt-16">
      {/* Hero image */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <motion.img
          key={activeImg}
          src={trek.images[activeImg] || trek.image}
          alt={trek.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-void-950/50 to-transparent" />

        {/* Image selector */}
        {trek.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {trek.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === activeImg ? 'bg-white w-6' : 'bg-white/30 w-1.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate('/treks')}
          className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-sm text-white/70
                     hover:text-white px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Treks
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Trek info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-teal">
                  <MapPin className="w-3 h-3" /> {trek.region}
                </span>
                <span className={`text-sm font-medium ${DIFF_COLORS[trek.difficulty]}`}>
                  {trek.difficulty}
                </span>
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-3">{trek.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-white">{trek.rating}</span>
                  <span className="text-white/40 text-sm">({trek.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Clock className="w-4 h-4 text-summit-400" />
                  {trek.duration} days
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Mountain className="w-4 h-4 text-summit-400" />
                  {trek.maxAltitude.toLocaleString()}m max
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Zap className="w-4 h-4 text-ember-400" />
                  {trek.distance}km
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Users className="w-4 h-4" />
                  Max {trek.groupSize.max}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <AiSummary trekId={trek.id} initial={trek.aiSummary} />

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-3">About this Trek</h2>
              <p className="text-white/60 leading-relaxed">{trek.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-white/30">Start</span>
                  <p className="text-sm text-white mt-0.5">{trek.startPoint}</p>
                </div>
                <div>
                  <span className="text-xs text-white/30">End</span>
                  <p className="text-sm text-white mt-0.5">{trek.endPoint}</p>
                </div>
                <div>
                  <span className="text-xs text-white/30">Best Season</span>
                  <p className="text-sm text-white mt-0.5">{trek.bestSeason.join(', ')}</p>
                </div>
                <div>
                  <span className="text-xs text-white/30">Group Size</span>
                  <p className="text-sm text-white mt-0.5">{trek.groupSize.min}–{trek.groupSize.max} people</p>
                </div>
              </div>
            </div>

            {/* Elevation Profile */}
            {trek.elevation.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-xl text-white mb-1">Elevation Profile</h2>
                <p className="text-xs text-white/30 mb-4">Interactive 3D — rotate to explore</p>
                <ElevationViewer points={trek.elevation} />
              </div>
            )}

            {/* Highlights */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-4">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trek.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5">
                    <span className="text-summit-400 mt-0.5">✦</span>
                    <span className="text-sm text-white/70">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Includes / Excludes */}
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-xl text-white mb-4">What's Included</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-alpine-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Included
                  </h3>
                  <ul className="space-y-2">
                    {trek.includes.map((item) => (
                      <li key={item} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-alpine-400 mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Not Included
                  </h3>
                  <ul className="space-y-2">
                    {trek.excludes.map((item) => (
                      <li key={item} className="text-sm text-white/60 flex items-start gap-2">
                        <span className="text-red-400/70 mt-0.5 flex-shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {trek.itinerary.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-semibold text-xl text-white mb-4">Day-by-Day Itinerary</h2>
                <div className="space-y-2">
                  {trek.itinerary.map((day) => (
                    <ItineraryItem key={day.day} day={day} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking panel */}
          <div>
            <BookingPanel trek={trek} />
          </div>
        </div>
      </div>
    </div>
  )
}
