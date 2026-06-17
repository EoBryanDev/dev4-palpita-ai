FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY apps/scraper/package.json ./apps/scraper/package.json
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app /app
COPY . .
RUN pnpm --filter @palpita/scraper build

FROM base AS runtime
WORKDIR /app
COPY --from=build /app /app

ENV NODE_ENV=production
ENTRYPOINT ["node", "apps/scraper/dist/index.js"]
CMD ["run"]
