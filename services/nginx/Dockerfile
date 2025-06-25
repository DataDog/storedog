ARG NGINX_VERSION=1.28.0

FROM nginx:$NGINX_VERSION

RUN apt-get update \
  && apt-get install -y gettext-base \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY status.conf /etc/nginx/conf.d/status.conf
COPY ngx_http_datadog_module.so /usr/lib/nginx/modules/ngx_http_datadog_module.so
COPY loading.html /usr/share/nginx/html/loading.html
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
