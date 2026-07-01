/**
 * ExploreHimalaya — Trek Validation Schemas (Zod)
 */
import { z } from 'zod'
import { Difficulty } from '@prisma/client'

const ItineraryDaySchema = z.object({
  day:           z.number().int().positive(),
  title:         z.string().min(3).max(200),
  description:   z.string().min(10),
  altitudeM:     z.number().int().positive(),
  distanceKm:    z.number().int().nonnegative(),
  accommodation: z.string().min(2),
})

export const CreateTrekSchema = z.object({
  name:         z.string().min(3, 'Trek name must be at least 3 characters').max(200),
  description:  z.string().min(50, 'Description must be at least 50 characters'),
  region:       z.string().min(2).max(100),
  difficulty:   z.nativeEnum(Difficulty),
  durationDays: z.number().int().positive('Duration must be a positive number'),
  maxAltitude:  z.number().int().positive(),
  distanceKm:   z.number().int().positive(),
  priceUsd:     z.number().positive('Price must be positive'),
  maxGroupSize: z.number().int().min(1).max(50).default(12),
  minGroupSize: z.number().int().min(1).default(1),
  startPoint:   z.string().min(2),
  endPoint:     z.string().min(2),
  bestSeasons:  z.array(z.string()).min(1, 'At least one best season is required'),
  highlights:   z.array(z.string()).min(1).max(20),
  includes:     z.array(z.string()).min(1),
  excludes:     z.array(z.string()).default([]),
  coverImage:   z.string().url('Cover image must be a valid URL').optional(),
  images:       z.array(z.string().url()).default([]),
  itinerary:    z.array(ItineraryDaySchema).optional(),
  isPublished:  z.boolean().default(false),
})

export const UpdateTrekSchema = CreateTrekSchema.partial()

export const TrekQuerySchema = z.object({
  page:        z.string().optional().transform(v => v ? Number(v) : undefined),
  limit:       z.string().optional().transform(v => v ? Number(v) : undefined),
  region:      z.string().optional(),
  difficulty:  z.nativeEnum(Difficulty).optional(),
  minPrice:    z.string().optional().transform(v => v ? Number(v) : undefined),
  maxPrice:    z.string().optional().transform(v => v ? Number(v) : undefined),
  minDuration: z.string().optional().transform(v => v ? Number(v) : undefined),
  maxDuration: z.string().optional().transform(v => v ? Number(v) : undefined),
  search:      z.string().optional(),
  sortBy:      z.enum(['price', 'rating', 'duration', 'createdAt']).optional().default('createdAt'),
  sortOrder:   z.enum(['asc', 'desc']).optional().default('desc'),
  published:   z.string().optional().transform(v => v === 'true'),
})

export const AvailabilitySchema = z.object({
  startDate:  z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  totalSlots: z.number().int().positive(),
  priceUsd:   z.number().positive().optional(),
})

export const ScrapeUrlSchema = z.object({
  url:    z.string().url('Must be a valid URL'),
  saveAs: z.boolean().default(false), // whether to auto-save the scraped trek
})

export type CreateTrekInput      = z.infer<typeof CreateTrekSchema>
export type UpdateTrekInput      = z.infer<typeof UpdateTrekSchema>
export type TrekQueryInput       = z.infer<typeof TrekQuerySchema>
export type AvailabilityInput    = z.infer<typeof AvailabilitySchema>
