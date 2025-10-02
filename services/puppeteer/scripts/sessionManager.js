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
    // Create session queue with simple distribution
    const sessionStats = { completed: 0, failed: 0 };
    
    // Create sessions with random distribution
    for (let i = 0; i < config.totalSessions; i++) {
      const randomIndex = Math.floor(Math.random() * sessionFunctions.length);
      this.sessionQueue.push({
        id: i + 1,
        session: sessionFunctions[randomIndex],
        delay: Math.random() * config.sessionDelay
      });
    }
    
    // Shuffle the queue
    this.sessionQueue = this.sessionQueue.sort(() => Math.random() - 0.5);
    
    console.log(`📋 Starting ${config.totalSessions} sessions with ${config.maxConcurrency} max concurrency`);

    // Simplified concurrency levels
    const concurrencyLevels = [
      { time: 0, maxConcurrent: 2 },
      { time: config.rampUpInterval, maxConcurrent: Math.min(4, config.maxConcurrency) },
      { time: config.rampUpInterval * 2, maxConcurrent: Math.min(8, config.maxConcurrency) },
      { time: config.rampUpInterval * 3, maxConcurrent: config.maxConcurrency }
    ];

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
        
        // Start new sessions up to concurrency limit
        while (this.sessionPromises.length < currentMaxConcurrent && 
               this.sessionQueue.length > 0 && 
               checkMemoryLimit()) {
          
          const sessionTask = this.sessionQueue.shift();
          
          const sessionPromise = (async () => {
            await sleep(sessionTask.delay);
            console.log(`🚀 Starting session ${sessionTask.id}`);
            
            try {
              await sessionTask.session();
              console.log(`✅ Completed session ${sessionTask.id}`);
              sessionStats.completed++;
            } catch (error) {
              console.error(`❌ Session ${sessionTask.id} failed:`, error.message);
              sessionStats.failed++;
            }
          })();
          
          this.sessionPromises.push(sessionPromise);
        }
        
        // Wait for at least one session to complete
        if (this.sessionPromises.length > 0) {
          await Promise.race(this.sessionPromises);
          // Remove completed promises
          this.sessionPromises = this.sessionPromises.filter(p => 
            p.constructor.name === 'Promise' && 
            p.then && 
            typeof p.then === 'function'
          );
        }
      }
    };

    console.log(`⏳ Waiting ${config.startupDelay/1000}s for system to settle...`);
    await sleep(config.startupDelay);
    
    await processSessions();
    
    // Final statistics
    console.log(`📊 Sessions completed: ${sessionStats.completed}, failed: ${sessionStats.failed}`);
    
    await this.browserPool.closeAll();
    console.log('✅ All sessions completed');
  }

  getDeviceManager() {
    return this.deviceManager;
  }

  getBrowserPool() {
    return this.browserPool;
  }
}

module.exports = SessionManager;
