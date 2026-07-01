import { Link } from 'react-router-dom'
import { Mountain, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-void-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-summit-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-summit-500 to-alpine-600 flex items-center justify-center shadow-summit">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Explore<span className="text-summit-gradient">Himalaya</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6">
              Nepal's most advanced trekking platform. AI-powered planning, verified guides,
              and unforgettable high-altitude adventures.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center
                             text-white/40 hover:text-summit-400 hover:border-summit-500/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {['Everest Region', 'Annapurna Circuit', 'Langtang Valley', 'Manaslu Circuit', 'Upper Mustang'].map((t) => (
                <li key={t}>
                  <Link to="/treks" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                { Icon: MapPin, text: 'Thamel, Kathmandu, Nepal' },
                { Icon: Phone, text: '+977 1 4701234' },
                { Icon: Mail, text: 'hello@explorehimalaya.com' },
              ].map(({ Icon, text }, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/40">
                  <Icon className="w-4 h-4 mt-0.5 text-summit-500 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2024 ExploreHimalaya. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((t) => (
              <a key={t} href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
