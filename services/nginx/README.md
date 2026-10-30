# Nginx / Service Proxy

## Description

This service is a reverse proxy that routes requests to the frontend, backend, ads, discounts, and DBM services. When viewing information about the application in Datadog, this service is referenced as `service-proxy`.

The final nginx config is generated at container start by [docker-entrypoint.sh](./docker-entrypoint.sh). It runs `envsubst` against [default.conf.template](./default.conf.template), filling in placeholders based on environment variables, then starts nginx with the resulting config.

## A/B Testing Ads services (Optional)

The service-proxy can split traffic between two Ads services based on a percentage. For more information, see the [README.md](../../README.md#ab-testing-ads-services) file in the root of this repo.

Add these environment variables to the `service-proxy` service:

```yaml
environment:
  - ADS_A_UPSTREAM=${ADS_A_UPSTREAM:-ads:3030}
  - ADS_B_UPSTREAM=${ADS_B_UPSTREAM:-ads-python:3030}
  - ADS_B_PERCENT=${ADS_B_PERCENT:-0}
```

## SSL/TLS (Enabled by default)

The service-proxy terminates its own TLS on port `443`, controlled by the `ENABLE_SSL` environment variable. The shipped `docker-compose.yml`, `docker-compose.dev.yml`, and Kubernetes manifests turn it on by default. Labs that expose Storedog through Instruqt's external ingress (`*.instruqt.io`) need it, because external ingress does not include Instruqt-provided HTTPS termination. For more information, including the Instruqt `config.yml` example, see the [README.md](../../README.md#ssltls-on-the-service-proxy) file in the root of this repo.

> [!IMPORTANT]
> When `ENABLE_SSL=true`, the container looks for a certificate and key at `/etc/nginx/certs/cert.pem` and `/etc/nginx/certs/key.pem`. If they aren't already mounted there, [docker-entrypoint.sh](./docker-entrypoint.sh) tries to download them from GCP instance metadata (the `ssl-certificate`/`ssl-certificate-key` attributes Instruqt provisions). If neither source has a cert/key, the service-proxy exits with an error on startup. There is no fallback to HTTP.

Only the exact value `true` enables TLS. Any other value, including an empty value, leaves nginx listening on port `80` only.

### Docker Compose

`docker-compose.yml` and `docker-compose.dev.yml` set `ENABLE_SSL=${ENABLE_SSL:-true}` and publish port `443`. They don't publish port `80` by default, because containers reach `service-proxy:80` over the Docker network. To disable SSL for local development, copy `.env.template` to `.env` and uncomment this line:

```bash
ENABLE_SSL=false
```

Then uncomment the `'80:80'` mapping under `service-proxy` in the compose file so `http://localhost` works.

To test TLS locally instead, keep SSL enabled and add a `./certs:/etc/nginx/certs:ro` volume to the `service-proxy` service. Place your certificate and key at `./certs/cert.pem` and `./certs/key.pem`.

### Kubernetes

`k8s-manifests/storedog-app/deployments/nginx.yaml` sets `ENABLE_SSL` to `${ENABLE_SSL}`, which `envsubst` fills in from your shell when you deploy. Export it before you apply the manifests:

```bash
export ENABLE_SSL=${ENABLE_SSL:-true}
```

To disable SSL on a local cluster (for example, kind), run `export ENABLE_SSL=false` before applying. For the full deployment steps, see the [Kubernetes README](../../k8s-manifests/README.md#ssltls-on-the-service-proxy).

The [`nginx-ssl.yaml`](./k8s-manifests/nginx-ssl.yaml) file in this directory is a reference copy of the deployed `nginx.yaml`. Keep the two files identical.

In Kubernetes, the certificate comes from GCP instance metadata, so the `service-proxy` pod must run on a VM with `provision_ssl_certificate: true` in its Instruqt `config.yml`. In a split control-plane/worker topology, that is usually the worker node exposed through external ingress.
