#!/usr/bin/env node

// This is the main entry point for the Puppeteer traffic generator.
// It creates a SessionManager with enabled session types and starts the traffic generator.

const SessionManager = require('./core/SessionManager');
const config = require('./config');
const { setTimeout } = require('node:timers/promises');

const { storedogUrl, systemMemory, maxConcurrency, browserPoolSize, safetyLimits, debug, debugSessions, sessionTypes, startupDelay, loop } = config;
// The main function that runs when the script starts.
async function main() {
  console.log('🚀 Starting Puppeteer Traffic Generator');

  const info = {
    "storedogUrl": storedogUrl,
    "systemMemory": systemMemory,
    "maxConcurrency": maxConcurrency,
    "browserPoolSize": browserPoolSize,
    "memoryThreshold": safetyLimits.memoryThreshold,
    "maxMemoryMB": safetyLimits.maxMemoryMB,
    "debug": debug,
    "debugSessions": debugSessions,
    "startupDelay": startupDelay,
    "sessionTypes": sessionTypes.join(', '),
    "loop": loop
  }

  console.table(info);
  
  try {
    const sessionManager = new SessionManager();
    console.log(`Waiting for ${startupDelay}ms before starting sessions...`);
    await setTimeout(startupDelay);
    await sessionManager.run();    
  } catch (error) {
    console.error('❌ Puppeteer script failed:', error);
    process.exit(1);
  }
}

// These handlers respond to shutdown signals from Docker/Kubernetes/terminal.
// SIGINT is sent when you press Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0); // Exit cleanly with code 0 (success)
});

// SIGTERM is sent by Docker/Kubernetes when stopping the container
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Only run main() if this file is being executed directly (not imported by another file)
// require.main === module is true when running "node index.js"
// It's false when another file does "require('./index.js')"
if (require.main === module) {
  // Run main() and catch any errors that slip through
  main().catch(console.error);
}

module.exports = { main };
