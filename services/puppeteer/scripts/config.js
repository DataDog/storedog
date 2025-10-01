// Configuration module for Puppeteer script
const path = require('path');

const config = {
  // Environment variables with defaults
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  puppeteerTimeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 40000,
  puppeteerBrowser: process.env.PUPPETEER_BROWSER || 'chrome',
  
  // Concurrency settings
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000,
  maxConcurrency: parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 8,
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits
  safetyLimits: {
    maxConcurrency: 50, // Hard limit
    memoryThreshold: 0.80, // 80%
    cpuThreshold: 0.85, // 85%
    maxMemoryMB: 12000 // 12GB
  },
  
  // File paths
  devicesPath: path.join(__dirname, 'devices.json'),
  
  // Browser pool settings
  browserPoolSize: 6,
  
  // Session settings
  totalSessions: 16,
  sessionDelay: 2000 // Random delay up to 2 seconds
};

module.exports = config;
