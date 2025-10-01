# Puppeteer Traffic Generator

A modular Puppeteer script for generating realistic traffic to the Storedog application for RUM SDK testing.

## 📁 Project Structure

The script uses a modular architecture for maintainability and extensibility:

```
scripts/
├── puppeteer-modular.js     # Main entry point
├── config.js               # Configuration management
├── deviceManager.js        # Device management
├── utils.js                # Utility functions
├── browserPool.js          # Browser pool management
├── sessionManager.js       # Session orchestration
├── devices.json           # Device configurations
└── sessions/              # Session implementations
    ├── baseSession.js     # Base session class
    ├── homePageSession.js # Home page browsing
    ├── frustrationSession.js # Frustration signals
    ├── taxonomySession.js # Category browsing
    ├── browsingSession.js # General browsing
    └── searchSession.js   # Search functionality
```

### Modular Architecture Benefits

- **Separation of Concerns**: Each module has a specific responsibility
- **Easy Maintenance**: Changes to one module don't affect others
- **Extensibility**: Add new sessions without modifying core code
- **Testability**: Individual modules can be tested in isolation
- **Reusability**: Utility functions shared across all sessions

## 🎯 Session Types

- **HomePageSession**: Basic home page browsing and product selection
- **FrustrationSession**: Generates all three types of frustration signals (rage clicks, dead clicks, error clicks)
- **TaxonomySession**: Category browsing with Best Sellers navigation and purchases
- **BrowsingSession**: General browsing patterns with navbar navigation
- **SearchSession**: Search functionality (example session)

## ⚙️ Configuration

### Environment Variables
- `STOREDOG_URL`: Target URL (default: http://service-proxy:80)
- `PUPPETEER_MAX_CONCURRENT`: Max concurrent sessions (default: 8)
- `PUPPETEER_STARTUP_DELAY`: Startup delay in ms (default: 10000)
- `PUPPETEER_RAMP_INTERVAL`: Ramp-up interval in ms (default: 30000)
- `PUPPETEER_TIMEOUT`: Page navigation timeout in ms (default: 40000)
- `PUPPETEER_BROWSER`: Browser engine - 'chrome' or 'firefox' (default: chrome)
- `PUPPETEER_ENABLE_CACHE`: Enable cache (default: false)

### Concurrency Configuration

The script uses progressive concurrency ramping to prevent memory spikes at startup. The `PUPPETEER_MAX_CONCURRENT` environment variable controls the maximum number of simultaneous sessions.

#### Recommended Settings by System Memory

**8GB RAM Systems:**
```bash
export PUPPETEER_MAX_CONCURRENT=8
export PUPPETEER_STARTUP_DELAY=10000
export PUPPETEER_RAMP_INTERVAL=30000
```
- **Browser Pool**: 8 browsers
- **Total Sessions**: 16
- **Memory Usage**: ~2-3GB peak
- **Ramp Schedule**: 2 → 4 → 8 sessions over 3.5 minutes

**16GB RAM Systems:**
```bash
export PUPPETEER_MAX_CONCURRENT=20
export PUPPETEER_STARTUP_DELAY=15000
export PUPPETEER_RAMP_INTERVAL=45000
```
- **Browser Pool**: 20 browsers
- **Total Sessions**: 20
- **Memory Usage**: ~4-6GB peak
- **Ramp Schedule**: 2 → 4 → 8 → 16 → 20 sessions over 7 minutes

**High-Performance Systems (32GB+ RAM):**
```bash
export PUPPETEER_MAX_CONCURRENT=50
export PUPPETEER_STARTUP_DELAY=20000
export PUPPETEER_RAMP_INTERVAL=60000
```
- **Browser Pool**: 20 browsers (capped for stability)
- **Total Sessions**: 50
- **Memory Usage**: ~8-12GB peak
- **Ramp Schedule**: 2 → 4 → 8 → 16 → 24 → 32 → 40 → 50 sessions over 10 minutes

#### Progressive Ramp-Up Schedule

The script automatically scales the ramp-up schedule based on your `PUPPETEER_MAX_CONCURRENT` setting:

| Time | 8GB (max=8) | 16GB (max=20) | 32GB+ (max=50) |
|------|-------------|---------------|----------------|
| 0s   | 2 sessions  | 2 sessions    | 2 sessions     |
| 30s  | 4 sessions  | 4 sessions    | 4 sessions     |
| 60s  | 8 sessions  | 8 sessions    | 8 sessions     |
| 90s  | 8 sessions  | 16 sessions   | 16 sessions    |
| 120s | 8 sessions  | 20 sessions   | 24 sessions    |
| 150s | 8 sessions  | 20 sessions   | 32 sessions    |
| 180s | 8 sessions  | 20 sessions   | 40 sessions    |
| 210s | 8 sessions  | 20 sessions   | 50 sessions    |

#### Memory Safety Limits

The script includes automatic safety limits to prevent system overload:
- **Memory Threshold**: 80% of available RAM
- **CPU Threshold**: 85% CPU usage
- **Absolute Memory Limit**: 12GB (configurable)
- **Auto-scaling**: Browser pool size scales with concurrency (6-20 browsers)

### Adding New Sessions
1. Create new file in `sessions/` directory
2. Extend `BaseSession` class
3. Implement `run()` method
4. That's it! No configuration needed

**Dynamic Discovery:**
The script automatically discovers all session files in the `sessions/` directory at runtime. No manual registration required.

**Session File Requirements:**
- Must be in `sessions/` directory
- Must export a class extending `BaseSession`
- Must implement `run()` method
- File name becomes the session type name

**Example Session:**
```javascript
const BaseSession = require('./baseSession');

class CustomSession extends BaseSession {
  async run() {
    const { page, browser } = await this.setupPage();
    try {
      // Your session logic here
      await page.goto(this.sessionManager.config.storedogUrl);
      // ... more interactions
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = CustomSession;
```

## 🚀 Usage

### Basic Usage
```bash
# Run with default settings (8 concurrent sessions)
node puppeteer-modular.js

# Run with custom URL
node puppeteer-modular.js http://localhost:3000

# Run with environment variables
export STOREDOG_URL=http://localhost:3000
export PUPPETEER_MAX_CONCURRENT=20
node puppeteer-modular.js
```

### Docker Usage
```bash
# Using docker-compose with custom concurrency
PUPPETEER_MAX_CONCURRENT=20 docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_MAX_CONCURRENT=20
  - STOREDOG_URL=http://frontend:3000
```

### Kubernetes Usage
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: puppeteer-traffic
spec:
  template:
    spec:
      containers:
      - name: puppeteer
        image: storedog-puppeteer:latest
        env:
        - name: PUPPETEER_MAX_CONCURRENT
          value: "20"
        - name: STOREDOG_URL
          value: "http://frontend-service:3000"
        resources:
          requests:
            memory: "4Gi"
            cpu: "1000m"
          limits:
            memory: "8Gi"
            cpu: "2000m"
```

## 🔧 Features

- **Dynamic session loading**: Automatically discovers session files
- **Progressive concurrency**: Ramps up from 2 to max sessions
- **Device emulation**: 20+ realistic device profiles
- **Memory management**: Automatic garbage collection
- **Error handling**: Graceful failure recovery
- **Resource monitoring**: Memory and CPU limits
- **Browser pooling**: Efficient browser reuse with context clearing
- **Session orchestration**: Balanced session distribution
- **Context isolation**: Unique RUM sessions via browser context clearing

## 📊 Device Support

The script includes comprehensive device emulation with realistic user agents, viewports, and browser configurations.

### Device Categories
- **Mobile**: iPhone, Android devices with touch support
- **Tablet**: iPad Pro with tablet-optimized viewports
- **Desktop**: MacBook, Windows PC with desktop browsers
- **Browsers**: Safari, Chrome, Firefox, Edge across platforms
- **OS**: iOS, Android, macOS, Windows

### Device Configuration (`devices.json`)

Devices are configured in `scripts/devices.json` with the following structure:

```json
{
  "name": "iPhone 15 Pro Max",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "viewport": { 
    "width": 430, 
    "height": 932, 
    "deviceScaleFactor": 3, 
    "isMobile": true, 
    "hasTouch": true 
  },
  "category": "mobile",
  "os": "iOS",
  "browser": "Safari"
}
```

### Available Devices

**iOS Devices:**
- iPhone 15 Pro Max (Safari)
- iPhone 14 (Safari)
- iPhone SE (Safari)
- iPhone 15 Pro Max (Chrome)
- iPhone 14 (Chrome)
- iPad Pro (Safari)

**Android Devices:**
- Samsung Galaxy S24 Ultra (Chrome)
- Samsung Galaxy S23 (Chrome)
- Google Pixel 8 Pro (Chrome)
- Samsung Galaxy S24 Ultra (Firefox)
- Samsung Galaxy S23 (Firefox)

**Desktop Devices:**
- MacBook Pro 16" (Safari)
- MacBook Pro 16" (Chrome)
- MacBook Pro 16" (Firefox)
- Windows PC (Edge)
- Windows PC (Chrome)
- Windows PC (Firefox)

### Adding Custom Devices

1. Edit `scripts/devices.json`
2. Add new device object with required fields:
   - `name`: Display name
   - `userAgent`: Browser user agent string
   - `viewport`: Viewport configuration
   - `category`: mobile/tablet/desktop
   - `os`: iOS/Android/macOS/Windows
   - `browser`: Safari/Chrome/Firefox/Edge
3. Restart the script to load new devices

### Device Selection

- **Random Selection**: Each session gets a random device
- **Balanced Distribution**: All device types are represented
- **Realistic Emulation**: Full viewport, user agent, and touch support

## 🔄 Browser Pool & Session Management

### Browser Pool (`browserPool.js`)

The browser pool manages browser instances efficiently to reduce memory usage and improve performance.

**Features:**
- **Pool Size**: Scales with `PUPPETEER_MAX_CONCURRENT` (6-20 browsers)
- **Browser Reuse**: Sessions share browser instances
- **Context Clearing**: Each session gets a clean browser context
- **Memory Optimization**: Automatic browser cleanup and garbage collection

**Pool Configuration:**
```javascript
// Pool size scales with concurrency
browserPoolSize: Math.min(Math.max(PUPPETEER_MAX_CONCURRENT, 6), 20)
```

### Session Manager (`sessionManager.js`)

Orchestrates session execution with progressive concurrency and balanced distribution.

**Features:**
- **Progressive Ramp-Up**: Gradually increases concurrent sessions
- **Balanced Distribution**: Ensures all session types run at least once
- **Resource Monitoring**: Tracks memory and CPU usage
- **Session Statistics**: Logs completion rates and session types
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals

**Session Distribution:**
```javascript
// Guaranteed: One of each session type
// Random: Remaining sessions distributed randomly
// Shuffled: Execution order randomized
```

### Context Isolation

Each session gets a unique browser context to ensure proper RUM session tracking:

**Context Clearing Process:**
1. **Cookies**: Clear all cookies
2. **Cache**: Clear browser cache
3. **Storage**: Clear localStorage and sessionStorage
4. **IndexedDB**: Clear IndexedDB databases
5. **CDP Commands**: Execute Chrome DevTools Protocol commands

**RUM Session Benefits:**
- **Unique Sessions**: Each session appears as separate user
- **Proper Tracking**: Datadog RUM tracks individual sessions
- **Session Analytics**: Accurate session metrics and frustration signals

## 🛠️ Utility Functions (`utils.js`)

The utility module provides shared functions used across all session types.

### Core Utilities

#### `sleep(ms)`
**Purpose**: Async delay function using Node.js timers
```javascript
await sleep(1000); // Wait 1 second
```
**Implementation**: Uses `node:timers/promises` for optimal performance

#### `logMemoryUsage(context)`
**Purpose**: Log current memory usage
```javascript
logMemoryUsage('Session Start'); // 💾 Memory Usage (Session Start): 245MB
```

#### `forceGC()`
**Purpose**: Trigger garbage collection if available
```javascript
forceGC(); // 🗑️ Garbage collection triggered
```

#### `setUtmParams(url)`
**Purpose**: Add random UTM parameters to URLs
```javascript
const urlWithUtm = setUtmParams('https://example.com');
// Result: https://example.com?utm_campaign=blog_post&utm_medium=facebook&utm_source=social
```
**UTM Sources**: blog, social, search, email, direct
**UTM Mediums**: facebook, twitter, instagram, pinterest, linkedin, youtube, google
**UTM Campaigns**: blog_post, cool_bits_sale, paid_search, clothing_sale, social_media

#### `optimizePageResources(page)`
**Purpose**: Configure page for optimal performance
- Enables request interception
- Preserves Next.js development files
- Configures cache based on environment
- Sets document visibility state

### Product Selection Functions

#### `selectHomePageProduct(page)`
**Purpose**: Select random product from home page
```javascript
await selectHomePageProduct(page);
```
**Process**:
1. Waits for `.product-item` elements
2. Selects random product by `aria-label`
3. Clicks and navigates to product page
4. Logs page title

#### `selectProduct(page)`
**Purpose**: Select random product from current page
```javascript
await selectProduct(page);
```
**Process**:
1. Finds all product links (`a[href*="/products/"]`)
2. Selects random product
3. Navigates to product page

#### `selectProductsPageProduct(page)`
**Purpose**: Navigate to products page and select product
```javascript
await selectProductsPageProduct(page);
```
**Process**:
1. Clicks first navbar link (`nav#main-navbar a:first-child`)
2. Calls `selectProduct()` on products page

#### `selectRelatedProduct(page)`
**Purpose**: Select related product from product page
```javascript
await selectRelatedProduct(page);
```
**Process**:
1. Finds related product links (`.related-products a`)
2. Selects random related product
3. Navigates to product page

### Cart Operations

#### `addToCart(page)`
**Purpose**: Add current product to cart
```javascript
await addToCart(page);
```
**Process**:
1. Waits for add-to-cart button (`#add-to-cart-button`)
2. Selects random variant if available (`select#variant-select`)
3. Clicks add-to-cart button
4. Closes sidebar (`#close-sidebar`)

### Checkout Functions

#### `checkout(page)`
**Purpose**: Complete checkout process
```javascript
await checkout(page);
```
**Process**:
1. Opens cart (`button[data-dd-action-name="Toggle Cart"]`)
2. Proceeds to checkout (`button[data-dd-action-name="Proceed to Checkout"]`)
3. Scrolls to bottom of checkout form
4. Optionally applies discount codes (50% chance)
5. Confirms purchase (`button[data-dd-action-name="Confirm Purchase"]`)
6. Waits for confirmation (`.purchase-confirmed-msg`)

**Error Handling**: Falls back to finding any checkout-related button if primary flow fails

#### `useDiscountCode(page)`
**Purpose**: Apply discount code during checkout
```javascript
await useDiscountCode(page);
```
**Process**:
1. **Dynamic Detection**: Scans page for discount codes using multiple selectors:
   - `#discount-code`
   - `[id*="discount"]`
   - `[class*="discount"]`
   - `strong`
   - `.discount-wrapper strong`
2. **Validation**: Uses regex `/^[A-Z0-9]{3,15}$/` to validate codes
3. **Fallback**: Uses static list if no dynamic code found
4. **Application**: Calls `applyDiscountCode()` with found/selected code
5. **Retry Logic**: Sometimes tries same code again (70% chance)

#### `applyDiscountCode(page, discountCode)`
**Purpose**: Apply specific discount code
```javascript
await applyDiscountCode(page, 'STOREDOG');
```
**Process**:
1. Waits for discount input (`input[name="discount-code"]`)
2. Types discount code with random delay (150-580ms)
3. Clicks apply button (`button[data-dd-action-name="Apply Discount"]`)

### Navigation Functions

#### `goToFooterPage(page)`
**Purpose**: Navigate to footer page
```javascript
await goToFooterPage(page);
```
**Process**:
1. Scrolls to bottom of page
2. Finds footer links (`footer a`)
3. Clicks random footer link
4. Navigates to footer page

### Frustration Signal Generators

These functions generate realistic frustration signals for Datadog RUM monitoring, based on the [official Datadog frustration signals documentation](https://docs.datadoghq.com/real_user_monitoring/browser/frustration_signals/).

#### `generateRageClicks(page)`
**Purpose**: Generate rage clicks (3+ clicks in 1 second)
```javascript
await generateRageClicks(page);
```
**Process**:
1. Finds clickable elements (`button`, `a`, `[role="button"]`, `.btn`)
2. Performs 4 rapid clicks with 100ms delays
3. Triggers Datadog rage click detection
**RUM Signal**: `action.frustration.type:rage_click`

#### `generateDeadClicks(page)`
**Purpose**: Generate dead clicks (clicks on non-interactive elements)
```javascript
await generateDeadClicks(page);
```
**Process**:
1. Finds non-interactive elements (`div`, `span`, `p`, `h1-h6`, `img`)
2. Clicks on static element that produces no action
3. Triggers Datadog dead click detection
**RUM Signal**: `action.frustration.type:dead_click`

#### `generateErrorClicks(page)`
**Purpose**: Generate error clicks (clicks before JavaScript errors)
```javascript
await generateErrorClicks(page);
```
**Process**:
1. Injects temporary error handler
2. Clicks on error-prone elements
3. Triggers intentional JavaScript errors (`nonexistentFunction()`)
4. Cleans up error handler
**RUM Signal**: `action.frustration.type:error_click`

#### `generateRandomFrustrationSignal(page)`
**Purpose**: Generate random frustration signal
```javascript
const signalType = await generateRandomFrustrationSignal(page);
console.log(`Generated ${signalType} frustration signal`);
```
**Process**:
1. Randomly selects one of: `rage`, `dead`, or `error`
2. Calls appropriate generator function
3. Returns the signal type generated
**Return Value**: `'rage'`, `'dead'`, or `'error'`

#### Frustration Signal Integration
**Available in all sessions**:
```javascript
const { 
  generateRageClicks,
  generateDeadClicks, 
  generateErrorClicks,
  generateRandomFrustrationSignal
} = require('../utils');

// Use in any session
await generateRandomFrustrationSignal(page);
```

**Expected RUM Data**:
- **Frustration Count**: `session.frustration.count:>1`
- **Signal Types**: `action.frustration.type:rage_click|dead_click|error_click`
- **Session Tags**: `frustration detected`
- **Performance Waterfall**: Actions containing frustration signals

### Usage Examples

#### Basic Session Flow
```javascript
const { selectHomePageProduct, addToCart, checkout } = require('../utils');

// Navigate to home page
await page.goto(url);

// Select and add product
await selectHomePageProduct(page);
await addToCart(page);

// Complete checkout
await checkout(page);
```

#### Advanced Session with Discounts
```javascript
const { useDiscountCode, checkout } = require('../utils');

// Checkout with discount code
await checkout(page); // Automatically uses discount codes 50% of the time
```

#### Custom Product Selection
```javascript
const { selectProduct, selectRelatedProduct } = require('../utils');

// Select any product
await selectProduct(page);

// Select related product
await selectRelatedProduct(page);
```

### Error Handling

All utility functions include comprehensive error handling:
- **Timeouts**: Prevent infinite waiting
- **Fallbacks**: Alternative approaches when primary method fails
- **Logging**: Clear console messages for debugging
- **Graceful Degradation**: Continue execution even if some steps fail
