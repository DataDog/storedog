// Home page session - visits home page and browses products
const config = require('../config');
const { setUtmParams, selectHomePageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class HomePageSession extends BaseSession {
  // Helper function for random chance (33% probability)
  randomChance() {
    return Math.floor(Math.random() * 3) === 0;
  }

  // Helper function to return to home page and purchase
  async returnToHomeAndPurchase(page, sleepDuration = 1000) {
    try {
      const logo = await page.$('[href="/"]');
      if (!logo) {
        console.log('Home logo not found');
        return;
      }
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        logo.evaluate((el) => el.click())
      ]);
      
      await selectHomePageProduct(page);
      await sleep(sleepDuration);
      await addToCart(page);
    } catch (error) {
      console.log('Home page return failed:', error.message);
    }
  }

  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      // Randomly set utm params
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;

      // Go to home page
      try {
        await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const pageTitle = await page.title();
        console.log(`"${pageTitle}" loaded`);
      } catch (gotoError) {
        console.log('Initial page load failed, continuing with current page');
      }

      // Try to select and purchase a product
      try {
        await selectHomePageProduct(page);
        await sleep(1000);
        await addToCart(page);
      } catch (productError) {
        console.log('Product selection failed, continuing session');
      }

      // Maybe purchase an extra product (33% chance)
      if (this.randomChance()) {
        try {
          await selectRelatedProduct(page);
          await addToCart(page);
        } catch (relatedError) {
          console.log('Related product selection failed');
        }
      }

      await goToFooterPage(page);

      // Maybe return to home page and purchase (33% chance)
      if (this.randomChance()) {
        await this.returnToHomeAndPurchase(page, 1000);
      }

      // Maybe do it again (33% chance)
      if (this.randomChance()) {
        await this.returnToHomeAndPurchase(page, 2000);
      }

      await goToFooterPage(page);
      await checkout(page);
      
      // End session
      await sleep(1000);
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log('Home page session completed');
      
    } catch (error) {
      console.error('Home page session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = HomePageSession;
