# Puppeteer Traffic Generator

A modular Puppeteer-based traffic generator for Storedog that simulates realistic user sessions for RUM data generation.

## Architecture

### Components

- **SessionManager** - Orchestrates session execution, manages concurrency, and handles browser pool
- **BrowserPool** - Manages reusable browser instances to save memory
- **BaseSession** - Base class providing common session functionality (setup, logging, cleanup)
- **Session Classes** - Specific session types (BrowsingSession, TaxonomySession, etc.)
- **Session Actions** - Reusable actions for product selection, cart operations, and checkout

### Flow

1. `puppeteer-modular.js` loads configuration and session types
2. Creates SessionManager with enabled session classes
3. SessionManager gets browsers from the pool and creates random sessions
4. Each session sets up a page, executes its logic, and cleans up
5. Browsers are cleaned and returned to the pool for reuse
6. Process repeats maintaining constant concurrent sessions

## Environment Variables

### Required

- **`STOREDOG_URL`** - URL of the Storedog frontend
  - Default: `http://service-proxy:80`
  - Example: `http://localhost:3000`

- **`PUPPETEER_SYSTEM_MEMORY`** - System memory size (determines concurrency limits)
  - Default: `8GB`
  - Options: `8GB`, `16GB`, `32GB`
  - Selects appropriate memory profile with safety limits

### Session Configuration

- **`PUPPETEER_SESSION_TYPES`** - Comma-separated list of session types to run
  - Default: `BrowsingSession,TaxonomySession,FrustrationSession,HomePageSession`
  - Example: `BrowsingSession,TaxonomySession`
  - Available types:
    - `BrowsingSession` - Browse products and checkout
    - `TaxonomySession` - Visit category pages
    - `FrustrationSession` - Generate frustration signals
    - `HomePageSession` - Multiple purchases from home page

### Concurrency & Performance

- **`PUPPETEER_MAX_CONCURRENT`** - Maximum concurrent sessions
  - Default: `16`
  - Capped by memory profile limits (20 for 8GB, 80 for 16GB, 100 for 32GB)

- **`PUPPETEER_BROWSER_POOL_SIZE`** - Number of browser instances to keep in pool
  - Default: Auto-calculated based on `PUPPETEER_MAX_CONCURRENT` (min 6, max based on profile)
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

### Basic Usage (Docker Compose)

```yaml
puppeteer:
  build:
    context: ./services/puppeteer
  environment:
    - STOREDOG_URL=http://service-proxy:80
    - PUPPETEER_SESSION_TYPES=BrowsingSession
    - PUPPETEER_MAX_CONCURRENT=16
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

For larger machines:

```yaml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB
  - PUPPETEER_MAX_CONCURRENT=60
  - PUPPETEER_SESSION_TYPES=BrowsingSession,TaxonomySession,FrustrationSession,HomePageSession
```

## Session Types

### BrowsingSession
- Navigates to home page with optional UTM parameters
- Browses navigation links
- Selects product and adds to cart
- Completes checkout
- Ends session explicitly

### TaxonomySession
- Visits home page
- Navigates to Best Sellers category
- Browses products (50% chance to purchase)

### FrustrationSession
- Generates rage clicks, dead clicks, and error clicks
- Attempts product selections that may fail
- Creates intentional frustration signals for RUM

### HomePageSession
- Multiple product selections from home page
- Returns to home page multiple times
- Random behavior with 33% probability branching

## Creating Custom Sessions

1. Create a new file in `scripts/sessions/` (e.g., `customSession.js`)
2. Extend `BaseSession` class
3. Implement `execute()` method
4. Add session name to `PUPPETEER_SESSION_TYPES` environment variable

Example:

```javascript
const BaseSession = require('./baseSession');
const { sleep } = require('../utils');

class CustomSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    // Your session logic here
    await this.page.goto(config.storedogUrl);
    this.log('Custom session logic executed');
  }
}

module.exports = CustomSession;
```

Then set: `PUPPETEER_SESSION_TYPES=CustomSession`

## Memory Profiles

The system automatically selects appropriate limits based on `PUPPETEER_SYSTEM_MEMORY`:

| Profile | Max Memory | Max Concurrency | Max Browsers | Ramp-Up |
|---------|-----------|-----------------|--------------|---------|
| 8GB     | 6.5GB     | 20              | 25           | 20%, 40%, 60%, 100% |
| 16GB    | 13GB      | 80              | 60           | 10%, 25%, 50%, 75%, 100% |
| 32GB    | 26GB      | 100             | 80           | 10%, 30%, 60%, 100% |

## Files

- `puppeteer-modular.js` - Entry point, loads sessions and starts SessionManager
- `sessionManager.js` - Orchestrates sessions, manages concurrency and memory
- `browserPool.js` - Manages reusable browser instances
- `config.js` - Configuration loaded from environment variables
- `constants.js` - Static data (memory profiles, emojis)
- `utils.js` - Utility functions (sleep, logging, garbage collection)
- `sessions/baseSession.js` - Base class for all sessions
- `sessions/sessionActions.js` - Reusable session actions
- `sessions/*.js` - Individual session implementations

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
