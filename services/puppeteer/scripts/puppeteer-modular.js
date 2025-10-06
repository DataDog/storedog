#!/usr/bin/env node

// This is the main entry point for the Puppeteer traffic generator.
// It dynamically loads all session types from the sessions/ directory and starts them running.

const fs = require('fs');                        // File system module for reading directories
const path = require('path');                    // Path module for building file paths
const SessionManager = require('./sessionManager'); // Import the SessionManager class

// This function automatically finds and loads all session files from the sessions/ directory.
// Discover session files at runtime instead of hardcoding them.
// You can add new session files without modifying this main script.
function loadSessionClasses() {
  // Build the path to the sessions directory
  const sessionsDir = path.join(__dirname, 'sessions');
  
  // Array to store information about each session we find
  const sessionClasses = [];
  
  try {
    // Get a list of all files in the sessions directory
    // readdirSync() returns an array of filenames
    const files = fs.readdirSync(sessionsDir);
    
    // Loop through each file in the directory
    for (const file of files) {
      // Skip baseSession.js (it's a helper, not an actual session)
      // Also skip any files that don't end with .js
      if (file === 'baseSession.js' || !file.endsWith('.js')) {
        continue; // Skip to next file in the loop
      }
      
      // Build the full path to the session file
      const sessionPath = path.join(sessionsDir, file);
      
      // Load the session class using require()
      const SessionClass = require(sessionPath);
      
      // Check if we successfully loaded a valid class
      // typeof checks if SessionClass is a function
      if (SessionClass && typeof SessionClass === 'function') {
        // Add this session to our array
        sessionClasses.push({
          name: file.replace('.js', ''),  // Remove .js extension to get clean name
          class: SessionClass,             // The actual class/constructor function
          path: sessionPath                // Full path to the file (for debugging)
        });
        console.log(`📁 Loaded session: ${file}`);
      }
    }
    
    console.log(`✅ Loaded ${sessionClasses.length} session types`);
    return sessionClasses;
    
  } catch (error) {
    // If anything goes wrong, log the error and return empty array
    console.error('❌ Error loading session files:', error.message);
    return [];
  }
}

// The main function that runs when the script starts.
// "async" means this function can use "await" for asynchronous operations.
async function main() {
  console.log('🚀 Starting Puppeteer Traffic Generator');
  
  // Get the Storedog URL from three possible places (in order of priority):
  // 1. Command line argument (process.argv[2])
  // 2. Environment variable (process.env.STOREDOG_URL)
  // 3. Default value ('http://service-proxy:80')
  // The || operator tries each option until it finds one that's truthy (not null/undefined/empty)
  const storedogUrl = process.argv[2] || process.env.STOREDOG_URL || 'http://service-proxy:80';
  
  // Load the config module and update it with our URL
  // We load config after starting so it runs its console overrides first
  const config = require('./config');
  config.storedogUrl = storedogUrl;
  
  console.log(`🌐 Target: ${storedogUrl}`);
  
  // Wrap everything in try/catch to handle errors gracefully
  try {
    // Create a new SessionManager instance
    // This will manage all our browser sessions and concurrency
    const sessionManager = new SessionManager();
    
    // Load all session classes from the sessions/ directory
    const sessionClasses = loadSessionClasses();
    
    // Safety check: make sure we found at least one session
    if (sessionClasses.length === 0) {
      console.error('❌ No session classes found!');
      process.exit(1); // Exit with error code 1 (indicates failure)
    }
    
    // Transform session classes into session functions.
    // .map() creates a new array by transforming each element of the original array.
    // Each sessionInfo object gets transformed into a function that creates and runs a session.
    const sessionFunctions = sessionClasses.map(sessionInfo => {
      // Create a function that will start this session type
      const sessionFunction = () => {
        console.log(`🎭 Starting ${sessionInfo.name} session`);
        // Create a new instance of the session class and run it
        // "new sessionInfo.class()" creates an instance of the session
        // We pass sessionManager so the session can access browsers and devices
        return new sessionInfo.class(sessionManager).run();
      };
      
      // Add the sessionName property to the function for logging purposes
      // We can't change the function's built-in "name" property (it's read-only),
      // so we add our own custom property called "sessionName"
      sessionFunction.sessionName = sessionInfo.name;
      
      return sessionFunction;
    });
    
    // Log all available session types (join them into a comma-separated string)
    console.log(`🎯 Available session types: ${sessionClasses.map(s => s.name).join(', ')}`);
    
    // Start running sessions with progressive concurrency ramping
    // This function runs forever (infinite loop) maintaining constant traffic
    await sessionManager.runSessions(sessionFunctions);
    
    // NOTE: We never reach this line because runSessions() runs forever (while true loop)
    console.log('✅ All sessions completed successfully');
    
  } catch (error) {
    // If anything goes wrong, log the error and exit with failure code
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
