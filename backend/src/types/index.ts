/**
 * ExploreHimalaya — Shared Types & API Response Helpers
 */
import { Request } from 'express'
import { UserRole as Role } from '@prisma/client'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string      // userId
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: Record<string, unknown>
}

/** Build a success response envelope */
export function ok<T>(data: T, message?: string, meta?: Record<string, unknown>): ApiResponse<T> {
  return { success: true, data, ...(message && { message }), ...(meta && { meta }) }
}

/** Build an error response envelope */
export function fail(message: string, errors?: Record<string, string[]>): ApiResponse<null> {
  return { success: false, data: null, message, ...(errors && { errors }) }
}

// ─── Pagination helper ────────────────────────────────────────────────────────

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page  = Math.max(1, Number(query.page)  || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
  return { page, limit, skip: (page - 1) * limit }
}

export function paginatedResult<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit)
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}
