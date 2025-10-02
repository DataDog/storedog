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
| `PUPPETEER_SYSTEM_MEMORY` | `8GB` | System memory tier (`8GB`, `16GB`, `32GB`) - auto-sets Node.js heap |
| `PUPPETEER_STARTUP_DELAY` | `10000` | Initial delay before starting sessions (ms) |
| `PUPPETEER_RAMP_INTERVAL` | `30000` | Time between concurrency increases (ms) |
| `PUPPETEER_BROWSER` | `chrome` | Browser engine (`chrome` or `firefox`) |
| `PUPPETEER_ENABLE_CACHE` | `false` | Enable browser caching |

### System Memory Configuration

The `PUPPETEER_SYSTEM_MEMORY` environment variable automatically sets the appropriate Node.js heap size for your system. This is essential for preventing "JavaScript heap out of memory" errors.

#### Memory Tier Settings

| System Memory | Node.js Heap | Recommended Concurrent | Max Browser Pool |
|---------------|--------------|----------------------|------------------|
| **8GB** | 3GB | 12-18 sessions | 18 browsers |
| **16GB** | 6GB | 20-32 sessions | 20 browsers |
| **32GB** | 8GB | 32-50 sessions | 20 browsers |

#### Usage Examples

**8GB System:**
```bash
export PUPPETEER_SYSTEM_MEMORY=8GB
export PUPPETEER_MAX_CONCURRENT=18
# Automatically sets: 3GB Node.js heap
```

**16GB System:**
```bash
export PUPPETEER_SYSTEM_MEMORY=16GB
export PUPPETEER_MAX_CONCURRENT=32
# Automatically sets: 6GB Node.js heap
```

**32GB+ System:**
```bash
export PUPPETEER_SYSTEM_MEMORY=32GB
export PUPPETEER_MAX_CONCURRENT=50
# Automatically sets: 8GB Node.js heap
```

**Docker Deployment:**
```yaml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB
  - PUPPETEER_MAX_CONCURRENT=32
  - PUPPETEER_BROWSER_POOL_SIZE=20
```

### Browser Pool Configuration

The `PUPPETEER_BROWSER_POOL_SIZE` controls how many browser instances are created. You have independent control over concurrent sessions and browser pool size for optimal performance tuning.

#### Browser Pool vs. Concurrent Sessions

- **`PUPPETEER_MAX_CONCURRENT`**: How many sessions run simultaneously
- **`PUPPETEER_BROWSER_POOL_SIZE`**: How many browser instances are available
- **Ratio**: Sessions per browser (affects performance and memory)

#### Scaling Strategies by System Size

**8GB Systems:**
```bash
# Conservative (guaranteed stable)
export PUPPETEER_MAX_CONCURRENT=12
export PUPPETEER_BROWSER_POOL_SIZE=12   # 1:1 ratio

# Balanced performance
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18   # 1:1 ratio

# Memory conservation
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=12   # 1.5:1 ratio (sessions wait, less memory)
```

**16GB Systems:**
```bash
# High performance
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=20   # 1.6:1 ratio (max browsers)

# Optimal 1:1 ratio
export PUPPETEER_MAX_CONCURRENT=20
export PUPPETEER_BROWSER_POOL_SIZE=20   # 1:1 ratio (no waiting)
```

**32GB+ Systems:**
```bash
# Maximum throughput
export PUPPETEER_MAX_CONCURRENT=50
export PUPPETEER_BROWSER_POOL_SIZE=20   # 2.5:1 ratio (high session reuse)

# Balanced high performance
export PUPPETEER_MAX_CONCURRENT=40
export PUPPETEER_BROWSER_POOL_SIZE=20   # 2:1 ratio
```

#### Browser Pool Limits and Memory Impact

| Browser Count | Memory Usage | Best For |
|---------------|--------------|----------|
| 6 browsers | ~1.2-2.4GB | Very low memory systems |
| 12 browsers | ~2.4-4.8GB | 8GB systems, memory conservation |
| 18 browsers | ~3.6-7.2GB | 8GB systems, balanced performance |
| 20 browsers | ~4.0-8.0GB | 16GB+ systems, maximum performance |

**Key Points:**
- **Minimum**: 6 browsers (even with 1-2 concurrent sessions)
- **Maximum**: 20 browsers (prevents excessive memory usage)
- **Memory per browser**: ~200-400MB depending on pages loaded
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

These are configured in `config.js` and can be modified if needed:

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

**8GB Systems:**
```bash
# Start here - proven stable
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18
```

**16GB Systems:**
```bash
# Recommended starting point
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=20
```

**32GB+ Systems:**
```bash
# High throughput configuration
export PUPPETEER_MAX_CONCURRENT=50
export PUPPETEER_BROWSER_POOL_SIZE=20
```

#### Advanced Tuning

**Memory Pressure? Reduce browsers first:**
```bash
export PUPPETEER_MAX_CONCURRENT=18     # Keep high concurrency
export PUPPETEER_BROWSER_POOL_SIZE=12  # Reduce memory usage
```

**Need faster session starts? Add browsers:**
```bash
export PUPPETEER_MAX_CONCURRENT=16     # Moderate concurrency
export PUPPETEER_BROWSER_POOL_SIZE=20  # Extra browsers for speed
```

**Node.js heap pressure? May need:**
```bash
export NODE_OPTIONS="--max-old-space-size=3072"  # 3GB heap for high concurrency
```

#### Scaling Path Examples

**8GB → 16GB System Upgrade:**
```bash
# Before (8GB)
export PUPPETEER_MAX_CONCURRENT=18
export PUPPETEER_BROWSER_POOL_SIZE=18

# After (16GB) - 78% more throughput
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=20
```

**16GB → 32GB System Upgrade:**
```bash
# Before (16GB)
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=20

# After (32GB) - 56% more throughput
export PUPPETEER_MAX_CONCURRENT=50
export PUPPETEER_BROWSER_POOL_SIZE=20
```

#### Troubleshooting Memory Issues

**"JavaScript heap out of memory" errors:**
```bash
# Set system memory tier (recommended)
export PUPPETEER_SYSTEM_MEMORY=16GB  # Auto-sets 6GB heap

# Or manually set Node.js heap size
export NODE_OPTIONS="--max-old-space-size=6144"  # 6GB
```

**System memory pressure:**
```bash
# Reduce browser pool first (keeps concurrency high)
export PUPPETEER_BROWSER_POOL_SIZE=12  # Instead of 18-20

# If still having issues, reduce concurrency
export PUPPETEER_MAX_CONCURRENT=16     # Instead of 18+
```

**Container memory limits:**
```yaml
# Docker/Kubernetes - ensure adequate memory limits
resources:
  limits:
    memory: "16Gi"  # Match your PUPPETEER_SYSTEM_MEMORY setting
```

## 🚀 Usage

### Basic Usage
```bash
# Run with default settings (8GB system)
node puppeteer-modular.js

# Run with custom URL
node puppeteer-modular.js http://localhost:3000

# Run on 16GB system with high concurrency
export PUPPETEER_SYSTEM_MEMORY=16GB
export PUPPETEER_MAX_CONCURRENT=32
export STOREDOG_URL=http://localhost:3000
node puppeteer-modular.js
```

### Docker Usage
```bash
# Using docker-compose for 16GB system
PUPPETEER_SYSTEM_MEMORY=16GB PUPPETEER_MAX_CONCURRENT=32 docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB
  - PUPPETEER_MAX_CONCURRENT=32
  - PUPPETEER_BROWSER_POOL_SIZE=20
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
        - name: PUPPETEER_SYSTEM_MEMORY
          value: "16GB"
        - name: PUPPETEER_MAX_CONCURRENT
          value: "32"
        - name: PUPPETEER_BROWSER_POOL_SIZE
          value: "20"
        - name: STOREDOG_URL
          value: "http://frontend-service:3000"
        resources:
          limits:
            memory: "16Gi"  # Match PUPPETEER_SYSTEM_MEMORY
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
