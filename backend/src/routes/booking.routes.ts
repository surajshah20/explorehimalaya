/**
 * ExploreHimalaya — Booking Routes
 *
 * POST   /bookings                   Create a booking
 * GET    /bookings                   My bookings (paginated)
 * GET    /bookings/:id               Get one booking
 * PATCH  /bookings/:id               Update notes / phone
 * DELETE /bookings/:id/cancel        Cancel a booking
 *
 * Admin only:
 * GET    /bookings/admin/all         All bookings across all users
 * PATCH  /bookings/admin/:id/status  Update booking status
 */
import { Router, Request, Response } from 'express'
import { BookingStatus, UserRole as Role } from '@prisma/client'
import { bookingService } from '../services/booking.service'
import { authenticate, requireAdmin } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { catchAsync, AppError } from '../utils/errors'
import { ok } from '../types'
import { AuthRequest } from '../types'
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  CancelBookingSchema,
  BookingQuerySchema,
} from '../lib/schemas/booking.schema'

const router = Router()

// All booking routes require authentication
router.use(authenticate)

// ─── Create Booking ───────────────────────────────────────────────────────────

/**
 * @route  POST /bookings
 * @access Authenticated
 * @body   CreateBookingSchema
 * @desc   Create and confirm a booking. Checks availability and locks slots.
 */
router.post(
  '/',
  validate(CreateBookingSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const booking = await bookingService.create(authReq.user!.sub, req.body)
    res.status(201).json(ok(booking, `Booking confirmed! Reference: ${booking.reference}`))
  }),
)

// ─── My Bookings ──────────────────────────────────────────────────────────────

/**
 * @route  GET /bookings
 * @access Authenticated
 * @query  page, limit, status
 */
router.get(
  '/',
  validate(BookingQuerySchema, 'query'),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const result = await bookingService.listForUser(authReq.user!.sub, {
      page:   Number(req.query.page)  || 1,
      limit:  Number(req.query.limit) || 10,
      status: req.query.status as BookingStatus | undefined,
    })
    res.json(ok(result))
  }),
)

// ─── Admin: All Bookings ──────────────────────────────────────────────────────

/**
 * @route  GET /bookings/admin/all
 * @access Admin
 */
router.get(
  '/admin/all',
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    const result = await bookingService.listAll({
      page:   Number(req.query.page)  || 1,
      limit:  Number(req.query.limit) || 20,
      status: req.query.status as BookingStatus | undefined,
      trekId: req.query.trekId as string | undefined,
    })
    res.json(ok(result))
  }),
)

// ─── Admin: Update Status ─────────────────────────────────────────────────────

/**
 * @route  PATCH /bookings/admin/:id/status
 * @access Admin
 * @body   { status: BookingStatus }
 */
router.patch(
  '/admin/:id/status',
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body as { status: BookingStatus }
    if (!Object.values(BookingStatus).includes(status)) {
      throw AppError.badRequest(`Invalid status. Must be one of: ${Object.values(BookingStatus).join(', ')}`)
    }
    const booking = await bookingService.updateStatus(req.params.id, status)
    res.json(ok(booking, `Booking status updated to ${status}`))
  }),
)

// ─── Get Booking by ID ────────────────────────────────────────────────────────

/**
 * @route  GET /bookings/:id
 * @access Authenticated (owner or admin)
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const isAdmin = authReq.user!.role === Role.ADMIN
    const booking = await bookingService.getById(req.params.id, authReq.user!.sub, isAdmin)
    res.json(ok(booking))
  }),
)

// ─── Update Booking ───────────────────────────────────────────────────────────

/**
 * @route  PATCH /bookings/:id
 * @access Authenticated (owner)
 * @desc   Update mutable fields (notes, phone). Status changes go via admin route.
 */
router.patch(
  '/:id',
  validate(UpdateBookingSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest

    // Verify ownership
    await bookingService.getById(req.params.id, authReq.user!.sub, false)

    // Only update allowed fields
    const { specialNotes, guestPhone } = req.body as { specialNotes?: string; guestPhone?: string }
    const { prisma } = await import('../lib/prisma')
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data:  { specialNotes, guestPhone },
      select: { id: true, reference: true, specialNotes: true, guestPhone: true },
    })

    res.json(ok(updated, 'Booking updated'))
  }),
)

// ─── Cancel Booking ───────────────────────────────────────────────────────────

/**
 * @route  DELETE /bookings/:id/cancel
 * @access Authenticated (owner or admin)
 * @body   { cancellationNote?: string }
 * @desc   Cancels booking and releases availability slots.
 *         Free cancellation policy: ≥30 days before departure.
 */
router.delete(
  '/:id/cancel',
  validate(CancelBookingSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const isAdmin = authReq.user!.role === Role.ADMIN
    await bookingService.cancel(
      req.params.id,
      authReq.user!.sub,
      req.body.cancellationNote,
      isAdmin,
    )
    res.json(ok(null, 'Booking cancelled successfully'))
  }),
)

export default router
