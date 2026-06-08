# Puppeteer service changelog

All notable changes to the Puppeteer service are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added

- Modular session architecture under `scripts/`: `index.js` entrypoint, `core/sessionManager.js`, `browser/browser.js`, and `browser/browserPool.js` for managing pooled browser instances.
- Distinct session types in `scripts/sessions/` (`baseSession`, `botSession`, `browsingSession`, `cartAbandonmentSession`, `earlyErrorSession`, `frustrationSession`, `homePageSession`, `lateErrorSession`, `shortSession`, `taxonomySession`, `vipSession`) with shared `sessionActions.js`.
- Shared `config.js` and `constants.js`, example session recordings under `example-sessions/`, `package.json`/`package-lock.json`, and a `.dockerignore`.

### Changed

- Updated the `Dockerfile` to run the new Node-based modular entrypoint.

### Removed

- Retired the monolithic `scripts/puppeteer.js` and `scripts/puppeteer.sh` in favor of the modular architecture.
