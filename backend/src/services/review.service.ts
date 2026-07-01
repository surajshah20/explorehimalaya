/**
 * ExploreHimalaya — Review Service
 */
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { trekService } from './trek.service'
import { parsePagination, paginatedResult } from '../types'
import { CreateReviewInput } from '../lib/schemas/booking.schema'

const REVIEW_SELECT = {
  id: true, rating: true, title: true, body: true,
  sceneryRating: true, guideRating: true, valueRating: true, difficultyRating: true,
  isVerified: true, createdAt: true, updatedAt: true,
  user: { select: { id: true, name: true, avatar: true, nationality: true } },
  trek: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.ReviewSelect

export const reviewService = {
  /**
   * Create a review — one per user per trek.
   * Marks as verified if the user has a completed booking for this trek.
   */
  async create(userId: string, trekId: string, input: CreateReviewInput) {
    // Trek must exist
    const trek = await prisma.trek.findUnique({ where: { id: trekId }, select: { id: true } })
    if (!trek) throw AppError.notFound('Trek not found')

    // Duplicate check
    const existing = await prisma.review.findUnique({ where: { userId_trekId: { userId, trekId } } })
    if (existing) throw AppError.conflict('You have already reviewed this trek')

    // Check for a completed booking to set isVerified
    const completedBooking = await prisma.booking.findFirst({
      where: { userId, trekId, status: 'COMPLETED' },
      select: { id: true },
    })

    const review = await prisma.review.create({
      data: { ...input, userId, trekId, isVerified: !!completedBooking },
      select: REVIEW_SELECT,
    })

    // Update cached rating
    await trekService.recalcRating(trekId)
    return review
  },

  /**
   * List reviews for a trek.
   */
  async listForTrek(trekId: string, page = 1, limit = 10) {
    const { skip } = parsePagination({ page, limit, skip: (page - 1) * limit })

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { trekId, isVisible: true },
        select: REVIEW_SELECT,
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { trekId, isVisible: true } }),
    ])

    return paginatedResult(reviews, total, { page, limit, skip })
  },

  /**
   * Update a review (owner only).
   */
  async update(reviewId: string, userId: string, input: Partial<CreateReviewInput>) {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { userId: true, trekId: true } })
    if (!review) throw AppError.notFound('Review not found')
    if (review.userId !== userId) throw AppError.forbidden('You can only edit your own reviews')

    const updated = await prisma.review.update({
      where:  { id: reviewId },
      data:   input,
      select: REVIEW_SELECT,
    })

    await trekService.recalcRating(review.trekId)
    return updated
  },

  /**
   * Delete a review (owner or admin).
   */
  async delete(reviewId: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, select: { userId: true, trekId: true } })
    if (!review) throw AppError.notFound('Review not found')
    if (!isAdmin && review.userId !== userId) throw AppError.forbidden()

    await prisma.review.delete({ where: { id: reviewId } })
    await trekService.recalcRating(review.trekId)
  },
}
