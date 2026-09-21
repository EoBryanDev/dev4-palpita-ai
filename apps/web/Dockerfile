# Imagem da web (Next.js standalone) + migrator Drizzle.
# Build: docker buildx build --platform linux/arm64 -f apps/web/Dockerfile .
# (nodes do cluster são ARM; build sempre a partir da raiz do monorepo)
FROM node:20-bookworm-slim AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

FROM base AS pruner
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter=@palpita/web... build
RUN pnpm --filter=@palpita/web --prod deploy --legacy /pruned-web
RUN pnpm --filter=@palpita/db --prod deploy --legacy /pruned-db

# ---- runner: Next.js standalone ----
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs
COPY --from=pruner --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=pruner --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=pruner --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
# Fallback de resolução de path (standalone resolve .next/* relativo ao CWD
# em algumas versões): duplica nos dois layouts candidatos. Custo: poucos MB.
COPY --from=pruner --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static
COPY --from=pruner --chown=nextjs:nodejs /app/apps/web/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

# ---- migrator: drizzle-kit migrate (usado pelo Job pre-deploy) ----
# ---- migrator: aplica migrations com o próprio drizzle-orm do app ----
# (drizzle-kit 0.22.x exige orm mais novo que o 0.31.x do app; via orm não
# há mismatch possível). Roda: DATABASE_URL=... node migrate.prod.mjs
FROM node:20-bookworm-slim AS migrator
WORKDIR /migrate
ENV NODE_ENV=production
COPY --from=pruner /pruned-db/package.json ./package.json
COPY --from=pruner /pruned-db/node_modules ./node_modules
COPY --from=pruner /app/packages/db/migrations ./migrations
COPY --from=pruner /app/packages/db/migrate.prod.mjs ./migrate.prod.mjs
CMD ["node", "migrate.prod.mjs"]
