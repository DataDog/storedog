ARG NGINX_VERSION=1.28.0

FROM nginx:$NGINX_VERSION

COPY nginx.conf /etc/nginx/nginx.conf
COPY status.conf /etc/nginx/conf.d/status.conf
COPY default.conf /etc/nginx/conf.d/default.conf
