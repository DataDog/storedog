// Browsing session - additional browsing and interaction patterns
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class BrowsingSession extends BaseSession {
  async execute() {
    const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
    
    // Go to home page
    try {
      await this.page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const pageTitle = await this.page.title();
      this.log(`"${pageTitle}" loaded`);
    } catch (gotoError) {
      this.log('Initial page load failed, continuing with current page');
    }

    // Select and navigate to a random navbar link
    const navLinks = await this.page.$$('#main-navbar a');
    if (navLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * navLinks.length);
      const randomLink = navLinks[randomIndex];
      
      try {
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
          randomLink.evaluate((el) => el.click()),
        ]);
        const pageTitle = await this.page.title();
        this.log(`Navigated to "${pageTitle}"`);
      } catch (navError) {
        this.log('Navigation timeout, clicking without waiting');
        await randomLink.evaluate((el) => el.click());
        await sleep(1000);
      }
    } else {
      this.log('No navigation links found, staying on current page');
    }

    // Select a product and add to cart
    await selectProduct(this.page);
    await addToCart(this.page);

    // Proceed to checkout
    this.log('Moving to checkout');
    await sleep(1500); // Allow UI to settle
    await checkout(this.page);
    
    // End session
    await sleep(1500); // Allow checkout to complete
    try {
      const url = await this.page.url();
      await this.page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      this.log('Session ended successfully');
    } catch (endError) {
      this.log('Session end navigation failed, but continuing to complete');
    }
  }
}

module.exports = BrowsingSession;
