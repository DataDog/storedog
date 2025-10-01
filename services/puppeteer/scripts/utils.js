// Utility functions for Puppeteer script
const config = require('./config');
const { setTimeout: sleep } = require('node:timers/promises');

// Memory usage logging
const logMemoryUsage = (context) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  console.log(`💾 Memory Usage (${context}): ${memUsageMB}MB`);
};

// Force garbage collection
const forceGC = () => {
  if (global.gc) {
    global.gc();
    console.log('🗑️  Garbage collection triggered');
  }
};

// UTM parameter generation
const setUtmParams = (url) => {
  const utmCampaigns = [
    'blog_post',
    'cool_bits_sale',
    'paid_search',
    'clothing_sale',
    'social_media',
  ];

  const utmMediums = [
    'facebook',
    'twitter',
    'instagram',
    'pinterest',
    'linkedin',
    'youtube',
    'google',
  ];

  const utmSources = [
    'blog',
    'social',
    'search',
    'email',
    'direct',
  ];

  const campaign = utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)];
  const medium = utmMediums[Math.floor(Math.random() * utmMediums.length)];
  const source = utmSources[Math.floor(Math.random() * utmSources.length)];

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_campaign=${campaign}&utm_medium=${medium}&utm_source=${source}`;
};

// Resource optimization for pages
const optimizePageResources = async (page) => {
  try {
    if (page.isClosed()) {
      console.log('Page already closed, skipping resource optimization');
      return;
    }

    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      const url = request.url();
      
      // Ensure Next.js development files are never blocked
      if (url.includes('_devPagesManifest.json') || 
          url.includes('_next/static/') || 
          url.includes('_next/webpack-hmr') ||
          url.includes('_next/webpack-dev-middleware') ||
          url.includes('__webpack_hmr')) {
        request.continue();
        return;
      }
      
      request.continue();
    });
    
    await page.setCacheEnabled(config.enableCache);
    
    if (config.enableCache) {
      console.log('📦 Cache enabled (development mode)');
    } else {
      console.log('📦 Cache disabled (production mode)');
    }
    
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(document, 'hidden', { value: false });
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
    });
  } catch (error) {
    console.log('Error optimizing page resources:', error.message);
  }
};

// Product selection and cart functions
const selectHomePageProduct = async (page) => {
  console.log('In selectHomePageProduct on page', await page.title());
  // Wait for products to load instead of fixed timeout
  await page.waitForSelector('.product-item', { visible: true });
  const allProducts = await page.$$('.product-item');
  const randomProductIndex = Math.floor(Math.random() * allProducts.length);
  const randomProduct = allProducts[randomProductIndex];
  // reassign selector to the random product's aria-label
  const productAriaLabel = await randomProduct.evaluate((el) =>
    el.getAttribute('aria-label')
  );

  const selector = `[aria-label="${productAriaLabel}"]`;

  await Promise.all([page.waitForNavigation(), page.click(selector)]);
  // Short delay for UI to settle
  await sleep(1000);
  const pageTitle = await page.title();
  console.log(`"${pageTitle}" loaded`);
  return;
};

const selectProduct = async (page) => {
  console.log('Selecting product on page', await page.title());
  
  try {
    await page.waitForSelector('a[href*="/products/"]', { 
      timeout: 5000,
      visible: true 
    });
    
    const productLinks = await page.$$('a[href*="/products/"]');
    
    if (productLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * productLinks.length);
      await productLinks[randomIndex].click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      console.log('Selected product:', await page.title());
    } else {
      console.log('No product links found on this page');
    }
  } catch (error) {
    console.log('No product links available on this page:', error.message);
  }
};

const selectProductsPageProduct = async (page) => {
  try {
    // Try multiple navigation selectors for products page
    const navSelectors = [
      'nav#main-navbar a[href*="/products"]',  // Direct products link
      'nav#main-navbar a:first-child',         // First nav item
      'a[href*="/products"]',                  // Any products link
      'nav a[href="/products"]',               // Products in nav
      'a[href="/products"]'                    // Direct products link
    ];
    
    let button = null;
    for (const selector of navSelectors) {
      button = await page.$(selector);
      if (button) {
        console.log(`Found products navigation using selector: ${selector}`);
        break;
      }
    }
    
    if (button) {
      await Promise.all([
        button.evaluate((b) => b.click()),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      ]);

      await selectProduct(page);
      return true;
    } else {
      console.log('Products page navigation button not found, trying direct navigation');
      // Fallback: try to navigate directly to products page
      const currentUrl = page.url();
      const productsUrl = currentUrl.endsWith('/') ? `${currentUrl}products` : `${currentUrl}/products`;
      await page.goto(productsUrl, { waitUntil: 'domcontentloaded' });
      await selectProduct(page);
      return true;
    }
  } catch (error) {
    console.log('Failed to navigate to products page:', error.message);
    return false;
  }
};

const selectRelatedProduct = async (page) => {
  console.log('In selectRelatedProduct on page', await page.title());
  
  try {
    // Try multiple selectors for related/similar products
    const relatedSelectors = [
      '.related-products a',           // Standard related products
      '.similar-products a',          // Similar products
      '.recommended-products a',      // Recommended products
      '.product-recommendations a',   // Product recommendations
      '.you-might-also-like a',       // You might also like
      '.suggested-products a',        // Suggested products
      '.product-grid a[href*="/products/"]', // Any product links in grid
      '.product-list a[href*="/products/"]', // Any product links in list
      'a[href*="/products/"]'         // Any product links on page
    ];
    
    let relatedLinks = [];
    let usedSelector = '';
    
    for (const selector of relatedSelectors) {
      try {
        await page.waitForSelector(selector, { 
          timeout: 2000,
          visible: true 
        });
        
        relatedLinks = await page.$$(selector);
        if (relatedLinks.length > 0) {
          usedSelector = selector;
          console.log(`Found ${relatedLinks.length} related products using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (relatedLinks.length > 0) {
      // Filter out the current product if possible
      const currentUrl = page.url();
      const filteredLinks = relatedLinks.filter(async (link) => {
        try {
          const href = await link.evaluate(el => el.href);
          return href !== currentUrl;
        } catch (e) {
          return true; // Keep link if we can't check href
        }
      });
      
      const linksToUse = filteredLinks.length > 0 ? filteredLinks : relatedLinks;
      const randomIndex = Math.floor(Math.random() * linksToUse.length);
      
      await linksToUse[randomIndex].click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      console.log('Selected related product:', await page.title());
    } else {
      console.log('No related products found, skipping related product selection');
    }
  } catch (error) {
    console.log('Related products not available on this page, skipping:', error.message);
  }
};

const goToFooterPage = async (page) => {
  console.log('In goToFooterPage on page', await page.title());
  
  try {
    // Scroll to footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await sleep(1000);
    
    // Try multiple footer link selectors
    const footerSelectors = [
      'footer a',                    // Standard footer links
      '.footer a',                   // Footer with class
      '#footer a',                   // Footer with ID
      'footer nav a',               // Footer navigation
      '.footer-nav a',              // Footer navigation class
      'footer ul a',                // Footer list links
      'footer li a'                 // Footer list item links
    ];
    
    let footerLinks = [];
    for (const selector of footerSelectors) {
      try {
        footerLinks = await page.$$(selector);
        if (footerLinks.length > 0) {
          console.log(`Found ${footerLinks.length} footer links using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (footerLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * footerLinks.length);
      const linkText = await footerLinks[randomIndex].evaluate(el => el.textContent?.trim());
      console.log(`Clicking footer link: "${linkText}"`);
      
      await footerLinks[randomIndex].click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      console.log('Navigated to footer page:', await page.title());
    } else {
      console.log('No footer links found, staying on current page');
    }
  } catch (error) {
    console.log('Footer navigation failed:', error.message);
  }
};

const addToCart = async (page) => {
  console.log('In addToCart on page', await page.title());

  await page.waitForSelector('#add-to-cart-button', {
    visible: true,
  });

  // select a variant if it exists
  const variantSelector = 'select#variant-select';
  const variantSelect = await page.$(variantSelector);
  console.log('variantSelect', variantSelect);
  if (variantSelect) {
    // get all the values
    const variantOptions = await page.$$eval(
      `${variantSelector} option`,
      (options) => options.map((option) => option.value)
    );

    // select a random value
    const randomVariantIndex = Math.floor(
      Math.random() * variantOptions.length
    );
    const randomVariantValue = variantOptions[randomVariantIndex];

    await page.select(variantSelector, randomVariantValue);

    console.log('selected variant', randomVariantValue);
    // Wait for variant selection to take effect
    await sleep(1000);
  }

  await page.click('#add-to-cart-button');
  console.log('clicked add to cart');

  await page.waitForSelector('#close-sidebar', {
    visible: true,
  });
  console.log('close sidebar is visible');
  await page.click('#close-sidebar');

  return;
};

const applyDiscountCode = async (page, discountCode) => {
  try {
    await page.waitForSelector('input[name="discount-code"]', {
      visible: true,
    });

    await page.type('input[name="discount-code"]', discountCode, {
      delay: Math.floor(Math.random() * 430) + 150,
    });

    console.log('entered code', discountCode);

    await page.waitForSelector('button[data-dd-action-name="Apply Discount"]', {
      visible: true,
    });

    await page.click('button[data-dd-action-name="Apply Discount"]');

    console.log('Clicked discount code button');
  } catch (e) {
    console.error(e);
  }

  await sleep(1000);
};

const useDiscountCode = async (page) => {
  try {
    console.log('In useDiscountCode on page', await page.title());

    // First try to find the discount code on the current page
    let discountCode = null;
    
    try {
      // Look for discount code in various places on the page
      // Try different selectors for discount codes
      const selectors = [
        '#discount-code',
        '[id*="discount"]',
        '[class*="discount"]',
        'strong',
        '.discount-wrapper strong',
        '.discount-wrapper span strong'
      ];
      
      for (const selector of selectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            const text = await element.evaluate(el => el.textContent?.trim());
            // Check if it looks like a discount code (uppercase, alphanumeric, reasonable length)
            if (text && /^[A-Z0-9]{3,15}$/.test(text)) {
              discountCode = text;
              console.log(`Found discount code "${discountCode}" using selector: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (discountCode) {
        console.log('Using dynamic discount code:', discountCode);
      } else {
        console.log('No discount code found on page, using fallback');
      }
    } catch (e) {
      console.log('Could not find discount code on page, using fallback');
    }

    // If no discount code found on page, use fallback list
    if (!discountCode) {
      const discountCodes = [
        'DISCOUNT',
        'COOLBITS', 
        'LEARNINGBITS',
        'BITS',
        'COOL',
        'STOREDOG',
        'STOREDOG10',
      ];
      const randomIndex = Math.floor(Math.random() * discountCodes.length);
      discountCode = discountCodes[randomIndex];
      console.log('Using fallback discount code:', discountCode);
    }

    // Now try to apply the discount code
    await page.waitForSelector('input[name="discount-code"]', {
      visible: true,
      timeout: 5000,
    });

    // Short delay before entering discount code
    await sleep(1000);

    await applyDiscountCode(page, discountCode);

    await sleep(1000);

    // Sometimes try the same code again (for frustration signals)
    if (Math.floor(Math.random() * 10) + 1 < 7) {
      console.log(`trying discount code ${discountCode} again...`);
      await applyDiscountCode(page, discountCode);
    }
  } catch (e) {
    console.error('Discount code application failed:', e.message);
  }

  await sleep(500);
  return;
};

const checkout = async (page) => {
  console.log('In checkout on page', await page.title());

  try {
    // Try to find and click the cart toggle button
    await page.waitForSelector('button[data-dd-action-name="Toggle Cart"]', {
      visible: true,
      timeout: 10000,
    });

    await Promise.all([
      sleep(500),
      page.click('button[data-dd-action-name="Toggle Cart"]'),
    ]);

    // Wait for cart to open instead of fixed timeout
    await page.waitForSelector(
      'button[data-dd-action-name="Proceed to Checkout"]',
      {
        visible: true,
        timeout: 10000,
      }
    );

    console.log('opened cart...');

    await Promise.all([
      sleep(2000),
      page.click('button[data-dd-action-name="Proceed to Checkout"]'),
    ]);

    // Wait for checkout page to load
    await page.waitForSelector('button[data-dd-action-name="Confirm Purchase"]', {
      visible: true,
      timeout: 15000,
    });

  // Wait for checkout form to be ready
  await sleep(2000);
  console.log('getting sidebar...');
  const sidebarSelector = '#sidebar';
  const sidebarElement = await page.$(sidebarSelector);

  // scroll to bottom of checkout form
  await sidebarElement.evaluate((el) => {
    el.parentNode.scrollTo(0, el.getBoundingClientRect().bottom);
  });

  // only use discount sometimes, try to enter a discount (and get errors)
  if (Math.floor(Math.random() * 10 + 1) > 5) {
    console.log('applying discount code...');

    await useDiscountCode(page);

    // rarely still checkout
    if (Math.floor(Math.random() * 10 + 1) <= 7) {
      console.log(
        'begrudgingly checking out even though discount code failed...'
      );

      await Promise.all([
        sleep(1000),
        page.click('button[data-dd-action-name="Confirm Purchase"]'),
      ]);

      // Wait for purchase confirmation
      await page.waitForSelector('.purchase-confirmed-msg', { visible: true });

      console.log('purchase confirmed');
      console.log('Checkout complete');

      await sleep(3000);
    }
  } else {
    console.log('proceeded to checkout...');

    await Promise.all([
      sleep(2000),
      page.click('button[data-dd-action-name="Confirm Purchase"]'),
    ]);

    // Wait for purchase confirmation
    await page.waitForSelector('.purchase-confirmed-msg', { visible: true });

    console.log('purchase confirmed');
    console.log('Checkout complete');

    await sleep(3000);
  }
  } catch (error) {
    console.error('Checkout failed:', error.message);
    console.log('Attempting simplified checkout...');
    
    // Fallback: try to find any checkout button
    try {
      const checkoutButtons = await page.$$('button');
      for (const button of checkoutButtons) {
        const text = await button.evaluate(el => el.textContent?.toLowerCase());
        if (text && (text.includes('checkout') || text.includes('purchase') || text.includes('buy'))) {
          await button.click();
          await sleep(2000);
          console.log('Fallback checkout completed');
          break;
        }
      }
    } catch (fallbackError) {
      console.error('Fallback checkout also failed:', fallbackError.message);
    }
  }
};

module.exports = {
  sleep,
  logMemoryUsage,
  forceGC,
  setUtmParams,
  optimizePageResources,
  selectHomePageProduct,
  selectProduct,
  selectProductsPageProduct,
  selectRelatedProduct,
  goToFooterPage,
  addToCart,
  applyDiscountCode,
  useDiscountCode,
  checkout
};
