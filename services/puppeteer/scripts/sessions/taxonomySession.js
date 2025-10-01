// Taxonomy session - visits taxonomy pages and purchases products
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout } = require('../utils');
const BaseSession = require('./baseSession');

class TaxonomySession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const bestsellersUrl = config.storedogUrl.endsWith('/')
        ? `${config.storedogUrl}taxonomies/categories/bestsellers`
        : `${config.storedogUrl}/taxonomies/categories/bestsellers`;

      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(bestsellersUrl) : bestsellersUrl;
      
      await page.goto(urlWithUtm, { waitUntil: 'networkidle0' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // get page url
      const pageUrl = await page.url();
      console.log(`"${pageUrl}" loaded`);

      await page.waitForTimeout(1000);

      // select a product
      await selectProduct(page);

      console.log('on page', await page.title());

      // add to cart
      await addToCart(page);

      console.log('moving on to checkout');
      await page.waitForTimeout(1500);
      await checkout(page);
      await page.waitForTimeout(1500);
      
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
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
