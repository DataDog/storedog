// Base session class
const config = require('../config');
const { optimizePageResources } = require('../utils');

class BaseSession {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.deviceManager = sessionManager.getDeviceManager();
    this.browserPool = sessionManager.getBrowserPool();
  }

  async setupPage() {
    const browser = await this.browserPool.getBrowser();
    const page = await browser.newPage();
    
    // Emulate a random device
    const device = this.deviceManager.getRandomDevice();
    await page.setViewport(device.viewport);
    await page.setUserAgent(device.userAgent);
    console.log(`Emulating device: ${device.name}`);
    
    // Clear browser context for fresh session
    await this.sessionManager.clearBrowserContext(page);
    
    // Check if page is still connected
    if (page.isClosed()) {
      console.log('Page closed during setup, skipping session');
      return null;
    }
    
    // Apply memory optimizations
    await optimizePageResources(page);
    
    await page.setDefaultNavigationTimeout(config.puppeteerTimeout);
    
    return { browser, page };
  }

  async cleanup(browser, page) {
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
    } catch (error) {
      console.log('Error during cleanup:', error.message);
    } finally {
      try {
        await this.browserPool.releaseBrowser(browser);
      } catch (browserError) {
        console.log('Error releasing browser to pool:', browserError.message);
      }
    }
  }
}

module.exports = BaseSession;
