ARG NGINX_VERSION=1.26

FROM nginx:$NGINX_VERSION

RUN apt-get update \
  && apt-get install -y \
  build-essential \
  libpcre++-dev \
  zlib1g-dev \
  wget \
  git

FROM nginx:$NGINX_VERSION

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf
