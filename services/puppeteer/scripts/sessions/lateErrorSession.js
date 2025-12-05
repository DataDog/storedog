// Late error session - error occurs at END, demonstrates fallback necessity
const { goToHomePage, selectProduct, addToCart, checkout, generateErrorClicks, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

class LateErrorSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await selectProduct(this);
      await addToCart(this);
      await setTimeout(1000);
      await checkout(this);
      await setTimeout(2000);
      await generateErrorClicks(this);  // Error at END of session
      await setTimeout(500);
      await endSession(this);
    } catch (error) {
      this.log(`Late error session failed: ${error.message}`);
    }
  }
}

module.exports = LateErrorSession;

