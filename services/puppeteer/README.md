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
| `PUPPETEER_BROWSER_POOL_SIZE` | `same as concurrent` | Number of browser instances in pool (6-18) |
| `PUPPETEER_STARTUP_DELAY` | `10000` | Initial delay before starting sessions (ms) |
| `PUPPETEER_RAMP_INTERVAL` | `30000` | Time between concurrency increases (ms) |
| `PUPPETEER_BROWSER` | `chrome` | Browser engine (`chrome` or `firefox`) |
| `PUPPETEER_ENABLE_CACHE` | `false` | Enable browser caching |
| `SKIP_SESSION_CLOSE` | `false` | Skip RUM session closure |

### Memory Management

The script uses automatic memory optimization with browser-level memory limits and garbage collection after each session.

#### Current Memory Configuration

| System Type | Recommended Concurrent | Browser Pool | Expected Memory |
|-------------|----------------------|--------------|-----------------|
| **n2-standard-2 (8GB)** | 12-18 sessions | 18 browsers | ~6-8GB total |
| **n2-standard-4 (16GB)** | 20-32 sessions | 18 browsers | ~8-12GB total |

#### Key Memory Features
- **Chrome browser limit**: 256MB per browser process
- **Automatic garbage collection**: After each session completion  
- **Browser context clearing**: Fresh context for each session
- **Safety limits**: 12GB max, 80% memory threshold

### Browser Pool Configuration

The `PUPPETEER_BROWSER_POOL_SIZE` controls how many browser instances are created. You have independent control over concurrent sessions and browser pool size for optimal performance tuning.

#### Browser Pool vs. Concurrent Sessions

- **`PUPPETEER_MAX_CONCURRENT`**: How many sessions run simultaneously
- **`PUPPETEER_BROWSER_POOL_SIZE`**: How many browser instances are available
- **Ratio**: Sessions per browser (affects performance and memory)

#### Scaling Strategies

**8GB Systems (n2-standard-2):**
```bash
# Recommended configuration
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18   # 1:1 ratio

# Memory conservation
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=12   # 1.5:1 ratio (sessions wait, less memory)
```

**16GB Systems (n2-standard-4):**
```bash
# High performance
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=18   # 1.8:1 ratio

# Optimal balance
export PUPPETEER_MAX_CONCURRENT=20
export PUPPETEER_BROWSER_POOL_SIZE=18   # 1.1:1 ratio
```

#### Browser Pool Limits and Memory Impact

| Browser Count | Memory Usage | Best For |
|---------------|--------------|----------|
| 6 browsers | ~1.5-3GB | Very low memory systems |
| 12 browsers | ~3-6GB | Memory conservation |
| 18 browsers | ~4.5-9GB | Balanced performance (recommended) |

**Key Points:**
- **Minimum**: 6 browsers (even with 1-2 concurrent sessions)
- **Maximum**: 18 browsers (prevents excessive memory usage)
- **Memory per browser**: ~256MB (with --max_old_space_size limit)
- **1:1 ratio**: Optimal performance (no session waiting)
- **Higher ratios**: Memory conservation (sessions wait for available browsers)

#### Performance vs. Memory Trade-offs

**More Browsers (1:1 ratio):**
- ✅ Faster session starts (no waiting)
- ✅ Better concurrency
- ❌ Higher memory usage
- ❌ More system resources

**Fewer Browsers (higher ratios):**
- ✅ Lower memory usage
- ✅ Fewer system resources
- ❌ Sessions wait in queue
- ❌ Potential Node.js memory pressure from queuing

### Memory Safety Limits (Internal)

These are configured in `config.js` and should not need modification:

```javascript
safetyLimits: {
  memoryThreshold: 0.80,    // 80% of available RAM
  cpuThreshold: 0.85,       // 85% CPU usage  
  maxMemoryMB: 12000        // 12GB absolute limit
}
```

### Concurrency Configuration

The script uses progressive concurrency ramping to prevent memory spikes at startup. You can independently control concurrent sessions and browser pool size for optimal tuning.

#### Quick Start Recommendations

**8GB Systems (n2-standard-2):**
```bash
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18
```

**16GB Systems (n2-standard-4):**
```bash
export PUPPETEER_MAX_CONCURRENT=20
export PUPPETEER_BROWSER_POOL_SIZE=18
```

#### Advanced Tuning

**Memory Pressure? Reduce browsers first:**
```bash
export PUPPETEER_MAX_CONCURRENT=18     # Keep high concurrency
export PUPPETEER_BROWSER_POOL_SIZE=12  # Reduce memory usage
```

**Need faster session starts? Use 1:1 ratio:**
```bash
export PUPPETEER_MAX_CONCURRENT=16     # Moderate concurrency
export PUPPETEER_BROWSER_POOL_SIZE=16  # No session waiting
```

## 🚀 Usage

### Basic Usage
```bash
# Run with default settings (8GB system)
node puppeteer-modular.js

# Run with custom URL
node puppeteer-modular.js http://localhost:3000

# Run with specific concurrency
export PUPPETEER_MAX_CONCURRENT=20
export STOREDOG_URL=http://localhost:3000
node puppeteer-modular.js
```

### Docker Usage
```bash
# Using docker-compose
PUPPETEER_MAX_CONCURRENT=20 docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_MAX_CONCURRENT=20
  - PUPPETEER_BROWSER_POOL_SIZE=18
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
        - name: PUPPETEER_BROWSER_POOL_SIZE
          value: "18"
        - name: STOREDOG_URL
          value: "http://frontend-service:3000"
        resources:
          limits:
            memory: "16Gi"
            cpu: "8000m"
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
