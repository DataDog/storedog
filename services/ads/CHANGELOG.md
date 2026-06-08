# Ads service changelog

All notable changes to the ads service are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- Compose-driven container healthcheck (`wget` against `http://localhost:3030/`).

### Changed

- Replaced the `wait-for-it` package with `netcat-openbsd` in the Python ads Dockerfile; startup ordering is now handled by Compose healthchecks.

### Documentation

- Expanded the service `README.md` (Java/Python variants overview, `DD_VERSION_ADS_PYTHON` versioning).
