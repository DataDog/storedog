// Browsing session - additional browsing and interaction patterns
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout } = require('../utils');
const BaseSession = require('./baseSession');

class BrowsingSession extends BaseSession {
  async run() {
    console.log('Starting browsing session');
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      // go to home page
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // select any link along the top nav
      const navLinks = await page.$$('#main-navbar a');
      const randomIndex = Math.floor(Math.random() * navLinks.length);
      const randomLink = navLinks[randomIndex];
      await Promise.all([
        page.waitForNavigation(),
        randomLink.evaluate((el) => el.click()),
      ]);
      pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // select a product
      await selectProduct(page);

      // add to cart
      await addToCart(page);

      console.log('moving on to checkout');
      await page.waitForTimeout(1500);
      await checkout(page);
      await page.waitForTimeout(1500);
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
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
