#!/bin/sh
# Fail on any error
set -e

# Use 127.0.0.11 as the default resolver for Docker Compose
export NGINX_RESOLVER=${NGINX_RESOLVER:-127.0.0.11}

# Calculate upstream config based on ADS_B_PERCENT
ADS_B_PERCENT=${ADS_B_PERCENT:-0}

if [ -z "$ADS_B_PERCENT" ] || [ "$ADS_B_PERCENT" -eq 0 ]; then
    UPSTREAM_CONFIG="server ${ADS_A_UPSTREAM};"
else
    ADS_A_WEIGHT=$((100 - ADS_B_PERCENT))
    ADS_B_WEIGHT=$ADS_B_PERCENT
    UPSTREAM_CONFIG="server ${ADS_A_UPSTREAM} weight=${ADS_A_WEIGHT}; server ${ADS_B_UPSTREAM} weight=${ADS_B_WEIGHT};"
fi

export UPSTREAM_CONFIG

# Substitute all relevant variables in the template and output the final config
envsubst '$NGINX_RESOLVER $ADS_A_UPSTREAM $ADS_B_UPSTREAM $UPSTREAM_CONFIG' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX in the foreground
exec nginx -g 'daemon off;'
