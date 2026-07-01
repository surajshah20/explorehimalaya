/**
 * ExploreHimalaya — Global Error Handler Middleware
 * Must be registered LAST in Express (4 parameters).
 */
import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { AppError } from '../utils/errors'
import { fail } from '../types'
import { logger } from '../lib/logger'
import { env } from '../config/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // ── Operational / known errors ──────────────────────────────────────────────

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(fail(err.message, err.errors))
  }

  // ── Zod validation (shouldn't reach here if using validate middleware) ──────
  if (err instanceof ZodError) {
    return res.status(400).json(
      fail('Validation failed', err.flatten().fieldErrors as Record<string, string[]>),
    )
  }

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    return res.status(401).json(fail('Access token expired'))
  }
  if (err instanceof JsonWebTokenError) {
    return res.status(401).json(fail('Invalid access token'))
  }

  // ── Prisma errors ───────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = (err.meta?.target as string[])?.join(', ') ?? 'field'
        return res.status(409).json(fail(`A record with this ${field} already exists`))
      }
      case 'P2025':
        return res.status(404).json(fail('Record not found'))
      case 'P2003':
        return res.status(400).json(fail('Related record not found (foreign key constraint)'))
      default:
        logger.error('Prisma error', { code: err.code, meta: err.meta })
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json(fail('Invalid data supplied to database'))
  }

  // ── Unknown / programming errors ────────────────────────────────────────────
  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
    stack:   err instanceof Error ? err.stack : undefined,
    path:    req.path,
    method:  req.method,
  })

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err instanceof Error
        ? err.message
        : 'Unknown error'

  return res.status(500).json(fail(message))
}

/** 404 handler for unmatched routes */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json(fail(`Route ${req.method} ${req.path} not found`))
}
