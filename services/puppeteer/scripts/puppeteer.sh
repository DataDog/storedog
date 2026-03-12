#!/bin/bash

adsTrafficUrl="${ADS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/ads}"
discountsTrafficUrl="${DISCOUNTS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/discounts/discount}"
discountsCodeUrl="${DISCOUNTS_CODE_URL:-${SERVICE_PROXY_URL}/services/discounts/discount-code?discount_code=BFRIDAY}"
apiTrafficInterval="${API_TRAFFIC_INTERVAL_SECONDS:-15}"

checkStoredog() {
  wget --quiet -O - $STOREDOG_URL |grep -qi storedog
}

generateApiTraffic() {
  while :; do
    wget --quiet -O /dev/null "$adsTrafficUrl" || true
    wget --quiet -O /dev/null "$discountsTrafficUrl" || true
    wget --quiet -O /dev/null "$discountsCodeUrl" || true
    sleep "$apiTrafficInterval"
  done
}

printf "\nWaiting for Storedog"

until checkStoredog; do
  printf .
  sleep 2
done

printf "\nBrowser replay starting.\n\n"

generateApiTraffic &

while :
do
  node puppeteer.js $STOREDOG_URL
done
