import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mountain, Menu, X, MessageSquare, Map } from 'lucide-react'
import { useStore } from '@/store'

const NAV_LINKS = [
  { to: '/treks', label: 'Browse Treks' },
  { to: '/bookings', label: 'My Bookings' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleChat, bookings } = useStore()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location])

  const pendingBookings = bookings.filter((b) => b.status === 'confirmed').length

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-void-950/90 backdrop-blur-xl border-b border-white/5 shadow-glass'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-summit-500 to-alpine-600 flex items-center justify-center shadow-summit">
                <Mountain className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <span className="font-display font-semibold text-white tracking-tight">
                Explore<span className="text-summit-gradient">Himalaya</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    location.pathname.startsWith(to)
                      ? 'text-summit-300 bg-summit-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                  {to === '/bookings' && pendingBookings > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ember-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingBookings}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* AI Chat toggle */}
              <button
                onClick={toggleChat}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                           text-summit-300 border border-summit-500/25 bg-summit-500/8
                           hover:bg-summit-500/15 hover:border-summit-500/40 transition-all duration-200"
                aria-label="Open AI assistant"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">AI Guide</span>
              </button>

              <Link
                to="/treks"
                className="hidden sm:flex btn-summit text-xs py-2.5"
              >
                <Map className="w-3.5 h-3.5" />
                Plan a Trek
              </Link>

              {/* Mobile burger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-void-950/95 backdrop-blur-xl pt-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <nav className="flex flex-col gap-2 p-6">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-3 rounded-xl text-lg font-medium text-white/80
                             hover:text-white hover:bg-white/5 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-4">
                <Link to="/treks" className="btn-summit w-full justify-center">
                  Plan a Trek
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
