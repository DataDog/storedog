#!/bin/bash

adsTrafficUrl="${ADS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/ads/ads}"
discountsTrafficUrl="${DISCOUNTS_TRAFFIC_URL:-${SERVICE_PROXY_URL}/services/discounts/discount}"
discountLookupUrl="${DISCOUNT_LOOKUP_URL:-${SERVICE_PROXY_URL}/services/discounts/discount-code}"
adsTrafficInterval="${ADS_TRAFFIC_INTERVAL_SECONDS:-20}"
discountsTrafficInterval="${DISCOUNTS_TRAFFIC_INTERVAL_SECONDS:-20}"
discountsTrafficOffset="${DISCOUNTS_TRAFFIC_OFFSET_SECONDS:-5}"
adsErrorEvery="${ADS_ERROR_EVERY:-6}"

checkStoredog() {
  wget --quiet -O - $STOREDOG_URL |grep -qi storedog
}

httpGet() {
  local url="$1"
  shift

  wget \
    --quiet \
    --tries=1 \
    --timeout=10 \
    -O /dev/null \
    "$@" \
    "$url"
}

pickDiscountCode() {
  local discountsJson="$1"

  printf '%s' "$discountsJson" |
    grep -o '"code":"[^"]*"' |
    sed 's/"code":"//; s/"$//' |
    sort -u
}

generateAdsTraffic() {
  local reqCount=0

  while :; do
    reqCount=$((reqCount + 1))

    if (( adsErrorEvery > 0 )) && (( reqCount % adsErrorEvery == 0 )); then
      httpGet \
        "$adsTrafficUrl" \
        --header="x-throw-error: true" \
        --header="x-error-rate: 1" || true
    else
      httpGet "$adsTrafficUrl" || true
    fi

    sleep "$adsTrafficInterval"
  done
}

generateDiscountTraffic() {
  local discountIndex=0

  sleep "$discountsTrafficOffset"

  while :; do
    discountsJson="$(wget --quiet --tries=1 --timeout=10 -O - "$discountsTrafficUrl" || true)"
    if [[ -n "$discountsJson" ]]; then
      mapfile -t discountCodes < <(pickDiscountCode "$discountsJson")

      if (( ${#discountCodes[@]} > 0 )); then
        discountCode="${discountCodes[$((discountIndex % ${#discountCodes[@]}))]}"
        discountIndex=$((discountIndex + 1))

        httpGet \
          "${discountLookupUrl}?discount_code=${discountCode}" || true
      fi
    fi

    sleep "$discountsTrafficInterval"
  done
}

printf "\nWaiting for Storedog"

until checkStoredog; do
  printf .
  sleep 2
done

printf "\nBrowser replay starting.\n\n"

generateAdsTraffic &
generateDiscountTraffic &

while :
do
  node puppeteer.js $STOREDOG_URL
done
