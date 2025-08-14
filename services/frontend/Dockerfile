FROM node:20-alpine AS base

# This comes form https://github.com/vercel/next.js/blob/canary/examples/with-docker-compose/next-app/prod.Dockerfile

# Install system dependencies (this layer rarely changes)
RUN apk add --no-cache netcat-openbsd && \
    npm install -g @datadog/datadog-ci


FROM base AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_ADS_ROUTE=/services/ads \
    NEXT_PUBLIC_DISCOUNTS_ROUTE=/services/discounts \
    NEXT_PUBLIC_DBM_ROUTE=/services/dbm \
    NEXT_PUBLIC_FRONTEND_API_ROUTE=http://service-proxy:80 \
    NEXT_PUBLIC_SPREE_API_HOST=http://service-proxy/services/backend \
    NEXT_PUBLIC_SPREE_CLIENT_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_IMAGE_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN=service-proxy

ARG NEXT_PUBLIC_DD_VERSION_FRONTEND
ENV NEXT_PUBLIC_DD_VERSION_FRONTEND=${NEXT_PUBLIC_DD_VERSION_FRONTEND}

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_ADS_ROUTE=/services/ads \
    NEXT_PUBLIC_DISCOUNTS_ROUTE=/services/discounts \
    NEXT_PUBLIC_DBM_ROUTE=/services/dbm \
    NEXT_PUBLIC_FRONTEND_API_ROUTE=http://service-proxy:80 \
    NEXT_PUBLIC_SPREE_API_HOST=http://service-proxy/services/backend \
    NEXT_PUBLIC_SPREE_CLIENT_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_IMAGE_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN=service-proxy

ARG NEXT_PUBLIC_DD_VERSION_FRONTEND
ENV NEXT_PUBLIC_DD_VERSION_FRONTEND=${NEXT_PUBLIC_DD_VERSION_FRONTEND}

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]