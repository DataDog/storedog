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

# Set appropriate Node.js memory options
set_node_options

while :
do
  node puppeteer-modular.js $STOREDOG_URL
done
