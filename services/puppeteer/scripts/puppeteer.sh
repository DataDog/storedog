#!/bin/bash

adsTrafficUrl="${ADS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/ads/ads}"
discountsTrafficUrl="${DISCOUNTS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/discounts/discount}"
apiTrafficInterval="${API_TRAFFIC_INTERVAL_SECONDS:-15}"

checkStoredog() {
  wget --quiet -O - $STOREDOG_URL |grep -qi storedog
}

generateApiTraffic() {
  while :; do
    if (( RANDOM % 4 == 0 )); then
      wget --quiet \
        --header="x-throw-error: true" \
        --header="x-error-rate: 1" \
        -O /dev/null \
        "$adsTrafficUrl" || true
    else
      wget --quiet -O /dev/null "$adsTrafficUrl" || true
    fi

    discountsJson="$(wget --quiet -O - "$discountsTrafficUrl" || true)"
    if [[ -n "$discountsJson" ]]; then
      discountCode="$(
        printf '%s' "$discountsJson" |
          grep -o '"code":"[^"]*"' |
          sed 's/"code":"//; s/"$//' |
          shuf -n 1
      )"

      if [[ -n "$discountCode" ]]; then
        wget --quiet \
          -O /dev/null \
          "${SERVICE_PROXY_URL}/services/discounts/discount-code?discount_code=${discountCode}" || true
      fi
    fi

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
