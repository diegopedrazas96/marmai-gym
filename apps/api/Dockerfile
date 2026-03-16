FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate

# ---- Stage 1: Prune the monorepo to only what the API needs ----
FROM base AS pruner
RUN npm install -g turbo@2
WORKDIR /app
COPY . .
RUN turbo prune @marmai/api --docker

# ---- Stage 2: Install dependencies and build ----
FROM base AS builder
WORKDIR /app

# Install deps from pruned lockfile first (better layer caching)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy full pruned source and build
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @marmai/api exec prisma generate
RUN pnpm --filter @marmai/api build

# Bundle only production dependencies (resolves workspace packages into real copies)
RUN pnpm --filter @marmai/api deploy --prod /prod

# ---- Stage 3: Lean production image ----
FROM node:20-alpine AS runner
WORKDIR /app

# Install Prisma CLI for running migrations at startup
RUN npm install -g prisma@5

# Copy bundled production node_modules from deploy stage
COPY --from=builder /prod/node_modules ./node_modules

# Copy compiled output, Prisma schema/migrations, and package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3001

# Run migrations then start the server
CMD ["sh", "-c", "prisma migrate deploy && node dist/main"]
