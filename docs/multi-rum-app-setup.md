# Multi-RUM Application Setup

This document explains how the frontend supports multiple RUM Applications without rebuilding.

## How It Works

The frontend reads the RUM Application ID from localStorage at runtime, allowing multiple Puppeteer instances to send data to different RUM Applications using the same frontend build.

### Frontend Implementation

The RUM initialization in `pages/_app.tsx`:
1. Checks localStorage for `rum_app_id` key
2. Falls back to `NEXT_PUBLIC_DD_APPLICATION_ID` env var if not set
3. Initializes Datadog RUM with the determined app ID
4. Logs which app ID is being used (visible in browser console)

### Fallback Chain

```
localStorage.getItem('rum_app_id')
  ↓ (if not found)
process.env.NEXT_PUBLIC_DD_APPLICATION_ID
  ↓ (if not found)
'DD_APPLICATION_ID_PLACEHOLDER'
```

---

## Puppeteer Configuration

### Basic Setup

Each Puppeteer instance sets localStorage before navigating:

```javascript
const RUM_APP_ID = process.env.RUM_APP_ID || 'default-app-id'

const page = await browser.newPage()

// Inject localStorage BEFORE navigation
await page.evaluateOnNewDocument((appId) => {
  localStorage.setItem('rum_app_id', appId)
}, RUM_APP_ID)

// Navigate to Storedog
await page.goto(process.env.STOREDOG_URL)
```

### Docker Compose Configuration

Run multiple Puppeteer services targeting different RUM apps:

```yaml
services:
  puppeteer-app1:
    build:
      context: ./services/puppeteer
    environment:
      - STOREDOG_URL=http://service-proxy
      - RUM_APP_ID=abc-123-app-id-1
      - PUPPETEER_SESSION_TYPES=browsing,vip,frustration,homepage,short,taxonomy
      # ... other puppeteer config

  puppeteer-app2:
    build:
      context: ./services/puppeteer
    environment:
      - STOREDOG_URL=http://service-proxy
      - RUM_APP_ID=def-456-app-id-2
      - PUPPETEER_SESSION_TYPES=browsing,vip,frustration,homepage,short,taxonomy

  puppeteer-app3:
    build:
      context: ./services/puppeteer
    environment:
      - STOREDOG_URL=http://service-proxy
      - RUM_APP_ID=ghi-789-app-id-3
      - PUPPETEER_SESSION_TYPES=browsing,vip,frustration,homepage,short,taxonomy
```

---

## Usage in Instruqt Labs

### Lab Setup Script Example

```bash
#!/bin/bash

# Set RUM app IDs as environment variables
export DD_CLIENT_TOKEN="pub1234567890abcdef"
export RUM_APP_ID_1="app-id-for-errors-testing"
export RUM_APP_ID_2="app-id-for-vip-testing"
export RUM_APP_ID_3="app-id-for-practice"

# Start frontend with default app ID (optional fallback)
export NEXT_PUBLIC_DD_APPLICATION_ID=$RUM_APP_ID_1
export NEXT_PUBLIC_DD_CLIENT_TOKEN=$DD_CLIENT_TOKEN

cd /root/storedog
docker compose -f compose.frontend.yml up -d

# Wait for frontend to be ready
echo "Waiting for frontend..."
timeout 60 bash -c 'until curl -f http://localhost; do sleep 2; done'

# Puppeteer instances will use their respective RUM_APP_ID env vars
echo "All services ready. Puppeteer will send traffic to different RUM apps."
```

### In docker-compose up command:

```bash
# Pass RUM app IDs to puppeteer services
RUM_APP_ID_1="abc-123" \
RUM_APP_ID_2="def-456" \
RUM_APP_ID_3="ghi-789" \
docker compose -f compose.frontend.yml up -d
```

---

## Debugging

### Check Which RUM App ID is Being Used

**Browser console:**
- Open browser dev tools
- Look for: `[RUM Init] Using application ID: abc-123`

**Puppeteer logs:**
```bash
docker compose -f compose.frontend.yml logs puppeteer-app1 | grep "RUM"
```

### Verify localStorage is Set

In browser or puppeteer debug mode:
```javascript
console.log(localStorage.getItem('rum_app_id'))
```

### Check RUM Data in Datadog

1. Go to RUM Applications page in Datadog
2. You should see data flowing to the specific app IDs
3. Check session metadata for application ID

---

## Benefits of This Approach

✅ **Single frontend build** - No rebuilding for different RUM apps  
✅ **Lightweight** - One frontend container, multiple puppeteer containers  
✅ **Flexible** - Easy to add more RUM apps by adding puppeteer services  
✅ **Fast** - No build time overhead when changing app IDs  
✅ **Instruqt-friendly** - Works within VM constraints  

---

## Troubleshooting

### Issue: RUM data going to wrong app

**Check:**
1. Is localStorage being set by puppeteer? (Check browser/puppeteer logs)
2. Is env var `RUM_APP_ID` passed to puppeteer container correctly?
3. Is `evaluateOnNewDocument` being called before navigation?

### Issue: No RUM data at all

**Check:**
1. Is `DD_CLIENT_TOKEN` set correctly?
2. Check browser console for RUM initialization errors
3. Verify network requests to Datadog are not blocked

### Issue: Multiple RUM initializations

**Check:**
1. Make sure `silentMultipleInit: true` is set
2. The `__DD_RUM_INITIALIZED__` flag should prevent this
3. Check if page is remounting unexpectedly

---

## Alternative: Query Parameter Override

If you need manual testing or want learners to manually specify app ID:

**Add to URL:**
```
http://frontend-host?rum_app_id=my-test-app-id
```

**Update useInitializeRum hook:**
```typescript
function useInitializeRum() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as any).__DD_RUM_INITIALIZED__) return

    // Check query param first, then localStorage, then env var
    const urlParams = new URLSearchParams(window.location.search)
    const queryAppId = urlParams.get('rum_app_id')
    
    const appId = 
      queryAppId ||
      localStorage.getItem('rum_app_id') || 
      process.env.NEXT_PUBLIC_DD_APPLICATION_ID || 
      'DD_APPLICATION_ID_PLACEHOLDER'

    console.log('[RUM Init] Using application ID:', appId)
    datadogRum.init(getRumConfig(appId))
    ;(window as any).__DD_RUM_INITIALIZED__ = true
  }, [])
}
```

This allows both automated (puppeteer via localStorage) and manual (learner via query param) specification of RUM app IDs.

