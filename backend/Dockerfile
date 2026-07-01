# ExploreHimalaya API — Production Dockerfile
# Multi-stage build for minimal final image

# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

COPY src ./src

RUN npm run build

# ─── Stage 3: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nodeapp

ENV NODE_ENV=production

# Copy built output and production deps
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist

# Create uploads directory
RUN mkdir -p uploads && chown nodeapp:nodejs uploads

USER nodeapp

EXPOSE 4000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
