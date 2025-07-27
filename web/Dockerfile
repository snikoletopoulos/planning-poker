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

ENV DOCKER_BUILD=true

ARG DB_FILE_NAME
ENV DB_FILE_NAME=$DB_FILE_NAME
ARG APP_URL
ENV APP_URL=$APP_URL
ARG AUTH_SECRET
ENV AUTH_SECRET=$AUTH_SECRET
ARG UPDATER_INTERNAL_URL
ENV UPDATER_INTERNAL_URL=$UPDATER_INTERNAL_URL
ARG NEXT_PUBLIC_UPDATER_WS_URL
ENV NEXT_PUBLIC_UPDATER_WS_URL=$NEXT_PUBLIC_UPDATER_WS_URL
ARG NEXT_PUBLIC_UPDATER_HTTP_URL
ENV NEXT_PUBLIC_UPDATER_HTTP_URL=$NEXT_PUBLIC_UPDATER_HTTP_URL

# RUN pnpm db:migrate

RUN pnpm build

CMD ["pnpm", "dev"]

# FROM base AS runner
#
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs
#
# WORKDIR /app 
#
# COPY --from=builder /app/public ./public
#
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#
# EXPOSE 3000
#
# CMD ["node", "server.js"]
