/**
 * ExploreHimalaya — Rate Limiters
 * Different limits for different route sensitivity levels.
 */
import rateLimit from 'express-rate-limit'
import { env } from '../config/env'
import { fail } from '../types'

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: unknown, res: { status: (c: number) => { json: (b: unknown) => void } }) => {
    res.status(429).json(fail('Too many requests — please try again later'))
  },
}

/** General API rate limit */
export const generalLimiter = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP',
})

/** Strict limit for auth endpoints (prevent brute force) */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  skipSuccessfulRequests: true,
})

/** Stricter limit for password reset / email verification */
export const sensitiveAuthLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
})

/** Firecrawl / AI endpoints — expensive, limit aggressively */
export const aiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 1000, // 1 minute
  max: 5,
})
