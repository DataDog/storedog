// Taxonomy session - visits taxonomy pages and purchases products
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
      
      // Go to home page
      try {
        await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const pageTitle = await page.title();
        console.log(`"${pageTitle}" loaded`);
      } catch (gotoError) {
        console.log('Initial page load failed, continuing with current page');
      }

      // Navigate to best sellers page
      try {
        const bestSellersLink = await page.$('#bestsellers-link');
        if (bestSellersLink) {
          console.log('Found best sellers link, navigating...');
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            bestSellersLink.click()
          ]);
          console.log('Successfully navigated to Best Sellers');
        } else {
          // Fallback to direct URL
          const bestSellersUrl = config.storedogUrl.endsWith('/')
            ? `${config.storedogUrl}taxonomies/categories/bestsellers`
            : `${config.storedogUrl}/taxonomies/categories/bestsellers`;
          await page.goto(bestSellersUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
          console.log('Navigated to Best Sellers via direct URL');
        }
      } catch (navError) {
        console.log('Best sellers navigation failed, continuing with current page');
      }

      await sleep(1000);

      // Select a product and add to cart
      try {
        await selectProduct(page);
        await addToCart(page);
      } catch (productError) {
        console.log('Product selection/add to cart failed, continuing session');
      }

      // Proceed to checkout
      console.log('Moving to checkout');
      await sleep(1500); // Allow UI to settle
      try {
        await checkout(page);
      } catch (checkoutError) {
        console.log('Checkout failed, continuing to end session');
      }
      
      // End session
      await sleep(1500); // Allow checkout to complete
      const url = await page.url();
      const endUrl = `${url.split('?')[0]}?end_session=true`;
      
      await page.goto(endUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log('Taxonomy session completed');
      
    } catch (error) {
      console.error('Taxonomy session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
