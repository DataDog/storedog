# Service Patches for Lab Scenarios

This directory contains additive patches to create different versions of services for lab exercises.

## Patch Strategy

Patches are **additive** and applied in order:

| Version | Tag | Contains | Description |
|---------|-----|----------|-------------|
| Errors | `:1.5.1` | + latency.patch + errors.patch | N+1 AND runtime errors |
| Latency | `:1.5.2` | + latency.patch | N+1 query issues |
| Good | `:1.5.3` | Base code | Working version with eager loading |

## Services Modified

- **discounts** - Python/Flask discount service (latency + errors)
- **ads/python3** - Python/Flask advertisement service (errors only)

## Latency Introduced (latency.patch)

### discounts service - N+1 Query

Removes `joinedload()` from queries, causing N+1 database queries when serializing discounts.

- **Good version**: `Discount.query.options(joinedload(Discount.discount_type)).all()`
- **Latency version**: `Discount.query.all()` (triggers lazy load per discount)

Affected endpoints:
- `GET /discount` - lists all discounts
- `POST /discount` - returns all discounts after creating new one

## Errors Introduced (errors.patch)

### discounts service (2 errors)

1. **AttributeError** in `/discount` GET endpoint
   - Accessing `.influencer` on a potentially None `discount_type`
   - Stack trace: `AttributeError: 'NoneType' object has no attribute 'influencer'`

1. **KeyError** in `/discount` GET endpoint
   - Accessing non-existent `['metadata']['version']` key in serialized data
   - Stack trace: `KeyError: 'metadata'`

### ads service (1 error)

1. **IndexError** in `/weighted-banners/<weight>` endpoint
   - Accessing `[0]` on empty list when no ads match weight criteria
   - Stack trace: `IndexError: list index out of range`

## Build Workflow

```bash
cd /path/to/storedog/services

# 1. Build all services (good version - 1.5.3)
find . -name Dockerfile | while read dockerfile; do
  context_dir=$(dirname "$dockerfile")
  image_name=$(echo "$context_dir" | sed 's|^\./||; s|/|-|g')
  docker build -t "$REGISTRY_URL/$image_name:1.5.3" "$context_dir"
  docker push "$REGISTRY_URL/$image_name:1.5.3"
done

# 2. Apply latency patch and build affected services (1.5.2)
patch -p0 < patches/latency.patch

docker build -t "$REGISTRY_URL/discounts:1.5.2" ./discounts
docker push "$REGISTRY_URL/discounts:1.5.2"

# 3. Apply errors patch (on top of latency) and build (1.5.1)
patch -p0 < patches/errors.patch

docker build -t "$REGISTRY_URL/discounts:1.5.1" ./discounts
docker build -t "$REGISTRY_URL/ads-python3:1.5.1" ./ads/python3
docker push "$REGISTRY_URL/discounts:1.5.1"
docker push "$REGISTRY_URL/ads-python3:1.5.1"

# 4. Restore to good state
git checkout -- discounts/discounts.py ads/python3/ads.py
```

## Learner Flow

1. Lab starts with `:1.5.1` deployed (has errors + N+1 latency)
1. Learner discovers errors via stack traces in logs/APM
1. Learner updates deployment to `:1.5.2` (errors fixed, still has N+1)
1. Learner discovers latency via APM traces showing many DB queries
1. Learner updates deployment to `:1.5.3` (fully working with eager loading)
