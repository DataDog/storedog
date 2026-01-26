# Hybrid Integration - Storedog to Kafka with Trace Propagation

## Overview

This implementation connects Storedog backend (Rails) to the Kafka data streams pipeline while maintaining synthetic traffic generation. You'll see **distributed traces** flow from Storedog through the entire Kafka pipeline in Datadog APM + DSM.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SYNTHETIC TRAFFIC (High Volume)              │
│                                                                  │
│  order-producer (standalone Java)                               │
│    └─> 60 messages/minute (configurable)                        │
│        └─> Generates realistic OrderEvent protobuf              │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ order-events │ Kafka Topic
                    └──────────────┘
                           ▲
┌──────────────────────────┴───────────────────────────────────────┐
│                     REAL TRAFFIC (with Traces)                   │
│                                                                  │
│  Storedog Backend (Rails)                                       │
│    └─> User creates order via UI                                │
│        └─> POST /api/v2/storefront/checkout (APM traced)        │
│            └─> order-webhook-bridge (Java)                      │
│                └─> Kafka Producer (propagates trace context)    │
│                    └─> OrderEvent protobuf with trace headers   │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ order-events │ Kafka Topic
                    └──────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     KAFKA PIPELINE (traced)                      │
│                                                                  │
│  order-validator → inventory → payment → fulfillment → notify   │
│    (All services continue trace from Storedog)                  │
└──────────────────────────────────────────────────────────────────┘
```

**Result in Datadog:**
- **APM Flame Graph** shows: Storedog → Webhook Bridge → Kafka → Pipeline
- **DSM** shows: Message flow, latency, and lag
- **Service Map** connects Rails + Java services

---

## Implementation Components

### 1. Order Webhook Bridge Service (NEW)

A lightweight Java service that:
1. Receives HTTP POST from Storedog
2. Extracts Datadog trace context from headers
3. Transforms JSON to OrderEvent protobuf
4. Produces to Kafka with trace context propagation
5. Returns success/failure to Storedog

**Why Java?**
- Reuses existing Kafka/Protobuf setup
- Native Datadog APM support
- Trace propagation is automatic

---

### 2. Storedog Backend Changes

Add HTTP webhook call after order completion:
1. Add `net-http` webhook client
2. Create `OrderWebhookService` 
3. Hook into Spree order state machine
4. Transform Spree::Order to JSON
5. POST to webhook bridge
6. Handle failures gracefully (fire-and-forget)

**Minimal Changes:**
- 1 new service class
- 1 initializer
- 1 callback hook
- No gem dependencies needed

---

## Detailed Implementation

### Component 1: Order Webhook Bridge (Java)

#### File Structure
```
services/data-streams/order-webhook-bridge/
├── Dockerfile
└── app/
    ├── build.gradle
    ├── .java-version
    └── src/main/java/com/storedog/webhook/
        ├── WebhookApplication.java
        ├── controller/
        │   └── OrderWebhookController.java
        ├── model/
        │   └── StoredogOrderPayload.java
        ├── service/
        │   └── OrderTransformer.java
        └── config/
            └── KafkaConfig.java
```

#### Key Features
```java
@RestController
public class OrderWebhookController {
    
    @PostMapping("/webhooks/order-created")
    public ResponseEntity<Map<String, String>> handleOrderCreated(
        @RequestBody StoredogOrderPayload payload,
        @RequestHeader Map<String, String> headers
    ) {
        // 1. Extract Datadog trace context from headers
        //    (x-datadog-trace-id, x-datadog-parent-id, x-datadog-sampling-priority)
        
        // 2. Transform Storedog JSON → OrderEvent protobuf
        OrderEvent orderEvent = orderTransformer.transform(payload);
        
        // 3. Produce to Kafka (Datadog Java agent propagates trace automatically)
        kafkaTemplate.send("order-events", orderEvent.toByteArray());
        
        // 4. Return success
        return ResponseEntity.ok(Map.of("status", "accepted"));
    }
}
```

**Trace Propagation:**
- Datadog Java agent automatically extracts trace context from HTTP headers
- Automatically injects trace context into Kafka message headers
- Consumer services continue the trace automatically

---

### Component 2: Storedog Backend Integration

#### File: `app/services/order_webhook_service.rb` (NEW)

```ruby
class OrderWebhookService
  include HTTParty
  
  base_uri ENV.fetch('ORDER_WEBHOOK_URL', 'http://order-webhook-bridge:8081')
  
  def self.send_order_created(order)
    return unless enabled?
    
    payload = build_payload(order)
    
    # Fire-and-forget with timeout
    post_with_timeout('/webhooks/order-created', payload)
  rescue => e
    # Log error but don't fail order
    Rails.logger.error("Order webhook failed: #{e.message}")
  end
  
  private
  
  def self.enabled?
    ENV['ORDER_WEBHOOK_ENABLED'] == 'true'
  end
  
  def self.build_payload(order)
    {
      order_id: order.number,
      customer_id: order.user_id.to_s,
      email: order.email,
      total: (order.total * 100).to_i, # Convert to cents
      currency: order.currency,
      items: order.line_items.map do |item|
        {
          product_id: item.variant.product.id.to_s,
          product_name: item.variant.product.name,
          sku: item.variant.sku,
          quantity: item.quantity,
          unit_price_cents: (item.price * 100).to_i
        }
      end,
      shipping_address: address_hash(order.ship_address),
      billing_address: address_hash(order.bill_address),
      payment_method: order.payments.first&.payment_method&.name,
      completed_at: order.completed_at&.iso8601
    }
  end
  
  def self.address_hash(address)
    return nil unless address
    
    {
      street: "#{address.address1} #{address.address2}".strip,
      city: address.city,
      state: address.state_text,
      postal_code: address.zipcode,
      country: address.country.name,
      country_code: address.country.iso
    }
  end
  
  def self.post_with_timeout(path, payload)
    # Datadog APM will automatically add trace headers
    response = post(
      path,
      body: payload.to_json,
      headers: { 'Content-Type' => 'application/json' },
      timeout: 2 # 2 second timeout
    )
    
    Rails.logger.info("Order webhook sent: #{response.code}")
  rescue Net::OpenTimeout, Net::ReadTimeout
    Rails.logger.warn("Order webhook timeout")
  end
end
```

#### File: `config/initializers/order_webhook.rb` (NEW)

```ruby
# Subscribe to order state machine transitions
# This hooks into Spree's existing order flow
Rails.application.config.to_prepare do
  # Hook into the 'complete' state transition
  Spree::Order.state_machine.after_transition(to: :complete) do |order, transition|
    # Send webhook asynchronously to not block order completion
    OrderWebhookJob.perform_later(order.id) if order.persisted?
  end
end
```

#### File: `app/jobs/order_webhook_job.rb` (NEW)

```ruby
class OrderWebhookJob < ApplicationJob
  queue_as :default
  
  def perform(order_id)
    order = Spree::Order.find(order_id)
    OrderWebhookService.send_order_created(order)
  rescue ActiveRecord::RecordNotFound => e
    Rails.logger.error("Order not found for webhook: #{order_id}")
  end
end
```

---

## Kubernetes Deployment

### 1. Order Webhook Bridge Deployment

**File: `k8s-manifests/storedog-app/deployments/order-webhook-bridge.yaml`**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-webhook-bridge
spec:
  ports:
    - port: 8081
      targetPort: 8081
      name: http
  selector:
    app: order-webhook-bridge
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-webhook-bridge
  labels:
    app: order-webhook-bridge
    component: data-streams
    service-type: bridge
spec:
  replicas: 1
  selector:
    matchLabels:
      app: order-webhook-bridge
  template:
    metadata:
      labels:
        app: order-webhook-bridge
        component: data-streams
        team: integration
      annotations:
        ad.datadoghq.com/order-webhook-bridge.logs: '[{"source": "java"}]'
    spec:
      initContainers:
        - name: wait-for-kafka
          image: busybox:1.37.0
          command: ['sh', '-c', 'until nc -z kafka 9092; do echo waiting for kafka; sleep 2; done;']
      containers:
        - name: order-webhook-bridge
          image: localhost:5000/order-webhook-bridge:latest
          ports:
            - containerPort: 8081
          env:
            - name: SERVER_PORT
              value: "8081"
            - name: BOOTSTRAP
              valueFrom:
                configMapKeyRef:
                  name: data-streams-config
                  key: KAFKA_BOOTSTRAP_SERVERS
            - name: TOPICS_OUT
              value: "order-events"
            - name: DD_ENV
              valueFrom:
                configMapKeyRef:
                  name: data-streams-config
                  key: DD_ENV
            - name: DD_DATA_STREAMS_ENABLED
              value: "true"
            - name: DD_SERVICE_NAME
              value: "order-webhook-bridge"
            - name: DD_VERSION
              value: "1.0.0"
            - name: DD_TAGS
              value: "service_type:bridge,pipeline_stage:ingestion"
          resources:
            requests:
              memory: "384Mi"
              cpu: "200m"
            limits:
              memory: "768Mi"
              cpu: "400m"
```

### 2. Update Backend Deployment

**Update: `k8s-manifests/storedog-app/deployments/backend.yaml`**

Add environment variables:
```yaml
- name: ORDER_WEBHOOK_ENABLED
  value: "true"
- name: ORDER_WEBHOOK_URL
  value: "http://order-webhook-bridge:8081"
```

---

## Trace Propagation Flow

```
1. User clicks "Complete Order" in Storedog UI
   └─> Frontend makes API call with trace context
   
2. Backend Rails Controller (traced by ddtrace-rb)
   └─> Spree::CheckoutController#update
       └─> Order state: payment → complete
           └─> after_transition callback fires
               └─> OrderWebhookJob queued (trace continues)
   
3. Sidekiq Worker (traced)
   └─> OrderWebhookJob#perform
       └─> OrderWebhookService.send_order_created
           └─> HTTP POST to webhook-bridge (trace propagated via headers)
   
4. Webhook Bridge (traced by dd-java-agent)
   └─> OrderWebhookController receives request
       └─> Extracts trace context from headers ✓
       └─> Transforms JSON → Protobuf
       └─> Produces to Kafka (trace injected into headers) ✓
   
5. Kafka Message (contains trace context)
   └─> Message headers include:
       - x-datadog-trace-id
       - x-datadog-parent-id
       - x-datadog-sampling-priority
   
6. Order Validator (traced by dd-java-agent)
   └─> MessageListener consumes message
       └─> Extracts trace context from Kafka headers ✓
       └─> Continues trace
       └─> Forwards to downstream topics (trace preserved) ✓
   
7-10. Rest of pipeline (inventory, payment, fulfillment, notification)
   └─> Each service continues the same trace ✓

RESULT: Single flame graph from UI click → final notification!
```

---

## Configuration Summary

### Environment Variables

#### Storedog Backend (add to backend.yaml)
```yaml
ORDER_WEBHOOK_ENABLED: "true"
ORDER_WEBHOOK_URL: "http://order-webhook-bridge:8081"
```

#### Order Webhook Bridge
```yaml
SERVER_PORT: "8081"
BOOTSTRAP: "kafka:9092"
TOPICS_OUT: "order-events"
DD_SERVICE_NAME: "order-webhook-bridge"
DD_DATA_STREAMS_ENABLED: "true"
```

#### Order Producer (synthetic, keep as-is)
```yaml
TOPICS_OUT: "order-events"
MESSAGES_PER_MINUTE: "60"
DD_SERVICE_NAME: "order-producer"
```

---

## Traffic Mix

### Synthetic Traffic (99% of volume)
- **Source:** order-producer (standalone)
- **Rate:** 60 messages/minute (configurable)
- **Purpose:** Baseline load for DSM visualization
- **Traces:** Independent synthetic traces

### Real Traffic (1% of volume)
- **Source:** Storedog UI orders → webhook bridge
- **Rate:** ~1-5 orders per demo
- **Purpose:** Show end-to-end distributed traces
- **Traces:** Real user traces from frontend → backend → Kafka → pipeline

**Combined:** Pipeline processes ~60 msg/min, where 1-5 show full traces from Storedog

---

## Datadog Visibility

### APM Service Map
```
frontend (React)
  └─> backend (Rails)
      └─> order-webhook-bridge (Java)
          └─> kafka
              └─> order-validator (Java)
                  └─> inventory-service (Java)
                      └─> payment-processor (Java)
                          └─> fulfillment-service (Java)
                              └─> notification-service (Java)
```

### Data Streams Monitoring
- **Producer:** order-producer + order-webhook-bridge → order-events
- **Pipeline:** All 8 services with latency metrics
- **Consumer Lag:** Real-time lag monitoring
- **Throughput:** Combined synthetic + real traffic

### Flame Graph (Real Orders Only)
```
GET /products                    [5ms]
POST /api/checkout              [850ms]
  ├─ Spree::Order validation     [50ms]
  ├─ Payment processing         [150ms]
  ├─ OrderWebhookJob            [10ms]
  └─ HTTP → webhook-bridge      [640ms]
      └─ Kafka produce          [5ms]
      └─ order-validator        [87ms]
          └─ inventory-service  [143ms]
              └─ payment-proc   [287ms]
                  └─ fulfillment [198ms]
                      └─ notify  [523ms]
```

Total end-to-end: ~1.5 seconds from UI click to notification

---

## Implementation Checklist

### Phase 1: Webhook Bridge Service ✅
- [ ] Create Java Spring Boot application
- [ ] Add `/webhooks/order-created` endpoint
- [ ] Implement JSON → Protobuf transformer
- [ ] Configure Kafka producer
- [ ] Build Dockerfile
- [ ] Create K8s deployment manifest
- [ ] Test standalone (curl → Kafka)

### Phase 2: Storedog Integration ✅
- [ ] Create `OrderWebhookService` class
- [ ] Create `OrderWebhookJob` class
- [ ] Create `order_webhook.rb` initializer
- [ ] Update backend Dockerfile (no changes needed)
- [ ] Update backend K8s deployment (add env vars)
- [ ] Test in development (complete order → webhook)

### Phase 3: Deployment & Testing ✅
- [ ] Build webhook-bridge image
- [ ] Push to local registry
- [ ] Deploy webhook-bridge to K8s
- [ ] Update backend with env vars
- [ ] Restart backend pods
- [ ] Complete test order in Storedog UI
- [ ] Verify webhook call in logs
- [ ] Verify message in Kafka
- [ ] Verify pipeline processing

### Phase 4: Datadog Validation ✅
- [ ] Verify trace in APM (frontend → backend → bridge → pipeline)
- [ ] Verify DSM shows both producers
- [ ] Verify service map connects all services
- [ ] Verify latency metrics
- [ ] Create dashboard showing synthetic vs real traffic

---

## Estimated Effort

| Component | Time | Complexity |
|-----------|------|------------|
| Webhook Bridge (Java) | 4-6 hours | Medium |
| Storedog Integration (Rails) | 2-3 hours | Low |
| K8s Manifests | 1 hour | Low |
| Testing & Debugging | 2-4 hours | Medium |
| **Total** | **9-14 hours** | **1-2 days** |

---

## Next Steps

**Would you like me to:**

1. ✅ **Start implementing the webhook bridge service** (Java Spring Boot app)
2. ✅ **Create the Storedog Rails integration files** (service, job, initializer)
3. ✅ **Create K8s deployment manifests** for the bridge
4. ✅ **Create a complete testing guide**
5. ✅ **All of the above** (complete implementation)

**Recommendation:** Implement all components now, then test after images are built in lab VM.
