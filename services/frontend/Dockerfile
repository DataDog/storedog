FROM node:20 AS builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

# install datadog-ci 
RUN npm install -g @datadog/datadog-ci

ARG DD_GIT_REPOSITORY_URL
ARG DD_GIT_COMMIT_SHA

# Set default environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
  NEXT_PUBLIC_ADS_ROUTE=/services/ads \
  NEXT_PUBLIC_DISCOUNTS_ROUTE=/services/discounts \
  NEXT_PUBLIC_DBM_ROUTE=/services/dbm \
  NEXT_PUBLIC_FRONTEND_API_ROUTE=http://service-proxy:80 \
  NEXT_PUBLIC_SPREE_API_HOST=http://service-proxy/services/backend \
  NEXT_PUBLIC_SPREE_CLIENT_HOST=/services/backend \
  NEXT_PUBLIC_SPREE_IMAGE_HOST=/services/backend \
  NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN=service-proxy \
  DD_GIT_REPOSITORY_URL=${DD_GIT_REPOSITORY_URL} \
  DD_GIT_COMMIT_SHA=${DD_GIT_COMMIT_SHA}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
