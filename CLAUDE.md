# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Storedog is a containerized e-commerce demo application for Datadog training labs. It demonstrates observability, APM, RUM, and database monitoring using a microservices architecture with intentional performance issues for learning purposes.

## Common Commands

### Development Environment

```bash
make dev                    # Start development environment
make down ENV=dev           # Stop development environment
make clean ENV=dev          # Clean up with volumes
make logs [service]         # View logs (add FOLLOW=f for tail)
make restart ENV=dev        # Restart containers
make build ENV=dev          # Rebuild images
```

### Production Environment

```bash
make prod                   # Start production environment
make down ENV=prod          # Stop production environment
```

### Database

```bash
sh ./scripts/backup-db.sh   # Backup database (creates restore.sql)
docker compose exec backend bundle exec rake db:migrate
docker compose exec backend bundle exec rails console
```

### Frontend (services/frontend/)

```bash
npm run dev                 # Development with hot reload
npm run build && npm run start  # Production build
npm run lint                # Linting
```

### Backend Admin

* URL: `http://localhost:4000/admin` (make sure the port is exposed in the docker-compose.yml file)
* Credentials: `admin@storedog.com` / `password`

### Kubernetes Deployment

```bash
kubectl apply -R -f k8s-manifests/cluster-setup/
envsubst '${DD_ENV}' < k8s-manifests/datadog/datadog-agent.yaml | kubectl apply -f -
for file in k8s-manifests/storedog-app/**/*.yaml; do envsubst < "$file" | kubectl apply -f -; done
```

## Architecture

```
External Traffic (Port 80)
         │
         ▼
  ┌─────────────┐
  │    Nginx    │ ─────────────────────────────────────────┐
  └─────────────┘                                          │
         │                                                 │
    ┌────┴────────┬──────────────┬─────────────┐          │
    ▼             ▼              ▼             ▼          │
┌────────┐  ┌────────┐    ┌────────┐    ┌──────────┐     │
│Frontend│  │Backend │    │  Ads   │    │Discounts │     │
│Next.js │  │ Rails  │    │Java/Py │    │  Flask   │     │
│ :3000  │  │ :4000  │    │ :3030  │    │  :2814   │     │
└────────┘  └────────┘    └────────┘    └──────────┘     │
                │              │             │            │
                └──────────────┴─────────────┘            │
                               │                          │
                               ▼                          │
                    ┌───────────────────┐                 │
                    │   PostgreSQL      │◄────────────────┘
                    │     :5432         │
                    └───────────────────┘

Supporting Services:
* Worker (Sidekiq) - Background jobs via Redis
* DBM Service (:7595) - Database monitoring demo
* Puppeteer - Synthetic RUM sessions
* Datadog Agent - Observability collection
```

## Services

| Service | Technology | Port | Path |
|---------|------------|------|------|
| Frontend | Next.js 12, TypeScript | 3000 | services/frontend/ |
| Backend | Ruby 3.1, Rails 6.1, Spree | 4000 | services/backend/ |
| Worker | Sidekiq | - | services/worker/ |
| Ads (Java) | Spring, Gradle | 3030 | services/ads/java/ |
| Ads (Python) | Flask | 3030 | services/ads/python/ |
| Discounts | Flask, SQLAlchemy | 2814 | services/discounts/ |
| DBM | Flask, Gunicorn | 7595 | services/dbm/ |
| Nginx | Nginx 1.28 + Datadog module | 80 | services/nginx/ |
| Puppeteer | Headless Chromium | - | services/puppeteer/ |

## Key Configuration

### Environment Variables

Copy `.env.template` to `.env` and configure:

* `DD_API_KEY` - Datadog API key (required)
* `DD_ENV` - Environment tag
* `NEXT_PUBLIC_DD_APPLICATION_ID` - RUM application ID
* `NEXT_PUBLIC_DD_CLIENT_TOKEN` - RUM client token

### Feature Flags

Location: `services/frontend/featureFlags.config.json`

* `dbm` - Enable product ticker with DB queries
* `error-tracking` - Introduce exceptions in Ads service
* `api-errors` - Random API errors in frontend
* `product-card-frustration` - Disable product links (RUM frustration demo)

### Ads A/B Testing

Run both Java and Python ads services with traffic splitting:

```bash
ADS_A_UPSTREAM=ads:3030
ADS_B_UPSTREAM=ads-python:3030
ADS_B_PERCENT=50  # 0-100 traffic split
```

## CI/CD

GitHub Actions workflows in `.github/workflows/` build and push images to `ghcr.io/datadog/storedog/<service>:latest` on merge to main. Each service has its own workflow triggered by changes to its directory.

## Datadog Integration

All services are instrumented for:

* APM with distributed tracing
* RUM (frontend browser monitoring)
* Continuous Profiling
* Database Monitoring (PostgreSQL)
* Log injection into traces
* Container and process monitoring
