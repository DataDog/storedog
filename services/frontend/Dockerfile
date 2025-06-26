FROM node:20 AS builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

# install datadog-ci 
RUN npm install -g @datadog/datadog-ci

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

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
