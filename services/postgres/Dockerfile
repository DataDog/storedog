FROM postgres:15-alpine

# Install dcron and su-exec for user switching
RUN apk update && apk add --no-cache dcron su-exec

# Set default environment variables
ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres

# Copy SQL dump and PostgreSQL configuration
COPY ./db/restore.sql /docker-entrypoint-initdb.d/
COPY ./postgresql.conf /postgresql.conf

# Create log directory and set permissions
RUN mkdir -p /var/log/pg_log && \
  chown -R postgres:postgres /var/log/pg_log && \
  chmod -R 755 /var/log/pg_log

# Copy the cron job file
COPY ./scripts/cleanup-cron /etc/crontabs/root

# Copy and set the entrypoint script
COPY ./scripts/start-services.sh /usr/local/bin/start-services.sh
RUN chmod +x /usr/local/bin/start-services.sh

# Use the custom entrypoint script
ENTRYPOINT ["/usr/local/bin/start-services.sh"]

# Default command
CMD ["postgres", "-c", "config_file=/postgresql.conf"]
