# Puppeteer Traffic Generator

A modular Puppeteer script for generating realistic traffic to the Storedog application for RUM SDK testing.

## 📁 Project Structure

The script uses a modular architecture for maintainability and extensibility:

```
scripts/
├── puppeteer-modular.js     # Main entry point
├── run.js                   # Simple wrapper
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
    └── browsingSession.js # General browsing
```

### Architecture Benefits

- **Separation of Concerns**: Each module has a specific responsibility
- **Easy Maintenance**: Changes to one module don't affect others
- **Extensibility**: Add new sessions without modifying core code
- **Dynamic Discovery**: Sessions are automatically loaded at runtime
- **Testability**: Individual modules can be tested in isolation

## 🎯 Session Types

- **HomePageSession**: Home page browsing with product selection and cart operations
- **FrustrationSession**: Generates all three types of frustration signals for RUM testing
- **TaxonomySession**: Category browsing with Best Sellers navigation
- **BrowsingSession**: General browsing patterns with navbar navigation

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STOREDOG_URL` | `http://service-proxy:80` | Target application URL |
| `PUPPETEER_MAX_CONCURRENT` | `8` | Maximum concurrent sessions |
| `PUPPETEER_BROWSER_POOL_SIZE` | `same as concurrent` | Number of browser instances in pool (6-20) |
| `PUPPETEER_STARTUP_DELAY` | `10000` | Initial delay before starting sessions (ms) |
| `PUPPETEER_RAMP_INTERVAL` | `30000` | Time between concurrency increases (ms) |
| `PUPPETEER_BROWSER` | `chrome` | Browser engine (`chrome` or `firefox`) |
| `PUPPETEER_ENABLE_CACHE` | `false` | Enable browser caching |

### Browser Pool Configuration

The `PUPPETEER_BROWSER_POOL_SIZE` controls how many browser instances are created. More browsers use more memory but reduce session waiting time.

#### Browser Pool Strategies

**1:1 Ratio (Default):**
```bash
export PUPPETEER_MAX_CONCURRENT=18
# Automatically gets 18 browsers (1 per session)
```

**Memory Conservation:**
```bash
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=12  # 1.5 sessions per browser
```

**High Performance:**
```bash
export PUPPETEER_MAX_CONCURRENT=16
export PUPPETEER_BROWSER_POOL_SIZE=20  # Extra browsers for faster session starts
```

#### Browser Pool Limits
- **Minimum**: 6 browsers (even with 1-2 concurrent sessions)
- **Maximum**: 20 browsers (prevents excessive memory usage)
- **Default**: Same as concurrent sessions (1:1 ratio)

### Memory Safety Limits (Internal)

These are configured in `config.js` and can be modified if needed:

```javascript
safetyLimits: {
  memoryThreshold: 0.80,    // 80% of available RAM
  cpuThreshold: 0.85,       // 85% CPU usage  
  maxMemoryMB: 12000        // 12GB absolute limit
}
```

### Concurrency Configuration

The script uses progressive concurrency ramping to prevent memory spikes at startup.

#### Recommended Settings for 8GB Systems

**Conservative (Guaranteed Stable):**
```bash
export PUPPETEER_MAX_CONCURRENT=12
export PUPPETEER_BROWSER_POOL_SIZE=12  # 1:1 ratio
```

**Balanced (Good Performance):**
```bash
export PUPPETEER_MAX_CONCURRENT=16
export PUPPETEER_BROWSER_POOL_SIZE=16  # 1:1 ratio
```

**Aggressive (Push Limits):**
```bash
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18  # 1:1 ratio
# May need NODE_OPTIONS="--max-old-space-size=3072"
```

#### Memory Conservation Strategy

If hitting memory limits, reduce browser pool instead of concurrent sessions:

```bash
export PUPPETEER_MAX_CONCURRENT=18     # Keep high concurrency
export PUPPETEER_BROWSER_POOL_SIZE=12  # Reduce browsers (1.5:1 ratio)
```

This trades some performance (session waiting) for memory savings.

## 🚀 Usage

### Basic Usage
```bash
# Run with default settings (8 concurrent sessions)
node puppeteer-modular.js

# Run with custom URL
node puppeteer-modular.js http://localhost:3000

# Run with custom concurrency
export PUPPETEER_MAX_CONCURRENT=16
export STOREDOG_URL=http://localhost:3000
node puppeteer-modular.js
```

### Docker Usage
```bash
# Using docker-compose
PUPPETEER_MAX_CONCURRENT=16 docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_MAX_CONCURRENT=16
  - PUPPETEER_BROWSER_POOL_SIZE=16
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
          value: "16"
        - name: PUPPETEER_BROWSER_POOL_SIZE
          value: "16"
        - name: STOREDOG_URL
          value: "http://frontend-service:3000"
        resources:
          limits:
            memory: "8Gi"
            cpu: "4000m"
```

## 📊 Device Emulation

The script includes 12 realistic device profiles with authentic user agents, viewports, and browser configurations.

### Device Categories
- **Mobile**: iPhone and Android devices (6 devices)
- **Tablet**: iPad Pro (1 device)
- **Desktop**: MacBook and Windows PC (5 devices)
- **Browsers**: Safari, Chrome, Firefox, Edge

### Adding Custom Devices

Edit `scripts/devices.json` and add new device objects:

```json
{
  "name": "Custom Device",
  "userAgent": "Mozilla/5.0...",
  "viewport": { 
    "width": 375, 
    "height": 812, 
    "deviceScaleFactor": 2, 
    "isMobile": true, 
    "hasTouch": true 
  },
  "category": "mobile",
  "os": "iOS",
  "browser": "Safari"
}
```

## 🔄 Browser Pool & Session Management

### Browser Pool
- **Pool Size**: Scales with `PUPPETEER_MAX_CONCURRENT` (6-20 browsers)
- **Browser Reuse**: Sessions share browser instances for efficiency
- **Context Clearing**: Each session gets a clean browser context for unique RUM sessions
- **Memory Optimization**: Automatic cleanup and garbage collection

### Session Management
- **Progressive Ramp-Up**: Gradually increases concurrent sessions
- **Balanced Distribution**: Ensures all session types run at least once
- **Resource Monitoring**: Tracks memory usage with safety limits
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals

## 🛠️ Key Utility Functions

### Core Functions
- `sleep(ms)` - Async delay using Node.js timers
- `logMemoryUsage(context)` - Memory usage logging with GB display
- `setUtmParams(url)` - Add random UTM parameters for campaign tracking
- `optimizePageResources(page)` - Configure page for optimal performance

### Product & Cart Operations
- `selectHomePageProduct(page)` - Select random product from home page
- `selectProduct(page)` - Select random product from current page
- `addToCart(page)` - Add current product to cart with variant selection
- `checkout(page)` - Complete checkout process with optional discount codes

### Navigation
- `goToFooterPage(page)` - Navigate to random footer page

### Frustration Signal Generators
Based on [Datadog RUM Frustration Signals](https://docs.datadoghq.com/real_user_monitoring/browser/frustration_signals/):

- `generateRageClicks(page)` - 3+ clicks in 1 second
- `generateDeadClicks(page)` - Clicks on non-interactive elements  
- `generateErrorClicks(page)` - Clicks followed by JavaScript errors
- `generateRandomFrustrationSignal(page)` - Random frustration signal

## 🔧 Adding New Sessions

1. Create new file in `sessions/` directory
2. Extend `BaseSession` class
3. Implement `run()` method
4. That's it! Sessions are automatically discovered

**Example Session:**
```javascript
const BaseSession = require('./baseSession');
const { selectProduct, addToCart } = require('../utils');

class CustomSession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      await page.goto(config.storedogUrl);
      await selectProduct(page);
      await addToCart(page);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = CustomSession;
```

## 🔧 Features

- **Dynamic Session Loading**: Automatically discovers session files
- **Progressive Concurrency**: Ramps up from 2 to max sessions
- **Device Emulation**: 12 realistic device profiles
- **Memory Management**: Automatic garbage collection and safety limits
- **Error Handling**: Graceful failure recovery
- **Browser Pooling**: Efficient browser reuse with context clearing
- **RUM Integration**: Unique sessions with frustration signal generation
- **UTM Tracking**: Random campaign parameters for analytics
