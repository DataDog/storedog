FROM node:20 AS base

# Install system dependencies (this layer rarely changes)
RUN apt-get update && apt-get install -y netcat-openbsd && \
    npm install -g @datadog/datadog-ci && \
    rm -rf /var/lib/apt/lists/*

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
RUN npm ci --only=production=false

# Application stage
FROM base AS app
# Accept build arg for version (this is where frequent changes happen)
ARG NEXT_PUBLIC_DD_VERSION_FRONTEND=1.0.0
ENV NEXT_PUBLIC_DD_VERSION_FRONTEND=${NEXT_PUBLIC_DD_VERSION_FRONTEND}

# Copy source code (this changes frequently but is fast to copy)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
