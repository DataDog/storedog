# Storedog Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Storedog application on a Kubernetes cluster.

## Directory Structure

```
storedog-k8s/
├── configmaps/
├── deployments/
├── ingress/
├── secrets/
├── statefulsets/
├── provisioner/
├── ingress-controller/
└── storage/
```

## Cluster Prerequisites

This deployment requires two cluster-level components to function on a non-cloud or local Kubernetes setup: a storage provisioner and an ingress controller.

### Storage
This deployment requires Persistent Volumes for PostgreSQL and Redis. This repository includes a manifest for the **Rancher Local Path Provisioner** in the `provisioner/` directory, which provides storage capabilities from the host node's filesystem. A default `StorageClass` is also defined in `storage/` to use this provisioner.

### Ingress
To expose the application to the outside world, an Ingress Controller is required. This repository includes a manifest for the standard **NGINX Ingress Controller** in the `ingress-controller/` directory. It acts as the front door for all traffic coming into the cluster.

No manual setup is required for these components, as they are deployed in the first step below.

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
docker build -t $REGISTRY_URL/storedog-ads:latest ./services/ads/java && docker push $REGISTRY_URL/storedog-ads:latest
docker build -t $REGISTRY_URL/storedog-nginx:latest ./services/nginx && docker push $REGISTRY_URL/storedog-nginx:latest
docker build -t $REGISTRY_URL/storedog-puppeteer:latest ./services/puppeteer && docker push $REGISTRY_URL/storedog-puppeteer:latest
docker build -t $REGISTRY_URL/storedog-postgres:latest ./services/postgres && docker push $REGISTRY_URL/storedog-postgres:latest
```

## Deployment Steps

Deployment is a two-stage process. First, we ensure the cluster-level components are installed. Second, we deploy the Storedog application into its dedicated namespace.

1. **Deploy Cluster Components (one-time setup per cluster):**
   This command installs the storage provisioner and the ingress controller, and creates the `StorageClass`. These resources are not namespaced and only need to be applied once.
   ```bash
   kubectl apply -f provisioner/
   kubectl apply -f ingress-controller/
   kubectl apply -f storage/
   ```

2. **Deploy the Storedog Application:**
   This command creates the namespace and deploys all application components into it.
   ```bash
   kubectl create namespace storedog
   kubectl apply -R -f configmaps/ -f secrets/ -f deployments/ -f statefulsets/ -f ingress/ -n storedog
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
