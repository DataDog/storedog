// Base session class - the parent class that all specific sessions inherit from.
// It provides common functionality for setting up browsers, emulating devices, and cleaning up.
// Specific sessions (like BrowsingSession, FrustrationSession) extend this class.

const { optimizePageResources } = require('../utils');

class BaseSession {
  // Constructor receives the sessionManager so we can access browsers and devices
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    // Get references to the managers we need
    this.deviceManager = sessionManager.getDeviceManager();
    this.browserPool = sessionManager.getBrowserPool();
  }

  // Set up a new browser page with device emulation and optimizations
  // This is called at the start of every session
  async setupPage() {
    // Get a browser from the pool (might be new or reused)
    const browser = await this.browserPool.getBrowser();
    
    // Create a new page (tab) in the browser
    const page = await browser.newPage();
    
    // Emulate a random device (iPhone, Android, desktop, etc.)
    const device = this.deviceManager.getRandomDevice();
    
    // Set the viewport size (screen dimensions)
    // This makes the browser think it's on a phone/tablet/desktop
    await page.setViewport(device.viewport);
    
    // Set the user agent string (browser identification)
    // Websites see this and think we're that device/browser
    await page.setUserAgent(device.userAgent);
    console.log(`Emulating device: ${device.name}`);
    
    // Clear all browser data (cookies, cache, storage) to start fresh
    // This makes RUM see each session as a unique user
    await this.sessionManager.clearBrowserContext(page);
    
    // Safety check: make sure the page didn't close during setup
    if (page.isClosed()) {
      console.log('Page closed during setup, skipping session');
      return null; // Return null to indicate setup failed
    }
    
    // Disable loading images/CSS/fonts to save memory and speed up navigation
    await optimizePageResources(page);
    
    // Set a timeout for all navigation operations (15 seconds)
    // If a page takes longer than this to load, it will fail
    await page.setDefaultNavigationTimeout(15000);
    
    // Return both the browser and page so the session can use them
    return { browser, page };
  }

  // Clean up after a session finishes
  // This ensures we don't leak memory or leave resources open
  async cleanup(browser, page) {
    try {
      // Close the page if it's still open
      if (page && !page.isClosed()) {
        await page.close();
      }
    } catch (error) {
      // If closing fails, log it but don't crash
      console.log('Page cleanup error:', error.message);
    } finally {
      // The "finally" block always runs, even if there was an error above
      try {
        // Return the browser to the pool for reuse
        await this.browserPool.releaseBrowser(browser);
      } catch (browserError) {
        console.log('Browser release error:', browserError.message);
      }
    }
  }
}

// Export the class so other session files can extend it
module.exports = BaseSession;
