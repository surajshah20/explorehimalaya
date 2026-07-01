/**
 * ExploreHimalaya — Error Utilities
 */

/** Typed HTTP error with status code */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly errors?: Record<string, string[]>

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = true
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(msg: string, errors?: Record<string, string[]>) {
    return new AppError(msg, 400, errors)
  }
  static unauthorized(msg = 'Unauthorized') {
    return new AppError(msg, 401)
  }
  static forbidden(msg = 'Forbidden') {
    return new AppError(msg, 403)
  }
  static notFound(msg = 'Resource not found') {
    return new AppError(msg, 404)
  }
  static conflict(msg: string) {
    return new AppError(msg, 409)
  }
  static tooMany(msg = 'Too many requests') {
    return new AppError(msg, 429)
  }
  static internal(msg = 'Internal server error') {
    return new AppError(msg, 500)
  }
}

/** Wraps async route handlers to forward errors to Express error middleware */
import { Request, Response, NextFunction, RequestHandler } from 'express'

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export const catchAsync =
  (fn: AsyncHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
