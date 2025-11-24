// Session actions - reusable actions for browser automation
const config = require('../config');
const { setTimeout } = require('node:timers/promises');

// =============================================================================
// UTM PARAMETERS
// =============================================================================

const setUtmParams = (url) => {
  const utmCampaigns = ['blog_post', 'cool_bits_sale', 'paid_search', 'clothing_sale', 'social_media'];
  const utmMediums = ['facebook', 'twitter', 'instagram', 'pinterest', 'linkedin', 'youtube', 'google'];
  const utmSources = ['blog', 'social', 'search', 'email', 'direct'];

  const campaign = utmCampaigns[Math.floor(Math.random() * utmCampaigns.length)];
  const medium = utmMediums[Math.floor(Math.random() * utmMediums.length)];
  const source = utmSources[Math.floor(Math.random() * utmSources.length)];

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}utm_campaign=${campaign}&utm_medium=${medium}&utm_source=${source}`;
};

// =============================================================================
// PRODUCT SELECTION
// =============================================================================

const selectHomePageProduct = async (session) => {
  session.log(`In selectHomePageProduct on page ${await session.page.title()}`);
  
  try {
    const productSelectors = [
      'a[href*="/products/"]',
      '.product-item',
      '[class*="product-item"]',
      '[class*="ProductCard"]',
      'a[aria-label]',
      '.grid a',
      'div[class*="product"] a',
      'img[alt*="T-Shirt"] + a, img[alt*="Jeans"] + a, img[alt*="Sweatshirt"] + a'
    ];
    
    let products = [];
    let usedSelector = '';
    
    for (const selector of productSelectors) {
      try {
        session.log(`Trying selector: ${selector}`);
        await session.page.waitForSelector(selector, { visible: true, timeout: 5000 });
        products = await session.page.$$(selector);
        if (products.length > 0) {
          usedSelector = selector;
          session.log(`Found ${products.length} products using selector: ${selector}`);
          break;
        }
      } catch (error) {
        session.log(`Selector ${selector} failed: ${error.message}`);
        continue;
      }
    }
    
    if (products.length === 0) {
      throw new Error('No products found with any selector');
    }
    
    const randomProductIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomProductIndex];
    
    let productAriaLabel = await randomProduct.evaluate((el) => el.getAttribute('aria-label'));
    
    if (!productAriaLabel) {
      const href = await randomProduct.evaluate((el) => el.getAttribute('href'));
      if (href) {
        productAriaLabel = href.split('/').pop() || 'product';
      } else {
        productAriaLabel = await randomProduct.evaluate((el) => el.textContent?.trim()) || 'product';
      }
    }
    
    session.log(`Selected product: ${productAriaLabel}`);
    
    try {
      await Promise.all([
        session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        randomProduct.click()
      ]);
      session.log('Successfully navigated to product page');
    } catch (clickError) {
      session.log(`Direct product click failed, trying parent Link element: ${clickError.message}`);
      try {
        const href = await randomProduct.evaluate(el => el.getAttribute('href'));
        if (href) {
          const parentLink = await session.page.$(`a[href="${href}"]`);
          if (parentLink) {
            await Promise.all([
              session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
              parentLink.click()
            ]);
            session.log('Successfully navigated to product page via parent Link');
          } else {
            throw new Error('Parent Link not found');
          }
        } else {
          throw new Error('No href found on product element');
        }
      } catch (parentError) {
        session.log(`Parent Link click failed, using direct URL: ${parentError.message}`);
        const href = await randomProduct.evaluate(el => el.getAttribute('href'));
        if (href && href.trim() !== '' && href !== '#') {
          try {
            const currentUrl = await session.page.url();
            const absoluteUrl = href.startsWith('http') ? href : new URL(href, currentUrl).href;
            session.log(`Attempting direct navigation to: ${absoluteUrl}`);
            await session.page.goto(absoluteUrl, { waitUntil: 'domcontentloaded' });
            session.log('Successfully navigated to product page via direct URL');
          } catch (gotoError) {
            session.log(`Direct URL navigation failed: ${gotoError.message}`);
            throw new Error(`Invalid URL for navigation: ${href}`);
          }
        } else {
          throw new Error('No valid href available for direct navigation');
        }
      }
    }
    
  } catch (error) {
    session.log(`Error selecting home page product: ${error.message}`);
    
    try {
      const fallbackSelectors = ['a[href*="/products/"]', 'a[href*="product"]', 'a'];
      for (const selector of fallbackSelectors) {
        const elements = await session.page.$$(selector);
        if (elements.length > 0) {
          const randomElement = elements[Math.floor(Math.random() * elements.length)];
          const href = await randomElement.evaluate(el => el.getAttribute('href'));
          if (href && href.trim() !== '' && href !== '#' && !href.startsWith('javascript:')) {
            try {
              const currentUrl = await session.page.url();
              const absoluteUrl = href.startsWith('http') ? href : new URL(href, currentUrl).href;
              session.log(`Trying fallback navigation to: ${absoluteUrl}`);
              
              await Promise.all([
                session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                randomElement.click()
              ]);
              session.log('Fallback navigation successful');
              break;
            } catch (clickError) {
              session.log(`Fallback click failed, trying next element: ${clickError.message}`);
              continue;
            }
          } else {
            session.log(`Skipping element with invalid href: ${href}`);
            continue;
          }
        }
      }
    } catch (fallbackError) {
      session.log(`Fallback navigation also failed: ${fallbackError.message}`);
      throw new Error('Unable to select any product from home page');
    }
  }
  
  await setTimeout(1000);
  const pageTitle = await session.page.title();
  session.log(`"${pageTitle}" loaded`);
  return;
};

const selectProduct = async (session) => {
  session.log(`Selecting product on page ${await session.page.title()}`);
  
  try {
    await session.page.waitForSelector('a[href*="/products/"]', { 
      timeout: 5000,
      visible: true 
    });
    
    const productLinks = await session.page.$$('a[href*="/products/"]');
    
    if (productLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * productLinks.length);
      const productLink = productLinks[randomIndex];
      
      const href = await productLink.evaluate(el => el.href);
      session.log(`Clicking product link: ${href}`);
      
      try {
        await Promise.all([
          productLink.evaluate(el => el.click()),
          session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 })
        ]);
        
        const newTitle = await session.page.title();
        const newUrl = await session.page.url();
        session.log(`Selected product: "${newTitle}" at ${newUrl}`);
      } catch (navError) {
        session.log('Navigation timeout, trying click without waiting for navigation');
        await productLink.evaluate(el => el.click());
        await setTimeout(2000);
        
        const newTitle = await session.page.title();
        const newUrl = await session.page.url();
        session.log(`Fallback click result: "${newTitle}" at ${newUrl}`);
      }
      
      try {
        await session.page.waitForSelector('#add-to-cart-button', { timeout: 3000 });
        session.log('Confirmed on product page - add-to-cart button found');
      } catch (verifyError) {
        session.log('Warning: Not on a product page - no add-to-cart button found');
        throw new Error('Failed to navigate to product page');
      }
    } else {
      session.log('No product links found on this page');
      throw new Error('No product links available');
    }
  } catch (error) {
    session.log(`Product selection failed: ${error.message}`);
    throw error;
  }
};

const selectProductsPageProduct = async (session) => {
  try {
    await navigateToProductsPage(session);
    await selectProduct(session);
  } catch (error) {
    session.log(`Failed to select product on products page: ${error.message}`);
    throw new Error(`Failed to select product on products page: ${error.message}`);
  }
};

// This looks for a hardcoded selector for the Learning Bits product and clicks it
// There isn't always a Learning Bits product on the page, so this will fail and create frustration signals
const tryToSelectLearningBitsRelatedProduct = async (session) => {
  try {
    const selector = '[aria-label="Learning Bits"]';
    session.log(`Looking for hardcoded selector: ${selector}`);
    const element = await session.page.$(selector);
    if (element) {
      session.log('Found Learning Bits product, clicking...');
      await Promise.all([
        session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
        session.page.click(selector)
      ]);
      const pageTitle = await session.page.title();
      session.log(`"${pageTitle}" loaded`);
      await setTimeout(2000);
      await addToCart(session);
    } else {
      generateErrorClicks(session);
    }
  } catch (error) {
    throw new Error(`Error in tryToSelectLearningBitsRelatedProduct: ${error.message}`);
  }
};

// =============================================================================
// NAVIGATION
// =============================================================================

const goToHomePage = async (session) => {    
  const storedogUrl = config.storedogUrl;
  // const urlWithUtm = Math.random() > 0.5 ? setUtmParams(config.storedogUrl) : config.storedogUrl;
  await session.page.goto(storedogUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  const pageTitle = await session.page.title();
  session.log(`"${pageTitle}" loaded`);
};

const navigateToProductsPage = async (session) => {
  const logPageInfo = async (prefix) => {
    const url = await session.page.url();
    const title = await session.page.title();
    session.log(`${prefix}: "${title}" at ${url}`);
  };

  try {
    const currentUrl = await session.page.url();
    if (currentUrl.includes('/products') && !currentUrl.includes('/products/')) {
      session.log('Already on products page.');
      return;
    }
    
    // Try clicking the navigation link
    const clicked = await session.page.evaluate(() => {
      const link = document.querySelector('nav a[href*="/products"]') ||
                   Array.from(document.querySelectorAll('nav a'))
                     .find(l => l.textContent?.trim().toLowerCase().includes('products'));
      if (link) {
        link.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      try {
        await session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 });
        await logPageInfo('Navigation successful');
        return;
      } catch (navError) {
        session.log('Click navigation failed, trying direct navigation');
      }
    }
    
    // Direct navigation fallback
    const productsUrl = currentUrl.endsWith('/') ? `${currentUrl}products` : `${currentUrl}/products`;
    session.log(`Direct navigation to: ${productsUrl}`);
    await session.page.goto(productsUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await logPageInfo('Direct navigation result');
    
  } catch (error) {
    session.log(`Failed to navigate to products page: ${error.message}`);
    throw error;
  }
}

const clickStoredogLogoToGoHome = async (session) => {
  try {
    const logo = await session.page.$('[href="/"]');
    if (!logo) {
      session.log('Storedog logo not found');
      return;
    }
    await Promise.all([
      session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      logo.evaluate((el) => el.click())
    ]);
    session.log('Storedog logo clicked successfully');
  } catch (error) {
    session.log(`Storedog logo click failed: ${error.message}`);
    throw error;
  }
};

// Select and navigate to a random navbar link
const randomNavbarLink = async (session) => {
  const navLinks = await session.page.$$('#main-navbar a');
  if (navLinks.length > 0) {
    const randomIndex = Math.floor(Math.random() * navLinks.length);
    const randomLink = navLinks[randomIndex];
    
    try {
      await Promise.all([
        randomLink.evaluate((el) => el.click()),
        session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      ]);
      const pageTitle = await session.page.title();
      session.log(`Navigated to "${pageTitle}"`);
    } catch (navError) {
      session.log('Navigation timeout, clicking without waiting');
      await randomLink.evaluate((el) => el.click());
      await setTimeout(1000);
    }
  } else {
    session.log('No navigation links found, staying on current page');
  }
};


const goToFooterPage = async (session) => {
  session.log(`In goToFooterPage on page ${await session.page.title()}`);
  
  try {
    await session.page.evaluate(() => {
      document.documentElement.scrollTop = document.body.scrollHeight;
    });
    
    await setTimeout(1000);
    
    const footerSelectors = [
      'footer a',
      '.footer a',
      '#footer a',
      'footer nav a',
      '.footer-nav a',
      'footer ul a',
      'footer li a'
    ];
    
    let footerLinks = [];
    for (const selector of footerSelectors) {
      try {
        footerLinks = await session.page.$$(selector);
        if (footerLinks.length > 0) {
          session.log(`Found ${footerLinks.length} footer links using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
        session.log(`Selector ${selector} failed: ${e.message}. Continuing to next selector...`);
      }
    }
    
    if (footerLinks.length > 0) {
      const randomIndex = Math.floor(Math.random() * footerLinks.length);
      const linkText = await footerLinks[randomIndex].evaluate(el => el.textContent?.trim());
      session.log(`Clicking footer link: "${linkText}"`);
      
      const href = await footerLinks[randomIndex].evaluate(el => el.getAttribute('href'));
      const currentPath = await session.page.evaluate(() => window.location.pathname);
      const isNavigationLink = href && !href.startsWith('#') && href !== currentPath;
      
      if (isNavigationLink) {
        try {
          await Promise.all([
            session.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            footerLinks[randomIndex].click()
          ]);
          session.log(`Navigated to footer page: ${await session.page.title()}`);
        } catch (navError) {
          session.log(`Navigation timeout, link might not cause navigation: ${navError.message}`);
          await footerLinks[randomIndex].click();
          await setTimeout(1000);
        }
      } else {
        session.log('Footer link appears to be anchor/scroll link, clicking without navigation wait');
        await footerLinks[randomIndex].click();
        await setTimeout(1000);
      }
    } else {
      session.log('No footer links found, staying on current page');
    }
  } catch (error) {
    session.log(`Footer navigation failed: ${error.message}`);
  }
};

const endSession = async (session) => {
  try {
    const url = await session.page.url();
    await session.page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    session.log('Session ended successfully');
  } catch (error) {
    session.log(`Session end navigation failed: ${error.message}`);
  }
};

const returnToHomeAndAddToCart = async (session,sleepDuration = 1000) => {
  try {
    await clickStoredogLogoToGoHome(session);
    await selectHomePageProduct(session);
    await setTimeout(sleepDuration);
    await addToCart(session);
  } catch (error) {
    session.log(`Returning to home page and adding to cart failed: ${error.message}`);
  }
};

// =============================================================================
// CART OPERATIONS
// =============================================================================

const addToCart = async (session) => {
  session.log(`In addToCart on page ${await session.page.title()}`);

  try {
    const pageUrl = await session.page.url();
    const isProductPage = pageUrl.includes('/products/') || 
                         await session.page.$('#add-to-cart-button') !== null ||
                         await session.page.$('[class*="product"]') !== null;
    
    if (!isProductPage) {
      throw new Error(`Not on a product page (URL: ${pageUrl}) - add-to-cart button not available`);
    }

    await session.page.waitForSelector('#add-to-cart-button', {
      visible: true,
      timeout: 10000
    });

    const variantSelector = 'select#variant-select';
    const variantSelect = await session.page.$(variantSelector);
    session.log(`variantSelect: ${variantSelect}`);
    if (variantSelect) {
      const variantOptions = await session.page.$$eval(
        `${variantSelector} option`,
        (options) => options.map((option) => option.value)
      );

      const randomVariantIndex = Math.floor(Math.random() * variantOptions.length);
      const randomVariantValue = variantOptions[randomVariantIndex];

      await session.page.select(variantSelector, randomVariantValue);
      session.log(`selected variant: ${randomVariantValue}`);
      await setTimeout(1000);
    }

    await session.page.click('#add-to-cart-button');
    session.log('Clicked add to cart');

    try {
      await session.page.waitForSelector('#close-sidebar', {
        visible: true,
        timeout: 5000
      });
      session.log('Close sidebar is visible');
      await session.page.click('#close-sidebar');
    } catch (sidebarError) {
      session.log(`Close sidebar not found or not visible: ${sidebarError.message}`);
    }

    return;
  } catch (error) {
    session.log(`Add to cart failed: ${error.message}`);
    throw error;
  }
};

const applyDiscountCode = async (session, discountCode) => {
  try {
    await session.page.waitForSelector('input[name="discount-code"]', {
      visible: true,
    });

    await session.page.type('input[name="discount-code"]', discountCode, {
      delay: Math.floor(Math.random() * 430) + 150,
    });

    session.log(`Entered code: ${discountCode}`);

    await session.page.waitForSelector('button[data-dd-action-name="Apply Discount"]', {
      visible: true,
    });

    await session.page.click('button[data-dd-action-name="Apply Discount"]');
    session.log('Clicked apply discount code button');
  } catch (e) {
    session.log(`Error: ${e}`);
  }

  await setTimeout(1000);
};

const useDiscountCode = async (session) => {
  try {
    session.log(`Applying discount code on page ${await session.page.title()}`);

    let discountCode = null;
    
    try {
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
          const element = await session.page.$(selector);
          if (element) {
            const text = await element.evaluate(el => el.textContent?.trim());
            if (text && /^[A-Z0-9]{3,15}$/.test(text)) {
              discountCode = text;
              session.log(`Found discount code "${discountCode}" using selector: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (discountCode) {
        session.log(`Using dynamic discount code: ${discountCode}`);
      } else {
        session.log('No discount code found on page, using fallback');
      }
    } catch (e) {
      session.log('Could not find discount code on page, using fallback');
    }

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
      session.log(`Using fallback discount code: ${discountCode}`);
    }

    await session.page.waitForSelector('input[name="discount-code"]', {
      visible: true,
      timeout: 5000,
    });

    await setTimeout(1000);
    await applyDiscountCode(session, discountCode);
    await setTimeout(1000);

    if (Math.floor(Math.random() * 10) + 1 < 7) {
      session.log(`Trying discount code ${discountCode} again...`);
      await applyDiscountCode(session, discountCode);
    }
  } catch (e) {
    session.log(`Discount code application failed: ${e.message}`);
  }

  await setTimeout(500);
  return;
};

const toggleCart = async (session) => {
  try {
    await session.page.waitForSelector('button[data-dd-action-name="Toggle Cart"]', {
    visible: true,
    timeout: 10000,
  });

  session.log('Clicking cart toggle button...');
  await Promise.all([
    setTimeout(500),
    session.page.click('button[data-dd-action-name="Toggle Cart"]'),
  ]);
  } catch (e) {
    session.log(`Cart toggle button not found: ${e.message}`);
    throw e;
  }
};

const proceedToCheckout = async (session) => {
  try {
    await session.page.waitForSelector('button[data-dd-action-name="Proceed to Checkout"]', {
      visible: true,
      timeout: 10000,
    });
    await Promise.all([
      setTimeout(2000),
      session.page.click('button[data-dd-action-name="Proceed to Checkout"]'),
    ]);
    session.log('Proceed to checkout button clicked');
    await session.page.waitForSelector('button[data-dd-action-name="Confirm Purchase"]', {
      visible: true,
      timeout: 15000,
    });
    session.log('Confirm purchase button found');
  } catch (e) {
    session.log(`Proceed to checkout button not found: ${e.message}`);
    throw new Error(`Proceed to checkout button not found: ${e.message}`);
  }
};


const confirmPurchase = async (session) => {
  try {
    await session.page.waitForSelector('button[data-dd-action-name="Confirm Purchase"]', {
      visible: true,
      timeout: 15000,
    });
    await Promise.all([
      setTimeout(2000),
      session.page.click('button[data-dd-action-name="Confirm Purchase"]'),
    ]);
    session.log('Confirm purchase button clicked');
    await session.page.waitForSelector('.purchase-confirmed-msg', { visible: true });
    session.log('Purchase confirmed');
  } catch (e) {
    session.log(`Confirm purchase button not found: ${e.message}`);
    throw new Error(`Confirm purchase button not found: ${e.message}`);
  }
};

const maybeApplyDiscountCode = async (session) => {
  if (Math.floor(Math.random() * 10 + 1) > 5) {
    session.log('Applying discount code...');
    await useDiscountCode(session);
  }
};

const tryFallbackCheckout = async (session) => {
  try {
    const checkoutButtons = await session.page.$$('button');
    for (const button of checkoutButtons) {
      const text = await button.evaluate(el => el.textContent?.toLowerCase());
      if (text && (text.includes('checkout') || text.includes('purchase') || text.includes('buy'))) {
        await button.click();
        await setTimeout(2000);
        session.log('Fallback checkout completed');
        break;
      }
    }
  } catch (e) {
    session.log(`Fallback checkout failed: ${e.message}`);
    throw new Error(`Fallback checkout failed: ${e.message}`);
  }
};

const checkout = async (session) => {
  session.log(`Checking out on page ${await session.page.title()}`);
  try {
    await toggleCart(session);
    await proceedToCheckout(session);
    await setTimeout(2000);

    session.log('Getting sidebar and scrolling to bottom...');
    const sidebarSelector = '#sidebar';
    const sidebarElement = await session.page.$(sidebarSelector);
    await sidebarElement.evaluate((el) => {
      el.parentNode.scrollTo(0, el.getBoundingClientRect().bottom);
    });
    await maybeApplyDiscountCode(session);
    await setTimeout(3000);
    await confirmPurchase(session);
  } catch (error) {
    session.log(`Checkout failed: ${error.message}. Attempting simplified checkout...`);
    await tryFallbackCheckout(session);
  }
};

// =============================================================================
// FRUSTRATION SIGNALS
// =============================================================================

const generateRageClicks = async (session) => {
  session.log('Generating rage clicks (3+ clicks in 1 second)...');
  
  try {
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
      targetElement = await session.page.$(selector);
      if (targetElement) break;
    }
    
    if (targetElement) {
      for (let i = 0; i < 4; i++) {
        await targetElement.click();
        await setTimeout(100);
      }
      session.log('Rage clicks generated successfully');
    } else {
      session.log('No clickable element found for rage clicks');
    }
  } catch (error) {
    session.log(`Rage clicks generation failed: ${error.message}`);
    console.log(await session.page.content());
  }
};

const generateDeadClicks = async (session) => {
  session.log('Generating dead clicks (clicks on non-interactive elements)...');
  
  try {
    const deadClickSelectors = [
      'div', 'span', 'p',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', '.container', '.wrapper'
    ];
    
    let targetElement = null;
    for (const selector of deadClickSelectors) {
      targetElement = await session.page.$(selector);
      if (targetElement) break;
    }
    
    if (targetElement) {
      await targetElement.click();
      session.log('Dead click generated successfully');
    } else {
      session.log('No suitable element found for dead clicks');
    }
  } catch (error) {
    session.log(`Dead clicks generation failed: ${error.message}`);
  }
};

const generateErrorClicks = async (session) => {
  session.log('Generating error clicks (clicks that trigger JavaScript errors)...');
  
  try {
    await session.page.evaluate(() => {
      window.tempErrorHandler = (event) => {
        console.error('Intentional error for frustration signal:', event.error);
      };
      window.addEventListener('error', window.tempErrorHandler);
    });
    
    const errorProneSelectors = [
      'button[onclick*="undefined"]',
      'a[href="javascript:void(0)"]',
      'button[data-action="nonexistent"]',
      '[data-testid="broken-element"]'
    ];
    
    let clicked = false;
    for (const selector of errorProneSelectors) {
      const element = await session.page.$(selector);
      if (element) {
        await element.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      const randomElement = await session.page.$('body > *');
      if (randomElement) {
        await randomElement.click();
      }
    }
    
    await session.page.evaluate(() => {
      try {
        nonexistentFunction();
      } catch (e) {
        console.error('Intentional error for frustration signal:', e);
      }
    });
    
    session.log('Error clicks generated successfully');
    
    await session.page.evaluate(() => {
      if (window.tempErrorHandler) {
        window.removeEventListener('error', window.tempErrorHandler);
        delete window.tempErrorHandler;
      }
    });
    
  } catch (error) {
    session.log(`Error clicks generation failed: ${error.message}`);
  }
};

const generateRandomFrustrationSignal = async (session) => {
  const signalTypes = ['rage', 'dead', 'error'];
  const randomType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
  
  session.log(`Generating random frustration signal: ${randomType} click(s)`);
  
  switch (randomType) {
    case 'rage':
      await generateRageClicks(session);
      break;
    case 'dead':
      await generateDeadClicks(session);
      break;
    case 'error':
      await generateErrorClicks(session);
      break;
  }
  
  return randomType;
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  setUtmParams,
  selectHomePageProduct,
  selectProduct,
  selectProductsPageProduct,
  tryToSelectLearningBitsRelatedProduct,
  goToHomePage,
  clickStoredogLogoToGoHome,
  randomNavbarLink,
  goToFooterPage,
  endSession,
  addToCart,
  applyDiscountCode,
  useDiscountCode,
  checkout,
  generateRageClicks,
  generateDeadClicks,
  generateErrorClicks,
  generateRandomFrustrationSignal,
  returnToHomeAndAddToCart,
  toggleCart,
  proceedToCheckout,
  confirmPurchase,
  maybeApplyDiscountCode,
  tryFallbackCheckout
};
