#!/usr/bin/env node

// This is the main entry point for the Puppeteer traffic generator.
// It creates a SessionManager with enabled session types and starts the traffic generator.

const SessionManager = require('./sessionManager');
const config = require('./config');

// The main function that runs when the script starts.
async function main() {
  console.log('🚀 Starting Puppeteer Traffic Generator');
  console.log(`🌐 Target: ${config.storedogUrl}`);
  
  try {
    if (config.sessionTypes.length === 0) {
      console.error('❌ No session types enabled in config.js!');
      process.exit(1);
    }
    
    // Log enabled session types
    const sessionNames = config.sessionTypes.map(S => S.name).join(', ');
    console.log(`🎯 Enabled session types: ${sessionNames}`);
    
    // Create SessionManager and start running sessions
    const sessionManager = new SessionManager(config.sessionTypes);
    await sessionManager.run();    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Set up graceful shutdown handlers.
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
// require.main === module is true when running "node puppeteer-modular.js"
// It's false when another file does "require('./puppeteer-modular.js')"
if (require.main === module) {
  // Run main() and catch any errors that slip through
  main().catch(console.error);
}

// Export the main function so other files can import and test it
module.exports = { main };
