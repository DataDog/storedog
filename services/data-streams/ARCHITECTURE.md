# Data Streams Architecture - Storedog E-commerce

## Overview

This is a **definition-driven Kafka architecture** for the Storedog e-commerce application. Rather than building separate codebases for each service, we use:

- **1 generic producer codebase** that can generate any type of event
- **1 generic consumer codebase** that can consume, process, and forward messages
- **Service definition YAML files** that configure the behavior of each service instance

## Why This Approach?

### ✅ Advantages
1. **Single source of truth** - All services use the same code
2. **Easy maintenance** - Bug fixes apply to all services
3. **Quick iteration** - Add new services by creating a YAML file
4. **Consistent behavior** - All services handle errors, logging, metrics the same way
5. **Configuration-driven** - No code changes needed for new pipelines

### ❌ Trade-offs
1. All services share the same dependencies
2. Complex service-specific logic requires code changes
3. Less flexibility for highly customized services

For a **learning lab environment** demonstrating Data Streams Monitoring, these trade-offs are acceptable.

## Architecture Diagram

```
┌─────────────────┐
│  order-producer │
└────────┬────────┘
         │ order-events
         ▼
┌─────────────────┐     ┌──────────────────┐
│ order-validator ├────►│ fraud-detector   │ (parallel)
└────────┬────────┘     └──────────────────┘
         │ validated-orders
         ▼
┌─────────────────┐
│inventory-service│
└────────┬────────┘
         │ inventory-reserved
         ▼
┌─────────────────┐     ┌──────────────────┐
│payment-processor├────►│ fraud-detector   │ (parallel)
└────────┬────────┘     └──────────────────┘
         │ payment-confirmed
         ▼
┌─────────────────┐
│fulfillment-svc  │
└────────┬────────┘
         │ order-fulfilled
         ▼
    ┌────┴─────┬──────────────┐
    ▼          ▼              ▼
┌────────┐ ┌──────────┐ ┌─────────┐
│notif   │ │analytics │ │(others) │
│service │ │aggregator│ │         │
└────────┘ └──────────┘ └─────────┘
```

## Service Definitions

### Producer Services
Services that only **produce** messages:

| Service | Produces To | Purpose |
|---------|-------------|---------|
| order-producer | order-events | Simulates order creation from Storedog frontend/backend |

### Consumer-Producer Services
Services that **consume, process, and forward** messages:

| Service | Consumes From | Produces To | Purpose |
|---------|---------------|-------------|---------|
| order-validator | order-events | validated-orders, invalid-orders | Validates order structure |
| inventory-service | validated-orders | inventory-reserved, inventory-unavailable | Reserves inventory |
| payment-processor | inventory-reserved | payment-confirmed, payment-failed | Processes payments |
| fraud-detector | order-events, payment-confirmed | fraud-alerts, order-events-analyzed | Detects fraud (parallel) |
| fulfillment-service | payment-confirmed | order-fulfilled, shipment-created, warehouse-assigned | Creates shipments |

### Consumer-Only Services
Services that only **consume** messages (terminal nodes):

| Service | Consumes From | Purpose |
|---------|---------------|---------|
| notification-service | order-fulfilled, shipment-created, payment-failed, inventory-unavailable, fraud-alerts | Sends customer notifications |
| analytics-aggregator | order-events, order-fulfilled, payment-confirmed, fraud-alerts | Aggregates for reporting |

## How Services Are Configured

Each service instance is configured via **environment variables** in Docker Compose or Kubernetes:

```yaml
environment:
  # Service identity
  - DD_SERVICE_NAME=order-validator
  
  # Kafka topics
  - TOPICS_IN=order-events
  - TOPICS_OUT=validated-orders,invalid-orders
  - CONSUMER_GROUP=order-validator-group
  
  # Processing behavior
  - PROCESSING_TIME_MS_MIN=50
  - PROCESSING_TIME_MS_MAX=100
  - ERROR_RATE_PERCENT=2
  
  # Datadog
  - DD_DATA_STREAMS_ENABLED=true
  - DD_TAGS=service_type:validation,pipeline_stage:order_validation
```

## Message Flow Examples

### Happy Path: Successful Order
```
1. order-producer → order-events
2. order-validator → validated-orders
3. inventory-service → inventory-reserved
4. payment-processor → payment-confirmed
5. fulfillment-service → order-fulfilled
6. notification-service (consumes, sends email)
```

**End-to-end latency:** ~1000-1500ms

### Parallel Fraud Detection
```
order-events ───┬──→ order-validator → ...
                │
                └──→ fraud-detector → fraud-alerts
```

Fraud detection runs in parallel with main flow.

### Analytics Aggregation
```
Multiple topics → analytics-aggregator
(no forwarding, just aggregation)
```

## Data Streams Monitoring Metrics

What you'll see in Datadog DSM:

1. **End-to-end latency**
   - order-producer → notification-service
   - order-producer → analytics-aggregator
   - Broken down by pathway

2. **Consumer lag**
   - Per consumer group
   - Per partition
   - Per topic

3. **Throughput**
   - Messages per second
   - Bytes per second
   - By service and topic

4. **Pipeline health**
   - Bottleneck detection
   - Service dependencies
   - Error rates

## Protobuf Schemas

All messages use Protocol Buffers for:
- Efficient serialization
- Schema evolution
- Type safety
- Language agnostic

**Schema files:**
- `order_event.proto` - Orders with line items, addresses, payment
- `inventory_event.proto` - Inventory reservations
- `payment_event.proto` - Payment processing
- `fraud_event.proto` - Fraud detection results
- `fulfillment_event.proto` - Shipment tracking
- `notification_event.proto` - Customer notifications

## Integration with Storedog

### Option 1: Webhook Listener (Recommended)
Create a new service that:
1. Listens for webhooks from Storedog backend
2. Converts to Protobuf
3. Produces to `order-events` topic

```
Storedog Backend → Webhook → order-events-bridge → order-events
```

### Option 2: Direct Integration
Modify Storedog backend to:
1. Produce Kafka messages on order creation
2. Use the same Protobuf schemas

## Running the System

### Kubernetes (Primary Deployment)

See the [k8s-manifests README - Data Streams Monitoring section](../../k8s-manifests/README.md#data-streams-monitoring) for detailed K8s deployment instructions.

Quick deploy:
```bash
# Deploy Kafka
kubectl apply -f k8s-manifests/storedog-app/statefulsets/kafka.yaml -n storedog

# Deploy ConfigMap
kubectl apply -f k8s-manifests/storedog-app/configmaps/data-streams-config.yaml -n storedog

# Deploy all services
kubectl apply -f k8s-manifests/storedog-app/deployments/order-producer.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/order-validator.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/inventory-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/payment-processor.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/notification-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml -n storedog
```

### Docker Compose (Alternative for Development)

For local development or backporting to non-K8s Storedog deployments:

```bash
cd services/data-streams

# Set Datadog API key (optional)
export DD_API_KEY=your_api_key

# Start all services
docker compose up -d
```

See [DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md) for details.

### Viewing Metrics
1. Go to Datadog Data Streams Monitoring
2. Select env: `production` (or your configured env)
3. View the pipeline topology
4. Drill into pathway latencies

## Next Steps

1. ✅ ~~Update directory structure~~
2. ✅ ~~Create service definitions~~
3. ✅ ~~Update dependencies to latest versions~~
4. ✅ ~~Create Protobuf schemas~~
5. ✅ ~~Create Kubernetes manifests~~
6. ⏳ Update Java code to use new schemas
7. ⏳ Implement YAML service definition loader
8. ⏳ Build and push Docker images
9. ⏳ Test end-to-end pipeline
10. ⏳ Create integration with Storedog backend

## Files Structure

```
data-streams/
├── README.md                          # Overview
├── ARCHITECTURE.md                    # This file
├── SERVICE_DEFINITIONS.md             # Service config reference
├── PIPELINE_DIAGRAM.md                # Visual diagrams
├── PROJECT_SUMMARY.md                 # Complete overview
├── REFACTORING_SUMMARY.md             # Change log
├── QUICKSTART.md                      # K8s deployment guide
├── INDEX.md                           # Documentation index
├── service-definitions/               # Service YAML configs
│   ├── order-producer.yml
│   ├── order-validator.yml
│   ├── inventory-service.yml
│   ├── payment-processor.yml
│   ├── fraud-detector.yml
│   ├── fulfillment-service.yml
│   ├── notification-service.yml
│   └── analytics-aggregator.yml
├── kafka-producer/                    # Generic producer
│   └── files/
│       ├── Dockerfile
│       └── app/
│           ├── build.gradle
│           └── src/main/
│               ├── java/
│               └── proto/              # Protobuf schemas
└── kafka-consumer/                     # Generic consumer
    └── files/
        ├── Dockerfile
        └── app/
            ├── build.gradle
            └── src/main/
                ├── java/
                └── proto/              # Protobuf schemas

K8s Manifests (separate location):
../../k8s-manifests/storedog-app/
├── configmaps/
│   └── data-streams-config.yaml
├── statefulsets/
│   └── kafka.yaml
└── deployments/
    ├── order-producer.yaml
    ├── order-validator.yaml
    ├── inventory-service.yaml
    ├── payment-processor.yaml
    ├── fraud-detector.yaml
    ├── fulfillment-service.yaml
    ├── notification-service.yaml
    └── analytics-aggregator.yaml
```

## Questions?

For questions about:
- **Architecture**: See this file
- **Changes made**: See `REFACTORING_SUMMARY.md`
- **Running locally**: See `README.md`
- **Service configuration**: See `service-definitions/*.yml`
