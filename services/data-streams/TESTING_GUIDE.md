# Hybrid Integration - Testing Guide

Complete guide for testing the Storedog → Kafka integration with distributed tracing.

## Architecture Overview

```
┌─────────────────────┐       ┌──────────────────────┐
│   Synthetic Load    │       │    Real Orders       │
│   order-producer    │       │  Storedog Backend    │
│   60 msgs/min       │       │   (Rails)            │
└──────────┬──────────┘       └──────────┬───────────┘
           │                             │
           │                             │ HTTP POST
           │                             ▼
           │                  ┌─────────────────────┐
           │                  │ order-webhook-bridge│
           │                  │  (Java/Spring Boot) │
           │                  └──────────┬──────────┘
           │                             │
           └─────────────┬───────────────┘
                         ▼
                  ┌─────────────┐
                  │ order-events│ Kafka Topic
                  └──────┬──────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │    Data Streams Pipeline     │
          │  order-validator → ...       │
          └──────────────────────────────┘
```

## Prerequisites

1. Kafka running and healthy
1. All proto files compiled
1. Docker images built

## Part 1: Build All Images

### 1.1 Build Producer (Synthetic)
```bash
cd services/data-streams/kafka-producer/files
docker build -t localhost:5000/kafka-producer:latest .
docker push localhost:5000/kafka-producer:latest
```

### 1.2 Build Consumer (Generic)
```bash
cd services/data-streams/kafka-consumer/files
docker build -t localhost:5000/kafka-consumer:latest .
docker push localhost:5000/kafka-consumer:latest
```

### 1.3 Build Webhook Bridge (NEW)
```bash
cd services/data-streams/order-webhook-bridge
docker build -t localhost:5000/order-webhook-bridge:latest .
docker push localhost:5000/order-webhook-bridge:latest
```

### 1.4 Rebuild Backend (with webhook code)
```bash
cd services/backend
docker build -t localhost:5000/backend:latest .
docker push localhost:5000/backend:latest
```

## Part 2: Deploy to Kubernetes

### 2.1 Deploy Kafka
```bash
kubectl apply -f k8s-manifests/storedog-app/statefulsets/kafka.yaml -n storedog
kubectl wait --for=condition=ready pod/kafka-0 -n storedog --timeout=120s
```

### 2.2 Deploy ConfigMap
```bash
kubectl apply -f k8s-manifests/storedog-app/configmaps/data-streams-config.yaml -n storedog
```

### 2.3 Deploy Webhook Bridge
```bash
kubectl apply -f k8s-manifests/storedog-app/deployments/order-webhook-bridge.yaml -n storedog
kubectl wait --for=condition=ready pod -l app=order-webhook-bridge -n storedog --timeout=120s
```

### 2.4 Deploy Synthetic Producer
```bash
kubectl apply -f k8s-manifests/storedog-app/deployments/order-producer.yaml -n storedog
```

### 2.5 Deploy Pipeline Services
```bash
kubectl apply -f k8s-manifests/storedog-app/deployments/order-validator.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/inventory-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/payment-processor.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fulfillment-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/notification-service.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/fraud-detector.yaml -n storedog
kubectl apply -f k8s-manifests/storedog-app/deployments/analytics-aggregator.yaml -n storedog
```

### 2.6 Update Backend Deployment
```bash
# Enable webhook integration
kubectl set env deployment/backend \
  ORDER_WEBHOOK_ENABLED=true \
  ORDER_WEBHOOK_URL=http://order-webhook-bridge:8081 \
  -n storedog

# Wait for rollout
kubectl rollout status deployment/backend -n storedog
```

## Part 3: Verify Deployment

### 3.1 Check All Pods Running
```bash
kubectl get pods -l component=data-streams -n storedog

# Expected output (all Running):
# order-producer-xxx          1/1     Running
# order-webhook-bridge-xxx    1/1     Running
# order-validator-xxx         1/1     Running
# inventory-service-xxx       1/1     Running
# payment-processor-xxx       1/1     Running
# fulfillment-service-xxx     1/1     Running
# notification-service-xxx    1/1     Running
# fraud-detector-xxx          1/1     Running
# analytics-aggregator-xxx    1/1     Running
```

### 3.2 Check Kafka Topics Created
```bash
kubectl exec -it kafka-0 -n storedog -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --list

# Expected topics:
# order-events
# validated-orders
# invalid-orders
# inventory-reserved
# inventory-unavailable
# payment-confirmed
# payment-failed
# order-fulfilled
# fulfillment-failed
# shipment-created
```

### 3.3 Check Webhook Bridge Health
```bash
kubectl port-forward svc/order-webhook-bridge 8081:8081 -n storedog &
curl http://localhost:8081/health

# Expected:
# {"status":"UP","service":"order-webhook-bridge","topics":"order-events"}
```

## Part 4: Test Synthetic Traffic

### 4.1 Check Producer Logs
```bash
kubectl logs -l app=order-producer -n storedog --tail=20

# Expected output:
# Producing order message on topic: order-events
# Order ORD-a1b2c3d4 sent to topic: order-events
# 100 messages sent on topic: order-events
```

### 4.2 Verify Messages in Kafka
```bash
kubectl exec -it kafka-0 -n storedog -- \
  kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic order-events \
  --from-beginning \
  --max-messages 3

# Should see protobuf binary data (not human readable)
```

### 4.3 Check Consumer Processing
```bash
kubectl logs -l app=order-validator -n storedog --tail=20

# Expected output:
# [a1b2c3d4] Received message (245 bytes)
# [a1b2c3d4] Processing order: ORD-a1b2c3d4 for customer: CUST-482915
# [a1b2c3d4] Forwarded to topic: validated-orders
# [a1b2c3d4] Successfully processed in 87ms
```

## Part 5: Test Webhook Bridge (Manual)

### 5.1 Test Endpoint
```bash
# Forward webhook bridge port
kubectl port-forward svc/order-webhook-bridge 8081:8081 -n storedog &

# Send test webhook
curl -X POST http://localhost:8081/webhooks/test

# Expected response:
# {
#   "status": "accepted",
#   "order_id": "TEST-1737907200000",
#   "message": "Order event sent to Kafka"
# }
```

### 5.2 Send Manual Order Webhook
```bash
curl -X POST http://localhost:8081/webhooks/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "R123456789",
    "customer_id": "42",
    "email": "customer@storedog.com",
    "total": 7999,
    "currency": "USD",
    "items": [
      {
        "product_id": "1",
        "product_name": "Datadog T-Shirt",
        "sku": "TSHIRT-DD-L",
        "quantity": 2,
        "unit_price_cents": 2999
      },
      {
        "product_id": "3",
        "product_name": "APM Coffee Mug",
        "sku": "MUG-APM",
        "quantity": 1,
        "unit_price_cents": 1999
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
    "billing_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "United States",
      "country_code": "US"
    },
    "payment_method": "Credit Card",
    "completed_at": "2026-01-26T15:30:00Z"
  }'

# Expected response:
# {
#   "status": "accepted",
#   "order_id": "R123456789",
#   "message": "Order event sent to Kafka"
# }
```

### 5.3 Check Webhook Bridge Logs
```bash
kubectl logs -l app=order-webhook-bridge -n storedog --tail=30

# Expected output:
# === Received webhook for order: R123456789 ===
# Customer: 42, Email: customer@storedog.com
# Items: 2, Total: 79.99 USD
# Transforming order: R123456789 from Storedog to protobuf
# Transformed order R123456789 with 2 items, total: 79.99 USD
# ✓ Sent order R123456789 to Kafka topic: order-events
```

### 5.4 Verify Webhook Message Processed
```bash
# Check if order-validator picked it up
kubectl logs -l app=order-validator -n storedog | grep R123456789

# Expected:
# Processing order: R123456789 for customer: 42
# ✓ Forwarded to topic: validated-orders
```

## Part 6: Test Real Storedog Orders

### 6.1 Access Storedog UI
```bash
# Get frontend URL
kubectl get svc frontend -n storedog

# Open in browser
open http://<frontend-ip>:3000
```

### 6.2 Complete an Order
1. Browse products
1. Add items to cart
1. Go to checkout
1. Fill in shipping address:
   - Address: 123 Test Street
   - City: New York
   - State: NY
   - Zip: 10001
1. Enter credit card:
   - Number: 4111111111111111
   - Exp: 12/28
   - CVV: 123
1. Click "Complete Order"

### 6.3 Check Backend Logs for Webhook
```bash
kubectl logs -l app=backend -n storedog --tail=50 | grep -A 5 webhook

# Expected output:
# Order webhook integration enabled
# Webhook URL: http://order-webhook-bridge:8081
# Order R987654321 completed, queuing webhook job
# Processing webhook for order: R987654321
# ✓ Order webhook sent for R987654321: 200
```

### 6.4 Verify in Webhook Bridge
```bash
kubectl logs -l app=order-webhook-bridge -n storedog | grep R987654321

# Expected:
# === Received webhook for order: R987654321 ===
# Customer: 42, Email: customer@storedog.com
# Items: 1, Total: 29.99 USD
# ✓ Sent order R987654321 to Kafka topic: order-events
```

### 6.5 Verify Pipeline Processing
```bash
# Check each service processed the real order
kubectl logs -l app=order-validator -n storedog | grep R987654321
kubectl logs -l app=inventory-service -n storedog | grep R987654321
kubectl logs -l app=payment-processor -n storedog | grep R987654321
kubectl logs -l app=fulfillment-service -n storedog | grep R987654321
kubectl logs -l app=notification-service -n storedog | grep R987654321

# Each should show processing logs
```

## Part 7: Traffic Mix Verification

### 7.1 Compare Traffic Sources
```bash
# Count synthetic orders (ORD- prefix)
kubectl exec -it kafka-0 -n storedog -- \
  kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic order-events \
  --from-beginning \
  --max-messages 100 | wc -l

# Check validator processed count
kubectl logs -l app=order-validator -n storedog | grep "Successfully processed" | wc -l
```

### 7.2 Expected Traffic Mix
After 1 minute of operation:
- Synthetic: ~60 orders (ORD-xxxxxxxx)
- Real: 1-3 orders (R##########)
- Total: ~61-63 orders

## Part 8: Troubleshooting

### 8.1 Webhook Bridge Not Receiving Requests

**Check backend env vars:**
```bash
kubectl exec deployment/backend -n storedog -- env | grep WEBHOOK

# Should show:
# ORDER_WEBHOOK_ENABLED=true
# ORDER_WEBHOOK_URL=http://order-webhook-bridge:8081
```

**Check initializer loaded:**
```bash
kubectl logs -l app=backend -n storedog | grep "webhook integration"

# Should show:
# Order webhook integration enabled
```

**Test connectivity:**
```bash
kubectl exec deployment/backend -n storedog -- \
  curl -v http://order-webhook-bridge:8081/health
```

### 8.2 Webhook Timeouts

**Check webhook bridge ready:**
```bash
kubectl get pods -l app=order-webhook-bridge -n storedog

# Should be Running and Ready 1/1
```

**Check Kafka connectivity from bridge:**
```bash
kubectl logs -l app=order-webhook-bridge -n storedog | grep -i kafka

# Should show successful connection
```

### 8.3 Orders Not Creating Webhooks

**Check Spree order state transitions:**
```bash
kubectl logs -l app=backend -n storedog | grep "transition.*complete"
```

**Check Sidekiq processing:**
```bash
kubectl exec deployment/backend -n storedog -- \
  bundle exec rails runner "puts Sidekiq::Queue.new.size"

# Should be 0 or low number (jobs processing quickly)
```

### 8.4 Messages Not in Kafka

**Check topic exists:**
```bash
kubectl exec -it kafka-0 -n storedog -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic order-events
```

**Check producer logs:**
```bash
kubectl logs -l app=order-webhook-bridge -n storedog | grep -i error
```

## Part 9: Datadog Verification (After APM Enabled)

Once learners enable Datadog APM in the lab:

### 9.1 APM Service Map
Navigate to: **APM → Service Map**

Expected services:
- frontend (React)
- backend (Rails)
- order-webhook-bridge (Java)
- kafka
- order-validator (Java)
- inventory-service (Java)
- payment-processor (Java)
- fulfillment-service (Java)
- notification-service (Java)

### 9.2 Distributed Traces
Navigate to: **APM → Traces**

Search for: `service:backend operation_name:checkout`

Select a trace from a real order → Should show:
1. GET /products
1. POST /api/checkout
   1. Spree::Order validation
   1. Payment processing
   1. OrderWebhookJob
   1. HTTP POST → order-webhook-bridge
      1. Kafka produce
      1. order-validator
         1. inventory-service
            1. payment-processor
               1. fulfillment-service
                  1. notification-service

**End-to-end latency:** ~1.5-2 seconds

### 9.3 Data Streams Monitoring
Navigate to: **Data Streams → Pathways**

Expected pathway:
```
order-producer ┐
               ├→ order-events → order-validator → validated-orders → ...
order-webhook-bridge ┘
```

Metrics:
- **Throughput:** ~60 msg/sec
- **Latency P50:** ~500ms
- **Latency P99:** ~1500ms
- **Consumer Lag:** < 10 messages

### 9.4 Verify Real Order Traces
1. Complete order in Storedog UI
1. Note order number (e.g., R987654321)
1. Search in APM: `@order_id:R987654321`
1. Verify trace spans through entire pipeline

## Success Criteria

✅ All pods running and healthy
✅ Synthetic producer generating 60 msg/min
✅ Webhook bridge responding to health checks
✅ Manual webhook test succeeds
✅ Real Storedog orders trigger webhooks
✅ Backend logs show webhook jobs
✅ Webhook bridge logs show transformations
✅ All pipeline services processing messages
✅ Both synthetic and real orders in Kafka
✅ (After APM) Distributed traces visible in Datadog
✅ (After APM) Service map connects all services
✅ (After DSM) Pipeline pathway visualization working

## Summary

This integration provides:
- **High-volume synthetic traffic** for baseline DSM visualization
- **Real traced orders** from Storedog for end-to-end distributed tracing
- **Combined view** in Datadog showing both synthetic load and real user flows
- **Perfect lab environment** for learning both APM and DSM concepts
