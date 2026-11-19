// Watch session - runs once per container start as a fixed user whose replay is always recorded.
// Buys the Blue Jeans so there is one predictable checkout session to find and watch in Session Replay.
const { goToHomePage, goToProduct, addToCart, toggleCart, proceedToCheckout, confirmPurchase, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');
const { WATCH_USER } = require('../constants');

class WatchSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
    this.user = WATCH_USER;
    this.device = BaseSession.getRandomDevice('desktop');
  }

  // Errors are not caught here so the SessionManager can retry a failed run
  async execute() {
    await goToHomePage(this);
    await setTimeout(3000);
    await goToProduct(this, 'blue-jeans');
    await setTimeout(3000);
    await addToCart(this);
    await setTimeout(1500);
    await toggleCart(this);
    await proceedToCheckout(this);
    await confirmPurchase(this);
    await setTimeout(1500);
    await endSession(this);
  }
}

module.exports = WatchSession;
