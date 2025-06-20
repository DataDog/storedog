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

1. Start a local Docker registry:
```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

2. Configure worker nodes (NOT control plane) to trust the insecure registry:
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
   Note: This step is only required on worker nodes because they are the ones that pull and run containers.

3. Build and push images to local registry:
```bash
# Set your registry URL
REGISTRY_URL=localhost:5000

# Build, tag, and push all service images
docker build -t $REGISTRY_URL/storedog-frontend:latest ./services/frontend && docker push $REGISTRY_URL/storedog-frontend:latest
docker build -t $REGISTRY_URL/storedog-backend:latest ./services/backend && docker push $REGISTRY_URL/storedog-backend:latest
docker build -t $REGISTRY_URL/storedog-discounts:latest ./services/discounts && docker push $REGISTRY_URL/storedog-discounts:latest
docker build -t $REGISTRY_URL/storedog-ads-java:latest ./services/ads/java && docker push $REGISTRY_URL/storedog-ads-java:latest
docker build -t $REGISTRY_URL/storedog-nginx:latest ./services/nginx && docker push $REGISTRY_URL/storedog-nginx:latest
docker build -t $REGISTRY_URL/storedog-puppeteer:latest ./services/puppeteer && docker push $REGISTRY_URL/storedog-puppeteer:latest
docker build -t $REGISTRY_URL/storedog-postgres:latest ./services/postgres && docker push $REGISTRY_URL/storedog-postgres:latest
```

## Deployment Steps

Deployment is a clean, two-stage process.

1. **Deploy Cluster Components (one-time setup per cluster):**
   This single command installs the storage provisioner and the ingress controller.
   ```bash
   kubectl apply -R -f k8s-manifests/cluster-setup/
   ```

2. **Deploy the Storedog Application:**
   This command creates a `storedog` namespace and deploys all application components into it.
   ```bash
   kubectl create namespace storedog
   kubectl apply -R -f k8s-manifests/storedog-app/ -n storedog
   ```

3. **To reset the application:**
   You only need to delete the application's namespace. The cluster components can remain installed.
   ```bash
   kubectl delete namespace storedog
   ```

## Important Notes

1. The provided secrets are for development only. In production:
   - Use a proper secrets management solution
   - Change all default passwords
   - Enable SSL/TLS

2. The resource limits and requests are estimates and should be adjusted based on your actual needs and monitoring data.

3. For production use:
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

2. Check pod logs:
```bash
kubectl logs <pod-name> -n storedog
```

3. Check service status:
```bash
kubectl get services -n storedog
```

4. Check ingress status:
```bash
kubectl get ingress -n storedog
```

5. Check Persistent Volume Claims:
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
