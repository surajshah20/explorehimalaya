# 🏔️ ExploreHimalaya

> **AI-powered Nepal Trekking Booking Platform** — A full-stack web application for discovering, planning, and booking Himalayan trekking adventures.

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://explorehimalaya.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)](https://github.com/surajshah20/explorehimalaya)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma-4169E1?style=flat-square&logo=postgresql)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-Full%20Stack-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

![ExploreHimalaya Hero](https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80)

---

## 🌐 Live Demo

**Frontend:** [explorehimalaya.vercel.app](https://explorehimalaya.vercel.app)

> Browse treks, view 3D mountain scenes, explore the AI guide, and booking flow — all running live.

---

## 📖 Project Overview

ExploreHimalaya is a production-grade full-stack booking platform for Nepal trekking routes. It features an immersive 3D frontend built with React Three Fiber, a RESTful backend API with JWT authentication, and a rich PostgreSQL database seeded with 10 of Nepal's most iconic trekking routes.

The project demonstrates end-to-end full-stack development: from a visually stunning 3D UI through to a well-structured, secure backend API and a thoughtfully designed relational database schema.

---

## ✨ Key Features

### Frontend
- **3D Immersive Hero** — Procedurally generated Himalayan mountain scene using React Three Fiber with dynamic lighting, stars, ice crystals, and animated glow effects
- **3D Tilt Cards** — Mouse-tracking perspective cards with per-card glow raycast on the Browse page
- **3D Elevation Viewer** — Auto-rotating elevation profile chart on trek detail pages
- **Floating AI Assistant** — Chat widget with quick prompts, typing indicators, and trek recommendations
- **Booking Flow** — Date picker, group-size selector, guest details form with live price calculation
- **My Bookings Dashboard** — Tabbed booking history with status badges and cancel flow
- **Glassmorphism UI** — Premium dark design with teal, emerald, and orange accent system
- **Framer Motion** — Page transitions, staggered reveals, spring-physics interactions
- **Fully Responsive** — Mobile-first design, works on all screen sizes

### Backend
- **JWT Authentication** — Access + refresh token rotation, bcrypt password hashing
- **Role-Based Access** — `TRAVELER`, `PROVIDER`, and `ADMIN` roles with route guards
- **Trek CRUD** — Full create/read/update/delete with slug generation and publish workflow
- **Booking System** — Atomic slot locking via Prisma transactions, availability checks, cancellation flow
- **Review System** — Star ratings with breakdown scores, verified booking badge, provider replies
- **Firecrawl Integration** — Scrape external trekking URLs and auto-extract structured trek data
- **AI Summary Endpoint** — Mock + real Anthropic API swap-ready AI trek summaries
- **Zod Validation** — All request bodies, query params, and env variables validated at runtime
- **Rate Limiting** — Per-route limits (10/15min on auth, 5/min on AI endpoints)
- **Security** — Helmet.js headers, CORS allowlist, compression, Morgan HTTP logging

### Database
- **19 Prisma Models** — User, Provider, Trek, Itinerary, ElevationPoint, Availability, Booking, Payment, Review, and more
- **10 Seeded Treks** — Complete data for Nepal's most iconic routes including full itineraries, elevation profiles, AI summaries, FAQs, and availability windows
- **Optimised Indexes** — Composite indexes on common filter combinations (status + difficulty + price, status + region)
- **Payment Support** — Stripe, eSewa, Khalti, ConnectIPS, and cash payment methods modelled
- **Nepal-specific** — NPR pricing, Nepalese digital wallets, permit tracking, seasonal availability

---

## 🗂️ Project Structure

```
explorehimalaya/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── MountainScene.tsx  # R3F hero — peaks, stars, glow orb
│   │   │   │   ├── TrekCard3D.tsx     # Mouse-follow tilt cards
│   │   │   │   └── ElevationViewer.tsx # 3D elevation profile chart
│   │   │   ├── ai/
│   │   │   │   └── AIAssistant.tsx    # Floating chat widget
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Hero.tsx               # Landing + 3D scene + search
│   │   │   ├── BrowseTreks.tsx        # Filter sidebar + 3D card grid
│   │   │   ├── TrekDetail.tsx         # Full detail + booking panel
│   │   │   └── MyBookings.tsx         # Dashboard with status tabs
│   │   ├── store/index.ts             # Zustand (persisted bookings + chat)
│   │   └── lib/api.ts                 # Axios instance, mock→real swap
│   ├── tailwind.config.ts             # Custom design tokens
│   └── package.json
│
├── backend/                           # Express + TypeScript API
│   ├── src/
│   │   ├── config/env.ts              # Zod env validation
│   │   ├── lib/
│   │   │   ├── prisma.ts              # Prisma client singleton
│   │   │   ├── logger.ts              # Winston structured logger
│   │   │   └── schemas/               # Zod request schemas
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT guards + role guards
│   │   │   ├── validate.middleware.ts # Zod validation factory
│   │   │   ├── error.middleware.ts    # Global error handler
│   │   │   └── rateLimiter.middleware.ts
│   │   ├── services/                  # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── trek.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── review.service.ts
│   │   │   └── firecrawl.service.ts
│   │   ├── routes/                    # Express route handlers
│   │   │   ├── auth.routes.ts
│   │   │   ├── trek.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── app.ts                     # Express app factory
│   │   └── server.ts                  # Entry point + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma              # 19-model database schema
│   │   └── seed.ts                    # 10 treks + full sample data
│   └── package.json
│
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tool |
| TypeScript | Type safety |
| React Three Fiber | 3D mountain scenes and elevation charts |
| @react-three/drei | R3F helpers (Stars, Float, Cloud) |
| Framer Motion | Animations and page transitions |
| Tailwind CSS | Utility-first styling |
| Zustand | Global state management |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| date-fns | Date formatting |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| Prisma ORM | Database access layer |
| PostgreSQL (Neon) | Primary database |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Zod | Runtime validation |
| Helmet | Security headers |
| Winston | Structured logging |
| Morgan | HTTP request logging |
| express-rate-limit | Rate limiting |
| Axios | Firecrawl API client |

---

## 🗄️ Database Schema

19 models covering the complete platform domain:

```
User ──────< Booking >────── Trek ──────< Itinerary
                │              │
                │              ├──< ElevationPoint
                │              ├──< TrekFAQ
                │              ├──< Availability
                │              ├──< Review
                │              ├──< WishlistItem
                │              └──< TrekTag >── Tag
                │
                └──< Payment
                
User ──── Provider ──────< Trek
       └──< ProviderDocument
```

### 10 Seeded Nepal Treks

| Trek | Region | Difficulty | Days | Max Altitude | Price |
|------|--------|-----------|------|-------------|-------|
| Everest Base Camp | Khumbu | Challenging | 14 | 5,364m | $1,850 |
| Annapurna Circuit | Annapurna | Challenging | 18 | 5,416m | $1,650 |
| Langtang Valley | Langtang | Moderate | 10 | 4,984m | $890 |
| Manaslu Circuit | Manaslu | Strenuous | 16 | 5,160m | $2,200 |
| Upper Mustang | Mustang | Moderate | 12 | 3,840m | $3,100 |
| Gokyo Lakes & Ri | Khumbu | Challenging | 13 | 5,360m | $1,550 |
| Annapurna Base Camp | Annapurna | Moderate | 11 | 4,130m | $1,100 |
| Poon Hill | Annapurna | Easy | 5 | 3,210m | $450 |
| Kanchenjunga BC | Kanchenjunga | Extreme | 22 | 5,143m | $2,800 |
| Dolpo / Shey Phoksundo | Dolpo | Strenuous | 14 | 5,090m | $2,600 |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ or a [Neon](https://neon.tech) account (free)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/explorehimalaya.git
cd explorehimalaya
```

### 2. Setup the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — add your DATABASE_URL and generate JWT secrets:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
npx prisma generate
npx prisma migrate dev --name init
npx tsx src/lib/seed.ts   # seeds 10 treks + sample data
npm run dev               # starts on http://localhost:4000
```

### 3. Setup the frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:4000/api/v1
npm run dev               # starts on http://localhost:5173
```

### 4. Test accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@explorehimalaya.com | Admin1234! | Admin |
| summit@explorehimalaya.com | Provider1234! | Provider |
| alex@example.com | Traveler1234! | Traveler |

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api/v1`

### Auth
```
POST   /auth/register        Create account
POST   /auth/login           Login → tokens
POST   /auth/refresh         Rotate tokens
POST   /auth/logout          Invalidate refresh token
GET    /auth/me              Get own profile
PATCH  /auth/me              Update profile
PUT    /auth/me/password     Change password
```

### Treks
```
GET    /treks                List + filter treks
GET    /treks/:slug          Trek detail
POST   /treks                Create trek (Provider/Admin)
PATCH  /treks/:id            Update trek
DELETE /treks/:id            Soft-delete (Admin)
PATCH  /treks/:id/publish    Publish toggle (Admin)
POST   /treks/:id/availability  Add date slots
GET    /treks/:id/ai-summary AI-generated summary
POST   /treks/scrape         Scrape URL via Firecrawl
GET    /treks/:slug/reviews  List reviews
POST   /treks/:id/reviews    Post a review
```

### Bookings
```
POST   /bookings             Create + confirm booking
GET    /bookings             My bookings
GET    /bookings/:id         Booking detail
DELETE /bookings/:id/cancel  Cancel booking
GET    /bookings/admin/all   All bookings (Admin)
```

### Health
```
GET    /health               Server status
GET    /health/deep          DB connectivity + latency
GET    /admin/stats          Platform statistics (Admin)
```

---

## 🔒 Security Features

- **Passwords** — bcrypt with 12 salt rounds
- **Tokens** — JWT with 7-day access / 30-day refresh, single-use rotation
- **Validation** — Zod on all request bodies, query params, and env vars
- **SQL Injection** — Parameterised queries via Prisma (no raw SQL)
- **Headers** — Helmet.js: CSP, HSTS, X-Frame-Options, X-Content-Type
- **CORS** — Strict allowlist, configurable per environment
- **Rate Limiting** — 10 req/15min on auth, 5 req/min on AI/scrape endpoints

---

## 🌱 What I'd Add Next

- [ ] Email verification + password reset (Resend)
- [ ] Real Stripe payment webhook handler
- [ ] Redis caching for trek list queries
- [ ] S3/Cloudinary for image uploads
- [ ] Backend unit + integration tests (Vitest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Admin dashboard UI

---

## 👤 Author

**Suraj** — Full Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-surajshah20-181717?style=flat-square&logo=github)](https://github.com/surajshah20)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourusername)

---

## 📄 License

MIT — feel free to use this project as inspiration or a starting point.

---

*Namaste! Built with ❤️ for Nepal's incredible mountain communities.* 🏔️