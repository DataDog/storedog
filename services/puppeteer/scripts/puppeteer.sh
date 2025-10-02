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

# Set NODE_OPTIONS based on system memory tier
set_node_options() {
  case "${PUPPETEER_SYSTEM_MEMORY:-8GB}" in
    "32GB")
      export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB heap
      echo "🔧 32GB system: Node.js heap set to 8GB"
      ;;
    "16GB")
      export NODE_OPTIONS="--max-old-space-size=6144"  # 6GB heap
      echo "🔧 16GB system: Node.js heap set to 6GB"
      ;;
    "8GB"|*)
      export NODE_OPTIONS="--max-old-space-size=3072"  # 3GB heap
      echo "🔧 8GB system: Node.js heap set to 3GB"
      ;;
  esac
}

# Set appropriate Node.js memory options
set_node_options

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
