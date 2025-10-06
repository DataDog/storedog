// This file manages device emulation - making our browser sessions look like different devices.
// We can pretend to be an iPhone, Android phone, tablet, or desktop computer.
// This makes our traffic more realistic and helps test how the app works on different devices.

const fs = require('fs');    // File system module - lets us read files from disk
const path = require('path'); // Path module - helps build file paths correctly

// DeviceManager class loads device profiles and randomly selects them for sessions
class DeviceManager {
  // Constructor runs when you create a new DeviceManager
  constructor() {
    // Load all device profiles from the devices.json file
    // We store them in this.devices so we can access them later
    this.devices = this.loadDevices();
  }

  // Load device profiles from the devices.json file
  loadDevices() {
    // Wrap in try/catch because file operations can fail (file missing, invalid JSON, etc.)
    try {
      // Build the path to devices.json
      // __dirname is a special variable that contains the directory of the current file
      // path.join() combines directory and filename into a complete path
      const devicesPath = path.join(__dirname, 'devices.json');
      
      // Read the file contents as a string
      // 'utf8' tells Node.js to interpret the file as text (not binary data)
      const devicesData = fs.readFileSync(devicesPath, 'utf8');
      
      // Parse the JSON string into a JavaScript object
      // JSON is a text format for storing data, parse() converts it to a usable object
      const parsed = JSON.parse(devicesData);
      
      // Return the devices array, or an empty array if it doesn't exist
      // The || operator provides a fallback value
      return parsed.devices || [];
    } catch (error) {
      // If anything goes wrong (file not found, invalid JSON), log the error
      console.error('Error loading devices:', error.message);
      // Return an empty array so the code doesn't crash
      return [];
    }
  }

  // Select a random device from our list
  // This is called each time we start a new session
  getRandomDevice() {
    // Safety check: make sure we have devices loaded
    if (this.devices.length === 0) {
      // If no devices, throw an error (this will stop the session from starting)
      throw new Error('No devices available');
    }
    
    // Generate a random index between 0 and the number of devices
    // Math.random() returns a decimal between 0 and 1
    // Multiply by array length to get a number between 0 and devices.length
    // Math.floor() rounds down to get a whole number (array index)
    const deviceIndex = Math.floor(Math.random() * this.devices.length);
    
    // Return the device at the random index
    return this.devices[deviceIndex];
  }
}

// Export the DeviceManager class so other files can use it
module.exports = DeviceManager;
