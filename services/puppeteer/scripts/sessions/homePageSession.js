// Home page session - visits home page and browses products
const config = require('../config');
const { setUtmParams } = require('../utils');
const BaseSession = require('./baseSession');

class HomePageSession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = setUtmParams(config.storedogUrl);
      
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
      
      await page.waitForSelector('img[alt*="Datadog"]', { timeout: 10000 });
      await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
      
      const productLinks = await page.$$eval('a[href*="/products/"]', links => 
        links.slice(0, 3).map(link => link.href)
      );
      
      for (const productUrl of productLinks) {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
      
      await page.goto(config.storedogUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error('Main session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = HomePageSession;
