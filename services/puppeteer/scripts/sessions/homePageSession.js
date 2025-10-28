// Home page session - visits home page and browses products
const config = require('../config');
const { setUtmParams, selectHomePageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout } = require('./sessionActions');
const { sleep } = require('../utils');
const BaseSession = require('./baseSession');

class HomePageSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  // Helper function for random chance (33% probability)
  randomChance() {
    return Math.floor(Math.random() * 3) === 0;
  }

  // Helper function to return to home page and purchase
  async returnToHomeAndPurchase(sleepDuration = 1000) {
    try {
      const logo = await this.page.$('[href="/"]');
      if (!logo) {
        this.log('Home logo not found');
        return;
      }
      
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        logo.evaluate((el) => el.click())
      ]);
      
      await selectHomePageProduct(this);
      await sleep(sleepDuration);
      await addToCart(this);
    } catch (error) {
      this.log(`Home page return failed: ${error.message}`);
    }
  }

  async execute() {
    // Randomly set utm params
    const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;

    // Go to home page
    try {
      await this.page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const pageTitle = await this.page.title();
      this.log(`"${pageTitle}" loaded`);
    } catch (gotoError) {
      this.log('Initial page load failed, continuing with current page');
    }

    // Try to select and purchase a product
    try {
      await selectHomePageProduct(this);
      await sleep(1000);
      await addToCart(this);
    } catch (productError) {
      this.log('Product selection failed, continuing session');
    }

    // Maybe purchase an extra product (33% chance)
    if (this.randomChance()) {
      try {
        await selectRelatedProduct(this);
        await addToCart(this);
      } catch (relatedError) {
        this.log('Related product selection failed');
      }
    }

    await goToFooterPage(this);

    // Maybe return to home page and purchase (33% chance)
    if (this.randomChance()) {
      await this.returnToHomeAndPurchase(1000);
    }

    // Maybe do it again (33% chance)
    if (this.randomChance()) {
      await this.returnToHomeAndPurchase(2000);
    }

    await goToFooterPage(this);
    await checkout(this);
    
    // End session
    await sleep(1000);
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
    
    this.log('Home page session completed');
  }
}

module.exports = HomePageSession;
