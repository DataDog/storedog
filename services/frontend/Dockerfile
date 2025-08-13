FROM node:20-alpine AS base

# Install system dependencies (this layer rarely changes)
RUN apk add --no-cache netcat-openbsd && \
    npm install -g @datadog/datadog-ci

# Set static environment variables (these don't change frequently)
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_ADS_ROUTE=/services/ads \
    NEXT_PUBLIC_DISCOUNTS_ROUTE=/services/discounts \
    NEXT_PUBLIC_DBM_ROUTE=/services/dbm \
    NEXT_PUBLIC_FRONTEND_API_ROUTE=http://service-proxy:80 \
    NEXT_PUBLIC_SPREE_API_HOST=http://service-proxy/services/backend \
    NEXT_PUBLIC_SPREE_CLIENT_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_IMAGE_HOST=/services/backend \
    NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN=service-proxy

WORKDIR /app

# Copy package files and install dependencies (changes less frequently)
COPY package*.json ./
RUN npm ci --include=dev

# Application stage
FROM base AS app
ARG NEXT_PUBLIC_DD_VERSION_FRONTEND=1.0.0
ENV NEXT_PUBLIC_DD_VERSION_FRONTEND=${NEXT_PUBLIC_DD_VERSION_FRONTEND}

# Copy source code (this changes frequently but is fast to copy)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
