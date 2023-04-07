# Storedog

This a dockerized [Spree Commerce](https://spreecommerce.org) application consumed by a NextJS frontend.

## Local development

**1.** Before starting the containers, you will need to define the required env vars. Run the following command to copy the env var template:

`cp .env.template .env && cp .env.template ./deploy/docker-compose/.env && cp .env.template ./services/frontend/site/.env.local`

**2.**
Open the `.env` file under the project root and enter the values for the variables. The default values should all work except for the empty `DD_API_KEY`, which is required to run the DD agent.

**3.**
Open the `./services/frontend/site/.env.local` file and enter the values for the variables. The default values should all work except for the empty `NEXT_PUBLIC_DD_APPLICATION_KEY` and `NEXT_PUBLIC_CLIENT_TOKEN`, which are required to enable RUM.

**4.** Start the app: `docker-compose up`

## Image publication
Images are stored in our public ECR repo `public.ecr.aws/x2b9z2t7`. On PR merges, only the affected services will be pushed to the ECR repo, using the `latest` tag. For example, if you only made changes to the `backend` service, then only the `backend` Github workflow will trigger and publish `public.ecr.aws/x2b9z2t7/storedog/backend:latest`. 

Separately, we tag and publish *all* images when a new release is created with the corresponding release tag e.g. `public.ecr.aws/x2b9z2t7/storedog/backend:1.0.1`. New releases are made on an ad-hoc basis, depending on the recent features that are added.

# Backend
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


# Frontend

## Considerations

- `packages/commerce` contains all types, helpers and functions to be used as base to build a new **provider**.
- **Providers** live under `packages`'s root folder and they will extend Next.js Commerce types and functionality (`packages/commerce`).
- We have a **Features API** to ensure feature parity between the UI and the Provider. The UI should update accordingly and no extra code should be bundled. All extra configuration for features will live under `features` in `commerce.config.json` and if needed it can also be accessed programatically.
- Each **provider** should add its corresponding `next.config.js` and `commerce.config.json` adding specific data related to the provider. For example in case of BigCommerce, the images CDN and additional API routes.

## Configuration

### Enable RUM

To enable RUM, generate a new RUM application in DD and then set the `NEXT_PUBLIC_DD_APPLICATION_KEY` and `NEXT_PUBLIC_CLIENT_TOKEN` values in `./site/.env.local`. Then start the app, click around the site, and you should start to see RUM metrics populating in DD.

### Features

Every provider defines the features that it supports under `packages/{provider}/src/commerce.config.json`

#### Features Available

The following features can be enabled or disabled. This means that the UI will remove all code related to the feature.
For example: Turning `cart` off will disable Cart capabilities.

- cart
- search
- wishlist
- customerAuth
- customCheckout

#### How to turn Features on and off

> NOTE: The selected provider should support the feature that you are toggling. (This means that you can't turn wishlist on if the provider doesn't support this functionality out the box)

- Open `site/commerce.config.json`
- You'll see a config file like this:
  ```json
  {
    "features": {
      "wishlist": false,
      "customCheckout": true
    }
  }
  ```
- Turn `wishlist` on by setting `wishlist` to `true`.
- Run the app and the wishlist functionality should be back on.

#### How to run the DBM backend to test the Database Monitoring in the product and incrementally improve for the workshop

- complete the startup steps up under Local Development to number 3
- in `services/frontend/site/featureFlags.config.json` find the object with `name:dbm` and set `active:true`
- run `docker-compose --profile dbm up -d`
- once all the containers are up, run `docker exec storedog-postgres-1 ./dbm_exec.sh` this will add a few things we need for dbm to the database
- run `docker restart storedog-postgres-1` to restart the postgres container

You should now see your logs in DBM!

Once the metrics are showing in DBM, direct the users to the `dbm.py` file in `services/dbm/dbm.py`.

Have them update the query to change the 2 `{random.randint(1, 7000)}` to `{random.randint(5000, 7000)}` so only the most popular items show in the ticker.

Then explain that preorder items get marked as false or `f` in the table once they are now regular items. Say that best practice would be to update the `items` table to include the items marked `f`. Now we will update the query to the following to only look at the `items` table.

```sql
SELECT *
FROM items
WHERE order_count::int > {random.randint(5000, 7000)}
```

This will greatly reduce the amount of cost per query

## Troubleshoot

<details>
<summary>When run locally I get `Error: Cannot find module '...@vercel/commerce/dist/config'`</summary>

```bash
commerce/site
❯ yarn dev
yarn run v1.22.17
$ next dev
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
info  - Loaded env from /commerce/site/.env.local
error - Failed to load next.config.js, see more info here https://nextjs.org/docs/messages/next-config-error
Error: Cannot find module '/Users/dom/work/vercel/commerce/node_modules/@vercel/commerce/dist/config.cjs'
    at createEsmNotFoundErr (node:internal/modules/cjs/loader:960:15)
    at finalizeEsmResolution (node:internal/modules/cjs/loader:953:15)
    at resolveExports (node:internal/modules/cjs/loader:482:14)
    at Function.Module._findPath (node:internal/modules/cjs/loader:522:31)
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:919:27)
    at Function.mod._resolveFilename (/Users/dom/work/vercel/commerce/node_modules/next/dist/build/webpack/require-hook.js:179:28)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/Users/dom/work/vercel/commerce/site/commerce-config.js:9:14) {
  code: 'MODULE_NOT_FOUND',
  path: '/Users/dom/work/vercel/commerce/node_modules/@vercel/commerce/package.json'
}
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
```

The error usually occurs when running yarn dev inside of the `/site/` folder after installing a fresh repository.

In order to fix this, run `yarn dev` in the monorepo root folder first.

> Using `yarn dev` from the root is recommended for developing, which will run watch mode on all packages.

</details>

<details>
<summary>When run locally I get `Error: Spree API cannot be reached'`</summary>

The error usually occurs when the backend containers are not yet fully healthy, but the frontend has already started making API requests.

In the docker logs output for storedog-backend, check to see if the backend has fully started. You should see the following log for the `web` container:
```
web_1       | [1] * Listening on http://0.0.0.0:4000
```

</details>