// Utility functions for Puppeteer script
const config = require('./config');

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
  
  await page.waitForSelector('a[href*="/products/"]', { timeout: 10000 });
  const productLinks = await page.$$('a[href*="/products/"]');
  
  if (productLinks.length > 0) {
    const randomIndex = Math.floor(Math.random() * productLinks.length);
    await productLinks[randomIndex].click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    console.log('Selected product:', await page.title());
  }
};

const selectProductsPageProduct = async (page) => {
  // go to all products page
  let selector = 'nav#main-navbar a:first-child';
  const button = await page.$(selector);
  await Promise.all([
    button.evaluate((b) => b.click()),
    page.waitForNavigation(),
  ]);

  await selectProduct(page);

  return true;
};

const selectRelatedProduct = async (page) => {
  console.log('In selectRelatedProduct on page', await page.title());
  
  await page.waitForSelector('.related-products a', { timeout: 10000 });
  const relatedLinks = await page.$$('.related-products a');
  
  if (relatedLinks.length > 0) {
    const randomIndex = Math.floor(Math.random() * relatedLinks.length);
    await relatedLinks[randomIndex].click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    console.log('Selected related product:', await page.title());
  }
};

const goToFooterPage = async (page) => {
  console.log('In goToFooterPage on page', await page.title());
  
  // Scroll to footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await sleep(1000);
  
  // Click on a footer link
  const footerLinks = await page.$$('footer a');
  if (footerLinks.length > 0) {
    const randomIndex = Math.floor(Math.random() * footerLinks.length);
    await footerLinks[randomIndex].click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    console.log('Navigated to footer page:', await page.title());
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

const checkout = async (page) => {
  console.log('In checkout on page', await page.title());

  await page.waitForSelector('button[data-dd-action-name="Toggle Cart"]', {
    visible: true,
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

  // Fill out checkout form
  await page.type('input[name="order[email]"]', 'test@example.com');
  await page.type('input[name="order[bill_address_attributes][firstname]"]', 'Test');
  await page.type('input[name="order[bill_address_attributes][lastname]"]', 'User');
  await page.type('input[name="order[bill_address_attributes][address1]"]', '123 Test St');
  await page.type('input[name="order[bill_address_attributes][city]"]', 'Test City');
  await page.select('select[name="order[bill_address_attributes][state_id]"]', '1');
  await page.type('input[name="order[bill_address_attributes][zipcode]"]', '12345');
  await page.type('input[name="order[bill_address_attributes][phone]"]', '555-1234');

  await sleep(1000);

  // Confirm purchase
  await page.click('button[data-dd-action-name="Confirm Purchase"]');
  console.log('Purchase confirmed');

  await sleep(3000);
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
  checkout
};
