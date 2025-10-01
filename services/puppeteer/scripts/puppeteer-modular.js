#!/usr/bin/env node

// Modular Puppeteer script for generating traffic
const fs = require('fs');
const path = require('path');
const SessionManager = require('./sessionManager');

// Dynamically load all session files from the sessions directory
function loadSessionClasses() {
  const sessionsDir = path.join(__dirname, 'sessions');
  const sessionClasses = [];
  
  try {
    const files = fs.readdirSync(sessionsDir);
    
    for (const file of files) {
      // Skip baseSession.js and non-JS files
      if (file === 'baseSession.js' || !file.endsWith('.js')) {
        continue;
      }
      
      const sessionPath = path.join(sessionsDir, file);
      const SessionClass = require(sessionPath);
      
      if (SessionClass && typeof SessionClass === 'function') {
        sessionClasses.push({
          name: file.replace('.js', ''),
          class: SessionClass,
          path: sessionPath
        });
        console.log(`📁 Loaded session: ${file}`);
      }
    }
    
    console.log(`✅ Loaded ${sessionClasses.length} session types`);
    return sessionClasses;
    
  } catch (error) {
    console.error('❌ Error loading session files:', error.message);
    return [];
  }
}

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
    
    // Dynamically load all session types
    const sessionClasses = loadSessionClasses();
    
    if (sessionClasses.length === 0) {
      console.error('❌ No session classes found!');
      process.exit(1);
    }
    
    // Create session functions from loaded classes
    const sessionFunctions = sessionClasses.map(sessionInfo => {
      return () => {
        console.log(`🎭 Starting ${sessionInfo.name} session`);
        return new sessionInfo.class(sessionManager).run();
      };
    });
    
    console.log(`🎯 Available session types: ${sessionClasses.map(s => s.name).join(', ')}`);
    
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
