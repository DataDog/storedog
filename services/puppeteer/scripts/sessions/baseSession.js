// Base session class - the parent class that all specific sessions inherit from.
// It provides common functionality for setting up browsers, emulating devices, and cleaning up.
// Specific sessions (like BrowsingSession, FrustrationSession) extend this class.

const { optimizePageResources, getRandomDevice } = require('../utils');

class BaseSession {
  constructor(browser, sessionId) {
    this.sessionId = sessionId;
    this.sessionName = this.constructor.name;
    this.browser = browser;
    this.page = null;
    this.device = getRandomDevice();
  }

  log(message) {
    console.log(`[${this.sessionName} ${this.sessionId}] ${message}`);
  }

  async setupPage() {
    this.page = await this.browser.newPage();
    await this.page.setViewport(this.device.viewport);
    await this.page.setUserAgent(this.device.userAgent);
    await this.page.setDefaultNavigationTimeout(15000);
    await optimizePageResources(this.page);
  }

  // Full session lifecycle with logging and cleanup
  async run() {
    this.log('▶️ Starting');
    
    try {
      await this.execute();
      this.log('✅ Completed');
    } catch (error) {
      this.log(`❌ Failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  // Subclasses must implement this method
  async execute() {
    throw new Error('Subclass must implement execute()');
  }

  // Clean up the page (SessionManager handles browser cleanup)
  async cleanup() {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close();
      }
    } catch (error) {
      this.log(`Page close error: ${error.message}`);
    }
  }
}

module.exports = BaseSession;
