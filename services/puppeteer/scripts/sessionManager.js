// Session management and execution
const config = require('./config');
const { sleep, logMemoryUsage, forceGC } = require('./utils');
const DeviceManager = require('./deviceManager');
const BrowserPool = require('./browserPool');

class SessionManager {
  constructor() {
    this.deviceManager = new DeviceManager();
    this.browserPool = new BrowserPool();
    this.sessionPromises = [];
    this.sessionQueue = [];
  }

  async clearBrowserContext(page) {
    try {
      if (page.isClosed()) return;
      
      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');
      await client.send('Runtime.evaluate', {
        expression: `
          localStorage.clear();
          sessionStorage.clear();
          if (window.indexedDB) {
            indexedDB.databases().then(databases => {
              databases.forEach(db => indexedDB.deleteDatabase(db.name));
            }).catch(() => {});
          }
        `
      });
      
      console.log('Browser context cleared');
    } catch (error) {
      console.log('Error clearing browser context:', error.message);
    }
  }

  async runSessions(sessionFunctions) {
    console.log(`🔄 Starting continuous traffic generation with ${sessionFunctions.length} session types`);
    console.log(`🎯 Target: ${config.maxConcurrency} concurrent sessions always running`);
    
    let sessionIdCounter = 1;
    
    // Function to create a new random session
    const createRandomSession = () => {
      const randomIndex = Math.floor(Math.random() * sessionFunctions.length);
      return {
        id: sessionIdCounter++,
        session: sessionFunctions[randomIndex],
        delay: Math.random() * config.sessionDelay
      };
    };
    
    // Progressive concurrency ramp-up (one-time setup)
    const generateConcurrencyLevels = (maxConcurrency, interval) => {
      const levels = [{ time: 0, maxConcurrent: 4 }]; // Always start with 4
      
      // Generate fractional steps: 4, 8, then 25%, 50%, 75%, 100%
      const fixedSteps = [8];
      const fractions = [0.25, 0.50, 0.75, 1.0];
      
      let stepIndex = 1;
      
      // Add fixed steps (8) if they're less than max
      for (const step of fixedSteps) {
        if (step < maxConcurrency) {
          levels.push({ 
            time: interval * stepIndex, 
            maxConcurrent: Math.min(step, maxConcurrency) 
          });
          stepIndex++;
        }
      }
      
      // Add fractional steps (25%, 50%, 75%, 100%)
      for (const fraction of fractions) {
        const concurrent = Math.max(Math.ceil(maxConcurrency * fraction), 8); // Minimum 8
        if (concurrent > levels[levels.length - 1].maxConcurrent) {
          levels.push({ 
            time: interval * stepIndex, 
            maxConcurrent: concurrent 
          });
          stepIndex++;
        }
      }
      
      return levels;
    };

    const concurrencyLevels = generateConcurrencyLevels(config.maxConcurrency, config.rampUpInterval);
    let currentMaxConcurrent = concurrencyLevels[0].maxConcurrent;
    let startTime = Date.now();

    const checkMemoryLimit = () => {
      const memUsageMB = process.memoryUsage().heapUsed / 1024 / 1024;
      
      if (memUsageMB > config.safetyLimits.maxMemoryMB) {
        const memUsageGB = (memUsageMB / 1024).toFixed(2);
        const maxMemoryGB = (config.safetyLimits.maxMemoryMB / 1024).toFixed(2);
        console.log(`🚨 Memory limit exceeded: ${Math.round(memUsageMB)}MB (${memUsageGB}GB) > ${maxMemoryGB}GB`);
        return false;
      }
      
      return true;
    };

    const updateConcurrency = () => {
      const elapsed = Date.now() - startTime;
      const newLevel = concurrencyLevels.slice().reverse().find(level => elapsed >= level.time);
      
      if (newLevel && newLevel.maxConcurrent !== currentMaxConcurrent && checkMemoryLimit()) {
        currentMaxConcurrent = newLevel.maxConcurrent;
        console.log(`🚀 Concurrency: ${currentMaxConcurrent} sessions (${Math.round(elapsed/1000)}s elapsed)`);
      }
    };

    // Initial ramp-up delay
    console.log(`⏳ Waiting ${config.startupDelay/1000}s for system to settle...`);
    await sleep(config.startupDelay);
    
    // Continuous session management loop
    while (true) {
      updateConcurrency();
      
      // Add new sessions up to concurrency limit
      while (this.sessionPromises.length < currentMaxConcurrent && checkMemoryLimit()) {
        const sessionTask = createRandomSession();
        
        console.log(`▶️ Starting session ${sessionTask.id} (${this.sessionPromises.length + 1}/${currentMaxConcurrent})`);
        
        const sessionPromise = (async () => {
          await sleep(sessionTask.delay);
          
          try {
            await sessionTask.session();
            console.log(`✅ Completed session ${sessionTask.id}`);
            
            // CRITICAL: Force garbage collection after each session
            forceGC();
          } catch (error) {
            console.error(`❌ Session ${sessionTask.id} failed:`, error.message);
          }
        })();
        
        // Mark promise for removal when it completes
        sessionPromise.finally(() => {
          const index = this.sessionPromises.indexOf(sessionPromise);
          if (index > -1) {
            this.sessionPromises.splice(index, 1);
            console.log(`🧹 Session ${sessionTask.id} cleaned up (${this.sessionPromises.length} running)`);
          }
        });
        
        this.sessionPromises.push(sessionPromise);
      }
      
      // Wait for at least one session to complete before checking again
      if (this.sessionPromises.length > 0) {
        await Promise.race(this.sessionPromises);
        // Small delay to allow .finally() cleanup to complete
        await sleep(100);
      } else {
        // Safety: if no sessions running, wait a bit before trying again
        console.log(`⚠️ No sessions running, waiting 1 second before retrying...`);
        await sleep(1000);
      }
    }
  }

  getDeviceManager() {
    return this.deviceManager;
  }

  getBrowserPool() {
    return this.browserPool;
  }
}

module.exports = SessionManager;
