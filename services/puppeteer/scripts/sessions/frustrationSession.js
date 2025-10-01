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
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      const urlWithUtm = `${config.storedogUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;

      // go to home page
      await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // Generate frustration signals throughout the session
      console.log('🎯 Starting frustration signal generation...');
      
      // Generate rage clicks early in the session
      await generateRageClicks(page);
      await sleep(1000);
      
      // go to all products page (and maybe leave)
      await selectProductsPageProduct(page);
      await addToCart(page);

      // Generate dead clicks after product interaction
      await generateDeadClicks(page);
      await sleep(1000);

      await selectProductsPageProduct(page);
      await addToCart(page);

      // maybe select a related product (this will fail and create frustration)
      if (Math.floor(Math.random() * 2) === 0) {
        try {
          await selectRelatedProduct(page);
          await addToCart(page);
        } catch (error) {
          console.log('Related product selection failed (intentional frustration)');
          // Generate error clicks after the failure
          await generateErrorClicks(page);
        }
      }

      // Generate random frustration signal
      const signalType = await generateRandomFrustrationSignal(page);
      console.log(`Generated ${signalType} frustration signal`);

      // maybe try to find another product on the products page
      if (Math.floor(Math.random() * 4) === 0) {
        await selectProductsPageProduct(page);
        await addToCart(page);
      }

      await goToFooterPage(page);

      // Generate more rage clicks
      await generateRageClicks(page);
      await sleep(1000);

      // maybe try to find another product on the products page
      if (Math.floor(Math.random() * 4) === 0) {
        await selectProductsPageProduct(page);
        await addToCart(page);
      }

      await goToFooterPage(page);
      
      // Final frustration signal before checkout
      await generateDeadClicks(page);

      await sleep(1500);
      await checkout(page);
      await sleep(1500);
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
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
