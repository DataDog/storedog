// Utility functions for Puppeteer script
const config = require('./config');
const { setTimeout: sleep } = require('node:timers/promises');

// Memory usage logging
const logMemoryUsage = (context) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memUsageGB = (memUsageMB / 1024).toFixed(2);
  console.log(`💾 Memory Usage (${context}): ${memUsageMB}MB (${memUsageGB}GB)`);
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
  
  try {
    // Try multiple selectors for product items
    const productSelectors = [
      '.product-item',
      '[class*="product-item"]',
      '[class*="ProductCard"]',
      'a[aria-label]',
      '.grid a',
      'div[class*="product"] a'
    ];
    
    let products = [];
    let usedSelector = '';
    
    // Try each selector until we find products
    for (const selector of productSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        await page.waitForSelector(selector, { visible: true, timeout: 5000 });
        products = await page.$$(selector);
        if (products.length > 0) {
          usedSelector = selector;
          console.log(`Found ${products.length} products using selector: ${selector}`);
          break;
        }
      } catch (error) {
        console.log(`Selector ${selector} failed:`, error.message);
        continue;
      }
    }
    
    if (products.length === 0) {
      throw new Error('No products found with any selector');
    }
    
    const randomProductIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomProductIndex];
    
    // Try to get aria-label, fallback to href or text content
    let productAriaLabel = await randomProduct.evaluate((el) => el.getAttribute('aria-label'));
    
    if (!productAriaLabel) {
      // Try to get href for product link
      const href = await randomProduct.evaluate((el) => el.getAttribute('href'));
      if (href) {
        productAriaLabel = href.split('/').pop() || 'product';
      } else {
        // Fallback to text content
        productAriaLabel = await randomProduct.evaluate((el) => el.textContent?.trim()) || 'product';
      }
    }
    
    console.log(`Selected product: ${productAriaLabel}`);
    
    // Click the product
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      randomProduct.click()
    ]);
    
    console.log('Successfully navigated to product page');
    
  } catch (error) {
    console.error('Error selecting home page product:', error.message);
    
    // Fallback: try to find any clickable element that might be a product
    try {
      const fallbackSelectors = ['a[href*="/products/"]', 'a[href*="product"]', 'a'];
      for (const selector of fallbackSelectors) {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          const randomElement = elements[Math.floor(Math.random() * elements.length)];
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            randomElement.click()
          ]);
          console.log('Fallback navigation successful');
          break;
        }
      }
    } catch (fallbackError) {
      console.error('Fallback navigation also failed:', fallbackError.message);
      throw new Error('Unable to select any product from home page');
    }
  }
  
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
      const productLink = productLinks[randomIndex];
      
      // Get the href to log which product we're selecting
      const href = await productLink.evaluate(el => el.href);
      console.log(`Clicking product link: ${href}`);
      
      await Promise.all([
        productLink.click(),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 })
      ]);
      
      const newTitle = await page.title();
      console.log('Selected product:', newTitle);
      
      // Verify we're on a product page by checking for add-to-cart button
      try {
        await page.waitForSelector('#add-to-cart-button', { timeout: 3000 });
        console.log('Confirmed on product page - add-to-cart button found');
      } catch (verifyError) {
        console.log('Warning: Not on a product page - no add-to-cart button found');
        throw new Error('Failed to navigate to product page');
      }
    } else {
      console.log('No product links found on this page');
      throw new Error('No product links available');
    }
  } catch (error) {
    console.log('Product selection failed:', error.message);
    throw error; // Re-throw to be caught by calling function
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

// Frustration signal generators
const generateRageClicks = async (page) => {
  console.log('Generating rage clicks (3+ clicks in 1 second)...');
  
  try {
    // Find a clickable element (button, link, etc.)
    const clickableSelectors = [
      'button',
      'a',
      '[role="button"]',
      '.btn',
      'input[type="submit"]',
      'input[type="button"]'
    ];
    
    let targetElement = null;
    for (const selector of clickableSelectors) {
      targetElement = await page.$(selector);
      if (targetElement) break;
    }
    
    if (targetElement) {
      // Perform 4 rapid clicks to trigger rage click detection
      for (let i = 0; i < 4; i++) {
        await targetElement.click();
        await sleep(100); // Small delay between clicks
      }
      console.log('Rage clicks generated successfully');
    } else {
      console.log('No clickable element found for rage clicks');
    }
  } catch (error) {
    console.log('Rage clicks generation failed:', error.message);
  }
};

const generateDeadClicks = async (page) => {
  console.log('Generating dead clicks (clicks on non-interactive elements)...');
  
  try {
    // Find non-interactive elements to click on
    const deadClickSelectors = [
      'div',
      'span',
      'p',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img',
      '.container',
      '.wrapper'
    ];
    
    let targetElement = null;
    for (const selector of deadClickSelectors) {
      targetElement = await page.$(selector);
      if (targetElement) break;
    }
    
    if (targetElement) {
      await targetElement.click();
      console.log('Dead click generated successfully');
    } else {
      console.log('No suitable element found for dead clicks');
    }
  } catch (error) {
    console.log('Dead clicks generation failed:', error.message);
  }
};

const generateErrorClicks = async (page) => {
  console.log('Generating error clicks (clicks that trigger JavaScript errors)...');
  
  try {
    // Inject a temporary error handler
    await page.evaluate(() => {
      window.tempErrorHandler = (event) => {
        console.error('Intentional error for frustration signal:', event.error);
      };
      window.addEventListener('error', window.tempErrorHandler);
    });
    
    // Try to click on elements that might cause errors
    const errorProneSelectors = [
      'button[onclick*="undefined"]',
      'a[href="javascript:void(0)"]',
      'button[data-action="nonexistent"]',
      '[data-testid="broken-element"]'
    ];
    
    let clicked = false;
    for (const selector of errorProneSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        clicked = true;
        break;
      }
    }
    
    // If no error-prone elements found, try clicking on a random element
    if (!clicked) {
      const randomElement = await page.$('body > *');
      if (randomElement) {
        await randomElement.click();
      }
    }
    
    // Trigger a JavaScript error
    await page.evaluate(() => {
      try {
        // This will cause a ReferenceError
        nonexistentFunction();
      } catch (e) {
        console.error('Intentional error for frustration signal:', e);
      }
    });
    
    console.log('Error clicks generated successfully');
    
    // Clean up error handler
    await page.evaluate(() => {
      if (window.tempErrorHandler) {
        window.removeEventListener('error', window.tempErrorHandler);
        delete window.tempErrorHandler;
      }
    });
    
  } catch (error) {
    console.log('Error clicks generation failed:', error.message);
  }
};

const generateRandomFrustrationSignal = async (page) => {
  const signalTypes = ['rage', 'dead', 'error'];
  const randomType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
  
  console.log(`Generating random frustration signal: ${randomType}`);
  
  switch (randomType) {
    case 'rage':
      await generateRageClicks(page);
      break;
    case 'dead':
      await generateDeadClicks(page);
      break;
    case 'error':
      await generateErrorClicks(page);
      break;
  }
  
  return randomType;
};

const selectRelatedProduct = async (page) => {
  console.log('In selectRelatedProduct on page', await page.title());
  
  try {
    // Original frustration-causing behavior: hardcoded selector that may not exist
    const selector = '[aria-label="Learning Bits"]';
    console.log(`Looking for hardcoded selector: ${selector}`);
    
    const element = await page.$(selector);
    if (element) {
      console.log('Found Learning Bits product, clicking...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        page.click(selector)
      ]);
      const pageTitle = await page.title();
      console.log(`"${pageTitle}" loaded`);
    } else {
      console.log('Learning Bits product not found - this creates frustration signals!');
      // Don't fallback - let this fail to create frustration
      throw new Error('Learning Bits product not found - intentional frustration signal');
    }
  } catch (error) {
    console.log('selectRelatedProduct failed (intentional frustration):', error.message);
    // Don't provide fallback - this failure is the frustration signal
    throw error;
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
      
      // Check if this is a navigation link or just a scroll/anchor link
      const href = await footerLinks[randomIndex].evaluate(el => el.getAttribute('href'));
      const isNavigationLink = href && !href.startsWith('#') && href !== window.location.pathname;
      
      if (isNavigationLink) {
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            footerLinks[randomIndex].click()
          ]);
          console.log('Navigated to footer page:', await page.title());
        } catch (navError) {
          console.log('Navigation timeout, link might not cause navigation:', navError.message);
          // Just click without waiting for navigation
          await footerLinks[randomIndex].click();
          await sleep(1000);
        }
      } else {
        console.log('Footer link appears to be anchor/scroll link, clicking without navigation wait');
        await footerLinks[randomIndex].click();
        await sleep(1000);
      }
    } else {
      console.log('No footer links found, staying on current page');
    }
  } catch (error) {
    console.log('Footer navigation failed:', error.message);
  }
};

const addToCart = async (page) => {
  console.log('In addToCart on page', await page.title());

  try {
    // Wait for add to cart button with shorter timeout
    await page.waitForSelector('#add-to-cart-button', {
      visible: true,
      timeout: 10000 // Reduced from 30s to 10s
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

    // Wait for sidebar to appear and close it
    try {
      await page.waitForSelector('#close-sidebar', {
        visible: true,
        timeout: 5000
      });
      console.log('close sidebar is visible');
      await page.click('#close-sidebar');
    } catch (sidebarError) {
      console.log('Close sidebar not found or not visible:', sidebarError.message);
      // This is not critical, continue execution
    }

    return;
  } catch (error) {
    console.log('Add to cart failed:', error.message);
    throw error; // Re-throw to be caught by calling function
  }
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
  checkout,
  // Frustration signal generators
  generateRageClicks,
  generateDeadClicks,
  generateErrorClicks,
  generateRandomFrustrationSignal
};
