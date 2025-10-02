// Configuration module for Puppeteer script

const config = {
  // Environment variables with defaults
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  puppeteerBrowser: process.env.PUPPETEER_BROWSER || 'chrome',
  
  // Concurrency settings
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000,
  maxConcurrency: parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8,
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits
  safetyLimits: {
    memoryThreshold: 0.80, // 80%
    cpuThreshold: 0.85, // 85%
    maxMemoryMB: 12000 // 12GB
  },
  
  // Browser pool settings (minimum 6, maximum 20)
  browserPoolSize: Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 6), 20),
  
  // Session settings (minimum 16 sessions)
  totalSessions: Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8, 16),
  sessionDelay: 2000 // Random delay up to 2 seconds
};

// Debug logging
console.log('🔧 Config loaded:', config.storedogUrl, `(${config.maxConcurrency} concurrent)`);

module.exports = config;
