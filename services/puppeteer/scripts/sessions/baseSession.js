// Base session class - the parent class that all specific sessions inherit from.
// It provides common functionality for setting up browsers, emulating devices, and cleaning up.
// Specific sessions (like BrowsingSession, FrustrationSession) extend this class.

const config = require('../config');
const { DEVICES, EMOJIS } = require('../constants');

class BaseSession {
  // Get a random device profile for emulation
  static getRandomDevice() {
    if (DEVICES.length === 0) {
      throw new Error('No devices available for emulation');
    }
    return DEVICES[Math.floor(Math.random() * DEVICES.length)];
  }

  // Get a random emoji for user identification
  static getRandomEmoji() {
    if (EMOJIS.length === 0) {
      return '👤'; // Fallback emoji
    }
    return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  }

  static getLogLevel() {
    return config.debugSessions;
  }

  constructor(browser, sessionId) {
    this.sessionId = sessionId;
    this.sessionName = this.constructor.name;
    this.browser = browser;
    this.page = null;
    this.emoji = BaseSession.getRandomEmoji();
    this.device = BaseSession.getRandomDevice();
    this.logs = [];
    this.debugSessions = BaseSession.getLogLevel();
  }

  log(message) {
    this.logs.push(message);
    if (this.debugSessions) {
      console.log(`[${this.emoji} ${this.sessionName} ${this.sessionId}] ${message}`);
    }
  }

  async setupPage() {
    // Create new page
    this.page = await this.browser.newPage();
    
    // Set device emulation (viewport and user agent)
    await this.page.setViewport(this.device.viewport);
    await this.page.setUserAgent(this.device.userAgent);
    
    // Set cache settings
    await this.page.setCacheEnabled(config.enableCache);
    
    // Set request interception for blocking resources if needed
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      const url = request.url();
      
      // Allow Next.js development files through
      if (url.includes('_devPagesManifest.json') || 
          url.includes('_next/static/') || 
          url.includes('_next/webpack-hmr') ||
          url.includes('_next/webpack-dev-middleware') ||
          url.includes('__webpack_hmr')) {
        request.continue();
        return;
      }
      
      request.continue();
    });
    
    // Set navigation timeout
    await this.page.setDefaultNavigationTimeout(15000);
    
    // Set page visibility (prevents sites from detecting automation)
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(document, 'hidden', { value: false });
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
    });
  }

  // Full session lifecycle with logging and cleanup
  async run() {
    this.log('▶️ Starting');
    this.setupPage();
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
    // If debug is true, this will print the completed actions at the end of the session. 
    if (config.debug && this.logs.length > 0) {
      this.log(`Cleanup complete. Actions completed:`);
      const actionsObject = this.logs.reduce((obj, action, index) => {
        obj[`Action ${index + 1}`] = action;
        return obj;
      }, {});
      this.log(JSON.stringify(actionsObject, null, 2));
    }
  }
}

module.exports = BaseSession;
