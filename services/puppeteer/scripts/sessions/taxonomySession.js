// Taxonomy session - visits category pages and browses products
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class TaxonomySession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      // Start from home page
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // Navigate to Best Sellers using the actual navigation
      try {
        // Look for "Best Sellers" link in navigation
        const navLinks = await page.$$('nav a, header a');
        let bestSellersLink = null;
        
        for (const link of navLinks) {
          const text = await link.evaluate(el => el.textContent?.trim().toLowerCase());
          if (text && text.includes('best sellers')) {
            bestSellersLink = link;
            console.log('Found Best Sellers navigation link');
            break;
          }
        }
        
        if (bestSellersLink) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
            bestSellersLink.click()
          ]);
          console.log('Successfully navigated to Best Sellers');
        } else {
          // If no Best Sellers link, just browse products from home page
          console.log('No Best Sellers link found, browsing products from home page');
        }
      } catch (navError) {
        console.log('Best sellers navigation failed, continuing with current page');
      }

      await sleep(1000);

      // Select and view a product (but don't necessarily purchase)
      try {
        await selectProduct(page);
        console.log('Product selected successfully');
        
        // 50% chance to add to cart and checkout
        if (Math.random() > 0.5) {
          await addToCart(page);
          await sleep(1500);
          await checkout(page);
          console.log('Purchase completed');
        } else {
          console.log('Just browsing, no purchase made');
        }
      } catch (productError) {
        console.log('Product browsing failed, ending session');
      }
      
      // Simple session end
      await sleep(1000);
      console.log('Taxonomy session completed');
      
    } catch (error) {
      console.error('Taxonomy session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
