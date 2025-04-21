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

# Set default environment variables
ENV DD_ENV=development \
  DD_VERSION=1.0.0 \
  DD_SERVICE=nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf
