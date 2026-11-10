// Early error session - error occurs early, captured by error filter without fallback
const { goToHomePage, generateErrorClicks, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

class EarlyErrorSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await setTimeout(1000);
      await generateErrorClicks(this);  // Error early in session
      await setTimeout(500);
      await endSession(this);
    } catch (error) {
      this.log(`Early error session failed: ${error.message}`);
    }
  }
}

module.exports = EarlyErrorSession;

