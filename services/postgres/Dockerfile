FROM postgres:15-alpine
COPY ./scripts/restore-2024-04-25-22-06-17.sql /docker-entrypoint-initdb.d/
COPY ./postgresql.conf /postgresql.conf
# create log file for postgres and give read write permission to all users
RUN mkdir -p /var/log/pg_log && \
  chown -R postgres:postgres /var/log/pg_log && \
  chmod -R 755 /var/log/pg_log

CMD ["postgres", "-c", "config_file=/postgresql.conf"]