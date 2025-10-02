// Configuration module for Puppeteer script

// Get system memory tier and set appropriate safety limits
const systemMemory = process.env.PUPPETEER_SYSTEM_MEMORY || '8GB';
const memoryLimits = {
  '8GB': { maxMemoryMB: 5000, memoryThreshold: 0.70 },   // 5GB limit, 70% threshold
  '16GB': { maxMemoryMB: 10000, memoryThreshold: 0.75 }, // 10GB limit, 75% threshold  
  '32GB': { maxMemoryMB: 20000, memoryThreshold: 0.80 }  // 20GB limit, 80% threshold
};
const limits = memoryLimits[systemMemory] || memoryLimits['8GB'];

const config = {
  // Environment variables with defaults
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  puppeteerBrowser: process.env.PUPPETEER_BROWSER || 'chrome',
  
  // Concurrency settings
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000,
  maxConcurrency: parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8,
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits (scales with system memory)
  safetyLimits: {
    memoryThreshold: limits.memoryThreshold,
    cpuThreshold: 0.85, // 85%
    maxMemoryMB: limits.maxMemoryMB
  },
  
  // Browser pool settings (configurable, defaults to 1:1 ratio with sessions)
  browserPoolSize: parseInt(process.env.PUPPETEER_BROWSER_POOL_SIZE) || 
                   Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 6), 20),
  
  // Session settings
  totalSessions: Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 16),
  sessionDelay: 2000, // Random delay up to 2 seconds
  
  // System memory tier info
  systemMemory: systemMemory
};

// Debug logging
console.log('🔧 Config loaded:', config.storedogUrl, `(${config.maxConcurrency} concurrent, ${config.browserPoolSize} browsers)`);
console.log(`🧠 System memory: ${systemMemory} (${limits.maxMemoryMB}MB limit, ${Math.round(limits.memoryThreshold*100)}% threshold)`);

module.exports = config;
