# Storedog

Storedog is a Dockerized e-commerce site used primarily in labs run at [learn.datadoghq.com](https://learn.datadoghq.com). 

**Table of contents**

- [Services](#services)
- [Optional features](#optional-features)
- [Local development](#local-development)
- [Production development](#production-development)
  - [Preparing for a Storedog release](#preparing-for-a-storedog-release)
  - [Preparing for lab use](#preparing-for-lab-use)
- [Image publication](#image-publication)
- [Contributing](#contributing)

## Services

Storedog consists of multiple services:

| Service | Technology | Description |
|---------|------------|-------------|
| **Ads** | Java | A service that serves banner ads to the homepage. The Java version of the service is primarily used, but see [the Python service's README](./services/ads/python/README.md) for details on how to run that one in it's place |
| **Backend** | Rails (Spree) | A Rails app built using the Spree e-commerce framework that provides the main product catalog and order management APIs. Also includes a Redis cache. |
| **DBM** | Python | An optional Python service that runs a long-running query to demonstrate Database Monitoring. See [the DBM service's README](./services/dbm/README.md) for details on how to run this service. |
| **Discounts** | Python | A Python service that provides a discount API for the frontend. |
| **Frontend** | Next.js | A Next.js app that serves the homepage and product pages. |
| **Nginx** | Nginx | A reverse proxy that routes requests to the appropriate service. Also known as `service-proxy`. |
| **Postgres** | PostgreSQL | A Postgres database that stores the product catalog and order data, as well as the Discount service's data. |
| **Puppeteer** | Node.js | A Node.js service that runs a headless browser to generate RUM data for the frontend. |
| **The Datadog Agent** | Datadog | Collects metrics and traces from the other services and sends them to Datadog. |

Each service has a `README.md` file with more information.

> [!NOTE]
> This application is built and tested to run within [Datadog Learning Center](https://learn.datadoghq.com/) lab environments. This application can be run outside of the Datadog Learning Center lab environments, but some features may not work as expected.
>
> This documentation includes instructions for running the application locally and in lab environments.

Many parts of this application were intentionally modified to introduce performance issues, security vulnerabilities, and other intentionally problematic code. This is to help you learn how to use Datadog to troubleshoot and fix these issues. This application is not intended to be used in production.

## Optional features

Several different features can be enabled using either feature flags or by modifying the `docker-compose.yml` file.

Read [FEATURES.md](FEATURES.md) for more information.

## Local development

1. Set environment variables.

    The Storedog application comes pre-configured with default environment variable values for all services. The services will run, but Datadog functionality will not work.

    If you want to test Datadog functionality (the Agent, APM, RUM) set the variables listed in the the `env.development.template` file. You can copy the file with the command below. Use the keys/tokens/ID from a trial account or a dogfood account.

    ```bash
    cp env.development.template .env
    ```

    To learn more about each environment variable, check out the `env.template`, the `docker-compose` files, and each service's `Dockerfile`s.

    > [!TIP]
    >
    > Use the `.env` file.
    >
    > There are several ways to pass environment variables to Docker Compose, which could lead to unintentional value overwrites. See the [Docker Compose documentation](https://docs.docker.com/compose/compose-file/compose-file-v3/#environment-variables) for more details.

1. Build and run the development containers.

    To build and run Storedog's services using development builds, run the following command from the root directory (`storedog/`):

    ```bash
    make dev
    ```

    Open Storedog's frontend in your browser at [http://localhost](http://localhost/).

    > [!TIP]
    >
    > Read the `Makefile` to see other useful commands.

## Production development

### Preparing for a Storedog release

After developing locally, you can generate a prod `docker-compose.yml` file with `make prepare-release`. 

This is primarily for building Storedog release images. (This is experimental, so please carefully read the `docker-compose.generated.yml` file before replacing the `docker-compose.yml` file.)

You won't be able to test the production `docker-compose.yml` file as written. This file relies on pre-built images rather than a local build context, so any local changes to service files won't be used by Docker Compose. This is expected.

### Preparing for lab use

In a lab environment, you may need to rely on local build contexts or mount volumes with customized files. Therefore, your lab's `docker-compose.yml` file may look like a mix of both the `docker-compose.yml` and `docker-compose.dev.yml` files.

You can likely remove several environment variables from your `docker-compose.yml`, since default values are set. Check each service's `Dockerfile` to see which variables have default values.

Check out the [template course](https://github.com/DataDog/learning-center/tree/main/templates/labs/storedog-template) to see how to set up a lab that uses Storedog.

## Image publication

Images are stored in GHCR. On PR merges, only the affected services will be pushed to GHCR, using the `latest` tag. For example, if you only made changes to the `backend` service, then only the `backend` Github workflow will trigger and publish `ghcr.io/datadog/storedog/backend:latest`.

Separately, we tag and publish *all* images when a new release is created with the corresponding release tag e.g. `ghcr.io/datadog/storedog/backend:1.0.1`. New releases are made on an ad-hoc basis, depending on the recent features that are added.

## Contributing

While we don't accept contributions to the Storedog project from members outside of Datadog, we encourage you to fork the project and make it your own!
