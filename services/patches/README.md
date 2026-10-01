# Service patches for the error tracking course

This directory holds the patch that turns the healthy Python services into the versions used by the APM Error Tracking course.

## Which patch the course uses

| File | Targets | Course use |
|------|---------|------------|
| `errors-main.patch` | `discounts/discounts.py`, `ads/python/ads.py` | Yes. Adds errors 1 and 2. |

The workshop tag `apm-workshop_20260401` has its own `errors.patch` and `latency.patch`. Those patches do not apply to this branch, so do not use them here:

- `errors.patch` targets `ads/python3/ads.py`, which this branch names `ads/python/ads.py`.
- `latency.patch` targets an older `services/ads/java` and `services/discounts` layout. A dry-run against this branch's `services/ads/java` fails, which confirms the Java ads service stays healthy and has no error or latency patch.

## What `errors-main.patch` adds

The branch sources already contain the errors. The patch records the difference between the healthy files and the course files so you can apply or reverse it.

1. **Discounts `KeyError`**: `GET` and `POST /discount` raise `KeyError: 'metadata'` on about 50% of requests.
1. **Ads `AttributeError`**: `GET /ads` on `store-ads-python` raises `AttributeError: 'NoneType' object has no attribute 'id'` on about 50% of requests.

Both errors run before the route's `try`/`except`, so the exception stays unhandled and Error Tracking groups it with a stable fingerprint.

The ads A/B split sends 50% of ad requests to the Java service (`store-ads`, healthy) and 50% to the Python service (`store-ads-python`). About 25% of ad loads fail.

## Other course errors

Errors 3 and 4 live in the order pipeline source, not in a patch:

1. **Error 3**: `order-webhook-bridge` swaps `country` and `country_code` for real Storedog orders. `order-validator` then throws `IllegalStateException` because the country code is not a two-letter code.
1. **Error 4**: `payment-processor` throws `IllegalArgumentException` when the order total is over `MAX_PAYMENT_AMOUNT_CENTS` (default `30000`).

## Check the patch

Run these commands from the repository root. They copy the healthy files from `main` into a scratch directory and dry-run the patch against them. The patch must apply with no rejected hunks.

```bash
mkdir -p /tmp/good/discounts /tmp/good/ads/python
git show main:services/discounts/discounts.py > /tmp/good/discounts/discounts.py
git show main:services/ads/python/ads.py > /tmp/good/ads/python/ads.py
patch -p0 --dry-run -d /tmp/good < services/patches/errors-main.patch
```

Regenerate the patch last, after all other branch changes settle. Run `diff -u` between each healthy file and the branch file, labeling the healthy side `<path>.orig` and the branch side `<path>`.
