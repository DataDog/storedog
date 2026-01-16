# Service Patches for Lab Scenarios

This directory contains patches to create different versions of services for lab exercises.

## Services Modified

- **discounts** - Python/Flask discount service
- **ads/python3** - Python/Flask advertisement service

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
# From the services directory
cd /path/to/storedog/services

# 1. Build all services (good version)
find . -name Dockerfile | while read dockerfile; do
  context_dir=$(dirname "$dockerfile")
  image_name=$(echo "$context_dir" | sed 's|^\./||; s|/|-|g')
  docker build -t "$REGISTRY_URL/$image_name:1.5.1" "$context_dir"
  docker push "$REGISTRY_URL/$image_name:1.5.1"
done

# 2. Apply errors patch and build affected services
patch -p0 < patches/errors.patch

docker build -t "$REGISTRY_URL/discounts:1.5.1-errors" ./discounts
docker build -t "$REGISTRY_URL/ads-python3:1.5.1-errors" ./ads/python3
docker push "$REGISTRY_URL/discounts:1.5.1-errors"
docker push "$REGISTRY_URL/ads-python3:1.5.1-errors"

# 3. Restore to good state
git checkout -- discounts/discounts.py ads/python3/ads.py
```
