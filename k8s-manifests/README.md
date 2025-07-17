# Storedog Kubernetes Deployment

This directory contains all the Kubernetes manifests for deploying the Storedog application.

## Directory Structure

The manifests are split into logical groups and subdirectories as follows:

```
k8s-manifests/
├── cluster-setup/
│   └── ingress-controller/
│   ├── provisioner/
│   ├── storage/
└── storedog-app/
    ├── configmaps/
    ├── secrets/
    ├── deployments/
    ├── statefulsets/
    └── ingress/
```

- **`cluster-setup/`**: Manifests for cluster-wide components (storage, provisioner, ingress controller).
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

1. Configure worker nodes to trust the insecure registry:
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

1. Build and push **ALL** images to local registry:

   ```bash
   REGISTRY_URL=localhost:5000; find ./services -name Dockerfile | while read dockerfile; do context_dir=$(dirname "$dockerfile"); image_name=$(echo "$context_dir" | sed 's|^\./services/||; s|/|-|g'); full_tag="$REGISTRY_URL/$image_name:latest"; echo "Building $full_tag from $context_dir"; docker build -t "$full_tag" "$context_dir" && docker push "$full_tag"; done
   ```

1. You may want to rebuild one service while testing. It helps to export the `REGISTRY_URL` so you don't need to keep setting it.

   ```bash
   export REGISTRY_URL=localhost:5000
   ```

   > [!IMPORTANT]
   > Building and pushing containers to the local registry needs to be done on the worker node.

   ```bash
   docker build -t $REGISTRY_URL/backend:latest ./services/backend && docker push $REGISTRY_URL/backend:latest
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

Set these variables in your shell before running the deployment commands. See the deployment steps below for usage examples.

## Deployment Steps

The Storedog manifest files use two variables to set the container registry URL and the version tag. The default is to use the localhost registry and `latest`. Set these environment variables accordingly when using a different registry location and tag version.

Default values (development):

```bash
export REGISTRY_URL=localhost:5000
export SD_TAG=latest
```

Example values for hosted containers:

```bash
export REGISTRY_URL="ghcr.io/datadog/storedog"
export SD_TAG=1.3.0
```

Deployment is a clean, two-stage process.
### Deploy Cluster Setup and Storedog

The storedog-app definition files contain variables which need to be set before applying them to the cluster. The command below uses `envsubst` to update the variable values in place before applying the definition file.

1. **Deploy Cluster Components (one-time setup per cluster):**
   This single command installs the storage provisioner and the ingress controller.

   ```bash
   kubectl apply -R -f k8s-manifests/cluster-setup/
   ```

1. **Create the stroedog namespace:**
   This command creates a `storedog` namespace.

   ```bash
   kubectl create namespace storedog
   ```

1. **Set secrets for Datadog RUM**
   This will take the host environment variables needed for RUM.

   ```bash
   kubectl create secret generic datadog-secret \
    --from-literal=dd_application_id=${DD_APPLICATION_ID} \
    --from-literal=dd_client_token=${DD_CLIENT_TOKEN} \
    -n storedog
   ```

1. **Deploy the Storedog Application:**
   This command deploys all application components into it.

   ```bash
   for file in k8s-manifests/storedog-app/**/*.yaml; do envsubst < "$file" | kubectl apply -n storedog -f -; done
   ```

1. **To reset the application:**
   You only need to delete the application's namespace. The cluster components can remain installed.

   ```bash
   kubectl delete namespace storedog
   ```

## Troubleshooting

1. Check pod status in the namespace:

   ```bash
   kubectl get pods -n storedog
   ```

1. Check pod logs:

   ```bash
   kubectl logs <pod-name> -n storedog
   ```

1. Check service status:

   ```bash
   kubectl get services -n storedog
   ```

1. Check ingress status:

   ```bash
   kubectl get ingress -n storedog
   ```

1. Check Persistent Volume Claims:

   ```bash
   kubectl get pvc -n storedog
   ```

*The status should be `Bound`.*

6. Check the logs for cluster components (if issues persist):

   ```bash
   # Storage Provisioner Logs
   kubectl logs -n local-path-storage -l app=local-path-provisioner

   # Ingress Controller Logs
   kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
   ```
