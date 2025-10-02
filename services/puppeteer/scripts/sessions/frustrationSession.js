// Frustration session - generates all three types of frustration signals
const config = require('../config');
const { 
  setUtmParams, 
  selectProductsPageProduct, 
  selectRelatedProduct, 
  goToFooterPage, 
  addToCart, 
  checkout, 
  sleep,
  generateRageClicks,
  generateDeadClicks,
  generateErrorClicks,
  generateRandomFrustrationSignal
} = require('../utils');
const BaseSession = require('./baseSession');

class FrustrationSession extends BaseSession {
  // Helper method to attempt product selection and generate frustration on failure
  async tryProductSelectionWithFrustration(page, description) {
    try {
      await selectProductsPageProduct(page);
      await addToCart(page);
    } catch (error) {
      console.log(`${description} failed (intentional frustration):`, error.message);
      await generateErrorClicks(page);
    }
  }

  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = `${config.storedogUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;

      // Go to home page
      try {
        await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const pageTitle = await page.title();
        console.log(`"${pageTitle}" loaded`);
      } catch (gotoError) {
        console.log('Initial page load failed, continuing with current page');
      }

      // Generate frustration signals throughout the session
      console.log('🎯 Starting frustration signal generation...');
      
      // Generate rage clicks early in the session
      await generateRageClicks(page);
      await sleep(1000);
      
      // First product selection attempt
      await this.tryProductSelectionWithFrustration(page, 'Product selection/add to cart');

      // Generate dead clicks after product interaction
      await generateDeadClicks(page);
      await sleep(1000);

      // Second product selection attempt
      await this.tryProductSelectionWithFrustration(page, 'Second product selection/add to cart');

      // Maybe select a related product (50% chance - this will fail and create frustration)
      if (Math.floor(Math.random() * 2) === 0) {
        try {
          await selectRelatedProduct(page);
          await addToCart(page);
        } catch (error) {
          console.log('Related product selection failed (intentional frustration)');
          await generateErrorClicks(page);
        }
      }

      // Generate random frustration signal
      const signalType = await generateRandomFrustrationSignal(page);
      console.log(`Generated ${signalType} frustration signal`);

      // Maybe try another product selection (25% chance)
      if (Math.floor(Math.random() * 4) === 0) {
        await this.tryProductSelectionWithFrustration(page, 'Random product selection/add to cart');
      }

      await goToFooterPage(page);

      // Generate more rage clicks
      await generateRageClicks(page);
      await sleep(1000);

      // Maybe try final product selection (25% chance)
      if (Math.floor(Math.random() * 4) === 0) {
        await this.tryProductSelectionWithFrustration(page, 'Final product selection/add to cart');
      }

      await goToFooterPage(page);
      
      // Final frustration signal before checkout
      await generateDeadClicks(page);

      // Proceed to checkout
      await sleep(1500); // Allow UI to settle
      await checkout(page);
      
      // End session
      await sleep(1500); // Allow checkout to complete
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      
      console.log('Frustration session completed with frustration signals');
      
    } catch (error) {
      console.error('Frustration session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = FrustrationSession;
