# Puppeteer Traffic Generator

A modular Puppeteer script for generating realistic traffic to the Storedog application for RUM SDK testing.

## 📁 Project Structure

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

## 🎯 Session Types

- **HomePageSession**: Basic home page browsing
- **FrustrationSession**: Intentional frustration signals
- **TaxonomySession**: Category browsing + purchases
- **BrowsingSession**: General browsing patterns
- **SearchSession**: Search functionality

## ⚙️ Configuration

### Environment Variables
- `STOREDOG_URL`: Target URL (default: http://service-proxy:80)
- `PUPPETEER_MAX_CONCURRENT`: Max concurrent sessions (default: 8)
- `PUPPETEER_STARTUP_DELAY`: Startup delay in ms (default: 10000)
- `PUPPETEER_RAMP_INTERVAL`: Ramp-up interval in ms (default: 30000)
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

## 📊 Device Support

- **Mobile**: iPhone, Android devices
- **Tablet**: iPad Pro
- **Desktop**: MacBook, Windows PC
- **Browsers**: Safari, Chrome, Firefox, Edge
- **OS**: iOS, Android, macOS, Windows

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
