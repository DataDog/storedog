# Storedog

Storedog is a Dockerized e-commerce site used primarily in labs run at [learn.datadoghq.com](https://learn.datadoghq.com). It consists of multiple services:

- **Frontend**: A Next.js app that serves the homepage and product pages.
- **Backend**: A Rails app built using the Spree e-commerce framework that provides the main product catalog and order management APIs. Also includes a Redis cache.
- **Ads**: A service that serves banner ads to the homepage. The Java version of the service is primarily used, but see [the Python service's README](./services/ads/python/README.md) for details on how to run that one in it's place
- **Discounts**: A Python service that provides a discount API for the frontend.
- **Postgres**: A Postgres database that stores the product catalog and order data, as well as the Discount service's data.
- **Nginx**: A reverse proxy that routes requests to the appropriate service. Also known as `service-proxy`. 
- **DBM**: An optional Python service that runs a long-running query to demonstrate Database Monitoring. See [the DBM service's README](./services/dbm/README.md) for details on how to run this service.
- **The Datadog Agent**: collects metrics and traces from the other services and sends them to Datadog.
- **Puppeteer**: A Node.js service that runs a headless browser to generate RUM data for the frontend.

> [!NOTE]
> This application is built and tested to run within [Datadog Learning Center](https://learn.datadoghq.com/) lab environments. This application can be run outside of the Datadog Learning Center lab environments, but some features may not work as expected. 
> 
> This documentation includes instructions for running the application locally and in lab environments.

Many parts of this application were intentionally modified to introduce performance issues, security vulnerabilities, and other intentionally problematic code. This is to help you learn how to use Datadog to troubleshoot and fix these issues. This application is not intended to be used in production.

## Local development

The Storedog application comes pre-configured with default environment variable values for all services. You just need to run `docker compose -f docker-compose.dev.yml up -d` and you're good to go. These defaults are baked into the following files for your convenience and reference:

- Service Dockerfiles
- docker-compose.dev.yml
- .env.template

> [!NOTE]
> The production `docker-compose.yml` file is primarily used for lab environments. If you want to run the application in production, you can use the `docker-compose.yml` file, but you'll need to set image versions or build local images of the services.
>
> You'll also notice the `docker-compose.yml` file has less environment variables set. This is to make it easier to run in lab environments and rely more on default values.

The only values you need to provide are your Datadog credentials to enable Datadog features. You can set these in the Docker Compose file, on the host, or in a `.env` file. If you use the `.env` file, you can use the `.env.template` file as a reference for the available variables.

See the [Environment Variables](#environment-variables) section below for more details on the available environment variables.

> [!WARNING]
> While you can mix and match the environment variables in the Docker Compose file, host, and `.env` file, be mindful of the order of precedence. See the [Docker Compose documentation](https://docs.docker.com/compose/compose-file/compose-file-v3/#environment-variables) for more details.

### Using the Docker Compose file

1. Go into the Docker Compose file and set or overwrite the environment variables you need to override.

  ```yaml
  environment:
    - DD_API_KEY=your_datadog_api_key
    - DD_APP_KEY=your_datadog_app_key
  ```

### Using the host

1. Set the environment variables in your shell

  ```sh
  export DD_API_KEY=your_datadog_api_key
  export DD_APP_KEY=your_datadog_app_key
  ```

### Using the `.env` file

1. Copy the environment template:

  ```sh
  cp .env.template .env
  ```

1. Open the `.env` file and provide your Datadog credentials:
   - `DD_API_KEY`: Required for Datadog Agent and APM
   - `DD_APP_KEY`: Required for Datadog API access
   - `NEXT_PUBLIC_DD_APPLICATION_ID`: Required for RUM in frontend service
   - `NEXT_PUBLIC_DD_CLIENT_TOKEN`: Required for RUM in frontend service

   You can find or create these values in your Datadog organization. All other variables have sensible defaults and can be left as-is.

### Starting the application

1. Start the application:

  ```sh
  docker compose -f docker-compose.dev.yml up -d
  ```

  > [!NOTE]
  > You can also use the commands in the [Makefile](./Makefile) to start the application. For example, `make dev` will start the application in development mode.
  >
  > Run `make help` to see all of the available commands.

1. Visit http://localhost to use the app. The homepage will take a few seconds to load as the backend services initialize.

   If you see a 502 error for an extended period, check the service health with:

   ```sh
   docker compose -f docker-compose.dev.yml logs <service-name>
   ```

> [!NOTE]
> By default, the frontend service runs in development mode when using `docker compose -f docker-compose.dev.yml up -d`. If you want to run it in production, you can set the `FRONTEND_COMMAND` environment variable to `npm run prod`. This can be done either in the compose file, on the host, or in the `.env` file.

## Environment Variables

### Core Datadog Variables

These variables must be set for core functionality with Datadog, but will not affect the application's behavior. Find these values in your Datadog organization's settings, you'll need to create a RUM application for the `DD_APPLICATION_ID` and `DD_CLIENT_TOKEN` values.

- `DD_API_KEY`: Your Datadog API key (required for monitoring)
- `DD_APP_KEY`: Your Datadog application key (required for API access)
- `NEXT_PUBLIC_DD_APPLICATION_ID`: Datadog RUM application ID (required for RUM in frontend service)
- `NEXT_PUBLIC_DD_CLIENT_TOKEN`: Datadog RUM client token (required for RUM in frontend service)

### Frontend Service Variables

- `FRONTEND_COMMAND`: Command to run the frontend service (default: `npm run dev`)

> [!IMPORTANT]
> This variable is set on the host or in the `.env` file. It is not set in the Docker Compose file, as `command` attribute values in compose files cannot reference variable definitions directly set in the `environment` attribute.

- `NEXT_PUBLIC_ADS_ROUTE`: Route to the ads service (default: `/services/ads`)
- `NEXT_PUBLIC_DISCOUNTS_ROUTE`: Route to the discounts service (default: `/services/discounts`)
- `NEXT_PUBLIC_DBM_ROUTE`: Route to the DBM service (default: `/services/dbm`)
- `NEXT_PUBLIC_FRONTEND_API_ROUTE`: Frontend API host (default: `http://service-proxy:80`)
- `NEXT_PUBLIC_SPREE_API_HOST`: Spree API host (default: `http://service-proxy/services/backend`)
- `NEXT_PUBLIC_SPREE_CLIENT_HOST`: Spree client host (default: `/services/backend`)
- `NEXT_PUBLIC_SPREE_IMAGE_HOST`: Spree image host (default: `/services/backend`)
- `NEXT_PUBLIC_SPREE_ALLOWED_IMAGE_DOMAIN`: Allowed image domain (default: `service-proxy`)

> [!NOTE]
> You'll notice some need the `http://service-proxy` prefix is used in some of the variables. The reason for this difference those specific calls are made from Next.js API routes, which require a full URL to the service. 
>
> The ones without the `http://service-proxy` prefix are used in the frontend service's `fetch` calls, which are made from the browser and are caught by the nginx service, because it intercepts calls to Next.js API routes and routes them to the appropriate service.

### Database Variables

- `POSTGRES_USER`: Database username (default: `postgres`)
- `POSTGRES_PASSWORD`: Database password (default: `postgres`)
- `DB_HOST`: PostgreSQL host (default: `postgres`)
- `DB_PORT`: PostgreSQL port (default: `5432`)
- `DB_POOL`: Database connection pool size (default: `25`)

### Backend and Worker Variables

- `REDIS_URL`: Redis connection URL (default: `redis://redis:6379/0`)
- `MAX_THREADS`: Maximum worker threads (default: `5`)
- `RAILS_ENV`: Rails environment (default: `production`)

### Datadog Configuration Variables

Common Datadog variables that can be set in application services:

- `DD_ENV`: Environment name
- `DD_SITE`: Datadog site (e.g., `datadoghq.com`, `datadoghq.eu`)
- `DD_HOSTNAME`: Override default hostname
- `DD_LOGS_INJECTION`: Enable log injection into traces. Some languages' trace libraries turn this on by default, but we turn it on explicitly to prevent confusion.
- `DD_PROFILING_ENABLED`: Enable the Continuous Profiler 
- `DD_RUNTIME_METRICS_ENABLED`: Enable runtime metrics

Service-specific versions:
- `DD_VERSION_FRONTEND`: Frontend version (default: `1.0.0`)
- `DD_VERSION_BACKEND`: Backend version (default: `1.0.0`)
- `DD_VERSION_DISCOUNTS`: Discounts service version (default: `1.0.0`)
- `DD_VERSION_ADS`: Ads service version (default: `1.0.0`)
- `DD_VERSION_ADS_PYTHON`: Ads Python service version (default: `1.0.0`)
- `DD_VERSION_NGINX`: nginx service version (default: `1.28.0`)
- `DD_VERSION_POSTGRES`: PostgreSQL service version (default: `15.0`)
- `DD_VERSION_REDIS`: Redis version (default: `6.2`)

> [!NOTE]
> Most of the time, these service versions will remain at the same version as one another. The reason for having them defined separately is to allow for the ability to change the version of one service without having to change the version of all of the other services, something that may be common when working in a lab environment.

### Puppeteer user session simulation variables

Puppeteer service configuration:
- `STOREDOG_URL`: Application URL to run user sessions on (default: `http://service-proxy:80`) 
  - In lab environments, use the URL running on the host instead to have more realistic looking URLs in your session data.

  ```
  STOREDOG_URL=$HOSTNAME.$_SANDBOX_ID.instruqt.io
  ```

  > [!NOTE]
  > The `$HOSTNAME` and `$_SANDBOX_ID` variables are automatically set by Instruqt. Notice how this differs from what is used in the Storedog website tab in lab environments (`https://[HOSTNAME]-[PORT]-[PARTICIPANT_ID].env.play.instruqt.com`), as that is for authenticated traffic and the Puppeteer service is using an unauthenticated session.
  >
  > There is no need for a port in the URL, as the nginx service is configured to listen on port 80.

- `PUPPETEER_TIMEOUT`: Sets max timeout for Puppeteer, in case the session is unresponsive
- `SKIP_SESSION_CLOSE`: Skip closing browser sessions

### Nginx/Service Proxy Configuration Variables

These variables control the upstream configuration for the ads services in the Nginx (service-proxy) container, enabling A/B testing and traffic splitting between the Java and Python ads services.

> [!IMPORTANT]
> When `ADS_B_PERCENT` is greater than zero, the `ADS_B_UPSTREAM` endpoint must be reachable. Otherwise, the service-proxy will crash and restart.

- `ADS_A_UPSTREAM`: Host and port for the primary (A) ads service (default: `ads:3030`)
- `ADS_B_UPSTREAM`: Host and port for the secondary (B) ads service (default: `ads-python:3030`)
- `ADS_B_PERCENT`: Percentage of traffic to route to the B (Python) ads service (default: `0`). The remainder goes to the A (Java) ads service. Set to a value between `0` and `100` to control the split.

## Feature flags
Some capabilities are hidden behind feature flags, which can be controlled via `services/frontend/site/featureFlags.config.json`. 

> [!NOTE]
> Feature flags are available by default when running the application in development mode. If running in production, you'll need update the file and mount it into the frontend service container in the `docker-compose.yml` file.
>
> ```yaml
> volumes:
>   - ./services/frontend/site/featureFlags.config.json:/app/featureFlags.config.json
> ```

### dbm 
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

### nginx

The nginx service is a reverse proxy that handles requests for both the frontend and backend API services. It is accessible at `http://localhost`.

When viewing information about the application in Datadog, you'll see it referenced as `service-proxy`.

### DBM

The DBM service is an optional Python service that runs a long-running query to demonstrate Database Monitoring. See [the DBM service's README](./services/dbm/README.md) for details on how to run this service.

### Puppeteer

The Puppeteer service is a Node.js service that runs a headless browser to generate RUM data for the frontend.

It's a pre-built image that has sessions defined to run on the application, found in `services/puppeteer/scripts/puppeteer.js` but you can use Docker volume mounts to bring in your own customized sessions.

```sh
# add this to puppeteer service definition in a Docker Compose file
volumes:
  - ./services/puppeteer/scripts/puppeteer.js:/home/pptruser/puppeteer.js
```

## Contributing

While we don't accept contributions to the Storedog project from members outside of Datadog, we encourage you to fork the project and make it your own! 

