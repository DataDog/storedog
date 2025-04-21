FROM node:20 AS builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

# install datadog-ci 
RUN npm install -g @datadog/datadog-ci
# Set default environment variables
ENV DD_ENV=development \
  DD_VERSION=1.0.0 \
  DD_SERVICE=store-frontend \
  NODE_ENV=development \
  NEXT_PUBLIC_DD_SITE=datadoghq.com \
  NEXT_PUBLIC_DD_SERVICE_FRONTEND=store-frontend \
  NEXT_PUBLIC_DD_ENV=development \
  NEXT_PUBLIC_ADS_ROUTE=/services/ads \
  NEXT_PUBLIC_DISCOUNTS_ROUTE=/services/discounts \
  NEXT_PUBLIC_DBM_ROUTE=/services/dbm \
  NEXT_PUBLIC_FRONTEND_API_ROUTE=http://nginx:80 \
  NEXT_PUBLIC_SPREE_API_HOST=http://nginx/services/backend \
  NEXT_PUBLIC_SPREE_CLIENT_HOST=/services/backend \
  NEXT_PUBLIC_SPREE_IMAGE_HOST=/services/backend \
  NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN=nginx 

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
