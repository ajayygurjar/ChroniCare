# syntax=docker/dockerfile:1
# Build context: services/core-api
#   docker build -t chronicare/core-api services/core-api

FROM node:22-slim AS base
WORKDIR /app

# All dependencies (build tools included).
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Compile TypeScript. `npm run build` also generates the Prisma client; no database is needed for that.
# This stage also has the Prisma CLI, so it can run `npx prisma migrate deploy` as a one-off job.
FROM deps AS build
COPY prisma.config.ts tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build

# Production dependencies only. Note: @prisma/client 7.x depends on the Prisma CLI package, so the
# final image is large (~800 MB). Slimming it is a later optimisation, not a correctness issue.
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
