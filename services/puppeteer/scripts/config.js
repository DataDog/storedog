// This file manages all configuration settings for the Puppeteer traffic generator.
// Think of it as the "control panel" where all settings are defined and loaded.

// Import session classes
const BrowsingSession = require('./sessions/browsingSession');
const TaxonomySession = require('./sessions/taxonomySession');
const CheckoutSession = require('./sessions/checkoutSession');
const CartSession = require('./sessions/cartSession');
const ProductSession = require('./sessions/productSession');
const SearchSession = require('./sessions/searchSession');
const NavigationSession = require('./sessions/navigationSession');
const ErrorSession = require('./sessions/errorSession');
const PerformanceSession = require('./sessions/performanceSession');

// Memory profiles define safe operating limits for different machine sizes.
// Each profile specifies how much memory we can use, how many sessions we can run, etc.
// We have three profiles: 8GB (small), 16GB (medium), 32GB (large machines)
const memoryProfiles = {
  '8GB': {
    maxMemoryMB: 6500,      // Maximum memory this script can use (in megabytes)
                            // We leave 1.5GB free for the operating system
    memoryThreshold: 0.85,   // When we hit 85% of max memory, slow down
    maxConcurrency: 20,      // Maximum number of sessions running at the same time
    maxBrowsers: 25,         // Maximum number of browser instances we can open
    rampUpPercentages: [0.20, 0.40, 0.60, 1.0]  // Gradual ramp-up: 20% → 40% → 60% → 100%
  },
  '16GB': {
    maxMemoryMB: 13000,      // 13GB max (leaving 3GB for the system)
    memoryThreshold: 0.85,   // 85% threshold
    maxConcurrency: 80,      // Can handle many more concurrent sessions
    maxBrowsers: 60,         // More browsers available for reuse
    rampUpPercentages: [0.10, 0.25, 0.50, 0.75, 1.0]  // More steps for larger machine
  },
  '32GB': {
    maxMemoryMB: 26000,      // 26GB max (leaving 6GB for the system)
    memoryThreshold: 0.85,   // 85% threshold
    maxConcurrency: 100,     // Very high concurrency for large machines
    maxBrowsers: 80,         // Many browsers available
    rampUpPercentages: [0.10, 0.30, 0.60, 1.0]  // Gradual ramp-up for very large machine
  }
};

// Read the PUPPETEER_SYSTEM_MEMORY environment variable to determine machine size.
// If not set, default to 8GB (the smallest/safest profile).
const systemMemory = process.env.PUPPETEER_SYSTEM_MEMORY || '8GB';

// Select the appropriate profile based on system memory.
// The || operator provides a fallback: if systemMemory doesn't match a profile, use 8GB.
const profile = memoryProfiles[systemMemory] || memoryProfiles['8GB'];

// The main configuration object that gets exported and used by other scripts.
// This object contains all the settings needed to run the traffic generator.
const config = {
  // URL of the Storedog application we'll be testing
  // The || operator means "use the environment variable if it exists, otherwise use the default"
  storedogUrl: process.env.STOREDOG_URL || 'http://service-proxy:80',
  
  // Debug mode controls how much logging we output to the console.
  // When true, we log everything. When false, we only log important messages.
  debug: process.env.PUPPETEER_DEBUG === 'true',
  
  // Concurrency settings control how many sessions run at once
  // parseInt() converts string values (from environment variables) to numbers
  startupDelay: parseInt(process.env.PUPPETEER_STARTUP_DELAY) || 10000,  // Wait 10 seconds before starting (in milliseconds)
  rampUpInterval: parseInt(process.env.PUPPETEER_RAMP_INTERVAL) || 30000, // Wait 30 seconds between increasing concurrency
  
  // Math.min() ensures we never exceed the profile's maximum, even if user sets it higher
  maxConcurrency: Math.min(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 16, profile.maxConcurrency),
  
  // Cache can be enabled for development to speed up page loads
  enableCache: process.env.PUPPETEER_ENABLE_CACHE === 'true',
  
  // Safety limits prevent the script from using too many resources
  // These values come from the selected memory profile above
  safetyLimits: {
    memoryThreshold: profile.memoryThreshold,  // Percentage of max memory before we slow down
    cpuThreshold: 0.90,                        // 90% CPU usage is our limit
    maxMemoryMB: profile.maxMemoryMB,          // Absolute memory limit in megabytes
    rampUpPercentages: profile.rampUpPercentages  // Gradual concurrency ramp-up schedule
  },
  
  // Browser pool size determines how many browser instances we keep open.
  // We reuse browsers across sessions to save memory.
  // This calculation ensures we have at least 6 browsers, but not more than the profile allows.
  browserPoolSize: parseInt(process.env.PUPPETEER_BROWSER_POOL_SIZE) || 
                   Math.min(Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 16, 6), profile.maxBrowsers),
  
  // Session settings
  totalSessions: Math.max(parseInt(process.env.PUPPETEER_MAX_CONCURRENT) || 16, 16), // Total sessions (minimum 16)
  sessionDelay: 2000,  // Maximum random delay before starting a session (2 seconds)
  
  // Enabled session types - just comment out or remove the ones you don't want to run
  Sessions: [
    BrowsingSession,
    // TaxonomySession,
    // CheckoutSession,
    // CartSession,
    // ProductSession,
    // SearchSession,
    // NavigationSession,
    // ErrorSession,
    // PerformanceSession,
  ]
};

// Helper function for debug logging.
// The ...args syntax is called "rest parameters" - it captures all arguments into an array.
// This function only logs messages if debug mode is enabled.
const debugLog = (...args) => {
  if (config.debug) {
    console.log(...args);
  }
};

// Helper function for critical logging (always shown, even in quiet mode)
const criticalLog = (...args) => {
  console.log(...args);
};

// When debug mode is OFF, we override the global console.log function to filter messages.
// This reduces memory usage by preventing unnecessary string operations and console output.
if (!config.debug) {
  // Save a reference to the original console.log function so we can still use it
  const originalConsoleLog = console.log;
  
  // Replace console.log with our filtered version
  console.log = (...args) => {
    // Join all arguments into a single string so we can search it
    const message = args.join(' ');
    
    // Check if the message contains any important keywords.
    // If it does, allow it through. Otherwise, suppress it.
    // This long if statement checks for emojis and keywords that indicate important messages.
    if (message.includes('💾 Memory Usage') || 
        message.includes('✅ Completed') || 
        message.includes('❌') ||
        message.includes('▶️ Starting') ||
        message.includes('🚀') ||
        message.includes('📋') ||
        message.includes('📊 Sessions') ||
        message.includes('🔧') ||
        message.includes('⏳ Waiting') ||
        message.includes('Found products navigation') ||
        message.includes('Attempting navigation') ||
        message.includes('Navigation successful') ||
        message.includes('Direct navigation result') ||
        message.includes('🧹 Cleaned up') ||
        message.includes('⏳ Waiting for one of') ||
        message.includes('🔄 Starting continuous') ||
        message.includes('📋 Starting batch') ||
        message.includes('📊 Batch completed') ||
        message.includes('🔄 Starting next batch') ||
        message.includes('FATAL ERROR') ||
        message.includes('Error:') ||
        message.includes('Failed:') ||
        message.includes('timeout') ||
        message.includes('Navigation timeout') ||
        message.includes('Protocol error') ||
        message.includes('Runtime.callFunctionOn timed out')) {
      // Message is important - use the original console.log to display it
      originalConsoleLog(...args);
    }
    // If the message doesn't match any keywords, it gets suppressed (not logged)
  };
}

// Log the configuration on startup so we can verify settings
console.log(`🔧 System Memory: ${systemMemory}`);
console.log(`🔧 Config loaded: ${config.storedogUrl} (${config.maxConcurrency} concurrent, ${config.browserPoolSize} browsers)`);
console.log(`🔧 Safety Limits: ${profile.maxMemoryMB}MB max, ${Math.round(profile.memoryThreshold*100)}% threshold`);
console.log(`🔧 Debug Mode: ${config.debug ? 'ENABLED (verbose logging)' : 'DISABLED (quiet mode)'}`);

// Export the config object so other files can use it with require('./config')
module.exports = config;
