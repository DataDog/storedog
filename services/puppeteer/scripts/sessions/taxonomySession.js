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
      
      console.log(`Attempting to navigate to: ${urlWithUtm}`);
      
      await page.goto(urlWithUtm, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      let pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded successfully`);

      // Try to navigate to best sellers page using multiple approaches
      let bestSellersFound = false;
      
      // Approach 1: Look for "Best Sellers" link in navigation using correct selectors
      try {
        const bestSellersSelectors = [
          '#bestsellers-link',                    // Direct ID selector
          'a[href="/taxonomies/categories/bestsellers"]', // Exact href match
          'a[href*="bestsellers"]',               // Partial href match
          'nav#main-navbar a[href*="bestsellers"]', // Navbar with href
          'nav#main-navbar a[id="bestsellers-link"]' // Navbar with ID
        ];
        
        for (const selector of bestSellersSelectors) {
          try {
            console.log(`Trying selector: ${selector}`);
            const link = await page.$(selector);
            if (link) {
              console.log(`Found best sellers link using selector: ${selector}`);
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                link.click()
              ]);
              bestSellersFound = true;
              console.log('Successfully navigated to Best Sellers page');
              break;
            }
          } catch (e) {
            console.log(`Selector ${selector} failed:`, e.message);
            // Continue to next selector
          }
        }
      } catch (e) {
        console.log('Could not find best sellers navigation link:', e.message);
      }
      
      // Approach 2: Try direct URL if navigation failed
      if (!bestSellersFound) {
        try {
          const bestSellersUrl = config.storedogUrl.endsWith('/')
            ? `${config.storedogUrl}taxonomies/categories/bestsellers`
            : `${config.storedogUrl}/taxonomies/categories/bestsellers`;
          
          console.log(`Trying direct best sellers URL: ${bestSellersUrl}`);
          await page.goto(bestSellersUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          bestSellersFound = true;
          console.log('Successfully navigated to Best Sellers page via direct URL');
        } catch (e) {
          console.log('Direct best sellers URL failed:', e.message);
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
      console.error(`Failed URL: ${config.storedogUrl}`);
      console.error(`Environment STOREDOG_URL: ${process.env.STOREDOG_URL || 'not set'}`);
      console.error('Please verify STOREDOG_URL is set correctly and the URL is reachable');
    } finally {
      await this.cleanup(browser, page);
    }
  }
}

module.exports = TaxonomySession;
