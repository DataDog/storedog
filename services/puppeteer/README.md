# Puppeteer Traffic Generator

A modular Puppeteer-based traffic generator for Storedog that simulates realistic user sessions for RUM data generation.

## Architecture

### Components

- **SessionManager** (`core/SessionManager.js`) - Orchestrates session execution, manages concurrency, and handles browser pool
- **BrowserPool** (`browser/BrowserPool.js`) - Manages reusable browser instances to save memory
- **Browser** (`browser/Browser.js`) - Individual browser instance wrapper
- **baseSession** (`sessions/baseSession.js`) - Base class providing common session functionality (setup, logging, cleanup)
- **Session Classes** - Specific session types (browsingSession, taxonomySession, etc.)
- **Session Actions** (`sessions/sessionActions.js`) - Reusable actions for product selection, cart operations, and checkout
- **Config** (`config.js`) - Configuration loaded from environment variables
- **Constants** (`constants.js`) - Static data (memory profiles, device emulation, Chrome args)

### Flow

1. `index.js` loads environment variables (dotenv for local development, skipped in Docker)
2. Creates SessionManager with enabled session classes
3. SessionManager gets browsers from the pool and creates random sessions
4. Each session:
   - Sets up a page with device emulation
   - Sets RUM user in localStorage before page load (using `evaluateOnNewDocument()`)
   - Executes session logic (navigation, interactions)
   - Cleans up and returns browser to pool
5. SessionManager clears browser context between sessions
6. Process repeats maintaining constant concurrent sessions

## Environment Variables

### Required

- **`STOREDOG_URL`** - URL of the Storedog frontend
  - Default: `http://service-proxy:80`
  - Example: `http://localhost:3000`

- **`PUPPETEER_SYSTEM_MEMORY`** - System memory size (sets intelligent defaults from memory profile)
  - Default: `8GB`
  - Options: `8GB`, `16GB`, `32GB`
  - Sets default values for `maxConcurrency`, `maxBrowsers`, `rampUpPercentages`, and memory thresholds
  - Individual environment variables can override these defaults (see below)

### Session Configuration

- **`PUPPETEER_SESSION_TYPES`** - Comma-separated list of session types to run
  - Default: `browsing,taxonomy,frustration,homePage`
  - Example: `browsing,vip` or `BrowsingSession,VipSession`
  - Available types:
    - `browsing` - Browse products and checkout
    - `taxonomy` - Visit category pages
    - `frustration` - Generate frustration signals
    - `homePage` - Multiple purchases from home page
    - `short` - Very short session with no actions
    - `vip` - VIP users with @vip.example.com email domain
  - **Note**: Session names are case-insensitive and "Session" suffix is optional (e.g., `vip`, `VIP`, `vipSession` all work)

### Concurrency & Performance

- **`PUPPETEER_MAX_CONCURRENT`** - Maximum concurrent sessions
  - Default: Set by memory profile (20 for 8GB, 80 for 16GB, 100 for 32GB)
  - Can be overridden to any value (no longer capped by profile limits)
  - Use profile defaults for optimal performance, or set custom values as needed

- **`PUPPETEER_BROWSER_POOL_SIZE`** - Number of browser instances to keep in pool
  - Default: Auto-calculated from memory profile or `PUPPETEER_MAX_CONCURRENT` (minimum 6)
  - Can be overridden to any value as needed
  - Example: `20`

- **`PUPPETEER_STARTUP_DELAY`** - Delay in milliseconds before starting sessions
  - Default: `10000` (10 seconds)
  - Allows system to stabilize

- **`PUPPETEER_RAMP_INTERVAL`** - Time in milliseconds between concurrency increases
  - Default: `30000` (30 seconds)
  - Sessions ramp up gradually per memory profile percentages

### Debug & Behavior

- **`PUPPETEER_DEBUG`** - Enable verbose logging
  - Default: `false`
  - Set to `true` for detailed logs

- **`PUPPETEER_DEBUG_SESSIONS`** - Enable per-session action logging
  - Default: `false`
  - Set to `true` to see individual session actions

- **`PUPPETEER_LOOP`** - Control loop behavior
  - Default: `forever`
  - Set to `single` to run only 1 iteration (useful for testing)

- **`PUPPETEER_ENABLE_CACHE`** - Enable browser cache
  - Default: `false`
  - Set to `true` for development (faster page loads)

### Legacy (for compatibility)

- **`PUPPETEER_TIMEOUT`** - Browser launch timeout (handled by base Puppeteer image)
  - Default: `30000` (30 seconds)

- **`SKIP_SESSION_CLOSE`** - Not currently used
  - Default: `false`

## Usage

### Local Development

For local development, create a `.env` file in the `services/puppeteer/` directory:

```bash
STOREDOG_URL=http://localhost:3000
PUPPETEER_SYSTEM_MEMORY=8GB
PUPPETEER_DEBUG=true
PUPPETEER_DEBUG_SESSIONS=true
PUPPETEER_LOOP=single
PUPPETEER_STARTUP_DELAY=1000
PUPPETEER_RAMP_INTERVAL=500
PUPPETEER_MAX_CONCURRENT=5
PUPPETEER_ENABLE_CACHE=false
PUPPETEER_BROWSER_POOL_SIZE=3
PUPPETEER_SESSION_TYPES=browsing,frustration
```

Then run:

```bash
npm start
# or
node --expose-gc ./scripts/index.js
```

### Basic Usage (Docker Compose)

```yaml
puppeteer:
  build:
    context: ./services/puppeteer
  environment:
    - STOREDOG_URL=http://service-proxy:80
    - PUPPETEER_SESSION_TYPES=browsing
    - PUPPETEER_SYSTEM_MEMORY=8GB  # Sets intelligent defaults
```

### Development with Volume Mount

Mount custom scripts for live development:

```yaml
puppeteer:
  build:
    context: ./services/puppeteer
  volumes:
    - ./services/puppeteer/scripts:/home/pptruser/scripts
  environment:
    - PUPPETEER_DEBUG=true
    - PUPPETEER_DEBUG_SESSIONS=true
```

### Testing with Single Loop

Run a single iteration for testing:

```yaml
environment:
  - PUPPETEER_LOOP=single
  - PUPPETEER_DEBUG_SESSIONS=true
```

### High Volume Traffic

For larger machines (using profile defaults):

```yaml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB
  - PUPPETEER_SESSION_TYPES=browsing,taxonomy,frustration,homePage
```

Or with custom overrides:

```yaml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB  # Sets intelligent defaults
  - PUPPETEER_MAX_CONCURRENT=60   # Override profile default (80 for 16GB)
  - PUPPETEER_SESSION_TYPES=browsing,taxonomy,frustration,homePage
```

## Session Types

### browsingSession
- Navigates to home page with optional UTM parameters
- Browses to products page
- Selects random product and adds to cart
- Completes checkout
- Ends session explicitly

### taxonomySession
- Visits home page
- Navigates to Best Sellers category
- Browses products (50% chance to purchase)

### frustrationSession
- Generates rage clicks, dead clicks, and error clicks
- Attempts to find hardcoded selectors that may not exist (Learning Bits product)
- Creates intentional frustration signals for RUM

### homePageSession
- Multiple product selections from home page
- Returns to home page multiple times
- Random behavior with 33% probability branching

### shortSession
- Very short session with no actions
- Useful for testing session initialization and teardown
- Quick smoke test for RUM setup

### vipSession
- Selects a random VIP user from predefined pool (18 VIP users)
- VIP users have email domain `@vip.example.com`
- Sets RUM user context before page load using `evaluateOnNewDocument()`
- Enables filtering/retention based on VIP user status
- Same shopping flow as browsingSession (browse, add to cart, checkout)

## Creating Custom Sessions

1. Create a new file in `scripts/sessions/` (e.g., `customSession.js`)
2. Extend `baseSession` class
3. Implement `execute()` method
4. Add session filename (without `.js`) to `PUPPETEER_SESSION_TYPES` environment variable

Example:

```javascript
const BaseSession = require('./baseSession');
const config = require('../config');
const { setTimeout } = require('node:timers/promises');

class CustomSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    // Your session logic here
    await this.page.goto(config.storedogUrl);
    this.log('Custom session logic executed');
    await setTimeout(2000);
  }
}

module.exports = CustomSession;
```

Save as `scripts/sessions/customSession.js`, then set: `PUPPETEER_SESSION_TYPES=custom` (or `customSession`)

## Memory Profiles

The system automatically selects appropriate limits based on `PUPPETEER_SYSTEM_MEMORY`:

| Profile | Max Memory | Max Concurrency | Max Browsers | Ramp-Up |
|---------|-----------|-----------------|--------------|---------|
| 8GB     | 6.5GB     | 20              | 25           | 20%, 40%, 60%, 100% |
| 16GB    | 13GB      | 80              | 60           | 10%, 25%, 50%, 75%, 100% |
| 32GB    | 26GB      | 100             | 80           | 10%, 30%, 60%, 100% |

## Files

```
scripts/
├── index.js                    # Entry point, loads environment and starts SessionManager
├── config.js                   # Configuration loaded from environment variables
├── constants.js                # Static data (memory profiles, devices, Chrome args, VIP users)
├── core/
│   └── SessionManager.js       # Orchestrates sessions, manages concurrency and memory
├── browser/
│   ├── Browser.js              # Individual browser instance wrapper
│   └── BrowserPool.js          # Manages reusable browser instances
└── sessions/
    ├── baseSession.js          # Base class for all sessions (RUM user setup, device emulation)
    ├── sessionActions.js       # Reusable session actions (navigation, cart, checkout)
    ├── browsingSession.js      # Browse and checkout session
    ├── taxonomySession.js      # Category browsing session
    ├── frustrationSession.js   # Frustration signals session
    ├── homePageSession.js      # Home page shopping session
    ├── shortSession.js         # Quick session with no actions
    └── vipSession.js           # VIP user session
```

## Troubleshooting

### Sessions not appearing in logs

Check `PUPPETEER_DEBUG_SESSIONS=true` to see individual session actions.

### Memory issues

- Reduce `PUPPETEER_MAX_CONCURRENT`
- Set appropriate `PUPPETEER_SYSTEM_MEMORY` for your machine
- Check memory usage in logs

### Sessions failing

- Enable `PUPPETEER_DEBUG=true` for verbose logging
- Check `STOREDOG_URL` is accessible
- Verify session types are spelled correctly in `PUPPETEER_SESSION_TYPES`

### Browser crashes

- Increase Docker `shm_size` (shared memory)
- Add `SYS_ADMIN` capability for Chrome sandbox
- Reduce concurrent sessions
