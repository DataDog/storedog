// Browsing session - additional browsing and interaction patterns
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class BrowsingSession extends BaseSession {
  async run() {
    console.log('Starting browsing session');
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      // Go to home page
      try {
        await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const pageTitle = await page.title();
        console.log(`"${pageTitle}" loaded`);
      } catch (gotoError) {
        console.log('Initial page load failed, continuing with current page');
      }

      // Select and navigate to a random navbar link
      const navLinks = await page.$$('#main-navbar a');
      if (navLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * navLinks.length);
        const randomLink = navLinks[randomIndex];
        
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            randomLink.evaluate((el) => el.click()),
          ]);
          const pageTitle = await page.title();
          console.log(`Navigated to "${pageTitle}"`);
        } catch (navError) {
          console.log('Navigation timeout, clicking without waiting');
          await randomLink.evaluate((el) => el.click());
          await sleep(1000);
        }
      } else {
        console.log('No navigation links found, staying on current page');
      }

      // Select a product and add to cart
      await selectProduct(page);
      await addToCart(page);

      // Proceed to checkout
      console.log('Moving to checkout');
      await sleep(1500); // Allow UI to settle
      await checkout(page);
      
      // End session
      await sleep(1500); // Allow checkout to complete
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log('Browsing session completed');
      
    } catch (error) {
      console.error('Browsing session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = BrowsingSession;
