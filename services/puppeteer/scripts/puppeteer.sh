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

# Set Node.js heap based on system specs and concurrent sessions
# Use PUPPETEER_SYSTEM_MEMORY to specify: 8GB (n2-standard-2) or 16GB (n2-standard-4)
SYSTEM_MEMORY=${PUPPETEER_SYSTEM_MEMORY:-8GB}
CONCURRENT=${PUPPETEER_MAX_CONCURRENT:-8}

if [ "$SYSTEM_MEMORY" = "16GB" ] && [ "$CONCURRENT" -gt 16 ]; then
  # n2-standard-4 (16GB): High concurrency
  export NODE_OPTIONS="--max-old-space-size=5120 --max-semi-space-size=128 --expose-gc"
  echo "🔧 n2-standard-4 (16GB) - High concurrency ($CONCURRENT): Node.js heap set to 5GB"
elif [ "$SYSTEM_MEMORY" = "16GB" ] || [ "$CONCURRENT" -gt 12 ]; then
  # n2-standard-4 (16GB) medium load OR n2-standard-2 (8GB) high load
  export NODE_OPTIONS="--max-old-space-size=3072 --max-semi-space-size=64 --expose-gc"
  echo "🔧 $SYSTEM_MEMORY - Medium/High concurrency ($CONCURRENT): Node.js heap set to 3GB"
else
  # n2-standard-2 (8GB): Low-medium concurrency - use defaults
  echo "🔧 $SYSTEM_MEMORY - Standard concurrency ($CONCURRENT): Using Node.js defaults"
fi

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
