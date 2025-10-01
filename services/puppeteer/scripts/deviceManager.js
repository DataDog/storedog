// Device management module
const fs = require('fs');
const config = require('./config');

class DeviceManager {
  constructor() {
    this.devices = this.loadDevices();
  }

  loadDevices() {
    try {
      const devicesData = fs.readFileSync(config.devicesPath, 'utf8');
      const parsed = JSON.parse(devicesData);
      return parsed.devices || [];
    } catch (error) {
      console.error('Error loading devices:', error.message);
      return [];
    }
  }

  getRandomDevice() {
    if (this.devices.length === 0) {
      throw new Error('No devices available');
    }
    
    const deviceIndex = Math.floor(Math.random() * this.devices.length);
    return this.devices[deviceIndex];
  }

  getDevicesByCategory(category) {
    return this.devices.filter(device => device.category === category);
  }

  getDevicesByOS(os) {
    return this.devices.filter(device => device.os === os);
  }

  getDevicesByBrowser(browser) {
    return this.devices.filter(device => device.browser === browser);
  }

  getDeviceStats() {
    const stats = {
      total: this.devices.length,
      byCategory: {},
      byOS: {},
      byBrowser: {}
    };

    this.devices.forEach(device => {
      // Count by category
      stats.byCategory[device.category] = (stats.byCategory[device.category] || 0) + 1;
      
      // Count by OS
      stats.byOS[device.os] = (stats.byOS[device.os] || 0) + 1;
      
      // Count by browser
      stats.byBrowser[device.browser] = (stats.byBrowser[device.browser] || 0) + 1;
    });

    return stats;
  }

  logDeviceStats() {
    const stats = this.getDeviceStats();
    console.log('📱 Device Statistics:');
    console.log(`   Total devices: ${stats.total}`);
    console.log(`   Categories: ${JSON.stringify(stats.byCategory)}`);
    console.log(`   Operating Systems: ${JSON.stringify(stats.byOS)}`);
    console.log(`   Browsers: ${JSON.stringify(stats.byBrowser)}`);
  }
}

module.exports = DeviceManager;
