/**
 * ExploreHimalaya — Server Entry Point
 *
 * Starts the HTTP server, connects to the database,
 * and handles graceful shutdown on SIGTERM / SIGINT.
 */

// env must be imported first so config is available everywhere
import './config/env'

import { createApp } from './app'
import { connectDB, disconnectDB } from './lib/prisma'
import { logger } from './lib/logger'
import { env } from './config/env'

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function bootstrap() {
  // 1. Connect to database
  await connectDB()

  // 2. Create Express app
  const app = createApp()

  // 3. Start listening
  const server = app.listen(env.PORT, () => {
    logger.info(`
╔══════════════════════════════════════════════════╗
║         🏔️  ExploreHimalaya API  🏔️              ║
╠══════════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(32)}║
║  Port        : ${String(env.PORT).padEnd(32)}║
║  API Prefix  : ${env.API_PREFIX.padEnd(32)}║
║  Health      : http://localhost:${env.PORT}/health${' '.repeat(14)}║
╚══════════════════════════════════════════════════╝
    `.trim())
  })

  // ─── Graceful shutdown ──────────────────────────────────────────────────────

  async function shutdown(signal: string) {
    logger.info(`${signal} received — shutting down gracefully…`)

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed')
      await disconnectDB()
      logger.info('Graceful shutdown complete')
      process.exit(0)
    })

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack:  reason instanceof Error ? reason.stack : undefined,
    })
    // In production: alert and exit so the process manager can restart
    if (env.NODE_ENV === 'production') {
      shutdown('unhandledRejection')
    }
  })

  // Catch uncaught synchronous exceptions
  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception — shutting down', { message: err.message, stack: err.stack })
    shutdown('uncaughtException')
  })
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { err })
  process.exit(1)
})
