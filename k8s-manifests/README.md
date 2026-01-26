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
- **`datadog/`**: Datadog Agent/Operator configuration.
- **`external-services/`**: External services (e.g., ad-provider).
- **`fake-traffic/`**: Puppeteer for generating synthetic traffic.

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

4. You may want to rebuild one service while testing. It helps to export the `REGISTRY_URL` so you don't need to keep setting it.

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

2. **Create the stroedog namespace:**
   This command creates a `storedog` namespace.

```bash
kubectl create namespace storedog
```

3. **Set secrets for Datadog RUM**
   This will take the host environment variables needed for RUM.

```bash
kubectl create secret generic datadog-secret \
 --from-literal=dd_application_id=${DD_APPLICATION_ID} \
 --from-literal=dd_client_token=${DD_CLIENT_TOKEN} \
 -n storedog
```

4. **Deploy the Storedog Application:**

The following command deploys all application components into it.

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

- Check the logs for cluster components (if issues persist):

```bash
# Storage Provisioner Logs
kubectl logs -n local-path-storage -l app=local-path-provisioner

# Ingress Controller Logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Data Streams Monitoring

The Storedog application includes a Kafka-based data streaming pipeline for demonstrating Datadog Data Streams Monitoring.

### Overview

The Data Streams pipeline consists of:
- **1 Kafka StatefulSet** (message broker with persistence)
- **1 Producer Deployment** (generates order events)
- **7 Consumer Deployments** (process and forward messages)
- **1 ConfigMap** (shared configuration)

### Pipeline Architecture

```
order-producer → order-events
  ↓
order-validator → validated-orders
  ↓
inventory-service → inventory-reserved
  ↓
payment-processor → payment-confirmed
  ↓
fulfillment-service → order-fulfilled
  ↓
notification-service (terminal)

Parallel flows:
- fraud-detector (monitors order-events & payment-confirmed)
- analytics-aggregator (monitors multiple topics)
```

### Data Streams Files

```
storedog-app/
├── configmaps/
│   └── data-streams-config.yaml       # Shared configuration
├── statefulsets/
│   └── kafka.yaml                     # Kafka broker (3.9.0)
└── deployments/
    ├── order-producer.yaml            # Generates orders
    ├── order-validator.yaml           # Validates orders
    ├── inventory-service.yaml         # Reserves inventory
    ├── payment-processor.yaml         # Processes payments
    ├── fraud-detector.yaml            # Detects fraud (parallel)
    ├── fulfillment-service.yaml       # Creates shipments
    ├── notification-service.yaml      # Sends notifications
    └── analytics-aggregator.yaml      # Aggregates analytics
```

### Deploying Data Streams

1. **Deploy Kafka StatefulSet:**

```bash
kubectl apply -f k8s-manifests/storedog-app/statefulsets/kafka.yaml -n storedog
kubectl wait --for=condition=ready pod kafka-0 -n storedog --timeout=120s
```

2. **Deploy ConfigMap:**

```bash
kubectl apply -f k8s-manifests/storedog-app/configmaps/data-streams-config.yaml -n storedog
```

3. **Deploy Data Streams Services:**

```bash
kubectl apply -f k8s-manifests/storedog-app/deployments/order-producer.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/order-validator.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/inventory-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/payment-processor.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/notification-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml -n storedog
```

### Verifying Data Streams Deployment

Check all data streams pods:

```bash
kubectl get pods -l component=data-streams -n storedog
```

Check services:

```bash
kubectl get svc -l component=data-streams -n storedog
```

View Kafka topics:

```bash
kubectl exec -it kafka-0 -n storedog -- kafka-topics.sh \
  --bootstrap-server localhost:9092 --list
```

### Data Streams Monitoring

All services have `DD_DATA_STREAMS_ENABLED=true` to enable Datadog Data Streams Monitoring.

View the pipeline in Datadog:
- Navigate to [Data Streams Monitoring](https://app.datadoghq.com/data-streams)
- Filter by `env:apm-workshop`
- View pipeline topology, pathway latencies, and consumer lag

### Configuration

Key configuration is in the `data-streams-config` ConfigMap:

```yaml
KAFKA_BOOTSTRAP_SERVERS: "kafka:9092"
DD_ENV: "apm-workshop"
DD_DATA_STREAMS_ENABLED: "true"
```

Each service deployment defines:
- `TOPICS_IN` - Topics to consume from
- `TOPICS_OUT` - Topics to produce to (if applicable)
- `CONSUMER_GROUP` - Kafka consumer group
- `DD_SERVICE_NAME` - Service name for Datadog
- `DD_TAGS` - Custom tags for pipeline stages

### Scaling Data Streams Services

Scale producers to increase load:

```bash
kubectl scale deployment order-producer --replicas=3 -n storedog
```

Scale consumers for parallel processing:

```bash
kubectl scale deployment order-validator --replicas=2 -n storedog
```

### Troubleshooting Data Streams

View logs for all data streams services:

```bash
kubectl logs -l component=data-streams -n storedog --tail=100 -f
```

View logs for a specific service:

```bash
kubectl logs -l app=order-validator -n storedog -f
```

Check Kafka logs:

```bash
kubectl logs kafka-0 -n storedog -f
```

Check consumer lag:

```bash
kubectl exec -it kafka-0 -n storedog -- kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --group order-validator-group
```

### Removing Data Streams

Remove all data streams deployments:

```bash
kubectl delete deployment -l component=data-streams -n storedog
kubectl delete svc -l component=data-streams -n storedog
```

Remove Kafka (keeps PVC):

```bash
kubectl delete statefulset kafka -n storedog
```

Remove everything including data:

```bash
kubectl delete deployment -l component=data-streams -n storedog
kubectl delete svc -l component=data-streams -n storedog
kubectl delete statefulset kafka -n storedog
kubectl delete pvc -l app=kafka -n storedog
```

### Additional Documentation

For more details on the Data Streams architecture and service definitions, see:
- `../services/data-streams/README.md` - Overview
- `../services/data-streams/ARCHITECTURE.md` - System design
- `../services/data-streams/PIPELINE_DIAGRAM.md` - Visual flows
- `../services/data-streams/QUICKSTART.md` - Detailed deployment guide
- `../services/data-streams/DOCKER_COMPOSE.md` - Docker Compose alternative (for development)
