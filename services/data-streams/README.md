# Storedog order pipeline

The order pipeline turns completed Storedog orders into a chain of Kafka events. It runs entirely in Docker Compose next to the rest of Storedog. Every service reports traces, logs, and Data Streams Monitoring (DSM) metrics to the `dd-agent` container.

## How an order flows

1. A customer completes checkout in `store-backend`.
1. The backend queues an `OrderWebhookJob` in Sidekiq.
1. `store-worker` runs the job and sends the order to `store-order-webhook-bridge` over HTTP.
1. The bridge converts the JSON payload to a protobuf `OrderEvent` and publishes it to the `order-events` topic.
1. The Kafka consumers pass the event along the pipeline:

    | Service | Reads | Writes |
    |---------|-------|--------|
    | `store-order-validator` | `order-events` | `validated-orders`, `invalid-orders` |
    | `store-inventory-service` | `validated-orders` | `inventory-reserved`, `inventory-unavailable` |
    | `store-payment-processor` | `inventory-reserved` | `payment-confirmed`, `payment-failed` |
    | `store-fraud-detector` | `order-events`, `payment-confirmed` | `fraud-alerts`, `order-events-analyzed` |
    | `store-fulfillment-service` | `payment-confirmed` | `order-fulfilled`, `shipment-created`, `warehouse-assigned` |
    | `store-notification-service` | `order-fulfilled`, `shipment-created`, `payment-failed`, `inventory-unavailable`, `fraud-alerts` | none |
    | `store-analytics-aggregator` | `order-events`, `order-fulfilled`, `payment-confirmed`, `fraud-alerts` | none |

`store-order-producer` also publishes synthetic orders to `order-events` (60 per minute by default), so the pipeline stays busy without real checkouts.

See [PIPELINE_DIAGRAM.md](./PIPELINE_DIAGRAM.md) for a diagram and [SERVICE_DEFINITIONS.md](./SERVICE_DEFINITIONS.md) for the per-service settings.

## Services

| Directory | Compose service | Purpose |
|-----------|-----------------|---------|
| `kafka-producer/` | `order-producer` | Publishes synthetic orders |
| `order-webhook-bridge/` | `order-webhook-bridge` | Receives Storedog order webhooks and publishes them to Kafka |
| `kafka-consumer/` | `order-validator`, `inventory-service`, `payment-processor`, `fraud-detector`, `fulfillment-service`, `notification-service`, `analytics-aggregator` | One JAR, configured per stage with environment variables |

The pricing service lives in [`services/pricing`](../pricing/) and is called by the backend for cart and product pricing.

## Run it

Start everything from the repository root:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

The `docker-compose.yml` file runs the same services from published images.

## Consumer configuration

All consumers share one image. These environment variables select the behavior:

| Variable | Purpose |
|----------|---------|
| `TOPICS_IN` | Comma-separated topics to read |
| `TOPICS_OUT` | Comma-separated topics to forward each event to |
| `CONSUMER_GROUP` | Kafka consumer group |
| `PROCESSING_TIME_MS_MIN`, `PROCESSING_TIME_MS_MAX` | Simulated processing time range |
| `ERROR_RATE_PERCENT` | Percent of events that log a simulated error and stop (default `0`) |
| `VALIDATION_MODE` | Stage-specific validation: `shipping-country`, `payment-amount`, or `none` |
| `MAX_PAYMENT_AMOUNT_CENTS` | Limit used by the `payment-amount` validation |

## Tracing

Each Java service starts with the Datadog Java tracer (`-javaagent:/app/dd-java-agent.jar`). The Docker build downloads the latest tracer from `https://dtdg.co/latest-java-tracer`, the same way `services/ads/java` does. Set these variables on every service:

- `DD_AGENT_HOST=dd-agent`
- `DD_SERVICE`, `DD_ENV`, `DD_VERSION`
- `DD_DATA_STREAMS_ENABLED=true`

The backend and worker propagate trace context through Sidekiq, so one trace covers checkout, the webhook call, the Kafka hop, and the consumers.
