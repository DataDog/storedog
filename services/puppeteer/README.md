# Puppeteer Traffic Generator

A modular Puppeteer script for generating realistic traffic to the Storedog application for RUM SDK testing.

## 🚀 Quick Start

### Docker (Recommended)
```bash
docker-compose up puppeteer
```

### Local Development
```bash
node puppeteer-modular.js http://localhost:3000
```

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

### Adding New Sessions
1. Create new file in `sessions/` directory
2. Extend `BaseSession` class
3. Implement `run()` method
4. That's it! No configuration needed

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
