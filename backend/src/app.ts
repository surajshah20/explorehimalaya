/**
 * ExploreHimalaya — Express Application Factory
 *
 * Wires together all middleware, routes, and error handlers.
 * Kept separate from server.ts so it's testable without starting a real server.
 */
import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env } from './config/env'
import { morganStream } from './lib/logger'
import { generalLimiter } from './middleware/rateLimiter.middleware'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

import authRoutes    from './routes/auth.routes'
import trekRoutes    from './routes/trek.routes'
import bookingRoutes from './routes/booking.routes'
import adminRoutes   from './routes/admin.routes'

export function createApp(): Application {
  const app = express()

  // ─── Trust proxy (needed behind nginx / Railway / Render) ──────────────────
  app.set('trust proxy', 1)

  // ─── Security headers ───────────────────────────────────────────────────────
  app.use(
    helmet({
      // Allow Swagger UI / health page to load without CSP issues in dev
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    }),
  )

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim())

  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin) return cb(null, true)
        if (allowedOrigins.includes(origin)) return cb(null, true)
        cb(new Error(`CORS: origin ${origin} not allowed`))
      },
      methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders:   ['Content-Type', 'Authorization'],
      exposedHeaders:   ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      credentials:      true,
      maxAge:           600, // preflight cache: 10 minutes
    }),
  )

  // ─── Body parsers ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))
  app.use(cookieParser())

  // ─── Compression ────────────────────────────────────────────────────────────
  app.use(compression())

  // ─── HTTP logging ───────────────────────────────────────────────────────────
  const morganFormat =
    env.NODE_ENV === 'production'
      ? 'combined'   // Apache-style for log aggregators
      : 'dev'        // Coloured short format for local dev
  app.use(morgan(morganFormat, { stream: morganStream }))

  // ─── General rate limit (all routes) ────────────────────────────────────────
  app.use(generalLimiter)

  // ─── Static uploads (local dev only — use S3/CDN in production) ─────────────
  app.use('/uploads', express.static(env.UPLOAD_DEST))

  // ─── API Routes ─────────────────────────────────────────────────────────────
  const prefix = env.API_PREFIX

  app.use(`${prefix}/auth`,     authRoutes)
  app.use(`${prefix}/treks`,    trekRoutes)
  app.use(`${prefix}/bookings`, bookingRoutes)
  app.use(prefix,               adminRoutes)   // health + admin

  // ─── Root ────────────────────────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      name:    'ExploreHimalaya API',
      version: '1.0.0',
      docs:    `${prefix}/docs`,
      health:  `/health`,
    })
  })

  // ─── 404 + Error handlers (must be last) ────────────────────────────────────
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
