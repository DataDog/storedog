FROM node:20 AS builder

# install wait-for-it
RUN apt-get update && apt-get install -y wait-for-it

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
  OTEL_TRACES_EXPORTER=console,otlp \
  OTEL_METRICS_EXPORTER=console,otlp \
  OTEL_LOGS_EXPORTER=console,otlp \
  OTEL_EXPORTER_OTLP_ENDPOINT=http://otelcol:4317 \
  OTEL_NODE_RESOURCE_DETECTORS=env,host,os \
  OTEL_SERVICE_NAME=frontend

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000

ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
CMD ["sh", "-c", "npx next start"]