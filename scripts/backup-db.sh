#! /bin/bash

# exec dump on postgres container

# get root of repository
root=$(git rev-parse --show-toplevel)
prependstatements=$root/scripts/prepend_db_statements.sql
destination=$root/services/postgres/db/restore.sql

# remove old backups in the restore folder
rm -f $root/services/postgres/db/*.sql

# exec dump
docker compose exec postgres pg_dump -U postgres storedog_db > $destination

echo "Backup created at $destination"

# prepend statements to the dump
cat $prependstatements $destination > $destination.tmp
mv $destination.tmp $destination
