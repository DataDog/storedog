// Taxonomy session - visits category pages and browses products
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout } = require('./sessionActions');
const { sleep } = require('../utils');
const BaseSession = require('./baseSession');

class TaxonomySession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    // Start from home page
    const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
    
    await this.page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const pageTitle = await this.page.title();
    this.log(`"${pageTitle}" loaded`);

    // Navigate to Best Sellers using the actual navigation
    try {
      // Look for "Best Sellers" link in navigation
      const navLinks = await this.page.$$('nav a, header a');
      let bestSellersLink = null;
      
      for (const link of navLinks) {
        const text = await link.evaluate(el => el.textContent?.trim().toLowerCase());
        if (text && text.includes('best sellers')) {
          bestSellersLink = link;
          this.log('Found Best Sellers navigation link');
          break;
        }
      }
      
      if (bestSellersLink) {
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
          bestSellersLink.click()
        ]);
        this.log('Successfully navigated to Best Sellers');
      } else {
        // If no Best Sellers link, just browse products from home page
        this.log('No Best Sellers link found, browsing products from home page');
      }
    } catch (navError) {
      this.log('Best sellers navigation failed, continuing with current page');
    }

    await sleep(1000);

    // Select and view a product (but don't necessarily purchase)
    try {
      await selectProduct(this);
      this.log('Product selected successfully');
      
      // 50% chance to add to cart and checkout
      if (Math.random() > 0.5) {
        await addToCart(this);
        await sleep(1500);
        await checkout(this);
        this.log('Purchase completed');
      } else {
        this.log('Just browsing, no purchase made');
      }
    } catch (productError) {
      this.log('Product browsing failed, ending session');
    }
    
    // Simple session end
    await sleep(1000);
    this.log('Taxonomy session completed');
  }
}

module.exports = TaxonomySession;
