// Taxonomy session - visits category pages and browses products
const { goToHomePage, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./BaseSession');

class ShortSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await setTimeout(2000);
      await endSession(this);
    } catch (error) { 
      this.log(`Short session failed: ${error.message}`);
    }
  }
}

module.exports = ShortSession;
