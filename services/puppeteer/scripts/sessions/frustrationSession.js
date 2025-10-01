// Frustration session - has frustration signals due to incorrect product item UI component
const config = require('../config');
const { setUtmParams, selectProductsPageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class FrustrationSession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = `${config.storedogUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;

      // go to home page
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // go to all products page (and maybe leave)
      await selectProductsPageProduct(page);
      await addToCart(page);

      await selectProductsPageProduct(page);
      await addToCart(page);

      // maybe select a related product
      if (Math.floor(Math.random() * 2) === 0) {
        await selectRelatedProduct(page);
        await addToCart(page);
      }

      // maybe try to find another product on the products page
      if (Math.floor(Math.random() * 4) === 0) {
        await selectProductsPageProduct(page);
        await addToCart(page);
      }

      await goToFooterPage(page);

      // maybe try to find another product on the products page
      if (Math.floor(Math.random() * 4) === 0) {
        await selectProductsPageProduct(page);
        await addToCart(page);
      }

      await goToFooterPage(page);

      await sleep(1500);
      await checkout(page);
      await sleep(1500);
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
      });
      
      console.log('Frustration session completed with frustration signals');
      
    } catch (error) {
      console.error('Frustration session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = FrustrationSession;
