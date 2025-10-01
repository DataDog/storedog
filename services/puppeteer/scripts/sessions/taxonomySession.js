// Taxonomy session - visits taxonomy pages and purchases products
const config = require('../config');
const { setUtmParams, selectProduct, addToCart, checkout, sleep } = require('../utils');
const BaseSession = require('./baseSession');

class TaxonomySession extends BaseSession {
  async run() {
    const setup = await this.setupPage();
    if (!setup) return;
    
    const { browser, page } = setup;
    
    try {
      // Start from home page and navigate to best sellers
      const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
      
      await page.goto(urlWithUtm, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);

      // Try to navigate to best sellers page using multiple approaches
      let bestSellersFound = false;
      
      // Approach 1: Look for "Best Sellers" link in navigation
      try {
        const bestSellersSelectors = [
          'a[href*="bestsellers"]',
          'a[href*="best-sellers"]', 
          'a[href*="best_sellers"]',
          'nav a:contains("Best Sellers")',
          'nav a:contains("Best")',
          'a:contains("Best Sellers")',
          'a:contains("Best")'
        ];
        
        for (const selector of bestSellersSelectors) {
          try {
            const link = await page.$(selector);
            if (link) {
              console.log(`Found best sellers link using selector: ${selector}`);
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                link.click()
              ]);
              bestSellersFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
      } catch (e) {
        console.log('Could not find best sellers navigation link');
      }
      
      // Approach 2: Try direct URL if navigation failed
      if (!bestSellersFound) {
        try {
          const bestSellersUrl = config.storedogUrl.endsWith('/')
            ? `${config.storedogUrl}bestsellers`
            : `${config.storedogUrl}/bestsellers`;
          
          console.log(`Trying direct best sellers URL: ${bestSellersUrl}`);
          await page.goto(bestSellersUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          bestSellersFound = true;
        } catch (e) {
          console.log('Direct best sellers URL failed, staying on home page');
        }
      }
      
      // If still no best sellers page, just work with current page
      if (!bestSellersFound) {
        console.log('Working with current page for taxonomy session');
      }

      // get page url
      const pageUrl = await page.url();
      console.log(`"${pageUrl}" loaded`);

      await sleep(1000);

      // select a product
      await selectProduct(page);

      console.log('on page', await page.title());

      // add to cart
      await addToCart(page);

      console.log('moving on to checkout');
      await sleep(1500);
      await checkout(page);
      await sleep(1500);
      
      // go to home page with end session param
      const url = await page.url();
      const endUrl = `${url.split('?')[0]}?end_session=true`;
      console.log('endUrl', endUrl);

      await page.goto(endUrl, {
        waitUntil: 'domcontentloaded',
      });
      
      console.log('Taxonomy session completed with taxonomy browsing and purchases');
      
    } catch (error) {
      console.error('Taxonomy session failed:', error);
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
