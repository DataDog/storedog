FROM postgres:13-alpine
COPY ./scripts/restore-2024-04-25-22-06-17.sql /docker-entrypoint-initdb.d/
COPY ./postgresql.conf /postgresql.conf