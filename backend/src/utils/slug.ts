/**
 * ExploreHimalaya — Slug Generator
 */
import slugify from 'slugify'
import { prisma } from '../lib/prisma'

/**
 * Generate a unique URL slug for a trek.
 * If "everest-base-camp" already exists, returns "everest-base-camp-2", etc.
 */
export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, trim: true })

  let slug = base
  let counter = 1

  while (true) {
    const existing = await prisma.trek.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true },
    })
    if (!existing) break
    slug = `${base}-${++counter}`
  }

  return slug
}

/** Format a booking reference (e.g. EH-2024-ABCD1234) */
export function formatBookingRef(raw: string): string {
  return `EH-${new Date().getFullYear()}-${raw.slice(-8).toUpperCase()}`
}
