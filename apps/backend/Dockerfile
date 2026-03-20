# Backend Dockerfile - Bun + Elysia + Prisma
# Single stage: install all deps (including devDeps for prisma CLI) and run with bun directly
FROM oven/bun:1
WORKDIR /app

# Install pnpm
RUN bun add -g pnpm

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Install ALL dependencies including devDeps (needed for prisma CLI)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/backend ./apps/backend
COPY packages ./packages

# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Push schema then start — pnpm exec finds prisma CLI from node_modules correctly
# DATABASE_URL is injected by docker-compose/Coolify at runtime
CMD ["sh", "-c", "pnpm exec prisma db push && bun run src/index.ts"]
