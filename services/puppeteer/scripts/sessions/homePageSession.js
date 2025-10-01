// Home page session - visits home page and browses products
const config = require('../config');
const { setUtmParams, selectHomePageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout } = require('../utils');
const BaseSession = require('./baseSession');

class HomePageSession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      // randomly set utm params
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;

      // go to home page
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });

      const pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      await selectHomePageProduct(page);
      await page.waitForTimeout(1000);
      await addToCart(page);

      // maybe purchase that extra product
      if (Math.floor(Math.random() * 3) === 0) {
        await selectRelatedProduct(page);
        await addToCart(page);
      }

      await goToFooterPage(page);

      // maybe go back to the home page and purchase another product
      if (Math.floor(Math.random() * 3) === 0) {
        const logo = await page.$('[href="/"]');
        await logo.evaluate((el) => el.click());
        await page.waitForNavigation();
        await selectHomePageProduct(page);
        await page.waitForTimeout(1000);
        await addToCart(page);
      }

      // maybe do that again
      if (Math.floor(Math.random() * 3) === 0) {
        const logo = await page.$('[href="/"]');
        await logo.evaluate((el) => el.click());
        await page.waitForNavigation();
        await selectHomePageProduct(page);
        await page.waitForTimeout(2000);
        await addToCart(page);
      }

      await goToFooterPage(page);

      await checkout(page);
      await page.waitForTimeout(1000);
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
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
