#!/usr/bin/env node

// Modular Puppeteer script for generating traffic
const SessionManager = require('./sessionManager');
const HomePageSession = require('./sessions/homePageSession');
const FrustrationSession = require('./sessions/frustrationSession');
const TaxonomySession = require('./sessions/taxonomySession');
const BrowsingSession = require('./sessions/browsingSession');

async function main() {
  console.log('🚀 Starting Puppeteer Traffic Generator');
  
  // Accept STOREDOG_URL from command line arguments
  const storedogUrl = process.argv[2] || process.env.STOREDOG_URL || 'http://service-proxy:80';
  
  // Update config with the URL
  const config = require('./config');
  config.storedogUrl = storedogUrl;
  
  console.log(`🌐 Target URL: ${storedogUrl}`);
  
  try {
    const sessionManager = new SessionManager();
    
    // Log device statistics
    sessionManager.getDeviceManager().logDeviceStats();
    
    // Define available session types
    const sessionFunctions = [
      () => new HomePageSession(sessionManager).run(),
      () => new FrustrationSession(sessionManager).run(),
      () => new TaxonomySession(sessionManager).run(),
      () => new BrowsingSession(sessionManager).run()
    ];
    
    // Run sessions with progressive concurrency
    await sessionManager.runSessions(sessionFunctions);
    
    console.log('✅ All sessions completed successfully');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
