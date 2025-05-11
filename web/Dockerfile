FROM node:22-alpine AS base

ENV NODE_ENV=production
ENV DB_FILE_NAME="file:local.db" 

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
