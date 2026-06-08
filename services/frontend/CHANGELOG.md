# Frontend service changelog

All notable changes to the frontend service are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- Multi-stage `Dockerfile` with separate `development` and `production` build targets.
- `standalone` output mode in `next.config.js` for the production build.

### Changed

- Reworked Datadog RUM configuration to use `NEXT_PUBLIC_DD_*` environment variables consistently.
- Updated frontend dependencies (`package-lock.json`) and the `Ad` component.
- Compose now builds the frontend from the multi-stage Dockerfile (dev `target: development`) instead of running a `wait-for-it` + `${FRONTEND_COMMAND}` command.

### Removed

- Obsolete `FRONTEND_COMMAND` indirection, replaced by build targets.
