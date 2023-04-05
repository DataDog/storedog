#!/bin/sh

psql -U postgres -d postgres -a -f /etc/postgresql/13/main/dbm_setup.sql