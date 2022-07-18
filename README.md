# Storedog Backend

This a dockerized [Spree Commerce](https://spreecommerce.org) application consumed by [Storedog - Frontend](https://github.com/DataDog/storedog-frontend).
## Local development

The following command will start the Spree backend containers:
`docker-compose up`

To build the frontend as well, please see the README in the [Storedog - Frontend](https://github.com/DataDog/storedog-frontend) repo.
## Database rebuild

The current database is based off sample data provided by the Spree starter kit. To create a new `.sql` dump file, run the following command while the application is running.

```
docker exec -t storedog-backend_postgres_1 pg_dumpall -c -U postgres > db/restore/dump_`date +%d-%m-%Y"_"%H_%M_%S`.sql
```

You will then need to remove the following code from the `.sql` file. It should be lines 10 - 31. These commands are not necessary and produce a conflict error when executed because the refereneced DB and roles do not yet exist, so they cannot be dropped.

```
--
-- Drop databases (except postgres and template1)
--
DROP DATABASE spree_starter_development;
DROP DATABASE spree_starter_test;
--
-- Drop roles
--
DROP ROLE postgres;

--
-- Roles
--

CREATE ROLE postgres;
```

**Notes**
Any `.sh` or `.sql` script under `/db/restore` will be run during init in the Postgres container.

Ref: https://hub.docker.com/_/postgres -> Initialization scripts

## Spree admin

Visit http://localhost:4000/admin

```
Username: spree@example.com
Password: spree123
```