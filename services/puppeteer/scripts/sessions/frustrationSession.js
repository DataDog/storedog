// Frustration session - generates all three types of frustration signals
const config = require('../config');
const { 
  setUtmParams, 
  selectProductsPageProduct, 
  selectRelatedProduct, 
  goToFooterPage, 
  addToCart, 
  checkout,
  generateRageClicks,
  generateDeadClicks,
  generateErrorClicks,
  generateRandomFrustrationSignal
} = require('./sessionActions');
const { sleep } = require('../utils');
const BaseSession = require('./baseSession');

class FrustrationSession extends BaseSession {
  constructor(browser, sessionId) {
    super(browser, sessionId);
  }

  // Helper method to attempt product selection and generate frustration on failure
  async tryProductSelectionWithFrustration(description) {
    try {
      await selectProductsPageProduct(this);
      await addToCart(this);
    } catch (error) {
      this.log(`${description} failed (intentional frustration): ${error.message}`);
      await generateErrorClicks(this);
    }
  }

  async execute() {
    const urlWithUtm = `${config.storedogUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;

    // Go to home page
    try {
      await this.page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const pageTitle = await this.page.title();
      this.log(`"${pageTitle}" loaded`);
    } catch (gotoError) {
      this.log('Initial page load failed, continuing with current page');
    }

    // Generate frustration signals throughout the session
    this.log('🎯 Starting frustration signal generation...');
    
    // Generate rage clicks early in the session
    await generateRageClicks(this);
    await sleep(1000);
    
    // First product selection attempt
    await this.tryProductSelectionWithFrustration('Product selection/add to cart');

    // Generate dead clicks after product interaction
    await generateDeadClicks(this);
    await sleep(1000);

    // Second product selection attempt
    await this.tryProductSelectionWithFrustration('Second product selection/add to cart');

    // Maybe select a related product (50% chance - this will fail and create frustration)
    if (Math.floor(Math.random() * 2) === 0) {
      try {
        await selectRelatedProduct(this);
        await addToCart(this);
      } catch (error) {
        this.log('Related product selection failed (intentional frustration)');
        await generateErrorClicks(this);
      }
    }

    // Generate random frustration signal
    const signalType = await generateRandomFrustrationSignal(this);
    this.log(`Generated ${signalType} frustration signal`);

    // Maybe try another product selection (25% chance)
    if (Math.floor(Math.random() * 4) === 0) {
      await this.tryProductSelectionWithFrustration('Random product selection/add to cart');
    }

    await goToFooterPage(this);

    // Generate more rage clicks
    await generateRageClicks(this);
    await sleep(1000);

    // Maybe try final product selection (25% chance)
    if (Math.floor(Math.random() * 4) === 0) {
      await this.tryProductSelectionWithFrustration('Final product selection/add to cart');
    }

    await goToFooterPage(this);
    
    // Final frustration signal before checkout
    await generateDeadClicks(this);

    // Proceed to checkout
    await sleep(1500);
    await checkout(this);
    
    // End session
    await sleep(1500);
    try {
      const url = await this.page.url();
      await this.page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      this.log('Session ended successfully');
    } catch (endError) {
      this.log('Session end navigation failed, but continuing to complete');
    }
    
    this.log('Frustration session completed with frustration signals');
  }
}

module.exports = FrustrationSession;
