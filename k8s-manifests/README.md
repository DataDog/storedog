# Storedog Kubernetes Deployment

This directory contains all the Kubernetes manifests for deploying the Storedog application.

## Directory Structure

The manifests are split into logical groups and subdirectories as follows:

```
k8s-manifests/
├── cluster-setup/
│   ├── ingress-controller/
│   ├── provisioner/
│   └── storage/
├── datadog/
└── storedog-app/
    ├── configmaps/
    ├── secrets/
    ├── deployments/
    ├── statefulsets/
    └── ingress/
```

- **`cluster-setup/`**: Manifests for cluster-wide components (storage, provisioner, ingress controller).
- **`datadog/`**: Datadog agent manifest for observability.
- **`storedog-app/`**: All manifests for the Storedog application, organized by resource type (configmaps, secrets, deployments, statefulsets, ingress).

## Cluster Prerequisites

This deployment requires two cluster-level components to function on a non-cloud or local Kubernetes setup: a storage provisioner and an ingress controller. The manifests for both are included in the `cluster-setup/` directory.

### Storage

A storage provisioner is required for the PostgreSQL and Redis `StatefulSet`s. This repository includes manifests for the **Rancher Local Path Provisioner** and a default `StorageClass` to use it.

### Ingress

An Ingress Controller is required to expose the application on standard HTTP/S ports. This repository includes the manifest for the standard **NGINX Ingress Controller**, configured to use the host node's network.

## Using a Local Registry

For a standard Kubernetes cluster, you'll need to set up a local registry that your cluster can access:

> [!NOTE]
> This step is only required on worker nodes because they are the ones that pull and run containers.

1. Start a local Docker registry:

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

2. Configure worker nodes to trust the insecure registry:

- On each WORKER node only (not needed on control plane), add the following to `/etc/docker/daemon.json`:

```json
{
   "insecure-registries": ["localhost:5000"]
}
```

- Restart Docker on each WORKER node:

```bash
sudo systemctl restart docker
```

3. Build and push **ALL** images to local registry:

```bash
REGISTRY_URL=localhost:5000; find ./services -name Dockerfile | while read dockerfile; do context_dir=$(dirname "$dockerfile"); image_name=$(echo "$context_dir" | sed 's|^\./services/||; s|/|-|g'); full_tag="$REGISTRY_URL/$image_name:latest"; echo "Building $full_tag from $context_dir"; docker build -t "$full_tag" "$context_dir" && docker push "$full_tag"; done
```

> [!IMPORTANT]
> Building and pushing containers to the local registry needs to be done on the worker node.

4. You may want to rebuild one service while testing. It helps to export the `REGISTRY_URL` so you don't need to keep setting it.

```bash
export REGISTRY_URL=localhost:5000
```

```bash
SERVICE_NAME=discounts
docker build -t $REGISTRY_URL/$SERVICE_NAME:latest ./services/$SERVICE_NAME && docker push $REGISTRY_URL/$SERVICE_NAME:latest
```

## Prerequisites

Before deploying, ensure you have the following tools installed:

- **kubectl** (v1.20+ recommended): For interacting with your Kubernetes cluster.
- **helm** (v3+): For installing the Datadog Operator.
- **docker**: For building and pushing container images.
- **envsubst**: For substituting environment variables in manifest files.

You should also have access to a running Kubernetes cluster (local or cloud) and sufficient permissions to create namespaces, deployments, and cluster-wide resources.

## Environment Variables Reference

The deployment process uses several environment variables to template image locations, tags, and configuration. Below is a summary:

| Variable                      | Description                                 | Example                        |
|-------------------------------|---------------------------------------------|---------------------------------|
| `REGISTRY_URL`                | Container registry base URL                 | `localhost:5000`               |
| `SD_TAG`                      | Storedog image tag/version                  | `latest`                       |
| `DD_VERSION_ADS`              | Version tag for ads service                 | `1.0.0`                        |
| `DD_VERSION_ADS_PYTHON`       | Version tag for ads Python service (optional) | `1.0.0`                        |
| `DD_VERSION_BACKEND`          | Version tag for backend & worker services   | `1.0.0`                        |
| `DD_VERSION_DISCOUNTS`        | Version tag for discounts service           | `1.0.0`                        |
| `DD_VERSION_NGINX`            | Version tag for nginx                       | `1.0.0`                        |
| `NEXT_PUBLIC_DD_SERVICE_FRONTEND` | RUM service name for frontend           | `store-frontend`               |
| `NEXT_PUBLIC_DD_VERSION_FRONTEND` | Version tag for frontend service        | `1.0.0`                        |
| `DD_API_KEY`                  | Datadog API key (for secret creation)       | `<your-datadog-api-key>`        |
| `DD_APP_KEY`                  | Datadog App key (for secret creation)       | `<your-datadog-app-key>`        |
| `DD_APPLICATION_ID`           | Datadog RUM application ID (for secret creation) | `<your-datadog-rum-application-id>` |
| `DD_CLIENT_TOKEN`             | Datadog RUM client token (for secret creation) | `<your-datadog-rum-client-token>` |

Set these variables in your shell before running the deployment commands. See the deployment steps below for usage examples.

## Deployment Steps

The Storedog manifest files use two variables to set the container registry URL and the version tag. The default is to use the localhost registry and `latest`. Set these environment variables accordingly when using a different registry location and tag version.

**Local registry**:

```bash
export REGISTRY_URL=localhost:5000
export SD_TAG=latest
```

**Hosted containers**:

```bash
export REGISTRY_URL="ghcr.io/datadog/storedog"
export SD_TAG=1.5.0
```

### Set environment variables for Storedog

```bash
export DD_VERSION_ADS=1.0.0
export DD_VERSION_ADS_PYTHON=1.0.0
export DD_VERSION_BACKEND=1.0.0
export DD_VERSION_DISCOUNTS=1.0.0
export DD_VERSION_NGINX=1.28.0
export NEXT_PUBLIC_DD_SERVICE_FRONTEND=store-frontend
export NEXT_PUBLIC_DD_VERSION_FRONTEND=1.0.0
```

The Datadog environment variable `DD_ENV` is set in two places. Update both values as needed.

* The `datadog/datadog-agent.yaml` file on line 19.
* The `storedog-app/configmaps/storedog-config.yaml` file on line 22.

> [!IMPORTANT]
> These values should match.

### Deploy the Datadog Operator

1. Install the Datadog Operator with Helm:

```bash
helm repo add datadog https://helm.datadoghq.com
helm repo update
helm install datadog-operator datadog/datadog-operator
```

2. Create a Kubernetes secret with your Datadog API and app keys:

```bash
kubectl create secret generic datadog-secret \
  --from-literal api-key=$DD_API_KEY \
  --from-literal app-key=$DD_APP_KEY
```

3. Apply the Datadog Agent definition:

```bash
kubectl apply -f k8s-manifests/datadog/datadog-agent.yaml
```

### Deploy Cluster Setup and Storedog

The storedog-app definition files contain variables which need to be set before applying them to the cluster. The command below uses `envsubst` to update the variable values in place before applying the definition file.

1. **Deploy Cluster Components (one-time setup per cluster):**

Install the storage provisioner and the ingress controller.

```bash
kubectl apply -R -f k8s-manifests/cluster-setup/
```

2. **Deploy the Storedog Application:**

The following command creates a `storedog` namespace.

```bash
kubectl create namespace storedog
```

> [!IMPORTANT]
> If you use a different namespace, be sure to change the namespace name in all commands.

3. **Create Secrets for Datadog RUM:**

The following command creates a Kubernetes secret with your Datadog RUM app id and client token keys:

```bash
kubectl create secret generic datadog-secret \
  --from-literal=dd_application_id=${DD_APPLICATION_ID} \
  --from-literal=dd_client_token=${DD_CLIENT_TOKEN} \
  -n storedog
```

4. **Deploy the Storedog Application:**

The following command deploys all application components.

```bash
for file in k8s-manifests/storedog-app/**/*.yaml; do envsubst < "$file" | kubectl apply -n storedog -f -; done
```

   - **Apply manifest changes to one service:**

      While testing, you might change one manifest file. Rather than update all at once, you can apply the change like this.

      ```bash
      envsubst < k8s-manifests/storedog-app/deployments/backend.yaml | kubectl apply -n storedog -f -
      ```

5. **Deploy Puppeteer:**

The following command creates a `fake-traffic` namespace.

```bash
kubectl create namespace fake-traffic
```

6. **Deploy Puppeteer:**

> [!IMPORTANT]
> If you're using a namespace other than `storedog`, you must edit the `STOREDOG_URL` in `puppeteer.yaml`.

The following command sets variables and deploys Puppeteer.

```bash
envsubst < k8s-manifests/fake-traffic/puppeteer.yaml | kubectl apply -f -
```

## Troubleshooting

- Reset the all Storedog:

> [!NOTE]
> You only need to delete the application's namespace. The cluster components can remain installed.

```bash
kubectl delete namespace storedog
```

- Restart one service:

```bash
kubectl rollout restart deployment -n storedog ads
```

- Check pod status in the namespace:

```bash
kubectl get pods -n storedog
```

- Check pod logs:

```bash
kubectl logs <pod-name> -n storedog
```

- Check service status:

```bash
kubectl get services -n storedog
```

- Check ingress status:

```bash
kubectl get ingress -n storedog
```

- Check Persistent Volume Claims:

```bash
kubectl get pvc -n storedog
```

*The status should be `Bound`.*

Check the logs for cluster components (if issues persist):

```bash
# Storage Provisioner Logs
kubectl logs -n local-path-storage -l app=local-path-provisioner

# Ingress Controller Logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```
