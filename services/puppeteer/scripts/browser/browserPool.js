// This file manages a pool of Chrome browser instances.
// Instead of creating a new browser for each session (which is slow and memory-intensive),
// we create a pool of browsers that can be reused across sessions.

const puppeteer = require('puppeteer');
const config = require('../config');
const { CHROME_ARGS } = require('../constants');
const Browser = require('./browser');

class BrowserPool {
  constructor(poolSize = config.browserPoolSize) {
    this.pool = [];
    this.poolSize = poolSize;
    this.chromeArgs = CHROME_ARGS;

    if (!config.enableCache) {
      this.chromeArgs.push('--disable-web-security', '--disable-http-cache');
    }
  }

  log(message) {
    console.log(`[🌐 BrowserPool] ${message}`);
  }

  async getBrowser() {
    if (this.pool.length > 0) {
      const browser = this.pool.pop();
      const version = await browser.version();
      this.log(`Browser ${browser.id} provided by BrowserPool: ${version}`);
      return browser;
    }
    
    this.log('No browsers available, creating a new one');
    const browser = await puppeteer.launch({
      headless: true,
      args: this.chromeArgs,
      timeout: 15000
    });

    const newBrowser = new Browser(browser);
    this.log(`New browser created: ${newBrowser.id}`);
    return newBrowser;
  }

  async clearBrowserContext(browser) {
    try {
      const pages = await browser.pages();
      const page = pages[0];
      if (!page) return;

      const client = await page.createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');
      await client.send('Runtime.evaluate', {
        expression: `
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
          if (window.indexedDB) {
            indexedDB.databases().then(dbs => {
              dbs.forEach(db => indexedDB.deleteDatabase(db.name));
            }).catch(() => {});
          }
        `
      });
      await client.detach();
      this.log(`Browser context cleared for ${browser.id}`);
    } catch (error) {
      this.log(`Error clearing browser context: ${error.message}`);
    }
  }

  async releaseBrowser(browser) {
    try {
      if (browser.isConnected() && this.pool.length < this.poolSize) {
        try {
          const pages = await browser.pages();
          for (const page of pages) {
            if (page.url() !== 'about:blank') {
              await page.close().catch(() => {});
            }
          }
        } catch (pageCleanupError) {
          this.log(`Error cleaning up pages: ${pageCleanupError.message}`);
        }

        await this.clearBrowserContext(browser);
        
        this.pool.push(browser);
        this.log(`Browser ${browser.id} returned to pool`);
      } else {
        await browser.close();
        this.log(`Browser ${browser.id} closed`);
      }
    } catch (error) {
      this.log(`Error releasing browser: ${error.message}`);
      throw error;
    }
  }

  // Close all browsers in the pool. This is called when shutting down.
  async closeAll() {
    for (const browser of this.pool) {
      try {
        await browser.close();
      } catch (error) {
        this.log(`Error closing browser: ${error.message}`);
      } 
    }
    this.log('All browsers closed');
    this.pool = [];
  }
}

module.exports = BrowserPool;
