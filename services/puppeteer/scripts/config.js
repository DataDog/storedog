// Configuration module for Puppeteer script

// Memory tier configurations
const memoryConfigs = {
  '8GB': {
    maxMemoryMB: 6000,
    memoryThreshold: 0.75,
    defaultConcurrency: 12,
    maxBrowsers: 10,
    nodeHeapMB: 6144
  },
  '16GB': {
    maxMemoryMB: 12000,
    memoryThreshold: 0.80,
    defaultConcurrency: 20,
    maxBrowsers: 16,
    nodeHeapMB: 12288
  },
  '32GB': {
    maxMemoryMB: 24000,
    memoryThreshold: 0.85,
    defaultConcurrency: 32,
    maxBrowsers: 20,
    nodeHeapMB: 16384
  }
};

// Get memory configuration based on PUPPETEER_MEMORY_TIER
const memoryTier = process.env.PUPPETEER_MEMORY_TIER || '8GB';
const memoryConfig = memoryConfigs[memoryTier] || memoryConfigs['8GB'];

console.log(`🧠 Memory tier: ${memoryTier} (Node heap: ${memoryConfig.nodeHeapMB}MB, Max memory: ${memoryConfig.maxMemoryMB}MB)`);

const config = {
  // Environment variables with defaults
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  puppeteerBrowser: process.env.PUPPETEER_BROWSER || 'chrome',
  
  // Concurrency settings (with memory-tier defaults)
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000,
  maxConcurrency: parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || memoryConfig.defaultConcurrency,
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits (based on memory tier)
  safetyLimits: {
    memoryThreshold: memoryConfig.memoryThreshold,
    cpuThreshold: 0.85,
    maxMemoryMB: memoryConfig.maxMemoryMB
  },
  
  // Browser pool settings (configurable with memory-tier defaults)
  browserPoolSize: parseInt(process.env.PUPPETEER_BROWSER_POOL_SIZE) || 
                   Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || memoryConfig.defaultConcurrency, 6), memoryConfig.maxBrowsers),
  
  // Session settings
  totalSessions: Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || memoryConfig.defaultConcurrency, 16),
  sessionDelay: 2000, // Random delay up to 2 seconds
  
  // Memory tier info (for reference)
  memoryTier: memoryTier,
  recommendedNodeHeapMB: memoryConfig.nodeHeapMB
};

// Debug logging
console.log('🔧 Config loaded:', config.storedogUrl, `(${config.maxConcurrency} concurrent, ${config.browserPoolSize} browsers)`);

module.exports = config;
