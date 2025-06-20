ARG NGINX_VERSION=1.28.0

FROM nginx:$NGINX_VERSION

RUN apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY status.conf /etc/nginx/conf.d/status.conf

# Copy the configuration template and the entrypoint script
COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Set the entrypoint for the container
ENTRYPOINT ["/docker-entrypoint.sh"]

# Expose port 80
EXPOSE 80
