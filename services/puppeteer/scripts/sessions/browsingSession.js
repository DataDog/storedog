const { selectProduct, addToCart, checkout, randomNavbarLink, goToHomePage, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

class BrowsingSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {    
    try {
      await goToHomePage(this);
      await randomNavbarLink(this);
      await selectProduct(this);
      await addToCart(this);
      await setTimeout(1500);
      await checkout(this);
      await setTimeout(1500);
      await endSession(this);
    } catch (error) { 
      this.log(`Browsing session failed: ${error.message}`);
    }
  }
}

module.exports = BrowsingSession;
