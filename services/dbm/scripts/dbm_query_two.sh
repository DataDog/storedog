#!/usr/bin/bash

# disable path expansion so we can use a literal *
set -f
QUERY="LOCK TABLE items IN EXCLUSIVE MODE;"
UPDATE_QUERY=$(cat <<EOF
UPDATE items
SET order_count = floor(random() * 7000), last_hour = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM items WHERE order_count::int > random() * 7000 ORDER BY RANDOM() LIMIT 1);
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
  psql -U postgres -d postgres -h localhost -c "$QUERY"
done
