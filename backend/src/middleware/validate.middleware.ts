/**
 * ExploreHimalaya — Zod Request Validation Middleware
 */
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { AppError } from '../utils/errors'

type RequestPart = 'body' | 'query' | 'params'

/**
 * `validate(schema, part?)` — validates the given request part against a Zod schema.
 *
 * @example
 *   router.post('/treks', authenticate, validate(CreateTrekSchema), createTrek)
 */
export const validate =
  (schema: ZodSchema, part: RequestPart = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part])

    if (!result.success) {
      const fieldErrors = formatZodErrors(result.error)
      return next(
        AppError.badRequest('Validation failed', fieldErrors),
      )
    }

    // Replace the original data with the parsed (coerced) version
    req[part] = result.data
    next()
  }

/** Flatten Zod errors into { fieldName: ['message', ...] } */
export function formatZodErrors(err: ZodError): Record<string, string[]> {
  return err.errors.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path.join('.') || 'root'
    if (!acc[field]) acc[field] = []
    acc[field].push(issue.message)
    return acc
  }, {})
}
