/**
 * ExploreHimalaya — Booking Service
 */
import { BookingStatus, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../utils/errors'
import { parsePagination, paginatedResult } from '../types'
import { CreateBookingInput } from '../lib/schemas/booking.schema'
import { formatBookingRef } from '../utils/slug'
import { logger } from '../lib/logger'

const BOOKING_SELECT = {
  id: true, reference: true, startDate: true, groupSize: true,
  totalPrice: true, currency: true, status: true, paymentStatus: true,
  guestName: true, guestEmail: true, guestPhone: true, specialNotes: true,
  cancelledAt: true, cancellationNote: true, createdAt: true, updatedAt: true,
  trek: {
    select: {
      id: true, slug: true, name: true, region: true, difficulty: true,
      durationDays: true, coverImage: true, maxAltitude: true,
    },
  },
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.BookingSelect

export const bookingService = {
  /**
   * Create a booking — checks availability and locks slots atomically.
   */
  async create(userId: string, input: CreateBookingInput) {
    const trek = await prisma.trek.findUnique({
      where: { id: input.trekId, isActive: true, isPublished: true },
      select: {
        id: true, name: true, priceUsd: true, maxGroupSize: true, minGroupSize: true, durationDays: true,
      },
    })
    if (!trek) throw AppError.notFound('Trek not found or not available for booking')

    // Validate group size
    if (input.groupSize < trek.minGroupSize) {
      throw AppError.badRequest(`Minimum group size for this trek is ${trek.minGroupSize}`)
    }
    if (input.groupSize > trek.maxGroupSize) {
      throw AppError.badRequest(`Maximum group size for this trek is ${trek.maxGroupSize}`)
    }

    const startDate = new Date(input.startDate)

    // Find matching availability window (if exists)
    const availability = await prisma.availability.findFirst({
      where: {
        trekId:    input.trekId,
        startDate: startDate,
        isActive:  true,
      },
    })

    // Check slots
    if (availability) {
      const remaining = availability.totalSlots - availability.bookedSlots
      if (remaining < input.groupSize) {
        throw AppError.conflict(
          `Only ${remaining} slot${remaining === 1 ? '' : 's'} remaining for this date`,
        )
      }
    }

    // Determine price (availability can override base trek price)
    const unitPrice    = Number(availability?.priceUsd ?? trek.priceUsd)
    const totalPrice   = unitPrice * input.groupSize
    const rawReference = crypto.randomUUID()

    // Transactional: create booking + update slots
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          reference:      formatBookingRef(rawReference),
          userId,
          trekId:         input.trekId,
          availabilityId: availability?.id,
          startDate,
          groupSize:      input.groupSize,
          totalPrice,
          currency:       'USD',
          status:         BookingStatus.CONFIRMED,
          guestName:      input.guestName,
          guestEmail:     input.guestEmail,
          guestPhone:     input.guestPhone,
          specialNotes:   input.specialNotes,
        },
        select: BOOKING_SELECT,
      })

      if (availability) {
        await tx.availability.update({
          where: { id: availability.id },
          data:  { bookedSlots: { increment: input.groupSize } },
        })
      }

      return b
    })

    logger.info('Booking confirmed', {
      bookingId: booking.id,
      reference: booking.reference,
      userId,
      trekId: input.trekId,
      totalPrice,
    })

    return booking
  },

  /**
   * List bookings for a specific user.
   */
  async listForUser(userId: string, filters: { page?: number; limit?: number; status?: BookingStatus }) {
    const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit })
    const where: Prisma.BookingWhereInput = {
      userId,
      ...(filters.status && { status: filters.status }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select:  BOOKING_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return paginatedResult(bookings, total, { page, limit, skip })
  },

  /**
   * Admin: list all bookings.
   */
  async listAll(filters: { page?: number; limit?: number; status?: BookingStatus; trekId?: string }) {
    const { page, limit, skip } = parsePagination({ page: filters.page, limit: filters.limit })
    const where: Prisma.BookingWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.trekId && { trekId: filters.trekId }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select:  BOOKING_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    return paginatedResult(bookings, total, { page, limit, skip })
  },

  /**
   * Get one booking by ID — validates ownership unless admin.
   */
  async getById(bookingId: string, userId: string, isAdmin = false) {
    const booking = await prisma.booking.findUnique({
      where:  { id: bookingId },
      select: BOOKING_SELECT,
    })
    if (!booking) throw AppError.notFound('Booking not found')
    if (!isAdmin && booking.user.id !== userId) throw AppError.forbidden()
    return booking
  },

  /**
   * Cancel a booking — releases availability slots.
   */
  async cancel(bookingId: string, userId: string, note?: string, isAdmin = false) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, userId: true, status: true, groupSize: true, availabilityId: true, startDate: true },
    })
    if (!booking) throw AppError.notFound('Booking not found')
    if (!isAdmin && booking.userId !== userId) throw AppError.forbidden()

    if (booking.status === BookingStatus.CANCELLED) {
      throw AppError.conflict('Booking is already cancelled')
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw AppError.conflict('Cannot cancel a completed booking')
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status:           BookingStatus.CANCELLED,
          cancelledAt:      new Date(),
          cancellationNote: note,
        },
      })

      // Release slots
      if (booking.availabilityId) {
        await tx.availability.update({
          where: { id: booking.availabilityId },
          data:  { bookedSlots: { decrement: booking.groupSize } },
        })
      }
    })

    logger.info('Booking cancelled', { bookingId, userId, isAdmin })
  },

  /**
   * Admin: update booking status.
   */
  async updateStatus(bookingId: string, status: BookingStatus) {
    return prisma.booking.update({
      where:  { id: bookingId },
      data:   { status },
      select: { id: true, reference: true, status: true },
    })
  },
}
