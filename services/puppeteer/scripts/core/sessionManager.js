// This file orchestrates the execution of all browser sessions.
// It manages concurrency, memory safety, and maintains continuous traffic by replacing completed sessions with new ones.

const config = require('../config');
const { setTimeout } = require('node:timers/promises');
const BrowserPool = require('../browser/browserPool');
const VipSession = require('../sessions/vipSession');
const BrowsingSession = require('../sessions/browsingSession');
const TaxonomySession = require('../sessions/taxonomySession');
const FrustrationSession = require('../sessions/frustrationSession');
const HomePageSession = require('../sessions/homePageSession');
const ShortSession = require('../sessions/shortSession');
const EarlyErrorSession = require('../sessions/earlyErrorSession');
const LateErrorSession = require('../sessions/lateErrorSession');
const CartAbandonmentSession = require('../sessions/cartAbandonmentSession');
const BotSession = require('../sessions/botSession');

// Build ramp-up schedule from the memory profile's percentages
// Each percentage is applied to the configured maxConcurrency
const concurrencyLevels = config.safetyLimits.rampUpPercentages.map((percentage, index) => ({
  time: index * config.rampUpInterval,
  maxConcurrent: Math.max(Math.ceil(config.maxConcurrency * percentage), 4)
}));

class SessionManager {

  // Map simple session names to actual filenames
  static normalizeSessionName(name) {
    switch (name) {
      case 'browsing':
        return BrowsingSession;
      case 'taxonomy':
        return TaxonomySession;
      case 'frustration':
        return FrustrationSession;
      case 'homepage':
        return HomePageSession;
      case 'short':
        return ShortSession;
      case 'vip':
        return VipSession;
      case 'earlyerror':
        return EarlyErrorSession;
      case 'lateerror':
        return LateErrorSession;
      case 'cartabandonment':
        return CartAbandonmentSession;
      case 'bot':
        return BotSession;
      default:
        return BrowsingSession;
    }
  }

  static getSessionClasses() {
    return config.sessionTypes.map(sessionName => {
      return SessionManager.normalizeSessionName(sessionName);
    });
  }
  constructor() {
    this.Sessions = SessionManager.getSessionClasses();
    this.browserPool = new BrowserPool();
    this.sessionPromises = [];
    this.startTime = Date.now();
    this.currentMaxConcurrent = concurrencyLevels[0].maxConcurrent;
  }
  
  log(message) {
    console.log(`[🕺 SessionManager] ${message}`);
  }

  getMemoryUsage = () => {
    const memUsage = process.memoryUsage();
    const memoryUsage = {
      mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      gb: (memUsage.heapUsed / 1024 / 1024 / 1024).toFixed(2)
    }
    return memoryUsage;
  };

  getMemoryUsageDiff = (before, after) => {
    return {
      mb: before.mb - after.mb,
      gb: (before.gb - after.gb)
    }
  }

  // Force JavaScript garbage collection to free up memory
  tryGarbageCollection = () => {
    const isGlobalGcAvailable = global.gc !== undefined;
    if (isGlobalGcAvailable) {
      const memoryUsageBefore = this.getMemoryUsage();
      global.gc();
      const memoryUsageAfter = this.getMemoryUsage();
      const memoryUsageDiff = this.getMemoryUsageDiff(memoryUsageBefore, memoryUsageAfter);
      if (memoryUsageDiff.mb > 0) {
      this.log(`🧠 Garbage collection freed up ${memoryUsageDiff.mb}MB (${memoryUsageDiff.gb}GB)`);
      }
    } else {
      this.log('Garbage collection is not available');
    }
  };
  
  // Helper function to check if we're using too much memory.
  // Returns true if memory is okay, false if we've exceeded the limit.
  checkMemoryLimit() {
    const memoryUsage = this.getMemoryUsage();
    // Get current memory usage
    // process.memoryUsage().heapUsed is the amount of JavaScript memory in use (in bytes)
    // We divide by 1024 twice to convert bytes → KB → MB
    if (memoryUsage.mb > config.safetyLimits.maxMemoryMB) {
      this.log(`🚨 Memory limit exceeded: ${memoryUsage.mb}MB (${memoryUsage.gb}GB) > ${config.safetyLimits.maxMemoryMB}MB`);
      return false;
    }
    // this.log(`🧠 Memory is okay: ${memoryUsage.mb}MB < ${config.safetyLimits.maxMemoryMB}MB`);
    return true;
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
    
    let sessionIdCounter = 1;
    
    const maxLoops = config.loop === 'single' ? 1 : Infinity;
    
    for (let loopCount = 0; loopCount < maxLoops; loopCount++) { 
      this.log(`🔄 Starting loop ${loopCount + 1} of ${maxLoops}`);
      // Check if it's time to increase concurrency based on elapsed time
      this.updateConcurrency();
      while (this.shouldAddNewSession()) {
        const randomIndex = Math.floor(Math.random() * this.Sessions.length);
        const Session = this.Sessions[randomIndex];
        const sessionId = sessionIdCounter++;
        const sessionPromise = (async () => {
          let session;
          let browser;
          
          try {
            browser = await this.browserPool.getBrowser();
            session = new Session(browser, sessionId);
            await session.run();
          } catch (error) {
            this.log(`Error creating session: ${error.message}`);
          } finally {
            try {
              if (browser) {
                await this.browserPool.releaseBrowser(browser);
              }
            } catch (cleanupError) {
              this.log(`Browser cleanup error: ${cleanupError.message}`);
            }
            
            this.tryGarbageCollection();
          }
        })();

        this.sessionPromises.push(sessionPromise);
        sessionPromise.finally(() => {
          this.sessionPromises.splice(this.sessionPromises.indexOf(sessionPromise), 1);
        });
      }
      
      if (this.sessionPromises.length > 0) {
        if (maxLoops === 1) {
          await Promise.all(this.sessionPromises);
          this.log(`🔄 All sessions completed. Exiting...`);
          process.exit(0);
        } else {
          await Promise.race(this.sessionPromises);
        }
      } else {
        this.log(`⚠️ No sessions running, waiting 1 second before retrying...`);
        await setTimeout(1000);
      }
    }
  }
}

module.exports = SessionManager;
