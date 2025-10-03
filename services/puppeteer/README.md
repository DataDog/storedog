# Puppeteer Continuous Traffic Generator

A modular Puppeteer script for generating **continuous realistic traffic** to the Storedog application for RUM SDK testing and performance monitoring.

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

All sessions run **continuously** with random selection to maintain realistic traffic patterns.

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `STOREDOG_URL` | `http://service-proxy:80` | Target application URL |
| `PUPPETEER_MAX_CONCURRENT` | `16` | **Continuous concurrent sessions** always running |
| `PUPPETEER_BROWSER_POOL_SIZE` | `same as concurrent` | Number of browser instances in pool (no hard limit) |
| `PUPPETEER_SYSTEM_MEMORY` | `8GB` | System memory profile (`8GB`, `16GB`, `32GB`) |
| `PUPPETEER_DEBUG` | `false` | Enable verbose logging (⚠️ increases memory usage) |
| `PUPPETEER_STARTUP_DELAY` | `10000` | Initial delay before starting sessions (ms) |
| `PUPPETEER_RAMP_INTERVAL` | `30000` | Time between concurrency increases (ms) |
| `PUPPETEER_BROWSER` | `chrome` | Browser engine (`chrome` or `firefox`) |
| `PUPPETEER_ENABLE_CACHE` | `false` | Enable browser caching |

### Memory Management

The script uses automatic memory optimization with browser-level memory limits and garbage collection after each session.

#### Current Memory Configuration

| System Memory | Max Concurrent | Max Browsers | Memory Limit | Threshold |
|---------------|----------------|--------------|--------------|-----------|
| **8GB** | 20 sessions | 25 browsers | 6.5GB | 85% |
| **16GB** | 80 sessions | 60 browsers | 13GB | 85% |
| **32GB** | 100 sessions | 80 browsers | 26GB | 85% |

#### Key Memory Features
- **Chrome browser limit**: 256MB per browser process
- **Automatic garbage collection**: After each session completion  
- **Browser context clearing**: Fresh context for each session
- **Memory profiles**: Auto-configured based on `PUPPETEER_SYSTEM_MEMORY`
- **No hard browser limits**: `PUPPETEER_BROWSER_POOL_SIZE` can override profile defaults
- **Optimized logging**: Debug logging disabled by default to reduce memory usage

#### Debugging and Memory Impact

**⚠️ Important**: Logging significantly impacts memory usage at high concurrency!

With 70+ concurrent sessions, verbose logging can consume **100+ MB additional memory** due to:
- Console output buffering
- String object retention
- Log message queuing

**Debug Mode:**
```bash
# Enable verbose logging (for troubleshooting)
export PUPPETEER_DEBUG=true

# Disable verbose logging (production/high concurrency)
export PUPPETEER_DEBUG=false  # Default
```

**Memory Impact:**
- **Debug enabled**: +100-200MB memory usage at 70 concurrency
- **Debug disabled**: Minimal logging overhead
- **Critical logs**: Always shown (memory usage, errors, session completion)

### Browser Pool Configuration

The `PUPPETEER_BROWSER_POOL_SIZE` controls how many browser instances are created. You have independent control over concurrent sessions and browser pool size for optimal performance tuning.

#### Browser Pool vs. Concurrent Sessions

- **`PUPPETEER_MAX_CONCURRENT`**: How many sessions run simultaneously
- **`PUPPETEER_BROWSER_POOL_SIZE`**: How many browser instances are available
- **Ratio**: Sessions per browser (affects performance and memory)

#### Scaling Strategies

**8GB Systems:**
```bash
# Recommended configuration
export PUPPETEER_SYSTEM_MEMORY=8GB
export PUPPETEER_MAX_CONCURRENT=16
export PUPPETEER_BROWSER_POOL_SIZE=16   # 1:1 ratio

# Memory conservation
export PUPPETEER_SYSTEM_MEMORY=8GB
export PUPPETEER_MAX_CONCURRENT=16
export PUPPETEER_BROWSER_POOL_SIZE=12   # 1.3:1 ratio (sessions wait, less memory)
```

**16GB Systems:**
```bash
# High performance
export PUPPETEER_SYSTEM_MEMORY=16GB
export PUPPETEER_MAX_CONCURRENT=70
export PUPPETEER_BROWSER_POOL_SIZE=60   # 1.2:1 ratio

# Optimal balance
export PUPPETEER_SYSTEM_MEMORY=16GB
export PUPPETEER_MAX_CONCURRENT=32
export PUPPETEER_BROWSER_POOL_SIZE=32   # 1:1 ratio
```

**32GB Systems:**
```bash
# Maximum performance
export PUPPETEER_SYSTEM_MEMORY=32GB
export PUPPETEER_MAX_CONCURRENT=100
export PUPPETEER_BROWSER_POOL_SIZE=80   # 1.25:1 ratio
```

#### Browser Pool Limits and Memory Impact

| Browser Count | Memory Usage | Best For |
|---------------|--------------|----------|
| 6 browsers | ~1.5-3GB | Very low memory systems |
| 12 browsers | ~3-6GB | Memory conservation |
| 16 browsers | ~4-8GB | Balanced performance (recommended) |

**Key Points:**
- **Minimum**: 6 browsers (even with 1-2 concurrent sessions)
- **No maximum**: `PUPPETEER_BROWSER_POOL_SIZE` can override profile defaults
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

These are configured in `config.js` based on `PUPPETEER_SYSTEM_MEMORY`:

```javascript
// 8GB Profile
safetyLimits: {
  memoryThreshold: 0.85,    // 85% of available RAM
  cpuThreshold: 0.90,       // 90% CPU usage  
  maxMemoryMB: 6500         // 6.5GB absolute limit
}

// 16GB Profile  
safetyLimits: {
  memoryThreshold: 0.85,    // 85% of available RAM
  cpuThreshold: 0.90,       // 90% CPU usage  
  maxMemoryMB: 13000        // 13GB absolute limit
}

// 32GB Profile
safetyLimits: {
  memoryThreshold: 0.85,    // 85% of available RAM
  cpuThreshold: 0.90,       // 90% CPU usage  
  maxMemoryMB: 26000        // 26GB absolute limit
}
```

### Concurrency Configuration

The script uses progressive concurrency ramping to prevent memory spikes at startup. You can independently control concurrent sessions and browser pool size for optimal tuning.

#### Quick Start Recommendations

**8GB Systems:**
```bash
export PUPPETEER_SYSTEM_MEMORY=8GB
export PUPPETEER_MAX_CONCURRENT=16
export PUPPETEER_BROWSER_POOL_SIZE=16
```

**16GB Systems:**
```bash
export PUPPETEER_SYSTEM_MEMORY=16GB
export PUPPETEER_MAX_CONCURRENT=70
export PUPPETEER_BROWSER_POOL_SIZE=60
```

**32GB Systems:**
```bash
export PUPPETEER_SYSTEM_MEMORY=32GB
export PUPPETEER_MAX_CONCURRENT=100
export PUPPETEER_BROWSER_POOL_SIZE=80
```

#### Advanced Tuning

**Memory Pressure? Reduce browsers first:**
```bash
export PUPPETEER_MAX_CONCURRENT=16     # Keep high concurrency
export PUPPETEER_BROWSER_POOL_SIZE=12  # Reduce memory usage
```

**Need faster session starts? Use 1:1 ratio:**
```bash
export PUPPETEER_MAX_CONCURRENT=16     # Moderate concurrency
export PUPPETEER_BROWSER_POOL_SIZE=16  # No session waiting
```

## 🚀 Usage

### Docker Usage
```bash
# Using docker-compose
PUPPETEER_MAX_CONCURRENT=20 docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_SYSTEM_MEMORY=16GB
  - PUPPETEER_MAX_CONCURRENT=70
  - PUPPETEER_BROWSER_POOL_SIZE=60
  - STOREDOG_URL=http://service-proxy:80
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
          value: "70"
        - name: PUPPETEER_BROWSER_POOL_SIZE
          value: "60"
        - name: STOREDOG_URL
          value: "http://service-proxy.storedog.svc.cluster.local"
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
- **Pool Size**: Configurable with `PUPPETEER_BROWSER_POOL_SIZE` (no hard limits)
- **Browser Reuse**: Sessions share browser instances for efficiency
- **Context Clearing**: Each session gets a clean browser context for unique RUM sessions
- **Memory Optimization**: Automatic cleanup and garbage collection

### Session Management
- **Continuous Operation**: Maintains constant concurrent sessions indefinitely
- **Progressive Ramp-Up**: Gradually increases concurrent sessions (4 → 8 → 25% → 50% → 75% → 100%)
- **Immediate Replacement**: When a session completes, a new one starts immediately
- **Random Session Selection**: Picks session types randomly for realistic traffic patterns
- **Resource Monitoring**: Tracks memory usage with safety limits
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals

#### Continuous Traffic Generation

The script maintains **constant concurrent sessions** by:

1. **Initial Ramp-Up**: Progressive increase to target concurrency
2. **Steady State**: Maintains exact target concurrent sessions
3. **Session Replacement**: Completed sessions → immediately replaced with new ones
4. **Random Distribution**: Each new session randomly selects from available types
5. **Infinite Operation**: Runs continuously until stopped

```
🔄 Starting continuous traffic generation with 4 session types
🎯 Target: 20 concurrent sessions always running

Initial Ramp-Up:
Start: 4 concurrent sessions
30s: 8 concurrent sessions  
60s: 25% of max concurrent (5 sessions)
90s: 50% of max concurrent (10 sessions)
120s: 75% of max concurrent (15 sessions)
150s: 100% of max concurrent (20 sessions)

Steady State (Continuous):
▶️ Starting session 21 (20/20)  ← Replaces completed session
▶️ Starting session 22 (20/20)  ← Replaces completed session
▶️ Starting session 23 (20/20)  ← Always maintains target
... (runs forever)
```

**Ramp-Up Control:**
- **`PUPPETEER_RAMP_INTERVAL=0`**: Skip ramp-up, go straight to max (⚠️ risky)
- **`PUPPETEER_RAMP_INTERVAL=5000`**: Fast 5-second intervals
- **`PUPPETEER_RAMP_INTERVAL=30000`**: Default 30-second intervals (recommended)

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

- **Continuous Traffic Generation**: Maintains constant concurrent sessions indefinitely
- **Dynamic Session Loading**: Automatically discovers session files
- **Progressive Ramp-Up**: Ramps up from 4 to max sessions, then maintains steady state
- **Immediate Session Replacement**: Completed sessions instantly replaced with new ones
- **Random Session Distribution**: Realistic traffic patterns with random session selection
- **Device Emulation**: 12 realistic device profiles
- **Memory Management**: Automatic garbage collection and safety limits
- **Error Handling**: Graceful failure recovery with navigation fallbacks
- **Browser Pooling**: Efficient browser reuse with context clearing
- **RUM Integration**: Unique sessions with frustration signal generation
- **UTM Tracking**: Random campaign parameters for analytics
- **Debug Logging Control**: Configurable verbose logging to reduce memory usage

## 📊 Monitoring & Troubleshooting

### Health Check Commands

**Quick Status Check:**
```bash
# See current running sessions count
docker logs <container> | grep "cleaned up" | tail -5

# Check if sessions are starting continuously
docker logs <container> | grep "▶️ Starting session" | tail -5

# Monitor session replacement activity
docker logs <container> | grep -E "(✅ Completed|🧹.*cleaned up|▶️ Starting)" | tail -10
```

**Problem Detection:**
```bash
# Check for stalls (no new sessions starting)
docker logs <container> | grep "▶️ Starting session" | tail -1

# Check for memory issues
docker logs <container> | grep "Memory limit exceeded"

# Check for session failures
docker logs <container> | grep "❌.*failed" | tail -5
```

**Real-Time Monitoring:**
```bash
# Follow logs with key patterns
docker logs -f <container> | grep -E "(Starting session|Completed|cleaned up|Concurrency)"
```

### Success Indicators

**Healthy Continuous Operation:**
```
▶️ Starting session 45 (20/20)  ← Session numbers increasing
✅ Completed session 42
🧹 Session 42 cleaned up (19 running)
▶️ Starting session 46 (20/20)  ← Immediate replacement
```

**Initial Ramp-Up (Normal):**
```
🚀 Concurrency: 4 sessions (0s elapsed)
🚀 Concurrency: 8 sessions (30s elapsed)
🚀 Concurrency: 20 sessions (90s elapsed)
```

**Key Success Metrics:**
- ✅ **Session numbers continuously increasing** (21, 22, 23...)
- ✅ **Constant target concurrency** showing (X/20)
- ✅ **Regular completion + cleanup messages**
- ✅ **No memory limit exceeded warnings**
