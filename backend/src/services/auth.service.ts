/**
 * ExploreHimalaya — Auth Service
 * Handles all authentication business logic separately from HTTP layer.
 */
import bcrypt from 'bcryptjs'
import { UserRole as Role } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { RegisterInput, LoginInput } from '../lib/schemas/auth.schema'
import { logger } from '../lib/logger'

const SALT_ROUNDS = 12

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeUser(user: {
  id: string; name: string; email: string; role: Role;
  avatar: string | null; phone: string | null; nationality: string | null;
  isVerified: boolean; createdAt: Date
}) {
  return {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    role:        user.role,
    avatar:      user.avatar,
    phone:       user.phone,
    nationality: user.nationality,
    isVerified:  user.isVerified,
    createdAt:   user.createdAt,
  }
}

function buildTokens(payload: { sub: string; email: string; role: Role }) {
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  }
}

// ─── Service Methods ──────────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user account.
   */
  async register(input: RegisterInput) {
    const exists = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })
    if (exists) throw AppError.conflict('An account with this email already exists')

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name:        input.name,
        email:       input.email,
        passwordHash,
        phone:       input.phone,
        nationality: input.nationality,
      },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, phone: true, nationality: true, isVerified: true, createdAt: true,
      },
    })

    const tokens = buildTokens({ sub: user.id, email: user.email, role: user.role })

    // Persist refresh token
    await prisma.refreshToken.create({
      data: {
        token:     tokens.refreshToken,
        userId:    user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    logger.info('New user registered', { userId: user.id, email: user.email })
    return { user: sanitizeUser(user), ...tokens }
  },

  /**
   * Login with email + password.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, phone: true, nationality: true, isVerified: true,
        createdAt: true, passwordHash: true, isActive: true,
      },
    })

    if (!user || !user.isActive) throw AppError.unauthorized('Invalid email or password')

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw AppError.unauthorized('Invalid email or password')

    const tokens = buildTokens({ sub: user.id, email: user.email, role: user.role })

    await prisma.refreshToken.create({
      data: {
        token:     tokens.refreshToken,
        userId:    user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    logger.info('User logged in', { userId: user.id })

    const { passwordHash: _, ...safeUser } = user
    return { user: sanitizeUser(safeUser as typeof user & { passwordHash?: never }), ...tokens }
  },

  /**
   * Exchange a valid refresh token for a new access + refresh token pair (rotation).
   */
  async refresh(refreshToken: string) {
    // Verify signature + expiry first
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token')
    }

    // Check it exists in DB (one-time use — delete it)
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    })

    if (!stored || stored.expiresAt < new Date()) {
      // Possible token reuse — invalidate all tokens for this user
      await prisma.refreshToken.deleteMany({ where: { userId: payload.sub } })
      throw AppError.unauthorized('Refresh token expired or already used')
    }
    if (!stored.user.isActive) throw AppError.unauthorized('Account deactivated')

    // Rotate
    await prisma.refreshToken.delete({ where: { id: stored.id } })

    const tokens = buildTokens({
      sub:   stored.user.id,
      email: stored.user.email,
      role:  stored.user.role,
    })

    await prisma.refreshToken.create({
      data: {
        token:     tokens.refreshToken,
        userId:    stored.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return tokens
  },

  /**
   * Logout: invalidate the provided refresh token.
   */
  async logout(refreshToken: string, userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken, userId },
    })
  },

  /**
   * Get authenticated user's profile.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, phone: true, nationality: true, isVerified: true, createdAt: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    })
    if (!user) throw AppError.notFound('User not found')
    return user
  },

  /**
   * Update profile fields.
   */
  async updateProfile(userId: string, data: { name?: string; phone?: string; nationality?: string; avatar?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        avatar: true, phone: true, nationality: true, isVerified: true, updatedAt: true,
      },
    })
  },

  /**
   * Change password.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })
    if (!user) throw AppError.notFound('User not found')

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw AppError.unauthorized('Current password is incorrect')

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

    // Invalidate all refresh tokens on password change
    await prisma.refreshToken.deleteMany({ where: { userId } })
  },
}
