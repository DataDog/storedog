// Taxonomy session - visits category pages and browses products
const { selectProduct, addToCart, checkout, goToHomePage, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./BaseSession');

const randomChance = (percentChance = 33) => {
  return Math.floor(Math.random() * (100/percentChance)) === 0;
}

class TaxonomySession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    // Navigate to Best Sellers using the actual navigation
    try {
      await goToHomePage(this);
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

    await setTimeout(1000);

    // Select and view a product (but don't necessarily purchase)
    try {
      await selectProduct(this);
            // 50% chance to add to cart and checkout
      if (randomChance(50)) {
        await addToCart(this);
        await setTimeout(1500);
        await checkout(this);
        this.log('Purchase completed');
      } else {
        this.log('Just browsing, no purchase made');
      }
    } catch (error) {
      this.log('Product browsing failed, ending session');
    }
    
    await endSession(this);
  }
}

module.exports = TaxonomySession;
