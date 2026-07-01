/**
 * ExploreHimalaya — Health & Admin Routes
 *
 * GET  /health         Public health check (load balancers, uptime monitors)
 * GET  /health/deep    DB connectivity check (internal / admin)
 * GET  /admin/stats    Platform statistics (Admin)
 * GET  /admin/users    List users (Admin)
 * PATCH /admin/users/:id/role  Change user role (Admin)
 * DELETE /admin/users/:id      Deactivate user (Admin)
 */
import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'
import { catchAsync } from '../utils/errors'
import { ok } from '../types'
import { env } from '../config/env'

const router = Router()

// ─── Health ───────────────────────────────────────────────────────────────────

/**
 * @route  GET /health
 * @access Public
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json(
    ok({
      status:    'ok',
      service:   'ExploreHimalaya API',
      version:   '1.0.0',
      env:       env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }),
  )
})

/**
 * @route  GET /health/deep
 * @access Public (but rate-limited in production via nginx / reverse proxy)
 * @desc   Checks DB connectivity. Returns 503 if DB is unreachable.
 */
router.get(
  '/health/deep',
  catchAsync(async (_req: Request, res: Response) => {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatencyMs = Date.now() - start
    res.json(
      ok({
        status:       'ok',
        db:           'connected',
        dbLatencyMs,
        uptime:       Math.floor(process.uptime()),
        memoryMB:     Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      }),
    )
  }),
)

// ─── Admin Stats ──────────────────────────────────────────────────────────────

/**
 * @route  GET /admin/stats
 * @access Admin
 */
router.get(
  '/admin/stats',
  authenticate,
  requireAdmin,
  catchAsync(async (_req: Request, res: Response) => {
    const [
      totalUsers,
      totalTreks,
      publishedTreks,
      totalBookings,
      confirmedBookings,
      totalReviews,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.trek.count({ where: { isActive: true } }),
      prisma.trek.count({ where: { isActive: true, isPublished: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.review.count({ where: { isVisible: true } }),
      prisma.booking.aggregate({
        where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        _sum:  { totalPrice: true },
      }),
      prisma.booking.findMany({
        take:    5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, reference: true, totalPrice: true, status: true, createdAt: true,
          trek: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    res.json(
      ok({
        users:    { total: totalUsers },
        treks:    { total: totalTreks, published: publishedTreks, draft: totalTreks - publishedTreks },
        bookings: { total: totalBookings, confirmed: confirmedBookings },
        reviews:  { total: totalReviews },
        revenue:  { totalUsd: Number(revenueResult._sum.totalPrice ?? 0) },
        recentBookings,
      }),
    )
  }),
)

// ─── Admin: Users ─────────────────────────────────────────────────────────────

/**
 * @route  GET /admin/users
 * @access Admin
 */
router.get(
  '/admin/users',
  authenticate,
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    const page  = Math.max(1, Number(req.query.page)  || 1)
    const limit = Math.min(100, Number(req.query.limit) || 20)
    const skip  = (page - 1) * limit
    const search = req.query.search as string | undefined

    const where = search
      ? {
          OR: [
            { name:  { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          isActive: true, isVerified: true, createdAt: true,
          _count: { select: { bookings: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    res.json(
      ok({
        data: users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      }),
    )
  }),
)

/**
 * @route  PATCH /admin/users/:id/role
 * @access Admin
 * @body   { role: 'USER' | 'PROVIDER' | 'ADMIN' }
 */
router.patch(
  '/admin/users/:id/role',
  authenticate,
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    const { role } = req.body as { role: string }
    if (!['USER', 'PROVIDER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }
    const user = await prisma.user.update({
      where:  { id: req.params.id },
      data:   { role: role as 'USER' | 'PROVIDER' | 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    })
    res.json(ok(user, `User role updated to ${role}`))
  }),
)

/**
 * @route  DELETE /admin/users/:id
 * @access Admin
 * @desc   Soft-deactivate a user account.
 */
router.delete(
  '/admin/users/:id',
  authenticate,
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    await prisma.user.update({
      where: { id: req.params.id },
      data:  { isActive: false },
    })
    res.json(ok(null, 'User deactivated'))
  }),
)

export default router
