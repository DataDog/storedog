#!/bin/sh
# Fail on any error
set -e

# Use 127.0.0.11 as the default resolver for Docker Compose
export NGINX_RESOLVER=${NGINX_RESOLVER:-127.0.0.11}
# Set the default ADS_A_UPSTREAM to the Java ads service
export ADS_A_UPSTREAM=${ADS_A_UPSTREAM:-ads:3030}

# Calculate upstream config based on ADS_B_PERCENT
ADS_B_PERCENT=${ADS_B_PERCENT:-0}

if [ -z "$ADS_B_PERCENT" ] || [ "$ADS_B_PERCENT" -eq 0 ]; then
    ADS_SERVICE_B_BLOCK=""
    UPSTREAM_CONFIG="server ${ADS_A_UPSTREAM};"
else
    ADS_SERVICE_B_BLOCK="$(cat <<EOF
upstream ads_service_b {
    server ${ADS_B_UPSTREAM} max_fails=1 fail_timeout=1s;
}
EOF
)"
    ADS_A_WEIGHT=$((100 - ADS_B_PERCENT))
    ADS_B_WEIGHT=$ADS_B_PERCENT
    UPSTREAM_CONFIG="server ${ADS_A_UPSTREAM} weight=${ADS_A_WEIGHT}; server ${ADS_B_UPSTREAM} weight=${ADS_B_WEIGHT};"
fi

export ADS_SERVICE_B_BLOCK
export UPSTREAM_CONFIG

# Substitute all relevant variables in the template and output the final config
envsubst '$NGINX_RESOLVER $ADS_A_UPSTREAM $ADS_B_UPSTREAM $UPSTREAM_CONFIG $ADS_SERVICE_B_BLOCK' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX in the foreground
exec nginx -g 'daemon off;'
