FROM mcr.microsoft.com/playwright:v1.61.0-jammy AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/scraper/package.json ./apps/scraper/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter=@palpita/scraper... build
RUN pnpm --filter=@palpita/scraper --prod deploy --legacy /pruned

FROM base AS runtime
WORKDIR /app
COPY --from=builder /pruned /app

ENV NODE_ENV=production
ENV SCRAPER_ENGINE=playwright
ENTRYPOINT ["node", "--import", "tsx", "src/index.ts"]
CMD ["watch"]
