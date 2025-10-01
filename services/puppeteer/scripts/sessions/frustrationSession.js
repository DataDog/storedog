// Frustration session - has frustration signals due to incorrect product item UI component
const config = require('../config');
const { setUtmParams } = require('../utils');
const BaseSession = require('./baseSession');

class FrustrationSession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = `${config.storedogUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;
      
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
      
      await page.waitForSelector('img[alt*="Datadog"]', { timeout: 10000 });
      await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
      
      // Navigate to a product page (this will trigger frustration signals)
      const productLinks = await page.$$eval('a[href*="/products/"]', links => 
        links.slice(0, 1).map(link => link.href)
      );
      
      if (productLinks.length > 0) {
        await page.goto(productLinks[0], { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        // This session intentionally has frustration signals
        console.log('Frustration session completed with frustration signals');
      }
      
    } catch (error) {
      console.error('Frustration session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = FrustrationSession;
