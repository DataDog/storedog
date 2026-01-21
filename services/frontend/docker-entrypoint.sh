#!/bin/bash
set -e

# Replace RUM placeholders with actual values from environment variables
APP_ID="${NEXT_PUBLIC_DD_APPLICATION_ID:-DD_APPLICATION_ID_PLACEHOLDER}"
CLIENT_TOKEN="${NEXT_PUBLIC_DD_CLIENT_TOKEN:-DD_CLIENT_TOKEN_PLACEHOLDER}"
SERVICE="${NEXT_PUBLIC_DD_SERVICE_FRONTEND:-storedog-web}"
VERSION="${NEXT_PUBLIC_DD_VERSION_FRONTEND:-1.0.0}"
ENV="${NEXT_PUBLIC_DD_ENV:-development}"

echo "Injecting DD RUM config (App ID: ${APP_ID:0:8}..., Service: $SERVICE, Version: $VERSION, Env: $ENV)..."
find /app/.next -type f -name "*.js" -exec sed -i \
  -e "s/DD_APPLICATION_ID_PLACEHOLDER/$APP_ID/g" \
  -e "s/DD_CLIENT_TOKEN_PLACEHOLDER/$CLIENT_TOKEN/g" \
  -e "s/DD_SERVICE_PLACEHOLDER/$SERVICE/g" \
  -e "s/DD_VERSION_PLACEHOLDER/$VERSION/g" \
  -e "s/DD_ENV_PLACEHOLDER/$ENV/g" {} +

echo "Starting Next.js..."
exec "$@"
