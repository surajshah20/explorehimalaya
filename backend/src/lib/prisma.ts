/**
 * ExploreHimalaya — Prisma Client Singleton
 * Prevents multiple instances in development (hot-reload).
 */
import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  })

if (process.env.NODE_ENV === 'development') {
  // Log slow queries (> 200ms) in dev
  prisma.$on('query', (e) => {
    if (e.duration > 200) {
      logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
    }
  })

  global.__prisma = prisma
}

export async function connectDB() {
  try {
    await prisma.$connect()
    logger.info('🗄️  PostgreSQL connected via Prisma')
  } catch (err) {
    logger.error('Database connection failed', { err })
    process.exit(1)
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
  logger.info('🗄️  PostgreSQL disconnected')
}
