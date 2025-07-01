#!/bin/sh
# Fail on any error
set -e

# Use 127.0.0.11 as the default resolver for Docker Compose
export NGINX_RESOLVER=${NGINX_RESOLVER:-127.0.0.11}

# Substitute all relevant variables in the template and output the final config
envsubst '$NGINX_RESOLVER $ADS_A_UPSTREAM $ADS_B_UPSTREAM $ADS_B_PERCENT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX in the foreground
exec nginx -g 'daemon off;'
