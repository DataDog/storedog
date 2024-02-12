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
      slowMo: 250,
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

// select cool bits product on search page
const selectCoolBits = async (page) => {
  console.log('In selectHomePageProduct on page', await page.title());
  await page.waitForTimeout(8000);
  let productAriaLabel = 'Cool Bits';
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

  await page.click('#add-to-cart-button');

  await page.waitForSelector('#close-sidebar', {
    visible: true,
  });

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

// select product on search page
const selectSearchPageProduct = async (page) => {
  // go to all products page
  let selector = 'nav#main-navbar a:first-child';
  const button = await page.$(selector);
  await Promise.all([
    button.evaluate((b) => b.click()),
    page.waitForNavigation(),
  ]);

  selector = '.product-grid';
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
  let productThumbnail = await product.$('img');
  // click on product
  let [_, navigation] = await Promise.allSettled([
    page.click(productThumbnail),
    page.waitForNavigation(),
  ]);
  console.log('clicked first time');
  // if it didn't go anywhere, try again
  if (navigation.status !== 'fulfilled') {
    const rect = await page.evaluate(async (selector) => {
      console.log('GETTING ELEMENT COORDS');
      const box = selector.getBoundingClientRect();
      const x = (box.left + box.right) / 2;
      const y = (box.top + box.bottom) / 2;
      return { x, y };
    }, productThumbnail);
    console.log('rect', rect);
    await page.mouse.click(rect.x, rect.y, { count: 6, clickCount: 4 });

    console.log('clicked second time (3x), trying a different item');

    // randomly try again
    if (Math.floor(Math.random() * 10) + 1 < 8) {
      await page.click(`.product-item:nth-child(${productIndex}) img`, {
        clickCount: 3,
        delay: 250,
        count: 3,
      });
    }

    // randomly close session
    if (Math.floor(Math.random() * 10) + 1 < 5) {
      console.log('Frustrated and closing browser...');
      const url = await page.url();
      await page.goto(`${url}?end_session=true`, {
        waitUntil: 'domcontentloaded',
      });
      await page.close();
      return;
    }

    await page.waitForTimeout(500);
    console.log('clicking on the product title this time');
    await Promise.all([
      page.click(`.product-item:nth-child(${productIndex}) a`),
      page.waitForNavigation(),
    ]);

    pageTitle = await page.title();

    console.log(`"${pageTitle}" loaded`);
    return;
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

    // go to home page
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

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

// has some frustration signals due to a incorrect product item UI component configuration in the search page
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

    // go to home page
    await page.goto(startUrl, { waitUntil: 'domcontentloaded' });
    let pageTitle = await page.title();
    console.log(`"${pageTitle}" loaded`);

    // go to all products page (and maybe leave)
    await selectSearchPageProduct(page);
    await addToCart(page);

    await selectSearchPageProduct(page);
    await addToCart(page);

    // maybe select a related product
    if (Math.floor(Math.random() * 2) === 0) {
      await selectRelatedProduct(page);
      await addToCart(page);
    }

    // maybe try to find another product on the search page
    if (Math.floor(Math.random() * 4) === 0) {
      await selectSearchPageProduct(page);
      await addToCart(page);
    }

    // maybe try to find another product on the search page
    if (Math.floor(Math.random() * 4) === 0) {
      await selectSearchPageProduct(page);
      await addToCart(page);
    }

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

// set up 10 staggered sessions
for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    // randomly select a session type
    if (Math.floor(Math.random() * 2) === 0) {
      (() => mainSession())();
    } else {
      (() => secondSession())();
    }
  }, 500 * i);
}
