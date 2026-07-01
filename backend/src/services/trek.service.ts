/**
 * ExploreHimalaya — Trek Service
 */
import { Difficulty, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { generateUniqueSlug } from '../utils/slug'
import { parsePagination, paginatedResult } from '../types'
import { CreateTrekInput, UpdateTrekInput } from '../lib/schemas/trek.schema'
import { logger } from '../lib/logger'

// ─── Query helpers ────────────────────────────────────────────────────────────

interface TrekFilters {
  page?: number
  limit?: number
  region?: string
  difficulty?: Difficulty
  minPrice?: number
  maxPrice?: number
  minDuration?: number
  maxDuration?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  published?: boolean
  providerId?: string
}

function buildWhereClause(filters: TrekFilters): Prisma.TrekWhereInput {
  const where: Prisma.TrekWhereInput = {}

  if (filters.region)     where.region     = { equals: filters.region, mode: 'insensitive' }
  if (filters.difficulty) where.difficulty = filters.difficulty
  if (filters.providerId) where.providerId = filters.providerId
  if (typeof filters.published === 'boolean') where.isPublished = filters.published

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.priceUsd = {}
    if (filters.minPrice !== undefined) where.priceUsd.gte = filters.minPrice
    if (filters.maxPrice !== undefined) where.priceUsd.lte = filters.maxPrice
  }

  if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
    where.durationDays = {}
    if (filters.minDuration !== undefined) where.durationDays.gte = filters.minDuration
    if (filters.maxDuration !== undefined) where.durationDays.lte = filters.maxDuration
  }

  if (filters.search) {
    where.OR = [
      { name:        { contains: filters.search, mode: 'insensitive' } },
      { region:      { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return where
}

const TREK_LIST_SELECT = {
  id: true, slug: true, name: true, region: true, difficulty: true,
  durationDays: true, maxAltitude: true, distanceKm: true, priceUsd: true,
  maxGroupSize: true, minGroupSize: true, coverImage: true, images: true,
  highlights: true, bestSeasons: true, avgRating: true, reviewCount: true,
  isPublished: true, createdAt: true,
  provider: { select: { id: true, name: true, avatar: true } },
} satisfies Prisma.TrekSelect

const TREK_FULL_SELECT = {
  ...TREK_LIST_SELECT,
  description: true, aiSummary: true, startPoint: true, endPoint: true,
  includes: true, excludes: true, sourceUrl: true, updatedAt: true,
  itinerary: { orderBy: { day: 'asc' as const } },
  availabilities: {
    where:   { isActive: true, startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' as const },
    take: 12,
  },
} satisfies Prisma.TrekSelect

// ─── Service ──────────────────────────────────────────────────────────────────

export const trekService = {
  /**
   * List treks with filtering, sorting, and pagination.
   */
  async list(filters: TrekFilters) {
    const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit })
    const where = buildWhereClause(filters)

    const sortField = (['price', 'rating', 'duration', 'createdAt'].includes(filters.sortBy ?? '')
      ? { price: 'priceUsd', rating: 'avgRating', duration: 'durationDays', createdAt: 'createdAt' }[filters.sortBy!]
      : 'createdAt') as string

    const [treks, total] = await Promise.all([
      prisma.trek.findMany({
        where,
        select: TREK_LIST_SELECT,
        orderBy: { [sortField]: filters.sortOrder ?? 'desc' },
        skip,
        take: limit,
      }),
      prisma.trek.count({ where }),
    ])

    return paginatedResult(treks, total, { page, limit, skip })
  },

  /**
   * Get a single trek by slug (public-facing).
   */
  async getBySlug(slug: string) {
    const trek = await prisma.trek.findFirst({
      where: { slug, isActive: true },
      select: TREK_FULL_SELECT,
    })
    if (!trek) throw AppError.notFound(`Trek "${slug}" not found`)
    return trek
  },

  /**
   * Get a single trek by ID (admin/provider use).
   */
  async getById(id: string) {
    const trek = await prisma.trek.findUnique({
      where: { id },
      select: TREK_FULL_SELECT,
    })
    if (!trek) throw AppError.notFound('Trek not found')
    return trek
  },

  /**
   * Create a new trek.
   */
  async create(input: CreateTrekInput, providerId: string) {
    const slug = await generateUniqueSlug(input.name)

    const { itinerary, ...trekData } = input

    const trek = await prisma.trek.create({
      data: {
        ...trekData,
        priceUsd:   input.priceUsd,
        slug,
        providerId,
        ...(itinerary && {
          itinerary: { create: itinerary },
        }),
      },
      select: TREK_FULL_SELECT,
    })

    logger.info('Trek created', { trekId: trek.id, name: trek.name, providerId })
    return trek
  },

  /**
   * Update a trek.
   */
  async update(id: string, input: UpdateTrekInput) {
    const existing = await prisma.trek.findUnique({ where: { id }, select: { id: true, name: true } })
    if (!existing) throw AppError.notFound('Trek not found')

    const data: Prisma.TrekUpdateInput = { ...input }

    // Regenerate slug if name changed
    if (input.name && input.name !== existing.name) {
      data.slug = await generateUniqueSlug(input.name, id)
    }

    // Replace itinerary if supplied
    if (input.itinerary) {
      await prisma.itineraryDay.deleteMany({ where: { trekId: id } })
      data.itinerary = { create: input.itinerary }
    }

    return prisma.trek.update({
      where:  { id },
      data,
      select: TREK_FULL_SELECT,
    })
  },

  /**
   * Soft-delete a trek.
   */
  async delete(id: string) {
    await prisma.trek.update({
      where: { id },
      data:  { isActive: false, isPublished: false },
    })
    logger.info('Trek soft-deleted', { trekId: id })
  },

  /**
   * Publish / unpublish.
   */
  async setPublished(id: string, isPublished: boolean) {
    return prisma.trek.update({
      where:  { id },
      data:   { isPublished },
      select: { id: true, slug: true, isPublished: true },
    })
  },

  /**
   * Add availability dates.
   */
  async addAvailability(trekId: string, data: { startDate: string; totalSlots: number; priceUsd?: number }) {
    const trek = await prisma.trek.findUnique({
      where: { id: trekId },
      select: { durationDays: true },
    })
    if (!trek) throw AppError.notFound('Trek not found')

    const startDate = new Date(data.startDate)
    const endDate   = new Date(startDate)
    endDate.setDate(endDate.getDate() + trek.durationDays)

    return prisma.availability.upsert({
      where:  { trekId_startDate: { trekId, startDate } },
      create: { trekId, startDate, endDate, totalSlots: data.totalSlots, priceUsd: data.priceUsd },
      update: { totalSlots: data.totalSlots, priceUsd: data.priceUsd, isActive: true },
    })
  },

  /**
   * Update cached rating stats (called after review create/update/delete).
   */
  async recalcRating(trekId: string) {
    const stats = await prisma.review.aggregate({
      where:   { trekId, isVisible: true },
      _avg:    { rating: true },
      _count:  { rating: true },
    })
    await prisma.trek.update({
      where: { id: trekId },
      data: {
        avgRating:   stats._avg.rating ?? 0,
        reviewCount: stats._count.rating,
      },
    })
  },

  /**
   * Generate or return AI summary.
   */
  async getAiSummary(trekId: string, regenerate = false) {
    const trek = await prisma.trek.findUnique({
      where: { id: trekId },
      select: { id: true, name: true, region: true, difficulty: true, durationDays: true,
                maxAltitude: true, distanceKm: true, highlights: true, aiSummary: true },
    })
    if (!trek) throw AppError.notFound('Trek not found')
    if (trek.aiSummary && !regenerate) return { summary: trek.aiSummary, cached: true }

    // In production: call Anthropic API here
    const summary = generateMockSummary(trek)

    await prisma.trek.update({ where: { id: trekId }, data: { aiSummary: summary } })
    return { summary, cached: false }
  },
}

// ─── Mock AI summary (replace with real Anthropic API call) ──────────────────

function generateMockSummary(trek: {
  name: string; region: string; difficulty: string; durationDays: number;
  maxAltitude: number; distanceKm: number; highlights: string[]
}): string {
  const difficultyNotes: Record<string, string> = {
    EASY:        'suitable for beginners with basic fitness',
    MODERATE:    'ideal for trekkers with some hiking experience',
    CHALLENGING: 'recommended for experienced hikers with strong fitness',
    EXTREME:     'reserved for seasoned mountaineers only',
  }

  const highlightStr = trek.highlights.slice(0, 3).join(', ')
  const note = difficultyNotes[trek.difficulty] ?? 'suitable for most trekkers'

  return (
    `The ${trek.name} is a ${trek.durationDays}-day ${trek.difficulty.toLowerCase()} trek ` +
    `in Nepal's ${trek.region} region, covering ${trek.distanceKm}km and reaching ` +
    `${trek.maxAltitude.toLocaleString()}m at its highest point. ` +
    `This route is ${note}. ` +
    `Key highlights include ${highlightStr}. ` +
    `Proper acclimatization, quality gear, and a certified local guide are strongly recommended ` +
    `for a safe and rewarding experience.`
  )
}
