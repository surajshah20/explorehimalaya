/**
 * ExploreHimalaya — Auth Routes
 *
 * POST   /auth/register
 * POST   /auth/login
 * POST   /auth/refresh
 * POST   /auth/logout
 * GET    /auth/me
 * PATCH  /auth/me
 * PUT    /auth/me/password
 */
import { Router, Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { authLimiter } from '../middleware/rateLimiter.middleware'
import { catchAsync } from '../utils/errors'
import { ok } from '../types'
import { AuthRequest } from '../types'
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '../lib/schemas/auth.schema'

const router = Router()

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * @route  POST /auth/register
 * @access Public
 * @desc   Create a new user account and return JWT tokens.
 */
router.post(
  '/register',
  authLimiter,
  validate(RegisterSchema),
  catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body)
    res.status(201).json(ok(result, 'Account created successfully'))
  }),
)

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * @route  POST /auth/login
 * @access Public
 * @desc   Authenticate with email + password. Returns access + refresh tokens.
 */
router.post(
  '/login',
  authLimiter,
  validate(LoginSchema),
  catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body)
    res.json(ok(result, 'Login successful'))
  }),
)

// ─── Refresh Token ────────────────────────────────────────────────────────────

/**
 * @route  POST /auth/refresh
 * @access Public
 * @desc   Exchange a refresh token for new access + refresh tokens (rotation).
 *         Send the refreshToken in the request body.
 */
router.post(
  '/refresh',
  validate(RefreshTokenSchema),
  catchAsync(async (req: Request, res: Response) => {
    const tokens = await authService.refresh(req.body.refreshToken)
    res.json(ok(tokens, 'Tokens refreshed'))
  }),
)

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * @route  POST /auth/logout
 * @access Private
 * @desc   Invalidate the provided refresh token.
 */
router.post(
  '/logout',
  authenticate,
  validate(RefreshTokenSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    await authService.logout(req.body.refreshToken, authReq.user!.sub)
    res.json(ok(null, 'Logged out successfully'))
  }),
)

// ─── Get Profile ──────────────────────────────────────────────────────────────

/**
 * @route  GET /auth/me
 * @access Private
 * @desc   Return the authenticated user's profile.
 */
router.get(
  '/me',
  authenticate,
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const user = await authService.getProfile(authReq.user!.sub)
    res.json(ok(user))
  }),
)

// ─── Update Profile ───────────────────────────────────────────────────────────

/**
 * @route  PATCH /auth/me
 * @access Private
 * @desc   Update name, phone, nationality, avatar.
 */
router.patch(
  '/me',
  authenticate,
  validate(UpdateProfileSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const user = await authService.updateProfile(authReq.user!.sub, req.body)
    res.json(ok(user, 'Profile updated'))
  }),
)

// ─── Change Password ──────────────────────────────────────────────────────────

/**
 * @route  PUT /auth/me/password
 * @access Private
 * @desc   Change password. Invalidates all existing refresh tokens.
 */
router.put(
  '/me/password',
  authenticate,
  authLimiter,
  validate(ChangePasswordSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    await authService.changePassword(
      authReq.user!.sub,
      req.body.currentPassword,
      req.body.newPassword,
    )
    res.json(ok(null, 'Password changed successfully. Please log in again.'))
  }),
)

export default router
