// Cart abandonment session - adds to cart but leaves without purchasing
const { goToHomePage, selectProduct, addToCart, goToFooterPage, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

class CartAbandonmentSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await selectProduct(this);
      await addToCart(this);
      await setTimeout(3000);  // Dwell time - user is considering
      await goToFooterPage(this);
      await setTimeout(1000);
      // NO checkout - user abandons cart
      await endSession(this);
    } catch (error) {
      this.log(`Cart abandonment session failed: ${error.message}`);
    }
  }
}

module.exports = CartAbandonmentSession;

