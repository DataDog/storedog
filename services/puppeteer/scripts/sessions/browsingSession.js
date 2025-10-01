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
      let pageTitle;
      
      // go to home page
      try {
        await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
        pageTitle = await page.title();
        console.log(`"${pageTitle}" loaded`);
      } catch (gotoError) {
        console.log('Initial page load failed:', gotoError.message);
        console.log('Attempting to continue with current page...');
        // Try to get current page title even if goto failed
        try {
          pageTitle = await page.title();
          console.log(`Current page: "${pageTitle}"`);
        } catch (titleError) {
          console.log('Could not get page title, page may not be loaded');
          pageTitle = 'Unknown Page';
        }
      }

      // select any link along the top nav
      const navLinks = await page.$$('#main-navbar a');
      if (navLinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * navLinks.length);
        const randomLink = navLinks[randomIndex];
        
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            randomLink.evaluate((el) => el.click()),
          ]);
          pageTitle = await page.title();
          console.log(`"${pageTitle}" loaded`);
        } catch (navError) {
          console.log('Navigation timeout, link might not cause navigation:', navError.message);
          // Just click without waiting for navigation
          await randomLink.evaluate((el) => el.click());
          await sleep(1000);
          pageTitle = await page.title();
          console.log(`"${pageTitle}" loaded`);
        }
      } else {
        console.log('No navigation links found, staying on current page');
      }

      // select a product
      await selectProduct(page);

      // add to cart
      await addToCart(page);

      console.log('moving on to checkout');
      await sleep(1500);
      await checkout(page);
      await sleep(1500);
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
