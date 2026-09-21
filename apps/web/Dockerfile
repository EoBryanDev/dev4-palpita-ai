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
# drizzle-kit/dotenv são devDeps (prune --prod remove): instala local.
FROM node:20-bookworm-slim AS migrator
WORKDIR /migrate
ENV NODE_ENV=production
COPY --from=pruner /pruned-db/package.json ./package.json
COPY --from=pruner /pruned-db/node_modules ./node_modules
# drizzle-kit/dotenv são devDeps (prune --prod remove): instala num prefixo
# isolado (npm não entende a árvore symlinked do pnpm, então nada de
# instalar dentro de /migrate/node_modules).
RUN npm install --prefix /opt/migrator-tools --no-save --no-audit --no-fund --no-package-lock drizzle-kit@0.22.8 dotenv@16.4.5
ENV NODE_PATH=/opt/migrator-tools/node_modules
COPY --from=pruner /app/packages/db/drizzle.config.ts ./drizzle.config.ts
COPY --from=pruner /app/packages/db/migrations ./migrations
CMD ["/opt/migrator-tools/node_modules/.bin/drizzle-kit", "migrate"]
