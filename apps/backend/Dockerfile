# Backend Dockerfile - Bun + Elysia + Prisma
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/packages ./packages

# Copy source files
COPY apps/backend ./apps/backend
COPY packages ./packages
COPY pnpm-workspace.yaml ./

# Generate Prisma client
WORKDIR /app/apps/backend
RUN bunx prisma generate

# Build the backend
RUN bun build src/index.ts --outdir ./dist --target bun

# Production stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./

# Copy Prisma client from node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run dist/index.js"]
