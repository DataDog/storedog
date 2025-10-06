// This file manages a pool of Chrome browser instances.
// Instead of creating a new browser for each session (which is slow and memory-intensive),
// we create a pool of browsers that can be reused across sessions.

const puppeteer = require('puppeteer');  // The library that controls Chrome
const config = require('./config');      // Our configuration settings

// BrowserPool is a class - a blueprint for creating browser pool objects.
// In JavaScript, classes are written in PascalCase (first letter capitalized).
class BrowserPool {
  // The constructor runs when you create a new BrowserPool with "new BrowserPool()".
  // It sets up the initial state of the pool.
  constructor(poolSize = config.browserPoolSize) {
    this.pool = [];         // Array to store available browser instances (starts empty)
    this.poolSize = poolSize; // Maximum number of browsers to keep in the pool
    
    // Chrome arguments control how the browser runs.
    // These flags disable features we don't need (like GPU rendering) to save memory.
    this.chromeArgs = [
      '--no-sandbox',                  // Required for running in Docker containers
      '--disable-setuid-sandbox',      // Also required for Docker
      '--disable-dev-shm-usage',       // Use /tmp instead of /dev/shm (prevents memory issues)
      '--disable-accelerated-2d-canvas', // Don't use GPU for rendering (we don't need it)
      '--no-first-run',                // Skip the first-run experience
      '--no-zygote',                   // Disable the zygote process (saves memory)
      '--disable-gpu',                 // Don't use GPU at all
      '--disable-features=VizDisplayCompositor', // Disable visual compositor feature
      '--disable-background-timer-throttling',   // Don't slow down background tabs
      '--disable-backgrounding-occluded-windows', // Treat all windows the same
      '--disable-renderer-backgrounding',        // Don't background the renderer
      '--disable-field-trial-config',  // Disable A/B testing features
      '--disable-back-forward-cache',  // Disable page caching for back/forward navigation
      '--disable-ipc-flooding-protection', // Disable IPC message throttling
      '--max_old_space_size=256'       // CRITICAL: Limit each browser process to 256MB of memory
    ];

    // Conditionally add cache control flags based on configuration.
    // In production, we disable caching to simulate real user traffic more accurately.
    if (!config.enableCache) {
      this.chromeArgs.push('--disable-web-security', '--disable-http-cache');
    }
  }

  // Get a browser from the pool. If one is available, use it. Otherwise, create a new one.
  // The "async" keyword means this function returns a Promise - it does work that takes time.
  // When you call this function, you need to "await" it: const browser = await pool.getBrowser()
  async getBrowser() {
    // Check if there are any browsers waiting in the pool
    if (this.pool.length > 0) {
      // .pop() removes and returns the last item from the array
      // This is like taking a taxi from the taxi stand
      return this.pool.pop();
    }
    // No browsers available, so create a new one
    // The "await" keyword waits for the browser to finish launching before continuing
    return await this.createBrowser();
  }

  // Create a brand new browser instance
  async createBrowser() {
    // puppeteer.launch() starts a new Chrome browser process
    // We pass it an options object with our settings
    const browser = await puppeteer.launch({
      headless: true,         // Run headless
      args: this.chromeArgs,  // Pass our Chrome command-line arguments
      slowMo: 50,             // Slow down operations by 50ms (makes traffic more realistic)
      timeout: 15000          // Wait up to 15 seconds for the browser to start
    });
    
    // Try to log the browser version for debugging.
    try {
      const version = await browser.version();
      console.log(`Browser started: ${version}`);
    } catch (error) {
      // If we can't get the version, that's okay - just log a generic message
      console.log('Browser started (version unavailable)');
    }
    
    // Return the browser object so the caller can use it
    return browser;
  }

  // Return a browser to the pool so it can be reused.
  async releaseBrowser(browser) {
    try {
      // Check two conditions before adding browser back to the pool:
      // 1. Is the browser still connected (not crashed)?
      // 2. Is there room in the pool (haven't hit the size limit)?
      if (browser.isConnected() && this.pool.length < this.poolSize) {
        // Add browser back to the pool for reuse
        this.pool.push(browser);
      } else {
        // Either the browser crashed or the pool is full - close it
        await browser.close();
      }
    } catch (error) {
      // If something goes wrong, log it but don't crash
      console.log('Error releasing browser:', error.message);
    }
  }

  // Close all browsers in the pool. This is called when shutting down.
  async closeAll() {
    // Loop through each browser in the pool
    // The "for...of" loop iterates over array values
    for (const browser of this.pool) {
      try {
        await browser.close();
      } catch (error) {
        // If closing a browser fails, log it and continue with the others
        console.log('Error closing browser:', error.message);
      }
    }
    // Clear the pool array (set it back to empty)
    this.pool = [];
  }
}

// Export the BrowserPool class so other files can use it
// Other files will import it with: const BrowserPool = require('./browserPool')
module.exports = BrowserPool;
