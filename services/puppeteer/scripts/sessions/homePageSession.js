// Home page session - visits home page and browses products
const config = require('../config');
const { setUtmParams, selectHomePageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout, sleep } = require('../utils');
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

      try {
        await selectHomePageProduct(page);
        await sleep(1000);
        await addToCart(page);
      } catch (productError) {
        console.log('Home page product selection failed:', productError.message);
        console.log('Continuing session without adding to cart...');
      }

      // maybe purchase that extra product
      if (Math.floor(Math.random() * 3) === 0) {
        try {
          await selectRelatedProduct(page);
          await addToCart(page);
        } catch (relatedError) {
          console.log('Related product selection failed:', relatedError.message);
        }
      }

      await goToFooterPage(page);

      // maybe go back to the home page and purchase another product
      if (Math.floor(Math.random() * 3) === 0) {
        try {
          const logo = await page.$('[href="/"]');
          await logo.evaluate((el) => el.click());
          await page.waitForNavigation();
          await selectHomePageProduct(page);
          await sleep(1000);
          await addToCart(page);
        } catch (homeError) {
          console.log('Home page return failed:', homeError.message);
        }
      }

      // maybe do that again
      if (Math.floor(Math.random() * 3) === 0) {
        try {
          const logo = await page.$('[href="/"]');
          await logo.evaluate((el) => el.click());
          await page.waitForNavigation();
          await selectHomePageProduct(page);
          await sleep(2000);
          await addToCart(page);
        } catch (homeError2) {
          console.log('Second home page return failed:', homeError2.message);
        }
      }

      await goToFooterPage(page);

      await checkout(page);
      await sleep(1000);
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
