ARG NGINX_VERSION=1.21.4

FROM nginx:$NGINX_VERSION

ARG NGINX_VERSION=1.21.4
ARG GEOIP2_VERSION=3.3

RUN mkdir -p /var/lib/GeoIP/

RUN apt-get update \
  && apt-get install -y \
  build-essential \
  libpcre++-dev \
  zlib1g-dev \
  libgeoip-dev \
  libmaxminddb-dev \
  wget \
  git

RUN cd /opt \
  && git clone --depth 1 -b $GEOIP2_VERSION --single-branch https://github.com/leev/ngx_http_geoip2_module.git \
  && wget -O - http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz | tar zxfv - \
  && mv /opt/nginx-$NGINX_VERSION /opt/nginx \
  && cd /opt/nginx \
  && ./configure --with-compat --add-dynamic-module=/opt/ngx_http_geoip2_module \
  && make modules 

FROM nginx:$NGINX_VERSION

COPY --from=0 /opt/nginx/objs/ngx_http_geoip2_module.so /usr/lib/nginx/modules
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf
COPY GeoLite2-City.mmdb /var/lib/GeoIP/GeoLite2-City.mmdb
COPY GeoLite2-Country.mmdb /var/lib/GeoIP/GeoLite2-Country.mmdb

RUN apt-get update \
  && apt-get install -y --no-install-recommends --no-install-suggests libmaxminddb0 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && chmod -R 644 /usr/lib/nginx/modules/ngx_http_geoip2_module.so 

