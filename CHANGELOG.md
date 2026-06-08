# Storedog changelog

Notable repo-level infrastructure and tooling changes are documented here.
Service-specific changes live in each service's own `CHANGELOG.md`.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Frontend Docker overhaul

- Compose (`docker-compose.yml`, `docker-compose.dev.yml`) now builds the frontend from its multi-stage Dockerfile (dev uses `target: development`) and drops the `wait-for-it` / `${FRONTEND_COMMAND}` startup command.
- Standardized the frontend service's Datadog environment variables on the `NEXT_PUBLIC_DD_*` naming, and removed the obsolete `FRONTEND_COMMAND` entry from `.env.template`.

### Docker Compose healthchecks

- Replaced `wait-for-it`-based startup ordering with container `healthcheck` blocks across all services and `depends_on` `condition: service_healthy`/`service_started` gating in both compose files.
- Removed the `wait-for-it` package from the backend, ads (Python), and discounts Dockerfiles (adding `netcat-openbsd` where the healthcheck needs `nc`).
- Backend gains a `.dockerignore`, and `services/backend/config/database.yml` now reads `POSTGRES_USER`/`POSTGRES_PASSWORD` from the environment.
