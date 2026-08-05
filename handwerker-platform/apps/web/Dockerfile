# Multi-stage build for the Next.js web app inside the pnpm/Turborepo monorepo.
# Build context must be the monorepo root (handwerker-platform/), e.g.:
#   docker build -f apps/web/Dockerfile -t handwerker-web .

# ---- base: node + pnpm + turbo ----------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN pnpm add -g turbo@2.10.4

# ---- prune: isolate the web app and its workspace deps ----------------------
FROM base AS pruner
WORKDIR /repo
COPY . .
RUN turbo prune @handwerker/web --docker

# ---- installer: install deps, then build ------------------------------------
FROM base AS installer
WORKDIR /repo
# Install dependencies (cached unless a package.json / lockfile changes).
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
# Copy the pruned source and build only what the web app needs.
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@handwerker/web

# ---- runner: minimal image with the standalone server -----------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Next.js standalone output already contains a minimal node_modules + server.js.
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
