#!/bin/bash
set -e

# Replace RUM placeholders with actual values from environment variables
# Application ID
APP_ID="${NEXT_PUBLIC_DD_APPLICATION_ID:-DD_APPLICATION_ID_PLACEHOLDER}"
echo "Setting DD Application ID..."
find /app/.next -type f -name "*.js" -exec sed -i "s/DD_APPLICATION_ID_PLACEHOLDER/$APP_ID/g" {} +

# Client Token
CLIENT_TOKEN="${NEXT_PUBLIC_DD_CLIENT_TOKEN:-DD_CLIENT_TOKEN_PLACEHOLDER}"
echo "Setting DD Client Token..."
find /app/.next -type f -name "*.js" -exec sed -i "s/DD_CLIENT_TOKEN_PLACEHOLDER/$CLIENT_TOKEN/g" {} +

# Service name
SERVICE="${NEXT_PUBLIC_DD_SERVICE_FRONTEND:-storedog-web}"
echo "Setting DD Service: $SERVICE"
find /app/.next -type f -name "*.js" -exec sed -i "s/DD_SERVICE_PLACEHOLDER/$SERVICE/g" {} +

# Version
VERSION="${NEXT_PUBLIC_DD_VERSION_FRONTEND:-1.0.0}"
echo "Setting DD Version: $VERSION"
find /app/.next -type f -name "*.js" -exec sed -i "s/DD_VERSION_PLACEHOLDER/$VERSION/g" {} +

# Environment
ENV="${NEXT_PUBLIC_DD_ENV:-development}"
echo "Setting DD Env: $ENV"
find /app/.next -type f -name "*.js" -exec sed -i "s/DD_ENV_PLACEHOLDER/$ENV/g" {} +

echo "Starting Next.js..."
exec "$@"
