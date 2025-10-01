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
      // Start from home page and navigate to best sellers
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      console.log(`Attempting to navigate to: ${urlWithUtm}`);
      
      // go to home page (simple approach like other sessions)
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // Try to navigate to best sellers page (simple approach like browsing session)
      try {
        const bestSellersLink = await page.$('#bestsellers-link');
        if (bestSellersLink) {
          console.log('Found best sellers link, navigating...');
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            bestSellersLink.click()
          ]);
          console.log('Successfully navigated to Best Sellers page');
        } else {
          console.log('Best sellers link not found, trying direct URL...');
          const bestSellersUrl = config.storedogUrl.endsWith('/')
            ? `${config.storedogUrl}taxonomies/categories/bestsellers`
            : `${config.storedogUrl}/taxonomies/categories/bestsellers`;
          await page.goto(bestSellersUrl, { waitUntil: 'domcontentloaded' });
          console.log('Successfully navigated to Best Sellers page via direct URL');
        }
      } catch (e) {
        console.log('Best sellers navigation failed, continuing with current page:', e.message);
      }

      // get page url (simple like other sessions)
      const pageUrl = await page.url();
      console.log(`"${pageUrl}" loaded`);

      await sleep(1000);

      // select a product
      try {
        await selectProduct(page);
        console.log('on page', await page.title());

        // add to cart
        await addToCart(page);
      } catch (productError) {
        console.log('Product selection/add to cart failed:', productError.message);
        // Continue with checkout even if product selection failed
      }

      console.log('moving on to checkout');
      await sleep(1500);
      try {
        await checkout(page);
      } catch (checkoutError) {
        console.log('Checkout failed:', checkoutError.message);
        // Continue to end session
      }
      await sleep(1500);
      
      // go to home page with end session param
      const url = await page.url();
      const endUrl = `${url.split('?')[0]}?end_session=true`;
      console.log('endUrl', endUrl);

      await page.goto(endUrl, {
        waitUntil: 'domcontentloaded',
      });
      
      console.log('Taxonomy session completed with taxonomy browsing and purchases');
      
    } catch (error) {
      console.error('Taxonomy session failed:', error);
      console.error(`Failed URL: ${config.storedogUrl}`);
      console.error(`Environment STOREDOG_URL: ${process.env.STOREDOG_URL || 'not set'}`);
      console.error('Please verify STOREDOG_URL is set correctly and the URL is reachable');
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
