/**
 * ExploreHimalaya — Trek Routes
 *
 * GET    /treks                      List / filter treks (public)
 * GET    /treks/:slug                Get trek by slug (public)
 * POST   /treks                      Create trek (PROVIDER | ADMIN)
 * PATCH  /treks/:id                  Update trek (owner PROVIDER | ADMIN)
 * DELETE /treks/:id                  Soft-delete trek (ADMIN)
 * PATCH  /treks/:id/publish          Publish/unpublish (ADMIN)
 * POST   /treks/:id/availability     Add dates (PROVIDER | ADMIN)
 * GET    /treks/:id/ai-summary       Get or generate AI summary
 * POST   /treks/scrape               Scrape + parse a URL (PROVIDER | ADMIN)
 * GET    /treks/:slug/reviews        List reviews
 * POST   /treks/:trekId/reviews      Post a review (authenticated)
 * PATCH  /treks/reviews/:reviewId    Update own review
 * DELETE /treks/reviews/:reviewId    Delete own review (or ADMIN)
 */
import { Router, Request, Response } from 'express'
import { UserRole as Role } from '@prisma/client'
import { trekService } from '../services/trek.service'
import { reviewService } from '../services/review.service'
import { firecrawlService } from '../services/firecrawl.service'
import { authenticate, optionalAuth, requireProvider, requireAdmin } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { aiLimiter } from '../middleware/rateLimiter.middleware'
import { catchAsync, AppError } from '../utils/errors'
import { ok } from '../types'
import { AuthRequest } from '../types'
import {
  CreateTrekSchema,
  UpdateTrekSchema,
  TrekQuerySchema,
  AvailabilitySchema,
  ScrapeUrlSchema,
} from '../lib/schemas/trek.schema'
import {
  CreateReviewSchema,
  UpdateReviewSchema,
} from '../lib/schemas/booking.schema'

const router = Router()

// ─── List Treks ───────────────────────────────────────────────────────────────

/**
 * @route  GET /treks
 * @access Public
 * @query  page, limit, region, difficulty, minPrice, maxPrice,
 *         minDuration, maxDuration, search, sortBy, sortOrder
 */
router.get(
  '/',
  optionalAuth,
  validate(TrekQuerySchema, 'query'),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const isAdmin = authReq.user?.role === Role.ADMIN

    // Non-admins can only see published treks
    const filters = {
      ...req.query as Record<string, unknown>,
      published: isAdmin ? req.query.published : true,
    }

    const result = await trekService.list(filters as Parameters<typeof trekService.list>[0])
    res.json(ok(result))
  }),
)

// ─── Scrape URL ───────────────────────────────────────────────────────────────

/**
 * @route  POST /treks/scrape
 * @access Provider | Admin
 * @body   { url: string, saveAs?: boolean }
 * @desc   Firecrawl scrapes the URL, parses trek data, optionally saves as draft.
 */
router.post(
  '/scrape',
  authenticate,
  requireProvider,
  aiLimiter,
  validate(ScrapeUrlSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const { url, saveAs } = req.body as { url: string; saveAs?: boolean }

    if (saveAs) {
      const result = await firecrawlService.scrapeAndSave(url, authReq.user!.sub)
      return res.status(201).json(ok(result, 'Trek scraped and saved as draft'))
    }

    const scraped = await firecrawlService.scrapeUrl(url)
    res.json(ok(scraped, 'Trek data scraped successfully'))
  }),
)

// ─── Create Trek ──────────────────────────────────────────────────────────────

/**
 * @route  POST /treks
 * @access Provider | Admin
 */
router.post(
  '/',
  authenticate,
  requireProvider,
  validate(CreateTrekSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const trek = await trekService.create(req.body, authReq.user!.sub)
    res.status(201).json(ok(trek, 'Trek created successfully'))
  }),
)

// ─── Get Trek by Slug ─────────────────────────────────────────────────────────

/**
 * @route  GET /treks/:slug
 * @access Public
 */
router.get(
  '/:slug',
  catchAsync(async (req: Request, res: Response) => {
    const trek = await trekService.getBySlug(req.params.slug)
    res.json(ok(trek))
  }),
)

// ─── Update Trek ──────────────────────────────────────────────────────────────

/**
 * @route  PATCH /treks/:id
 * @access Provider (own trek) | Admin
 */
router.patch(
  '/:id',
  authenticate,
  requireProvider,
  validate(UpdateTrekSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const trek = await trekService.getById(req.params.id)

    // Providers may only update their own treks
    if (
      authReq.user!.role !== Role.ADMIN &&
      trek.provider?.id !== authReq.user!.sub
    ) {
      throw AppError.forbidden('You can only update your own treks')
    }

    const updated = await trekService.update(req.params.id, req.body)
    res.json(ok(updated, 'Trek updated'))
  }),
)

// ─── Delete Trek ──────────────────────────────────────────────────────────────

/**
 * @route  DELETE /treks/:id
 * @access Admin
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    await trekService.delete(req.params.id)
    res.json(ok(null, 'Trek deactivated'))
  }),
)

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

/**
 * @route  PATCH /treks/:id/publish
 * @access Admin
 * @body   { isPublished: boolean }
 */
router.patch(
  '/:id/publish',
  authenticate,
  requireAdmin,
  catchAsync(async (req: Request, res: Response) => {
    const { isPublished } = req.body as { isPublished: boolean }
    const result = await trekService.setPublished(req.params.id, Boolean(isPublished))
    res.json(ok(result, `Trek ${result.isPublished ? 'published' : 'unpublished'}`))
  }),
)

// ─── Add Availability ─────────────────────────────────────────────────────────

/**
 * @route  POST /treks/:id/availability
 * @access Provider (own trek) | Admin
 * @body   { startDate, totalSlots, priceUsd? }
 */
router.post(
  '/:id/availability',
  authenticate,
  requireProvider,
  validate(AvailabilitySchema),
  catchAsync(async (req: Request, res: Response) => {
    const slot = await trekService.addAvailability(req.params.id, req.body)
    res.status(201).json(ok(slot, 'Availability added'))
  }),
)

// ─── AI Summary ───────────────────────────────────────────────────────────────

/**
 * @route  GET /treks/:id/ai-summary
 * @access Public (rate limited)
 * @query  regenerate=true to force a fresh summary
 */
router.get(
  '/:id/ai-summary',
  aiLimiter,
  catchAsync(async (req: Request, res: Response) => {
    const regenerate = req.query.regenerate === 'true'
    const result = await trekService.getAiSummary(req.params.id, regenerate)
    res.json(ok(result))
  }),
)

// ─── Reviews ──────────────────────────────────────────────────────────────────

/**
 * @route  GET /treks/:slug/reviews
 * @access Public
 */
router.get(
  '/:slug/reviews',
  catchAsync(async (req: Request, res: Response) => {
    // Get trek by slug first to get the ID
    const trek = await trekService.getBySlug(req.params.slug)
    const page  = Number(req.query.page)  || 1
    const limit = Number(req.query.limit) || 10
    const result = await reviewService.listForTrek(trek.id, page, limit)
    res.json(ok(result))
  }),
)

/**
 * @route  POST /treks/:trekId/reviews
 * @access Authenticated
 * @body   CreateReviewSchema
 */
router.post(
  '/:trekId/reviews',
  authenticate,
  validate(CreateReviewSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const review = await reviewService.create(authReq.user!.sub, req.params.trekId, req.body)
    res.status(201).json(ok(review, 'Review submitted'))
  }),
)

/**
 * @route  PATCH /treks/reviews/:reviewId
 * @access Authenticated (owner)
 */
router.patch(
  '/reviews/:reviewId',
  authenticate,
  validate(UpdateReviewSchema),
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const review = await reviewService.update(req.params.reviewId, authReq.user!.sub, req.body)
    res.json(ok(review, 'Review updated'))
  }),
)

/**
 * @route  DELETE /treks/reviews/:reviewId
 * @access Authenticated (owner) | Admin
 */
router.delete(
  '/reviews/:reviewId',
  authenticate,
  catchAsync(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest
    const isAdmin = authReq.user!.role === Role.ADMIN
    await reviewService.delete(req.params.reviewId, authReq.user!.sub, isAdmin)
    res.json(ok(null, 'Review deleted'))
  }),
)

export default router
