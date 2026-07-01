/**
 * ExploreHimalaya — Authentication & Authorization Middleware
 */
import { Request, Response, NextFunction } from 'express'
import { UserRole as Role } from '@prisma/client'
import { AppError, catchAsync } from '../utils/errors'
import { verifyAccessToken, extractBearerToken } from '../utils/jwt'
import { AuthRequest, JwtPayload } from '../types'
import { prisma } from '../lib/prisma'

/**
 * `authenticate` — verifies the JWT in the Authorization header.
 * Attaches `req.user` (JwtPayload) on success.
 */
export const authenticate = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization)
    if (!token) throw AppError.unauthorized('No access token provided')

    let payload: JwtPayload
    try {
      payload = verifyAccessToken(token)
    } catch {
      throw AppError.unauthorized('Invalid or expired access token')
    }

    // Confirm user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    })
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Account not found or deactivated')
    }

    ;(req as AuthRequest).user = payload
    next()
  },
)

/**
 * `optionalAuth` — same as authenticate but doesn't fail if no token.
 * Useful for public endpoints that show extra data to logged-in users.
 */
export const optionalAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearerToken(req.headers.authorization)
    if (token) {
      try {
        const payload = verifyAccessToken(token)
        ;(req as AuthRequest).user = payload
      } catch {
        // Silently ignore bad tokens on optional routes
      }
    }
    next()
  },
)

/**
 * `requireRole(...roles)` — must be used AFTER `authenticate`.
 * Throws 403 if the authenticated user doesn't have one of the given roles.
 */
export const requireRole = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user
    if (!user) return next(AppError.unauthorized())
    if (!roles.includes(user.role)) {
      return next(AppError.forbidden('Insufficient permissions'))
    }
    next()
  }

// Convenience aliases
export const requireAdmin    = requireRole(Role.ADMIN)
export const requireProvider = requireRole(Role.PROVIDER, Role.ADMIN)

/**
 * `requireOwnerOrAdmin` — ensures the requesting user owns the resource
 * OR is an admin. Pass the resource userId as a string.
 */
export function requireOwnerOrAdmin(getOwnerId: (req: Request) => string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user
    if (!user) return next(AppError.unauthorized())
    const ownerId = getOwnerId(req)
    if (user.role === Role.ADMIN || user.sub === ownerId) return next()
    next(AppError.forbidden('You do not own this resource'))
  }
}
