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

### Compose transformation tooling

- Added `scripts/transform_compose.py` and `scripts/transform_compose_frontend.py` to generate a production compose configuration from the development compose file (image swaps, `development` -> `production` targets, frontend build -> image, comment stripping).
- Added `unittest`-based coverage in `scripts/test_transform_compose.py` and `scripts/test_transform_compose_frontend.py`.

### Makefile and documentation

- Refactored the `Makefile`: ENV-based selection of the compose file, `prepare-release` and no-cache build targets, and improved help output (wired to the compose transformation scripts).
- Restructured docs: trimmed the root `README.md`, moved feature descriptions into `FEATURES.md`, and added/updated per-service READMEs (`ads`, `backend`, `discounts`, new `nginx`, new `postgres`).
- Reworked `.env.template` and added `.env.development.template` for faster local setup; tidied `.gitignore`.
- Bumped backend gems in `Gemfile.lock` (`datadog-ruby_core_source`, `libddwaf`).
