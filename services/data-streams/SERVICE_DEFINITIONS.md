# Service Definitions Reference

## What Are Service Definitions?

Service definitions are YAML files that define the behavior and configuration of Kafka services without requiring code changes. Each YAML file describes:

1. **Service identity** (name, description)
2. **Kafka configuration** (topics, consumer groups)
3. **Processing behavior** (validation rules, routing)
4. **Performance characteristics** (processing times, error rates)
5. **Observability** (metrics, tags)

## Structure

```yaml
name: service-name
type: producer | consumer | consumer-producer
description: What this service does

kafka:
  consumer:
    topics: [list of input topics]
    group_id: consumer-group-name
    fetch_min_bytes: 1024
    fetch_max_wait_ms: 500
  
  producer:
    topics: [list of output topics]

processing:
  validation_rules: [list of rules]
  routing:
    success_topic: topic-name
    failure_topic: topic-name
  processing_time_ms: 50-100
  error_rate_percent: 2

metrics:
  track_latency: true
  track_throughput: true
  custom_tags:
    - key:value
```

## Current Service Definitions

### 1. order-producer.yml
**Type:** Producer  
**Purpose:** Generates simulated order events  
**Produces to:** order-events  

**Key config:**
- Rate: 60 messages/minute
- Burst mode enabled (5x multiplier)
- Multiple locations (US, UK, France, Japan, Australia)

### 2. order-validator.yml
**Type:** Consumer-Producer  
**Purpose:** Validates order structure and data  
**Consumes from:** order-events  
**Produces to:** validated-orders (success), invalid-orders (failure)  

**Key config:**
- Processing: 50-100ms
- Error rate: 2%
- Tags: service_type:validation

### 3. inventory-service.yml
**Type:** Consumer-Producer  
**Purpose:** Checks and reserves inventory  
**Consumes from:** validated-orders  
**Produces to:** inventory-reserved (success), inventory-unavailable (failure)  

**Key config:**
- Processing: 100-200ms
- Error rate: 5%
- Tags: service_type:inventory

### 4. payment-processor.yml
**Type:** Consumer-Producer  
**Purpose:** Authorizes and captures payments  
**Consumes from:** inventory-reserved  
**Produces to:** payment-confirmed (success), payment-failed (failure)  

**Key config:**
- Processing: 200-500ms (slower, realistic for payment APIs)
- Error rate: 3%
- Tags: service_type:payment, pci_compliant:true

### 5. fraud-detector.yml
**Type:** Consumer-Producer  
**Purpose:** Analyzes orders for fraud (runs in parallel)  
**Consumes from:** order-events, payment-confirmed  
**Produces to:** fraud-alerts (fraud detected), order-events-analyzed (clean)  

**Key config:**
- Processing: 50-150ms (needs to be fast)
- Error rate: 1%
- Tags: service_type:security, ml_enabled:true
- Fraud threshold: 0.75

### 6. fulfillment-service.yml
**Type:** Consumer-Producer  
**Purpose:** Creates shipments and coordinates fulfillment  
**Consumes from:** payment-confirmed  
**Produces to:** order-fulfilled, shipment-created, warehouse-assigned  

**Key config:**
- Processing: 150-300ms
- Error rate: 4%
- Tags: service_type:fulfillment

### 7. notification-service.yml
**Type:** Consumer  
**Purpose:** Sends customer notifications (terminal node)  
**Consumes from:** order-fulfilled, shipment-created, payment-failed, inventory-unavailable, fraud-alerts  

**Key config:**
- Processing: 300-800ms (slow, external APIs)
- Error rate: 10% (higher due to external dependencies)
- Tags: service_type:notification
- Retry policy: 3 attempts, 1s backoff

### 8. analytics-aggregator.yml
**Type:** Consumer  
**Purpose:** Aggregates data for analytics and reporting (terminal node)  
**Consumes from:** order-events, order-fulfilled, payment-confirmed, fraud-alerts  

**Key config:**
- Processing: 500-1000ms (batch processing)
- Error rate: 1%
- Batch size: 100
- Tags: service_type:analytics, consumer_only:true

## How to Use

### Current Implementation (Docker Compose)

Service definitions are **currently documentation only**. The actual configuration is done via environment variables in `docker-compose.yml`:

```yaml
order-validator:
  image: kafka-consumer:latest
  environment:
    - DD_SERVICE_NAME=order-validator
    - TOPICS_IN=order-events
    - TOPICS_OUT=validated-orders,invalid-orders
    - CONSUMER_GROUP=order-validator-group
    - PROCESSING_TIME_MS_MIN=50
    - PROCESSING_TIME_MS_MAX=100
    - ERROR_RATE_PERCENT=2
```

### Future Implementation

To make service definitions **active configuration**, implement a YAML loader:

```java
@Configuration
public class ServiceDefinitionLoader {
    @Bean
    public ServiceDefinition loadDefinition() {
        String definitionPath = System.getenv("SERVICE_DEFINITION_PATH");
        return YamlParser.parse(definitionPath);
    }
}
```

This would allow:
```yaml
# docker-compose.yml
order-validator:
  image: kafka-consumer:latest
  environment:
    - SERVICE_DEFINITION_PATH=/config/order-validator.yml
  volumes:
    - ./service-definitions/order-validator.yml:/config/order-validator.yml
```

## Adding a New Service

1. **Create YAML definition**
   ```bash
   cp service-definitions/order-validator.yml service-definitions/new-service.yml
   ```

2. **Edit configuration**
   - Change name, topics, processing rules

3. **Add to docker-compose.yml**
   ```yaml
   new-service:
     image: kafka-consumer:latest
     environment:
       - DD_SERVICE_NAME=new-service
       - TOPICS_IN=input-topic
       - TOPICS_OUT=output-topic
       # ... other config from YAML
   ```

4. **Start the service**
   ```bash
   docker compose up -d new-service
   ```

## Validation Rules

Examples of validation rules in service definitions:

**order-validator:**
- check_customer_exists
- validate_order_items
- check_inventory_availability
- validate_shipping_address

**inventory-service:**
- check_stock_levels
- reserve_inventory
- update_inventory_cache

**payment-processor:**
- validate_payment_method
- authorize_payment
- capture_payment
- update_order_status

**fraud-detector:**
- check_velocity_rules
- analyze_customer_patterns
- check_billing_shipping_mismatch
- validate_device_fingerprint
- check_blacklist

These rules are **currently simulated** by the processing time delays. To implement actual validation logic, update the Java consumer code.

## Performance Characteristics

Processing times and error rates in service definitions help simulate realistic behavior:

| Service | Processing Time | Error Rate | Reason |
|---------|-----------------|------------|--------|
| order-validator | 50-100ms | 2% | Fast validation logic |
| inventory-service | 100-200ms | 5% | Database lookups |
| payment-processor | 200-500ms | 3% | External API calls |
| fraud-detector | 50-150ms | 1% | ML model inference, needs speed |
| fulfillment-service | 150-300ms | 4% | Multiple system interactions |
| notification-service | 300-800ms | 10% | External email/SMS APIs |
| analytics-aggregator | 500-1000ms | 1% | Batch processing |

## Tags for Observability

Service definitions include custom tags for Datadog:

**Service type tags:**
- `service_type:validation`
- `service_type:inventory`
- `service_type:payment`
- `service_type:security`
- `service_type:fulfillment`
- `service_type:notification`
- `service_type:analytics`

**Pipeline stage tags:**
- `pipeline_stage:order_validation`
- `pipeline_stage:inventory_reservation`
- `pipeline_stage:payment_processing`
- `pipeline_stage:fraud_detection`
- `pipeline_stage:order_fulfillment`
- `pipeline_stage:customer_communication`
- `pipeline_stage:data_aggregation`

**Special tags:**
- `pci_compliant:true` (payment-processor)
- `ml_enabled:true` (fraud-detector)
- `consumer_only:true` (terminal nodes)

These tags help filter and group services in Datadog dashboards and DSM views.

## Future Enhancements

Potential additions to service definitions:

1. **Schema references**
   ```yaml
   schema:
     input: order_event.proto
     output: payment_event.proto
   ```

2. **Transformation rules**
   ```yaml
   transformations:
     - extract_customer_id
     - calculate_tax
     - apply_discounts
   ```

3. **Error handling**
   ```yaml
   error_handling:
     retry_policy:
       max_attempts: 3
       backoff_ms: [1000, 2000, 4000]
     dead_letter_topic: dlq-order-validator
   ```

4. **Rate limiting**
   ```yaml
   rate_limiting:
     max_messages_per_second: 1000
     burst_size: 100
   ```

5. **Health checks**
   ```yaml
   health:
     endpoint: /health
     interval_seconds: 30
   ```
