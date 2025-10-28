// This file orchestrates the execution of all browser sessions.
// It manages concurrency, memory safety, and maintains continuous traffic by replacing completed sessions with new ones.

const config = require('./config');
const { sleep, logMemoryUsage, forceGC } = require('./utils');
const BrowserPool = require('./browserPool');

// Build ramp-up schedule from the memory profile's percentages
// Each percentage is applied to the configured maxConcurrency
const concurrencyLevels = config.safetyLimits.rampUpPercentages.map((percentage, index) => ({
  time: index * config.rampUpInterval,
  maxConcurrent: Math.max(Math.ceil(config.maxConcurrency * percentage), 4)
}));



class SessionManager {
  constructor(sessionClasses) {
    this.Sessions = sessionClasses;
    this.browserPool = new BrowserPool();
    // Array to track all currently running session promises
    this.sessionPromises = [];
    this.startTime = Date.now();
    this.currentMaxConcurrent = concurrencyLevels[0].maxConcurrent;
  }
  
  log(message) {
    console.log(`[🕺 SessionManager] ${message}`);
  }

  // Clear all browser data (cookies, cache, storage) to create a "fresh" session.
  // This makes each session unique from RUM's perspective - they appear as different users.
  async clearBrowserContext(session) {
    try {
      logMemoryUsage('🎬 before clearBrowserContext');
      
      // Create a Chrome DevTools Protocol (CDP) session to send low-level commands
      // CDP lets us control Chrome features that aren't available in the regular Puppeteer API
      const client = await session.page.target().createCDPSession();
      
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
      
      this.log('Browser context cleared');
      logMemoryUsage(`🏁 after clearBrowserContext for [${session.emoji} ${session.sessionName} ${session.sessionId}]`);
    } catch (error) {
      // If clearing fails, log it but don't crash - the session can still continue
      this.log('Error clearing browser context:', error.message);
    }
  }

      // Helper function to check if we're using too much memory.
    // Returns true if memory is okay, false if we've exceeded the limit.
  checkMemoryLimit() {
    // Get current memory usage
    // process.memoryUsage().heapUsed is the amount of JavaScript memory in use (in bytes)
    // We divide by 1024 twice to convert bytes → KB → MB
    const memUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`🧠 Memory usage: ${memUsageMB}MB`);
    console.log(`🧠 Safety limit: ${config.safetyLimits.maxMemoryMB}MB`);
    // Check if we've exceeded our safety limit
    if (memUsageMB > config.safetyLimits.maxMemoryMB) {
      // Convert to GB for the log message
      // .toFixed(2) rounds to 2 decimal places and returns a string
      const memUsageGB = (memUsageMB / 1024).toFixed(2);
      const maxMemoryGB = (config.safetyLimits.maxMemoryMB / 1024).toFixed(2);
      console.log(`🚨 Memory limit exceeded: ${Math.round(memUsageMB)}MB (${memUsageGB}GB) > ${maxMemoryGB}GB`);
      return false; // Memory limit exceeded
    }
    console.log(`🧠 Memory is okay: ${memUsageMB}MB < ${config.safetyLimits.maxMemoryMB}MB`);
    return true; // Memory is okay
  };

  // Helper function to check if we should increase concurrency based on elapsed time.
  // This is called on every loop iteration.
  updateConcurrency() {
    const elapsed = Date.now() - this.startTime;
    
    // Find the highest level where we've reached the time threshold
    const newLevel = concurrencyLevels.slice().reverse().find(level => elapsed >= level.time);
    
    // If we found a level and it's different from current and memory is okay, update
    if (newLevel && newLevel.maxConcurrent !== this.currentMaxConcurrent && this.checkMemoryLimit()) {
      this.currentMaxConcurrent = newLevel.maxConcurrent;
      this.log(`🚀 Concurrency: ${this.currentMaxConcurrent} sessions (${Math.round(elapsed/1000)}s elapsed)`);
    }
  };


  shouldAddNewSession() {
    return this.sessionPromises.length < this.currentMaxConcurrent && this.checkMemoryLimit();
  }
  // This is the main orchestration function - it runs forever, maintaining constant traffic.
  // It progressively ramps up concurrency, then maintains exactly config.maxConcurrency sessions.
  // When a session completes, it immediately starts a new one to keep the count constant.
  async run() {
    this.log(`🔄 Starting continuous traffic generation with ${this.Sessions.length} session types`);
    this.log(`🎯 Target: ${config.maxConcurrency} concurrent sessions always running`);
    
    let sessionIdCounter = 1;
    
    // ===== THE CONTINUOUS SESSION LOOP =====
    // This infinite loop is the heart of the traffic generator.
    // It maintains exactly currentMaxConcurrent sessions running at all times.
    // When a session completes, it immediately starts a new one.


    // Run a single loop or forever.
    const maxLoops = config.loop === 'single' ? 1 : Infinity;
    
    for (let loopCount = 0; loopCount < maxLoops; loopCount++) { 
      this.log(`🔄 Starting loop ${loopCount + 1} of ${maxLoops}`);
      // Check if it's time to increase concurrency based on elapsed time
      this.updateConcurrency();
      while (this.shouldAddNewSession()) {
        const randomIndex = Math.floor(Math.random() * this.Sessions.length);
        const SessionClass = this.Sessions[randomIndex];
        const sessionId = sessionIdCounter++;
        const sessionPromise = (async () => {
          let session;
          let browser;
          
          try {
            browser = await this.browserPool.getBrowser();
            const version = await browser.version();
            this.log(`Browser started: ${version}`);
            session = new SessionClass(browser, sessionId);
            await session.setupPage();
            await session.run();
          } catch (error) {
            this.log(`Error creating session: ${error.message}`);
          } finally {
            try {
              if (session) {
                if (!session.page.isClosed()) {
                  await this.clearBrowserContext(session);
                }
                this.log(`Releasing browser for [${session.emoji} ${session.sessionName} ${session.sessionId}]`);
                await this.browserPool.releaseBrowser(session.browser);
              }
            } catch (cleanupError) {
              this.log(`Browser cleanup error: ${cleanupError.message}`);
            }
            
            // Force garbage collection
            this.log(`🧹 Force garbage collection for [${session.emoji} ${session.sessionName} ${session.sessionId}]`);
            forceGC();
          }
        })();

        this.sessionPromises.push(sessionPromise);
          
        sessionPromise.finally(() => {
          this.sessionPromises.splice(this.sessionPromises.indexOf(sessionPromise), 1);
        });
      }
      
      if (this.sessionPromises.length > 0) {
        await Promise.race(this.sessionPromises);
      } else {
        this.log(`⚠️ No sessions running, waiting 1 second before retrying...`);
        await sleep(1000);
      }
    }
  }
}

module.exports = SessionManager;
