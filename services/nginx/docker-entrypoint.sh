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

# Build the SSL listen block based on ENABLE_SSL
ENABLE_SSL=${ENABLE_SSL:-false}

if [ "$ENABLE_SSL" = "true" ]; then
    CERT_FILE=/etc/nginx/certs/cert.pem
    KEY_FILE=/etc/nginx/certs/key.pem

    # Fall back to fetching the cert/key from GCP instance metadata (as
    # provisioned by Instruqt) when nothing has been mounted into the container.
    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        echo "No certificate/key found at /etc/nginx/certs, attempting to fetch from GCP instance metadata"
        mkdir -p /etc/nginx/certs
        METADATA_URL="http://metadata.google.internal/computeMetadata/v1/instance/attributes"
        if ! curl -sf -H "Metadata-Flavor: Google" "$METADATA_URL/ssl-certificate" -o "$CERT_FILE" \
            || ! curl -sf -H "Metadata-Flavor: Google" "$METADATA_URL/ssl-certificate-key" -o "$KEY_FILE"; then
            rm -f "$CERT_FILE" "$KEY_FILE"
        fi
    fi

    if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
        echo "ERROR: ENABLE_SSL=true but $CERT_FILE and/or $KEY_FILE not found, and they could not be downloaded from GCP instance metadata. Mount a certificate and key into /etc/nginx/certs, or set ENABLE_SSL=false." >&2
        exit 1
    fi
    SSL_LISTEN_BLOCK="listen 443 ssl;
    ssl_certificate     ${CERT_FILE};
    ssl_certificate_key ${KEY_FILE};"
else
    SSL_LISTEN_BLOCK=""
fi

export SSL_LISTEN_BLOCK

# Substitute all relevant variables in the template and output the final config
envsubst '$NGINX_RESOLVER $ADS_A_UPSTREAM $ADS_B_UPSTREAM $UPSTREAM_CONFIG $ADS_SERVICE_B_BLOCK $SSL_LISTEN_BLOCK' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX in the foreground
exec nginx -g 'daemon off;'
