// This file orchestrates the execution of all browser sessions.
// It manages concurrency, memory safety, and maintains continuous traffic by replacing completed sessions with new ones.

const config = require('./config');
const { sleep, logMemoryUsage, forceGC } = require('./utils');
const DeviceManager = require('./deviceManager');
const BrowserPool = require('./browserPool');

class SessionManager {
  // Constructor sets up the manager when you create it with "new SessionManager()"
  constructor() {
    // Create a device manager to handle device emulation (iPhone, Android, desktop, etc.)
    this.deviceManager = new DeviceManager();
    
    // Create a browser pool to manage and reuse browser instances
    this.browserPool = new BrowserPool();
    
    // Array to track all currently running session promises
    // A Promise represents an async operation that will complete in the future
    this.sessionPromises = [];
    
    // Array to queue sessions waiting to start (currently unused but kept for future use)
    this.sessionQueue = [];
  }

  // Clear all browser data (cookies, cache, storage) to create a "fresh" session.
  // This makes each session unique from RUM's perspective - they appear as different users.
  async clearBrowserContext(page) {
    try {
      // Safety check: don't try to clear if the page is already closed
      if (page.isClosed()) return;
      
      // Create a Chrome DevTools Protocol (CDP) session to send low-level commands
      // CDP lets us control Chrome features that aren't available in the regular Puppeteer API
      const client = await page.target().createCDPSession();
      
      // Send commands to clear network-level data
      await client.send('Network.clearBrowserCookies');  // Delete all cookies
      await client.send('Network.clearBrowserCache');    // Clear the browser cache
      
      // Execute JavaScript in the browser to clear storage
      // localStorage, sessionStorage, and IndexedDB are where websites store data
      await client.send('Runtime.evaluate', {
        expression: `
          localStorage.clear();      // Clear localStorage (key-value storage)
          sessionStorage.clear();    // Clear sessionStorage (temporary storage)
          if (window.indexedDB) {    // Check if IndexedDB is available
            indexedDB.databases().then(databases => {
              // Loop through all databases and delete them
              databases.forEach(db => indexedDB.deleteDatabase(db.name));
            }).catch(() => {});  // Ignore errors (some browsers don't support databases())
          }
        `
      });
      
      console.log('Browser context cleared');
    } catch (error) {
      // If clearing fails, log it but don't crash - the session can still continue
      console.log('Error clearing browser context:', error.message);
    }
  }

  // This is the main orchestration function - it runs forever, maintaining constant traffic.
  // It progressively ramps up concurrency, then maintains exactly config.maxConcurrency sessions.
  // When a session completes, it immediately starts a new one to keep the count constant.
  async runSessions(sessionFunctions) {
    console.log(`🔄 Starting continuous traffic generation with ${sessionFunctions.length} session types`);
    console.log(`🎯 Target: ${config.maxConcurrency} concurrent sessions always running`);
    
    // Counter to give each session a unique ID for logging
    let sessionIdCounter = 1;
    
    // Helper function to create a new random session task.
    const createRandomSession = () => {
      // Pick a random index from the sessionFunctions array
      const randomIndex = Math.floor(Math.random() * sessionFunctions.length);
      const selectedSession = sessionFunctions[randomIndex];
      
      // Return an object describing this session task
      return {
        id: sessionIdCounter++,  // Assign and increment the counter
        session: selectedSession, // The function to run
        name: selectedSession.sessionName || 'UnknownSession', // Name for logging
        delay: Math.random() * config.sessionDelay  // Random delay 0-2000ms before starting
      };
    };
    
    // Generate a schedule for progressively ramping up concurrency.
    // We don't go from 0 to max instantly - that would cause memory spikes.
    // Instead, we gradually increase: 4 → 8 → 25% → 50% → 75% → 100%
    const generateConcurrencyLevels = (maxConcurrency, interval) => {
      // Array to store the ramp-up schedule
      // Each level has a time (when to apply it) and a maxConcurrent (limit at that time)
      const levels = [{ time: 0, maxConcurrent: 4 }]; // Always start with 4 sessions at time 0
      
      // Fixed steps are specific numbers (not percentages)
      const fixedSteps = [8];
      
      // Fractional steps are percentages of the max
      // 0.25 = 25%, 0.50 = 50%, etc.
      const fractions = [0.25, 0.50, 0.75, 1.0];
      
      // Track which step we're on (for calculating time)
      let stepIndex = 1;
      
      // Add fixed steps (8 sessions) if max concurrency is higher than that
      for (const step of fixedSteps) {
        if (step < maxConcurrency) {
          levels.push({ 
            time: interval * stepIndex,  // When to apply this level (e.g., 30s, 60s, 90s)
            maxConcurrent: Math.min(step, maxConcurrency)  // Don't exceed max
          });
          stepIndex++; // Move to next time slot
        }
      }
      
      // Add fractional steps (25%, 50%, 75%, 100%)
      for (const fraction of fractions) {
        // Calculate how many concurrent sessions for this percentage
        // Math.ceil() rounds up (e.g., 25% of 16 = 4, not 3.75)
        // Math.max() ensures we never go below 8
        const concurrent = Math.max(Math.ceil(maxConcurrency * fraction), 8);
        
        // Only add this level if it's higher than the last one (avoid duplicates)
        // levels[levels.length - 1] gets the last item in the array
        if (concurrent > levels[levels.length - 1].maxConcurrent) {
          levels.push({ 
            time: interval * stepIndex, 
            maxConcurrent: concurrent 
          });
          stepIndex++;
        }
      }
      
      // Return the complete schedule
      // Example result for max=16: [{time:0, max:4}, {time:30000, max:8}, {time:60000, max:12}, {time:90000, max:16}]
      return levels;
    };

    // Generate the ramp-up schedule based on our config
    const concurrencyLevels = generateConcurrencyLevels(config.maxConcurrency, config.rampUpInterval);
    
    // Start at the first level (4 concurrent sessions)
    let currentMaxConcurrent = concurrencyLevels[0].maxConcurrent;
    
    // Record when we started (in milliseconds since epoch)
    // We'll use this to check if it's time to increase concurrency
    let startTime = Date.now();

    // Helper function to check if we're using too much memory.
    // Returns true if memory is okay, false if we've exceeded the limit.
    const checkMemoryLimit = () => {
      // Get current memory usage
      // process.memoryUsage().heapUsed is the amount of JavaScript memory in use (in bytes)
      // We divide by 1024 twice to convert bytes → KB → MB
      const memUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
      
      // Check if we've exceeded our safety limit
      if (memUsageMB > config.safetyLimits.maxMemoryMB) {
        // Convert to GB for the log message
        // .toFixed(2) rounds to 2 decimal places and returns a string
        const memUsageGB = (memUsageMB / 1024).toFixed(2);
        const maxMemoryGB = (config.safetyLimits.maxMemoryMB / 1024).toFixed(2);
        console.log(`🚨 Memory limit exceeded: ${Math.round(memUsageMB)}MB (${memUsageGB}GB) > ${maxMemoryGB}GB`);
        return false; // Memory limit exceeded
      }
      
      return true; // Memory is okay
    };

    // Helper function to check if we should increase concurrency based on elapsed time.
    // This is called on every loop iteration.
    const updateConcurrency = () => {
      // Calculate how much time has passed since we started
      const elapsed = Date.now() - startTime;
      
      // Find the highest level where we've reached the time threshold
      // .slice() creates a copy so we don't modify the original array
      // .reverse() reverses it so we find the highest applicable level
      // .find() returns the first (now highest) level where elapsed >= level.time
      const newLevel = concurrencyLevels.slice().reverse().find(level => elapsed >= level.time);
      
      // If we found a level and it's different from current and memory is okay, update
      if (newLevel && newLevel.maxConcurrent !== currentMaxConcurrent && checkMemoryLimit()) {
        currentMaxConcurrent = newLevel.maxConcurrent;
        console.log(`🚀 Concurrency: ${currentMaxConcurrent} sessions (${Math.round(elapsed/1000)}s elapsed)`);
      }
    };

    // Wait for the system to settle before starting sessions
    // This gives time for other services (database, etc.) to be ready
    console.log(`⏳ Waiting ${config.startupDelay/1000}s for system to settle...`);
    await sleep(config.startupDelay);
    
    // ===== THE CONTINUOUS SESSION LOOP =====
    // This infinite loop is the heart of the traffic generator.
    // It maintains exactly currentMaxConcurrent sessions running at all times.
    // When a session completes, it immediately starts a new one.
    while (true) {  // "while (true)" runs forever - this loop never exits
      // Check if it's time to increase concurrency based on elapsed time
      updateConcurrency();
      
      // Inner loop: Add new sessions until we reach the concurrency limit
      // This runs until we have enough sessions or run out of memory
      while (this.sessionPromises.length < currentMaxConcurrent && checkMemoryLimit()) {
        // Create a new random session task
        const sessionTask = createRandomSession();
        
        // Log that we're starting this session
        console.log(`▶️ Starting session ${sessionTask.id} (${sessionTask.name}) - ${this.sessionPromises.length + 1}/${currentMaxConcurrent}`);
        
        // Create the session promise
        // This is an IIFE (Immediately Invoked Function Expression) - it runs right away
        // The async () => {...} creates an async function, and the () at the end runs it
        const sessionPromise = (async () => {
          // Wait for the random delay before starting
          await sleep(sessionTask.delay);
          
          // Try to run the session
          try {
            // Run the actual session function (this is where the browser automation happens)
            await sessionTask.session();
            console.log(`✅ Completed session ${sessionTask.id} (${sessionTask.name})`);
            
            // CRITICAL: Force garbage collection to free up memory
            // Without this, memory accumulates and eventually crashes
            forceGC();
          } catch (error) {
            // If the session fails, log the error but don't crash
            console.error(`❌ Session ${sessionTask.id} (${sessionTask.name}) failed:`, error.message);
          }
        })();
        
        // Set up cleanup when this promise completes (success or failure)
        // .finally() runs after the promise settles, regardless of success/failure
        sessionPromise.finally(() => {
          // Find this promise in our tracking array
          const index = this.sessionPromises.indexOf(sessionPromise);
          if (index > -1) {
            // Remove it from the array
            // .splice(index, 1) removes 1 element at position 'index'
            this.sessionPromises.splice(index, 1);
            console.log(`🧹 Session ${sessionTask.id} (${sessionTask.name}) cleaned up (${this.sessionPromises.length} running)`);
          }
        });
        
        // Add this promise to our tracking array
        // We track all running sessions so we know when one completes
        this.sessionPromises.push(sessionPromise);
      }
      
      // Wait for at least one session to complete before starting more
      // This prevents the loop from spinning too fast
      if (this.sessionPromises.length > 0) {
        // Promise.race() waits for the FIRST promise in the array to complete
        // This pauses here until any session finishes
        await Promise.race(this.sessionPromises);
        
        // Small delay to allow the .finally() cleanup handler to finish
        // Without this, we might try to start a new session before cleanup completes
        await sleep(100);
      } else {
        // Safety check: if somehow no sessions are running, wait before retrying
        // This should never happen in normal operation
        console.log(`⚠️ No sessions running, waiting 1 second before retrying...`);
        await sleep(1000);
      }
    }
    // NOTE: We never reach here because the while (true) loop runs forever
  }

  // Getter method to access the device manager
  // Sessions call this to get device profiles for emulation
  getDeviceManager() {
    return this.deviceManager;
  }

  // Getter method to access the browser pool
  // Sessions call this to get/release browsers
  getBrowserPool() {
    return this.browserPool;
  }
}

// Export the SessionManager class for use in other files
module.exports = SessionManager;
