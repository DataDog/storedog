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

2. Configure your worker nodes to trust the insecure registry:
   - On each worker node, add the following to `/etc/docker/daemon.json`:
   ```json
   {
     "insecure-registries": ["localhost:5000"]
   }
   ```
   - Restart Docker on each worker node:
   ```bash
   sudo systemctl restart docker
   ```

3. Build and push images to local registry:
```bash
# Build and tag images
docker build -t localhost:5000/storedog-frontend:latest ./services/frontend
docker build -t localhost:5000/storedog-backend:latest ./services/backend
docker build -t localhost:5000/storedog-discounts:latest ./services/discounts/python
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
kubectl config set-context --current --namespace=storedog
```

2. Apply the ConfigMap and Secrets:
```bash
kubectl apply -f configmaps/shared-config.yaml
kubectl apply -f secrets/shared-secrets.yaml
```

3. Deploy the stateful services:
```bash
kubectl apply -f statefulsets/postgres.yaml
kubectl apply -f statefulsets/redis.yaml
```

4. Deploy the backend services:
```bash
kubectl apply -f deployments/backend.yaml
kubectl apply -f deployments/worker.yaml
kubectl apply -f deployments/discounts.yaml
kubectl apply -f deployments/ads.yaml
```

5. Deploy the frontend and nginx:
```bash
kubectl apply -f deployments/frontend.yaml
kubectl apply -f deployments/nginx.yaml
```

6. Deploy the ingress:
```bash
kubectl apply -f ingress/nginx-ingress.yaml
```

7. (Optional) Deploy the testing service:
```bash
kubectl apply -f deployments/puppeteer.yaml
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
