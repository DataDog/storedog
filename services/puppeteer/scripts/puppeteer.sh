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

# Temporary fix: Even 8 sessions are using 4GB+ memory (should be ~1-2GB)
# Something is causing memory accumulation in the modular architecture
export NODE_OPTIONS="--max-old-space-size=8192"
echo "🔧 Emergency memory fix: Node.js heap set to 8GB (investigating memory leak)"

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
