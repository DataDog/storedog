#!/bin/sh

exec postgres -c config_file=/etc/postgresql/13/main/postgresql.conf

sleep(20)

exec psql -U postgres -d postgres -a -f /etc/postgresql/13/main/dbm_setup.sql