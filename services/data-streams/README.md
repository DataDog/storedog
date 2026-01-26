# Data Streams - Kafka Event Processing for Storedog

This directory contains generic Kafka producer and consumer services that simulate an e-commerce event-driven architecture for the Storedog application.

## Architecture

The system uses a generic codebase approach where service behavior is defined through configuration files rather than separate codebases:

- **kafka-producer**: Generic producer service that can be configured to produce events to any topic
- **kafka-consumer**: Generic consumer service that can consume from topics, process messages, and forward to downstream topics
- **service-definitions**: YAML files that define the behavior and configuration of each service instance

## Service Definitions

Services are defined in `service-definitions/` directory. Each YAML file defines:

- Service name and metadata
- Input/output topics
- Message processing behavior
- Consumer group configuration
- Error handling rules

## E-commerce Pipeline Flow

```
Order Processing Flow:
1. order-created-producer → order-events (topic)
2. order-validator (consumer/producer) → validated-orders (topic)
3. inventory-service (consumer/producer) → inventory-reserved (topic)
4. payment-processor (consumer/producer) → payment-confirmed (topic)
5. fraud-detector (consumer/producer) → fraud-alerts (topic)
6. fulfillment-service (consumer/producer) → order-fulfilled (topic)
7. notification-service (consumer) → sends notifications

Analytics Flow:
- order-events → analytics-aggregator (consumer only)
- inventory-reserved → warehouse-allocation (topic)
```

## Technology Stack

- **Java 21** (LTS)
- **Spring Boot 3.4.1**
- **Spring Kafka 3.3.0**
- **Apache Kafka 3.9.0**
- **Protobuf 4.29.2**
- **Gradle 8.x**

## Message Format

All messages use Protocol Buffers (Protobuf) for efficient serialization and schema evolution.

## Datadog Integration

Services are instrumented for Datadog Data Streams Monitoring to track:
- End-to-end latency between services
- Consumer lag per topic
- Throughput and message rates
- Pipeline health and bottlenecks

**Note**: Datadog APM agent is NOT included in the base images. This will be added via Kubernetes injection in the deployment phase.

## Building Services

```bash
# Build producer
cd kafka-producer/files/app
./gradlew build

# Build consumer
cd kafka-consumer/files/app
./gradlew build
```

## Docker Images

```bash
# Build images
docker build -t storedog/kafka-producer:1.0.0 kafka-producer/files/
docker build -t storedog/kafka-consumer:1.0.0 kafka-consumer/files/
docker build -t storedog/order-webhook-bridge:1.0.0 order-webhook-bridge/files/
```

## Running in Kubernetes

See `../../k8s-manifests/README.md#data-streams-monitoring` for Kubernetes deployment manifests and instructions.

## Running with Docker Compose (Alternative)

See `DOCKER_COMPOSE.md` for Docker Compose deployment instructions (useful for local development).
