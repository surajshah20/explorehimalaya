import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronDown, Mountain, Award, Users, Star } from 'lucide-react'
import MountainScene from '@/components/3d/MountainScene'
import { useStore } from '@/store'
import { MOCK_TREKS } from '@/lib/mockData'

const STATS = [
  { value: '200+', label: 'Trek routes', icon: Mountain },
  { value: '15k+', label: 'Happy trekkers', icon: Users },
  { value: '4.9', label: 'Avg. rating', icon: Star },
  { value: '28yr', label: 'Experience', icon: Award },
]

const FEATURED_TREKS = ['Everest Base Camp', 'Annapurna Circuit', 'Langtang Valley', 'Upper Mustang']

function SearchBar() {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const navigate = useNavigate()
  const { setFilter } = useStore()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setFilter('search', query)
    if (difficulty) setFilter('difficulty', [difficulty])
    navigate('/treks')
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      className="glass-card p-2 flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      {/* Search input */}
      <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8">
        <Search className="w-4 h-4 text-summit-400 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search treks, regions..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
        />
      </div>

      {/* Difficulty select */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 sm:w-44">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white/70 outline-none cursor-pointer"
        >
          <option value="" className="bg-void-950">All levels</option>
          <option value="Easy" className="bg-void-950">Easy</option>
          <option value="Moderate" className="bg-void-950">Moderate</option>
          <option value="Challenging" className="bg-void-950">Challenging</option>
          <option value="Extreme" className="bg-void-950">Extreme</option>
        </select>
        <ChevronDown className="w-4 h-4 text-white/30" />
      </div>

      <button type="submit" className="btn-summit px-6 whitespace-nowrap">
        <Search className="w-4 h-4" />
        Find Treks
      </button>
    </motion.form>
  )
}

export default function HeroPage() {
  return (
    <div className="min-h-screen bg-himalaya-gradient">
      {/* ── 3D Mountain Scene ── */}
      <div className="absolute inset-0 overflow-hidden">
        <MountainScene className="absolute inset-0 w-full h-full" />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-void-950/30 via-transparent to-void-950/80" />
        <div className="absolute inset-0 bg-summit-glow" />
        <div className="absolute inset-0 bg-ember-glow" />
        <div className="particles opacity-40" />
      </div>

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12">
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="section-eyebrow">AI-Powered Himalayan Expeditions</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display font-bold text-center text-balance leading-none mb-6
                       text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-white">Trek the </span>
            <span className="text-summit-gradient">Roof of</span>
            <br />
            <span className="text-white">the World</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-center text-white/50 text-lg sm:text-xl max-w-xl mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            Expert-guided Nepal treks planned by AI. From Everest Base Camp to hidden Himalayan kingdoms.
          </motion.p>

          {/* Search */}
          <SearchBar />

          {/* Featured tags */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-xs text-white/30 mr-1">Popular:</span>
            {FEATURED_TREKS.map((name) => {
              const trek = MOCK_TREKS.find((t) => t.name.includes(name.split(' ')[0]))
              return (
                <a
                  key={name}
                  href={trek ? `/treks/${trek.slug}` : '/treks'}
                  className="px-3 py-1 rounded-full text-xs text-white/50 border border-white/10
                             hover:border-summit-500/40 hover:text-summit-300 transition-colors"
                >
                  {name}
                </a>
              )
            })}
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          className="relative z-10 px-4 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <div className="max-w-3xl mx-auto glass-card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon className="w-4 h-4 text-summit-400 mb-0.5" />
                  <span className="font-display font-bold text-2xl text-white">{value}</span>
                  <span className="text-xs text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="flex justify-center pb-6"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-white/20" />
        </motion.div>
      </div>

      {/* ── Below fold: Feature highlights ── */}
      <section className="relative z-10 bg-void-950 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-eyebrow block mb-3">Why choose us</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">
              Built for the{' '}
              <span className="text-summit-gradient">modern explorer</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Route Planning',
                desc: 'Our AI analyzes your fitness, schedule, and budget to recommend the perfect trek and optimize your itinerary.',
                icon: '🤖',
                accent: 'summit',
              },
              {
                title: 'Verified Local Guides',
                desc: 'Every guide is licensed, trained in wilderness first aid, and has personally completed each route at least 20 times.',
                icon: '🧭',
                accent: 'alpine',
              },
              {
                title: 'Real-Time Conditions',
                desc: 'Live weather, trail conditions, and altitude alerts keep you informed before and during your trek.',
                icon: '📡',
                accent: 'ember',
              },
            ].map(({ title, desc, icon, accent }) => (
              <motion.div
                key={title}
                className="glass-card p-7 group hover:border-white/20 transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-display font-semibold text-xl text-white mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                <div className={`mt-6 h-0.5 bg-gradient-to-r ${
                  accent === 'summit' ? 'from-summit-500 to-transparent' :
                  accent === 'alpine' ? 'from-alpine-500 to-transparent' :
                  'from-ember-500 to-transparent'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 bg-void-950 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-summit-glow opacity-50" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-6">
            Ready to summit?
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Browse 200+ verified Nepal treks and book your adventure in minutes.
          </p>
          <a href="/treks" className="btn-summit text-base px-10 py-4 inline-flex">
            <Mountain className="w-5 h-5" />
            Explore All Treks
          </a>
        </div>
      </section>
    </div>
  )
}
