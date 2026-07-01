import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import TrekCard3D from '@/components/3d/TrekCard3D'
import { useStore } from '@/store'
import { trekApi } from '@/lib/api'
import { DIFFICULTIES, REGIONS } from '@/lib/mockData'
import type { Trek } from '@/types'

function FilterPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { filters, setFilter, resetFilters } = useStore()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-72 bg-void-900 lg:bg-transparent
                    border-r border-white/5 lg:border-0 overflow-y-auto transition-transform duration-300
                    ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 lg:p-0 space-y-7">
          {/* Mobile header */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="font-display font-semibold text-white">Filters</h2>
            <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="section-eyebrow block mb-3">Search</label>
            <div className="flex items-center gap-2 input-dark">
              <Search className="w-4 h-4 text-white/30" />
              <input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Trek name or region..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="section-eyebrow block mb-3">Difficulty</label>
            <div className="space-y-2">
              {DIFFICULTIES.map((d) => (
                <label key={d} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center flex-shrink-0
                                ${filters.difficulty.includes(d)
                                  ? 'bg-summit-500 border-summit-500'
                                  : 'border-white/20 group-hover:border-summit-500/50'
                                }`}
                    onClick={() => {
                      const next = filters.difficulty.includes(d)
                        ? filters.difficulty.filter((x) => x !== d)
                        : [...filters.difficulty, d]
                      setFilter('difficulty', next)
                    }}
                  >
                    {filters.difficulty.includes(d) && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{d}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="section-eyebrow block mb-3">Region</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const next = filters.region.includes(r)
                      ? filters.region.filter((x) => x !== r)
                      : [...filters.region, r]
                    setFilter('region', next)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    filters.region.includes(r)
                      ? 'bg-summit-500/20 border border-summit-500/50 text-summit-300'
                      : 'border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="section-eyebrow block mb-3">
              Max Price — <span className="text-white normal-case">${filters.maxPrice.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={filters.maxPrice}
              onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
              className="w-full accent-summit-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>$500</span><span>$5,000</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="section-eyebrow block mb-3">
              Duration — <span className="text-white normal-case">{filters.minDuration}–{filters.maxDuration} days</span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min={1}
                max={30}
                value={filters.maxDuration}
                onChange={(e) => setFilter('maxDuration', Number(e.target.value))}
                className="w-full accent-summit-500"
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="w-full btn-ghost text-sm"
          >
            Reset All Filters
          </button>
        </div>
      </aside>
    </>
  )
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration', label: 'Duration' },
]

export default function BrowseTreks() {
  const [treks, setTreks] = useState<Trek[]>([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort] = useState('rating')
  const { filters } = useStore()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await trekApi.getAll(filters)
        setTreks(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters])

  const sorted = [...treks].sort((a, b) => {
    if (sort === 'rating')      return b.rating - a.rating
    if (sort === 'price-asc')   return a.price - b.price
    if (sort === 'price-desc')  return b.price - a.price
    if (sort === 'duration')    return a.duration - b.duration
    return 0
  })

  return (
    <div className="min-h-screen bg-void-950 pt-16">
      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-void-900 to-void-950 border-b border-white/5 py-12 px-4">
        <div className="absolute inset-0 bg-summit-glow opacity-30" />
        <div className="relative max-w-7xl mx-auto">
          <span className="section-eyebrow block mb-2">Discover</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-3">
            Browse <span className="text-summit-gradient">Nepal Treks</span>
          </h1>
          <p className="text-white/40 text-lg">
            {treks.length} verified routes — from weekend hikes to multi-week expeditions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 btn-ghost text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <p className="text-sm text-white/40 hidden lg:block">
                Showing <span className="text-white font-medium">{sorted.length}</span> treks
              </p>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-white/30 hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-lg
                               px-3 py-2 pr-8 text-sm text-white/70 outline-none cursor-pointer
                               hover:border-white/20 transition-colors"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} className="bg-void-950">{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl shimmer" />
                ))}
              </div>
            ) : sorted.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sorted.map((trek, i) => (
                  <TrekCard3D key={trek.id} trek={trek} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">🏔️</div>
                <h3 className="font-display font-semibold text-xl text-white mb-2">No treks found</h3>
                <p className="text-white/40 text-sm">Try adjusting your filters</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
