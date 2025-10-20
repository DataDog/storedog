
# Optional Features

This doc covers the different features you can enable in Storedog.

Click on a feature below to learn more.

- [A/B Testing Ads services](#ab-testing-ads-services)
  - [With Docker Compose](#with-docker-compose)
  - [With Kubernetes](#with-kubernetes)
- [Feature flags](#feature-flags)
  - [DBM](#dbm)
  - [Error Tracking](#error-tracking)
  - [Random frontend API errors](#random-frontend-api-errors)
  - [Frustration Signals in RUM](#frustration-signals-in-rum)

## A/B Testing Ads services

Run two Ads services and split traffic between them. The amount of traffic sent to each service is set with a percent value.

This requires running a second Ads service in addition to the default Java Ads service and setting environment variables in the `service-proxy` service. The Python Ads service is typically used as the secondary service.

### With Docker Compose

1. Set the following environment variables:

    - `DD_VERSION_ADS_PYTHON`: The version number that the Datadog Agent uses to tag the `ads-python` service.
    - `ADS_A_UPSTREAM`: Host and port for the primary (A) ads service (default: `ads:3030`)
    - `ADS_B_UPSTREAM`: Host and port for the secondary (B) ads service (default: `ads-python:3030`)
    - `ADS_B_PERCENT`: Percentage of traffic to route to the B (Python) ads service (default: `0`). The remainder goes to the A ads (Java) service.
      - Set a value between `0` and `100` to control the split.

    > [!IMPORTANT]
    >
    > When `ADS_B_PERCENT` is greater than zero, the `ADS_B_UPSTREAM` endpoint must be reachable. Otherwise, the `service-proxy` will crash and restart.

1. Add a second Ads service to the `docker-compose.yml` or `docker-compose.dev.yml`.

    ```yaml
      ads-python:
        image: ghcr.io/datadog/storedog/ads-python:${STOREDOG_IMAGE_VERSION:-latest}
        build: # Only used if building from source in development
          context: ./services/ads/python
        depends_on:
          - postgres
          - dd-agent
        environment:
          - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
          - POSTGRES_USER=${POSTGRES_USER:-postgres}
          - POSTGRES_HOST=postgres
          - DD_AGENT_HOST=dd-agent
          - DD_ENV=${DD_ENV:-production}
          - DD_SERVICE=store-ads-python
          - DD_VERSION=${DD_VERSION_ADS_PYTHON:-1.0.0}
          - DD_PROFILING_ENABLED=true
          - DD_PROFILING_TIMELINE_ENABLED=true
          - DD_PROFILING_ALLOCATION_ENABLED=true
        volumes: # Only used in development
          - ./services/ads/python:/app
        networks:
          - storedog-network
        labels:
          com.datadoghq.ad.logs: '[{"source": "python"}]'
    ```

1. Add these environment variables to the `service-proxy` service in the `docker-compose.yml` (or `docker-compose.dev.yml`) file:

    ```yaml
    environment:
      - ADS_A_UPSTREAM=${ADS_A_UPSTREAM:-ads:3030}
      - ADS_B_UPSTREAM=${ADS_B_UPSTREAM:-ads-python:3030}
      - ADS_B_PERCENT=${ADS_B_PERCENT:-0}
    ```

1. Start the app via `make dev` or `make prod`.

### With Kubernetes

A Kubernetes manifest for the Python Ads service is available in the `services/ads/k8s-manifests/` directory.

1. Add the `ads-python.yaml` file to the `k8s-manifests/storedog-app/deployments/` directory.

1. Add the following environment variables to the `nginx.yaml` file and adjust as needed:

    ```yaml
    # A/B testing ads services
    - name: ADS_A_UPSTREAM
      value: "ads:3030"
    - name: ADS_B_UPSTREAM
      value: "ads-python:3030"
    - name: ADS_B_PERCENT
      value: "50"
    ```

1. Follow the instructions in the [Kubernetes README](./k8s-manifests/README.md) to run Storedog in Kubernetes.

1. If the Storedog is already running, apply the manifests to the cluster:

    ```bash
    envsubst < k8s-manifests/storedog-app/deployments/ads-python.yaml | kubectl apply -n storedog -f -
    envsubst < k8s-manifests/storedog-app/deployments/nginx.yaml | kubectl apply -n storedog -f -
    ```

> [!IMPORTANT]
> Be sure to set the `DD_VERSION_ADS_PYTHON` environment variable so that it will be applied to the file by `envsubst`.

## Feature flags

Some capabilities are hidden behind feature flags, which can be controlled via `services/frontend/site/featureFlags.config.json`.

> [!NOTE]
> Feature flags are available by default when running the application in development mode. If running in production, you'll need update the file and mount it into the frontend service container in the `docker-compose.yml` file.
>
> ```yaml
> volumes:
>   - ./services/frontend/site/featureFlags.config.json:/app/featureFlags.config.json
> ```

### DBM

The `dbm` feature flag enables a product ticker on the homepage with a long-running query to demonstrate DBM.

**How to use**:

1. First, set up the DBM service as described in the [DBM README](./services/dbm/README.md)
1. Start the app via `docker compose up`
1. Set the `dbm` feature flag to true
1. Visit http://localhost and reload the home page a few times
1. The ticker will appear after 5 seconds and will subsequently update every 5 seconds with a new product and amount ordered

You can modify the ticker functionality in `services/frontend/components/common/NavBar.tsx`.

### Error Tracking

The `error-tracking` feature flag demonstrates Error Tracking. When enabled, the `ads` service experiences exceptions due to unexpected header values.

**How to use**:

1. Start the app via `docker compose up`
1. Set the `error-tracking` feature flag to `true`
1. Visit `http://localhost` and reload the home page a few times
1. 500 errors are generated in the logs, and banner ads don't load on the homepage

Modify this functionality in `services/frontend/components/common/Ad/Ad.tsx` and respective Ads service being used.

### Random frontend API errors

The `api-errors` feature flag introduces random errors that occur in the frontend service's `/api` routes.

**How to use**:

1. Start the app via `docker compose up`
1. Set the `api-errors` feature flag to `true`
1. Visit `http://localhost` and reload the home page a few times, footer links will randomly return 400s and 500s.

Modify this functionality in `services/frontend/pages/api/*`.

### Frustration Signals in RUM

The `product-card-frustration` feature flag swaps out the product card component with a version that doesn't have the thumbnails linked to the product page. When paired with the Puppeteer service, this can be used to demonstrate Frustration Signals in RUM.

**How to use**:

1. Start the app via `docker compose up`
1. Set the `product-card-frustration` feature flag to `true`
1. Visit `http://localhost/products` and try clicking on the product thumbnails to see the frustration signal in action.

Modify this functionality in `services/frontend/components/Product/ProductCard.tsx` and `services/frontend/components/Product/ProductCard-v2.tsx`.
