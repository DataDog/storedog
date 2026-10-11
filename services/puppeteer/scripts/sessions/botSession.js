// Bot session - simulates bot traffic for negative filter demo
const { goToHomePage, endSession } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

class BotSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async setupPage(isVip = false) {
    await super.setupPage(isVip);
    // Override user agent to Googlebot - this sets @device.type:Bot in RUM
    await this.page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
  }

  async execute() {
    try {
      await goToHomePage(this);
      await setTimeout(1000);
      await endSession(this);
    } catch (error) {
      this.log(`Bot session failed: ${error.message}`);
    }
  }
}

module.exports = BotSession;

