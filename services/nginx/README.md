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

## SSL/TLS (Optional)

The service-proxy can terminate its own TLS on port `443`, gated by the `ENABLE_SSL` environment variable. This is needed when a lab exposes Storedog through Instruqt's external ingress (`*.instruqt.io`) rather than the learner proxy (`*.env.play.instruqt.com`), since external ingress does not include Instruqt-provided HTTPS termination. For more information, see the [README.md](../../README.md#enable-ssltls-on-the-service-proxy) file in the root of this repo.

Situations where a lab typically needs this:
- Datadog Synthetic browser tests, which need a valid HTTPS URL to run reliably against the lab
- Demonstrating browser features that require a secure context (for example, Service Workers or WebAuthn)
- A lab where an external service needs a stable public URL to call back into Storedog (for example, webhooks), rather than Instruqt's session-scoped learner proxy

> [!IMPORTANT]
> When `ENABLE_SSL=true`, the container looks for a certificate and key at `/etc/nginx/certs/cert.pem` and `/etc/nginx/certs/key.pem`. If they aren't already mounted there, [docker-entrypoint.sh](./docker-entrypoint.sh) tries to download them from GCP instance metadata (the `ssl-certificate`/`ssl-certificate-key` attributes Instruqt provisions). If neither source has a cert/key, the service-proxy exits with an error on startup.

### Using SSL/TLS

#### Docker Compose

1. Add these to the `service-proxy` service in your `docker-compose.yml` file:

    ```yaml
    service-proxy:
      ports:
        - '443:443'
      environment:
        - ENABLE_SSL=${ENABLE_SSL:-true}
    ```

1. Start the app via `docker compose up -d`. With nothing mounted, the container downloads the cert/key from GCP instance metadata on startup. To use your own cert/key instead, add a `./certs:/etc/nginx/certs:ro` volume and place them at `./certs/cert.pem` and `./certs/key.pem` before starting.

#### Kubernetes

Replace your entire `k8s-manifests/storedog-app/deployments/nginx.yaml` file with [`nginx-ssl.yaml`](./k8s-manifests/nginx-ssl.yaml) in this directory. It adds `ENABLE_SSL=true`, `containerPort: 443`, and a matching Service `port: 443` to the base manifest, with no cert volume needed: the container fetches its own certificate from GCP instance metadata at startup, the same way the entrypoint does for Docker Compose.

This only works if the `service-proxy` pod is scheduled onto a VM with `provision_ssl_certificate: true` in its `config.yml` (or a single-node cluster, where that's the only VM). In a split control-plane/worker topology, that usually means the worker node exposed via external ingress.
