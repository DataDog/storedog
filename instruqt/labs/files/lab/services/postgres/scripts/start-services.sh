#!/bin/sh

# Start cron as root
crond -f &

# Ensure data directory has correct permissions
chown -R postgres:postgres /var/lib/postgresql/data
chmod -R 0700 /var/lib/postgresql/data

# Switch to the postgres user and start PostgreSQL using the original entrypoint
exec su-exec postgres docker-entrypoint.sh "$@"
