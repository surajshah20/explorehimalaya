import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AIAssistant from '@/components/ai/AIAssistant'
import HeroPage from '@/pages/Hero'
import BrowseTreks from '@/pages/BrowseTreks'
import TrekDetail from '@/pages/TrekDetail'
import MyBookings from '@/pages/MyBookings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-void-950 text-white font-body">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/treks" element={<BrowseTreks />} />
            <Route path="/treks/:slug" element={<TrekDetail />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <AIAssistant />
      </div>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-void-950 flex items-center justify-center text-center px-4 pt-16">
      <div>
        <div className="text-8xl mb-6">🏔️</div>
        <h1 className="font-display font-bold text-5xl text-white mb-4">404</h1>
        <p className="text-white/40 text-lg mb-8">This peak doesn't exist on our map.</p>
        <a href="/" className="btn-summit inline-flex">Return to Base Camp</a>
      </div>
    </div>
  )
}
