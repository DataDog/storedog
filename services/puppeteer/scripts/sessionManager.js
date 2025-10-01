// Session management and execution
const config = require('./config');
const { sleep, logMemoryUsage, forceGC, setUtmParams, optimizePageResources } = require('./utils');
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
      console.log('Chrome context cleared (CDP + storage)');
    } catch (error) {
      console.log('Error clearing browser context:', error.message);
    }
  }

  async runSessions(sessionFunctions) {
    // Create session queue with balanced distribution
    const sessionTypes = ['HomePage', 'Frustration', 'Taxonomy', 'Browsing']; // Known session types
    const sessionStats = { completed: 0, failed: 0, byType: {} };
    
    // Ensure each session type runs at least once
    const guaranteedSessions = [];
    for (let i = 0; i < sessionFunctions.length; i++) {
      guaranteedSessions.push({
        id: i + 1,
        session: sessionFunctions[i],
        sessionType: sessionTypes[i] || `Session-${i + 1}`,
        delay: Math.random() * config.sessionDelay
      });
    }
    
    // Fill remaining slots with random distribution
    const remainingSessions = config.totalSessions - sessionFunctions.length;
    for (let i = 0; i < remainingSessions; i++) {
      const randomIndex = Math.floor(Math.random() * sessionFunctions.length);
      guaranteedSessions.push({
        id: sessionFunctions.length + i + 1,
        session: sessionFunctions[randomIndex],
        sessionType: sessionTypes[randomIndex] || `Session-${randomIndex + 1}`,
        delay: Math.random() * config.sessionDelay
      });
    }
    
    // Shuffle the queue to randomize execution order
    this.sessionQueue = guaranteedSessions.sort(() => Math.random() - 0.5);
    
    console.log(`📋 Session Distribution:`);
    console.log(`   Total Sessions: ${config.totalSessions}`);
    console.log(`   Guaranteed: ${sessionFunctions.length} (one of each type)`);
    console.log(`   Random: ${remainingSessions} (distributed randomly)`);
    console.log(`   Session Types: ${sessionTypes.join(', ')}`);

    // Progressive concurrency levels
    const concurrencyLevels = [
      { time: 0, maxConcurrent: 2 },
      { time: config.rampUpInterval, maxConcurrent: Math.min(4, config.maxConcurrency) },
      { time: config.rampUpInterval * 2, maxConcurrent: Math.min(8, config.maxConcurrency) },
      { time: config.rampUpInterval * 3, maxConcurrent: Math.min(16, config.maxConcurrency) },
      { time: config.rampUpInterval * 4, maxConcurrent: Math.min(24, config.maxConcurrency) },
      { time: config.rampUpInterval * 5, maxConcurrent: Math.min(32, config.maxConcurrency) },
      { time: config.rampUpInterval * 6, maxConcurrent: Math.min(40, config.maxConcurrency) },
      { time: config.rampUpInterval * 7, maxConcurrent: config.maxConcurrency }
    ];

    let currentMaxConcurrent = concurrencyLevels[0].maxConcurrent;
    let startTime = Date.now();

    const checkSystemResources = () => {
      const memUsage = process.memoryUsage();
      const memUsageMB = memUsage.heapUsed / 1024 / 1024;
      
      if (Math.floor((Date.now() - startTime) / 30000) !== Math.floor((Date.now() - startTime - 1000) / 30000)) {
        console.log(`📊 Resource Usage: Memory ${Math.round(memUsageMB)}MB (${Math.round((memUsageMB / (memUsageMB + memUsage.heapTotal / 1024 / 1024)) * 100)}%), Active Sessions: ${this.sessionPromises.length}/${currentMaxConcurrent}`);
      }
      
      if (memUsageMB > config.safetyLimits.maxMemoryMB) {
        console.log(`🚨 CRITICAL MEMORY USAGE: ${Math.round(memUsageMB)}MB > ${config.safetyLimits.maxMemoryMB}MB limit - Stopping new sessions`);
        return false;
      }
      
      return true;
    };

    const updateConcurrency = () => {
      const elapsed = Date.now() - startTime;
      const newLevel = concurrencyLevels.slice().reverse().find(level => elapsed >= level.time);
      
      if (newLevel && newLevel.maxConcurrent !== currentMaxConcurrent) {
        if (checkSystemResources()) {
          currentMaxConcurrent = newLevel.maxConcurrent;
          console.log(`🚀 Ramping up concurrency to ${currentMaxConcurrent} sessions (${Math.round(elapsed/1000)}s elapsed)`);
          logMemoryUsage(`Concurrency ramp-up to ${currentMaxConcurrent}`);
        }
      }
    };

    const processSessions = async () => {
      while (this.sessionQueue.length > 0 || this.sessionPromises.length > 0) {
        updateConcurrency();
        
        while (this.sessionPromises.length < currentMaxConcurrent && this.sessionQueue.length > 0 && checkSystemResources()) {
          const sessionTask = this.sessionQueue.shift();
          
          const sessionPromise = (async () => {
            await sleep(sessionTask.delay);
            console.log(`🚀 Starting ${sessionTask.sessionType} session ${sessionTask.id} (concurrency: ${this.sessionPromises.length + 1}/${currentMaxConcurrent})`);
            logMemoryUsage(`Before ${sessionTask.sessionType} Session ${sessionTask.id}`);
            
            try {
              await sessionTask.session();
              logMemoryUsage(`After ${sessionTask.sessionType} Session ${sessionTask.id}`);
              forceGC();
              console.log(`✅ Completed ${sessionTask.sessionType} session ${sessionTask.id}`);
              sessionStats.completed++;
              sessionStats.byType[sessionTask.sessionType] = (sessionStats.byType[sessionTask.sessionType] || 0) + 1;
            } catch (error) {
              console.error(`❌ ${sessionTask.sessionType} session ${sessionTask.id} failed:`, error);
              logMemoryUsage(`Failed ${sessionTask.sessionType} Session ${sessionTask.id}`);
              sessionStats.failed++;
            }
          })();
          
          this.sessionPromises.push(sessionPromise);
        }
        
        if (this.sessionPromises.length > 0) {
          await Promise.race(this.sessionPromises);
          this.sessionPromises.splice(0, this.sessionPromises.length);
        }
      }
    };

    console.log(`🖥️  System Configuration:`);
    console.log(`   Max Concurrency: ${config.maxConcurrency}`);
    console.log(`   Memory Limit: ${config.safetyLimits.maxMemoryMB}MB`);
    console.log(`   Memory Threshold: ${Math.round(config.safetyLimits.memoryThreshold * 100)}%`);

    console.log(`⏳ Waiting ${config.startupDelay/1000} seconds for container to settle...`);
    await sleep(config.startupDelay);
    console.log('🚀 Starting progressive concurrency ramp-up');

    await processSessions();
    
    // Log session statistics
    console.log('\n📊 Session Statistics:');
    console.log(`   Total Sessions: ${sessionStats.completed + sessionStats.failed}`);
    console.log(`   Completed: ${sessionStats.completed}`);
    console.log(`   Failed: ${sessionStats.failed}`);
    console.log('   By Type:');
    Object.entries(sessionStats.byType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count} sessions`);
    });
    console.log('✅ All sessions completed');

    await this.browserPool.closeAll();
    console.log('Browser pool cleaned up');
  }

  getDeviceManager() {
    return this.deviceManager;
  }

  getBrowserPool() {
    return this.browserPool;
  }
}

module.exports = SessionManager;
