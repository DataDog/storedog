ARG NGINX_VERSION=1.26.0

FROM nginx:$NGINX_VERSION

RUN apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

# Set default environment variables
ENV DD_ENV=development \
  DD_VERSION=1.0.0 \
  DD_SERVICE=api-gateway

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf
COPY ngx_http_datadog_module.so /usr/lib/nginx/modules/ngx_http_datadog_module.so
