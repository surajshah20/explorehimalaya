/**
 * ExploreHimalaya — Structured Logger (Winston)
 */
import winston from 'winston'
import { env } from '../config/env'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
    return `${timestamp} [${level}] ${message}${stack ? `\n${stack}` : ''}${metaStr}`
  }),
)

// JSON format for production (structured logs for aggregators)
const prodFormat = combine(timestamp(), errors({ stack: true }), json())

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    // Add file transports in production:
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
})

// Morgan stream adapter
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
}
