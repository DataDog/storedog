# Backend service changelog

All notable changes to the backend service are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- A `.dockerignore` to keep build context lean.
- Compose-driven container healthcheck (`nc -z localhost 4000`) so dependents start once the service is reachable.

### Changed

- `config/database.yml` now reads the Postgres user and password from `POSTGRES_USER` / `POSTGRES_PASSWORD` (defaulting to `postgres`).

### Removed

- The `wait-for-it` package and `wait-for-it` startup wrapper from the Dockerfile; startup ordering is now handled by Compose healthchecks.

### Documentation and dependencies

- Expanded the service `README.md` (admin URL/credentials, worker process notes).
- Bumped gems in `Gemfile.lock` (`datadog-ruby_core_source` to 3.5.2, `libddwaf` to 1.24.1.2.1) and pruned redundant platform-specific entries.
