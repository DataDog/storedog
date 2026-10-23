#!/bin/bash
# Disposable local functional checks; these are not native-AMD64 scenario acceptance.
set -euo pipefail
root=$(cd "$(dirname "$0")/../../.." && pwd)
name="pup-test-$$"
image=${PUP_TEST_IMAGE:-ghcr.io/datadog/storedog/backend@sha256:c681ffd0e252f684a411832f3089c64a354e6c5a0eac93630ce53065997fe1e0}
cleanup() {
  docker rm -f "$name-backend" "$name-db" "$name-redis" >/dev/null 2>&1 || true
  docker network rm "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM
docker network create "$name" >/dev/null
docker run -d --name "$name-db" --network "$name" -e POSTGRES_PASSWORD=postgres -v "$root/services/postgres/db/restore.sql:/docker-entrypoint-initdb.d/restore.sql:ro" postgres:17 >/dev/null
docker run -d --name "$name-redis" --network "$name" --network-alias redis redis:7 >/dev/null
ready=0
for _ in $(seq 1 60); do
  if docker exec "$name-db" psql -U postgres -d storedog_db -Atc 'select count(*) from spree_products' >/dev/null 2>&1; then ready=1;break;fi
  sleep 2
done
[[ $ready == 1 ]]
docker run --rm --name "$name-backend" --network "$name" -e DB_HOST="$name-db" -e DD_TRACE_ENABLED=false \
  -e PUP_DB_STATEMENT_TIMEOUT_MS=5000 -e PUP_DB_LOCK_TIMEOUT_MS=1000 -e PUP_DB_CONNECT_TIMEOUT=3 \
  -v "$root/services/backend/lib/pup_course:/app/lib/pup_course:ro" \
  -v "$root/services/backend/config/database.yml:/app/config/database.yml:ro" \
  "$image" bash -c 'ruby /app/lib/pup_course/verify_default.rb && bundle exec rails runner /app/lib/pup_course/verify.rb'
