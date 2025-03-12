# Storedog

Storedog is a Dockerized e-commerce site used primarily in labs run at [learn.datadoghq.com](https://learn.datadoghq.com). It consists of multiple services:

- **Frontend**: A Next.js app that serves the homepage and product pages.
- **Backend**: A Rails app built using the Spree e-commerce framework that provides the main product catalog and order management APIs. Also includes a Redis cache.
- **Ads**: A service that serves banner ads to the homepage. The Java version of the service is primarily used, but see [the Python service's README](./services/ads/python/README.md) for details on how to run that one in it's place
- **Discounts**: A Python service that provides a discount API for the frontend.
- **Postgres**: A Postgres database that stores the product catalog and order data, as well as the Discount service's data.
- **Nginx**: A reverse proxy that routes requests to the appropriate service.
- **DBM**: An optional Python service that runs a long-running query to demonstrate Database Monitoring. See [the DBM service's README](./services/dbm/README.md) for details on how to run this service.
- **The Datadog Agent**: collects metrics and traces from the other services and sends them to Datadog.
- **Puppeteer**: A Node.js service that runs a headless browser to generate RUM data for the frontend.


## Local development

1. Before starting the containers, you will need to define the required env vars. Run the following command to copy the env var template:

  ```sh
  cp .env.template .env
  ```

1. Open the `.env` file under the project root and enter the values for the variables. The default values should all work except for the empty `DD_*` variables, which are required to enable different Datadog services and features. 

  You'll need to bring your own Datadog API key, application key, and RUM Client Token/Application ID values. You can find these in your Datadog org.

1. Start the app's services via `docker compose up`:

  ```sh
  docker compose up
  ```

1. Visit http://localhost to use the app. The homepage will take a few seconds to load as the backend is still starting up.

  If you see a 502 error for a while, confirm services are healthy by running `docker compose logs <service-name>` and checking logs.

## Feature flags
Some capabilities are hidden behind feature flags, which can be controlled via `services/frontend/site/featureFlags.config.json`. 

### DBM 
Enables a product ticker on the homepage with a long-running query to demonstrate DBM. 

**How to use**:
1. First, set up the DBM service as described in the [DBM README](./services/dbm/README.md)
1. Start the app via `docker compose up`
1. Set the `dbm` feature flag to true
1. Visit http://localhost and reload the home page a few times
1. The ticker will appear after 5 seconds and will subsequently update every 5 seconds with a new product and amount ordered

You can modify the ticker functionality in `services/frontend/components/common/NavBar.tsx`.

### error-tracking 
Introduces an exception in the Ads services to demonstrate Error Tracking by setting a header in to a value that is not expected by the Ads service.

**How to use**:
1. Start the app via `docker compose up`
1. Set the `error-tracking` feature flag to true
1. Visit http://localhost and reload the home page a few times
1. You should start seeing 500s being generated in the logs, in addition to the banner ads not loading on the homepage

Modify this functionality in `services/frontend/components/common/Ad/Ad.tsx` and respective Ads service being used.

### api-errors
This introduces random errors that occur in the frontend service's `/api` routes.

**How to use**:
1. Start the app via `docker compose up`
1. Set the `api-errors` feature flag to true
1. Visit http://localhost and reload the home page a few times, footer links will randomly return 400s and 500s.

Modify this functionality in `services/frontend/pages/api/*`.

### product-card-frustration
This will swap out the product card component with a version that doesn't have the thumbnails linked to the product page. When paired with the Puppeteer service, this can be used to demonstrate Frustration Signals in RUM.

**How to use**:
1. Start the app via `docker compose up`
1. Set the `product-card-frustration` feature flag to true
1. Visit http://localhost/products and try clicking on the product thumbnails to see the frustration signal in action.

Modify this functionality in `services/frontend/components/Product/ProductCard.tsx` and `services/frontend/components/Product/ProductCard-v2.tsx`.

## Image publication
Images are stored in GHCR. On PR merges, only the affected services will be pushed to GHCR, using the `latest` tag. For example, if you only made changes to the `backend` service, then only the `backend` Github workflow will trigger and publish `ghcr.io/datadog/storedog/backend:latest`. 

Separately, we tag and publish *all* images when a new release is created with the corresponding release tag e.g. `ghcr.io/datadog/storedog/backend:1.0.1`. New releases are made on an ad-hoc basis, depending on the recent features that are added.

## Breakdown of services

All of the services in the Storedog application are Dockerized and run in containers. See the [docker-compose.yml](./docker-compose.yml) file for the full list of services and how they are connected. You'll also find specific Datadog configurations, volume mounts, and environment variables for each service in there.

Below is a breakdown of services and some instructions on how to use them.

### Ads
There are two advertisement services, the default service is built in Java and there is another option available in Python. These services do the same thing, have the same endpoints, run on the same port (`3030`), and have the same failure modes. The biggest difference is the Python service uses a Postgres database to store the ads, while the Java service uses an in-memory list. These ads are served through the `Ads.tsx` component in the frontend service.

To switch between the Java and Python services, see the instructions in the [Ads service README](./services/ads/README.md).

### Backend

The backend service is where all of the product and order data is managed. It is built using the Spree e-commerce framework, which is a Ruby on Rails application.

It's accessible at `http://localhost:4000`, but there's nothing at that path since we run the service as a headless API. The admin interface is available at `http://localhost:4000/admin`. Login with the following credentials to access the admin interface if you would like to add products or manage orders:

```
Username: admin@storedog.com
Password: password
```

If you make any changes to the backend service, you will need to rebuild the Docker image to ensure new images uploaded are saved. You'll also need to create a restore point to ensure the new images are available in the database. 

#### Database rebuild

To create a new `.sql` restore file, run the following command while the application is running.

```sh
sh ./scripts/backup-db.sh
```

This will create a new `restore.sql` file in the `services/postgres/db/` directory and get it set up with all of necessary SQL statements to prepare the database for Datadog monitoring. When done running, you'll want to rebuild the Postgres database image with the new restore point. 

#### Worker
The Spree application has a worker process that runs in the background. There is a specific Datadog tracer configuration for it in the `services/worker/` directory and is mounted into the worker container.

### Discounts

The discounts service is a Python service that provides an API for serving discount codes to the frontend that can be used to apply discounts to orders. The discounts are stored in a Postgres database and are served through the `Discounts.tsx` component in the frontend service.

Currently, when applying a successful discount code, we it will automatically apply a "Free shipping" discount that exists in the backend service. This is to demonstrate the discount functionality in the frontend, but is a bit of a hack.

### Frontend

The frontend service is a Next.js application that serves the homepage and product pages. It is accessible at `http://localhost`.

In the shipped `docker-compose.yml` file, the frontend service is set to run in development mode, which means it will automatically reload when you make changes to the code. If you want to run the frontend service in production mode, you can do so by changing the `command` in the `frontend` service in the `docker-compose.yml` file to `npm run build && npm run start`.

### Postgres

The Postgres service is a Postgres database that stores the product catalog and order data, as well as the discount data for the discounts service.

There's information under the [Backend](#backend) section on how to rebuild the Postgres database image with a new restore point.

The Postgres service also has logging set up to write to a JSON file and a fairly quick log rotation, which get saved in a Docker volume. 

### Nginx

The Nginx service is a reverse proxy that routes requests to the appropriate service. It is accessible at `http://localhost`.

### DBM

The DBM service is an optional Python service that runs a long-running query to demonstrate Database Monitoring. See [the DBM service's README](./services/dbm/README.md) for details on how to run this service.

### Puppeteer

The Puppeteer service is a Node.js service that runs a headless browser to generate RUM data for the frontend.

## Contributing

While we don't accept contributions to the Storedog project from members outside of Datadog, we encourage you to fork the project and make it your own! 

