// Device management module
const fs = require('fs');
const path = require('path');

class DeviceManager {
  constructor() {
    this.devices = this.loadDevices();
  }

  loadDevices() {
    try {
      const devicesPath = path.join(__dirname, 'devices.json');
      const devicesData = fs.readFileSync(devicesPath, 'utf8');
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
}

module.exports = DeviceManager;
