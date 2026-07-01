import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Mountain, Clock, Star, ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trek } from '@/types'

const difficultyColor: Record<string, string> = {
  Easy:        'badge-green',
  Moderate:    'badge-teal',
  Challenging: 'badge-orange',
  Extreme:     'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/25',
}

interface TrekCard3DProps {
  trek: Trek
  index: number
}

export default function TrekCard3D({ trek, index }: TrekCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse-follow tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8])
  const glowX   = useTransform(springX, [-0.5, 0.5], ['0%', '100%'])
  const glowY   = useTransform(springY, [-0.5, 0.5], ['0%', '100%'])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="perspective-1000 group"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl overflow-hidden border border-white/8 cursor-pointer
                   transition-shadow duration-300"
        whileHover={{ boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(20,184,166,0.3)' }}
      >
        {/* Mouse-follow glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(200px at ${glowX.get()} ${glowY.get()}, rgba(20,184,166,0.08), transparent 80%)`,
          }}
        />

        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <motion.img
            src={trek.image}
            alt={trek.name}
            className="w-full h-full object-cover"
            style={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/40 to-transparent" />

          {/* Difficulty badge */}
          <div className="absolute top-3 left-3">
            <span className={difficultyColor[trek.difficulty]}>{trek.difficulty}</span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-white">{trek.rating}</span>
          </div>

          {/* Altitude label */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/60">
            <Mountain className="w-3 h-3" />
            <span>{trek.maxAltitude.toLocaleString()}m</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 bg-gradient-to-b from-void-900/95 to-void-950/95">
          <div className="mb-1">
            <span className="section-eyebrow text-[10px]">{trek.region}</span>
          </div>

          <h3 className="text-lg font-display font-semibold text-white mb-2 group-hover:text-summit-300 transition-colors">
            {trek.name}
          </h3>

          <p className="text-sm text-white/50 line-clamp-2 mb-4 leading-relaxed">
            {trek.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="w-3.5 h-3.5 text-summit-500" />
              <span>{trek.duration} days</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Zap className="w-3.5 h-3.5 text-ember-500" />
              <span>{trek.distance} km</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="text-xs text-white/40">{trek.reviewCount.toLocaleString()} reviews</div>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-white/40">from</span>
              <div className="text-xl font-display font-bold text-white">
                ${trek.price.toLocaleString()}
                <span className="text-xs font-normal text-white/40 ml-1">/ person</span>
              </div>
            </div>

            <Link
              to={`/treks/${trek.slug}`}
              className="flex items-center gap-1.5 text-sm font-medium text-summit-400
                         hover:text-summit-300 transition-colors group/link"
            >
              Explore
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
