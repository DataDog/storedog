ARG NGINX_VERSION=1.28.0

FROM nginx:$NGINX_VERSION

# Accept the architecture from Buildx
ARG TARGETARCH
ARG DATADOG_VERSION=v1.8.0

RUN apt-get update \
  && apt-get install -y gettext-base curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && FILENAME="ngx_http_datadog_module-appsec-${TARGETARCH}-${NGINX_VERSION}.so.tgz" \
  && curl -sSL -o "${FILENAME}" "https://github.com/DataDog/nginx-datadog/releases/download/${DATADOG_VERSION}/${FILENAME}" \
  && tar -xzvf "${FILENAME}" \
  && mv ngx_http_datadog_module.so /usr/lib/nginx/modules/ngx_http_datadog_module.so \
  && rm "${FILENAME}"

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY status.conf /etc/nginx/conf.d/status.conf
COPY loading.html /usr/share/nginx/html/loading.html
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
