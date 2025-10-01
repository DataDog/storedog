// Browsing session - additional browsing and interaction patterns
const config = require('../config');
const { setUtmParams } = require('../utils');
const BaseSession = require('./baseSession');

class BrowsingSession extends BaseSession {
  async run() {
    console.log('Starting browsing session');
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
      
      await page.waitForSelector('img[alt*="Datadog"]', { timeout: 10000 });
      await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
      
      // Browse different sections
      const productLinks = await page.$$eval('a[href*="/products/"]', links => 
        links.slice(0, 2).map(link => link.href)
      );
      
      for (const productUrl of productLinks) {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
      }
      
      // Return to home page
      await page.goto(config.storedogUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      console.log('Browsing session completed');
      
    } catch (error) {
      console.error('Browsing session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = BrowsingSession;
