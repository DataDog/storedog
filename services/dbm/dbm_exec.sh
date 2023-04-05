#!/bin/sh

docker-compose exec postgres psql -U postgres -d postgres -a -f /etc/postgresql/13/main/dbm_setup.sql