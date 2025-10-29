// Browser wrapper class - wraps Puppeteer browser instance with custom functionality

let browserIdCounter = 1;

class Browser {
  constructor(puppeteerBrowser) {
    this.browser = puppeteerBrowser;
    this.id = browserIdCounter++;
  }

  // Delegate Puppeteer browser methods to the underlying instance
  async newPage() {
    return await this.browser.newPage();
  }

  async pages() {
    return await this.browser.pages();
  }

  async close() {
    return await this.browser.close();
  }

  isConnected() {
    return this.browser.isConnected();
  }

  async version() {
    return await this.browser.version();
  }
}

module.exports = Browser;
