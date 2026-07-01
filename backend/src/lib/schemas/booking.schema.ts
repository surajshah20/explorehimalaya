/**
 * ExploreHimalaya — Booking & Review Validation Schemas (Zod)
 */
import { z } from 'zod'

// ─── Booking ──────────────────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  trekId:       z.string().cuid('Invalid trek ID'),
  startDate:    z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD')
    .refine(
      (d) => new Date(d) > new Date(),
      'Start date must be in the future',
    ),
  groupSize:    z.number().int().positive('Group size must be at least 1'),
  guestName:    z.string().min(2, 'Guest name is required'),
  guestEmail:   z.string().email('Valid guest email is required'),
  guestPhone:   z.string().optional(),
  specialNotes: z.string().max(1000).optional(),
})

export const UpdateBookingSchema = z.object({
  specialNotes: z.string().max(1000).optional(),
  guestPhone:   z.string().optional(),
})

export const CancelBookingSchema = z.object({
  cancellationNote: z.string().max(500).optional(),
})

export const BookingQuerySchema = z.object({
  page:   z.string().optional().transform(Number).pipe(z.number().int().positive().optional()),
  limit:  z.string().optional().transform(Number).pipe(z.number().int().positive().max(100).optional()),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED']).optional(),
})

// ─── Review ───────────────────────────────────────────────────────────────────

const ratingScore = z.number().int().min(1).max(5)

export const CreateReviewSchema = z.object({
  rating:          ratingScore,
  title:           z.string().min(5, 'Title must be at least 5 characters').max(200),
  body:            z.string().min(20, 'Review must be at least 20 characters').max(5000),
  sceneryRating:   ratingScore.optional().default(0),
  guideRating:     ratingScore.optional().default(0),
  valueRating:     ratingScore.optional().default(0),
  difficultyRating:ratingScore.optional().default(0),
})

export const UpdateReviewSchema = CreateReviewSchema.partial()

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>
export type CreateReviewInput  = z.infer<typeof CreateReviewSchema>
