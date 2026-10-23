// Base session class - the parent class that all specific sessions inherit from.
// It provides common functionality for setting up browsers, emulating devices, and cleaning up.
// Specific sessions (like BrowsingSession, FrustrationSession) extend this class.

const config = require('../config');
const { DEVICES, EMOJIS, VIP_USERS, USERS } = require('../constants');
const { setTimeout: setTimeoutPromise } = require('node:timers/promises');

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

  static getRandomUser(isVip = false) {
    let userInfo = {};
    if (isVip) {
      userInfo = VIP_USERS[Math.floor(Math.random() * VIP_USERS.length)];
    } else {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    }
    return userInfo;
  }

  constructor(browser, sessionId) {
    this.sessionId = sessionId;
    this.sessionName = this.constructor.name;
    this.browser = browser;
    this.page = null;
    this.emoji = BaseSession.getRandomEmoji();
    this.device = BaseSession.getRandomDevice();
    this.debugSessions = BaseSession.getLogLevel();
    this.isVip = false;
  }

  log(message) {
    if (this.debugSessions) {
      console.log(`[${this.emoji} ${this.sessionName} ${this.sessionId}] ${message}`);
    }
  }

  async verifyRumCookies() {
    try {
      const cookies = await this.page.cookies();
      const rumAppIdCookie = cookies.find(c => c.name === 'rum_app_id');
      const rumTokenCookie = cookies.find(c => c.name === 'rum_client_token');
      
      if (rumAppIdCookie && rumTokenCookie) {
        this.log(`✅ RUM cookies set: App ID=${rumAppIdCookie.value}, Token=${rumTokenCookie.value.substring(0, 8)}...`);
        
        // Also check if RUM SDK initialized
        const rumInitialized = await this.page.evaluate(() => {
          return !!window.__DD_RUM_INITIALIZED__;
        });
        
        if (rumInitialized) {
          this.log('✅ RUM SDK initialized in browser');
        } else {
          this.log('⚠️  RUM SDK not yet initialized in browser');
        }
      } else {
        this.log(`❌ RUM cookies NOT set! Found: ${cookies.map(c => c.name).join(', ')}`);
      }
    } catch (error) {
      this.log(`Error checking RUM cookies: ${error.message}`);
    }
  }

  async setupPage(isVip = false) {
    // Create new page
    this.page = await this.browser.newPage();
    
    const userInfo = BaseSession.getRandomUser(isVip);
    const stringifiedUserInfo = JSON.stringify(userInfo);
    this.log(`Setting user: ${stringifiedUserInfo}`);

    // Set RUM configuration from environment variables
    const rumAppId = process.env.RUM_APP_ID;
    const rumClientToken = process.env.RUM_CLIENT_TOKEN;
    
    if (rumAppId && rumClientToken) {
      this.log(`Setting RUM config via headers: App ID=${rumAppId}, Token=${rumClientToken.substring(0, 8)}...`);
      // Set custom headers on all requests to nginx
      await this.page.setExtraHTTPHeaders({
        'X-RUM-App-ID': rumAppId,
        'X-RUM-Client-Token': rumClientToken
      });
    } else {
      this.log(`⚠️  WARNING: RUM credentials not set! App ID=${rumAppId}, Token=${rumClientToken ? 'set' : 'missing'}`);
    }

    // Set localStorage BEFORE page loads - this runs before any page JavaScript
    // Only set if not already set (persists across navigations)
    await this.page.evaluateOnNewDocument((userInfoString) => {
      if (!localStorage.getItem('rum_user')) {
        localStorage.setItem('rum_user', userInfoString);
      }
    }, stringifiedUserInfo);

    // Set device emulation (viewport and user agent)
    await this.page.setViewport(this.device.viewport);
    await this.page.setUserAgent(this.device.userAgent);
    
    // Set cache settings
    await this.page.setCacheEnabled(config.enableCache);
    
    // Set request interception for blocking resources if needed
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      const url = request.url();
      const resourceType = request.resourceType();
      
      // Block resource-heavy content types to reduce CPU/memory usage
      const blockedTypes = ['image', 'stylesheet', 'font', 'media'];
      if (blockedTypes.includes(resourceType)) {
        request.abort();
        return;
      }
      
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
    
    // Listen to console messages for RUM debugging
    if (config.debugSessions) {
      this.page.on('console', async (msg) => {
        const text = msg.text();
        if (text.includes('RUM') || text.includes('DD_RUM') || text.includes('datadogRum')) {
          this.log(`[Browser Console] ${text}`);
        }
      });
    }
  }

  // Full session lifecycle with logging and cleanup
  async run() {
    this.log('▶️ Starting');
    await this.setupPage(this.isVip);
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
        // Remove all event listeners before closing
        this.page.removeAllListeners('request');
        this.page.removeAllListeners('response');
        this.page.removeAllListeners('console');
        this.page.removeAllListeners('error');
        
        // Close the page with a timeout to prevent hanging
        await Promise.race([
          this.page.close(),
          setTimeoutPromise(2000)
        ]);
      }
    } catch (error) {
      this.log(`Page close error: ${error.message}`);
    }
  }
}

module.exports = BaseSession;
