#!/bin/bash

checkStoredog() {
  wget --quiet -O - $STOREDOG_URL |grep -qi storedog
}

printf "\nWaiting for Storedog"

until checkStoredog; do
  printf .
  sleep 2
done

printf "\nBrowser replay starting.\n\n"

# Browser memory fixed with --max_old_space_size=256, but Node.js still has memory leak
# Temporary increase while we debug the remaining Node.js memory accumulation
export NODE_OPTIONS="--max-old-space-size=6144"
echo "🔧 Node.js heap set to 6GB (Chrome fixed, debugging Node.js leak)"

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
