FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS builder

WORKDIR /app 

RUN apk update
RUN apk add --no-cache libc6-compat

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./ 

RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV DOCKER_BUILD=true
ENV NEXT_PUBLIC_UPDATER_WS_URL="ws://localhost:3001"
ENV NEXT_PUBLIC_UPDATER_HTTP_URL="http://localhost:3001"

RUN pnpm build

FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

WORKDIR /app 

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
