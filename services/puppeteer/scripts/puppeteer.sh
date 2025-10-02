#!/bin/bash

# Set NODE_OPTIONS based on memory tier
set_node_options() {
  case "${PUPPETEER_MEMORY_TIER:-8GB}" in
    "32GB")
      export NODE_OPTIONS="--max-old-space-size=16384 --expose-gc"
      echo "🚀 32GB configuration: 16GB Node heap"
      ;;
    "16GB")
      export NODE_OPTIONS="--max-old-space-size=12288 --expose-gc"
      echo "⚡ 16GB configuration: 12GB Node heap"
      ;;
    "8GB"|*)
      export NODE_OPTIONS="--max-old-space-size=6144 --expose-gc"
      echo "📊 8GB configuration: 6GB Node heap"
      ;;
  esac
}

checkStoredog() {
  wget --quiet -O - $STOREDOG_URL |grep -qi storedog
}

printf "\nWaiting for Storedog"

until checkStoredog; do
  printf .
  sleep 2
done

printf "\nBrowser replay starting.\n\n"

# Set appropriate Node.js memory options
set_node_options

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
