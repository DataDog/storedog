# Order Webhook Bridge

HTTP webhook service that receives order events from Storedog backend and publishes them to Kafka as protobuf messages.

## Purpose

Provides integration between Storedog (Rails) and Kafka data streams pipeline:
- Receives HTTP POST webhooks from Storedog when orders are completed
- Transforms JSON order data to OrderEvent protobuf
- Produces messages to Kafka order-events topic
- Enables distributed tracing from Storedog UI through entire pipeline

## Architecture

```
Storedog Backend (Rails)
  │ POST /webhooks/order-created
  ▼
Order Webhook Bridge (Java/Spring Boot)
  │ 1. Receive JSON payload
  │ 2. Transform to OrderEvent protobuf
  │ 3. Produce to Kafka
  ▼
Kafka: order-events topic
  ▼
Data Streams Pipeline
```

## Endpoints

### POST /webhooks/order-created

Receives order completion webhooks from Storedog.

**Request Body:**
```json
{
  "order_id": "R123456789",
  "customer_id": "42",
  "email": "customer@example.com",
  "total": 7999,
  "currency": "USD",
  "items": [
    {
      "product_id": "1",
      "product_name": "Datadog T-Shirt",
      "sku": "TSHIRT-DD-L",
      "quantity": 2,
      "unit_price_cents": 2999
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "country_code": "US"
  },
  "billing_address": { ... },
  "payment_method": "Credit Card",
  "completed_at": "2026-01-26T15:30:00Z"
}
```

**Response (Success):**
```json
{
  "status": "accepted",
  "order_id": "R123456789",
  "message": "Order event sent to Kafka"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "order_id": "R123456789",
  "error": "Kafka connection failed"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "UP",
  "service": "order-webhook-bridge",
  "topics": "order-events"
}
```

### POST /webhooks/test

Test endpoint that creates a minimal test order.

## Configuration

All configuration via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | HTTP server port | `8081` |
| `BOOTSTRAP` | Kafka bootstrap servers | `localhost:9092` |
| `TOPICS_OUT` | Output Kafka topics (comma-separated) | `order-events` |

## Building

```bash
cd app
./gradlew clean build
```

Output: `app/build/libs/*.jar`

## Docker

```bash
# Build image
docker build -t order-webhook-bridge:latest .

# Run locally
docker run -p 8081:8081 \
  -e BOOTSTRAP=kafka:9092 \
  -e TOPICS_OUT=order-events \
  order-webhook-bridge:latest
```

## Testing

### Local Test (with curl)

```bash
# Test webhook endpoint
curl -X POST http://localhost:8081/webhooks/test

# Manual order webhook
curl -X POST http://localhost:8081/webhooks/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST-001",
    "customer_id": "1",
    "email": "test@example.com",
    "total": 9999,
    "currency": "USD",
    "items": [{
      "product_id": "1",
      "product_name": "Test Product",
      "sku": "TEST-SKU",
      "quantity": 1,
      "unit_price_cents": 9999
    }]
  }'

# Health check
curl http://localhost:8081/health
```

### Verify in Kafka

```bash
# Check messages in order-events topic
kubectl exec -it kafka-0 -n storedog -- \
  kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic order-events \
  --from-beginning \
  --max-messages 5
```

## Kubernetes Deployment

See: `k8s-manifests/storedog-app/deployments/order-webhook-bridge.yaml`

## Distributed Tracing

When Datadog APM is enabled on both Storedog backend and this service:

1. Rails controller creates trace
1. HTTP POST to webhook includes trace headers
1. Spring Boot receives request with trace context
1. Kafka producer propagates trace to message headers
1. Consumer services continue the trace

Result: Single flame graph from user click → notification!

## Dependencies

- Java 21
- Spring Boot 3.4.1
- Spring Kafka
- Apache Kafka 3.9.0
- Protobuf 4.29.2

## Related Services

- **Storedog Backend**: Sends webhooks to this service
- **Order Producer**: Synthetic traffic generator (separate)
- **Order Validator**: First consumer in pipeline
