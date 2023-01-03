FROM nginx:1.21.4
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf

LABEL "com.datadoghq.ad.check_names"='["nginx"]'
LABEL "com.datadoghq.ad.init_configs"='[{}]'
LABEL "com.datadoghq.ad.instances"='[{"nginx_status_url": "http://%%host%%:81/nginx_status/"}]'