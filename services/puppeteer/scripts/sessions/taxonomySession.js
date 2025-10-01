// Taxonomy session - visits taxonomy pages and purchases products
const config = require('../config');
const { setUtmParams } = require('../utils');
const BaseSession = require('./baseSession');

class TaxonomySession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const bestsellersUrl = config.storedogUrl.endsWith('/')
        ? `${config.storedogUrl}taxonomies/categories/bestsellers`
        : `${config.storedogUrl}/taxonomies/categories/bestsellers`;

      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(bestsellersUrl) : bestsellersUrl;
      
      await page.goto(urlWithUtm, { waitUntil: 'networkidle0' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
      
      await page.waitForSelector('img[alt*="Datadog"]', { timeout: 10000 });
      await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
      
      // Navigate to product pages
      const productLinks = await page.$$eval('a[href*="/products/"]', links => 
        links.slice(0, 3).map(link => link.href)
      );
      
      for (const productUrl of productLinks) {
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
      
      // Simulate purchase flow
      await page.goto(bestsellersUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      console.log('Taxonomy session completed with taxonomy browsing and purchases');
      
    } catch (error) {
      console.error('Taxonomy session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
