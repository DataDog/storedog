// Home page session - visits home page and browses products
const { selectHomePageProduct, tryToSelectLearningBitsRelatedProduct, addToCart, checkout, endSession, returnToHomeAndAddToCart, goToHomePage } = require('./sessionActions');
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
      // Stay on / until the banner image paints. That image is the homepage CLS signal.
      try {
        await this.page.waitForSelector('#first-ad-container img', { timeout: 15000 });
        await setTimeout(2000);
      } catch (error) {
        this.log('Banner ad image was not ready; continuing session.');
      }
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

    // Maybe return to home page and add something to cart
    if (randomChance(33)) {
      await returnToHomeAndAddToCart(this, 1000);
    }

    // Maybe do it again
    if (randomChance(33)) {
      await returnToHomeAndAddToCart(this, 2000);
    }

    // Check out before any other navigation so the ProceedToCheckout click lands.
    await checkout(this);
    await setTimeout(1000);
    await endSession(this);    
  }
}

module.exports = HomePageSession;
