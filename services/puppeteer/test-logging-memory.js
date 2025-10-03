#!/usr/bin/env node

// Quick test to demonstrate logging memory impact
console.log('Testing logging memory impact...\n');

const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Starting memory: ${Math.round(startMemory)}MB\n`);

// Simulate high-volume logging like 70 concurrent sessions
console.log('Simulating 70 concurrent sessions with heavy logging...');

const iterations = 10000; // Simulate lots of log messages
const logMessages = [];

console.time('Heavy Logging');
for (let i = 0; i < iterations; i++) {
  // This simulates what happens with console.log - strings are kept in memory
  console.log(`Session ${i % 70}: Selecting product on page Product Page ${i}`);
  console.log(`Session ${i % 70}: Found 12 products using selector: .product-item`);
  console.log(`Session ${i % 70}: Clicking product link: http://service-proxy/products/item-${i}`);
  console.log(`Session ${i % 70}: Selected product: Product ${i}`);
  console.log(`Session ${i % 70}: In addToCart on page Product ${i}`);
}
console.timeEnd('Heavy Logging');

const heavyMemory = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`\nMemory after heavy logging: ${Math.round(heavyMemory)}MB`);
console.log(`Memory increase: ${Math.round(heavyMemory - startMemory)}MB\n`);

// Now test with suppressed logging
console.log('Testing with suppressed logging (DEBUG=false)...');

const DEBUG = false;
const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

console.time('Suppressed Logging');
for (let i = 0; i < iterations; i++) {
  // This simulates debugLog - no output, much less memory
  debugLog(`Session ${i % 70}: Selecting product on page Product Page ${i}`);
  debugLog(`Session ${i % 70}: Found 12 products using selector: .product-item`);
  debugLog(`Session ${i % 70}: Clicking product link: http://service-proxy/products/item-${i}`);
  debugLog(`Session ${i % 70}: Selected product: Product ${i}`);
  debugLog(`Session ${i % 70}: In addToCart on page Product ${i}`);
}
console.timeEnd('Suppressed Logging');

const suppressedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`\nMemory after suppressed logging: ${Math.round(suppressedMemory)}MB`);
console.log(`Memory difference: ${Math.round(suppressedMemory - heavyMemory)}MB`);

console.log(`\n🎯 RESULT: Suppressed logging saves ~${Math.round(heavyMemory - suppressedMemory)}MB`);
