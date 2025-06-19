# Storedog Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Storedog application on a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (e.g., minikube, kind, or a cloud provider's Kubernetes service)
- kubectl CLI tool
- Docker (for building images)
- Container registry access (to store your container images)

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

## Building and Pushing Images

Before deploying, you need to build and push the container images:

1. Build the images:
```bash
# From the root directory
docker build -t storedog-frontend:latest ./services/frontend
docker build -t storedog-backend:latest ./services/backend
docker build -t storedog-discounts:latest ./services/discounts/python
docker build -t storedog-ads:latest ./services/ads/java
```

2. Tag and push the images to your container registry:
```bash
# Replace 'your-registry' with your container registry
docker tag storedog-frontend:latest your-registry/storedog-frontend:latest
docker tag storedog-backend:latest your-registry/storedog-backend:latest
docker tag storedog-discounts:latest your-registry/storedog-discounts:latest
docker tag storedog-ads:latest your-registry/storedog-ads:latest

docker push your-registry/storedog-frontend:latest
docker push your-registry/storedog-backend:latest
docker push your-registry/storedog-discounts:latest
docker push your-registry/storedog-ads:latest
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

5. Deploy the frontend:
```bash
kubectl apply -f deployments/frontend.yaml
```

6. Deploy the ingress:
```bash
kubectl apply -f ingress/nginx-ingress.yaml
```

## Accessing the Application

Once deployed, you can access the application through your ingress controller's IP address or hostname. If you're using minikube, you can get the IP address with:

```bash
minikube ip
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
