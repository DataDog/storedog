# Storedog Kubernetes Deployment

This directory contains all the Kubernetes manifests for deploying the Storedog application.

## Directory Structure

The manifests are split into two logical groups:

```
k8s-manifests/
├── cluster-setup/
│   ├── storage/
│   ├── provisioner/
│   └── ingress-controller/
└── storedog-app/
    ├── configmaps/
    ├── secrets/
    ├── deployments/
    ├── statefulsets/
    └── ingress/
```

- **`cluster-setup/`**: Contains manifests for cluster-wide components that are prerequisites for the application. These are typically installed once per cluster.
- **`storedog-app/`**: Contains all the manifests for the Storedog application itself.

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
   REGISTRY_URL=localhost:5000

   find ./services -name Dockerfile | while read dockerfile; do
   context_dir=$(dirname "$dockerfile")
   # Create a tag based on the path, e.g., storedog-ads-java for ./services/ads/java/Dockerfile
   image_name=$(echo "$context_dir" | sed 's|^\./services/||; s|/|-|g')
   full_tag="$REGISTRY_URL/storedog-$image_name:latest"
   echo "Building $full_tag from $context_dir"
   docker build -t "$full_tag" "$context_dir" && docker push "$full_tag"
   done
   ```

## Deployment Steps

Deployment is a clean, two-stage process.

1. **Deploy Cluster Components (one-time setup per cluster):**
   This single command installs the storage provisioner and the ingress controller.

   ```bash
   kubectl apply -R -f k8s-manifests/cluster-setup/
   ```

1. **Deploy the Storedog Application:**
   This command creates a `storedog` namespace and deploys all application components into it.

   ```bash
   kubectl create namespace storedog
   kubectl apply -R -f k8s-manifests/storedog-app/ -n storedog
   ```

1. **To reset the application:**
   You only need to delete the application's namespace. The cluster components can remain installed.

   ```bash
   kubectl delete namespace storedog
   ```

## Important Notes

1. The provided secrets are for development only. In production:
   - Use a proper secrets management solution
   - Change all default passwords
   - Enable SSL/TLS

1. The resource limits and requests are estimates and should be adjusted based on your actual needs and monitoring data.

1. For production use:
   - Configure proper health checks
   - Set up monitoring and logging
   - Configure backups for stateful services
   - Use proper SSL/TLS certificates
   - Configure proper network policies

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
