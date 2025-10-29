// Home page session - visits home page and browses products
const config = require('../config');
const { selectHomePageProduct, selectRelatedProduct, goToFooterPage, addToCart, checkout, endSession, returnToHomeAndAddToCart, goToHomePage } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./BaseSession');

class HomePageSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  randomChance() {
    return Math.floor(Math.random() * 3) === 0;
  }

  async execute() {
    try {
      await goToHomePage(this);
      await selectHomePageProduct(this);
      await setTimeout(1000);
      await addToCart(this);
    } catch (productError) {
      this.log('Product selection failed, continuing session');
    }

    // Maybe add related product to cart
    if (this.randomChance()) {
      try {
        await selectRelatedProduct(this);
        await addToCart(this);
      } catch (relatedError) {
        this.log('Related product selection failed');
      }
    }

    await goToFooterPage(this);

    // Maybe return to home page and add something to cart
    if (this.randomChance()) {
      await returnToHomeAndAddToCart(this, 1000);
    }

    // Maybe do it again
    if (this.randomChance()) {
      await returnToHomeAndAddToCart(this, 2000);
    }

    await goToFooterPage(this);
    await checkout(this);
    await setTimeout(1000);
    await endSession(this);    
  }
}

module.exports = HomePageSession;
