#!/usr/bin/bash

# disable path expansion so we can use a literal *
set -f
QUERY="LOCK TABLE items IN EXCLUSIVE MODE;"
UPDATE_QUERY=$(cat <<EOF
  UPDATE items 
  SET order_count = order_count::int + 1
  WHERE id = (SELECT id FROM items WHERE order_count::int > random() * 7000 LIMIT 1);
  SELECT pg_sleep(1);
EOF
)

# Loop for running the query
for i in {1..15}
do
  # Loop for building the query
  for j in {1..20}
  do
    QUERY+="${UPDATE_QUERY}"
  done
  psql -U postgres -d postgres -h postgres -c "$QUERY"
done
