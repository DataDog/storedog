# Discounts service changelog

All notable changes to the discounts service are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- Compose-driven container healthcheck (Python `urllib` request against `http://localhost:2814/`).

### Changed

- Replaced the `wait-for-it` package with `netcat-openbsd` in the Dockerfile; startup ordering is now handled by Compose healthchecks.

### Documentation

- Expanded the service `README.md` (service overview, free-shipping discount behavior, log formatting file reference fix).
