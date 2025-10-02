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
| `PUPPETEER_MAX_CONCURRENT` | `varies by tier` | Maximum concurrent sessions |
| `PUPPETEER_MEMORY_TIER` | `8GB` | System memory tier (`8GB`, `16GB`, `32GB`) |
| `PUPPETEER_BROWSER_POOL_SIZE` | `varies by tier` | Number of browser instances in pool |
| `PUPPETEER_STARTUP_DELAY` | `10000` | Initial delay before starting sessions (ms) |
| `PUPPETEER_RAMP_INTERVAL` | `30000` | Time between concurrency increases (ms) |
| `PUPPETEER_BROWSER` | `chrome` | Browser engine (`chrome` or `firefox`) |
| `PUPPETEER_ENABLE_CACHE` | `false` | Enable browser caching |

### Memory Tier Configuration

The `PUPPETEER_MEMORY_TIER` environment variable automatically configures optimal settings based on your system's available memory. This is especially useful for Docker deployments across different sized systems.

#### Available Memory Tiers

| Tier | Node.js Heap | Default Concurrent | Max Browsers | Memory Threshold | Safety Limit |
|------|--------------|-------------------|--------------|------------------|--------------|
| **8GB** | 6GB | 12 sessions | 10 browsers | 75% | 6GB |
| **16GB** | 12GB | 20 sessions | 16 browsers | 80% | 12GB |
| **32GB** | 16GB | 32 sessions | 20 browsers | 85% | 24GB |

#### Usage Examples

```bash
# 8GB system (conservative)
export PUPPETEER_MEMORY_TIER=8GB

# 16GB system (recommended for production)
export PUPPETEER_MEMORY_TIER=16GB

# 32GB+ system (high performance)
export PUPPETEER_MEMORY_TIER=32GB
```

**Docker Compose Example:**
```yaml
environment:
  - PUPPETEER_MEMORY_TIER=16GB
  - STOREDOG_URL=http://frontend:3000
  # Automatically sets: 20 concurrent, 16 browsers, 12GB Node heap
```

**Override Defaults:**
```yaml
environment:
  - PUPPETEER_MEMORY_TIER=16GB           # Base configuration
  - PUPPETEER_MAX_CONCURRENT=25          # Override concurrent sessions
  - PUPPETEER_BROWSER_POOL_SIZE=18       # Override browser pool
```

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

The script uses progressive concurrency ramping to prevent memory spikes at startup. Use `PUPPETEER_MEMORY_TIER` for automatic optimal configuration, or set individual variables for custom tuning.

#### Quick Start with Memory Tiers

**8GB System:**
```bash
export PUPPETEER_MEMORY_TIER=8GB
# Automatically configures: 12 concurrent, 10 browsers, 6GB Node heap
```

**16GB System:**
```bash
export PUPPETEER_MEMORY_TIER=16GB  
# Automatically configures: 20 concurrent, 16 browsers, 12GB Node heap
```

**32GB+ System:**
```bash
export PUPPETEER_MEMORY_TIER=32GB
# Automatically configures: 32 concurrent, 20 browsers, 16GB Node heap
```

#### Manual Configuration (Advanced)

If you need custom settings, you can override the memory tier defaults:

```bash
# Start with a memory tier, then override specific settings
export PUPPETEER_MEMORY_TIER=16GB
export PUPPETEER_MAX_CONCURRENT=25          # Push beyond default 20
export PUPPETEER_BROWSER_POOL_SIZE=18       # More browsers for better distribution
export PUPPETEER_STARTUP_DELAY=20000        # Slower ramp-up for stability
export PUPPETEER_RAMP_INTERVAL=60000        # More time between increases
```

## 🚀 Usage

### Basic Usage
```bash
# Run with default settings (8GB tier)
node puppeteer-modular.js

# Run with custom URL
node puppeteer-modular.js http://localhost:3000

# Run with memory tier configuration
export PUPPETEER_MEMORY_TIER=16GB
export STOREDOG_URL=http://localhost:3000
node puppeteer-modular.js
```

### Docker Usage
```bash
# Using docker-compose with memory tier
PUPPETEER_MEMORY_TIER=16GB docker-compose up puppeteer

# Or set in docker-compose.yml
environment:
  - PUPPETEER_MEMORY_TIER=16GB
  - STOREDOG_URL=http://frontend:3000
  
# Advanced: Override specific settings
environment:
  - PUPPETEER_MEMORY_TIER=16GB
  - PUPPETEER_MAX_CONCURRENT=25
  - PUPPETEER_BROWSER_POOL_SIZE=18
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
        - name: PUPPETEER_MEMORY_TIER
          value: "16GB"
        - name: STOREDOG_URL
          value: "http://frontend-service:3000"
        resources:
          limits:
            memory: "16Gi"  # Match memory tier
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
