// Browser pool management
const puppeteer = require('puppeteer');
const config = require('./config');

class BrowserPool {
  constructor(poolSize = config.browserPoolSize) {
    this.pool = [];
    this.poolSize = poolSize;
    this.chromeArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-field-trial-config',
      '--disable-back-forward-cache',
      '--disable-ipc-flooding-protection',
      '--max_old_space_size=256'
    ];

    // Add cache control based on config
    if (!config.enableCache) {
      this.chromeArgs.push('--disable-web-security', '--disable-http-cache');
    }
  }

  async getBrowser() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return await this.createBrowser();
  }

  async createBrowser() {
    const browser = await puppeteer.launch({
      headless: true,
      args: this.chromeArgs,
      slowMo: 50,
      timeout: 15000
    });
    
    try {
      const version = await browser.version();
      console.log(`Browser started: ${version}`);
    } catch (error) {
      console.log('Browser started (version unavailable)');
    }
    
    return browser;
  }

  async releaseBrowser(browser) {
    try {
      if (browser.isConnected() && this.pool.length < this.poolSize) {
        this.pool.push(browser);
      } else {
        await browser.close();
      }
    } catch (error) {
      console.log('Error releasing browser:', error.message);
    }
  }

  async closeAll() {
    for (const browser of this.pool) {
      try {
        await browser.close();
      } catch (error) {
        console.log('Error closing browser:', error.message);
      }
    }
    this.pool = [];
  }
}

module.exports = BrowserPool;
