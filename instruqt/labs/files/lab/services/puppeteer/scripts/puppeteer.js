const puppeteer = require('puppeteer');

const startUrl = process.env.STOREDOG_URL;
console.log('starting...');

if (!startUrl) {
  console.log('No start URL provided');
  process.exit(1);
}

const getNewBrowser = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: null,
      timeout: 40000,
      slowMo: 400,
      protocolTimeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
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
    'Pixel 2 XL',
    'Pixel 2',
    'Galaxy S5',
    'iPhone 11 Pro Max',
    'iPhone 11',
    'iPhone XR',
    'iPhone X',
    'iPhone SE',
    'iPad Pro',
    'iPad Mini',
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
  await page.waitForTimeout(8000);
  let productAriaLabel = 'Sunset Bits';
  const selector = `[aria-label="${productAriaLabel}"]`;

  await Promise.all([page.waitForNavigation(), page.click(selector)]);
  await page.waitForTimeout(2000);
  const pageTitle = await page.title();
  console.log(`"${pageTitle}" loaded`);
  return;
};

// select a random product on the home page
const selectHomePageProduct = async (page) => {
  console.log('In selectHomePageProduct on page', await page.title());
  await page.waitForTimeout(2000);
  const allProducts = await page.$$('.product-item');
  const randomProductIndex = Math.floor(Math.random() * allProducts.length);
  const randomProduct = allProducts[randomProductIndex];
  // reassign selector to the random product's aria-label
  const productAriaLabel = await randomProduct.evaluate((el) =>
    el.getAttribute('aria-label')
  );

  const selector = `[aria-label="${productAriaLabel}"]`;

  await Promise.all([page.waitForNavigation(), page.click(selector)]);
  await page.waitForTimeout(2000);
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
    await page.waitForTimeout(2000);
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
  await page.waitForTimeout(2500);
  let selector = '.product-grid';
  await page.waitForSelector(selector);
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

  await page.waitForTimeout(2500);

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

    await page.waitForTimeout(500);
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
    await page.waitForTimeout(2500);
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

    // wait 2500ms and go back
    await page.waitForTimeout(2500);
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

  await page.waitForTimeout(2500);
};

const useDiscountCode = async (page) => {
  try {
    console.log('In useDiscountCode on page', await page.title());

    await page.waitForSelector('input[name="discount-code"]', {
      visible: true,
    });

    await page.waitForTimeout(2500);

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

    await page.waitForTimeout(2000);

    if (Math.floor(Math.random * 10) + 1 < 7) {
      console.log(`trying discount code ${discountCode} again...`);

      await applyDiscountCode(discountCode, page);
    }
  } catch (e) {
    console.error(e);
  }

  await page.waitForTimeout(1000);

  return;
};

const checkout = async (page) => {
  console.log('In checkout on page', await page.title());

  await page.waitForSelector('button[data-dd-action-name="Toggle Cart"]', {
    visible: true,
  });

  await Promise.all([
    page.waitForTimeout(1000),

    page.click('button[data-dd-action-name="Toggle Cart"]'),
  ]);

  await page.waitForTimeout(8000);

  await page.waitForSelector(
    'button[data-dd-action-name="Proceed to Checkout"]',
    {
      visible: true,
    }
  );

  console.log('opened cart...');

  await Promise.all([
    page.waitForTimeout(5000),

    page.click('button[data-dd-action-name="Proceed to Checkout"]'),
  ]);

  await page.waitForTimeout(8000);

  page.waitForSelector('button[data-dd-action-name="Confirm Purchase"]', {
    visible: true,
  });

  await page.waitForTimeout(8000);
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
        page.waitForTimeout(2000),

        page.click('button[data-dd-action-name="Confirm Purchase"]'),
      ]);

      await page.waitForTimeout(10000);

      const selector = '.purchase-confirmed-msg';

      await page.waitForSelector(selector, { visible: true });

      console.log('purchase confirmed');

      console.log('Checkout complete');

      await page.waitForTimeout(6000);
    }
  } else {
    console.log('proceeded to checkout...');

    await Promise.all([
      page.waitForTimeout(5000),

      page.click('button[data-dd-action-name="Confirm Purchase"]'),
    ]);

    await page.waitForTimeout(10000);

    const selector = '.purchase-confirmed-msg';

    await page.waitForSelector(selector, { visible: true });

    console.log('purchase confirmed');

    console.log('Checkout complete');

    await page.waitForTimeout(6000);
  }

  return;
};

const mainSession = async () => {
  const browser = await getNewBrowser();
  let selector;

  try {
    const page = await browser.newPage();

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
    await page.waitForTimeout(2000);
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
      await page.waitForTimeout(2000);
      await addToCart(page);
    }

    // maybe do that again
    if (Math.floor(Math.random() * 3) === 0) {
      selector = '[href="/"]';
      const logo = await page.$(selector);
      await logo.evaluate((el) => el.click());
      await page.waitForNavigation();
      await selectHomePageProduct(page);
      await page.waitForTimeout(4000);
      await addToCart(page);
    }

    // maybe do that again
    if (Math.floor(Math.random() * 3) === 0) {
      selector = '[href="/"]';
      const logo = await page.$(selector);
      await logo.evaluate((el) => el.click());
      await page.waitForNavigation();
      await selectHomePageProduct(page);
      await page.waitForTimeout(4000);
      await addToCart(page);
    }

    await goToFooterPage(page);

    await checkout(page);
    await page.waitForTimeout(2500);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    await page.close();
  } catch (err) {
    console.log(`First session failed: ${err}`);
  } finally {
    console.log('closing browser');
    await browser.close();
    if (browser && browser.process() != null) browser.process().kill('SIGINT');
  }
};

// has some frustration signals due to a incorrect product item UI component configuration in the product page
const secondSession = async () => {
  const browser = await getNewBrowser();

  try {
    const page = await browser.newPage();

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

    await page.waitForTimeout(3000);
    await checkout(page);
    await page.waitForTimeout(3000);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    console.log('Second session complete');
    await page.close();
  } catch (err) {
    console.log(`Second session failed, ending session: ${err}`);
  } finally {
    console.log('closing browser');
    await browser.close();
    if (browser && browser.process() != null) browser.process().kill('SIGINT');
  }
};

// third session visits taxonomy pages and purchases products
const thirdSession = async () => {
  const browser = await getNewBrowser();
  const page = await browser.newPage();

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

    await page.waitForTimeout(2500);

    // select a product
    await selectProduct(page);

    console.log('on page', await page.title());

    // add to cart
    await addToCart(page);

    console.log('moving on to checkout');
    await page.waitForTimeout(3000);
    await checkout(page);
    await page.waitForTimeout(3000);
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
    console.log('closing browser');
    await browser.close();
    if (browser && browser.process() != null) browser.process().kill('SIGINT');
  }
};

// third session visits taxonomy pages and purchases products
const fourthSession = async () => {
  console.log('Starting fourth session');
  const browser = await getNewBrowser();

  try {
    const page = await browser.newPage();

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
    await page.waitForTimeout(3000);
    await checkout(page);
    await page.waitForTimeout(3000);
    const url = await page.url();
    await page.goto(`${url}?end_session=true`, {
      waitUntil: 'domcontentloaded',
    });
    console.log('Fourth session complete');
  } catch (err) {
    console.log(`Fourth session failed: ${err}`);
  } finally {
    console.log('closing browser');
    await browser.close();
    if (browser && browser.process() != null) browser.process().kill('SIGINT');
  }
};

for (let i = 0; i < 8; i++) {
  setTimeout(() => {
    // randomly select a session to run
    const session = Math.floor(Math.random() * 4);
    console.log('running session', session + 1);
    switch (session) {
      case 0:
        (() => mainSession())();
        break;
      case 1:
        (() => secondSession())();
        break;
      case 2:
        (() => thirdSession())();
        break;
      case 3:
        (() => fourthSession())();
        break;
      default:
        (() => mainSession())();
        break;
    }
  }, 1000 * i);
}

// (() => mainSession())();
// (() => secondSession())();
// (() => thirdSession())();
// (() => fourthSession())();
