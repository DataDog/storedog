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
    
    // Run sessions continuously
    while (true) {
      // Create session queue with guaranteed minimum + random distribution
      const sessionStats = { completed: 0, failed: 0 };
      
      // First, ensure each session type runs at least once
      for (let i = 0; i < sessionFunctions.length; i++) {
        this.sessionQueue.push({
          id: Date.now() + i, // Use timestamp-based IDs for uniqueness
          session: sessionFunctions[i],
          delay: Math.random() * config.sessionDelay
        });
      }
      
      // Fill remaining slots with random distribution
      const remainingSessions = config.totalSessions - sessionFunctions.length;
      for (let i = 0; i < remainingSessions; i++) {
        const randomIndex = Math.floor(Math.random() * sessionFunctions.length);
        this.sessionQueue.push({
          id: Date.now() + sessionFunctions.length + i,
          session: sessionFunctions[randomIndex],
          delay: Math.random() * config.sessionDelay
        });
      }
      
      // Shuffle the queue to randomize execution order
      this.sessionQueue = this.sessionQueue.sort(() => Math.random() - 0.5);
      
      console.log(`📋 Starting batch of ${config.totalSessions} sessions (${sessionFunctions.length} guaranteed + ${remainingSessions} random)`);

      // Progressive concurrency levels (fractional ramp-up)
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

      const processSessions = async () => {
        while (this.sessionQueue.length > 0 || this.sessionPromises.length > 0) {
          updateConcurrency();
          
          console.log(`📊 Queue: ${this.sessionQueue.length} waiting, ${this.sessionPromises.length} running`);
          
          // Start new sessions up to concurrency limit
          while (this.sessionPromises.length < currentMaxConcurrent && 
                 this.sessionQueue.length > 0 && 
                 checkMemoryLimit()) {
            
            const sessionTask = this.sessionQueue.shift();
            
            const sessionPromise = (async () => {
              await sleep(sessionTask.delay);
              console.log(`▶️ Starting session ${sessionTask.id}`);
              
              try {
                await sessionTask.session();
                console.log(`✅ Completed session ${sessionTask.id}`);
                sessionStats.completed++;
                
                // CRITICAL: Force garbage collection after each session (from working version)
                forceGC();
              } catch (error) {
                console.error(`❌ Session ${sessionTask.id} failed:`, error.message);
                sessionStats.failed++;
              }
            })();
            
            // Mark promise for removal when it completes
            sessionPromise.finally(() => {
              const index = this.sessionPromises.indexOf(sessionPromise);
              if (index > -1) {
                this.sessionPromises.splice(index, 1);
                console.log(`🧹 Cleaned up session promise (${this.sessionPromises.length} remaining)`);
              }
            });
            
            this.sessionPromises.push(sessionPromise);
          }
          
          // Wait for at least one session to complete
          if (this.sessionPromises.length > 0) {
            console.log(`⏳ Waiting for one of ${this.sessionPromises.length} sessions to complete...`);
            await Promise.race(this.sessionPromises);
            // Small delay to allow .finally() cleanup to complete
            await sleep(100);
          } else {
            console.log(`⚠️ No running sessions but queue has ${this.sessionQueue.length} items - breaking to prevent infinite loop`);
            break;
          }
        }
      };

      console.log(`⏳ Waiting ${config.startupDelay/1000}s for system to settle...`);
      await sleep(config.startupDelay);
      
      await processSessions();
      
      // Final statistics for this batch
      console.log(`📊 Batch completed: ${sessionStats.completed} completed, ${sessionStats.failed} failed`);
      
      // Brief pause before starting next batch
      console.log(`🔄 Starting next batch in 5 seconds...`);
      await sleep(5000);
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
