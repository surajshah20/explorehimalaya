# 🏔️ ExploreHimalaya API

**Production-ready REST API** for the ExploreHimalaya Nepal trekking booking platform.
Built with Node.js · Express · TypeScript · Prisma · PostgreSQL.

---

## 🗂 Project Structure

```
explorehimalaya-api/
├── prisma/
│   ├── schema.prisma                  # Full data model
│   ├── migrations/                    # Migration history
│   └── seed.ts (via src/lib/seed.ts)
├── src/
│   ├── config/
│   │   └── env.ts                     # Zod-validated env loader
│   ├── lib/
│   │   ├── logger.ts                  # Winston structured logger
│   │   ├── prisma.ts                  # PrismaClient singleton
│   │   ├── seed.ts                    # Dev seed script
│   │   └── schemas/
│   │       ├── auth.schema.ts         # Zod schemas — auth
│   │       ├── trek.schema.ts         # Zod schemas — treks
│   │       └── booking.schema.ts      # Zod schemas — bookings & reviews
│   ├── middleware/
│   │   ├── auth.middleware.ts         # JWT authenticate + role guards
│   │   ├── validate.middleware.ts     # Zod request validation factory
│   │   ├── error.middleware.ts        # Global error handler + 404
│   │   └── rateLimiter.middleware.ts  # Per-route rate limiters
│   ├── routes/
│   │   ├── auth.routes.ts             # /auth/*
│   │   ├── trek.routes.ts             # /treks/*
│   │   ├── booking.routes.ts          # /bookings/*
│   │   └── admin.routes.ts            # /health + /admin/*
│   ├── services/
│   │   ├── auth.service.ts            # Register, login, refresh, profile
│   │   ├── trek.service.ts            # CRUD, availability, AI summary
│   │   ├── booking.service.ts         # Create, cancel, list with slot locking
│   │   ├── review.service.ts          # CRUD + rating recalculation
│   │   └── firecrawl.service.ts       # URL scraping + trek data extraction
│   ├── types/
│   │   └── index.ts                   # Shared types, ApiResponse helpers
│   ├── utils/
│   │   ├── errors.ts                  # AppError class + catchAsync
│   │   ├── jwt.ts                     # sign / verify helpers
│   │   └── slug.ts                    # Unique slug generator
│   ├── app.ts                         # Express app factory
│   └── server.ts                      # Entry point + graceful shutdown
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)

### 1. Install dependencies

```bash
cd explorehimalaya-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Start the database

```bash
# Option A: Docker (recommended)
docker compose up postgres -d

# Option B: Local PostgreSQL
createdb explorehimalaya
```

### 4. Run migrations & seed

```bash
npm run prisma:migrate     # Apply migrations
npm run prisma:seed        # Insert sample data
```

### 5. Start the dev server

```bash
npm run dev
```

Server starts at **http://localhost:4000**

```
🏔️  ExploreHimalaya API
Environment : development
Port        : 4000
API Prefix  : /api/v1
Health      : http://localhost:4000/health
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:4000/api/v1
```

All responses follow:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### 🔐 Auth  `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create account |
| `POST` | `/auth/login` | — | Login → access + refresh tokens |
| `POST` | `/auth/refresh` | — | Rotate tokens |
| `POST` | `/auth/logout` | ✅ | Invalidate refresh token |
| `GET`  | `/auth/me` | ✅ | Get own profile |
| `PATCH`| `/auth/me` | ✅ | Update profile |
| `PUT`  | `/auth/me/password` | ✅ | Change password |

**Register**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Jane Hiker",
  "email": "jane@example.com",
  "password": "Secure1234!"
}
```

**Login**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@explorehimalaya.com",
  "password": "User1234!"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Alex Trekker", "email": "...", "role": "USER" },
    "accessToken":  "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### 🏔️ Treks  `/treks`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/treks` | — | List / filter treks |
| `GET`  | `/treks/:slug` | — | Trek detail |
| `POST` | `/treks` | PROVIDER/ADMIN | Create trek |
| `PATCH`| `/treks/:id` | PROVIDER/ADMIN | Update trek |
| `DELETE`| `/treks/:id` | ADMIN | Soft-delete |
| `PATCH`| `/treks/:id/publish` | ADMIN | Publish toggle |
| `POST` | `/treks/:id/availability` | PROVIDER/ADMIN | Add dates |
| `GET`  | `/treks/:id/ai-summary` | — | AI summary |
| `POST` | `/treks/scrape` | PROVIDER/ADMIN | Scrape URL via Firecrawl |
| `GET`  | `/treks/:slug/reviews` | — | List reviews |
| `POST` | `/treks/:trekId/reviews` | ✅ | Post review |
| `PATCH`| `/treks/reviews/:id` | ✅ | Edit own review |
| `DELETE`| `/treks/reviews/:id` | ✅/ADMIN | Delete review |

**List Treks (with filters)**
```http
GET /api/v1/treks?region=Khumbu&difficulty=CHALLENGING&maxPrice=2000&page=1&limit=10&sortBy=rating
```

**Scrape a URL (Firecrawl)**
```http
POST /api/v1/treks/scrape
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://www.nepaltrekking.com/everest-base-camp",
  "saveAs": true
}
```

**Add Availability**
```http
POST /api/v1/treks/{id}/availability
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate":  "2024-10-01",
  "totalSlots": 12,
  "priceUsd":   1950
}
```

---

### 📋 Bookings  `/bookings`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/bookings` | ✅ | Create + confirm booking |
| `GET`  | `/bookings` | ✅ | My bookings |
| `GET`  | `/bookings/:id` | ✅ | Booking detail |
| `PATCH`| `/bookings/:id` | ✅ | Update notes/phone |
| `DELETE`| `/bookings/:id/cancel` | ✅ | Cancel booking |
| `GET`  | `/bookings/admin/all` | ADMIN | All bookings |
| `PATCH`| `/bookings/admin/:id/status` | ADMIN | Update status |

**Create Booking**
```http
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "trekId":       "clx...",
  "startDate":    "2024-10-15",
  "groupSize":    2,
  "guestName":    "Jane Hiker",
  "guestEmail":   "jane@example.com",
  "specialNotes": "Vegetarian meals please"
}
```

---

### ❤️ Health

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Basic health check |
| `GET`  | `/health/deep` | DB connectivity + latency |

---

## 🗄️ Data Models

```
User ──────< Booking >────── Trek ──────< ItineraryDay
                              │
                              ├──────< Availability
                              │
                              └──────< Review
```

### Roles
| Role | Permissions |
|------|-------------|
| `USER` | Browse, book, review |
| `PROVIDER` | USER + create/update own treks, add availability, scrape |
| `ADMIN` | All permissions + delete, publish, manage users |

---

## 🔒 Security

| Feature | Implementation |
|---------|----------------|
| Passwords | bcrypt, 12 rounds |
| Auth tokens | JWT RS256, 7-day access / 30-day refresh |
| Token rotation | Refresh tokens are single-use with DB persistence |
| Rate limiting | express-rate-limit: 10 req/15min on auth, 5 req/min on AI |
| Input validation | Zod on all request body/query/params |
| SQL injection | Parameterised queries via Prisma |
| Headers | Helmet.js — CSP, HSTS, X-Frame-Options, etc. |
| CORS | Allowlist-based, configurable via env |

---

## 🌿 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Min 32 chars |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars |
| `CORS_ORIGINS` | ✅ | Comma-separated allowed origins |
| `FIRECRAWL_API_KEY` | Optional | For web scraping feature |
| `ANTHROPIC_API_KEY` | Optional | For real AI summaries |
| `PORT` | Optional | Default 4000 |

---

## 🐳 Docker

```bash
# Start everything (Postgres + API)
docker compose up -d

# View logs
docker compose logs -f api

# Run migrations inside container
docker compose exec api npx prisma migrate deploy
```

---

## 🧩 Connecting the Frontend

Update the frontend's `.env.local`:
```
VITE_API_URL=http://localhost:4000/api/v1
```

The frontend `src/lib/api.ts` Axios instance is pre-configured to:
- Send `Authorization: Bearer {token}` via an interceptor
- Point to `VITE_API_URL`

---

## 🚢 Production Deployment

### Railway / Render / Fly.io

1. Set all env vars via the platform dashboard
2. Use the included `Dockerfile`
3. Set `DATABASE_URL` to your managed Postgres URL
4. The container runs `prisma migrate deploy && node dist/server.js`

### Environment checklist
- [ ] Strong random `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ chars)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGINS` set to your frontend domain
- [ ] `LOG_LEVEL=info` (not `debug`)
- [ ] Managed PostgreSQL with SSL (`?sslmode=require`)
- [ ] Object storage for uploads (S3/Cloudinary)

---

## 📦 Scripts

```bash
npm run dev              # Hot-reload dev server (tsx watch)
npm run build            # Compile TypeScript → dist/
npm run start            # Run compiled production server
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run pending migrations (dev)
npm run prisma:migrate:prod  # Deploy migrations (production)
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Insert sample data
npm run typecheck        # Type-check without emitting
```

---

*Namaste! Built with ❤️ for Nepal's mountain communities.* 🏔️
