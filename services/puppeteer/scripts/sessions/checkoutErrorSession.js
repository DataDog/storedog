const {
  goToHomePage,
  selectProduct,
  addToCart,
  toggleCart,
  proceedToCheckout,
  confirmPurchase,
  endSession,
} = require('./sessionActions');
const { setTimeout } = require('node:timers/promises');
const BaseSession = require('./baseSession');

// Drives a user all the way to the "Confirm Purchase" click. In the broken
// 2.0.0 build this triggers the checkout error, so the confirmation message
// never appears and confirmPurchase throws (expected). In the clean 1.0.0 /
// 3.0.0 builds the purchase completes normally.
class CheckoutErrorSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  async execute() {
    try {
      await goToHomePage(this);
      await selectProduct(this);
      await addToCart(this);
      await setTimeout(1500);
      await toggleCart(this);
      await proceedToCheckout(this);
      await setTimeout(2000);

      try {
        await confirmPurchase(this);
      } catch (error) {
        this.log(
          `Confirm purchase did not complete (expected in broken build): ${error.message}`
        );
      }

      await setTimeout(1500);
      await endSession(this);
    } catch (error) {
      this.log(`Checkout error session failed: ${error.message}`);
    }
  }
}

module.exports = CheckoutErrorSession;
