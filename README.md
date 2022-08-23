# Storedog Backend

This a dockerized [Spree Commerce](https://spreecommerce.org) application consumed by [Storedog - Frontend](https://github.com/DataDog/storedog-frontend).
## Local development

**1.** Before starting the containers, you will need to define the required env vars. Run the following command to copy the env var template to the `.env` file:

`cp .env.template .env && cp .env.template ./deploy/docker-compose/.env`

Then, open the `.env` file and enter the values for the variables. The default values should all work except for the empty `DD_API_KEY`, which is required to run the DD agent.

**2a.** To start the backend containers using the local build context, run:
`docker-compose up`

**2b.** To start the backend containers using the published images in ECR, run:
`docker-compose -f ./deploy/docker-compose/docker-compose.yml -p storedog-backend up`

To build the frontend, please see the README in the [Storedog - Frontend](https://github.com/DataDog/storedog-frontend) repo.
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