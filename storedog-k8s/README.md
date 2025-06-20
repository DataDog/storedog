# Storedog Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Storedog application on a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster with control plane and worker nodes
- kubectl CLI tool
- Docker (for building images)

## Directory Structure

```
storedog-k8s/
├── configmaps/
│   └── shared-config.yaml
├── secrets/
│   └── shared-secrets.yaml
├── deployments/
│   ├── frontend.yaml
│   ├── backend.yaml
│   ├── worker.yaml
│   ├── discounts.yaml
│   └── ads.yaml
├── statefulsets/
│   ├── postgres.yaml
│   └── redis.yaml
└── ingress/
    └── nginx-ingress.yaml
```

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

   Note: This step is only required on worker nodes because they are the ones that pull and run containers. The control plane node doesn't need this configuration as it doesn't run application containers.

3. Build and push images to local registry:
```bash
# Build and tag images
docker build -t localhost:5000/storedog-frontend:latest ./services/frontend
docker build -t localhost:5000/storedog-backend:latest ./services/backend
docker build -t localhost:5000/storedog-discounts:latest ./services/discounts
docker build -t localhost:5000/storedog-ads:latest ./services/ads/java
docker build -t localhost:5000/storedog-nginx:latest ./services/nginx
docker build -t localhost:5000/storedog-puppeteer:latest ./services/puppeteer
docker build -t localhost:5000/storedog-postgres:latest ./services/postgres

# Push to local registry
docker push localhost:5000/storedog-frontend:latest
docker push localhost:5000/storedog-backend:latest
docker push localhost:5000/storedog-discounts:latest
docker push localhost:5000/storedog-ads:latest
docker push localhost:5000/storedog-nginx:latest
docker push localhost:5000/storedog-puppeteer:latest
docker push localhost:5000/storedog-postgres:latest
```

## Deployment Steps

1. Create the namespace (optional):
```bash
kubectl create namespace storedog
```

2. Deploy everything:
```bash
kubectl apply -R -f storedog-k8s/ -n storedog
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

4. The services use initContainers to handle dependencies, but you might want to use a more sophisticated solution like [Helm](https://helm.sh/) for complex deployments.

## Troubleshooting

1. Check pod status:
```bash
kubectl get pods
```

2. Check pod logs:
```bash
kubectl logs <pod-name>
```

3. Check service status:
```bash
kubectl get services
```

4. Check ingress status:
```bash
kubectl get ingress
```
