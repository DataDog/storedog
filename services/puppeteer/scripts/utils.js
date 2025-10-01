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

module.exports = {
  sleep,
  logMemoryUsage,
  forceGC,
  setUtmParams,
  optimizePageResources
};
