const puppeteer = require('puppeteer');
const { setTimeout: sleep } = require('node:timers/promises');

const startUrl = process.env.STOREDOG_URL;
console.log('starting...');

if (!startUrl) {
  console.log('No start URL provided');
  process.exit(1);
}

// Memory monitoring function
const logMemoryUsage = (sessionName) => {
  const used = process.memoryUsage();
  console.log(`${sessionName} Memory Usage:`, {
    rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`,
  });
};

// Force garbage collection if available
const forceGC = () => {
  if (global.gc) {
    global.gc();
    console.log('Garbage collection triggered');
  }
};

// Browser pool management for better resource utilization
class BrowserPool {
  constructor(maxBrowsers = 4) {
    this.maxBrowsers = maxBrowsers;
    this.browsers = [];
    this.availableBrowsers = [];
  }

  async getBrowser() {
    if (this.availableBrowsers.length > 0) {
      return this.availableBrowsers.pop();
    }
    
    if (this.browsers.length < this.maxBrowsers) {
      const browser = await getNewBrowser();
      this.browsers.push(browser);
      return browser;
    }
    
    // Wait for a browser to become available
    return new Promise((resolve) => {
      const checkForAvailable = () => {
        if (this.availableBrowsers.length > 0) {
          resolve(this.availableBrowsers.pop());
        } else {
          setTimeout(checkForAvailable, 100);
        }
      };
      checkForAvailable();
    });
  }

  releaseBrowser(browser) {
    // Check if browser is still connected before adding back to pool
    if (browser && browser.isConnected()) {
      this.availableBrowsers.push(browser);
    } else {
      console.log('Browser disconnected, not adding back to pool');
      // Remove from browsers array if it exists
      const index = this.browsers.indexOf(browser);
      if (index > -1) {
        this.browsers.splice(index, 1);
      }
    }
  }

  async closeAll() {
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
    this.browsers = [];
    this.availableBrowsers = [];
  }
}

// Global browser pool instance
const browserPool = new BrowserPool(6); // Increased pool size

// Clear browser context to ensure fresh sessions (Chrome optimized)
const clearBrowserContext = async (page) => {
  try {
    // Check if page is still connected
    if (page.isClosed()) {
      console.log('Page already closed, skipping context clearing');
      return;
    }
    
    // Chrome CDP commands for comprehensive cleanup
    try {
      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');
      await client.send('Network.clearBrowserCache');
      await client.send('Runtime.evaluate', {
        expression: `
          localStorage.clear();
          sessionStorage.clear();
          // Clear IndexedDB if possible
          if (window.indexedDB) {
            indexedDB.databases().then(databases => {
              databases.forEach(db => {
                indexedDB.deleteDatabase(db.name);
              });
            }).catch(() => {});
          }
        `
      });
      console.log('Chrome context cleared (CDP + storage)');
    } catch (cdpError) {
      console.log('CDP context clearing failed, using fallback:', cdpError.message);
      // Fallback to page.evaluate if CDP fails
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    
    console.log('Browser context cleared for new session');
  } catch (error) {
    console.log('Error clearing browser context:', error.message);
  }
};

// Ensure RUM SDK session is properly ended
const ensureSessionEnd = async (page) => {
  try {
    // Check if page is still connected before navigating
    if (!page.isClosed()) {
      // Navigate to a page with end_session=true to trigger datadogRum.stopSession()
      await page.goto(`${startUrl}?end_session=true`, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 // Reduced timeout
      });
      
      // Wait a moment for the session to be properly ended
      await sleep(1000);
      
      console.log('RUM session ended');
    }
  } catch (error) {
    console.log('Error ending RUM session:', error.message);
    // Don't fail the session if RUM session end fails
  }
};

// Optimize page resource loading for memory efficiency
const optimizePageResources = async (page) => {
  // Enable request interception to control resource loading
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    const resourceType = request.resourceType();
    
    // Allow all resources to load (fonts, media, images, etc.)
    // Comment out the blocking logic below if you want unrestricted resource loading
    /*
    if (['font', 'media'].includes(resourceType)) {
      request.abort();
    } else if (resourceType === 'stylesheet') {
      // Allow CSS but with lower priority
      request.continue();
    } else {
      // Allow images, scripts, and other essential resources
      request.continue();
    }
    */
    
    // Allow all resources to continue loading
    request.continue();
  });
  
  // Set cache to false to prevent memory buildup
  await page.setCacheEnabled(false);
  
  // Disable unnecessary features
  await page.evaluateOnNewDocument(() => {
    // Disable animations to reduce CPU/memory usage
    Object.defineProperty(document, 'hidden', { value: false });
    Object.defineProperty(document, 'visibilityState', { value: 'visible' });
  });
};

const getNewBrowser = async () => {
  try {
    // Use Firefox if PUPPETEER_BROWSER=firefox, otherwise use Chrome
    const product = process.env.PUPPETEER_BROWSER || 'chrome';
    
    // Browser-specific flags
    const chromeArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      // Memory optimization flags
      '--memory-pressure-off',
      '--max_old_space_size=256', // Reduced from 512
      '--disable-background-timer-throttling',
      '--disable-features=TranslateUI,VizDisplayCompositor',
      '--disable-ipc-flooding-protection',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-plugins',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-software-rasterizer',
      // Additional memory optimization flags
      '--disable-web-security',
      '--disable-background-media-suspend',
      '--disable-client-side-phishing-detection',
      '--disable-component-extensions-with-background-pages',
      '--disable-domain-reliability',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-speech-api',
      '--disable-webgl',
      '--disable-webgl2',
      '--enable-features=NetworkService,NetworkServiceLogging',
      '--force-color-profile=srgb',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-zygote',
    ];
    
    const firefoxArgs = [
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-web-security',
      '--mute-audio',
      '--hide-scrollbars',
    ];
    
    // Firefox-specific performance preferences
    const firefoxPrefs = {
      // Disable extensions completely
      'extensions.enabledScopes': '',
      'extensions.autoDisableScopes': 15,
      
      // Memory and performance optimizations
      'browser.cache.disk.enable': false,
      'browser.cache.memory.enable': true,
      'browser.cache.offline.enable': false,
      
      // Disable unnecessary features
      'media.peerconnection.enabled': false,
      'media.navigator.enabled': false,
      'dom.webnotifications.enabled': false,
      'dom.push.enabled': false,
      
      // Reduce memory usage
      'browser.sessionstore.max_tabs_undo': 0,
      'browser.sessionstore.max_windows_undo': 0,
      'browser.sessionstore.interval': 60000,
      
      // Disable telemetry and reporting
      'toolkit.telemetry.enabled': false,
      'toolkit.telemetry.unified': false,
      'datareporting.healthreport.uploadEnabled': false,
      
      // Performance tweaks
      'layout.frame_rate': 30,
      'gfx.webrender.all': false,
      'layers.acceleration.force-enabled': false,
    };
    
    const browser = await puppeteer.launch({
      product: product, // 'chrome' or 'firefox'
      headless: 'new',
      defaultViewport: null,
      timeout: 30000,
      slowMo: 200, // Reduced for faster execution
      protocolTimeout: 45000,
      args: product === 'firefox' ? firefoxArgs : chromeArgs,
      extraPrefsFirefox: product === 'firefox' ? firefoxPrefs : undefined,
    });
    const browserVersion = await browser.version();
    console.log(`Started ${browserVersion}`);
    return browser;
  } catch (error) {
    console.error('Error launching browser:', error);
    process.exit(1);
  }
};

const choosePhone = () => {
  const deviceNames = [
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14',
    'iPhone 13 Pro Max',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 12 Pro Max',
    'iPhone 12 Pro',
    'iPhone 12',
    'iPhone SE (3rd generation)',
    'Pixel 8 Pro',
    'Pixel 8',
    'Pixel 7 Pro',
    'Pixel 7',
    'Pixel 6 Pro',
    'Pixel 6',
    'Galaxy S24 Ultra',
    'Galaxy S24+',
    'Galaxy S24',
    'Galaxy S23 Ultra',
    'Galaxy S23+',
    'Galaxy S23',
    'Galaxy Z Fold 5',
    'Galaxy Z Flip 5',
    'iPad Pro (6th generation)',
    'iPad Pro (5th generation)',
    'iPad Air (5th generation)',
    'iPad (10th generation)',
    'iPad Mini (6th generation)',
  ];

  const deviceIndex = Math.floor(Math.random() * deviceNames.length);
  const device = deviceNames[deviceIndex];
  return puppeteer.devices[device];
};

const setUtmParams = (url) => {
  // create array of utm campaign options
  const utmCampaigns = [
    'blog_post',
    'cool_bits_sale',
    'paid_search',
    'clothing_sale',
    'social_media',
  ];

  // create array of utm medium options
  const utmMediums = [
    'facebook',
    'twitter',
    'instagram',
    'pinterest',
    'linkedin',
    'youtube',
    'google',
  ];

  // create array of utm source options
  const utmSources = [
    'blog',
    'social',
    'affiliate',
    'organic',
    'paid_search',
    'display',
  ];

  // get random index for each array
  const randomCampaignIndex = Math.floor(Math.random() * utmCampaigns.length);
  const randomMediumIndex = Math.floor(Math.random() * utmMediums.length);
  const randomSourceIndex = Math.floor(Math.random() * utmSources.length);

  // get random values from each array
  const randomCampaign = utmCampaigns[randomCampaignIndex];
  const randomMedium = utmMediums[randomMediumIndex];
  const randomSource = utmSources[randomSourceIndex];

  // create utm string
  const utmString = `?utm_campaign=${randomCampaign}&utm_medium=${randomMedium}&utm_source=${randomSource}`;

  // append utm string to url
  const newUrl = `${url}${utmString}`;

  return newUrl;
};

const randomlyCloseSession = async (browser, page, skipSessionClose) => {
  console.log('In randomlyCloseSession');

  if (skipSessionClose) {
    console.log('Skipping session close');
    return false;
  }

  const random = Math.floor(Math.random() * 15) + 1;

  if (random === 2) {
    console.log('Closing browser...');
    await page.close();
    await browser.close();
    return true;
  } else {
    return false;
  }
};

// select cool bits product on products page
const selectSunsetBits = async (page) => {
  console.log('In selectSunsetBits on page', await page.title());
  // Wait for page to be fully loaded instead of fixed timeout
  await page.waitForFunction(() => document.readyState === 'complete');
  let productAriaLabel = 'Sunset Bits';
  const selector = `[aria-label="${productAriaLabel}"]`;

  await Promise.all([page.waitForNavigation(), page.click(selector)]);
  // Short delay for UI to settle
  await sleep(1000);
  const pageTitle = await page.title();
  console.log(`"${pageTitle}" loaded`);
  return;
};

// select a random product on the home page
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

// when on product page, add to cart
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

// select related product on product page
const selectRelatedProduct = async (page) => {
  console.log('In selectRelatedProduct on page', await page.title());
  const selector = '[aria-label="Learning Bits"]';
  await Promise.all([page.waitForNavigation(), page.click(selector)]);
  const pageTitle = await page.title();
  console.log(`"${pageTitle}" loaded`);
  return;
};

const selectProduct = async (page) => {
  const pageUrl = await page.url();
  // Wait for product grid to be visible instead of fixed timeout
  let selector = '.product-grid';
  await page.waitForSelector(selector, { visible: true });
  // does selector exist
  const productGrid = await page.$(selector);
  if (!productGrid) {
    console.log("didn't find product grid");
    return;
  }

  // get products and select one at random
  const products = await page.$$('.product-item');
  let productIndex = Math.floor(Math.random() * products.length);
  console.log('product index', productIndex);
  let product = products[productIndex];
  let productThumbnail = await product.$('img', { visible: true });

  const rect = await page.evaluate(async (selector) => {
    console.log('GETTING ELEMENT COORDS');
    const box = selector.getBoundingClientRect();
    const x = (box.left + box.right) / 2;
    const y = (box.top + box.bottom) / 2;
    return { x, y };
  }, productThumbnail);
  console.log(rect);

  console.log('clicked first time');
  try {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
      }),
      page.mouse.click(rect.x, rect.y),
    ]);
  } catch (e) {
    console.log('navigation failed...');
  }

  // Short delay for UI to settle
  await sleep(1000);

  // if it didn't go anywhere, try again
  const newPageUrl = await page.url();

  if (newPageUrl === pageUrl) {
    await page.mouse.click(rect.x, rect.y, { count: 6, clickCount: 4 });

    console.log('clicked second time (3x)');

    // randomly close session
    if (Math.floor(Math.random() * 10) + 1 < 5) {
      console.log('Frustrated and closing browser...');
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
      });
      await page.close();
      throw new Error('Frustrated and closing browser');
    }

    await sleep(500);
    console.log('clicking on the product title this time');
    // check if element is visible
    const productTitle = await page.$(
      `.product-item:nth-child(${productIndex}) a`,
      {
        visible: true,
      }
    );
    await Promise.all([
      productTitle.click(),
      page.waitForNavigation({
        waitUntil: 'domcontentloaded',
      }),
    ]);

    pageTitle = await page.title();

    console.log(`"${pageTitle}" loaded`);
    return;
  } else {
    console.log('navigation fulfilled, continuing');
    await sleep(1000);
    const pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);
    return;
  }
};

// select product on all products page
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

const goToFooterPage = async (page) => {
  console.log('In goToFooterPage on page', await page.title());
  const links = await page.$$('.footer-link');
  let linkIndex = Math.floor(Math.random() * links.length);
  console.log('link index', linkIndex);
  let selector = `span:nth-of-type(${linkIndex}) .footer-link`;
  let link = await page.$(selector, { visible: true });

  try {
    // click on link
    let [_, navigation] = await Promise.all([
      page.click(selector),
      page.waitForNavigation(),
    ]);

    // Short delay before going back
    await sleep(1000);
    await Promise.all([page.goBack(), page.waitForNavigation()]);
  } catch (e) {
    console.error(e);
  }
};

const applyDiscountCode = async (discountCode, page) => {
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

    await page.waitForSelector('input[name="discount-code"]', {
      visible: true,
    });

    // Short delay before entering discount code
    await sleep(1000);

    // enter discount code out of random array
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

    const discountCode = discountCodes[randomIndex];

    await applyDiscountCode(discountCode, page);

    await sleep(1000);

    if (Math.floor(Math.random * 10) + 1 < 7) {
      console.log(`trying discount code ${discountCode} again...`);

      await applyDiscountCode(discountCode, page);
    }
  } catch (e) {
    console.error(e);
  }

  await sleep(500);

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

      const selector = '.purchase-confirmed-msg';

      await page.waitForSelector(selector, { visible: true });

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

    const selector = '.purchase-confirmed-msg';

    await page.waitForSelector(selector, { visible: true });

    console.log('purchase confirmed');

    console.log('Checkout complete');

    await sleep(3000);
  }

  return;
};

const mainSession = async () => {
  const browser = await browserPool.getBrowser();
  let selector;
  let page = null;

  try {
    page = await browser.newPage();
    
    // Ensure previous RUM session is ended
    await ensureSessionEnd(page);
    
    // Clear browser context for fresh session
    await clearBrowserContext(page);
    
    // Apply memory optimizations
    await optimizePageResources(page);
    await page.setJavaScriptEnabled(true);

    await page.setUserAgent(
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`
    );

    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });

    await page.setDefaultNavigationTimeout(
      process.env.PUPPETEER_TIMEOUT || 40000
    );

    // randomly set utm params
    const urlWithUtm = Math.random() > 0.5 ? setUtmParams(startUrl) : startUrl;

    // go to home page
    await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });

    const pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

    await selectHomePageProduct(page);
    await sleep(1000);
    await addToCart(page);

    // maybe purchase that extra product
    if (Math.floor(Math.random() * 3) === 0) {
      await selectRelatedProduct(page);
      await addToCart(page);
    }

    await goToFooterPage(page);

    // maybe go back to the home page and purchase another product
    if (Math.floor(Math.random() * 3) === 0) {
      selector = '[href="/"]';
      const logo = await page.$(selector);
      await logo.evaluate((el) => el.click());
      await page.waitForNavigation();
      await selectHomePageProduct(page);
      await sleep(1000);
      await addToCart(page);
    }

    // maybe do that again
    if (Math.floor(Math.random() * 3) === 0) {
      selector = '[href="/"]';
      const logo = await page.$(selector);
      await logo.evaluate((el) => el.click());
      await page.waitForNavigation();
      await selectHomePageProduct(page);
      await sleep(2000);
      await addToCart(page);
    }

    // maybe do that again
    if (Math.floor(Math.random() * 3) === 0) {
      selector = '[href="/"]';
      const logo = await page.$(selector);
      await logo.evaluate((el) => el.click());
      await page.waitForNavigation();
      await selectHomePageProduct(page);
      await sleep(2000);
      await addToCart(page);
    }

    await goToFooterPage(page);

    await checkout(page);
    await sleep(1000);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    await page.close();
  } catch (err) {
    console.log(`First session failed: ${err}`);
  } finally {
    console.log('releasing browser back to pool');
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
    } catch (pageError) {
      console.log('Page already closed or error closing page:', pageError.message);
    }
    
    try {
      browserPool.releaseBrowser(browser);
    } catch (browserError) {
      console.log('Error releasing browser to pool:', browserError.message);
    }
  }
};

// has some frustration signals due to a incorrect product item UI component configuration in the product page
const secondSession = async () => {
  const browser = await browserPool.getBrowser();

  try {
    const page = await browser.newPage();
    
    // Ensure previous RUM session is ended
    await ensureSessionEnd(page);
    
    // Clear browser context for fresh session
    await clearBrowserContext(page);
    
    await optimizePageResources(page);

    await page.setUserAgent(
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`
    );

    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });

    await page.setDefaultNavigationTimeout(
      process.env.PUPPETEER_TIMEOUT || 40000
    );

    const urlWithUtm = `${startUrl}?utm_campaign=blog_post&utm_medium=social&utm_source=facebook`;

    // go to home page
    await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
    let pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

    // go to all products page (and maybe leave)
    await selectProductsPageProduct(page);
    await addToCart(page);

    await selectProductsPageProduct(page);
    await addToCart(page);

    // maybe select a related product
    if (Math.floor(Math.random() * 2) === 0) {
      await selectRelatedProduct(page);
      await addToCart(page);
    }

    // maybe try to find another product on the products page
    if (Math.floor(Math.random() * 4) === 0) {
      await selectProductsPageProduct(page);
      await addToCart(page);
    }

    await goToFooterPage(page);

    // maybe try to find another product on the products page
    if (Math.floor(Math.random() * 4) === 0) {
      await selectProductsPageProduct(page);
      await addToCart(page);
    }

    await goToFooterPage(page);

    await sleep(1500);
    await checkout(page);
    await sleep(1500);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    console.log('Second session complete');
    await page.close();
  } catch (err) {
    console.log(`Second session failed, ending session: ${err}`);
  } finally {
    console.log('releasing browser back to pool');
    try {
      browserPool.releaseBrowser(browser);
    } catch (browserError) {
      console.log('Error releasing browser to pool:', browserError.message);
    }
  }
};

// third session visits taxonomy pages and purchases products
const thirdSession = async () => {
  const browser = await browserPool.getBrowser();
  const page = await browser.newPage();
  
  // Ensure previous RUM session is ended
  await ensureSessionEnd(page);
  
  // Clear browser context for fresh session
  await clearBrowserContext(page);
  
  await optimizePageResources(page);

  await page.setUserAgent(
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`
  );

  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
  });

  await page.setDefaultNavigationTimeout(
    process.env.PUPPETEER_TIMEOUT || 40000
  );

  await page.on('pageerror', (err) => {
    console.log('error', err);
  });

  try {
    const bestsellersUrl = startUrl.endsWith('/')
      ? `${startUrl}taxonomies/categories/bestsellers`
      : `${startUrl}/taxonomies/categories/bestsellers`;

    const urlWithUtm =
      Math.random() > 0.5 ? setUtmParams(bestsellersUrl) : bestsellersUrl;
    // go to home page
    await page.goto(urlWithUtm, { waitUntil: 'networkidle0' });
    let pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

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

    console.log('Third session complete');
  } catch (err) {
    console.log(`Third session failed: ${err}`);
  } finally {
    console.log('releasing browser back to pool');
    try {
      browserPool.releaseBrowser(browser);
    } catch (browserError) {
      console.log('Error releasing browser to pool:', browserError.message);
    }
  }
};

// third session visits taxonomy pages and purchases products
const fourthSession = async () => {
  console.log('Starting fourth session');
  const browser = await browserPool.getBrowser();

  try {
    const page = await browser.newPage();
    
    // Ensure previous RUM session is ended
    await ensureSessionEnd(page);
    
    // Clear browser context for fresh session
    await clearBrowserContext(page);
    
    await optimizePageResources(page);

    await page.setUserAgent(
      `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36`
    );

    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });

    await page.setDefaultNavigationTimeout(
      process.env.PUPPETEER_TIMEOUT || 40000
    );

    const urlWithUtm = Math.random() > 0.5 ? setUtmParams(startUrl) : startUrl;
    // go to home page
    await page.goto(urlWithUtm, { waitUntil: 'domcontentloaded' });
    let pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

    // select any link along the top nav
    const navLinks = await page.$$('#main-navbar a');
    const randomIndex = Math.floor(Math.random() * navLinks.length);
    const randomLink = navLinks[randomIndex];
    await Promise.all([
      page.waitForNavigation(),
      randomLink.evaluate((el) => el.click()),
    ]);
    pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

    // select a product
    await selectProduct(page);

    // add to cart
    await addToCart(page);

    console.log('moving on to checkout');
    await sleep(1500);
    await checkout(page);
    await sleep(1500);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    console.log('Fourth session complete');
  } catch (err) {
    console.log(`Fourth session failed: ${err}`);
  } finally {
    console.log('releasing browser back to pool');
    try {
      browserPool.releaseBrowser(browser);
    } catch (browserError) {
      console.log('Error releasing browser to pool:', browserError.message);
    }
  }
};

// Optimized concurrent session management with memory monitoring
const runSessions = async () => {
  const sessions = [mainSession, secondSession, thirdSession, fourthSession];
  const maxConcurrent = 8; // Increased concurrency with optimized memory usage
  const sessionPromises = [];
  const sessionQueue = [];
  
  // Create a queue of sessions to run
  for (let i = 0; i < 16; i++) { // Increased total sessions
    sessionQueue.push({
      id: i + 1,
      session: sessions[Math.floor(Math.random() * sessions.length)],
      delay: Math.random() * 2000 // Random delay up to 2 seconds
    });
  }
  
  // Process sessions with controlled concurrency
  const processSessions = async () => {
    while (sessionQueue.length > 0 || sessionPromises.length > 0) {
      // Start new sessions if we have capacity
      while (sessionPromises.length < maxConcurrent && sessionQueue.length > 0) {
        const sessionTask = sessionQueue.shift();
        
        const sessionPromise = (async () => {
          await sleep(sessionTask.delay);
          console.log(`Starting session ${sessionTask.id}`);
          logMemoryUsage(`Before Session ${sessionTask.id}`);
          
          try {
            await sessionTask.session();
            logMemoryUsage(`After Session ${sessionTask.id}`);
            forceGC(); // Trigger garbage collection after each session
            console.log(`Completed session ${sessionTask.id}`);
          } catch (error) {
            console.error(`Session ${sessionTask.id} failed:`, error);
            logMemoryUsage(`Failed Session ${sessionTask.id}`);
          }
        })();
        
        sessionPromises.push(sessionPromise);
      }
      
      // Wait for at least one session to complete
      if (sessionPromises.length > 0) {
        await Promise.race(sessionPromises);
        // Remove completed sessions
        sessionPromises.splice(0, sessionPromises.length);
      }
    }
  };
  
  await processSessions();
  console.log('All sessions completed');
  
  // Clean up browser pool
  await browserPool.closeAll();
  console.log('Browser pool cleaned up');
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await browserPool.closeAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await browserPool.closeAll();
  process.exit(0);
});

// Start the optimized session runner
runSessions().catch(async (error) => {
  console.error('Session runner failed:', error);
  await browserPool.closeAll();
  process.exit(1);
});

// (() => mainSession())();
// (() => secondSession())();
// (() => thirdSession())();
// (() => fourthSession())();
