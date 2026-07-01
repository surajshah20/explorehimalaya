# 🏔️ ExploreHimalaya

**AI-powered Nepal trekking booking platform** — built with React 18, Vite, React Three Fiber, Tailwind CSS, Framer Motion, and Zustand.

---

## ✨ Features

| Feature | Details |
|---|---|
| **3D Mountain Hero** | Procedurally generated Himalayan mountain scene with Three.js/R3F |
| **3D Tilt Cards** | Mouse-tracking perspective cards with glow effects on Browse page |
| **3D Elevation Viewer** | Rotating elevation profile chart in Trek Detail |
| **AI Trek Assistant** | Floating chat widget with smart trek recommendations |
| **Booking Calendar** | Date selection + group-size picker with live price calculation |
| **My Bookings Dashboard** | Full booking history with status tracking and cancel flow |
| **Glassmorphism UI** | Dark premium design with teal/emerald/orange accent system |
| **Framer Motion** | Page transitions, staggered list reveals, spring interactions |
| **Zustand Store** | Global state with localStorage persistence for bookings & chat |
| **Axios API Layer** | Ready-to-swap mock → real backend |

---

## 🗂 Project Structure

```
explorehimalaya/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── MountainScene.tsx     # R3F hero — peaks, stars, glow orb, terrain
│   │   │   ├── TrekCard3D.tsx        # Mouse-follow tilt cards
│   │   │   └── ElevationViewer.tsx   # 3D rotating elevation profile
│   │   ├── ai/
│   │   │   └── AIAssistant.tsx       # Floating AI chat panel
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   ├── pages/
│   │   ├── Hero.tsx                  # Landing + 3D scene + search
│   │   ├── BrowseTreks.tsx           # Filter sidebar + 3D card grid
│   │   ├── TrekDetail.tsx            # Full detail + booking panel
│   │   └── MyBookings.tsx            # Dashboard with status tabs
│   ├── store/
│   │   └── index.ts                  # Zustand store (bookings, chat, filters)
│   ├── hooks/
│   │   └── useTrek.ts
│   ├── lib/
│   │   ├── api.ts                    # Axios + mock data layer
│   │   ├── mockData.ts               # 6 full trek objects
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd explorehimalaya
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Edit VITE_API_URL if you have a real backend
```

### 3. Start dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## 🎨 Design System

### Color Palette

| Name | Token | Hex | Use |
|---|---|---|---|
| **Summit Teal** | `summit-500` | `#14b8a6` | Primary brand, CTAs, highlights |
| **Alpine Green** | `alpine-500` | `#22c55e` | Success, included items |
| **Ember Orange** | `ember-500` | `#f97316` | Accents, peaks, warnings |
| **Void Dark** | `void-950` | `#050810` | Page background |

### Component Classes

```css
/* Glassmorphism cards */
.glass-card        /* standard */
.glass-card-lg     /* elevated */

/* Buttons */
.btn-summit        /* teal gradient CTA */
.btn-ghost         /* outlined secondary */

/* Typography */
.text-summit-gradient   /* teal→green gradient text */
.text-ember-gradient    /* warm orange gradient text */
.section-eyebrow        /* mono uppercase label */

/* Badges */
.badge-teal / .badge-orange / .badge-green

/* Input */
.input-dark
```

---

## 🔌 Connecting a Real Backend

The API layer lives in `src/lib/api.ts`. Replace the mock functions with real Axios calls:

```ts
// Before (mock)
async getAll(filters) {
  await delay(600)
  return MOCK_TREKS.filter(...)
}

// After (real API)
async getAll(filters) {
  const { data } = await api.get('/treks', { params: filters })
  return data.treks
}
```

### Expected API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/treks` | List treks (supports filter query params) |
| `GET` | `/treks/:slug` | Single trek detail |
| `GET` | `/treks/:id/ai-summary` | AI-generated summary |
| `POST` | `/bookings` | Create booking |
| `GET` | `/bookings/mine` | User's bookings |
| `PATCH` | `/bookings/:id/cancel` | Cancel booking |
| `POST` | `/ai/chat` | AI assistant chat |

---

## 🧩 Swapping the AI with Real Claude API

In `src/lib/api.ts`, replace the `aiApi.chat` mock:

```ts
export const aiApi = {
  async chat(message: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: 'You are an expert Nepal trekking guide for ExploreHimalaya. Be concise and helpful.',
        messages: [{ role: 'user', content: message }],
      }),
    })
    const data = await response.json()
    return data.content[0].text
  }
}
```

> ⚠️ Never expose your API key in a client-side app. Route through your own backend in production.

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.x | UI framework |
| `vite` | 5.x | Build tool |
| `@react-three/fiber` | 8.x | React renderer for Three.js |
| `@react-three/drei` | 9.x | R3F helpers (Stars, Float, etc.) |
| `framer-motion` | 11.x | Animations & transitions |
| `tailwindcss` | 3.x | Utility CSS |
| `zustand` | 4.x | State management |
| `react-router-dom` | 6.x | Client-side routing |
| `axios` | 1.x | HTTP client |
| `date-fns` | 3.x | Date formatting |
| `lucide-react` | 0.x | Icon set |

---

## 🛠 Scripts

```bash
npm run dev       # Start development server (port 5173)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## 🚢 Deployment

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Deploy the dist/ folder
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

---

## 🙏 Acknowledgments

Built with ❤️ for Nepal's incredible trekking community. All trek data is illustrative — always verify permits and conditions with local authorities before departure.

*Namaste!* 🏔️
