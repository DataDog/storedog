// Search session - focuses on search functionality and search result browsing
const config = require('../config');
const { setUtmParams } = require('../utils');
const BaseSession = require('./baseSession');

class SearchSession extends BaseSession {
  async run() {
    console.log('Starting search session');
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = setUtmParams(config.storedogUrl);
      
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
      
      await page.waitForSelector('img[alt*="Datadog"]', { timeout: 10000 });
      
      // Look for search functionality
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
      
      if (searchInput) {
        await searchInput.type('datadog');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        console.log('Performed search for "datadog"');
      } else {
        console.log('No search input found, browsing products instead');
        await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
        
        const productLinks = await page.$$eval('a[href*="/products/"]', links => 
          links.slice(0, 2).map(link => link.href)
        );
        
        for (const productUrl of productLinks) {
          await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1000);
        }
      }
      
      console.log('Search session completed');
      
    } catch (error) {
      console.error('Search session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = SearchSession;
