# service-proxy (nginx) service README

The nginx service is a reverse proxy that handles requests for both the frontend and backend API services. It is accessible at `http://localhost`.

When viewing information about the application in Datadog, you'll see it referenced as `service-proxy`.

## RUM Credential Routing

This branch includes special nginx configuration for the retention filters lab that routes different traffic sources to different RUM applications.

### How It Works

1. **Puppeteer sessions** set custom HTTP headers:
   - `X-RUM-App-ID` - Specifies which RUM application to use
   - `X-RUM-Client-Token` - Provides the client token

2. **Learner sessions** don't set custom headers, so nginx uses defaults from environment variables:
   - `DEFAULT_RUM_APP_ID` 
   - `DEFAULT_RUM_CLIENT_TOKEN`

3. Nginx forwards these credentials to Next.js as proxy headers using `proxy_set_header`

4. Next.js middleware reads the headers and sets cookies in the response

### Configuration

See `default.conf.template` lines 72-89 for the RUM routing logic:
- Reads incoming `X-RUM-App-ID` and `X-RUM-Client-Token` headers
- Falls back to `DEFAULT_RUM_APP_ID` and `DEFAULT_RUM_CLIENT_TOKEN` if headers are empty
- Forwards final values to Next.js as proxy headers

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
