// Frustration session - generates all three types of frustration signals
const { setTimeout } = require('node:timers/promises');
const { 
  goToHomePage,
  selectProductsPageProduct, 
  tryToSelectLearningBitsRelatedProduct,
  goToFooterPage, 
  addToCart, 
  checkout,
  generateRageClicks,
  generateDeadClicks,
  generateErrorClicks,
  generateRandomFrustrationSignal,
  endSession
} = require('./sessionActions');
const BaseSession = require('./baseSession');

const randomChance = (percentChance) => {
  return Math.floor(Math.random() * (100/percentChance)) === 0;
}

class FrustrationSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await generateRageClicks(this);
      await setTimeout(1000);
      if (randomChance(25)) {
        await selectProductsPageProduct(this);
        await generateErrorClicks(this);
      }
      await generateDeadClicks(this);
      await setTimeout(1000);
      await generateRandomFrustrationSignal(this);
      await setTimeout(1000);
      await selectProductsPageProduct(this);
      if (randomChance(50)) {
        try {
          await tryToSelectLearningBitsRelatedProduct(this);
          await addToCart(this);
        } catch (error) {
          await generateErrorClicks(this);
        }
      }
      await goToFooterPage(this);
      await generateRageClicks(this);
      await setTimeout(1000);
      await goToFooterPage(this);
      if (randomChance(25)) {
        generateRandomFrustrationSignal(this);
      }
      await setTimeout(1000);
      await generateDeadClicks(this);
      await setTimeout(1500);
      await checkout(this);
      await setTimeout(1500);
      await endSession(this);
    } catch (error) {
      this.log(`Frustration session failed: ${error.message}`);
    }
  }
}

module.exports = FrustrationSession;
