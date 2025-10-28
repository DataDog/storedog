// Utility functions for Puppeteer traffic generator
// This file contains low-level helpers for logging, memory management, and timing

// Import sleep from Node.js timers/promises module
const { setTimeout: sleep } = require('node:timers/promises');

// Lazy-load config to avoid circular dependency
let config;
const getConfig = () => {
  if (!config) {
    config = require('./config');
  }
  return config;
};

// Helper function for critical logging (always shown, even in quiet mode)
const criticalLog = (...args) => {
  console.log(...args);
};

// Log current memory usage with context label
const logMemoryUsage = (context) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memUsageGB = (memUsageMB / 1024).toFixed(2);
  criticalLog(`💾 Memory Usage (${context}): ${memUsageMB}MB (${memUsageGB}GB)`);
};

// Force JavaScript garbage collection to free up memory
const forceGC = () => {
  if (global.gc) {
    logMemoryUsage('before forceGC');
    global.gc();
    if (config.debug) {
      logMemoryUsage('after forceGC');
      console.log('🗑️  Garbage collection triggered');
    }
  }
};

module.exports = {
  sleep,
  logMemoryUsage,
  forceGC,
  criticalLog
};
