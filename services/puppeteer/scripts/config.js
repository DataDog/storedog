// Configuration module for Puppeteer script

// Machine-specific safety profiles based on memory
const memoryProfiles = {
  '8GB': {
    maxMemoryMB: 6500,      // 6.5GB limit (leave 1.5GB for system)
    memoryThreshold: 0.85,   // 85% threshold
    maxConcurrency: 20,      // Allow testing beyond recommended 18
    maxBrowsers: 25          // Allow more browsers for stress testing
  },
  '16GB': {
    maxMemoryMB: 13000,      // 13GB limit (leave 3GB for system)
    memoryThreshold: 0.85,   // 85% threshold
    maxConcurrency: 80,      // Increased based on real testing (70 works well)
    maxBrowsers: 60          // Reasonable browser pool for 80 sessions
  },
  '32GB': {
    maxMemoryMB: 26000,      // 26GB limit (leave 6GB for system)
    memoryThreshold: 0.85,   // 85% threshold
    maxConcurrency: 100,     // Very high concurrency testing
    maxBrowsers: 80          // High browser count but not 1:1 ratio for efficiency
  }
};

// Detect system memory from environment or default to 8GB
const systemMemory = process.env.PUPPETEER_SYSTEM_MEMORY || '8GB';
const profile = memoryProfiles[systemMemory] || memoryProfiles['8GB'];

const config = {
  // Environment variables with defaults
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  puppeteerBrowser: process.env.PUPPETEER_BROWSER || 'chrome',
  
  // Debug settings
  debug: process.env.PUPPETEER_DEBUG === 'true',
  
  // Concurrency settings (machine-aware)
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000,
  maxConcurrency: Math.min(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, profile.maxConcurrency),
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits (machine-specific)
  safetyLimits: {
    memoryThreshold: profile.memoryThreshold,
    cpuThreshold: 0.90, // 90% CPU threshold for both machines
    maxMemoryMB: profile.maxMemoryMB
  },
  
  // Browser pool settings (machine-aware)
  browserPoolSize: parseInt(process.env.PUPPETEER_BROWSER_POOL_SIZE) || 
                   Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 6), profile.maxBrowsers),
  
  // Session settings
  totalSessions: Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 16),
  sessionDelay: 2000 // Random delay up to 2 seconds
};

// Debug logging
console.log(`🔧 System Memory: ${systemMemory}`);
console.log(`🔧 Config loaded: ${config.storedogUrl} (${config.maxConcurrency} concurrent, ${config.browserPoolSize} browsers)`);
console.log(`🔧 Safety Limits: ${profile.maxMemoryMB}MB max, ${Math.round(profile.memoryThreshold*100)}% threshold`);

module.exports = config;
