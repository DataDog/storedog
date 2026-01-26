# Quick Start Guide - Data Streams

Get the Storedog Data Streams pipeline running in Kubernetes.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Datadog Operator installed (or Datadog Agent running)
- Docker registry access (for custom images)
- 8GB RAM minimum for the cluster

## Step 1: Set Up Datadog

Ensure Datadog Agent is running in your cluster. If using the Datadog Operator:

```bash
kubectl apply -f k8s-manifests/datadog/datadog-agent.yaml
```

Verify the agent is running:

```bash
kubectl get pods -l app=datadog
```

## Step 2: Deploy Kafka

Deploy the Kafka StatefulSet:

```bash
kubectl apply -f k8s-manifests/storedog-app/statefulsets/kafka.yaml
```

Wait for Kafka to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=kafka --timeout=120s
```

## Step 3: Apply ConfigMap

```bash
kubectl apply -f k8s-manifests/storedog-app/configmaps/data-streams-config.yaml
```

## Step 4: Deploy Data Streams Services

Deploy all services:

```bash
# Producer
kubectl apply -f k8s-manifests/storedog-app/deployments/order-producer.yaml

# Consumer-Producers
kubectl apply -f k8s-manifests/storedog-app/deployments/order-validator.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/inventory-service.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/payment-processor.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml

# Consumers (terminal nodes)
kubectl apply -f k8s-manifests/storedog-app/deployments/notification-service.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml
```

Or deploy all at once:

```bash
kubectl apply -f k8s-manifests/storedog-app/deployments/order-producer.yaml \
              -f k8s-manifests/storedog-app/deployments/order-validator.yaml \
              -f k8s-manifests/storedog-app/deployments/inventory-service.yaml \
              -f k8s-manifests/storedog-app/deployments/payment-processor.yaml \
              -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml \
              -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml \
              -f k8s-manifests/storedog-app/deployments/notification-service.yaml \
              -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml
```

This deploys:
- ✅ Kafka (3.9.0 in KRaft mode) - StatefulSet
- ✅ 8 Kafka services (1 producer, 7 consumers) - Deployments

## Step 5: Verify Services Are Running

```bash
kubectl get pods -l component=data-streams
```

All pods should show `Running` status.

Check services:

```bash
kubectl get svc -l component=data-streams
```

## Step 6: Check Message Flow

View Kafka topics:
```bash
kubectl exec -it kafka-0 -- kafka-topics.sh \
  --bootstrap-server localhost:9092 --list
```

Should see:
- order-events
- validated-orders
- inventory-reserved
- payment-confirmed
- order-fulfilled
- fraud-alerts
- shipment-created
- (and more)

## Step 7: View in Datadog

1. Go to [Datadog Data Streams Monitoring](https://app.datadoghq.com/data-streams)
2. Filter by `env:production` (or your configured env)
3. You should see the pipeline topology

Wait 2-3 minutes for data to appear.

## Step 8: Generate Load (Optional)

The order-producer automatically generates ~60 messages/minute.

To increase load, scale up the producer:
```bash
kubectl scale deployment order-producer --replicas=3
```

Or trigger manual production via API (requires port-forward):
```bash
kubectl port-forward svc/order-producer 8080:8080
curl -X POST http://localhost:8080/send/order-events/test-order
```

## Service Endpoints (Port-Forward)

All services run on port 8080 internally. To access:

```bash
# Port forward to a specific service
kubectl port-forward svc/order-producer 8080:8080
kubectl port-forward svc/order-validator 8081:8080
kubectl port-forward svc/inventory-service 8082:8080
# ... etc
```

Health checks:
```bash
curl http://localhost:8080/actuator/health
```

## View Logs

All data streams pods:
```bash
kubectl logs -l component=data-streams --tail=100 -f
```

Specific service:
```bash
kubectl logs -l app=order-validator --tail=100 -f
```

Kafka logs:
```bash
kubectl logs kafka-0 --tail=100 -f
```

## Stop Services

Remove data streams deployments:
```bash
kubectl delete -f k8s-manifests/storedog-app/deployments/order-producer.yaml \
               -f k8s-manifests/storedog-app/deployments/order-validator.yaml \
               -f k8s-manifests/storedog-app/deployments/inventory-service.yaml \
               -f k8s-manifests/storedog-app/deployments/payment-processor.yaml \
               -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml \
               -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml \
               -f k8s-manifests/storedog-app/deployments/notification-service.yaml \
               -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml
```

Remove Kafka (keeps PVC):
```bash
kubectl delete -f k8s-manifests/storedog-app/statefulsets/kafka.yaml
```

Remove everything including data:
```bash
kubectl delete -f k8s-manifests/storedog-app/deployments/
kubectl delete -f k8s-manifests/storedog-app/statefulsets/kafka.yaml
kubectl delete pvc -l app=kafka
```

## Troubleshooting

### Pods won't start

Check pod status:
```bash
kubectl describe pod <pod-name>
```

Check if images are available:
```bash
kubectl get pods -l component=data-streams -o jsonpath='{.items[*].status.containerStatuses[*].state}'
```

### No data in Datadog

1. Verify Datadog agent is running:
   ```bash
   kubectl get pods -l app=datadog
   ```
2. Check agent logs:
   ```bash
   kubectl logs -l app=datadog --tail=100
   ```
3. Verify `DD_DATA_STREAMS_ENABLED=true` in configmap:
   ```bash
   kubectl describe configmap data-streams-config
   ```
4. Wait 2-3 minutes for data to appear

### Kafka errors

View Kafka logs:
```bash
kubectl logs kafka-0 --tail=100
```

Check Kafka readiness:
```bash
kubectl get pod kafka-0
```

Check Kafka topics:
```bash
kubectl exec -it kafka-0 -- kafka-topics.sh \
  --bootstrap-server localhost:9092 --describe
```

### Consumer lag

Check consumer groups:
```bash
kubectl exec -it kafka-0 -- kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 --list

kubectl exec -it kafka-0 -- kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe --group order-validator-group
```

## What You Should See

### In Kubernetes
```
✓ Kafka StatefulSet ready (1/1)
✓ Datadog agent running
✓ 8 deployments running (1/1 each)
✓ Logs showing message processing
✓ Services created for each deployment
```

### In Datadog DSM

**Topology Map:**
- Visual pipeline from order-producer to terminal consumers
- Service connections
- Topic dependencies

**Pathway Latencies:**
- order-producer → notification-service: ~1000-1500ms
- order-producer → analytics-aggregator: ~500-800ms

**Consumer Lag:**
- Should be minimal (< 100ms) with default load
- May increase if producers scaled up

**Throughput:**
- ~1 message/second at default rate
- Higher if scaled

## Next Steps

1. ✅ Services running
2. ⏭️ View metrics in Datadog
3. ⏭️ Scale up producers to test lag
4. ⏭️ Introduce failures (stop a service)
5. ⏭️ Add monitoring alerts
6. ⏭️ Create custom dashboards
7. ⏭️ Integrate with Storedog application

## Common Commands

```bash
# Apply all manifests
kubectl apply -f k8s-manifests/storedog-app/statefulsets/kafka.yaml
kubectl apply -f k8s-manifests/storedog-app/configmaps/data-streams-config.yaml
kubectl apply -f k8s-manifests/storedog-app/deployments/

# View all data streams resources
kubectl get all -l component=data-streams

# View logs
kubectl logs -l component=data-streams --tail=100 -f

# Restart a deployment
kubectl rollout restart deployment order-validator

# Scale a service
kubectl scale deployment order-producer --replicas=3

# Check status
kubectl get pods -l component=data-streams

# View resource usage
kubectl top pods -l component=data-streams

# Access Kafka container
kubectl exec -it kafka-0 -- bash

# List topics
kubectl exec -it kafka-0 -- kafka-topics.sh --bootstrap-server localhost:9092 --list

# Describe topic
kubectl exec -it kafka-0 -- kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic order-events

# Consumer group status
kubectl exec -it kafka-0 -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group order-validator-group

# Port forward to service
kubectl port-forward svc/order-producer 8080:8080
```

## Resource Usage

Typical resource consumption:
- **CPU:** 2-4 cores
- **Memory:** 4-6 GB
- **Disk:** 2-3 GB (including Kafka data)

## Support

- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Service Definitions**: See [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md)
- **Changes**: See [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)
