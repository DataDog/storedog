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

# Set Node.js heap based on concurrent sessions (only if high concurrency)
if [ "${PUPPETEER_MAX_CONCURRENT:-8}" -gt 16 ]; then
  export NODE_OPTIONS="--max-old-space-size=5120"  # 5GB heap for 17+ sessions
  echo "🔧 High concurrency (${PUPPETEER_MAX_CONCURRENT:-8}): Node.js heap set to 5GB"
fi

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
