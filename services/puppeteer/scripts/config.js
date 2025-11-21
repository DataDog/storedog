// Configuration for Puppeteer traffic generator
// This file contains only configuration values, no logic or side effects

const { MEMORY_PROFILES } = require('./constants');

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

const systemMemory = process.env.PUPPETEER_SYSTEM_MEMORY;
const profile = MEMORY_PROFILES[systemMemory];

const config = {
  // Storedog URL
  storedogUrl: process.env.STOREDOG_URL,
  
  // Debug mode
  debug: process.env.PUPPETEER_DEBUG === 'true',
  debugSessions: process.env.PUPPETEER_DEBUG_SESSIONS === 'true',
  loop: process.env.PUPPETEER_LOOP,
  
  // Concurrency settings
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY),
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL),
  maxConcurrency: Math.min(parseInt(process.env.PUPPETEER_MAX_CONCURRENT), profile.maxConcurrency),
  
  // Browser settings
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  browserPoolSize: parseInt(process.env.PUPPETEER_BROWSER_POOL_SIZE) || 
                   Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT), 6), profile.maxBrowsers),
  
  // Session settings
  sessionDelay: 2000,
  timeout: parseInt(process.env.PUPPETEER_TIMEOUT) || 60000,
  sessionTypes: process.env.PUPPETEER_SESSION_TYPES.split(',').map(s => s.trim()),
  
  // Safety limits from memory profile
  safetyLimits: {
    memoryThreshold: profile.memoryThreshold,
    cpuThreshold: 0.90,
    maxMemoryMB: profile.maxMemoryMB,
    rampUpPercentages: profile.rampUpPercentages
  },
  
  // Metadata
  systemMemory,
  profile
};

module.exports = config;
