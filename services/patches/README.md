# Service Patches for Lab Scenarios

This directory contains additive patches to create different versions of services for lab exercises.

## Service Versions

| Service | Errors | Latency | Good | Issues |
|---------|--------|---------|------|--------|
| frontend | - | - | 3.2.3 | None |
| backend | - | - | 4.0.10 | None |
| discounts | 1.4.1 | 1.4.2 | 1.4.3 | Latency + Errors |
| ads-python3 | 2.1.0 | - | 2.1.2 | Errors only |
| ads-java | - | 1.8.6 | 1.8.7 | Latency only |
| nginx | - | - | 1.0.3 | None |
| ad-provider | - | - | 0.3.1 | None (external) |

## Patch Strategy

Patches are **additive** and applied in order:

| State | Contains | Description |
|-------|----------|-------------|
| Errors | + latency.patch + errors.patch | Latency issues AND runtime errors |
| Latency | + latency.patch | Latency issues only |
| Good | Base code | Working version |

## Services Modified

- **discounts** - Python/Flask discount service (latency + errors)
- **ads/java** - Java/Spring Boot advertisement service (latency only)
- **ads/python3** - Python/Flask advertisement service (errors only)

## New Service: ad-provider

A Go service that simulates an external ad enrichment API. Always deployed with ~100ms response time.

- **Endpoint**: `GET /enrich?ad_id=123` - single ad enrichment
- **Endpoint**: `GET /enrich/batch?ad_ids=1,2,3` - batch enrichment
- **Latency**: Configurable via `AD_PROVIDER_LATENCY_MS` env var (default: 100ms)

## Latency Introduced (latency.patch)

### discounts service - N+1 Query

Removes `joinedload()` from queries, causing N+1 database queries when serializing discounts.

- **Good version**: `Discount.query.options(joinedload(Discount.discount_type)).all()`
- **Latency version**: `Discount.query.all()` (triggers lazy load per discount)

Affected endpoints:
- `GET /discount` - lists all discounts
- `POST /discount` - returns all discounts after creating new one

### ads-java service - Per-Item External Calls

Changes batch API call to per-item calls, causing N HTTP requests to ad-provider.

- **Good version**: `adEnrichmentService.enrichBatch(adIds)` (1 HTTP call)
- **Latency version**: Loop calling `adEnrichmentService.enrichSingle(ad.getId())` (N HTTP calls)

Affected endpoints:
- `GET /ads` - lists all advertisements

## Errors Introduced (errors.patch)

Errors are placed **outside try/except blocks** so they are unhandled and visible in Datadog APM.

### discounts service (1 error - 50% of requests)

1. **KeyError** in `/discount` endpoint
   - Triggers on ~50% of requests (before try block)
   - Accessing non-existent `config['metadata']['version']` key
   - Stack trace: `KeyError: 'metadata'`

### ads-python3 service (1 error - 50% of requests)

1. **AttributeError** in `/ads` GET endpoint
   - Triggers on ~50% of requests (before try block)
   - Calling `.id` on None (from failed query)
   - Stack trace: `AttributeError: 'NoneType' object has no attribute 'id'`

## Build Workflow

```bash
cd /path/to/storedog

# 1. Build all services (good versions)
docker build -t "$REGISTRY_URL/frontend:3.2.3" ./services/frontend
docker build -t "$REGISTRY_URL/backend:4.0.10" ./services/backend
docker build -t "$REGISTRY_URL/discounts:1.4.3" ./services/discounts
docker build -t "$REGISTRY_URL/ads-python3:2.1.2" ./services/ads/python3
docker build -t "$REGISTRY_URL/ads-java:1.8.7" ./services/ads/java
docker build -t "$REGISTRY_URL/nginx:1.0.3" ./services/nginx
docker build -t "$REGISTRY_URL/ad-provider:0.3.1" ./services/ad-provider

# Push good versions
docker push "$REGISTRY_URL/frontend:3.2.3"
docker push "$REGISTRY_URL/backend:4.0.10"
docker push "$REGISTRY_URL/discounts:1.4.3"
docker push "$REGISTRY_URL/ads-python3:2.1.2"
docker push "$REGISTRY_URL/ads-java:1.8.7"
docker push "$REGISTRY_URL/nginx:1.0.3"
docker push "$REGISTRY_URL/ad-provider:0.3.1"

# 2. Apply latency patch and build affected services
patch -p0 -d services < services/patches/latency.patch

docker build -t "$REGISTRY_URL/discounts:1.4.2" ./services/discounts
docker build -t "$REGISTRY_URL/ads-java:1.8.6" ./services/ads/java
docker push "$REGISTRY_URL/discounts:1.4.2" && docker push "$REGISTRY_URL/ads-java:1.8.6"

# 3. Apply errors patch (on top of latency) and build
patch -p0 -d services < services/patches/errors.patch

docker build -t "$REGISTRY_URL/discounts:1.4.1" ./services/discounts
docker build -t "$REGISTRY_URL/ads-python3:2.1.0" ./services/ads/python3
docker push "$REGISTRY_URL/discounts:1.4.1" && docker push "$REGISTRY_URL/ads-python3:2.1.0"

# 4. Restore to good state
git checkout -- services/discounts/discounts.py services/ads/java/src/main/java/adsjava/AdsJavaApplication.java services/ads/python3/ads.py
```

## Learner Flow

1. Lab starts with error/latency versions deployed:
   - discounts:1.4.1, ads-python3:2.1.0, ads-java:1.8.6
2. Learner discovers errors via stack traces in logs/APM
3. Learner updates deployments to fix errors:
   - discounts:1.4.2, ads-python3:2.1.2
4. Learner discovers latency via APM traces showing:
   - Many DB queries (discounts N+1)
   - Many HTTP calls to ad-provider (ads-java per-item calls)
5. Learner updates deployments to fix latency:
   - discounts:1.4.3, ads-java:1.8.7
