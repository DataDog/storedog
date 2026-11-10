// Home page session - visits home page and browses products
const config = require('../config');
const { selectHomePageProduct, tryToSelectLearningBitsRelatedProduct, goToFooterPage, addToCart, checkout, endSession, returnToHomeAndAddToCart, goToHomePage } = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

const randomChance = (percentChance = 33) => {
  return Math.floor(Math.random() * (100/percentChance)) === 0;
}

class HomePageSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await selectHomePageProduct(this);
      await setTimeout(1000);
      await addToCart(this);
    } catch (error) {
      this.log('Product selection failed, continuing session.');
    }

    // Maybe add related product to cart
    if (randomChance(33)) {
      try {
        await tryToSelectLearningBitsRelatedProduct(this);
        await addToCart(this);
      } catch (error) {
        this.log('Related product selection failed');
      }
    }

    await goToFooterPage(this);

    // Maybe return to home page and add something to cart
    if (randomChance(33)) {
      await returnToHomeAndAddToCart(this, 1000);
    }

    // Maybe do it again
    if (randomChance(33)) {
      await returnToHomeAndAddToCart(this, 2000);
    }

    await goToFooterPage(this);
    await checkout(this);
    await setTimeout(1000);
    await endSession(this);    
  }
}

module.exports = HomePageSession;
